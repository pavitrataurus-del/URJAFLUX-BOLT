import {
  RuleDefinition,
  RuleContext,
  RuleExecutionResult,
  IKnowledgePlugin,
  FormulaExecutor,
  IFormulaRegistry
} from "../../types/ruleEngine";
import { ConditionEvaluator, getNestedValue } from "./ConditionEngine";
import { PluginRegistry } from "./PluginRegistry";
import { RuleRegistry } from "./RuleRegistry";
import { ConflictResolver, ResolutionOutcome } from "./ConflictResolver";
import { ExecutionLogger } from "./ExecutionLogger";

/**
 * Concrete implementation of the IFormulaRegistry interface
 */
export class FormulaRegistry implements IFormulaRegistry {
  private formulas = new Map<string, FormulaExecutor>();

  public register(executor: FormulaExecutor): void {
    if (!executor.formulaId) {
      throw new Error("[URJAFLUX AI OS] Formula Executor must specify a valid formulaId.");
    }
    this.formulas.set(executor.formulaId, executor);
  }

  public get(formulaId: string): FormulaExecutor | undefined {
    return this.formulas.get(formulaId);
  }

  public has(formulaId: string): boolean {
    return this.formulas.has(formulaId);
  }

  public clear(): void {
    this.formulas.clear();
  }
}

export interface RuleEngineOptions {
  pluginRegistry?: PluginRegistry;
  ruleRegistry?: RuleRegistry;
  formulaRegistry?: FormulaRegistry;
  conflictResolver?: ConflictResolver;
  logger?: ExecutionLogger;
}

/**
 * Enterprise universal Rule Engine capable of executing declarative rules
 * for Vastu, Lal Kitab, Numerology, etc.
 */
export class RuleEngine {
  public readonly pluginRegistry: PluginRegistry;
  public readonly ruleRegistry: RuleRegistry;
  public readonly formulaRegistry: FormulaRegistry;
  public readonly conflictResolver: ConflictResolver;
  public readonly logger: ExecutionLogger;

  constructor(options: RuleEngineOptions = {}) {
    this.pluginRegistry = options.pluginRegistry || new PluginRegistry();
    this.ruleRegistry = options.ruleRegistry || new RuleRegistry();
    this.formulaRegistry = options.formulaRegistry || new FormulaRegistry();
    this.conflictResolver = options.conflictResolver || new ConflictResolver();
    this.logger = options.logger || new ExecutionLogger();
  }

  /**
   * Registers a knowledge plugin, importing its rules, formulas, and registering them
   */
  public registerPlugin(plugin: IKnowledgePlugin): void {
    // 1. Register with plugin registry
    this.pluginRegistry.register(plugin);

    // 2. Register rules with central rule registry
    this.ruleRegistry.registerBulk(plugin.rules);

    // 3. Register formulas with central formula registry
    for (const formula of plugin.formulas) {
      this.formulaRegistry.register(formula);
    }
  }

