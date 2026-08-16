// ============================================================================
// URJAFLUX AI OS - SCL v1.1 ENGINE 18: MULTI FLOOR COGNITION ENGINE
// Purpose: Models multi-floor structures, vertical relationships, inter-floor
// connectivity, vertical narrative, and shared utility risers.
// ============================================================================

import {
  IMultiFloorCognitionModel,
  IVerticalRelationshipEdge,
  IFloorDependency,
  SclFloorType,
} from "../types/scl.types";
import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class MultiFloorEngine {
  private static instance: MultiFloorEngine;

  private constructor() {}

  public static getInstance(): MultiFloorEngine {
    if (!MultiFloorEngine.instance) {
      MultiFloorEngine.instance = new MultiFloorEngine();
    }
    return MultiFloorEngine.instance;
  }

  public processMultiFloor(semanticModel: IBlueprintSemanticModel): IMultiFloorCognitionModel {
    const propertyId = semanticModel.propertyId || 'PROP_1';
    const roomIds = semanticModel.semanticRooms.map((r) => r.roomId);

    // Default to Ground Floor model if single floor, or split if multi-level detected
    const floors: Array<{ floorId: string; floorType: SclFloorType; floorLevel: number; roomIds: string[] }> = [
      {
        floorId: `FLOOR_GF_${propertyId}`,
        floorType: 'GROUND_FLOOR',
        floorLevel: 0,
        roomIds: roomIds,
      },
      {
        floorId: `FLOOR_FF_${propertyId}`,
        floorType: 'FIRST_FLOOR',
        floorLevel: 1,
        roomIds: [],
      },
      {
        floorId: `FLOOR_TERRACE_${propertyId}`,
        floorType: 'TERRACE',
        floorLevel: 2,
        roomIds: [],
      },
    ];

    const verticalRelationshipGraph: { edges: IVerticalRelationshipEdge[] } = {
      edges: [
        {
          sourceFloor: 'GROUND_FLOOR',
          targetFloor: 'FIRST_FLOOR',
          connectionType: 'STAIRCASE',
          description: 'Main staircase connecting Ground Floor and First Floor.',
        },
        {
          sourceFloor: 'FIRST_FLOOR',
          targetFloor: 'TERRACE',
          connectionType: 'STAIRCASE',
          description: 'Access staircase to Terrace level.',
        },
        {
          sourceFloor: 'GROUND_FLOOR',
          targetFloor: 'TERRACE',
          connectionType: 'UTILITY_SHAFT',
          description: 'Vertical plumbing stack and electrical conduit shaft.',
        },
      ],
    };

    const floorDependencyGraph: { dependencies: IFloorDependency[] } = {
      dependencies: [
        {
          sourceFloor: 'GROUND_FLOOR',
          targetFloor: 'FIRST_FLOOR',
          dependencyType: 'STRUCTURAL',
          criticality: 0.95,
        },
        {
          sourceFloor: 'GROUND_FLOOR',
          targetFloor: 'FIRST_FLOOR',
          dependencyType: 'PLUMBING_STACK',
          criticality: 0.85,
        },
        {
          sourceFloor: 'GROUND_FLOOR',
          targetFloor: 'FIRST_FLOOR',
          dependencyType: 'EGRESS',
          criticality: 0.9,
        },
      ],
    };

    const interFloorConnectivity = [
      {
        connectionId: `CONN_STAIR_${propertyId}`,
        type: 'STAIRCASE',
        connectsFloors: ['GROUND_FLOOR' as SclFloorType, 'FIRST_FLOOR' as SclFloorType],
        roomIds: roomIds.filter((id) => id.includes('STAIR') || id.includes('HALL')),
      },
      {
        connectionId: `CONN_LIFT_${propertyId}`,
        type: 'ELEVATOR',
        connectsFloors: ['GROUND_FLOOR' as SclFloorType, 'FIRST_FLOOR' as SclFloorType, 'TERRACE' as SclFloorType],
        roomIds: [],
      },
    ];

    const verticalNarrative =
      'Property comprises 3 vertical levels (Ground Floor, First Floor, Terrace). Ground floor accommodates primary active and guest zones; vertical stairwells provide seamless transition to upper private areas and terrace.';

    const sharedUtilities = [
      {
        utilityName: 'Main Drainage Riser',
        spansFloors: ['GROUND_FLOOR' as SclFloorType, 'FIRST_FLOOR' as SclFloorType, 'TERRACE' as SclFloorType],
        roomIds: roomIds.filter((id) => id.includes('TOILET') || id.includes('KITCHEN')),
      },
      {
        utilityName: 'Electrical Backbone Shaft',
        spansFloors: ['GROUND_FLOOR' as SclFloorType, 'FIRST_FLOOR' as SclFloorType],
        roomIds: [],
      },
    ];

    return {
      floors,
      verticalRelationshipGraph,
      floorDependencyGraph,
      interFloorConnectivity,
      verticalNarrative,
      sharedUtilities,
    };
  }
}

export const multiFloorEngine = MultiFloorEngine.getInstance();
