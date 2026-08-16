// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENGINE 5: CONSULTANT OVERRIDE MEMORY
// External memory store for expert consultant classification overrides and audit trail
// FOUNDER LOCK: Never change original blueprint understanding. Overrides remain external.
// ============================================================================

import { 
  IConsultantOverrideRecord, 
  IAuditTrailEntry, 
  IConsultantOverrideStore 
} from "../types/bsue_v1_5.types";

export class ConsultantOverrideMemory {
  private static instance: ConsultantOverrideMemory;

  private overrides: Map<string, IConsultantOverrideRecord> = new Map();
  private auditTrail: IAuditTrailEntry[] = [];
  private idCounter = 1;

  private constructor() {}

  public static getInstance(): ConsultantOverrideMemory {
    if (!ConsultantOverrideMemory.instance) {
      ConsultantOverrideMemory.instance = new ConsultantOverrideMemory();
    }
    return ConsultantOverrideMemory.instance;
  }

  /**
   * Register a new consultant classification override
   * FOUNDER LOCK: Original classification is preserved in original understanding.
   */
  public applyOverride(
    roomId: string,
    originalClassification: string,
    consultantClassification: string,
    reason: string,
    user: string = 'Architect_Consultant'
  ): IConsultantOverrideRecord {
    const overrideId = `OVR_${this.idCounter++}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const previousRecord = this.overrides.get(roomId);

    const record: IConsultantOverrideRecord = {
      overrideId,
      roomId,
      originalClassification,
      consultantClassification,
      reason,
      timestamp,
      user
    };

    this.overrides.set(roomId, record);

    // Record Audit Trail
    const auditEntry: IAuditTrailEntry = {
      auditId: `AUD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp,
      user,
      action: previousRecord ? 'UPDATE_OVERRIDE' : 'CREATE_OVERRIDE',
      previousState: previousRecord || { originalClassification },
      newState: record
    };

    this.auditTrail.push(auditEntry);

    return record;
  }

  /**
   * Remove an existing override
   */
  public removeOverride(roomId: string, user: string = 'System_Admin'): boolean {
    const existing = this.overrides.get(roomId);
    if (!existing) return false;

    this.overrides.delete(roomId);

    this.auditTrail.push({
      auditId: `AUD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user,
      action: 'DELETE_OVERRIDE',
      previousState: existing,
      newState: null
    });

    return true;
  }

  public getOverridesForRoom(roomId: string): IConsultantOverrideRecord | undefined {
    return this.overrides.get(roomId);
  }

  public getAllOverrides(): IConsultantOverrideRecord[] {
    return Array.from(this.overrides.values());
  }

  public getAuditTrail(): IAuditTrailEntry[] {
    return [...this.auditTrail];
  }

  public getStoreState(): IConsultantOverrideStore {
    return {
      overrides: this.getAllOverrides(),
      auditTrail: this.getAuditTrail()
    };
  }

  public clearMemory(): void {
    this.overrides.clear();
    this.auditTrail = [];
  }
}

export const consultantOverrideMemory = ConsultantOverrideMemory.getInstance();
