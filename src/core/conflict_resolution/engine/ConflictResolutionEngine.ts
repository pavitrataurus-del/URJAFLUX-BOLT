// ============================================================================
// URJAFLUX AI OS - CONFLICT RESOLUTION ENGINE (CRE)
// Central Singleton Engine for Conflict Detection, Classification & Intellectual Honesty
// ============================================================================

import { IConflictResolutionPackage } from "../types/cre.types";
import { ConflictResolutionPipeline } from "../pipeline/ConflictResolutionPipeline";
import { IApplicableKnowledgePackage } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage } from "../../knowledge_confidence/types/kce.types";

export class ConflictResolutionEngine {
  private static instance: ConflictResolutionEngine;
  private pipeline: ConflictResolutionPipeline;

  private constructor() {
    this.pipeline = new ConflictResolutionPipeline();
  }

  public static getInstance(): ConflictResolutionEngine {
    if (!ConflictResolutionEngine.instance) {
      ConflictResolutionEngine.instance = new ConflictResolutionEngine();
    }
    return ConflictResolutionEngine.instance;
  }

  /**
   * Processes KIE Knowledge Intelligence Package and KCE Confidence Evaluation Package
   * to produce an immutable, auditable Conflict Resolution Package.
   */
  public evaluateConflicts(
    kiePackage: IApplicableKnowledgePackage,
    kcePackage: IConfidenceEvaluationPackage
  ): IConflictResolutionPackage {
    return this.pipeline.executeConflictPipeline(kiePackage, kcePackage);
  }
}

export const conflictResolutionEngine = ConflictResolutionEngine.getInstance();
