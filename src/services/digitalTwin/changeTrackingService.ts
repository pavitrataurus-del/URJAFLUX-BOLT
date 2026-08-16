// Module 3: Change Tracking, Time Travel, Snapshot Restore & Audit Engine
import { 
  TwinAuditEntry, 
  TwinSnapshot, 
  AuditChangeDiff, 
  AnyDigitalTwin,
  TwinCategory 
} from "../../types/digitalTwin";
import { digitalTwinCore } from "./digitalTwinCore";

export class ChangeTrackingService {
  private static instance: ChangeTrackingService;
  private auditEntries: TwinAuditEntry[] = [];
  private snapshots: Map<string, TwinSnapshot> = new Map();

  private constructor() {
    this.seedCanonicalAuditLog();
  }

  public static getInstance(): ChangeTrackingService {
    if (!ChangeTrackingService.instance) {
      ChangeTrackingService.instance = new ChangeTrackingService();
    }
    return ChangeTrackingService.instance;
  }

  private seedCanonicalAuditLog(): void {
    const now = new Date().toISOString();
    this.auditEntries = [
      {
        id: "AUD-001",
        twinId: "TWIN-BLD-001",
        twinCategory: "BUILDING",
        changeType: "CREATE",
        diffs: [{ fieldPath: "status", oldValue: null, newValue: "OPERATIONAL" }],
        authorUser: "admin@urjaflux.com",
        authorRole: "SUPER_ADMIN",
        sourceSystem: "BIM_IMPORT",
        timestamp: "2024-01-15T10:00:00.000Z",
        versionToken: "v1.0.0",
        reason: "Initial IFC As-Built Baseline Import"
      },
      {
        id: "AUD-002",
        twinId: "TWIN-RM-101",
        twinCategory: "ROOM",
        changeType: "UPDATE",
        diffs: [
          { fieldPath: "useCategory", oldValue: "MEETING", newValue: "EXECUTIVE" },
          { fieldPath: "vastuComplianceScore", oldValue: 85, newValue: 98 }
        ],
        authorUser: "vastu.consultant@urjaflux.com",
        authorRole: "CONSULTANT",
        sourceSystem: "USER_INTERFACE",
        timestamp: "2026-06-20T14:30:00.000Z",
        versionToken: "v2.0.1",
        reason: "Vastu Ishan corner realignment & room usage optimization"
      },
      {
        id: "AUD-003",
        twinId: "TWIN-EQP-AHU1",
        twinCategory: "EQUIPMENT",
        changeType: "UPDATE",
        diffs: [
          { fieldPath: "operatingHours", oldValue: 6000, newValue: 6420 },
          { fieldPath: "status", oldValue: "MAINTENANCE", newValue: "OPERATIONAL" }
        ],
        authorUser: "system.iot@urjaflux.com",
        authorRole: "FACILITY_MANAGER",
        sourceSystem: "IOT_TELEMETRY",
        timestamp: now,
        versionToken: "v2.1.0",
        reason: "Automated telemetry sync after scheduled AHU filter replacement"
      }
    ];

    // Seed baseline snapshot
    const baselineTwins: Record<string, AnyDigitalTwin> = {};
    digitalTwinCore.getAllTwins().forEach(t => {
      baselineTwins[t.id] = JSON.parse(JSON.stringify(t));
    });

    this.snapshots.set("SNAP-BASELINE-2026", {
      snapshotId: "SNAP-BASELINE-2026",
      title: "Mid-Year 2026 Operational Baseline Snapshot",
      timestamp: "2026-07-01T00:00:00.000Z",
      createdBy: "chief.architect@urjaflux.com",
      twinCount: Object.keys(baselineTwins).length,
      twins: baselineTwins,
      systemVersion: "URJAFLUX-TWIN-v2.1"
    });
  }

  public logChange(
    twinId: string, 
    twinCategory: TwinCategory, 
    changeType: "CREATE" | "UPDATE" | "DELETE" | "SIMULATION_APPLY" | "RESTORE",
    diffs: AuditChangeDiff[],
    authorUser: string,
    authorRole: string,
    sourceSystem: "CAD_ENGINE" | "IOT_TELEMETRY" | "USER_INTERFACE" | "AI_RECOMMENDATION" | "BIM_IMPORT",
    reason: string
  ): TwinAuditEntry {
    const entry: TwinAuditEntry = {
      id: `AUD-${Date.now()}`,
      twinId,
      twinCategory,
      changeType,
      diffs,
      authorUser,
      authorRole,
      sourceSystem,
      timestamp: new Date().toISOString(),
      versionToken: `v${Date.now().toString().slice(-4)}`,
      reason
    };
    this.auditEntries.unshift(entry);
    return entry;
  }

  public getAuditEntries(twinId?: string): TwinAuditEntry[] {
    if (twinId) {
      return this.auditEntries.filter(e => e.twinId === twinId);
    }
    return this.auditEntries;
  }

  public createSnapshot(title: string, createdBy: string): TwinSnapshot {
    const twinsMap: Record<string, AnyDigitalTwin> = {};
    digitalTwinCore.getAllTwins().forEach(t => {
      twinsMap[t.id] = JSON.parse(JSON.stringify(t));
    });

    const snapshot: TwinSnapshot = {
      snapshotId: `SNAP-${Date.now()}`,
      title,
      timestamp: new Date().toISOString(),
      createdBy,
      twinCount: Object.keys(twinsMap).length,
      twins: twinsMap,
      systemVersion: "URJAFLUX-TWIN-v2.1"
    };

    this.snapshots.set(snapshot.snapshotId, snapshot);
    return snapshot;
  }

  public getSnapshots(): TwinSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  public restoreSnapshot(snapshotId: string, restoringUser: string): boolean {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) return false;

    Object.values(snapshot.twins).forEach(twin => {
      digitalTwinCore.registerOrUpdateTwin(twin);
    });

    this.logChange(
      "GLOBAL_BUILDING",
      "BUILDING",
      "RESTORE",
      [{ fieldPath: "snapshotRestore", oldValue: "current", newValue: snapshotId }],
      restoringUser,
      "SUPER_ADMIN",
      "USER_INTERFACE",
      `Restored digital twin state to historical snapshot: ${snapshot.title}`
    );

    return true;
  }
}

export const changeTrackingService = ChangeTrackingService.getInstance();
