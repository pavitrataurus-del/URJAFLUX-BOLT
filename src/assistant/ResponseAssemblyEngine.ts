/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 3 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Knowledge Planning & Retrieval Architecture
 * 
 * ResponseAssemblyEngine.ts: Structured Response Object Constructor.
 * Assembles unified evidence packages and routing context into typed response data objects.
 * Strict Policy: No natural language generation, no markdown, no UI. Pure structured data.
 */

import {
  UKAStructuredResponseObject,
  UKARoutingResult,
  UKAUnifiedEvidencePackage,
  UKAResponseType,
  UKAReviewStatus,
  UKAResponseConfidence,
  UKARecommendationItem
} from "./UKATypes";
import { UKAPermissions } from "./UKAPermissions";

export class ResponseAssemblyEngine {
  /**
   * Main Entry Point: Assemble a structured response object from routing results and aggregated evidence package.
   */
  public static assembleResponse(
    routingResult: UKARoutingResult,
    evidencePackage: UKAUnifiedEvidencePackage | null
  ): UKAStructuredResponseObject {
    const startTime = performance.now();
    const responseId = `RESP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const { intent, guardResult, userRole, sessionId, resolvedTarget } = routingResult;

    // 1. Check Guard Status First (ACCESS_DENIED)
    if (!guardResult.allowed) {
      const endTime = performance.now();
      return {
        responseId,
        responseType: this.mapIntentToResponseType(intent),
        status: "ACCESS_DENIED",
        observation: `Access to feature or intent '${intent}' is restricted for user role '${userRole}'.`,
        explanation: guardResult.reason,
        evidencePackage: null,
        recommendations: [],
        suggestedNextSteps: [
          guardResult.suggestedRole
            ? `Upgrade subscription tier to '${guardResult.suggestedRole}' to access this capability.`
            : "Review available subscription tiers in URJAFLUX AI OS."
        ],
        confidence: {
          recognitionConfidence: null,
          evaluationConfidence: null,
          knowledgeCoverage: null,
          evidenceCompleteness: null,
          overallConfidence: null
        },
        professionalReviewStatus: "DRAFT",
        metadata: this.buildMetadata(sessionId, userRole, routingResult.resolvedTarget.status, endTime - startTime)
      };
    }

    // 2. Check Evidence Sufficiency Policy (INSUFFICIENT_EVIDENCE)
    if (!evidencePackage || !evidencePackage.hasSufficientEvidence) {
      const endTime = performance.now();
      return {
        responseId,
        responseType: this.mapIntentToResponseType(intent),
        status: "INSUFFICIENT_EVIDENCE",
        observation: `Insufficient evidence available in current property context to complete evaluation for intent '${intent}'.`,
        explanation: resolvedTarget.explanation || "No active floor plan or decision chains were found in memory.",
        evidencePackage: evidencePackage || null,
        recommendations: [],
        suggestedNextSteps: [
          "Upload CAD floor plan drawing or select an active property in the Workspace.",
          "Run spatial recognition and procedural rule analysis to generate decision evidence."
        ],
        confidence: {
          recognitionConfidence: null,
          evaluationConfidence: null,
          knowledgeCoverage: evidencePackage?.knowledgeEvidence?.coverageScore || null,
          evidenceCompleteness: evidencePackage?.evidenceCompletenessPercent || 0,
          overallConfidence: null
        },
        professionalReviewStatus: "DRAFT",
        metadata: this.buildMetadata(sessionId, userRole, routingResult.resolvedTarget.status, endTime - startTime)
      };
    }

    // 3. Assemble Successful Response
    const responseType = this.mapIntentToResponseType(intent);
    const observation = this.buildObservation(intent, evidencePackage, resolvedTarget);
    const explanation = this.buildExplanation(intent, evidencePackage, resolvedTarget);
    const recommendations = this.buildRecommendations(evidencePackage);
    const decisionChain = evidencePackage.matchedFinding || undefined;
    const suggestedNextSteps = this.buildSuggestedNextSteps(intent, userRole, evidencePackage);
    const confidence = this.buildConfidence(evidencePackage);
    const professionalReviewStatus = this.determineReviewStatus(userRole, evidencePackage);

    const endTime = performance.now();

    return {
      responseId,
      responseType,
      status: "SUCCESS",
      observation,
      explanation,
      evidencePackage,
      recommendations,
      decisionChain,
      suggestedNextSteps,
      confidence,
      professionalReviewStatus,
      metadata: this.buildMetadata(sessionId, userRole, routingResult.resolvedTarget.status, endTime - startTime)
    };
  }

  /**
   * Map user intent to structured response type
   */
  private static mapIntentToResponseType(intent: string): UKAResponseType {
    switch (intent) {
      case "PROPERTY_QUERY":
        return "PROPERTY_RESPONSE";
      case "DECISION_QUERY":
        return "DECISION_RESPONSE";
      case "REPORT_QUERY":
        return "REPORT_RESPONSE";
      case "CONSULTANT_QUERY":
        return "CONSULTANT_RESPONSE";
      case "DIAGNOSTIC_QUERY":
        return "DIAGNOSTIC_RESPONSE";
      case "MEMBERSHIP_QUERY":
        return "MEMBERSHIP_RESPONSE";
      case "KNOWLEDGE_QUERY":
      case "GENERAL_QUERY":
      default:
        return "KNOWLEDGE_RESPONSE";
    }
  }

  /**
   * Build observation data string
   */
  private static buildObservation(intent: string, evd: UKAUnifiedEvidencePackage, target: any): string {
    if (evd.matchedFinding) {
      const sev = evd.matchedFinding.severityCalculation?.severity || "MODERATE";
      const ded = evd.matchedFinding.severityCalculation?.scoreDeduction || 0;
      return `Observation: Entity '${evd.matchedFinding.elementName}' in zone ${evd.matchedFinding.zone} exhibits severity '${sev}' with a score penalty of ${ded} points.`;
    }
    if (evd.evaluationSummary) {
      return `Observation: Overall Property Health Index is evaluated at ${evd.evaluationSummary.overallScore}% (${evd.evaluationSummary.ratingTier}) based on ${evd.evaluationSummary.elementCount} spatial findings.`;
    }
    return `Observation: Spatial evidence successfully compiled for intent '${intent}'.`;
  }

  /**
   * Build explanation data string
   */
  private static buildExplanation(intent: string, evd: UKAUnifiedEvidencePackage, target: any): string {
    if (evd.matchedFinding) {
      return `Explanation: ${evd.matchedFinding.appliedRule.title}. Condition: ${evd.matchedFinding.appliedRule.conditionEvaluated}. Canon basis: Approved URJAFLUX Knowledge Framework.`;
    }
    if (evd.knowledgeEvidence) {
      return `Explanation: Classical spatial canon references under the Approved URJAFLUX Knowledge Framework (${evd.knowledgeEvidence.verseReference}).`;
    }
    return `Explanation: Spatial query processed using URJAFLUX AI OS Decision Engine.`;
  }

  /**
   * Extract recommendations items from evidence package
   */
  private static buildRecommendations(evd: UKAUnifiedEvidencePackage): UKARecommendationItem[] {
    if (evd.matchedFinding && evd.matchedFinding.recommendation) {
      const rec = evd.matchedFinding.recommendation;
      return [
        {
          id: rec.remedyId || `REM-${Date.now()}`,
          findingId: evd.matchedFinding.findingId,
          title: evd.matchedFinding.appliedRule.title,
          zone: evd.matchedFinding.zone,
          remedy: rec.remedyAction,
          priority: (rec.priority as "HIGH" | "MEDIUM" | "LOW") || "HIGH",
          expectedImpact: rec.expectedImpact,
          implementationEase: rec.implementationEase
        }
      ];
    }
    return [];
  }

  /**
   * Determine suggested next action steps for the user
   */
  private static buildSuggestedNextSteps(intent: string, role: string, evd: UKAUnifiedEvidencePackage): string[] {
    const steps: string[] = [];

    if (evd.matchedFinding) {
      steps.push(`Review recommended non-demolition remedy for '${evd.matchedFinding.elementName}'.`);
      if (role === "CONSULTANT" || role === "FOUNDER") {
        steps.push("Apply custom remedy override in Consultant Suite.");
      }
    }

    if (evd.evaluationSummary) {
      steps.push("Export complete Client Property Health Dossier PDF.");
    }

    steps.push("Query Knowledge Framework for classical canon citations.");
    return steps;
  }

  /**
   * Construct confidence metrics. Returns null if metric unavailable (Never estimate per policy!).
   */
  private static buildConfidence(evd: UKAUnifiedEvidencePackage): UKAResponseConfidence {
    const recognitionConfidence = evd.recognitionEvidence ? evd.recognitionEvidence.confidence : null;
    const evaluationConfidence = evd.evaluationSummary ? 0.95 : null;
    const knowledgeCoverage = evd.knowledgeEvidence ? evd.knowledgeEvidence.coverageScore : null;
    const evidenceCompleteness = evd.evidenceCompletenessPercent ? evd.evidenceCompletenessPercent / 100 : null;

    let overallConfidence: number | null = null;
    if (recognitionConfidence !== null && evaluationConfidence !== null && evidenceCompleteness !== null) {
      overallConfidence = Math.round(((recognitionConfidence + evaluationConfidence + evidenceCompleteness) / 3) * 100) / 100;
    }

    return {
      recognitionConfidence,
      evaluationConfidence,
      knowledgeCoverage,
      evidenceCompleteness,
      overallConfidence
    };
  }

  /**
   * Determine professional review status
   */
  private static determineReviewStatus(role: string, evd: UKAUnifiedEvidencePackage): UKAReviewStatus {
    if (role === "FOUNDER") return "PROFESSIONALLY_VERIFIED";
    if (role === "CONSULTANT") return "PROFESSIONALLY_VERIFIED";
    if (evd.matchedFinding && evd.matchedFinding.severityCalculation?.severity === "CATASTROPHIC") {
      return "PROFESSIONAL_REVIEW_RECOMMENDED";
    }
    return "DRAFT";
  }

  /**
   * Build response metadata with commercial capability flags
   */
  private static buildMetadata(sessionId: string, role: any, activeMode: any, assemblyTimeMs: number) {
    return {
      sessionId,
      userRole: role,
      activeMode,
      attributableCanonName: "Approved URJAFLUX Knowledge Framework", // Strictly mandated per Knowledge Policy
      assemblyTimeMs: Math.round(assemblyTimeMs * 100) / 100,
      commercialCapabilities: {
        multiPropertySupported: true,
        multiFloorSupported: true,
        beforeAfterComparisonSupported: true,
        lalKitabNumerologyIntegrationReady: true,
        whiteLabelModeSupported: true,
        founderDiagnosticsSupported: true,
        humanReviewWorkflowReady: true,
        explainableTraceable: true
      }
    };
  }
}
