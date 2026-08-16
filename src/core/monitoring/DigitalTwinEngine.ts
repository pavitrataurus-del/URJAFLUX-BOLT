import {
  IDigitalTwin,
  IPropertySnapshot,
  IDigitalTwinRoomZone
} from './MonitoringTypes';
import { DigitalTwinRegistry } from './DigitalTwinRegistry';

export class DigitalTwinEngine {
  /**
   * Retrieves all registered Digital Twins.
   */
  public static getAllTwins(): IDigitalTwin[] {
    return DigitalTwinRegistry.getAllDigitalTwins();
  }

  /**
   * Retrieves a specific Digital Twin by ID.
   */
  public static getTwinById(id: string): IDigitalTwin | undefined {
    return DigitalTwinRegistry.getDigitalTwinById(id);
  }

  /**
   * Creates a new property snapshot (versioning).
   */
  public static createSnapshot(
    digitalTwinId: string,
    snapshotLabel: string,
    updatedZones: IDigitalTwinRoomZone[],
    floorPlanVersion: string,
    actorName: string
  ): IPropertySnapshot | null {
    const twin = DigitalTwinRegistry.getDigitalTwinById(digitalTwinId);
    if (!twin) return null;

    const nextSnapshotNumber = twin.snapshotsHistory.length + 1;
    const now = new Date().toISOString();

    // Calculate baseline metrics deterministically
    let totalRemedies = 0;
    updatedZones.forEach((z) => {
      totalRemedies += z.installedRemedies.length;
    });

    const newSnapshot: IPropertySnapshot = {
      id: `SNAP-${String(nextSnapshotNumber).padStart(3, '0')}-${Math.floor(Math.random() * 1000)}`,
      version: `${nextSnapshotNumber}.0.0`,
      status: 'ACTIVE',
      owner: twin.owner,
      createdBy: actorName,
      updatedBy: actorName,
      createdAt: now,
      updatedAt: now,
      digitalTwinId: twin.id,
      snapshotNumber: nextSnapshotNumber,
      snapshotLabel: snapshotLabel,
      floorPlanVersion: floorPlanVersion,
      roomZones: updatedZones,
      overallHealthScore: twin.overallHealthScore,
      complianceRating: twin.complianceScore,
      totalRemediesInstalled: totalRemedies,
      capturedEvidenceIds: [],
      inspectionRecordIds: []
    };

    // Mark previous snapshots as historical
    twin.snapshotsHistory.forEach((s) => (s.status = 'HISTORICAL'));

    DigitalTwinRegistry.addSnapshot(digitalTwinId, newSnapshot);

    // Register Timeline event
    DigitalTwinRegistry.addTimelineEvent({
      eventId: `TL-${Date.now()}`,
      digitalTwinId: twin.id,
      projectId: twin.relatedProjectId,
      eventType: 'CHANGE',
      title: `Property Snapshot v${nextSnapshotNumber} Created`,
      description: `New snapshot "${snapshotLabel}" added by ${actorName}.`,
      timestamp: now,
      actor: actorName,
      actorRole: 'FIELD_ENGINEER'
    });

    return newSnapshot;
  }
}
