// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 11: SPATIAL CONTEXT ENGINE
// Universal normalization solver.
// Normalizes Objects, Rooms, Activities, Behaviors, Dependencies, Hierarchy, Narratives.
// ============================================================================

import { 
  ISpatialContextNormalized, 
  ISpatialBehaviorModel, 
  IFunctionalDependencyModel, 
  ISpatialHierarchyModel, 
  ISpatialNarrativeModel 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";
import { IBlueprintSemanticModelV15 } from "../../bsue/types/bsue_v1_5.types";

export class SpatialContextEngine {
  private static instance: SpatialContextEngine;

  private constructor() {}

  public static getInstance(): SpatialContextEngine {
    if (!SpatialContextEngine.instance) {
      SpatialContextEngine.instance = new SpatialContextEngine();
    }
    return SpatialContextEngine.instance;
  }

  public normalizeSpatialContext(
    semanticModel: IBlueprintSemanticModel,
    behaviorModel: ISpatialBehaviorModel,
    dependencyModel: IFunctionalDependencyModel,
    hierarchyModel: ISpatialHierarchyModel,
    narrativeModel: ISpatialNarrativeModel
  ): ISpatialContextNormalized {
    const v15Model = semanticModel as IBlueprintSemanticModelV15;

    // Normalized Rooms
    const normalizedRooms = semanticModel.semanticRooms.map(r => ({
      id: r.roomId,
      name: r.semanticLabel || r.canonicalType,
      type: r.canonicalType,
      areaSqM: Math.round(r.areaSqMeters * 100) / 100,
      perimeterM: Math.round(Math.sqrt(r.areaSqMeters) * 4 * 100) / 100
    }));

    // Normalized Objects
    const normalizedObjects: Array<{ id: string; type: string; roomId: string; boundingBoxSqM: number }> = [];
    (semanticModel.semanticObjects || []).forEach(obj => {
      normalizedObjects.push({
        id: obj.objectId,
        type: obj.canonicalType,
        roomId: obj.roomId,
        boundingBoxSqM: 1.50
      });
    });

    // Normalized Activities
    const normalizedActivities = (v15Model.activityInference?.roomActivities || []).map(a => ({
      roomId: a.roomId,
      primary: a.primaryActivity,
      secondaries: a.secondaryActivities
    }));

    // Normalized Behaviors
    const normalizedBehaviors = behaviorModel.behaviorProfiles.map(b => ({
      roomId: b.roomId,
      behaviors: [b.primaryBehavior, ...b.secondaryBehaviors]
    }));

    // Normalized Dependencies
    const normalizedDependencies = dependencyModel.dependencies.map(d => ({
      from: d.sourceRoomId,
      to: d.targetRoomId,
      type: d.dependencyType
    }));

    // Normalized Hierarchy
    const normalizedHierarchy = hierarchyModel.roomNodes.map(r => ({
      entityId: r.entityId,
      depth: r.depthLevel,
      path: `PROPERTY/${r.parentId}/${r.entityId}`
    }));

    // Normalized Narratives
    const normalizedNarratives = narrativeModel.narrativeSequence.map(s => ({
      step: s.stepIndex,
      room: s.toRoomId,
      transition: s.spatialNarrativeLabel
    }));

    return {
      normalizedObjects,
      normalizedRooms,
      normalizedActivities,
      normalizedBehaviors,
      normalizedDependencies,
      normalizedHierarchy,
      normalizedNarratives
    };
  }
}

export const spatialContextEngine = SpatialContextEngine.getInstance();
