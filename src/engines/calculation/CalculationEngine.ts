import { CalculationRegistry } from "./CalculationRegistry";
import { CalculationLogger } from "./CalculationLogger";
import { CalculationContext, CalculationModuleResult, CalculationLog } from "./CalculationTypes";

/**
 * Universal Calculation Engine.
 * Orchestrates multi-module formula pipelines, executing standard and custom Vedic, 
 * architectural, and astrological computations while logging exact diagnostics.
 */
export class CalculationEngine {
  public readonly registry: CalculationRegistry;
  public readonly logger: CalculationLogger;

  constructor(registry?: CalculationRegistry, logger?: CalculationLogger) {
    this.registry = registry || new CalculationRegistry();
    this.logger = logger || new CalculationLogger();
  }

  /**
   * Executes a list of registered calculation modules on the provided context.
   * If moduleIds is omitted, runs all pre-loaded standard modules sequentially.
   * 
   * @returns Record of all successfully calculated variables.
   */
  public run(context: CalculationContext, moduleIds?: string[]): Record<string, number> {
    const startTimeMs = performance.now();
    
    // Default to running all registered modules if none are specified
    const activeModuleIds = moduleIds && moduleIds.length > 0
      ? moduleIds
      : this.registry.getAll().map(m => m.moduleId);

    const trace: string[] = [];
    const errors: string[] = [];
    const variables: Record<string, number> = {};

    trace.push(`[CalculationEngine] Starting calculations for Project ID: "${context.project.id}"`);

    let overallSuccess = true;

    for (const moduleId of activeModuleIds) {
      const module = this.registry.get(moduleId);
      
      if (!module) {
        const msg = `Module with ID "${moduleId}" is not registered.`;
        errors.push(msg);
        trace.push(`[CalculationEngine] [WARN] ${msg}`);
        overallSuccess = false;
        continue;
      }

      trace.push(`[CalculationEngine] Triggering execution for Module: "${moduleId}" (${module.name})`);
      
      const result = module.execute(context);
      
      // Gather calculated values from this module run
      Object.assign(variables, result.variables);
      trace.push(...result.logs);

      if (!result.success) {
        overallSuccess = false;
        if (result.error) {
          errors.push(`[Module:${moduleId}] ${result.error}`);
        }
      }
    }

    trace.push(`[CalculationEngine] Finished execution pipeline. Total resolved variables: ${Object.keys(variables).length}`);

    // Log the entire run transaction
    this.logger.log(
      startTimeMs,
      {
        projectId: context.project.id,
        propertyId: context.property.id,
        moduleIds: activeModuleIds
      },
      {
        variables,
        success: overallSuccess
      },
      errors,
      trace
    );

    return variables;
  }
}
