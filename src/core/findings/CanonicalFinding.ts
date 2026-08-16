/**
 * URJAFLUX AI OS — SPRINT 4A.6 (SSOT Consolidation)
 * Canonical Finding Model
 * 
 * Defines the single, immutable finding object produced by the procedural rule engine & decision engine.
 * Consumed identically by Audit Report, UKA, PDF Generator, Decision Engine, and Property Health.
 */

import { CanonicalZoneCode } from "../spatial/CanonicalZoneRegistry";

export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NEUTRAL" | "POSITIVE";

export interface CanonicalFinding {
  readonly findingId: string;
  readonly entityId: string;
  readonly ruleId: string;
  readonly ruleTitle: string;
  readonly zoneCode: CanonicalZoneCode;
  readonly severity: FindingSeverity;
  readonly scoreDeductionPercent: number;
  readonly evidenceId: string;
  readonly recommendationId: string;
  readonly decisionChainId: string;
  readonly description: string;
  readonly rationale: string;
  readonly elementalConflict?: string;
  readonly timestamp: number;
}

export class CanonicalFindingFactory {
  public static createFinding(params: {
    entityId: string;
    ruleId: string;
    ruleTitle: string;
    zoneCode: CanonicalZoneCode;
    severity: FindingSeverity;
    scoreDeductionPercent: number;
    evidenceId: string;
    recommendationId: string;
    decisionChainId: string;
    description: string;
    rationale: string;
    elementalConflict?: string;
  }): CanonicalFinding {
    const findingId = `FINDING-${params.entityId}-${params.ruleId}`.toUpperCase();
    return Object.freeze({
      findingId,
      entityId: params.entityId,
      ruleId: params.ruleId,
      ruleTitle: params.ruleTitle,
      zoneCode: params.zoneCode,
      severity: params.severity,
      scoreDeductionPercent: params.scoreDeductionPercent,
      evidenceId: params.evidenceId,
      recommendationId: params.recommendationId,
      decisionChainId: params.decisionChainId,
      description: params.description,
      rationale: params.rationale,
      elementalConflict: params.elementalConflict,
      timestamp: Date.now()
    });
  }
}
