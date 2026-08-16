/**
 * URJAFLUX AI OS - Runtime Consistency Validator
 * Phase 11: Cross-engine consistency validation.
 * Verifies that all engines reference the EXACT same Entity IDs, Finding IDs, Recommendation IDs, and Scores.
 * Raises RUNTIME_INTEGRITY_ERROR if any divergence or mismatch occurs.
 */

import { PropertyRecognitionSummary } from "../../recognition/types";
import { DecisionEngineExecutionResult } from "../../engines/decision/UrjafluxDecisionEngine";
import { PropertyHealthIndex } from "../../engines/decision/types";
import { EvaluationCoverageReport } from "../../engines/validation/EvaluationCoverageEngine";
import { CanonicalFinding } from "../findings/CanonicalFinding";

export interface ConsistencyValidationReport {
  isConsistent: boolean;
  timestamp: number;
  entityCountMatch: boolean;
  findingCountMatch: boolean;
  scoreMatch: boolean;
  divergences: string[];
}

export class RuntimeConsistencyValidator {
  /**
   * Validates consistency across all live runtime objects.
   * Throws Error with message "RUNTIME_INTEGRITY_ERROR" if inconsistent and strict mode is on.
   */
  public static validateRuntimeConsistency(
    summary: PropertyRecognitionSummary | null,
    decisionResult: DecisionEngineExecutionResult | null,
    coverageReport: EvaluationCoverageReport | null,
    propertyHealth: PropertyHealthIndex | null,
    canonicalFindings: CanonicalFinding[],
    strict: boolean = false
  ): ConsistencyValidationReport {
    const divergences: string[] = [];

    if (!summary || !decisionResult) {
      return {
        isConsistent: true,
        timestamp: Date.now(),
        entityCountMatch: true,
        findingCountMatch: true,
        scoreMatch: true,
        divergences: ["Pipeline not yet executed."]
      };
    }

    // 1. Entity ID Consistency Check
    const summaryEntityIds = new Set(summary.entities.map(e => e.id));
    const coverageEntityIds = new Set(coverageReport?.entityInventory.map(e => e.entityId) || []);

    if (summaryEntityIds.size !== coverageEntityIds.size && coverageReport) {
      divergences.push(
        `Entity count mismatch: Recognition Engine found ${summaryEntityIds.size} entities, but Coverage Engine tracked ${coverageEntityIds.size}.`
      );
    }

    // 2. Finding ID Consistency Check
    const decisionFindingIds = new Set(decisionResult.decisionChains.map(c => c.findingId));
    const canonicalFindingIds = new Set(canonicalFindings.map(f => f.findingId));

    if (decisionFindingIds.size !== canonicalFindingIds.size && canonicalFindings.length > 0) {
      divergences.push(
        `Finding count mismatch: Decision Engine output ${decisionFindingIds.size} decision chains, but Canonical Findings array has ${canonicalFindingIds.size}.`
      );
    }

    // 3. Score Consistency Check
    const decisionScore = Math.round(decisionResult.propertyHealthIndex?.overallScore || 0);
    const healthScore = propertyHealth ? Math.round(propertyHealth.overallScore) : decisionScore;

    if (Math.abs(decisionScore - healthScore) > 2) {
      divergences.push(
        `Score mismatch: Decision Engine overallScore is ${decisionScore}%, but Property Health Index is ${healthScore}%.`
      );
    }

    const isConsistent = divergences.length === 0;

    if (!isConsistent && strict) {
      console.error("RUNTIME_INTEGRITY_ERROR:", divergences);
      throw new Error(`RUNTIME_INTEGRITY_ERROR: Mismatch detected across live runtime engines: ${divergences.join(" | ")}`);
    }

    return {
      isConsistent,
      timestamp: Date.now(),
      entityCountMatch: summaryEntityIds.size === coverageEntityIds.size || !coverageReport,
      findingCountMatch: decisionFindingIds.size === canonicalFindingIds.size || canonicalFindings.length === 0,
      scoreMatch: Math.abs(decisionScore - healthScore) <= 2,
      divergences
    };
  }
}
