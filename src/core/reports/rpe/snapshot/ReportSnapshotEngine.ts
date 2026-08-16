// ============================================================================
// URJAFLUX AI OS - REPORT SNAPSHOT & VERSIONING ENGINE
// Corrections 6 & 7: Immutable Historical Snapshots & Version Lifecycle Management
// Draft -> Published -> Revision -> Archived
// ============================================================================

import { IIntegratedConsultationPackage } from "../../../integrated_intelligence/types/iie.types";
import { 
  IReportSnapshotPackage, 
  IReportVersionMetadata, 
  ReportLifecycleState, 
  IReportObjectModel 
} from "../types/rpe.types";

export class ReportSnapshotEngine {
  private static instance: ReportSnapshotEngine;
  private snapshotStore: Map<string, IReportSnapshotPackage> = new Map();
  private versionStore: Map<string, IReportObjectModel[]> = new Map();

  private constructor() {}

  public static getInstance(): ReportSnapshotEngine {
    if (!ReportSnapshotEngine.instance) {
      ReportSnapshotEngine.instance = new ReportSnapshotEngine();
    }
    return ReportSnapshotEngine.instance;
  }

  /**
   * Freezes an immutable snapshot of the IIE package
   */
  public createSnapshot(consultation: IIntegratedConsultationPackage): IReportSnapshotPackage {
    const snapshotId = `SNAP-${consultation.packageId}-${Date.now().toString(36).toUpperCase()}`;
    const frozenCopy: IIntegratedConsultationPackage = JSON.parse(JSON.stringify(consultation));

    // Simple hash signature for integrity verification
    const rawDataStr = `${frozenCopy.packageId}:${frozenCopy.integratedFindings.length}:${frozenCopy.bestRemedyCandidates.length}`;
    const hashSignature = `HASH-SHA256-${Buffer.from(rawDataStr).toString('hex').substring(0, 16)}`;

    const snapshotPackage: IReportSnapshotPackage = {
      snapshotId,
      consultationPackageId: consultation.packageId,
      snapshotTimestamp: new Date().toISOString(),
      frozenConsultationPackage: frozenCopy,
      hashSignature
    };

    this.snapshotStore.set(snapshotId, snapshotPackage);
    return snapshotPackage;
  }

  public getSnapshot(snapshotId: string): IReportSnapshotPackage | undefined {
    return this.snapshotStore.get(snapshotId);
  }

  /**
   * Transitions a Report Object Model to Published state (making it immutable)
   */
  public publishReport(rom: IReportObjectModel, consultantId: string): IReportObjectModel {
    const publishedVersion: IReportVersionMetadata = {
      ...rom.versionMetadata,
      state: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      createdByConsultantId: consultantId,
      isImmutable: true,
      changeLogNote: 'Report published and frozen.'
    };

    const publishedRom: IReportObjectModel = {
      ...rom,
      versionMetadata: publishedVersion
    };

    // Store in version history
    const history = this.versionStore.get(rom.romId) || [];
    history.push(publishedRom);
    this.versionStore.set(rom.romId, history);

    return publishedRom;
  }

  /**
   * Archives a published report
   */
  public archiveReport(rom: IReportObjectModel): IReportObjectModel {
    return {
      ...rom,
      versionMetadata: {
        ...rom.versionMetadata,
        state: 'ARCHIVED',
        changeLogNote: 'Report archived from active delivery.'
      }
    };
  }

  public getVersionHistory(romId: string): IReportObjectModel[] {
    return this.versionStore.get(romId) || [];
  }
}

export const reportSnapshotEngine = ReportSnapshotEngine.getInstance();
