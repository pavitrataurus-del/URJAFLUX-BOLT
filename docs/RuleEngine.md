# Deterministic Rule Engine

This document details the architecture, evaluation models, and design patterns of the **Universal AST-based Deterministic Rule Engine** inside URJAFLUX AI OS.

---

## Engine Architectural Overview

URJAFLUX AI OS utilizes a declarative, AST-driven Rule Engine to evaluate Vastu, astrological, and numerological rules. The system is completely separated from direct UI states or database triggers, facilitating deterministic unit testing and scalable plugin insertions.

```text
       Raw Context (Property, Client, Astrological)
                          ↓
           Enriched Context (Variables calculated)
                          ↓
        AST Condition Check (ConditionEvaluator)
                          ↓
      Formula Dispatch (FormulaRegistry / FormulaExecutor)
                          ↓
         Cross-System Conflict Resolver (Priority)
                          ↓
          Execution Logger (Durable Audit Trail)
```

---

## Core Data Models & Interfaces

### 1. Rule Definition (`RuleDefinition`)
Defines the structure of a rule, including its metadata, matching condition tree, and output formatting templates.
```typescript
export interface RuleDefinition {
  id: string;                    // e.g., "RULE-VASTU-NE-BEDROOM"
  pluginId: string;              // e.g., "vastu"
  name: string;
  description: string;
  priority: number;              // Numeric rank used during conflict resolution
  severity: "CATASTROPHIC" | "MAJOR" | "MODERATE" | "MINOR";
  version: string;               // e.g., "1.0.0"
  status: "DRAFT" | "ACTIVE" | "DEPRECATED";
  tags: string[];
  evidenceIds: string[];         // Direct trace pointers to Vedic scriptures
  formulaIds: string[];          // Associated math calculations
  conditions?: RuleConditionNode;// The AST root for evaluations
  explanationTemplate?: string;  // Interpolated output description
  recommendationsTemplate?: string[];
  warningsTemplate?: string[];
}
```

### 2. Rule Context (`RuleContext`)
Combines all relevant facts about a property, client, birth chart, and spatial orientations.
```typescript
export interface RuleContext {
  property?: Record<string, unknown>;
  client?: Record<string, unknown>;
  birthDetails?: Record<string, unknown>;
  compass?: Record<string, unknown>;
  floorPlan?: Record<string, unknown>;
  calculatedValues: Record<string, unknown>; // Populated dynamically during pipelines
  pluginVariables: Record<string, unknown>;
  userInputs?: Record<string, unknown>;
}
```

---

## Condition Engine & AST Evaluation

The AST Condition Engine evaluates nested logic trees recursively, checking factual states against defined thresholds.

### 1. Condition Syntax Nodes
Conditions can be basic key-value comparisons or logical gates (`AND`, `OR`, `NOT`) nesting child conditions.
```typescript
export interface BaseCondition {
  field: string;               // Dot-separated path, e.g., "compass.degrees"
  operator: ComparisonOperator;// COMPARISON operator
  value?: unknown;             // Expected value or range bounds
}

export interface LogicalCondition {
  gate: "AND" | "OR" | "NOT";
  conditions: RuleConditionNode[];
}

export type RuleConditionNode = BaseCondition | LogicalCondition;
```

### 2. Comparison Operators
The engine natively supports extensive operators:
* `EQUALS` / `NOT_EQUALS`: Standard equality matches.
* `GREATER_THAN` / `LESS_THAN` (along with `=` versions): Standard numeric boundaries.
* `CONTAINS`: Checks for substrings or array inclusions.
* `EXISTS`: Verifies presence of a field in the context.
* `IN_RANGE`: Matches a range bounds object (e.g., `{ min: 45, max: 135 }`).
* `IN_LIST`: Checks if a scalar value resides inside an expected array.

### 3. Recursive Evaluation
The condition evaluator traverses condition trees recursively:
```typescript
export class ConditionEvaluator {
  public evaluate(node: RuleConditionNode, context: RuleContext): boolean {
    if ("gate" in node) {
      const results = node.conditions.map(c => this.evaluate(c, context));
      switch (node.gate) {
        case "AND": return results.every(r => r === true);
        case "OR":  return results.some(r => r === true);
        case "NOT": return !results[0];
        default:    return false;
      }
    } else {
      const actualValue = getNestedValue(context, node.field);
      return evaluateComparison(actualValue, node.operator, node.value);
    }
  }
}
```

---

## Formula Registry & Dynamic Calculations

Mathematical Vedic calculations (such as Ayadi Nakshatras or orientation offsets) are managed by the `FormulaRegistry`:
* **Interface**: Formulas implement `FormulaExecutor` which provides an `execute` function.
* **Variable Extraction**: Context parameters (e.g., plot width or length) are passed into the executor, and outputs are dynamically stored back in the `RuleContext.calculatedValues` state.

---

## Conflict Resolution Pipeline

When multiple sub-systems produce recommendations that contradict each other (e.g., Vastu suggesting yellow wall-paint in the NE quadrant, while Lal Kitab warns that yellow causes health decline due to an afflicted Jupiter), the `ConflictResolver` executes:
1. **Trigger Check**: Detects if mutually conflicting rules matched in the active evaluation.
2. **Resolution Rules**:
   * **Priority Match**: The rule with higher numeric `priority` overrides the lower one.
   * **Semantic Version Match**: If priorities match, the more recently compiled plugin version takes precedence.
3. **Suppression**: Loser execution results are converted to a suppressed state, preventing contradictory instructions from appearing on client-facing reports.
4. **Outcomes Log**: Detailed justifications (e.g., "Astro-Vastu Jupiter planet defense override applied") are saved in the audit log.

---

## Execution Logger

The `ExecutionLogger` guarantees transparency by saving complete evaluation records to the Firestore `rule_execution_logs` collection.
* **Metadata Registered**: Start times, total processing latency (ms), matched rules, suppressed rules, and citation-evidences.
* **Offline Resiliency**: In the event of connection drops, the execution record is queued in local storage memory, to be synchronized when connectivity is restored.
