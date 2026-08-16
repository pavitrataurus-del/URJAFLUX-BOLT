/**
 * URJAFLUX AI OS — SPRINT 4A.6 (SSOT Consolidation)
 * Central Canonical Recommendation Registry
 * 
 * Recommendations are generated once by the Decision Engine / Recommendation Engine,
 * registered here, and referenced everywhere by ID. They are NEVER regenerated downstream.
 */

import { CanonicalZoneCode } from "../spatial/CanonicalZoneRegistry";

export interface CanonicalRecommendation {
  readonly recommendationId: string;
  readonly findingId: string;
  readonly entityId: string;
  readonly ruleId: string;
  readonly zoneCode: CanonicalZoneCode;
  readonly remedyAction: string;
  readonly priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  readonly expectedImpact: string;
  readonly implementationEase: "EASY" | "MODERATE" | "HARD";
  readonly nonDemolition: boolean;
  readonly timestamp: number;
}

export class CanonicalRecommendationRegistry {
  private static registry: Map<string, CanonicalRecommendation> = new Map();

  public static clear(): void {
    this.registry.clear();
  }

  public static register(rec: CanonicalRecommendation): CanonicalRecommendation {
    const frozen = Object.freeze({ ...rec });
    this.registry.set(frozen.recommendationId, frozen);
    return frozen;
  }

  public static get(recommendationId: string): CanonicalRecommendation | undefined {
    return this.registry.get(recommendationId);
  }

  public static getForEntity(entityId: string): CanonicalRecommendation[] {
    const res: CanonicalRecommendation[] = [];
    for (const rec of this.registry.values()) {
      if (rec.entityId === entityId) res.push(rec);
    }
    return res;
  }

  public static getAll(): CanonicalRecommendation[] {
    return Array.from(this.registry.values());
  }

  public static createAndRegister(params: {
    findingId: string;
    entityId: string;
    ruleId: string;
    zoneCode: CanonicalZoneCode;
    remedyAction: string;
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    expectedImpact: string;
    implementationEase?: "EASY" | "MODERATE" | "HARD";
    nonDemolition?: boolean;
  }): CanonicalRecommendation {
    const recommendationId = `REC-${params.entityId}-${params.ruleId}`.toUpperCase();
    const existing = this.registry.get(recommendationId);
    if (existing) return existing;

    const rec: CanonicalRecommendation = {
      recommendationId,
      findingId: params.findingId,
      entityId: params.entityId,
      ruleId: params.ruleId,
      zoneCode: params.zoneCode,
      remedyAction: params.remedyAction,
      priority: params.priority,
      expectedImpact: params.expectedImpact,
      implementationEase: params.implementationEase || "EASY",
      nonDemolition: params.nonDemolition ?? true,
      timestamp: Date.now()
    };
    return this.register(rec);
  }
}
