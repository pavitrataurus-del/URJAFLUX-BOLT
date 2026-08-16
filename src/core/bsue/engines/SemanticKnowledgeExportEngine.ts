// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENGINE 9: SEMANTIC KNOWLEDGE EXPORT ENGINE
// Prepares canonical export packages for downstream Knowledge Query Engine (KQE),
// Knowledge Inference Engine (KIE), and external enterprise AI consumers.
// MAINTAINS FULL BACKWARD COMPATIBILITY
// ============================================================================

import { 
  ISemanticKnowledgeExportPackage, 
  IPropertyTaxonomy, 
  IHumanFlowAnalysis, 
  ISpatialBehaviorMap, 
  IActivityInferenceSummary 
} from "../types/bsue_v1_5.types";

import { IKnowledgeReadyContext } from "../types/bsue.types";
import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class SemanticKnowledgeExportEngine {
  private static instance: SemanticKnowledgeExportEngine;

  private constructor() {}

  public static getInstance(): SemanticKnowledgeExportEngine {
    if (!SemanticKnowledgeExportEngine.instance) {
      SemanticKnowledgeExportEngine.instance = new SemanticKnowledgeExportEngine();
    }
    return SemanticKnowledgeExportEngine.instance;
  }

  public exportKnowledgePackage(
    knowledgeContext: IKnowledgeReadyContext,
    taxonomy: IPropertyTaxonomy,
    activityInference: IActivityInferenceSummary,
    humanFlow: IHumanFlowAnalysis,
    spatialBehavior: ISpatialBehaviorMap,
    bmueModel: IBlueprintMathematicalModel
  ): ISemanticKnowledgeExportPackage {
    const knowledgeReadyActivities = activityInference.roomActivities.map(act => ({
      roomId: act.roomId,
      primaryActivity: act.primaryActivity,
      secondaryActivities: act.secondaryActivities
    }));

    const knowledgeReadyObjects = bmueModel.containmentGraph.containments.map(obj => ({
      objectId: obj.objectId,
      type: obj.objectType,
      roomId: obj.assignedRoomId
    }));

    return {
      exportVersion: '1.5.0-BSUE-ENTERPRISE',
      timestamp: new Date().toISOString(),
      propertyId: knowledgeContext.propertyId,
      propertyName: knowledgeContext.propertyName,
      knowledgeReadyRooms: knowledgeContext.rooms,
      knowledgeReadyActivities,
      knowledgeReadyObjects,
      knowledgeReadyTaxonomy: taxonomy,
      knowledgeReadyHumanFlow: humanFlow,
      knowledgeReadySpatialBehavior: spatialBehavior
    };
  }
}

export const semanticKnowledgeExportEngine = SemanticKnowledgeExportEngine.getInstance();
