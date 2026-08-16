/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 1 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Foundation & Architecture
 * 
 * UKAContext.ts: Reusable Context Management Class & Functional Utilities.
 */

import {
  UKAPropertyContext,
  UKAPropertyModel,
  UKAClientModel,
  UKAFloorModel,
  UKARecommendationItem
} from "./UKATypes";
import { DecisionChain, PropertyHealthIndex } from "../engines/decision/types";
import { DoshaItem } from "../services/vastuAnalysisOrchestrator";

export class UKAContextManager {
  /**
   * Create an initial empty property context
   */
  public static createInitialContext(): UKAPropertyContext {
    return {
      currentProperty: null,
      currentClient: null,
      currentFloor: null,
      currentEvaluation: null,
      currentFindings: [],
      rawDoshas: [],
      currentRecommendations: [],
      currentActiveModule: "WORKSPACE",
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Immutable update helper for property context
   */
  public static updateContext(
    existingContext: UKAPropertyContext,
    updates: Partial<UKAPropertyContext>
  ): UKAPropertyContext {
    return {
      ...existingContext,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Set active property in context
   */
  public static setProperty(
    existingContext: UKAPropertyContext,
    property: UKAPropertyModel | null
  ): UKAPropertyContext {
    return this.updateContext(existingContext, { currentProperty: property });
  }

  /**
   * Set client profile in context
   */
  public static setClient(
    existingContext: UKAPropertyContext,
    client: UKAClientModel | null
  ): UKAPropertyContext {
    return this.updateContext(existingContext, { currentClient: client });
  }

  /**
   * Set active floor plan in context
   */
  public static setFloor(
    existingContext: UKAPropertyContext,
    floor: UKAFloorModel | null
  ): UKAPropertyContext {
    return this.updateContext(existingContext, { currentFloor: floor });
  }

  /**
   * Set evaluation results & decision chains
   */
  public static setEvaluationResults(
    existingContext: UKAPropertyContext,
    evaluation: PropertyHealthIndex | null,
    chains: DecisionChain[],
    doshas: DoshaItem[] = []
  ): UKAPropertyContext {
    const recommendations: UKARecommendationItem[] = chains.map((c, idx) => ({
      id: c.recommendation.remedyId || `REM-${idx + 1}`,
      findingId: c.findingId,
      title: c.appliedRule.title,
      zone: c.zone,
      remedy: c.recommendation.remedyAction,
      priority: c.recommendation.priority as "HIGH" | "MEDIUM" | "LOW",
      expectedImpact: c.recommendation.expectedImpact,
      implementationEase: c.recommendation.implementationEase
    }));

    return this.updateContext(existingContext, {
      currentEvaluation: evaluation,
      currentFindings: chains,
      rawDoshas: doshas,
      currentRecommendations: recommendations
    });
  }

  /**
   * Set active UI / Engine module location
   */
  public static setActiveModule(
    existingContext: UKAPropertyContext,
    moduleName: string
  ): UKAPropertyContext {
    return this.updateContext(existingContext, { currentActiveModule: moduleName });
  }

  /**
   * Generate a human-scannable summary of current context state
   */
  public static generateContextSummary(context: UKAPropertyContext): string {
    const propName = context.currentProperty ? context.currentProperty.name : "Unassigned Property";
    const clientName = context.currentClient ? context.currentClient.name : "Guest Client";
    const score = context.currentEvaluation ? `${context.currentEvaluation.overallScore}% (${context.currentEvaluation.ratingTier})` : "Unevaluated";
    const findingsCount = context.currentFindings.length;
    const activeMod = context.currentActiveModule;

    return `Property: ${propName} | Client: ${clientName} | Score: ${score} | Findings: ${findingsCount} | Active Module: ${activeMod}`;
  }
}
