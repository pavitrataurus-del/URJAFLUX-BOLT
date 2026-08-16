import {
  CalculationModule,
  CalculationContext,
  CalculationModuleResult,
  FormulaDefinition
} from "./CalculationTypes";
import { FormulaExecutor } from "./FormulaExecutor";

/**
 * Concrete implementation of the standard declarative calculation module.
 * Feeds formulas sequentially to support chain calculations dynamically.
 */
export class StandardCalculationModule implements CalculationModule {
  constructor(
    public readonly moduleId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: CalculationModule["category"],
    public readonly formulas: FormulaDefinition[]
  ) {}

  public execute(context: CalculationContext): CalculationModuleResult {
    const logs: string[] = [];
    const variables: Record<string, number> = {};

    logs.push(`[StandardCalculationModule:${this.moduleId}] Commencing execution of ${this.formulas.length} formulas.`);

    try {
      for (const formula of this.formulas) {
        logs.push(`[StandardCalculationModule:${this.moduleId}] Executing formula: ${formula.id} (Type: ${formula.type})`);
        
        // Execute the formula using our FormulaExecutor
        const resultValue = FormulaExecutor.execute(formula, context);
        
        variables[formula.outputKey] = resultValue;
        
        // Chain support: Feed the result immediately back into the active context's variables
        context.variables[formula.outputKey] = resultValue;
        
        logs.push(`[StandardCalculationModule:${this.moduleId}] Solved variable "${formula.outputKey}" = ${resultValue}`);
      }

      return {
        moduleId: this.moduleId,
        success: true,
        variables,
        logs
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logs.push(`[StandardCalculationModule:${this.moduleId}] Fatal execution interruption: ${errMsg}`);
      return {
        moduleId: this.moduleId,
        success: false,
        variables,
        logs,
        error: errMsg
      };
    }
  }
}

/**
 * Registry class to register, retrieve, and execute analytical calculation modules.
 * Pre-loads standard modules: Spatial Area, Room Dimensions, Directional Ratios, Numerology, and Energy Scores.
 */
export class CalculationRegistry {
  private modules = new Map<string, CalculationModule>();

  constructor() {
    this.registerBuiltInModules();
  }

  /**
   * Registers a new calculation module.
   */
  public register(module: CalculationModule): void {
    if (this.modules.has(module.moduleId)) {
      throw new Error(`[CalculationRegistry] Module with ID "${module.moduleId}" is already registered.`);
    }
    this.modules.set(module.moduleId, module);
  }

  /**
   * Safe lookup for standard or custom registered modules.
   */
  public get(moduleId: string): CalculationModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Lists all registered modules.
   */
  public getAll(): CalculationModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Clears the registry (useful for testing or hot reloading setups).
   */
  public clear(): void {
    this.modules.clear();
  }

  private registerBuiltInModules(): void {
    // 1. Spatial Area Module
    this.register(
      new StandardCalculationModule(
        "spatial_area",
        "Spatial Area Calculator",
        "Computes basic plots, boundaries, and composite floor areas.",
        "SPATIAL_AREA",
        [
          {
            id: "FORMULA-PLOT-WIDTH",
            type: "CUSTOM",
            expression: "plotWidth",
            inputs: ["plotWidth"],
            outputKey: "plotWidth"
          },
          {
            id: "FORMULA-PLOT-LENGTH",
            type: "CUSTOM",
            expression: "plotLength",
            inputs: ["plotLength"],
            outputKey: "plotLength"
          },
          {
            id: "FORMULA-COMPUTE-AREA",
            type: "ARITHMETIC",
            expression: "plotWidth * plotLength",
            inputs: ["plotWidth", "plotLength"],
            outputKey: "plotArea"
          }
        ]
      )
    );

    // 2. Room Dimensions Module
    this.register(
      new StandardCalculationModule(
        "room_dimensions",
        "Room Dimensions Metrics",
        "Resolves spatial widths, lengths, and heights for matched floor elements.",
        "ROOM_DIMENSIONS",
        [
          {
            id: "FORMULA-KITCHEN-DIMENSIONS",
            type: "CUSTOM",
            expression: "kitchen",
            inputs: ["kitchen"],
            outputKey: "kitchenArea"
          },
          {
            id: "FORMULA-BEDROOM-DIMENSIONS",
            type: "CUSTOM",
            expression: "bedroom",
            inputs: ["bedroom"],
            outputKey: "bedroomArea"
          }
        ]
      )
    );

    // 3. Directional Ratios Module
    this.register(
      new StandardCalculationModule(
        "directional_ratios",
        "Directional Aspect Ratios",
        "Validates length/width proportions against traditional Golden and Sacred standards.",
        "DIRECTIONAL_RATIOS",
        [
          {
            id: "FORMULA-ASPECT-RATIO",
            type: "RATIO",
            expression: "plotLength / plotWidth",
            inputs: ["plotLength", "plotWidth"],
            outputKey: "plotAspectRatio",
            config: {
              target: 1.618,
              tolerance: 0.15,
              checkProximity: false
            }
          }
        ]
      )
    );

    // 4. Numerology (Vedic Ayadi Shastras) Module
    this.register(
      new StandardCalculationModule(
        "numerology",
        "Vedic Ayadi Numerology",
        "Evaluates traditional energetic proportions: Yoni, Aya, Vyaya.",
        "NUMEROLOGY",
        [
          {
            id: "FORMULA-AYADI-YONI",
            type: "CUSTOM",
            expression: "AYADI_YONI",
            inputs: ["plotArea"],
            outputKey: "ayadiYoniValue"
          },
          {
            id: "FORMULA-AYADI-AYA",
            type: "CUSTOM",
            expression: "AYADI_AYA",
            inputs: ["plotArea"],
            outputKey: "ayadiAyaValue"
          },
          {
            id: "FORMULA-AYADI-VYAYA",
            type: "CUSTOM",
            expression: "AYADI_VYAYA",
            inputs: ["plotArea"],
            outputKey: "ayadiVyayaValue"
          }
        ]
      )
    );

    // 5. Energy Scores & Weighted Evaluations Module
    this.register(
      new StandardCalculationModule(
        "energy_scores",
        "Vedic Spatial Energy Scores",
        "Synthesizes structural and astrological factors into integrated energy rating indices.",
        "ENERGY_SCORES",
        [
          {
            id: "FORMULA-VAASTU-SCORE",
            type: "WEIGHTED_SCORE",
            expression: "score_weights",
            inputs: ["ayadiYoniValue", "plotAspectRatio"],
            outputKey: "integratedEnergyRating",
            config: {
              weights: {
                ayadiYoniValue: 0.6,
                plotAspectRatio: 0.4
              }
            }
          }
        ]
      )
    );
  }
}
