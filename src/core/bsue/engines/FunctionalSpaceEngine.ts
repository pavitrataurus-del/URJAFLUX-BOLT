// ============================================================================
// URJAFLUX AI OS - BSUE STEP 4: FUNCTIONAL SPACE ENGINE
// Detects Primary Function, Secondary Function, Mixed Usage & Convertible Capabilities
// Examples: Living + Dining, Kitchen + Utility, Bedroom + Study, Store + Temple
// ============================================================================

import { 
  IFunctionalSpace, 
  ISemanticRoom, 
  BmueFunctionalCategory 
} from "../types/bsue.types";

import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class FunctionalSpaceEngine {
  private static instance: FunctionalSpaceEngine;

  private constructor() {}

  public static getInstance(): FunctionalSpaceEngine {
    if (!FunctionalSpaceEngine.instance) {
      FunctionalSpaceEngine.instance = new FunctionalSpaceEngine();
    }
    return FunctionalSpaceEngine.instance;
  }

  public analyzeFunctionalSpaces(
    semanticRooms: ISemanticRoom[],
    bmueModel: IBlueprintMathematicalModel
  ): IFunctionalSpace[] {
    const functionalSpaces: IFunctionalSpace[] = [];

    semanticRooms.forEach((room, idx) => {
      let primaryFunction: BmueFunctionalCategory = 'PRIMARY_HABITABLE';
      const secondaryFunctions: BmueFunctionalCategory[] = [];
      let isMixedUsage = false;
      let mixedUsageDescription: string | undefined;
      const convertibleCapabilities: string[] = [];

      // Categorize primary function
      switch (room.canonicalType) {
        case 'LIVING_ROOM':
          primaryFunction = 'COMMUNAL';
          // Check if large area implies Living + Dining mixed usage (> 22m²)
          if (room.areaSqMeters >= 20.0) {
            isMixedUsage = true;
            secondaryFunctions.push('COMMUNAL');
            mixedUsageDescription = 'Combined Living Hall & Dining Space';
            convertibleCapabilities.push('CONVERTIBLE_FAMILY_GATHERING_VENUE');
          }
          break;

        case 'DINING_ROOM':
          primaryFunction = 'COMMUNAL';
          secondaryFunctions.push('COMMUNAL');
          break;

        case 'KITCHEN':
          primaryFunction = 'SECONDARY_SERVICE';
          // Check if adjacent to utility or includes wash area (> 12m²)
          if (room.areaSqMeters >= 12.0) {
            isMixedUsage = true;
            secondaryFunctions.push('UTILITY');
            mixedUsageDescription = 'Combined Kitchen & Service Utility Area';
          }
          break;

        case 'BEDROOM':
        case 'MASTER_BEDROOM':
        case 'GUEST_BEDROOM':
        case 'CHILDREN_BEDROOM':
          primaryFunction = 'PRIMARY_HABITABLE';
          if (room.areaSqMeters >= 16.0) {
            isMixedUsage = true;
            secondaryFunctions.push('PRIMARY_HABITABLE');
            mixedUsageDescription = 'Bedroom with Dedicated Work/Study Zone';
            convertibleCapabilities.push('CONVERTIBLE_HOME_OFFICE_NICHE');
          }
          break;

        case 'TOILET':
        case 'BATHROOM':
          primaryFunction = 'SANITARY';
          secondaryFunctions.push('SANITARY');
          break;

        case 'STORE_ROOM':
          primaryFunction = 'STORAGE';
          if (room.areaSqMeters <= 5.0) {
            convertibleCapabilities.push('CONVERTIBLE_DEVOTIONAL_PUJA_NICHE');
          }
          break;

        case 'TEMPLE':
          primaryFunction = 'DEVOTIONAL';
          break;

        case 'UTILITY':
          primaryFunction = 'UTILITY';
          secondaryFunctions.push('STORAGE');
          break;

        case 'CIRCULATION':
        case 'STAIRCASE':
        case 'BALCONY':
          primaryFunction = 'CIRCULATION';
          break;

        default:
          primaryFunction = 'PRIMARY_HABITABLE';
          break;
      }

      functionalSpaces.push({
        spaceId: `FUNC_SPACE_${room.roomId}`,
        roomId: room.roomId,
        primaryFunction,
        secondaryFunctions,
        isMixedUsage,
        mixedUsageDescription,
        convertibleCapabilities
      });
    });

    return functionalSpaces;
  }
}

export const functionalSpaceEngine = FunctionalSpaceEngine.getInstance();
