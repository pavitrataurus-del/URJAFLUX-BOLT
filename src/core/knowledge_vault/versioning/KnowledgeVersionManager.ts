// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE VERSION MANAGER (PHASE 2)
// Immutability, Versioning, Deprecation, & Audit History Engine
// ============================================================================

import { 
  IVaultKnowledgeRecord, 
  IVaultVersionInfo, 
  IAuditTrailEntry, 
  VaultApprovalStatus 
} from "../types/vaultRecord.types";

export class KnowledgeVersionManager {
  private static instance: KnowledgeVersionManager;

  private constructor() {}

  public static getInstance(): KnowledgeVersionManager {
    if (!KnowledgeVersionManager.instance) {
      KnowledgeVersionManager.instance = new KnowledgeVersionManager();
    }
    return KnowledgeVersionManager.instance;
  }

  /**
   * Initializes initial version info for a new record
   */
  public createInitialVersion(replacesRecordId?: string): IVaultVersionInfo {
    const timestamp = new Date().toISOString();
    return {
      version: "1.0.0",
      createdAt: timestamp,
      replacesRecordId,
      isDeprecated: false,
      versionHistory: [
        {
          version: "1.0.0",
          timestamp,
          changedBy: "Founder Approval Gate",
          summary: replacesRecordId 
            ? `Initial version created, replacing ${replacesRecordId}`
            : "Initial canonical version created"
        }
      ]
    };
  }

  /**
   * Creates an updated version of a record (e.g. 1.0.0 -> 1.1.0)
   */
  public createNewVersion(
    existingRecord: IVaultKnowledgeRecord,
    updatedPayload: Partial<IVaultKnowledgeRecord>,
    changedBy: string,
    changeSummary: string
  ): IVaultKnowledgeRecord {
    const oldVersion = existingRecord.versionInfo.version;
    const parts = oldVersion.split(".").map(n => parseInt(n, 10));
    const newVersionStr = `${parts[0]}.${parts[1] + 1}.0`;
    const timestamp = new Date().toISOString();

    const newVersionInfo: IVaultVersionInfo = {
      ...existingRecord.versionInfo,
      version: newVersionStr,
      versionHistory: [
        ...existingRecord.versionInfo.versionHistory,
        {
          version: newVersionStr,
          timestamp,
          changedBy,
          summary: changeSummary
        }
      ]
    };

    const newAuditEntry: IAuditTrailEntry = {
      auditId: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      action: "VERSION_BUMPED",
      actor: changedBy,
      notes: changeSummary,
      recordHashAtAction: existingRecord.immutableHash
    };

    const updatedRecord: IVaultKnowledgeRecord = {
      ...existingRecord,
      ...updatedPayload,
      versionInfo: newVersionInfo,
      auditHistory: [...existingRecord.auditHistory, newAuditEntry]
    };

    return updatedRecord;
  }

  /**
   * Deprecates an existing Vault Record and optionally points to its replacement
   */
  public deprecateRecord(
    existingRecord: IVaultKnowledgeRecord,
    replacementRecordId?: string,
    reason?: string,
    actor?: string
  ): IVaultKnowledgeRecord {
    const timestamp = new Date().toISOString();
    const actorName = actor || "Founder";

    const updatedVersionInfo: IVaultVersionInfo = {
      ...existingRecord.versionInfo,
      isDeprecated: true,
      deprecationReason: reason || "Deprecated by Founder directive",
      replacementRecordId,
      versionHistory: [
        ...existingRecord.versionInfo.versionHistory,
        {
          version: existingRecord.versionInfo.version,
          timestamp,
          changedBy: actorName,
          summary: `Deprecated record: ${reason || "No reason specified"}`
        }
      ]
    };

    const newAuditEntry: IAuditTrailEntry = {
      auditId: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      action: "RECORD_DEPRECATED",
      actor: actorName,
      notes: `Record deprecated. Replacement ID: ${replacementRecordId || "None"}`,
      recordHashAtAction: existingRecord.immutableHash
    };

    return {
      ...existingRecord,
      approvalStatus: 'DEPRECATED' as VaultApprovalStatus,
      versionInfo: updatedVersionInfo,
      auditHistory: [...existingRecord.auditHistory, newAuditEntry]
    };
  }

  /**
   * Appends an audit trail entry for a record action
   */
  public appendAuditEntry(
    record: IVaultKnowledgeRecord,
    action: string,
    actor: string,
    notes: string
  ): IAuditTrailEntry {
    const entry: IAuditTrailEntry = {
      auditId: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      notes,
      recordHashAtAction: record.immutableHash
    };

    record.auditHistory.push(entry);
    return entry;
  }
}

export const knowledgeVersionManager = KnowledgeVersionManager.getInstance();
