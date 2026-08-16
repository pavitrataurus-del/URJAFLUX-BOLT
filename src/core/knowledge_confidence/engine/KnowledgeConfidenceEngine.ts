// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE CONFIDENCE EVALUATION ENGINE (KCE)
// Central Singleton Engine evaluating confidence of KIE Intelligence Packages
// ============================================================================

import { 
  IConfidenceEvaluationPackage, 
  IConfidenceEvaluationConfig 
} from "../types/kce.types";
import { ConfidenceEvaluationPipeline } from "../pipeline/ConfidenceEvaluationPipeline";
import { DEFAULT_CONFIDENCE_CONFIG } from "../evaluators/ConfidenceDimensionEvaluator";
import { IApplicableKnowledgePackage } from "../../knowledge_intelligence/types/kie.types";

export class KnowledgeConfidenceEngine {
  private static instance: KnowledgeConfidenceEngine;
  private pipeline: ConfidenceEvaluationPipeline;

  private constructor(config: IConfidenceEvaluationConfig = DEFAULT_CONFIDENCE_CONFIG) {
    this.pipeline = new ConfidenceEvaluationPipeline(config);
  }

  public static getInstance(config?: IConfidenceEvaluationConfig): KnowledgeConfidenceEngine {
    if (!KnowledgeConfidenceEngine.instance) {
      KnowledgeConfidenceEngine.instance = new KnowledgeConfidenceEngine(config);
    }
    return KnowledgeConfidenceEngine.instance;
  }

  /**
   * Evaluates confidence for a Knowledge Intelligence Package (KIE output)
   */
  public evaluateConfidence(
    kiePackage: IApplicableKnowledgePackage
  ): IConfidenceEvaluationPackage {
    return this.pipeline.executeConfidencePipeline(kiePackage);
  }

  /**
   * Reconfigures confidence evaluation weights and thresholds dynamically
   */
  public updateConfig(newConfig: IConfidenceEvaluationConfig): void {
    this.pipeline = new ConfidenceEvaluationPipeline(newConfig);
  }
}

export const knowledgeConfidenceEngine = KnowledgeConfidenceEngine.getInstance();
