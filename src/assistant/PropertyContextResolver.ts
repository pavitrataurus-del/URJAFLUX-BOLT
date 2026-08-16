/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 2 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Conversation Intelligence & Intent Resolution
 * 
 * PropertyContextResolver.ts: Deterministic Target Resolution Engine for Property & Findings Context.
 */

import { UKAPropertyContext, UKAResolvedContextTarget, UKAIntentResult } from "./UKATypes";
import { DecisionChain } from "../engines/decision/types";

export class PropertyContextResolver {
  /**
   * Resolves the target entity, finding, floor, or property referenced in a user request.
   * STRICT POLICY: Never guess or fabricate. If ambiguous or missing context, return appropriate status.
   */
  public static resolveContext(
    intentResult: UKAIntentResult,
    context: UKAPropertyContext
  ): UKAResolvedContextTarget {
    const rawText = intentResult.rawInput.toLowerCase();
    const entityHint = intentResult.targetEntityHint;
    const intent = intentResult.intent;

    // 1. REPORT_QUERY Context Resolution
    if (intent === "REPORT_QUERY") {
      if (!context.currentEvaluation && context.currentFindings.length === 0) {
        return {
          status: "CONTEXT_REQUIRED",
          targetType: "REPORT",
          missingContextFields: ["currentEvaluation", "currentFindings"],
          explanation: "Cannot generate or resolve report. No active property spatial analysis evaluation exists in context."
        };
      }

      return {
        status: "RESOLVED",
        targetType: "REPORT",
        explanation: `Resolved active report dossier containing ${context.currentFindings.length} findings and overall score of ${context.currentEvaluation?.overallScore || 'N/A'}%.`
      };
    }

    // 2. DIAGNOSTIC_QUERY Context Resolution
    if (intent === "DIAGNOSTIC_QUERY") {
      return {
        status: "RESOLVED",
        targetType: "PROPERTY",
        explanation: `Resolved system diagnostic target. Active findings count: ${context.currentFindings.length}, Active module: ${context.currentActiveModule}.`
      };
    }

    // 3. CONSULTANT_QUERY Context Resolution
    if (intent === "CONSULTANT_QUERY") {
      if (rawText.includes("client")) {
        if (!context.currentClient) {
          return {
            status: "CONTEXT_REQUIRED",
            targetType: "CLIENT",
            missingContextFields: ["currentClient"],
            explanation: "Consultant client action requested, but no active client profile is assigned in context."
          };
        }
        return {
          status: "RESOLVED",
          targetType: "CLIENT",
          entityId: context.currentClient.id,
          entityName: context.currentClient.name,
          explanation: `Resolved active client '${context.currentClient.name}' (${context.currentClient.tier} tier).`
        };
      }
    }

    // 4. ENTITY / FINDING Context Resolution
    if (entityHint || rawText.includes("finding") || rawText.includes("dosha") || rawText.includes("remedy")) {
      // Check if property context is populated
      if (context.currentFindings.length === 0) {
        return {
          status: "CONTEXT_REQUIRED",
          targetType: "ENTITY",
          missingContextFields: ["currentFindings", "currentProperty"],
          explanation: `User referred to '${entityHint || 'finding'}', but no spatial analysis or decision chains exist in current property context.`
        };
      }

      const searchTerm = (entityHint || "").toLowerCase();

      // Find matching decision chains / findings
      const matchingChains: DecisionChain[] = context.currentFindings.filter((chain) => {
        const elemName = (chain.elementName || "").toLowerCase();
        const elemType = (chain.elementType || "").toLowerCase();
        const zone = (chain.zone || "").toLowerCase();
        const ruleTitle = (chain.appliedRule?.title || "").toLowerCase();

        const nameMatch = elemName.includes(searchTerm) || (searchTerm.length > 0 && searchTerm.includes(elemName));
        const typeMatch = elemType.includes(searchTerm) || (searchTerm.length > 0 && searchTerm.includes(elemType));
        const zoneMatch = zone.length > 0 && rawText.includes(zone);
        const titleMatch = ruleTitle.includes(searchTerm);

        return nameMatch || typeMatch || zoneMatch || titleMatch;
      });

      // Exact single match found
      if (matchingChains.length === 1) {
        const chain = matchingChains[0];
        return {
          status: "RESOLVED",
          targetType: "FINDING",
          entityId: chain.elementId,
          entityName: chain.elementName,
          matchedFindingId: chain.findingId,
          explanation: `Resolved exact single finding match: '${chain.elementName}' in zone ${chain.zone} (${chain.appliedRule.title}).`
        };
      }

      // Ambiguous multiple matches found
      if (matchingChains.length > 1) {
        // Check if user specified a zone to disambiguate (e.g. "kitchen in NE")
        const zoneSpecificMatch = matchingChains.find((c) => c.zone && rawText.includes(c.zone.toLowerCase()));
        if (zoneSpecificMatch) {
          return {
            status: "RESOLVED",
            targetType: "FINDING",
            entityId: zoneSpecificMatch.elementId,
            entityName: zoneSpecificMatch.elementName,
            matchedFindingId: zoneSpecificMatch.findingId,
            explanation: `Resolved ambiguity via zone specifier '${zoneSpecificMatch.zone}': '${zoneSpecificMatch.elementName}'.`
          };
        }

        // Return AMBIGUOUS status with candidate list
        return {
          status: "AMBIGUOUS",
          targetType: "ENTITY",
          candidates: matchingChains.map((c) => ({
            id: c.elementId,
            name: c.elementName,
            type: c.elementType,
            zone: c.zone
          })),
          explanation: `Found ${matchingChains.length} matching candidate entities for '${entityHint}'. Please specify zone (e.g. North-East or South-West).`
        };
      }

      // Fallback: If search term did not match findings, check if user requested generic entity type
      if (searchTerm) {
        return {
          status: "NOT_FOUND",
          targetType: "ENTITY",
          entityName: entityHint || undefined,
          explanation: `No active finding or analyzed entity matching '${entityHint}' was found in the current floor evaluation.`
        };
      }
    }

    // 5. FLOOR Context Resolution
    if (rawText.includes("floor") || rawText.includes("ground") || rawText.includes("first")) {
      if (!context.currentFloor) {
        return {
          status: "CONTEXT_REQUIRED",
          targetType: "FLOOR",
          missingContextFields: ["currentFloor"],
          explanation: "Floor reference detected, but no floor context is active."
        };
      }

      return {
        status: "RESOLVED",
        targetType: "FLOOR",
        entityId: context.currentFloor.id,
        entityName: context.currentFloor.levelName,
        explanation: `Resolved active floor: '${context.currentFloor.levelName}' (Level ${context.currentFloor.floorNumber}).`
      };
    }

    // 6. PROPERTY Default Resolution
    if (context.currentProperty) {
      return {
        status: "RESOLVED",
        targetType: "PROPERTY",
        entityId: context.currentProperty.id,
        entityName: context.currentProperty.name,
        explanation: `Resolved active property: '${context.currentProperty.name}'.`
      };
    }

    // 7. General Knowledge or No Property Needed
    if (intent === "KNOWLEDGE_QUERY" || intent === "MEMBERSHIP_QUERY" || intent === "GENERAL_QUERY") {
      return {
        status: "RESOLVED",
        targetType: "NONE",
        explanation: "General or Knowledge query does not require property instance context."
      };
    }

    // Fallback: Missing property context
    return {
      status: "CONTEXT_REQUIRED",
      targetType: "PROPERTY",
      missingContextFields: ["currentProperty"],
      explanation: "Active property instance context is required to execute spatial intelligence query."
    };
  }
}
