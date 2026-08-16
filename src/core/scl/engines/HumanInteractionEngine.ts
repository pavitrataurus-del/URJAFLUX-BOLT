// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 4: HUMAN INTERACTION ENGINE
// Models privacy zoning, co-occupancy, and human interaction networks
// Categories: Individual, Shared, Family, Guest, Private, Semi-Private, Public, Service, Utility
// Generates: Interaction Graph
// ============================================================================

import { 
  IHumanInteractionModel, 
  IHumanInteractionNode, 
  IInteractionEdge, 
  SpatialPrivacyClassification 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class HumanInteractionEngine {
  private static instance: HumanInteractionEngine;

  private constructor() {}

  public static getInstance(): HumanInteractionEngine {
    if (!HumanInteractionEngine.instance) {
      HumanInteractionEngine.instance = new HumanInteractionEngine();
    }
    return HumanInteractionEngine.instance;
  }

  public analyzeInteractions(semanticModel: IBlueprintSemanticModel): IHumanInteractionModel {
    const interactionNodes: IHumanInteractionNode[] = [];
    const interactionEdges: IInteractionEdge[] = [];

    const individualRoomIds: string[] = [];
    const sharedRoomIds: string[] = [];
    const familyRoomIds: string[] = [];
    const guestRoomIds: string[] = [];
    const privateRoomIds: string[] = [];
    const semiPrivateRoomIds: string[] = [];
    const publicRoomIds: string[] = [];
    const serviceRoomIds: string[] = [];
    const utilityRoomIds: string[] = [];

    semanticModel.semanticRooms.forEach(room => {
      const type = room.canonicalType;
      const classifications: SpatialPrivacyClassification[] = [];
      let occupancyCapacity = 1;
      let interactionDensityScore = 0.50;

      if (type.includes('BEDROOM')) {
        classifications.push('INDIVIDUAL', 'PRIVATE');
        if (type === 'MASTER_BEDROOM') {
          classifications.push('SHARED', 'FAMILY');
          occupancyCapacity = 2;
        } else if (type === 'GUEST_BEDROOM') {
          classifications.push('GUEST');
          occupancyCapacity = 2;
        }
        individualRoomIds.push(room.roomId);
        privateRoomIds.push(room.roomId);
        if (type === 'GUEST_BEDROOM') guestRoomIds.push(room.roomId);
        if (type === 'MASTER_BEDROOM') familyRoomIds.push(room.roomId);
        interactionDensityScore = 0.30;
      } else if (type === 'TOILET' || type === 'BATHROOM') {
        classifications.push('INDIVIDUAL', 'PRIVATE', 'UTILITY');
        occupancyCapacity = 1;
        individualRoomIds.push(room.roomId);
        privateRoomIds.push(room.roomId);
        utilityRoomIds.push(room.roomId);
        interactionDensityScore = 0.10;
      } else if (type === 'LIVING_ROOM') {
        classifications.push('SHARED', 'FAMILY', 'GUEST', 'PUBLIC');
        occupancyCapacity = 8;
        sharedRoomIds.push(room.roomId);
        familyRoomIds.push(room.roomId);
        guestRoomIds.push(room.roomId);
        publicRoomIds.push(room.roomId);
        interactionDensityScore = 0.95;
      } else if (type === 'DINING_ROOM') {
        classifications.push('SHARED', 'FAMILY', 'GUEST', 'SEMI_PRIVATE');
        occupancyCapacity = 6;
        sharedRoomIds.push(room.roomId);
        familyRoomIds.push(room.roomId);
        guestRoomIds.push(room.roomId);
        semiPrivateRoomIds.push(room.roomId);
        interactionDensityScore = 0.85;
      } else if (type === 'KITCHEN' || type === 'UTILITY' || type === 'STORE_ROOM') {
        classifications.push('SERVICE', 'UTILITY');
        occupancyCapacity = 3;
        serviceRoomIds.push(room.roomId);
        utilityRoomIds.push(room.roomId);
        interactionDensityScore = 0.60;
      } else if (type === 'TEMPLE' || type === 'OFFICE') {
        classifications.push('SEMI_PRIVATE', 'FAMILY');
        occupancyCapacity = 3;
        semiPrivateRoomIds.push(room.roomId);
        familyRoomIds.push(room.roomId);
        interactionDensityScore = 0.40;
      } else {
        classifications.push('SEMI_PRIVATE');
        occupancyCapacity = 2;
        semiPrivateRoomIds.push(room.roomId);
        interactionDensityScore = 0.50;
      }

      interactionNodes.push({
        roomId: room.roomId,
        roomName: room.semanticLabel || room.canonicalType,
        classifications,
        occupancyCapacity,
        interactionDensityScore
      });
    });

    // Edges
    semanticModel.relationshipGraph.edges.forEach(edge => {
      interactionEdges.push({
        sourceRoomId: edge.sourceRoomId,
        targetRoomId: edge.targetRoomId,
        interactionType: 'CO_OCCUPANCY',
        strength: edge.strengthScore
      });
    });

    const nodeIds = interactionNodes.map(n => n.roomId);
    const graphEdges = interactionEdges.map(e => ({
      from: e.sourceRoomId,
      to: e.targetRoomId,
      label: e.interactionType,
      weight: e.strength
    }));

    return {
      interactionNodes,
      interactionEdges,
      interactionGraph: {
        nodes: nodeIds,
        edges: graphEdges
      },
      privacyZoningBreakdown: {
        individualRoomIds,
        sharedRoomIds,
        familyRoomIds,
        guestRoomIds,
        privateRoomIds,
        semiPrivateRoomIds,
        publicRoomIds,
        serviceRoomIds,
        utilityRoomIds
      }
    };
  }
}

export const humanInteractionEngine = HumanInteractionEngine.getInstance();
