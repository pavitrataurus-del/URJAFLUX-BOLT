// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 8: ENVIRONMENTAL CONTEXT ENGINE
// Models natural light, ventilation potential, privacy potential, accessibility,
// openness index, enclosure index, and cardinal exposure
// Future Reserved: Weather, Climate, Sun Path
// ============================================================================

import { 
  IEnvironmentalContextModel, 
  IEnvironmentalContextRecord 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class EnvironmentalContextEngine {
  private static instance: EnvironmentalContextEngine;

  private constructor() {}

  public static getInstance(): EnvironmentalContextEngine {
    if (!EnvironmentalContextEngine.instance) {
      EnvironmentalContextEngine.instance = new EnvironmentalContextEngine();
    }
    return EnvironmentalContextEngine.instance;
  }

  public analyzeEnvironmentalContext(semanticModel: IBlueprintSemanticModel): IEnvironmentalContextModel {
    const environmentalRecords: IEnvironmentalContextRecord[] = [];

    semanticModel.semanticRooms.forEach(room => {
      const type = room.canonicalType;
      let naturalLightScore = 0.50;
      let ventilationPotentialScore = 0.50;
      let privacyPotentialScore = 0.50;
      let accessibilityScore = 0.75;
      let opennessIndex = 0.30;
      let exposureFacing = 'INTERNAL';

      if (type === 'LIVING_ROOM' || type === 'BALCONY') {
        naturalLightScore = 0.90;
        ventilationPotentialScore = 0.88;
        privacyPotentialScore = 0.30;
        accessibilityScore = 0.95;
        opennessIndex = 0.65;
        exposureFacing = 'NORTH_EAST';
      } else if (type.includes('BEDROOM')) {
        naturalLightScore = 0.75;
        ventilationPotentialScore = 0.70;
        privacyPotentialScore = 0.90;
        accessibilityScore = 0.75;
        opennessIndex = 0.35;
        exposureFacing = 'SOUTH_WEST';
      } else if (type === 'KITCHEN') {
        naturalLightScore = 0.70;
        ventilationPotentialScore = 0.85;
        privacyPotentialScore = 0.50;
        accessibilityScore = 0.80;
        opennessIndex = 0.40;
        exposureFacing = 'SOUTH_EAST';
      } else if (type === 'TOILET' || type === 'UTILITY') {
        naturalLightScore = 0.35;
        ventilationPotentialScore = 0.60;
        privacyPotentialScore = 0.95;
        accessibilityScore = 0.70;
        opennessIndex = 0.15;
        exposureFacing = 'WEST';
      } else {
        naturalLightScore = 0.50;
        ventilationPotentialScore = 0.50;
        privacyPotentialScore = 0.60;
        accessibilityScore = 0.75;
        opennessIndex = 0.30;
        exposureFacing = 'NORTH';
      }

      environmentalRecords.push({
        roomId: room.roomId,
        naturalLightScore,
        ventilationPotentialScore,
        privacyPotentialScore,
        accessibilityScore,
        opennessIndex,
        enclosureIndex: Math.round((1.0 - opennessIndex) * 100) / 100,
        exposureFacing
      });
    });

    return {
      environmentalRecords,
      futureReserved: {
        weatherDataAvailable: false,
        climateZone: 'TROPICAL_SUBTROPICAL',
        sunPathProjection: {
          solsticeAzimuthDeg: 23.5,
          equinoxEquatorAngleDeg: 45.0
        }
      }
    };
  }
}

export const environmentalContextEngine = EnvironmentalContextEngine.getInstance();
