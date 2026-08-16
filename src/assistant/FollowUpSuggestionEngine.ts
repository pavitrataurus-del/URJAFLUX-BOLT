/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 5 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Follow-Up Suggestion Engine
 * 
 * FollowUpSuggestionEngine.ts: Contextual Follow-Up Action Generator.
 * Generates deterministic, highly relevant follow-up actions based on memory context.
 */

import { UKAFollowUpAction, UKAUserRole } from "./UKATypes";
import { ConsultationMemoryEngine } from "./ConsultationMemoryEngine";

export class FollowUpSuggestionEngine {
  /**
   * Main Entry Point: Generate follow-up suggestions for the given session
   */
  public static generateSuggestions(sessionId: string): UKAFollowUpAction[] {
    const memory = ConsultationMemoryEngine.getOrCreateMemory(sessionId);
    const actions: UKAFollowUpAction[] = [];

    const entityName = memory.currentEntityName;
    const finding = memory.currentFinding;
    const role = memory.userRole;

    // 1. Entity & Finding Specific Follow-Ups
    if (entityName) {
      const lower = entityName.toLowerCase();

      // Elemental & Zone specific guidance
      if (lower.includes("kitchen")) {
        actions.push({
          label: "Explain Agni (Fire) element harmony in South-East",
          actionQuery: `What is the classical fire element canon for ${entityName}?`,
          category: "CANON"
        });
      } else if (lower.includes("bedroom")) {
        actions.push({
          label: "Explain Nairitya (Earth) element grounding in South-West",
          actionQuery: `What is the stability canon for master bedrooms?`,
          category: "CANON"
        });
      } else if (lower.includes("toilet") || lower.includes("bathroom")) {
        actions.push({
          label: "Explain Vayavya (Air) element disposal vectors",
          actionQuery: `What is the waste disposal vector principle for toilets?`,
          category: "CANON"
        });
      }

      // Alternative Remedies
      actions.push({
        label: `View non-demolition remedies for ${entityName}`,
        actionQuery: `What non-demolition remedies apply to ${entityName}?`,
        category: "REMEDY"
      });

      // Spatial Comparison
      actions.push({
        label: `Compare ${entityName} with ideal Vastu padas`,
        actionQuery: `Compare current ${entityName} vector with ideal padas.`,
        category: "COMPARISON"
      });
    }

    // 2. Finding & Severity Specific Follow-Ups
    if (finding) {
      const severity = finding.severityCalculation?.severity || "MODERATE";
      if (severity === "CATASTROPHIC" || severity === "SEVERE") {
        actions.push({
          label: `Show severity score deduction breakdown (${finding.severityCalculation?.scoreDeduction} pts)`,
          actionQuery: `Why did ${finding.elementName} receive a ${severity} severity penalty?`,
          category: "EVALUATION"
        });
      }
    }

    // 3. Overall Property Evaluation Follow-Ups
    if (memory.currentPropertyId) {
      actions.push({
        label: "Evaluate overall Property Health Index",
        actionQuery: "What is the complete Property Health Index score?",
        category: "EVALUATION"
      });
    }

    // 4. Role-Based Specialized Follow-Ups
    if (role === "FOUNDER" || role === "CONSULTANT") {
      actions.push({
        label: "Examine Decision Engine rule trace",
        actionQuery: "Show decision engine evaluation trace.",
        category: "DIAGNOSTIC"
      });
    }

    // Fallback default suggestions if list is empty
    if (actions.length === 0) {
      actions.push({
        label: "Query Approved Vastu Knowledge Canon",
        actionQuery: "What are the core spatial placement principles?",
        category: "CANON"
      });
      actions.push({
        label: "Upload floor plan drawing",
        actionQuery: "How do I analyze a custom property floor plan?",
        category: "EVALUATION"
      });
    }

    return actions.slice(0, 4); // Top 4 most relevant suggestions
  }
}
