// ============================================================================
// URJAFLUX AI OS - INTEGRATED INTELLIGENCE ENGINE (IIE)
// Central Singleton Engine for Master Consultation Synthesis & Remedy Execution
// ============================================================================

import { IIntegratedConsultationPackage } from "../types/iie.types";
import { IntegratedIntelligencePipeline } from "../pipeline/IntegratedIntelligencePipeline";
import { IApplicableKnowledgePackage } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage } from "../../knowledge_confidence/types/kce.types";
import { IConflictResolutionPackage } from "../../conflict_resolution/types/cre.types";
import { IClientContextProfile, ISpatialContextData } from "../../knowledge_intelligence/types/kie.types";

export class IntegratedIntelligenceEngine {
  private static instance: IntegratedIntelligenceEngine;
  private pipeline: IntegratedIntelligencePipeline;

  private constructor() {
    this.pipeline = new IntegratedIntelligencePipeline();
  }

  public static getInstance(): IntegratedIntelligenceEngine {
    if (!IntegratedIntelligenceEngine.instance) {
      IntegratedIntelligenceEngine.instance = new IntegratedIntelligenceEngine();
    }
    return IntegratedIntelligenceEngine.instance;
  }

  /**
   * Generates ONE unified, immutable Integrated Consultation Package from all core inputs
   */
  public generateConsultation(
    kiePackage: IApplicableKnowledgePackage,
    kcePackage: IConfidenceEvaluationPackage,
    crePackage: IConflictResolutionPackage,
    clientContext?: IClientContextProfile,
    spatialOutput?: ISpatialContextData
  ): IIntegratedConsultationPackage {
    return this.pipeline.executeIntegrationPipeline(
      kiePackage,
      kcePackage,
      crePackage,
      clientContext,
      spatialOutput
    );
  }
}

export const integratedIntelligenceEngine = IntegratedIntelligenceEngine.getInstance();
