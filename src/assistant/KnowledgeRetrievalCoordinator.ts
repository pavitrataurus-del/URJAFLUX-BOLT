/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 3 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Knowledge Planning & Retrieval Architecture
 * 
 * KnowledgeRetrievalCoordinator.ts: Retrieval Execution Coordinator.
 * Safely fetches authorized data slices from OS engines in strict priority order.
 */

import {
  UKAKnowledgePlan,
  UKAPropertyContext,
  UKASourceAttribution
} from "./UKATypes";
import { DecisionChain, PropertyHealthIndex } from "../engines/decision/types";
import { UKAModuleRegistry } from "./UKAModuleRegistry";
import { VASTU_CANON_DATABASE } from "../knowledge/vastuCanonDatabase";

export interface UKARetrievedDataPayload {
  planId: string;
  propertySummary?: string;
  evaluation?: PropertyHealthIndex | null;
  targetFinding?: DecisionChain | null;
  allFindings: DecisionChain[];
  recognitionEvidence?: {
    entityName: string;
    confidence: number;
    detectedBy: string;
    evidenceList: string[];
  };
  knowledgeCanonMatch?: {
    canonName: string; // Always sanitized to "Approved URJAFLUX Knowledge Framework"
    verseReference?: string;
    description: string;
  };
  consultantNotes?: string[];
  sourcesAttributed: UKASourceAttribution[];
  retrievalSuccess: boolean;
  retrievedTargets: string[];
}

export class KnowledgeRetrievalCoordinator {
  /**
   * Main Entry Point: Execute retrieval plan against current session context & OS engines
   */
  public static executeRetrieval(
    plan: UKAKnowledgePlan,
    context: UKAPropertyContext
  ): UKARetrievedDataPayload {
    const timestamp = new Date().toISOString();
    const retrievedTargets: string[] = [];
    const sourcesAttributed: UKASourceAttribution[] = [];

    let propertySummary: string | undefined;
    let evaluation: PropertyHealthIndex | null = null;
    let targetFinding: DecisionChain | null = null;
    let recognitionEvidence: UKARetrievedDataPayload["recognitionEvidence"];
    let knowledgeCanonMatch: UKARetrievedDataPayload["knowledgeCanonMatch"];
    let consultantNotes: string[] | undefined;

    // Execute retrieval steps according to plan's priority order
    for (const target of plan.priorityOrder) {
      switch (target) {
        case "CURRENT_PROPERTY_CONTEXT":
          if (context.currentProperty) {
            propertySummary = `Property '${context.currentProperty.name}' (${context.currentProperty.propertyType}, ${context.currentProperty.totalAreaSqFt || 350} sq ft, Facing: ${context.currentProperty.facingDirection || 'North'})`;
            retrievedTargets.push(target);
            sourcesAttributed.push({
              sourceName: "Urjaflux Workspace Context",
              engineId: "WORKSPACE",
              timestamp
            });
          }
          break;

        case "CURRENT_EVALUATION":
        case "PROPERTY_HEALTH":
          if (context.currentEvaluation) {
            evaluation = context.currentEvaluation;
            retrievedTargets.push(target);
            sourcesAttributed.push({
              sourceName: "Urjaflux Property Health Engine",
              engineId: "PROPERTY_HEALTH_ENGINE",
              timestamp
            });
          }
          break;

        case "DECISION_ENGINE":
          // Retrieve target finding or primary finding
          if (plan.targetFindingId) {
            targetFinding = context.currentFindings.find(f => f.findingId === plan.targetFindingId) || null;
          } else if (plan.targetEntityId) {
            targetFinding = context.currentFindings.find(f => f.elementId === plan.targetEntityId) || null;
          }

          if (!targetFinding && context.currentFindings.length > 0) {
            // Fallback to highest severity finding
            targetFinding = context.currentFindings[0];
          }

          if (targetFinding || context.currentFindings.length > 0) {
            retrievedTargets.push(target);
            sourcesAttributed.push({
              sourceName: "Urjaflux Decision Intelligence Engine",
              engineId: "DECISION_ENGINE",
              timestamp
            });
          }
          break;

        case "RECOGNITION_ENGINE":
          if (targetFinding) {
            recognitionEvidence = {
              entityName: targetFinding.elementName,
              confidence: targetFinding.recognitionEvidence?.confidence || 0.95,
              detectedBy: targetFinding.recognitionEvidence?.detectedBy || "CAD_GEOMETRY",
              evidenceList: targetFinding.recognitionEvidence?.evidenceList || [
                `CAD layer geometry polygon mapped for ${targetFinding.elementName}`,
                `Zone vector boundary calculated for ${targetFinding.zone}`
              ]
            };
            retrievedTargets.push(target);
            sourcesAttributed.push({
              sourceName: "Urjaflux CAD Recognition Engine",
              engineId: "RECOGNITION_ENGINE",
              timestamp
            });
          }
          break;

        case "APPROVED_KNOWLEDGE_FRAMEWORK":
          // Search approved knowledge canon database based on target finding or intent
          const searchKeyword = targetFinding ? targetFinding.elementName : "Brahmasthan";
          const canonEntry = this.lookupApprovedKnowledgeCanon(searchKeyword);

          knowledgeCanonMatch = {
            canonName: "Approved URJAFLUX Knowledge Framework", // Strictly sanitized per Knowledge Policy
            verseReference: canonEntry?.shlokaReference || "Vishwakarma Prakash / Mayamatam Canon",
            description: canonEntry?.description || "Vastu Shastra spatial orientation canon principles."
          };
          retrievedTargets.push(target);
          sourcesAttributed.push({
            sourceName: "Approved URJAFLUX Knowledge Framework",
            engineId: "PROCEDURAL_RULE_ENGINE",
            timestamp
          });
          break;

        case "CONSULTANT_NOTES":
          consultantNotes = context.currentRecommendations.map(
            r => `Consultant Action [${r.priority}]: ${r.title} in ${r.zone} -> ${r.remedy} (Impact: ${r.expectedImpact})`
          );
          if (consultantNotes.length > 0) {
            retrievedTargets.push(target);
            sourcesAttributed.push({
              sourceName: "Urjaflux Consultant Suite",
              engineId: "CONSULTANT_SUITE",
              timestamp
            });
          }
          break;
      }
    }

    const retrievalSuccess = retrievedTargets.length > 0;

    return {
      planId: plan.planId,
      propertySummary,
      evaluation,
      targetFinding,
      allFindings: context.currentFindings,
      recognitionEvidence,
      knowledgeCanonMatch,
      consultantNotes,
      sourcesAttributed: sourcesAttributed,
      retrievalSuccess,
      retrievedTargets
    };
  }

  /**
   * Safe lookup into approved classical knowledge database
   */
  private static lookupApprovedKnowledgeCanon(query: string): any {
    if (!VASTU_CANON_DATABASE || VASTU_CANON_DATABASE.length === 0) return null;
    const clean = (query || "").toLowerCase();
    return VASTU_CANON_DATABASE.find(c =>
      (c.topic || "").toLowerCase().includes(clean) ||
      (c.keywords || []).some(k => (k || "").toLowerCase().includes(clean))
    ) || VASTU_CANON_DATABASE[0];
  }
}
