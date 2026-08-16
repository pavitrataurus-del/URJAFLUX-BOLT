// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE INTELLIGENCE ENGINE (KIE)
// Central Engine transforming Vault Knowledge into Client-Applicable Knowledge
// ============================================================================

import { 
  IClientContextProfile, 
  ISpatialContextData, 
  IApplicableKnowledgePackage, 
  IKieEvaluationSession,
  KnowledgeDomain 
} from "../types/kie.types";
import { KnowledgeApplicationPipeline } from "../pipeline/KnowledgeApplicationPipeline";
import { IKqeQueryResultPackage } from "../../knowledge_query/types/kqe.types";
import { KnowledgeQueryEngine } from "../../knowledge_query/engine/KnowledgeQueryEngine";

export class KnowledgeIntelligenceEngine {
  private static instance: KnowledgeIntelligenceEngine;
  private pipeline = new KnowledgeApplicationPipeline();
  private queryEngine = KnowledgeQueryEngine.getInstance();

  private constructor() {}

  public static getInstance(): KnowledgeIntelligenceEngine {
    if (!KnowledgeIntelligenceEngine.instance) {
      KnowledgeIntelligenceEngine.instance = new KnowledgeIntelligenceEngine();
    }
    return KnowledgeIntelligenceEngine.instance;
  }

  /**
   * Main Entrypoint: Applies Founder-approved Knowledge Vault records to Client and Spatial Context
   */
  public evaluateApplicableKnowledge(
    clientContext: IClientContextProfile,
    spatialContext: ISpatialContextData,
    queryPackage?: IKqeQueryResultPackage,
    session?: IKieEvaluationSession
  ): IApplicableKnowledgePackage {

    // If query package is not provided, generate default query package via Knowledge Query Engine
    const activeQueryPackage = queryPackage || this.queryEngine.executeCompoundQuery({
      direction: spatialContext.direction,
      zone: spatialContext.zone,
      room: spatialContext.roomType,
      objectType: spatialContext.objectType,
      element: spatialContext.element,
      planet: spatialContext.planet,
      chakra: spatialContext.chakra,
      activity: spatialContext.activity
    });

    return this.pipeline.executeApplicationPipeline(
      clientContext,
      spatialContext,
      activeQueryPackage,
      session
    );
  }

  /**
   * Multi-Domain Evaluation Shortcut: Evaluates specific domains or all active domains
   */
  public evaluateMultiDomainKnowledge(
    clientContext: IClientContextProfile,
    spatialContext: ISpatialContextData,
    domains: KnowledgeDomain[] = ['Vastu', 'LalKitab', 'Numerology', 'Astrology']
  ): IApplicableKnowledgePackage {
    const session: IKieEvaluationSession = {
      sessionId: `MULTIDOM-SESS-${Date.now()}`,
      evaluationTimestamp: new Date().toISOString(),
      activeDomains: domains
    };

    return this.evaluateApplicableKnowledge(clientContext, spatialContext, undefined, session);
  }
}

export const knowledgeIntelligenceEngine = KnowledgeIntelligenceEngine.getInstance();
