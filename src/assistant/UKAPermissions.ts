/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 1 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Foundation & Architecture
 * 
 * UKAPermissions.ts: Declarative Role-Based Access Control (RBAC) & Mode Permission Definitions.
 */

import { UKAConsultationMode, UKAPermissionSet, UKAUserRole } from "./UKATypes";

/**
 * Role Permission Registry Table
 */
const ROLE_PERMISSIONS: Record<UKAUserRole, UKAPermissionSet> = {
  VISITOR: {
    role: "VISITOR",
    canAccessRawRuleTraces: false,
    canAccessFounderDiagnostics: false,
    canModifyRemedies: false,
    canExportDossier: false,
    canViewFullDecisionChains: false,
    canAccessKnowledgeCanons: true,
    canViewPropertyHealthIndex: true,
    canOverrideZoneAssignments: false,
    allowedConsultationModes: ["PROPERTY_CONSULTATION", "KNOWLEDGE_CONSULTATION"]
  },
  PAID_CUSTOMER: {
    role: "PAID_CUSTOMER",
    canAccessRawRuleTraces: false,
    canAccessFounderDiagnostics: false,
    canModifyRemedies: false,
    canExportDossier: true,
    canViewFullDecisionChains: true,
    canAccessKnowledgeCanons: true,
    canViewPropertyHealthIndex: true,
    canOverrideZoneAssignments: false,
    allowedConsultationModes: [
      "PROPERTY_CONSULTATION",
      "KNOWLEDGE_CONSULTATION",
      "DECISION_EXPLANATION"
    ]
  },
  CONSULTANT: {
    role: "CONSULTANT",
    canAccessRawRuleTraces: true,
    canAccessFounderDiagnostics: false,
    canModifyRemedies: true,
    canExportDossier: true,
    canViewFullDecisionChains: true,
    canAccessKnowledgeCanons: true,
    canViewPropertyHealthIndex: true,
    canOverrideZoneAssignments: true,
    allowedConsultationModes: [
      "PROPERTY_CONSULTATION",
      "KNOWLEDGE_CONSULTATION",
      "DECISION_EXPLANATION",
      "CONSULTANT_REVIEW"
    ]
  },
  FOUNDER: {
    role: "FOUNDER",
    canAccessRawRuleTraces: true,
    canAccessFounderDiagnostics: true,
    canModifyRemedies: true,
    canExportDossier: true,
    canViewFullDecisionChains: true,
    canAccessKnowledgeCanons: true,
    canViewPropertyHealthIndex: true,
    canOverrideZoneAssignments: true,
    allowedConsultationModes: [
      "PROPERTY_CONSULTATION",
      "KNOWLEDGE_CONSULTATION",
      "DECISION_EXPLANATION",
      "CONSULTANT_REVIEW",
      "FOUNDER_DIAGNOSTICS"
    ]
  }
};

export class UKAPermissions {
  /**
   * Get permission set for a given role
   */
  public static getPermissionsForRole(role: UKAUserRole): UKAPermissionSet {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VISITOR;
  }

  /**
   * Verify if a specific consultation mode is allowed for a user role
   */
  public static isModeAllowed(role: UKAUserRole, mode: UKAConsultationMode): boolean {
    const permissions = this.getPermissionsForRole(role);
    return permissions.allowedConsultationModes.includes(mode);
  }

  /**
   * Check if user role can perform consultant remedy modifications
   */
  public static canModifyRemedies(role: UKAUserRole): boolean {
    return this.getPermissionsForRole(role).canModifyRemedies;
  }

  /**
   * Check if user role can access founder system diagnostics
   */
  public static canAccessFounderDiagnostics(role: UKAUserRole): boolean {
    return this.getPermissionsForRole(role).canAccessFounderDiagnostics;
  }

  /**
   * Check if user role can view raw rule execution traces
   */
  public static canAccessRawRuleTraces(role: UKAUserRole): boolean {
    return this.getPermissionsForRole(role).canAccessRawRuleTraces;
  }
}
