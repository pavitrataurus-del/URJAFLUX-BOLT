import { InterpretationRegistry } from "./InterpretationRegistry";
import { InterpretationLogger } from "./InterpretationLogger";
import { FindingGenerator } from "./FindingGenerator";
import { SeverityScorer } from "./SeverityScorer";
import { RecommendationEngine } from "./RecommendationEngine";
import { 
  InterpretationContext, 
  InterpretationFinding, 
  InterpretationRecommendation, 
  InterpretationModuleResult 
} from "./InterpretationTypes";

/**
 * Universal Interpretation Engine.
 * Orchestrates raw rule and calculation outputs into structured, 
 * consultant-grade architectural audits and balancing remedy dossiers.
 */
export class InterpretationEngine {
  public readonly registry: InterpretationRegistry;
  public readonly logger: InterpretationLogger;
  
  private findingGenerator: FindingGenerator;
  private severityScorer: SeverityScorer;
  private recommendationEngine: RecommendationEngine;

  constructor(registry?: InterpretationRegistry, logger?: InterpretationLogger) {
    this.registry = registry || new InterpretationRegistry();
    this.logger = logger || new InterpretationLogger();
    
    this.findingGenerator = new FindingGenerator();
    this.severityScorer = new SeverityScorer();
    this.recommendationEngine = new RecommendationEngine();

    this.synchronizeRegistryPlugins();
  }

  /**
   * Synchronizes registry custom plugins with internal pipeline runners.
   */
  private synchronizeRegistryPlugins(): void {
    // Incorporate any custom registered finding generator plugins
    this.registry.getFindingGenerators().forEach(plugin => {
      this.findingGenerator.registerPlugin(plugin);
    });

    // Incorporate any custom registered severity scorer plugins
    this.registry.getSeverityScorers().forEach(plugin => {
      this.severityScorer.registerPlugin(plugin);
    });

    // Incorporate any custom registered recommendation provider plugins
    this.registry.getRecommendationProviders().forEach(plugin => {
      this.recommendationEngine.registerPlugin(plugin);
    });
  }

  /**
   * Executes the entire structural-energetic interpretation pipeline.
   * 
   * @param context Active InterpretationContext containing calculation and rule states.
   */
  public run(context: InterpretationContext): InterpretationModuleResult {
    const startTimeMs = performance.now();
    const trace: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    trace.push(`[InterpretationEngine] Initializing analysis pipeline for Project "${context.project.id}"`);

    // Ensure we sync any dynamically registered plugins before proceeding
    this.synchronizeRegistryPlugins();

    try {
      // 1. Context validation
      if (context.compass.northAngle < 0 || context.compass.northAngle >= 360) {
        warnings.push("Normalized compass deviations are highly recommended for optimal quadrant evaluations.");
      }

      // 2. Generate initial raw findings
      trace.push("[InterpretationEngine] Stage 1: Initiating finding generator plugins...");
      const rawFindings = this.findingGenerator.generate(context);
      trace.push(`[InterpretationEngine] Generated ${rawFindings.length} raw baseline findings.`);

      // 3. Calibrate severities dynamically
      trace.push("[InterpretationEngine] Stage 2: Calibrating severity markers...");
      const calibratedFindings: InterpretationFinding[] = rawFindings.map(finding => {
        const calibratedSeverity = this.severityScorer.calibrate(finding, context);
        if (calibratedSeverity !== finding.severity) {
          trace.push(`[InterpretationEngine] Calibrated Finding "${finding.title}" severity from ${finding.severity} to ${calibratedSeverity}`);
        }
        return {
          ...finding,
          severity: calibratedSeverity
        };
      });

      // 4. Produce structured recommendations & remedies
      trace.push("[InterpretationEngine] Stage 3: Synthesizing customized action recommendations...");
      const recommendations = this.recommendationEngine.generate(calibratedFindings, context);
      trace.push(`[InterpretationEngine] Generated ${recommendations.length} action recommendations matching active defects.`);

      trace.push("[InterpretationEngine] Interpretation pipeline completed successfully.");

      // Log execution trace
      this.logger.log(
        startTimeMs,
        context.project.id,
        context.property.id,
        calibratedFindings.length,
        recommendations.length,
        warnings,
        errors,
        trace
      );

      return {
        moduleId: "universal_interpretation_engine",
        findings: calibratedFindings,
        recommendations,
        logs: trace,
        success: true
      };

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(errMsg);
      trace.push(`[InterpretationEngine] [FATAL] Interrupted execution: ${errMsg}`);

      this.logger.log(
        startTimeMs,
        context.project.id,
        context.property.id,
        0,
        0,
        warnings,
        errors,
        trace
      );

      return {
        moduleId: "universal_interpretation_engine",
        findings: [],
        recommendations: [],
        logs: trace,
        success: false,
        error: errMsg
      };
    }
  }
}
