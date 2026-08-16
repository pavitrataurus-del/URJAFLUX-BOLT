// Module 14: Security, Tenant Isolation & Compliance Governance Service
import { 
  TwinPermissionPolicy, 
  ComplianceAuditLog 
} from "../../types/digitalTwin";

export class TwinSecurityService {
  private static instance: TwinSecurityService;

  private constructor() {}

  public static getInstance(): TwinSecurityService {
    if (!TwinSecurityService.instance) {
      TwinSecurityService.instance = new TwinSecurityService();
    }
    return TwinSecurityService.instance;
  }

  public getRolePermissions(role: "SUPER_ADMIN" | "FACILITY_MANAGER" | "VASTU_CONSULTANT" | "TENANT_VIEWER"): TwinPermissionPolicy {
    switch (role) {
      case "SUPER_ADMIN":
        return { role, canRead: true, canEditGeometry: true, canEditProperties: true, canRunSimulations: true, canControlIoT: true };
      case "FACILITY_MANAGER":
        return { role, canRead: true, canEditGeometry: false, canEditProperties: true, canRunSimulations: true, canControlIoT: true };
      case "VASTU_CONSULTANT":
        return { role, canRead: true, canEditGeometry: true, canEditProperties: true, canRunSimulations: true, canControlIoT: false };
      case "TENANT_VIEWER":
      default:
        return { role, canRead: true, canEditGeometry: false, canEditProperties: false, canRunSimulations: false, canControlIoT: false };
    }
  }

  public getComplianceLogs(): ComplianceAuditLog[] {
    const now = new Date().toISOString();
    return [
      {
        id: "CMP-LOG-001",
        timestamp: "2026-07-27T08:00:00.000Z",
        tenantId: "TENANT-HQ-MAIN",
        actor: "chief.architect@urjaflux.com",
        action: "DIGITAL_TWIN_SCHEMA_VALIDATE",
        resourceTwinId: "TWIN-BLD-001",
        complianceFramework: "ISO_19650_BIM",
        status: "COMPLIANT",
        hashSignature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      {
        id: "CMP-LOG-002",
        timestamp: now,
        tenantId: "TENANT-HQ-MAIN",
        actor: "system.iot@urjaflux.com",
        action: "IOT_TELEMETRY_ENCRYPTION_VERIFY",
        resourceTwinId: "TWIN-EQP-AHU1",
        complianceFramework: "SOC2_TYPE2",
        status: "COMPLIANT",
        hashSignature: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
      }
    ];
  }
}

export const twinSecurityService = TwinSecurityService.getInstance();
