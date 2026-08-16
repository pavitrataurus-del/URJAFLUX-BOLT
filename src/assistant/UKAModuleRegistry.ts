/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 1 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Foundation & Architecture
 * 
 * UKAModuleRegistry.ts: Integration Module Registry for Cross-Engine Interoperability.
 */

import { UKAPropertyContext } from "./UKATypes";

export type UKAEngineModuleId =
  | "RECOGNITION_ENGINE"
  | "PROCEDURAL_RULE_ENGINE"
  | "DECISION_ENGINE"
  | "PROPERTY_HEALTH_ENGINE"
  | "CONSULTANT_SUITE"
  | "WORKSPACE";

export interface IUKAEngineModule {
  moduleId: UKAEngineModuleId;
  moduleName: string;
  version: string;
  status: "ACTIVE" | "INACTIVE" | "DEGRADED";
  capabilities: string[];
  queryModuleState: (context: UKAPropertyContext) => Record<string, unknown>;
}

export class UKAModuleRegistry {
  private static modules: Map<UKAEngineModuleId, IUKAEngineModule> = new Map();

  /**
   * Register an engine module adapter into UKA Architecture
   */
  public static registerModule(module: IUKAEngineModule): void {
    this.modules.set(module.moduleId, module);
  }

  /**
   * Get registered module by ID
   */
  public static getModule(moduleId: UKAEngineModuleId): IUKAEngineModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * List all registered module descriptors
   */
  public static listModules(): Array<{
    moduleId: UKAEngineModuleId;
    moduleName: string;
    version: string;
    status: string;
    capabilities: string[];
  }> {
    return Array.from(this.modules.values()).map((m) => ({
      moduleId: m.moduleId,
      moduleName: m.moduleName,
      version: m.version,
      status: m.status,
      capabilities: m.capabilities
    }));
  }

  /**
   * Initialize standard engine module stubs to establish integration contracts
   */
  public static initializeDefaultRegistry(): void {
    if (this.modules.size > 0) return; // Already initialized

    this.registerModule({
      moduleId: "RECOGNITION_ENGINE",
      moduleName: "Urjaflux Recognition Engine",
      version: "3.2.0",
      status: "ACTIVE",
      capabilities: ["CAD Geometry Polygon Mapping", "OCR Label Extraction", "Entity Identification"],
      queryModuleState: (ctx) => ({
        activeFloor: ctx.currentFloor?.levelName || "None",
        polygonCount: ctx.currentFloor?.entitiesCount || 0
      })
    });

    this.registerModule({
      moduleId: "PROCEDURAL_RULE_ENGINE",
      moduleName: "Urjaflux Procedural Rule Engine",
      version: "3.2.0",
      status: "ACTIVE",
      capabilities: ["88+ Vastu Shastra Rules", "4 Sacred Canon Citations", "Zone Vector Math"],
      queryModuleState: (ctx) => ({
        doshasEvaluated: ctx.rawDoshas.length
      })
    });

    this.registerModule({
      moduleId: "DECISION_ENGINE",
      moduleName: "Urjaflux Decision & EDI Engine",
      version: "3.2.0",
      status: "ACTIVE",
      capabilities: ["15-Stage Decision Evidence Chains", "6-Core 'WHY?' Answers", "Severity Math"],
      queryModuleState: (ctx) => ({
        decisionChainsCount: ctx.currentFindings.length
      })
    });

    this.registerModule({
      moduleId: "PROPERTY_HEALTH_ENGINE",
      moduleName: "Property Health Evaluator",
      version: "3.2.0",
      status: "ACTIVE",
      capabilities: ["8 Sub-Indices", "Multi-Dimensional Score Trace", "Rating Tier Calculation"],
      queryModuleState: (ctx) => ({
        overallScore: ctx.currentEvaluation?.overallScore || 0,
        ratingTier: ctx.currentEvaluation?.ratingTier || "UNASSESSED"
      })
    });

    this.registerModule({
      moduleId: "CONSULTANT_SUITE",
      moduleName: "Consultant Suite & Audit Tools",
      version: "3.2.0",
      status: "ACTIVE",
      capabilities: ["Founder Audit Mode", "Custom Remedy Override", "Client Dossier Export"],
      queryModuleState: (ctx) => ({
        recommendationsCount: ctx.currentRecommendations.length
      })
    });

    this.registerModule({
      moduleId: "WORKSPACE",
      moduleName: "Urjaflux Interactive Workspace",
      version: "3.2.0",
      status: "ACTIVE",
      capabilities: ["Floor Plan Canvas", "North Needle Calibration", "Spatial Grid Rendering"],
      queryModuleState: (ctx) => ({
        currentActiveModule: ctx.currentActiveModule
      })
    });
  }
}

// Auto-initialize default registry contracts
UKAModuleRegistry.initializeDefaultRegistry();
