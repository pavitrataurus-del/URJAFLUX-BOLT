import { SpatialRelationshipModel } from "../../spatial/relationships/relationshipTypes";
import { RuleRepository } from "./ruleRepository";
import { RuleResult, VastuRule } from "../types/vastuTypes";

/**
 * Foundational Rule Evaluator.
 * Accepts a SpatialRelationshipModel, runs over VastuRule definitions, and yields RuleResult objects.
 * Uses deterministic placeholder outcomes for now without applying actual Vastu logic.
 * Always accesses rule definitions through the RuleRepository.
 */
export function evaluateVastuRules(
  spatialRelationships: SpatialRelationshipModel,
  rules: ReadonlyArray<Readonly<VastuRule>> = RuleRepository.getEnabledRules()
): RuleResult[] {

  return rules.map((rule) => {
    // 1. Collect all relationships required by this rule to showcase semantic awareness
    const relatedRels = spatialRelationships.relationships.filter((rel) =>
      rule.requiredSpatialRelationships.includes(rel.type)
    );

    const affectedElements = Array.from(
      new Set(relatedRels.flatMap((rel) => [rel.sourceId, rel.targetId]))
    ).filter((id) => id && id.length > 0);

    // 2. Return deterministic, neutral structural placeholder outcomes as requested
    const passed = true; // Always structurally valid for initial foundation
    const score = 1.0;

    return {
      ruleId: rule.id,
      passed,
      score,
      message: `[FOUNDATION PLACEHOLDER] '${rule.name}' successfully verified. Active relationships evaluated: ${relatedRels.length}.`,
      affectedElements
    };
  });
}
