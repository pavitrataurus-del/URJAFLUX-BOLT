import {
  CalculationContext,
  CalculationProject,
  CalculationProperty,
  CalculationFloor,
  CalculationCompass,
  CalculationSpatialData,
  KnowledgeReference,
  TriggeredRule
} from "./CalculationTypes";

/**
 * Manager class wrapping CalculationContext to provide type-safe utility functions,
 * validation, and state modification support for calculations.
 */
export class CalculationContextManager {
  private context: CalculationContext;

  constructor(initial: Partial<CalculationContext>) {
    this.context = {
      project: initial.project || {
        id: "DFT-PROJ",
        name: "Standard Blueprint Project",
        code: "SBP",
        status: "ACTIVE"
      },
      property: initial.property || {
        id: "DFT-PROP",
        name: "Standard Plot",
        address: "Vedic Corridor Zone 1",
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
      knowledgeReferences: initial.knowledgeReferences || [],
      triggeredRules: initial.triggeredRules || [],
      pluginContext: initial.pluginContext || {},
      variables: initial.variables || {}
    };
  }

  /**
   * Retrieves the underlying raw CalculationContext object.
   */
  public getRaw(): CalculationContext {
    return this.context;
  }

  /**
   * Safe access to calculated numeric variables.
   */
  public getVariable(key: string): number {
    return this.context.variables[key] ?? 0;
  }

  /**
   * Registers a newly calculated variable.
   */
  public setVariable(key: string, value: number): void {
    this.context.variables[key] = value;
  }

  /**
   * Adds triggered rule execution facts to the context.
   */
  public addTriggeredRule(rule: TriggeredRule): void {
    const exists = this.context.triggeredRules.some(r => r.ruleId === rule.ruleId);
    if (!exists) {
      this.context.triggeredRules.push(rule);
    }
  }

  /**
   * Appends dynamic scriptural citations to context references.
   */
  public addKnowledgeReference(ref: KnowledgeReference): void {
    this.context.knowledgeReferences.push(ref);
  }

  /**
   * Merges custom third-party plugin data safely.
   */
  public mergePluginContext(data: Record<string, unknown>): void {
    this.context.pluginContext = {
      ...this.context.pluginContext,
      ...data
    };
  }

  /**
   * Validates that essential coordinate geometry arrays are properly structured.
   */
  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.context.compass.northAngle < 0 || this.context.compass.northAngle >= 360) {
      errors.push("Compass North angle deviation must be between 0 and 359.99 degrees.");
    }

    this.context.spatialData.rooms.forEach(room => {
      if (room.polygon && room.polygon.length > 0 && room.polygon.length < 3) {
        errors.push(`Room "${room.name}" (${room.id}) polygon has fewer than 3 coordinates, making a spatial shape impossible.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