  /**
   * Evaluates a single rule in the execution pipeline:
   * Context -> Condition Check -> Formula -> Evidence -> Result -> Recommendation -> Explanation
   */
  public async evaluateRule(
    rule: RuleDefinition,
    context: RuleContext
  ): Promise<RuleExecutionResult> {
    const startTime = performance.now();
    let status: "SUCCESS" | "ERROR" = "SUCCESS";
    let matched = false;
    let errorDetails: string | undefined;

    // We clone calculatedValues and pluginVariables to avoid mutating original context in place
    const enrichedContext: RuleContext = {
      ...context,
      calculatedValues: { ...context.calculatedValues },
      pluginVariables: { ...context.pluginVariables }
    };

    try {
      // Step 1: Execute Formulas associated with the rule
      // "Rules never calculate directly. Rules call Formula Executors."
      for (const formulaId of rule.formulaIds) {
        const executor = this.formulaRegistry.get(formulaId);
        if (executor) {
          const result = executor.execute(enrichedContext);
          // Store formula calculation output in calculatedValues so they can be referenced in conditions
          enrichedContext.calculatedValues[formulaId] = result;
        } else {
          console.warn(`[URJAFLUX AI OS] Formula executor "${formulaId}" referenced by rule "${rule.id}" is not registered.`);
        }
      }

      // Step 2: Condition Check
      if (rule.conditions) {
        matched = ConditionEvaluator.evaluate(rule.conditions, enrichedContext);
      } else {
        // Rules without conditions match unconditionally
        matched = true;
      }
    } catch (err: any) {
      status = "ERROR";
      errorDetails = err?.message || String(err);
      console.error(`[URJAFLUX AI OS] Error evaluating rule "${rule.id}":`, err);
    }

    // Step 3: Evidence Strength & Confidence
    // Calculate the overall confidence score based on associated evidence sources
    let evidenceStrength = 0.5; // default fallback weight
    if (rule.evidenceIds.length > 0) {
      // In production, we'd look up each evidence ID in a source registry
      // Let's model a deterministic strength calculation based on evidence weight mapping
      evidenceStrength = Math.min(0.5 + rule.evidenceIds.length * 0.15, 1.0);
    }

    // Step 4: Template Compile for dynamic Explanation, Recommendation, and Warnings
    const explanation = matched
      ? this.compileTemplate(rule.explanationTemplate || `Rule "${rule.name}" matches the target conditions.`, enrichedContext)
      : `Rule "${rule.name}" condition is not met.`;

    const recommendations = matched && rule.recommendationsTemplate
      ? rule.recommendationsTemplate.map(t => this.compileTemplate(t, enrichedContext))
      : [];

    const warnings = matched && rule.warningsTemplate
      ? rule.warningsTemplate.map(t => this.compileTemplate(t, enrichedContext))
      : [];

    const durationMs = performance.now() - startTime;

    // Create execution result object
    const result: RuleExecutionResult = {
      ruleId: rule.id,
      pluginId: rule.pluginId,
      status,
      matched,
      confidence: evidenceStrength,
      severity: rule.severity,
      explanation,
      evidence: {
        evidenceIds: rule.evidenceIds,
        strength: evidenceStrength
      },
      recommendations,
      warnings,
      errorDetails,
      timestamp: new Date().toISOString()
    };

    // Step 5: Log the execution result
    await this.logger.log({
      timestamp: result.timestamp,
      pluginId: rule.pluginId,
      ruleId: rule.id,
      durationMs,
      outcome: status === "ERROR" ? "ERROR" : matched ? "MATCHED" : "NOT_MATCHED",
      details: errorDetails || `Explanation: ${explanation.substring(0, 80)}...`
    });

    return result;
  }

  /**
   * Executes all active rules across all registered plugins or selected plugins
   */
  public async execute(
    context: RuleContext,
    targetPluginIds?: string[]
  ): Promise<{
    results: RuleExecutionResult[];
    conflictOutcomes: ResolutionOutcome[];
  }> {
    const activePlugins = this.pluginRegistry.getAll().filter(plugin => {
      if (targetPluginIds && !targetPluginIds.includes(plugin.metadata.id)) {
        return false;
      }
      return true;
    });

    // 1. Context validation per active plugin
    for (const plugin of activePlugins) {
      if (plugin.validateContext) {
        const validation = plugin.validateContext(context);
        if (!validation.isValid) {
          throw new Error(
            `[URJAFLUX AI OS] Context validation failed for plugin "${plugin.metadata.id}": ${validation.errors.join(", ")}`
          );
        }
      }
    }

    // 2. Load and evaluate active rules in parallel
    const activeRules: RuleDefinition[] = [];
    const ruleMap = new Map<string, RuleDefinition>();
    const pluginMap = new Map<string, IKnowledgePlugin>();

    for (const plugin of activePlugins) {
      pluginMap.set(plugin.metadata.id, plugin);
      for (const rule of plugin.rules) {
        if (rule.status === "ACTIVE") {
          activeRules.push(rule);
          ruleMap.set(rule.id, rule);
        }
      }
    }

    const rawResults = await Promise.all(
      activeRules.map(rule => this.evaluateRule(rule, context))
    );

    // 3. Resolve contradictions through the conflict resolver
    const { resolvedResults, outcomes } = this.conflictResolver.resolveConflicts(
      rawResults,
      ruleMap,
      pluginMap
    );

    return {
      results: resolvedResults,
      conflictOutcomes: outcomes
    };
  }

  /**
   * Compiles dynamic values into mustache-style placeholders inside strings
   */
  private compileTemplate(template: string, context: RuleContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const val = getNestedValue(context, path.trim());
      if (val === undefined || val === null) return match;
      if (typeof val === "object") return JSON.stringify(val);
      return String(val);
    });
  }
}
