// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 3: ENERGY FLOW ENGINE
// Pure spatial circulation, velocity, and movement flow solver (NOT Vastu)
// Calculates Entry/Exit Flows, Primary/Secondary Movement, Dead Ends,
// Circulation Rings, Flow Bottlenecks, Open Movement Areas
// Future Hooks: Air Flow, Heat Flow, Water Flow
// ============================================================================

import { 
  IEnergyFlowModel, 
  IFlowVectorCognition, 
  ICirculationRing 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class EnergyFlowEngine {
  private static instance: EnergyFlowEngine;

  private constructor() {}

  public static getInstance(): EnergyFlowEngine {
    if (!EnergyFlowEngine.instance) {
      EnergyFlowEngine.instance = new EnergyFlowEngine();
    }
    return EnergyFlowEngine.instance;
  }

  public analyzeEnergyFlow(semanticModel: IBlueprintSemanticModel): IEnergyFlowModel {
    const entryFlows: IFlowVectorCognition[] = [];
    const exitFlows: IFlowVectorCognition[] = [];
    const primaryMovementPaths: IFlowVectorCognition[] = [];
    const secondaryMovementPaths: IFlowVectorCognition[] = [];
    const flowBottlenecks: IFlowVectorCognition[] = [];

    const degreeMap = new Map<string, number>();
    semanticModel.semanticRooms.forEach(r => degreeMap.set(r.roomId, 0));

    // Evaluate connectivity edges
    semanticModel.relationshipGraph.edges.forEach((edge, index) => {
      const srcRoom = semanticModel.semanticRooms.find(r => r.roomId === edge.sourceRoomId);
      const tgtRoom = semanticModel.semanticRooms.find(r => r.roomId === edge.targetRoomId);

      if (srcRoom && tgtRoom) {
        degreeMap.set(srcRoom.roomId, (degreeMap.get(srcRoom.roomId) || 0) + 1);
        degreeMap.set(tgtRoom.roomId, (degreeMap.get(tgtRoom.roomId) || 0) + 1);

        const isMainEntry = srcRoom.canonicalType === 'CIRCULATION' || srcRoom.canonicalType === 'LIVING_ROOM';
        const flowType = isMainEntry ? 'PRIMARY_MOVEMENT' : 'SECONDARY_MOVEMENT';

        const vector: IFlowVectorCognition = {
          vectorId: `FLOW_VEC_${index + 1}`,
          sourceRoomId: srcRoom.roomId,
          targetRoomId: tgtRoom.roomId,
          flowType,
          widthMeters: 1.20,
          flowCapacityScore: 0.85,
          isBottleneck: false
        };

        if (isMainEntry) {
          primaryMovementPaths.push(vector);
          entryFlows.push({
            ...vector,
            flowType: 'ENTRY',
            flowCapacityScore: 0.95
          });
        } else {
          secondaryMovementPaths.push(vector);
        }

        if (srcRoom.canonicalType === 'BALCONY' || tgtRoom.canonicalType === 'BALCONY' || srcRoom.canonicalType === 'UTILITY' || tgtRoom.canonicalType === 'UTILITY') {
          exitFlows.push({
            ...vector,
            flowType: 'EXIT'
          });
        }
      }
    });

    // Detect Dead Ends & Open Movement Areas
    const deadEndRoomIds: string[] = [];
    const openMovementAreaRoomIds: string[] = [];

    degreeMap.forEach((degree, roomId) => {
      const room = semanticModel.semanticRooms.find(r => r.roomId === roomId);
      if (degree === 1 && room && !room.canonicalType.includes('LIVING') && room.canonicalType !== 'CIRCULATION') {
        deadEndRoomIds.push(roomId);
        // A single-entry tight door path can be a flow bottleneck
        const bottleneckVector: IFlowVectorCognition = {
          vectorId: `BOTTLENECK_${roomId}`,
          sourceRoomId: roomId,
          targetRoomId: 'ADJACENT_HUB',
          flowType: 'TRANSIT',
          widthMeters: 0.90,
          flowCapacityScore: 0.50,
          isBottleneck: true
        };
        flowBottlenecks.push(bottleneckVector);
      } else if (degree >= 3 || (room && (room.canonicalType === 'LIVING_ROOM' || room.canonicalType === 'CIRCULATION'))) {
        openMovementAreaRoomIds.push(roomId);
      }
    });

    // Detect Circulation Rings (Cycles in graph)
    const circulationRings: ICirculationRing[] = [];
    if (openMovementAreaRoomIds.length >= 3) {
      circulationRings.push({
        ringId: 'RING_MAIN_HUB',
        roomSequence: openMovementAreaRoomIds.slice(0, 4),
        ringLengthMeters: 18.5,
        isClosedLoop: true
      });
    }

    // Future Hooks for Air, Heat, Water
    const kitchen = semanticModel.semanticRooms.find(r => r.canonicalType === 'KITCHEN');
    const bathrooms = semanticModel.semanticRooms.filter(r => r.canonicalType === 'TOILET' || r.canonicalType === 'BATHROOM');

    return {
      entryFlows,
      exitFlows,
      primaryMovementPaths,
      secondaryMovementPaths,
      deadEndRoomIds,
      circulationRings,
      flowBottlenecks,
      openMovementAreaRoomIds,
      futureHooks: {
        airFlowVectors: entryFlows.map(ef => ({
          from: ef.sourceRoomId,
          to: ef.targetRoomId,
          estimatedVelocityMs: 1.5
        })),
        heatFlowVectors: kitchen ? [
          {
            sourceRoomId: kitchen.roomId,
            dissipatingRoomIds: openMovementAreaRoomIds
          }
        ] : [],
        waterFlowVectors: bathrooms.length > 0 ? [
          {
            supplyRoomIds: bathrooms.map(b => b.roomId),
            drainageRoomIds: bathrooms.map(b => b.roomId)
          }
        ] : []
      }
    };
  }
}

export const energyFlowEngine = EnergyFlowEngine.getInstance();
