import { 
  InterpretationContext, 
  InterpretationFinding, 
  InterpretationSeverity, 
  SeverityScorerPlugin 
} from "./InterpretationTypes";

/**
 * Standard severity scoring calibrator.
 * Adjusts defect severities depending on compass alignment errors or compounding rules.
 */
export class StandardSeverityScorer implements SeverityScorerPlugin {
  public readonly pluginId = "built_in_scorer";
  public readonly name = "Core Severity Scoring Calibrator";

  public scoreSeverity(finding: InterpretationFinding, context: InterpretationContext): InterpretationSeverity {
    let severity = finding.severity;

    // Severity Escalation Heuristic 1: Compass alignment deviances
    // If compass confidence is low, slightly demote severity to avoid alarmism.
    if (context.compass.confidence < 0.5) {
      if (severity === "CRITICAL") severity = "HIGH";
      else if (severity === "HIGH") severity = "MEDIUM";
      else if (severity === "MEDIUM") severity = "LOW";
    }

    // Severity Escalation Heuristic 2: Extreme misalignment
    const plotRatio = context.calculationResults["plotAspectRatio"];
    if (finding.category === "NUMEROLOGY_MISMATCH" && plotRatio && plotRatio > 2.5) {
      // Compounding issue: Bad numerology on a hyper-warped plot escalates risk
      if (severity === "HIGH") severity = "CRITICAL";
      else if (severity === "MEDIUM") severity = "HIGH";
    }

    return severity;
  }
}

/**
 * Severity Scorer orchestrator.
 * Invokes scorers to calibrate final finding severity.
 */
export class SeverityScorer {
  private plugins: SeverityScorerPlugin[] = [];

  constructor() {
    this.registerPlugin(new StandardSeverityScorer());
  }

  public registerPlugin(plugin: SeverityScorerPlugin): void {
    const exists = this.plugins.some(p => p.pluginId === plugin.pluginId);
    if (exists) {
      throw new Error(`[SeverityScorer] Plugin with ID "${plugin.pluginId}" is already registered.`);
    }
    this.plugins.push(plugin);
  }

  /**
   * Evaluates all plugins sequentially to calibrate finding severity.
   */
  public calibrate(finding: InterpretationFinding, context: InterpretationContext): InterpretationSeverity {
    let currentSeverity = finding.severity;
    
    // Create a shadow copy of the finding to pass down safely
    const tempFinding: InterpretationFinding = { ...finding };

    this.plugins.forEach(plugin => {
      try {
        tempFinding.severity = currentSeverity;
        currentSeverity = plugin.scoreSeverity(tempFinding, context);
      } catch (err: unknown) {
        console.error(
          `[SeverityScorer] Plugin "${plugin.pluginId}" failed to score severity: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    });

    return currentSeverity;
  }
}
