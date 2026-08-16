// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 7: TEMPORAL COGNITION ENGINE
// Temporal usage, diurnal cycles, and timeline cognition hooks
// Diurnal: Morning (06-12), Afternoon (12-18), Evening (18-22), Night (22-06)
// Future Hooks: Seasonal, Occupancy, Construction Phase, Renovation Phase
// ============================================================================

import { 
  ITemporalCognitionModel, 
  ITemporalUsageProfile 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class TemporalCognitionEngine {
  private static instance: TemporalCognitionEngine;

  private constructor() {}

  public static getInstance(): TemporalCognitionEngine {
    if (!TemporalCognitionEngine.instance) {
      TemporalCognitionEngine.instance = new TemporalCognitionEngine();
    }
    return TemporalCognitionEngine.instance;
  }

  public analyzeTemporalProfiles(semanticModel: IBlueprintSemanticModel): ITemporalCognitionModel {
    const roomTemporalProfiles: ITemporalUsageProfile[] = [];

    const summerHighOccupancyRooms: string[] = [];
    const winterHighOccupancyRooms: string[] = [];
    const monsoonServiceZones: string[] = [];

    semanticModel.semanticRooms.forEach(room => {
      let morningUsageProb = 0.20;
      let afternoonUsageProb = 0.20;
      let eveningUsageProb = 0.20;
      let nightUsageProb = 0.20;
      let peakUsageWindow: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'ALL_DAY' = 'ALL_DAY';

      const type = room.canonicalType;

      switch (type) {
        case 'BEDROOM':
        case 'MASTER_BEDROOM':
        case 'GUEST_BEDROOM':
        case 'CHILDREN_BEDROOM':
          morningUsageProb = 0.15;
          afternoonUsageProb = 0.10;
          eveningUsageProb = 0.25;
          nightUsageProb = 0.85;
          peakUsageWindow = 'NIGHT';
          winterHighOccupancyRooms.push(room.roomId);
          break;

        case 'TOILET':
        case 'BATHROOM':
          morningUsageProb = 0.80;
          afternoonUsageProb = 0.30;
          eveningUsageProb = 0.50;
          nightUsageProb = 0.20;
          peakUsageWindow = 'MORNING';
          monsoonServiceZones.push(room.roomId);
          break;

        case 'KITCHEN':
          morningUsageProb = 0.75;
          afternoonUsageProb = 0.60;
          eveningUsageProb = 0.85;
          nightUsageProb = 0.10;
          peakUsageWindow = 'EVENING';
          break;

        case 'DINING_ROOM':
          morningUsageProb = 0.50;
          afternoonUsageProb = 0.50;
          eveningUsageProb = 0.85;
          nightUsageProb = 0.10;
          peakUsageWindow = 'EVENING';
          break;

        case 'LIVING_ROOM':
          morningUsageProb = 0.30;
          afternoonUsageProb = 0.40;
          eveningUsageProb = 0.90;
          nightUsageProb = 0.20;
          peakUsageWindow = 'EVENING';
          summerHighOccupancyRooms.push(room.roomId);
          break;

        case 'TEMPLE':
          morningUsageProb = 0.90;
          afternoonUsageProb = 0.20;
          eveningUsageProb = 0.80;
          nightUsageProb = 0.05;
          peakUsageWindow = 'MORNING';
          break;

        case 'BALCONY':
          morningUsageProb = 0.60;
          afternoonUsageProb = 0.10;
          eveningUsageProb = 0.80;
          nightUsageProb = 0.10;
          peakUsageWindow = 'EVENING';
          summerHighOccupancyRooms.push(room.roomId);
          break;

        default:
          morningUsageProb = 0.25;
          afternoonUsageProb = 0.25;
          eveningUsageProb = 0.25;
          nightUsageProb = 0.25;
          peakUsageWindow = 'ALL_DAY';
          break;
      }

      roomTemporalProfiles.push({
        roomId: room.roomId,
        morningUsageProb,
        afternoonUsageProb,
        eveningUsageProb,
        nightUsageProb,
        peakUsageWindow
      });
    });

    const totalRooms = semanticModel.semanticRooms.length;

    return {
      roomTemporalProfiles,
      futureTimelineHooks: {
        seasonalUsage: {
          summerHighOccupancyRooms,
          winterHighOccupancyRooms,
          monsoonServiceZones
        },
        futureOccupancy: {
          projectedOccupantCount: Math.max(2, Math.round(totalRooms * 0.6)),
          densityPerSqMeter: 0.03
        },
        constructionPhase: {
          phaseNumber: 1,
          structuralReadiness: 'COMPLETED_RAW_STRUCTURE'
        },
        renovationPhase: {
          adaptabilityScore: 0.88,
          demolitionRiskZones: monsoonServiceZones
        }
      }
    };
  }
}

export const temporalCognitionEngine = TemporalCognitionEngine.getInstance();
