// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 12: KNOWLEDGE CONTEXT GENERATOR
// Generates canonical spatial cognition context consumed exclusively by Knowledge Stack (KQE/KIE).
// Package:
// Knowledge Ready Spatial Context
// Knowledge Ready Behavior Context
// Knowledge Ready Activity Context
// Knowledge Ready Dependency Context
// Knowledge Ready Narrative Context
// Knowledge Ready Hierarchy Context
// ============================================================================

import { 
  IKnowledgeReadyCognitionContext, 
  ISpatialContextNormalized, 
  ISpatialBehaviorModel, 
  IFunctionalDependencyModel, 
  ISpatialNarrativeModel, 
  ISpatialHierarchyModel 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";
import { IBlueprintSemanticModelV15 } from "../../bsue/types/bsue_v1_5.types";

export class KnowledgeContextGenerator {
  private static instance: KnowledgeContextGenerator;

  private constructor() {}

  public static getInstance(): KnowledgeContextGenerator {
    if (!KnowledgeContextGenerator.instance) {
      KnowledgeContextGenerator.instance = new KnowledgeContextGenerator();
    }
    return KnowledgeContextGenerator.instance;
  }

  public generateKnowledgeContext(
    semanticModel: IBlueprintSemanticModel,
    normalizedContext: ISpatialContextNormalized,
    behaviorModel: ISpatialBehaviorModel,
    dependencyModel: IFunctionalDependencyModel,
    narrativeModel: ISpatialNarrativeModel,
    hierarchyModel: ISpatialHierarchyModel
  ): IKnowledgeReadyCognitionContext {
    const v15Model = semanticModel as IBlueprintSemanticModelV15;

    const knowledgeReadySpatialContext = {
      propertyTaxonomy: v15Model.taxonomy?.propertyType || 'Residential',
      roomsCount: normalizedContext.normalizedRooms.length,
      rooms: normalizedContext.normalizedRooms
    };

    const knowledgeReadyBehaviorContext = {
      behaviorProfilesCount: behaviorModel.behaviorProfiles.length,
      profiles: behaviorModel.behaviorProfiles.map(b => ({
        roomId: b.roomId,
        primaryBehavior: b.primaryBehavior,
        intensity: b.behaviorIntensity
      }))
    };

    const knowledgeReadyActivityContext = {
      activities: normalizedContext.normalizedActivities
    };

    const knowledgeReadyDependencyContext = {
      dependenciesCount: dependencyModel.dependencies.length,
      chains: dependencyModel.standardArchetypeChains
    };

    const knowledgeReadyNarrativeContext = {
      narrativeSummary: narrativeModel.narrativeSummary,
      stepsCount: narrativeModel.narrativeSequence.length
    };

    const knowledgeReadyHierarchyContext = {
      depth: hierarchyModel.totalHierarchyDepth,
      root: hierarchyModel.propertyNode.entityId
    };

    return {
      packageVersion: '1.0.0-SCL-COGNITION',
      propertyId: semanticModel.propertyId || 'PROP_1',
      propertyName: semanticModel.propertyName || 'Property',
      knowledgeReadySpatialContext,
      knowledgeReadyBehaviorContext,
      knowledgeReadyActivityContext,
      knowledgeReadyDependencyContext,
      knowledgeReadyNarrativeContext,
      knowledgeReadyHierarchyContext
    };
  }
}

export const knowledgeContextGenerator = KnowledgeContextGenerator.getInstance();
