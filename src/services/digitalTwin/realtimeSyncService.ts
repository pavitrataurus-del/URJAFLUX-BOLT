// Module 5: Real-Time Synchronization, Conflict Detection, Merging & Optimistic Locking Engine
import { 
  SyncConflict, 
  ConflictResolutionStrategy, 
  OptimisticLockToken, 
  TwinBranch,
  AnyDigitalTwin 
} from "../../types/digitalTwin";
import { digitalTwinCore } from "./digitalTwinCore";
import { changeTrackingService } from "./changeTrackingService";

export class RealtimeSyncService {
  private static instance: RealtimeSyncService;
  private activeConflicts: SyncConflict[] = [];
  private branches: Map<string, TwinBranch> = new Map();
  private lockTokens: Map<string, OptimisticLockToken> = new Map();

  private constructor() {
    this.seedBranchesAndConflicts();
  }

  public static getInstance(): RealtimeSyncService {
    if (!RealtimeSyncService.instance) {
      RealtimeSyncService.instance = new RealtimeSyncService();
    }
    return RealtimeSyncService.instance;
  }

  private seedBranchesAndConflicts(): void {
    const now = new Date().toISOString();

    // Seed Main Branch & Staging Branch
    this.branches.set("main", {
      branchId: "main",
      branchName: "Main Production Digital Twin",
      baseSnapshotId: "SNAP-BASELINE-2026",
      createdAt: "2026-07-01T00:00:00Z",
      stagedChangesCount: 0
    });

    this.branches.set("branch-post-covid-layout", {
      branchId: "branch-post-covid-layout",
      branchName: "Staging: Post-COVID Hybrid Workspace Layout",
      baseSnapshotId: "SNAP-BASELINE-2026",
      createdAt: now,
      stagedChangesCount: 3
    });

    // Seed lock token for AHU equipment
    this.lockTokens.set("TWIN-EQP-AHU1", {
      twinId: "TWIN-EQP-AHU1",
      version: 5,
      eTag: 'W/"eTag-ahu1-v5"'
    });
  }

  public getLockToken(twinId: string): OptimisticLockToken {
    if (!this.lockTokens.has(twinId)) {
      this.lockTokens.set(twinId, {
        twinId,
        version: 1,
        eTag: `W/"eTag-${twinId}-v1"`
      });
    }
    return this.lockTokens.get(twinId)!;
  }

  /**
   * Optimistic Locking Update Check
   */
  public updateTwinWithOptimisticLock(
    twin: AnyDigitalTwin, 
    clientETag: string,
    authorUser: string
  ): { success: boolean; conflict?: SyncConflict } {
    const currentLock = this.getLockToken(twin.id);

    if (currentLock.eTag !== clientETag) {
      // Conflict Detected!
      const existing = digitalTwinCore.getTwinById(twin.id);
      const conflict: SyncConflict = {
        id: `CONF-${Date.now()}`,
        twinId: twin.id,
        fieldName: "status",
        clientValue: (twin as any).status,
        serverValue: existing ? (existing as any).status : null,
        detectedAt: new Date().toISOString(),
        status: "OPEN"
      };
      this.activeConflicts.unshift(conflict);
      return { success: false, conflict };
    }

    // Success -> Increment lock version
    const newVersion = currentLock.version + 1;
    const newETag = `W/"eTag-${twin.id}-v${newVersion}"`;
    this.lockTokens.set(twin.id, {
      twinId: twin.id,
      version: newVersion,
      eTag: newETag
    });

    digitalTwinCore.registerOrUpdateTwin(twin);

    changeTrackingService.logChange(
      twin.id,
      twin.category,
      "UPDATE",
      [{ fieldPath: "optimisticLockSync", oldValue: currentLock.eTag, newValue: newETag }],
      authorUser,
      "FACILITY_MANAGER",
      "USER_INTERFACE",
      "Optimistic Locking state mutation verified"
    );

    return { success: true };
  }

  public resolveConflict(
    conflictId: string, 
    strategy: ConflictResolutionStrategy, 
    manualValue?: any
  ): boolean {
    const conflict = this.activeConflicts.find(c => c.id === conflictId);
    if (!conflict) return false;

    let finalVal = conflict.serverValue;
    if (strategy === "LAST_WRITE_WINS") {
      finalVal = conflict.clientValue;
    } else if (strategy === "MANUAL_OVERRIDE") {
      finalVal = manualValue;
    }

    conflict.status = "RESOLVED";
    conflict.resolvedValue = finalVal;

    // Apply to twin
    const twin = digitalTwinCore.getTwinById(conflict.twinId);
    if (twin) {
      (twin as any)[conflict.fieldName] = finalVal;
      digitalTwinCore.registerOrUpdateTwin(twin);
    }

    return true;
  }

  public getOpenConflicts(): SyncConflict[] {
    return this.activeConflicts.filter(c => c.status === "OPEN");
  }

  public getBranches(): TwinBranch[] {
    return Array.from(this.branches.values());
  }
}

export const realtimeSyncService = RealtimeSyncService.getInstance();
