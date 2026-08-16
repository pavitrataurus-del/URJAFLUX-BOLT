/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 3 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Knowledge Planning & Retrieval Architecture
 * 
 * KnowledgePlanner.ts: Deterministic Retrieval Planner.
 * Analyzes routing result and user permissions to assemble a structured UKAKnowledgePlan.
 */

import {
  UKARoutingResult,
  UKAKnowledgePlan,
  UKAKnowledgeRetrievalTarget,
  UKAUserRole
} from "./UKATypes";
import { UKAPermissions } from "./UKAPermissions";

export class KnowledgePlanner {
  /**
   * STRICT PRIORITY ORDER (Per Prompt Policy)
   * Always retrieve in this exact order:
   * 1. Current Property Context
   * 2. Current Evaluation
   * 3. Decision Engine
   * 4. Recognition Engine
   * 5. Property Health
   * 6. Approved Knowledge Framework
   * 7. Consultant Notes (if permitted)
   */
  private static readonly MASTER_PRIORITY_ORDER: UKAKnowledgeRetrievalTarget[] = [
    "CURRENT_PROPERTY_CONTEXT",
    "CURRENT_EVALUATION",
    "DECISION_ENGINE",
    "RECOGNITION_ENGINE",
    "PROPERTY_HEALTH",
    "APPROVED_KNOWLEDGE_FRAMEWORK",
    "CONSULTANT_NOTES"
  ];

  /**
   * Main Entry Point: Prepare a Knowledge Retrieval Plan from a Routing Result
   */
  public static createPlan(routingResult: UKARoutingResult): UKAKnowledgePlan {
    const { intent, guardResult, resolvedTarget, userRole } = routingResult;
    const planId = `PLAN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // If guard access was denied, create a minimal plan focused on membership/access
    if (!guardResult.allowed) {
      return {
        planId,
        intent,
        destination: routingResult.destination,
        requiredRetrievalTargets: ["APPROVED_KNOWLEDGE_FRAMEWORK"],
        priorityOrder: ["APPROVED_KNOWLEDGE_FRAMEWORK"],
        evidenceRequirements: ["Access Denied Notice", "Role Upgrade Path"],
        permittedSources: ["Approved URJAFLUX Knowledge Framework"],
        createdTimestamp: new Date().toISOString()
      };
    }

    // Determine required targets based on Intent & Resolved Target
    const requiredTargets = this.determineRequiredTargets(intent, resolvedTarget.targetType, userRole);

    // Filter master priority order to include only required targets for this plan
    const priorityOrder = this.MASTER_PRIORITY_ORDER.filter((target) =>
      requiredTargets.includes(target)
    );

    // Collect Evidence Requirements
    const evidenceRequirements = this.determineEvidenceRequirements(intent, resolvedTarget);

    // Collect Permitted Sources
    const permittedSources = this.determinePermittedSources(userRole, requiredTargets);

    return {
      planId,
      intent,
      destination: routingResult.destination,
      requiredRetrievalTargets: requiredTargets,
      priorityOrder,
      targetFindingId: resolvedTarget.matchedFindingId,
      targetEntityId: resolvedTarget.entityId,
      evidenceRequirements,
      permittedSources,
      createdTimestamp: new Date().toISOString()
    };
  }

  /**
   * Determine required retrieval targets for a given intent and user role
   */
  private static determineRequiredTargets(
    intent: string,
    targetType: string,
    role: UKAUserRole
  ): UKAKnowledgeRetrievalTarget[] {
    const targets: Set<UKAKnowledgeRetrievalTarget> = new Set();
    const permissions = UKAPermissions.getPermissionsForRole(role);

    // Base context always included
    targets.add("CURRENT_PROPERTY_CONTEXT");

    switch (intent) {
      case "DECISION_QUERY":
        targets.add("CURRENT_EVALUATION");
        targets.add("DECISION_ENGINE");
        targets.add("RECOGNITION_ENGINE");
        targets.add("APPROVED_KNOWLEDGE_FRAMEWORK");
        break;

      case "PROPERTY_QUERY":
        targets.add("CURRENT_EVALUATION");
        targets.add("PROPERTY_HEALTH");
        if (targetType === "FINDING" || targetType === "ENTITY") {
          targets.add("DECISION_ENGINE");
          targets.add("RECOGNITION_ENGINE");
        }
        targets.add("APPROVED_KNOWLEDGE_FRAMEWORK");
        break;

      case "REPORT_QUERY":
        targets.add("CURRENT_EVALUATION");
        targets.add("PROPERTY_HEALTH");
        targets.add("DECISION_ENGINE");
        targets.add("APPROVED_KNOWLEDGE_FRAMEWORK");
        break;

      case "CONSULTANT_QUERY":
        targets.add("CURRENT_EVALUATION");
        targets.add("DECISION_ENGINE");
        targets.add("PROPERTY_HEALTH");
        if (permissions.canModifyRemedies) {
          targets.add("CONSULTANT_NOTES");
        }
        targets.add("APPROVED_KNOWLEDGE_FRAMEWORK");
        break;

      case "DIAGNOSTIC_QUERY":
        targets.add("CURRENT_EVALUATION");
        targets.add("DECISION_ENGINE");
        targets.add("RECOGNITION_ENGINE");
        targets.add("PROPERTY_HEALTH");
        if (permissions.canModifyRemedies) {
          targets.add("CONSULTANT_NOTES");
        }
        break;

      case "KNOWLEDGE_QUERY":
      case "GENERAL_QUERY":
      case "MEMBERSHIP_QUERY":
      default:
        targets.add("APPROVED_KNOWLEDGE_FRAMEWORK");
        break;
    }

    return Array.from(targets);
  }

  /**
   * List required evidence items expected for successful resolution
   */
  private static determineEvidenceRequirements(intent: string, resolvedTarget: any): string[] {
    const requirements: string[] = ["Source Canon Attribution"];

    if (intent === "DECISION_QUERY") {
      requirements.push("15-Stage Decision Chain Execution Trace", "Rule Title & Severity Penalty", "6-Core 'WHY?' Answers");
    } else if (intent === "PROPERTY_QUERY" || intent === "REPORT_QUERY") {
      requirements.push("Property Health Score & Rating Tier", "Active Findings List", "Zone Vector Assignment");
    } else if (intent === "DIAGNOSTIC_QUERY") {
      requirements.push("System Engine Status", "Total Evaluated Doshas Count", "Cad Recognition Confidence");
    }

    if (resolvedTarget.entityName) {
      requirements.push(`Target Entity Specifics for '${resolvedTarget.entityName}'`);
    }

    return requirements;
  }

  /**
   * Determine allowed human-readable source names (Sanitized per Knowledge Policy)
   */
  private static determinePermittedSources(role: UKAUserRole, targets: UKAKnowledgeRetrievalTarget[]): string[] {
    const sources: string[] = ["Approved URJAFLUX Knowledge Framework"];

    if (targets.includes("DECISION_ENGINE")) sources.push("Urjaflux Decision Intelligence Engine");
    if (targets.includes("RECOGNITION_ENGINE")) sources.push("Urjaflux Recognition & CAD Engine");
    if (targets.includes("PROPERTY_HEALTH")) sources.push("Urjaflux Property Health Engine");
    if (targets.includes("CONSULTANT_NOTES") && UKAPermissions.getPermissionsForRole(role).canModifyRemedies) {
      sources.push("Urjaflux Consultant Audit Notes");
    }

    return sources;
  }
}
