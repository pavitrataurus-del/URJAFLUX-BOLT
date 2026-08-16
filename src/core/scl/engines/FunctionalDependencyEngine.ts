// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 5: FUNCTIONAL DEPENDENCY ENGINE
// Evaluates architectural service & functional dependencies between spaces
// Chains: Kitchen -> Dining -> Living; Bedroom -> Toilet -> Wardrobe; Store -> Kitchen
// Generates: Dependency Graph
// ============================================================================

import { 
  IFunctionalDependencyModel, 
  IFunctionalDependency 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class FunctionalDependencyEngine {
  private static instance: FunctionalDependencyEngine;

  private constructor() {}

  public static getInstance(): FunctionalDependencyEngine {
    if (!FunctionalDependencyEngine.instance) {
      FunctionalDependencyEngine.instance = new FunctionalDependencyEngine();
    }
    return FunctionalDependencyEngine.instance;
  }

  public analyzeDependencies(semanticModel: IBlueprintSemanticModel): IFunctionalDependencyModel {
    const dependencies: IFunctionalDependency[] = [];
    const roomList = semanticModel.semanticRooms;

    const kitchen = roomList.find(r => r.canonicalType === 'KITCHEN');
    const dining = roomList.find(r => r.canonicalType === 'DINING_ROOM');
    const living = roomList.find(r => r.canonicalType === 'LIVING_ROOM');
    const bedrooms = roomList.filter(r => r.canonicalType.includes('BEDROOM'));
    const toilets = roomList.filter(r => r.canonicalType === 'TOILET' || r.canonicalType === 'BATHROOM');
    const stores = roomList.filter(r => r.canonicalType === 'STORE_ROOM' || r.canonicalType === 'UTILITY');

    let depCounter = 1;

    // Chain 1: Kitchen -> Dining -> Living
    if (kitchen && dining) {
      dependencies.push({
        dependencyId: `DEP_${depCounter++}`,
        sourceRoomId: kitchen.roomId,
        targetRoomId: dining.roomId,
        sourceType: 'KITCHEN',
        targetType: 'DINING_ROOM',
        dependencyType: 'DIRECT_SERVICE',
        criticalityScore: 0.95,
        description: 'Kitchen directly services dining room with food preparation & dining table access.'
      });
    }

    if (dining && living) {
      dependencies.push({
        dependencyId: `DEP_${depCounter++}`,
        sourceRoomId: dining.roomId,
        targetRoomId: living.roomId,
        sourceType: 'DINING_ROOM',
        targetType: 'LIVING_ROOM',
        dependencyType: 'ADJACENCY_REQUIRED',
        criticalityScore: 0.90,
        description: 'Dining area maintains spatial adjacency and visual continuity with main living hall.'
      });
    }

    // Chain 2: Bedroom -> Toilet
    bedrooms.forEach(bed => {
      if (toilets.length > 0) {
        dependencies.push({
          dependencyId: `DEP_${depCounter++}`,
          sourceRoomId: bed.roomId,
          targetRoomId: toilets[0].roomId,
          sourceType: bed.canonicalType,
          targetType: toilets[0].canonicalType,
          dependencyType: 'ACCESS_CONTROL',
          criticalityScore: 0.92,
          description: 'Bedroom depends on sanitary facility access for occupant hygiene.'
        });
      }
    });

    // Chain 3: Store -> Kitchen
    stores.forEach(store => {
      if (kitchen) {
        dependencies.push({
          dependencyId: `DEP_${depCounter++}`,
          sourceRoomId: store.roomId,
          targetRoomId: kitchen.roomId,
          sourceType: store.canonicalType,
          targetType: 'KITCHEN',
          dependencyType: 'STORAGE_SERVICING',
          criticalityScore: 0.88,
          description: 'Utility pantry/store room services kitchen with grocery and appliance inventory.'
        });
      }
    });

    const nodeIds = roomList.map(r => r.roomId);
    const graphEdges = dependencies.map(d => ({
      from: d.sourceRoomId,
      to: d.targetRoomId,
      relation: d.dependencyType,
      weight: d.criticalityScore
    }));

    const standardArchetypeChains = [
      {
        chainName: 'Culinary Circulation Chain (Kitchen -> Dining -> Living)',
        roomSequence: [kitchen?.roomId, dining?.roomId, living?.roomId].filter((id): id is string => Boolean(id)),
        isSatisfied: Boolean(kitchen && dining && living)
      },
      {
        chainName: 'Sanitary Rest Chain (Bedroom -> Toilet)',
        roomSequence: [bedrooms[0]?.roomId, toilets[0]?.roomId].filter((id): id is string => Boolean(id)),
        isSatisfied: Boolean(bedrooms.length > 0 && toilets.length > 0)
      }
    ];

    return {
      dependencies,
      dependencyGraph: {
        nodes: nodeIds,
        edges: graphEdges
      },
      standardArchetypeChains
    };
  }
}

export const functionalDependencyEngine = FunctionalDependencyEngine.getInstance();
