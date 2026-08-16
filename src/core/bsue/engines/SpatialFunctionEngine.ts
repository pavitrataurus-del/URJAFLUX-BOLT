// ============================================================================
// URJAFLUX AI OS - BSUE STEP 7: SPATIAL FUNCTION ENGINE
// Architectural privacy zone classification: Public, Private, Service, Utility,
// Circulation, Open, Dead Spaces
// ============================================================================

import { 
  ISpatialFunctionAssignment, 
  ISemanticRoom, 
  BmueSpatialPrivacyZone 
} from "../types/bsue.types";

export class SpatialFunctionEngine {
  private static instance: SpatialFunctionEngine;

  private constructor() {}

  public static getInstance(): SpatialFunctionEngine {
    if (!SpatialFunctionEngine.instance) {
      SpatialFunctionEngine.instance = new SpatialFunctionEngine();
    }
    return SpatialFunctionEngine.instance;
  }

  public assignSpatialFunctions(semanticRooms: ISemanticRoom[]): ISpatialFunctionAssignment[] {
    const assignments: ISpatialFunctionAssignment[] = [];

    semanticRooms.forEach(room => {
      let privacyZone: BmueSpatialPrivacyZone = 'PUBLIC';
      let usageDensity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
      let accessibilityLevel: 'PUBLIC_ACCESSIBLE' | 'PRIVATE_RESTRICTED' | 'SERVICE_ACCESS_ONLY' = 'PUBLIC_ACCESSIBLE';

      switch (room.canonicalType) {
        case 'LIVING_ROOM':
        case 'DINING_ROOM':
          privacyZone = 'PUBLIC';
          usageDensity = 'HIGH';
          accessibilityLevel = 'PUBLIC_ACCESSIBLE';
          break;

        case 'BEDROOM':
        case 'MASTER_BEDROOM':
        case 'GUEST_BEDROOM':
        case 'CHILDREN_BEDROOM':
          privacyZone = 'PRIVATE';
          usageDensity = 'HIGH';
          accessibilityLevel = 'PRIVATE_RESTRICTED';
          break;

        case 'TOILET':
        case 'BATHROOM':
          privacyZone = 'PRIVATE';
          usageDensity = 'MEDIUM';
          accessibilityLevel = 'PRIVATE_RESTRICTED';
          break;

        case 'KITCHEN':
          privacyZone = 'SERVICE';
          usageDensity = 'HIGH';
          accessibilityLevel = 'SERVICE_ACCESS_ONLY';
          break;

        case 'UTILITY':
        case 'STORE_ROOM':
          privacyZone = 'UTILITY';
          usageDensity = 'LOW';
          accessibilityLevel = 'SERVICE_ACCESS_ONLY';
          break;

        case 'TEMPLE':
          privacyZone = 'SEMI_PUBLIC';
          usageDensity = 'MEDIUM';
          accessibilityLevel = 'PUBLIC_ACCESSIBLE';
          break;

        case 'BALCONY':
          privacyZone = 'OPEN';
          usageDensity = 'LOW';
          accessibilityLevel = 'PUBLIC_ACCESSIBLE';
          break;

        case 'CIRCULATION':
        case 'STAIRCASE':
          privacyZone = 'CIRCULATION';
          usageDensity = 'HIGH';
          accessibilityLevel = 'PUBLIC_ACCESSIBLE';
          break;

        case 'UNKNOWN_SEMANTIC':
        default:
          privacyZone = 'DEAD_SPACE';
          usageDensity = 'LOW';
          accessibilityLevel = 'PUBLIC_ACCESSIBLE';
          break;
      }

      assignments.push({
        roomId: room.roomId,
        privacyZone,
        usageDensity,
        accessibilityLevel
      });
    });

    return assignments;
  }
}

export const spatialFunctionEngine = SpatialFunctionEngine.getInstance();
