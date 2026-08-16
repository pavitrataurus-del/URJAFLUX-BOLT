import { VastuRule, RuleCategory } from "../types/vastuTypes";
import { placeholderRules } from "../ruleDefinitions/placeholderRules";

/**
 * Freeze a rule to ensure immutability.
 */
function deepFreezeRule(rule: VastuRule): Readonly<VastuRule> {
  const frozen = {
    ...rule,
    requiredSpatialRelationships: Object.freeze([...rule.requiredSpatialRelationships])
  };
  return Object.freeze(frozen);
}

// Internal immutable storage of all rules
const ALL_RULES: ReadonlyArray<Readonly<VastuRule>> = Object.freeze(
  placeholderRules.map(deepFreezeRule)
);

/**
 * Returns an immutable collection of all loaded rules.
 */
export function getAllRules(): ReadonlyArray<Readonly<VastuRule>> {
  return ALL_RULES;
}

/**
 * Returns an immutable collection of rules that are enabled.
 */
export function getEnabledRules(): ReadonlyArray<Readonly<VastuRule>> {
  return Object.freeze(ALL_RULES.filter((rule) => rule.enabled !== false));
}

/**
 * Returns an immutable collection of rules belonging to a specific category.
 */
export function getRulesByCategory(category: RuleCategory): ReadonlyArray<Readonly<VastuRule>> {
  return Object.freeze(ALL_RULES.filter((rule) => rule.category === category));
}

/**
 * Returns an immutable map of rules grouped by their respective category.
 */
export function getRulesGroupedByCategory(): Readonly<Record<RuleCategory, ReadonlyArray<Readonly<VastuRule>>>> {
  const groups: Record<RuleCategory, VastuRule[]> = {
    placement: [],
    orientation: [],
    connectivity: [],
    zoning: [],
    flow: []
  };

  for (const rule of ALL_RULES) {
    groups[rule.category].push(rule);
  }

  const groupedResult = {} as Record<RuleCategory, ReadonlyArray<Readonly<VastuRule>>>;
  
  for (const cat of Object.keys(groups) as RuleCategory[]) {
    groupedResult[cat] = Object.freeze([...groups[cat]]);
  }

  return Object.freeze(groupedResult);
}

export const RuleRepository = {
  getAllRules,
  getEnabledRules,
  getRulesByCategory,
  getRulesGroupedByCategory
};
