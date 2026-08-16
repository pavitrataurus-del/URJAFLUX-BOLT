// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENGINE 7: SPATIAL BEHAVIOR ENGINE
// Spatial behavior, environmental physics vectors, and privacy zoning engine
// Zones: Public, Private, Semi-Private, Utility, Heat, Water, Noise, Movement, Interaction
// Future Expansion Hooks: Energy Flow, Cross Ventilation, Daylight Penetration
// ============================================================================

import { ISpatialBehaviorMap } from "../types/bsue_v1_5.types";
import { ISemanticRoom } from "../types/bsue.types";
import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class SpatialBehaviorEngine {
  private static instance: SpatialBehaviorEngine;

  private constructor() {}

  public static getInstance(): SpatialBehaviorEngine {
    if (!SpatialBehaviorEngine.instance) {
      SpatialBehaviorEngine.instance = new SpatialBehaviorEngine();
    }
    return SpatialBehaviorEngine.instance;
  }

  public analyzeSpatialBehavior(
    semanticRooms: ISemanticRoom[],
    bmueModel: IBlueprintMathematicalModel
  ): ISpatialBehaviorMap {
    const publicZone: string[] = [];
    const privateZone: string[] = [];
    const semiPrivateZone: string[] = [];
    const utilityZone: string[] = [];
    const heatZone: string[] = [];
    const waterZone: string[] = [];
    const noiseZone: string[] = [];
    const movementZone: string[] = [];
    const interactionZone: string[] = [];

    semanticRooms.forEach(room => {
      const type = room.canonicalType;
      const id = room.roomId;

      // Privacy & Function Zoning
      if (type === 'LIVING_ROOM' || type === 'DINING_ROOM') {
        publicZone.push(id);
        interactionZone.push(id);
        noiseZone.push(id);
      } else if (type.includes('BEDROOM')) {
        privateZone.push(id);
      } else if (type === 'TOILET' || type === 'BATHROOM') {
        privateZone.push(id);
        waterZone.push(id);
      } else if (type === 'KITCHEN') {
        utilityZone.push(id);
        heatZone.push(id);
        waterZone.push(id);
        noiseZone.push(id);
      } else if (type === 'UTILITY' || type === 'STORE_ROOM') {
        utilityZone.push(id);
        waterZone.push(id);
      } else if (type === 'TEMPLE' || type === 'OFFICE') {
        semiPrivateZone.push(id);
      } else if (type === 'CIRCULATION' || type === 'STAIRCASE' || type === 'BALCONY') {
        semiPrivateZone.push(id);
        movementZone.push(id);
      } else {
        semiPrivateZone.push(id);
      }
    });

    // Window daylight & ventilation analysis
    const windows = bmueModel.windowGraph.windows;
    const daylitRooms = Array.from(new Set(windows.map(w => w.associatedRoomId).filter((id): id is string => Boolean(id))));
    const deepDarkZones = semanticRooms.map(r => r.roomId).filter(id => !daylitRooms.includes(id) && !waterZone.includes(id));

    const outerPoly = bmueModel.polygonGraph?.outerBoundaryPolygonId
      ? bmueModel.polygonGraph.polygons.find(p => p.polygonId === bmueModel.polygonGraph.outerBoundaryPolygonId)
      : undefined;
    const footprintSqM = outerPoly?.areaSqMeters || 
      bmueModel.roomGraph.rooms.reduce((sum, r) => sum + (r.polygonAreaSqMeters || 0), 0) || 150;

    return {
      publicZone,
      privateZone,
      semiPrivateZone,
      utilityZone,
      heatZone,
      waterZone,
      noiseZone,
      movementZone,
      interactionZone,
      futureExpansion: {
        energyFlow: {
          thermalEnvelopeAreaSqM: footprintSqM,
          passiveSolarGainExposures: ['EAST', 'NORTH_EAST'],
          hvacZoneDivision: [
            { zoneName: 'Zone_A_Public_Living', roomIds: publicZone },
            { zoneName: 'Zone_B_Private_Bedrooms', roomIds: privateZone },
            { zoneName: 'Zone_C_Service_Utility', roomIds: utilityZone }
          ]
        },
        ventilation: {
          crossVentilationCorridors: windows.length >= 2 ? [
            {
              fromWindowId: windows[0]?.windowId || 'WIN_1',
              toWindowId: windows[1]?.windowId || 'WIN_2',
              viaRoomIds: publicZone
            }
          ] : [],
          airChangeEfficiencyScore: windows.length > 0 ? 0.92 : 0.50
        },
        daylight: {
          daylitRoomIds: daylitRooms,
          deepDarkZones
        }
      }
    };
  }
}

export const spatialBehaviorEngine = SpatialBehaviorEngine.getInstance();
