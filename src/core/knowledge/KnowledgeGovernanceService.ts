// Module 7: Knowledge Governance, Compliance & Audit Trail Engine
import { GovernanceAuditLog, AccessLevel } from "../../types/knowledgeIntelligence";

class KnowledgeGovernanceServiceStore {
  private auditLogs: GovernanceAuditLog[] = [];

  constructor() {
    this.seedInitialAuditLogs();
  }

  private seedInitialAuditLogs(): void {
    const now = new Date().toISOString();
    this.auditLogs.push(
      {
        id: "AUD-1001",
        tenantId: "global_tenant",
        userId: "USR-SYSTEM",
        userRole: "SYSTEM_ADMIN",
        action: "INGEST",
        resourceType: "DOCUMENT",
        resourceId: "KDOC-1001",
        details: "Ingested Mayamatam Classical Treatise",
        piiMasked: true,
        timestamp: now
      },
      {
        id: "AUD-1002",
        tenantId: "global_tenant",
        userId: "USR-SYSTEM",
        userRole: "SYSTEM_ADMIN",
        action: "INGEST",
        resourceType: "DOCUMENT",
        resourceId: "KDOC-1002",
        details: "Ingested Samarangana Sutradhara Manual",
        piiMasked: true,
        timestamp: now
      }
    );
  }

  public logAction(
    tenantId: string,
    userId: string,
    userRole: string,
    action: GovernanceAuditLog["action"],
    resourceType: GovernanceAuditLog["resourceType"],
    resourceId: string,
    details: string,
    piiMasked: boolean = true
  ): GovernanceAuditLog {
    const entry: GovernanceAuditLog = {
      id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      tenantId,
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      details,
      piiMasked,
      timestamp: new Date().toISOString()
    };

    this.auditLogs.unshift(entry);
    return entry;
  }

  public getAuditLogs(tenantId: string): GovernanceAuditLog[] {
    return this.auditLogs.filter(
      log => log.tenantId === tenantId || log.tenantId === "global_tenant"
    );
  }

  public checkAccessPermission(
    userAccessLevel: AccessLevel,
    resourceAccessLevel: AccessLevel
  ): boolean {
    const levels: Record<AccessLevel, number> = {
      PUBLIC: 1,
      INTERNAL: 2,
      CONFIDENTIAL: 3,
      RESTRICTED: 4
    };

    return levels[userAccessLevel] >= levels[resourceAccessLevel];
  }
}

export const KnowledgeGovernanceService = new KnowledgeGovernanceServiceStore();
