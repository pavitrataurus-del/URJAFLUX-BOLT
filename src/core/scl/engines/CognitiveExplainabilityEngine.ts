// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 13: COGNITIVE EXPLAINABILITY ENGINE
// Explainability engine for every cognitive spatial decision
// Provides explicit Why, Evidence, Geometry, Objects, Relationships,
// Activities, Dependencies, Confidence, and Unknown Factors
// ============================================================================

import { 
  ICognitiveExplainabilityModel, 
  ICognitiveDecisionExplanation, 
  ISpatialBehaviorModel, 
  IFunctionalDependencyModel 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";
import { IBlueprintSemanticModelV15 } from "../../bsue/types/bsue_v1_5.types";

export class CognitiveExplainabilityEngine {
  private static instance: CognitiveExplainabilityEngine;

  private constructor() {}

  public static getInstance(): CognitiveExplainabilityEngine {
    if (!CognitiveExplainabilityEngine.instance) {
      CognitiveExplainabilityEngine.instance = new CognitiveExplainabilityEngine();
    }
    return CognitiveExplainabilityEngine.instance;
  }

  public explainCognition(
    semanticModel: IBlueprintSemanticModel,
    behaviorModel: ISpatialBehaviorModel,
    dependencyModel: IFunctionalDependencyModel
  ): ICognitiveExplainabilityModel {
    const v15Model = semanticModel as IBlueprintSemanticModelV15;
    const explanations: ICognitiveDecisionExplanation[] = [];
    let unresolvedFactorsCount = 0;

    semanticModel.semanticRooms.forEach(room => {
      const beh = behaviorModel.behaviorProfiles.find(b => b.roomId === room.roomId);
      const roomAct = v15Model.activityInference?.roomActivities?.find(a => a.roomId === room.roomId);
      const roomDeps = dependencyModel.dependencies.filter(d => d.sourceRoomId === room.roomId || d.targetRoomId === room.roomId);
      const connectedEdges = semanticModel.relationshipGraph.edges.filter(e => e.sourceRoomId === room.roomId || e.targetRoomId === room.roomId);

      const unknownFactors: string[] = [];
      if (room.isAmbiguous) {
        unknownFactors.push('Ambiguous room polygon classification score.');
        unresolvedFactorsCount++;
      }

      const containedObjs = v15Model.knowledgeReadyContext?.rooms?.find(r => r.roomId === room.roomId)?.containedObjects || [];

      explanations.push({
        entityId: room.roomId,
        decisionType: `SPATIAL_COGNITION_${room.canonicalType}`,
        why: `Room classified as ${room.canonicalType} exhibiting primary behavior '${beh?.primaryBehavior || 'TRANSITION'}' based on multi-source spatial fusion.`,
        evidence: {
          geometry: `Footprint polygon area ${room.areaSqMeters}m² with centroid (${room.centroid.x}, ${room.centroid.y})`,
          objects: containedObjs,
          relationships: connectedEdges.map(e => e.description),
          activities: roomAct ? [roomAct.primaryActivity, ...roomAct.secondaryActivities] : ['GENERAL_OCCUPANCY'],
          dependencies: roomDeps.map(d => d.description)
        },
        confidence: room.confidence,
        unknownFactors
      });
    });

    let totalConf = 0;
    semanticModel.semanticRooms.forEach(r => totalConf += r.confidence);
    const avgConf = semanticModel.semanticRooms.length > 0 ? totalConf / semanticModel.semanticRooms.length : 0.95;

    return {
      explanations,
      overallCognitionConfidence: Math.round(avgConf * 100) / 100,
      unresolvedFactorsCount
    };
  }
}

export const cognitiveExplainabilityEngine = CognitiveExplainabilityEngine.getInstance();
