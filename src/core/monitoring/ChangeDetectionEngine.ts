import { IPropertySnapshot, IChangeEvent, ChangeType, AlertSeverity } from './MonitoringTypes';
import { DigitalTwinRegistry } from './DigitalTwinRegistry';

export class ChangeDetectionEngine {
  /**
   * Compares two snapshots deterministically and records detected change events.
   */
  public static compareSnapshots(
    previousSnapshot: IPropertySnapshot,
    newSnapshot: IPropertySnapshot,
    actorName: string = 'DigitalTwinEngine'
  ): IChangeEvent[] {
    const detectedChanges: IChangeEvent[] = [];
    const now = new Date().toISOString();

    const prevZonesMap = new Map(previousSnapshot.roomZones.map((z) => [z.zoneId, z]));
    const newZonesMap = new Map(newSnapshot.roomZones.map((z) => [z.zoneId, z]));

    newZonesMap.forEach((newZone, zoneId) => {
      const prevZone = prevZonesMap.get(zoneId);

      if (!prevZone) {
        // Entire new zone added
        detectedChanges.push(
          this.buildChangeEvent(
            newSnapshot.digitalTwinId,
            previousSnapshot.id,
            newSnapshot.id,
            'LAYOUT_CHANGED',
            zoneId,
            `New zone/room layout "${newZone.zoneName}" added to digital twin.`,
            'MEDIUM',
            now,
            actorName
          )
        );
        return;
      }

      // 1. Check direction or element changes
      if (prevZone.directionAngleDeg !== newZone.directionAngleDeg) {
        detectedChanges.push(
          this.buildChangeEvent(
            newSnapshot.digitalTwinId,
            previousSnapshot.id,
            newSnapshot.id,
            'DIRECTION_CHANGED',
            zoneId,
            `Zone compass alignment changed from ${prevZone.directionAngleDeg}° to ${newZone.directionAngleDeg}°.`,
            'HIGH',
            now,
            actorName
          )
        );
      }

      // 2. Check Objects Differences
      const prevObjMap = new Map(prevZone.placedObjects.map((o) => [o.objectId, o]));
      const newObjMap = new Map(newZone.placedObjects.map((o) => [o.objectId, o]));

      // Check Added or Relocated
      newObjMap.forEach((newObj, objId) => {
        const prevObj = prevObjMap.get(objId);
        if (!prevObj) {
          // Object added
          let severity: AlertSeverity = 'LOW';
          if (newObj.category.includes('CONFLICT') || newObj.category.includes('WATER_ELEMENT_CONFLICT')) {
            severity = 'HIGH';
          }
          detectedChanges.push(
            this.buildChangeEvent(
              newSnapshot.digitalTwinId,
              previousSnapshot.id,
              newSnapshot.id,
              'OBJECT_ADDED',
              zoneId,
              `New object "${newObj.objectName}" [${newObj.category}] added in zone ${newZone.zoneName}.`,
              severity,
              now,
              actorName
            )
          );
        } else {
          // Check if coordinates changed
          if (prevObj.coordinateX !== newObj.coordinateX || prevObj.coordinateY !== newObj.coordinateY) {
            detectedChanges.push(
              this.buildChangeEvent(
                newSnapshot.digitalTwinId,
                previousSnapshot.id,
                newSnapshot.id,
                'OBJECT_RELOCATED',
                zoneId,
                `Object "${newObj.objectName}" relocated from (${prevObj.coordinateX}, ${prevObj.coordinateY}) to (${newObj.coordinateX}, ${newObj.coordinateY}).`,
                'MEDIUM',
                now,
                actorName
              )
            );
          }
        }
      });

      // Check Removed
      prevObjMap.forEach((prevObj, objId) => {
        if (!newObjMap.has(objId)) {
          detectedChanges.push(
            this.buildChangeEvent(
              newSnapshot.digitalTwinId,
              previousSnapshot.id,
              newSnapshot.id,
              'OBJECT_REMOVED',
              zoneId,
              `Object "${prevObj.objectName}" removed from zone ${prevZone.zoneName}.`,
              'MEDIUM',
              now,
              actorName
            )
          );
        }
      });

      // 3. Sensor Thresholds / Measurement changes
      const prevSensMap = new Map(prevZone.sensorReadings.map((s) => [s.sensorId, s]));
      newZone.sensorReadings.forEach((newSens) => {
        const prevSens = prevSensMap.get(newSens.sensorId);
        if (prevSens && Math.abs(prevSens.value - newSens.value) > 10) {
          detectedChanges.push(
            this.buildChangeEvent(
              newSnapshot.digitalTwinId,
              previousSnapshot.id,
              newSnapshot.id,
              'MEASUREMENT_CHANGED',
              zoneId,
              `Sensor ${newSens.sensorType} reading shifted significantly from ${prevSens.value} ${prevSens.unit} to ${newSens.value} ${newSens.unit}.`,
              'MEDIUM',
              now,
              actorName
            )
          );
        }
      });
    });

    // Save changes into registry
    detectedChanges.forEach((chg) => DigitalTwinRegistry.addChangeEvent(chg));

    return detectedChanges;
  }

  private static buildChangeEvent(
    digitalTwinId: string,
    previousSnapshotId: string,
    newSnapshotId: string,
    changeType: ChangeType,
    zoneId: string,
    description: string,
    severity: AlertSeverity,
    detectedAt: string,
    detectedBy: string
  ): IChangeEvent {
    return {
      id: `CHG-${Math.floor(Math.random() * 90000) + 10000}`,
      version: '1.0.0',
      status: 'DETECTED',
      owner: 'ChangeDetectionEngine',
      createdBy: detectedBy,
      updatedBy: detectedBy,
      createdAt: detectedAt,
      updatedAt: detectedAt,
      digitalTwinId,
      previousSnapshotId,
      newSnapshotId,
      changeType,
      zoneId,
      description,
      detectedAt,
      detectedBy,
      severity,
      isResolved: false
    };
  }
}
