import { InterpretationContext } from "./InterpretationTypes";
import { 
  CalculationProject, 
  CalculationProperty, 
  CalculationFloor, 
  CalculationCompass, 
  CalculationSpatialData, 
  KnowledgeReference, 
  TriggeredRule 
} from "../calculation/CalculationTypes";

/**
 * Manager wrapper for InterpretationContext providing a fluent API, validation,
 * and safe read/write access to interpretation attributes.
 */
export class InterpretationContextManager {
  private context: InterpretationContext;

  constructor(initial: Partial<InterpretationContext>) {
    this.context = {
      project: initial.project || {
        id: "DFT-PROJ",
        name: "Standard Interpretation Project",
        code: "SIP",
        status: "ACTIVE"
      },
      property: initial.property || {
        id: "DFT-PROP",
        name: "Standard Property Plot",
        address: "Vedic Corridor Zone 1" ,
        plotSize: "10x15"
      },
      floor: initial.floor,
      compass: initial.compass || {
        northAngle: 0,
        confidence: 1.0
      },
      spatialData: initial.spatialData || {
        rooms: [],
        boundary: []
      },
      triggeredRules: initial.triggeredRules || [],
      calculationResults: initial.calculationResults || {},
      knowledgeReferences: initial.knowledgeReferences || [],
      pluginContext: initial.pluginContext || {},
      variables: initial.variables || {}
    };
  }

  /**
   * Retrieves the raw underlying context.
   */
  public getRaw(): InterpretationContext {
    return this.context;
  }

  /**
   * Safe getter for calculation metrics.
   */
  public getCalculationResult(key: string): number {
    return this.context.calculationResults[key] ?? 0;
  }

  /**
   * Safe getter for custom variables.
   */
  public getVariable(key: string): number {
    return this.context.variables[key] ?? 0;
  }

  /**
   * Safe setter for variables.
   */
  public setVariable(key: string, value: number): void {
    this.context.variables[key] = value;
  }

  /**
   * Registers a triggered rule into the active state.
   */
  public addTriggeredRule(rule: TriggeredRule): void {
    const exists = this.context.triggeredRules.some(r => r.ruleId === rule.ruleId);
    if (!exists) {
      this.context.triggeredRules.push(rule);
    }
  }

  /**
   * Appends scriptural metadata references.
   */
  public addKnowledgeReference(ref: KnowledgeReference): void {
    this.context.knowledgeReferences.push(ref);
  }

  /**
   * Merges custom plugin context data.
   */
  public mergePluginContext(data: Record<string, unknown>): void {
    this.context.pluginContext = {
      ...this.context.pluginContext,
      ...data
    };
  }

  /**
   * Validates correctness of core context parameters before processing.
   */
  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.context.project.id) {
      errors.push("Project must have a valid non-empty identifier.");
    }
    if (!this.context.property.id) {
      errors.push("Property must have a valid non-empty identifier.");
    }
    if (this.context.compass.northAngle < 0 || this.context.compass.northAngle >= 360) {
      errors.push("Compass north angle must be normalized within range [0, 360).");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
