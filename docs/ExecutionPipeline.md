# Execution Pipeline

This document details the step-by-step diagnostic and generation pipeline of **URJAFLUX AI OS**, explaining how scriptural data, spatial coordinates, and astrological parameters synthesize into certified reports.

---

## Architectural Dataflow Pipeline

```text
    [Scriptural Knowledge Library]
                  ↓
          [Extracted Rules]   --- (Compiled to AST Nodes)
                  ↓
       [User Spatial Coordinates]  --- (Drawn on Canvas)
                  ↓
        [Coordinate Normalizer]  --- (Applied Compass Rotations)
                  ↓
               [Context]      --- (Factual State Bundles)
                  ↓
         [ConditionEvaluator]  --- (Evaluates Rule AST Conditions)
                  ↓
        [FormulaRegistry]     --- (Triggers Mathematical Expressions)
                  ↓
        [ConflictResolver]    --- (Applies System Override priority)
                  ↓
      [Dossier Report Compiler] --- (Assembles Final PDF Audit)
```

---

## Detailed Stage Analysis

### Stage 1: Knowledge Library
* **Input**: Classical scriptures (e.g., *Samarangana Sutradhara*).
* **Operation**: Document ingestion parsing detects prescriptive rules and formulas, structuring them as modular RAG sources.
* **Output**: Verified, active `ExtractedRules` and `ExtractedFormulas` registered in the central Knowledge Registry.

### Stage 2: Spatial Normalization & Context Assembly
* **Input**: User-drawn shapes, coordinates, and rotation offsets on the canvas.
* **Operation**:
  * The **Spatial Geometry Engine** normalizes user coordinates, factoring in orientation angles (compass degrees).
  * The engine maps room polygons to Vastu's 9x9 Pada grids.
  * These spatial metrics, alongside client profile parameters, are bundled into a cohesive `RuleContext`.
* **Output**: Fully compiled `RuleContext` ready for AST analysis.

### Stage 3: AST Condition Evaluation (Rule Engine)
* **Input**: Active `RuleContext` and `RuleDefinitions`.
* **Operation**: The recursive `ConditionEvaluator` executes comparison assertions (e.g., matching if `floorPlan.masterBedroom.zone` equals `North-East`).
* **Output**: Filtered set of rules that match active spatial defects.

### Stage 4: Formula Execution
* **Input**: Matched rules with linked formula IDs.
* **Operation**:
  * The rule engine dispatches mathematical expressions to the `FormulaRegistry`.
  * Reusable math executors compute dimensional metrics (such as checking if the plot width/length proportions align with Ayadi numerological ratios).
* **Output**: Dynamic numbers stored back inside `RuleContext.calculatedValues`.

### Stage 5: Conflict Resolution
* **Input**: Matched execution results containing potential contradictions.
* **Operation**:
  * The system verifies if rules intersect on registered conflict points.
  * Resolvers run priority-weight overrides, suppressing loser rules to avoid confusing client instructions.
* **Output**: A clean, non-contradictory list of diagnostic findings.

### Stage 6: Evidence Matching & Recommendation Assembly
* **Input**: Winning execution results.
* **Operation**:
  * The engine loads the linked scriptural references (`evidenceIds`) to back the finding with Sanskrit shlokas and translations.
  * System templates interpolate values (e.g., substituting actual dimensions into recommendation strings).
* **Output**: Hydrated lists of warnings, recommendations, and scriptural evidence blocks.

### Stage 7: Report Compiling
* **Input**: Hydrated audit findings.
* **Operation**: The report engine maps findings to the physical property record, scoring overall compliance (0-100), and outputs a white-labeled client dossier report.
* **Output**: Certified PDF Audit Report ready for enterprise clients.
