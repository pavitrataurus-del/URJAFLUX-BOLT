/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 2 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Conversation Intelligence & Intent Resolution
 * 
 * ConversationGuard.ts: Role-Based Access Control (RBAC) & Guard Gatekeeper.
 */

import { UKAUserRole, UKAUserIntent, UKAGuardResult, UKAConsultationMode } from "./UKATypes";
import { UKAPermissions } from "./UKAPermissions";

export class ConversationGuard {
  /**
   * Main Guard Validation Entry Point
   * Evaluates if user role has authority to execute the detected intent and consultation mode.
   */
  public static evaluateAccess(
    role: UKAUserRole,
    intent: UKAUserIntent,
    activeMode: UKAConsultationMode
  ): UKAGuardResult {
    const permissions = UKAPermissions.getPermissionsForRole(role);

    // 1. Verify Mode Access first
    if (!permissions.allowedConsultationModes.includes(activeMode)) {
      return {
        allowed: false,
        reason: `Access Denied: Role '${role}' is not authorized to operate in '${activeMode}' consultation mode.`,
        userRole: role,
        requestedIntent: intent,
        upgradeRequired: true,
        suggestedRole: this.getSuggestedRoleForMode(activeMode)
      };
    }

    // 2. FOUNDER Role: Always Allowed
    if (role === "FOUNDER") {
      return {
        allowed: true,
        reason: "Access Granted: Founder role possesses full system authority across all modules and diagnostics.",
        userRole: role,
        requestedIntent: intent
      };
    }

    // 3. DIAGNOSTIC_QUERY Guard: Reserved for FOUNDER only
    if (intent === "DIAGNOSTIC_QUERY") {
      if (!permissions.canAccessFounderDiagnostics) {
        return {
          allowed: false,
          reason: "Access Denied: System Runtime Diagnostics and Founder Audits require FOUNDER authorization.",
          userRole: role,
          requestedIntent: intent,
          upgradeRequired: true,
          suggestedRole: "FOUNDER"
        };
      }
    }

    // 4. CONSULTANT_QUERY Guard: Reserved for CONSULTANT and FOUNDER
    if (intent === "CONSULTANT_QUERY") {
      if (!permissions.canModifyRemedies) {
        return {
          allowed: false,
          reason: "Access Denied: Consultant multi-floor analysis and remedy modification tools require CONSULTANT authorization.",
          userRole: role,
          requestedIntent: intent,
          upgradeRequired: true,
          suggestedRole: "CONSULTANT"
        };
      }
    }

    // 5. DECISION_QUERY & REPORT_QUERY Guard: Requires PAID_CUSTOMER, CONSULTANT, or FOUNDER
    if (intent === "DECISION_QUERY" || intent === "REPORT_QUERY") {
      if (!permissions.canViewFullDecisionChains && !permissions.canExportDossier) {
        return {
          allowed: false,
          reason: `Access Denied: Explainable 15-stage Decision Chains and Report Dossier exports require a PAID_CUSTOMER subscription or higher.`,
          userRole: role,
          requestedIntent: intent,
          upgradeRequired: true,
          suggestedRole: "PAID_CUSTOMER"
        };
      }
    }

    // 6. Default Allowed for Public / Knowledge Queries
    return {
      allowed: true,
      reason: `Access Granted: Intent '${intent}' authorized for '${role}' user tier.`,
      userRole: role,
      requestedIntent: intent
    };
  }

  /**
   * Helper to compute suggested role upgrade for blocked modes
   */
  private static getSuggestedRoleForMode(mode: UKAConsultationMode): UKAUserRole {
    switch (mode) {
      case "FOUNDER_DIAGNOSTICS":
        return "FOUNDER";
      case "CONSULTANT_REVIEW":
        return "CONSULTANT";
      case "DECISION_EXPLANATION":
        return "PAID_CUSTOMER";
      default:
        return "PAID_CUSTOMER";
    }
  }
}
