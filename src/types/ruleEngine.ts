/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 5
 *         UNIVERSAL ENTERPRISE RULE ENGINE TYPES
 * ============================================================================
 * 
 * Reusable type definitions for the Rule Engine infrastructure capable of
 * executing rules from any future knowledge plugin (Vastu, Lal Kitab, etc.).
 */

// ============================================================================
// 1. RULE DEFINITION
// ============================================================================

export type SeverityType = "CATASTROPHIC" | "MAJOR" | "MODERATE" | "MINOR";
export type RuleStatusType = "DRAFT" | "ACTIVE" | "DEPRECATED";

export interface RuleDefinition {
  id: string;          // Unique Rule ID
  pluginId: string;    // Associated Plugin ID
  name: string;
  description: string;
  priority: number;    // Numeric priority (higher value = higher priority)
  severity: SeverityType;
  version: string;     // e.g., "1.0.0"
  status: RuleStatusType;
  tags: string[];
  evidenceIds: string[];
  formulaIds: string[];
  conditions?: RuleConditionNode; // AST node for Condition Engine

  // Templates for compiling results
  explanationTemplate?: string;
  recommendationsTemplate?: string[];
  warningsTemplate?: string[];
}

// ============================================================================
// 2. RULE CONTEXT
// ============================================================================

export interface RuleContext {
  property?: Record<string, unknown>;
  client?: Record<string, unknown>;
  birthDetails?: Record<string, unknown>;
  compass?: Record<string, unknown>;
  floorPlan?: Record<string, unknown>;
  calculatedValues: Record<string, unknown>; // populated during or before pipeline runs
  pluginVariables: Record<string, unknown>;
  userInputs?: Record<string, unknown>;
  [key: string]: unknown; // open-ended extension support
}

// ============================================================================
// 3. CONDITION ENGINE
// ============================================================================

export type ComparisonOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN_OR_EQUAL"
  | "CONTAINS"
  | "EXISTS"
  | "IN_RANGE"
  | "IN_LIST";

export interface BaseCondition {
  field: string; // Nested dot-notation path, e.g. "compass.degrees"
  operator: ComparisonOperator;
  value?: unknown; // E.g., primitive, array for IN_LIST, or { min: number, max: number } for IN_RANGE
}

export type LogicalGate = "AND" | "OR" | "NOT";

export interface LogicalCondition {
  gate: LogicalGate;
  conditions: RuleConditionNode[];
}

export type RuleConditionNode = BaseCondition | LogicalCondition;

// Helper type guard to distinguish between conditions
export function isLogicalCondition(node: RuleConditionNode): node is LogicalCondition {
  return "gate" in node && "conditions" in node;
}

// ============================================================================
// 4. FORMULA INTERFACE
// ============================================================================

export interface FormulaExecutor {
  formulaId: string;
  name: string;
  description: string;
  execute(context: RuleContext, inputParams?: Record<string, unknown>): unknown;
}

export interface IFormulaRegistry {
  register(executor: FormulaExecutor): void;
  get(formulaId: string): FormulaExecutor | undefined;
  has(formulaId: string): boolean;
}

// ============================================================================
// 5. RULE RESULT
// ============================================================================

export interface RuleExecutionResult {
  ruleId: string;
  pluginId: string;
  status: "SUCCESS" | "ERROR";
  matched: boolean;
  confidence: number; // 0.0 to 1.0 based on evidence strength
  severity: SeverityType;
  explanation: string;
  evidence: {
    evidenceIds: string[];
    strength: number; // calculated evidence strength / weight
  };
  recommendations: string[];
  warnings: string[];
  errorDetails?: string;
  timestamp: string;
}

// ============================================================================
// 6. PLUGIN REGISTRY
// ============================================================================

export interface PluginMetadata {
  id: string; // Unique, e.g. "vastu", "lal_kitab", "numerology"
  name: string;
  description: string;
  version: string;
  priority: number; // For conflict resolution (higher = more authoritative)
}

export interface IKnowledgePlugin {
  metadata: PluginMetadata;
  rules: RuleDefinition[];
  formulas: FormulaExecutor[];
  validateContext?: (context: RuleContext) => { isValid: boolean; errors: string[] };
  validateRule?: (rule: RuleDefinition) => { isValid: boolean; errors: string[] };
}

// ============================================================================
// 7. CONFLICT RESOLUTION
// ============================================================================

export interface ConflictDefinition {
  ruleIdA: string;
  ruleIdB: string;
  description: string;
}

// ============================================================================
// 8. LOGGING
// ============================================================================

export interface ExecutionLog {
  id: string;
  timestamp: string;
  pluginId: string;
  ruleId: string;
  durationMs: number;
  outcome: "MATCHED" | "NOT_MATCHED" | "ERROR";
  details?: string;
}
