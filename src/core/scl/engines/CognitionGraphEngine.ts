// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 10: COGNITION GRAPH ENGINE
// Unifies all 7 spatial sub-graphs into a single interconnected Cognition Graph
// Sub-graphs: Spatial, Behavior, Interaction, Dependency, Movement, Narrative, Context
// ============================================================================

import { 
  ICognitionGraph, 
  ICognitionGraphNode, 
  ICognitionGraphEdge, 
  ISpatialBehaviorModel, 
  IHumanInteractionModel, 
  IFunctionalDependencyModel, 
  IEnergyFlowModel, 
  ISpatialNarrativeModel 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class CognitionGraphEngine {
  private static instance: CognitionGraphEngine;

  private constructor() {}

  public static getInstance(): CognitionGraphEngine {
    if (!CognitionGraphEngine.instance) {
      CognitionGraphEngine.instance = new CognitionGraphEngine();
    }
    return CognitionGraphEngine.instance;
  }

  public constructCognitionGraph(
    semanticModel: IBlueprintSemanticModel,
    behaviorModel: ISpatialBehaviorModel,
    interactionModel: IHumanInteractionModel,
    dependencyModel: IFunctionalDependencyModel,
    energyFlowModel: IEnergyFlowModel,
    narrativeModel: ISpatialNarrativeModel
  ): ICognitionGraph {
    const nodes: ICognitionGraphNode[] = [];
    const edges: ICognitionGraphEdge[] = [];

    // Add Room Nodes
    semanticModel.semanticRooms.forEach(room => {
      nodes.push({
        id: room.roomId,
        label: room.semanticLabel || room.canonicalType,
        type: 'ROOM',
        attributes: {
          canonicalType: room.canonicalType,
          areaSqM: room.areaSqMeters,
          confidence: room.confidence
        }
      });
    });

    // Add Behavior Nodes & Edges
    behaviorModel.behaviorProfiles.forEach(beh => {
      const behNodeId = `NODE_${beh.behaviorId}`;
      nodes.push({
        id: behNodeId,
        label: beh.primaryBehavior,
        type: 'BEHAVIOR',
        attributes: { intensity: beh.behaviorIntensity, secondaries: beh.secondaryBehaviors }
      });

      edges.push({
        source: beh.roomId,
        target: behNodeId,
        relationship: 'EXHIBITS_BEHAVIOR',
        graphType: 'BEHAVIOR',
        weight: beh.behaviorConfidence
      });
    });

    // Add Spatial Relationship Edges
    semanticModel.relationshipGraph.edges.forEach(edge => {
      edges.push({
        source: edge.sourceRoomId,
        target: edge.targetRoomId,
        relationship: edge.type,
        graphType: 'SPATIAL',
        weight: edge.strengthScore
      });
    });

    // Add Interaction Edges
    interactionModel.interactionEdges.forEach(ie => {
      edges.push({
        source: ie.sourceRoomId,
        target: ie.targetRoomId,
        relationship: ie.interactionType,
        graphType: 'INTERACTION',
        weight: ie.strength
      });
    });

    // Add Dependency Edges
    dependencyModel.dependencies.forEach(dep => {
      edges.push({
        source: dep.sourceRoomId,
        target: dep.targetRoomId,
        relationship: dep.dependencyType,
        graphType: 'DEPENDENCY',
        weight: dep.criticalityScore
      });
    });

    // Add Movement Flow Edges
    energyFlowModel.primaryMovementPaths.concat(energyFlowModel.secondaryMovementPaths).forEach(pf => {
      edges.push({
        source: pf.sourceRoomId,
        target: pf.targetRoomId,
        relationship: pf.flowType,
        graphType: 'MOVEMENT',
        weight: pf.flowCapacityScore
      });
    });

    // Add Narrative Edges
    narrativeModel.narrativeSequence.forEach(ns => {
      if (ns.fromRoomId) {
        edges.push({
          source: ns.fromRoomId,
          target: ns.toRoomId,
          relationship: ns.spatialNarrativeLabel,
          graphType: 'NARRATIVE',
          weight: 0.90
        });
      }
    });

    const spatialGraphEdgeCount = edges.filter(e => e.graphType === 'SPATIAL').length;
    const behaviorGraphEdgeCount = edges.filter(e => e.graphType === 'BEHAVIOR').length;
    const interactionGraphEdgeCount = edges.filter(e => e.graphType === 'INTERACTION').length;
    const dependencyGraphEdgeCount = edges.filter(e => e.graphType === 'DEPENDENCY').length;
    const movementGraphEdgeCount = edges.filter(e => e.graphType === 'MOVEMENT').length;
    const narrativeGraphEdgeCount = edges.filter(e => e.graphType === 'NARRATIVE').length;
    const contextGraphEdgeCount = edges.length;

    return {
      nodes,
      edges,
      subGraphs: {
        spatialGraphEdgeCount,
        behaviorGraphEdgeCount,
        interactionGraphEdgeCount,
        dependencyGraphEdgeCount,
        movementGraphEdgeCount,
        narrativeGraphEdgeCount,
        contextGraphEdgeCount
      }
    };
  }
}

export const cognitionGraphEngine = CognitionGraphEngine.getInstance();
