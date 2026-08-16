import {
  RuleConditionNode,
  RuleContext,
  isLogicalCondition,
  ComparisonOperator
} from "../../types/ruleEngine";

/**
 * Safely extracts a value from an object via a dot-separated string path (e.g., "compass.degrees")
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Evaluates a comparison between a dynamic context value and an expected condition value
 */
export function evaluateComparison(
  actual: unknown,
  operator: ComparisonOperator,
  expected: unknown
): boolean {
  switch (operator) {
    case "EQUALS":
      return actual === expected;

    case "NOT_EQUALS":
      return actual !== expected;

    case "GREATER_THAN":
      if (typeof actual === "number" && typeof expected === "number") {
        return actual > expected;
      }
      return false;

    case "LESS_THAN":
      if (typeof actual === "number" && typeof expected === "number") {
        return actual < expected;
      }
      return false;

    case "GREATER_THAN_OR_EQUAL":
      if (typeof actual === "number" && typeof expected === "number") {
        return actual >= expected;
      }
      return false;

    case "LESS_THAN_OR_EQUAL":
      if (typeof actual === "number" && typeof expected === "number") {
        return actual <= expected;
      }
      return false;

    case "CONTAINS":
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      if (typeof actual === "string") {
        return actual.toLowerCase().includes(String(expected).toLowerCase());
      }
      return false;

    case "EXISTS":
      return actual !== null && actual !== undefined;

    case "IN_RANGE": {
      if (typeof actual !== "number") return false;
      const range = expected as { min?: number; max?: number };
      if (!range || typeof range !== "object") return false;
      const minOk = range.min === undefined || actual >= range.min;
      const maxOk = range.max === undefined || actual <= range.max;
      return minOk && maxOk;
    }

    case "IN_LIST":
      if (Array.isArray(expected)) {
        return expected.includes(actual);
      }
      return false;

    default:
      return false;
  }
}

/**
 * Core recursive Condition Evaluator
 */
export class ConditionEvaluator {
  /**
   * Evaluates a given condition node against the rule context
   */
  public static evaluate(node: RuleConditionNode, context: RuleContext): boolean {
    if (isLogicalCondition(node)) {
      const { gate, conditions } = node;

      if (conditions.length === 0) {
        return gate !== "AND"; // AND of empty is technically true in formal logic, but here we can return appropriate defaults. Let's do true for AND, false for OR.
      }

      switch (gate) {
        case "AND":
          return conditions.every(cond => this.evaluate(cond, context));

        case "OR":
          return conditions.some(cond => this.evaluate(cond, context));

        case "NOT":
          // In rules logic, NOT usually negates the logical evaluation of sub-conditions.
          // If multiple sub-conditions are provided under NOT, we evaluate as NOT (AND of sub-conditions) or individually.
          // To make it fully deterministic, NOT evaluates the first condition and negates it.
          // Or if there are multiple, it negates their logical AND/OR. Let's negate the conjunction of all sub-conditions.
          return !conditions.every(cond => this.evaluate(cond, context));

        default:
          return false;
      }
    } else {
      // BaseCondition
      const actualValue = getNestedValue(context, node.field);
      return evaluateComparison(actualValue, node.operator, node.value);
    }
  }
}
