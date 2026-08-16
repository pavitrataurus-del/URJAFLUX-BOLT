import { VastuRule, RuleCategory } from "../types/vastuTypes";

const VALID_CATEGORIES: Set<RuleCategory> = new Set([
  "placement",
  "orientation",
  "connectivity",
  "zoning",
  "flow"
]);

export interface ValidationFailure {
  ruleId?: string;
  issue: string;
}

export function validateRuleDefinitions(rules: VastuRule[]): {
  isValid: boolean;
  failures: ValidationFailure[];
} {
  const failures: ValidationFailure[] = [];
  const seenIds = new Set<string>();

  for (const rule of rules) {
    if (!rule || typeof rule !== "object") {
      failures.push({ issue: "Malformed definition: Rule is not an object or is null/undefined" });
      continue;
    }

    // 1. Validate required fields
    if (!rule.id || typeof rule.id !== "string") {
      failures.push({ issue: "Malformed definition: id is missing or not a string" });
    } else {
      // 2. Validate duplicate rule ids
      if (seenIds.has(rule.id)) {
        failures.push({ ruleId: rule.id, issue: "Duplicate rule ID found" });
      }
      seenIds.add(rule.id);
    }

    if (!rule.name || typeof rule.name !== "string") {
      failures.push({ ruleId: rule.id, issue: "Malformed definition: name is missing or not a string" });
    }

    if (!rule.description || typeof rule.description !== "string") {
      failures.push({ ruleId: rule.id, issue: "Malformed definition: description is missing or not a string" });
    }

    // 3. Validate invalid categories
    if (!rule.category || !VALID_CATEGORIES.has(rule.category)) {
      failures.push({ ruleId: rule.id, issue: `Invalid category: '${rule.category || ""}'` });
    }

    if (!Array.isArray(rule.requiredSpatialRelationships)) {
      failures.push({ ruleId: rule.id, issue: "Malformed definition: requiredSpatialRelationships is missing or not an array" });
    } else {
      for (const rel of rule.requiredSpatialRelationships) {
        if (typeof rel !== "string") {
          failures.push({ ruleId: rule.id, issue: "Malformed definition: requiredSpatialRelationships contains non-string element" });
        }
      }
    }
  }

  return {
    isValid: failures.length === 0,
    failures
  };
}
