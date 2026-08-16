// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 2: SPATIAL BEHAVIOR ENGINE
// Models behavioral characteristics across 10 canonical behavioral classes:
// Heat Source, Water Source, Noise Source, Movement Generator, Gathering Area,
// Isolation Area, Rest Area, Transition Area, Waiting Area, Storage Area
// ============================================================================

import { 
  ISpatialBehaviorModel, 
  ISpatialBehaviorProfile, 
  SclBehaviorType 
} from "../types/scl.types";

import { IBlueprintSemanticModel, IEvidenceSource } from "../../bsue/types/bsue.types";

export class SclSpatialBehaviorEngine {
  private static instance: SclSpatialBehaviorEngine;

  private constructor() {}

  public static getInstance(): SclSpatialBehaviorEngine {
    if (!SclSpatialBehaviorEngine.instance) {
      SclSpatialBehaviorEngine.instance = new SclSpatialBehaviorEngine();
    }
    return SclSpatialBehaviorEngine.instance;
  }

  public analyzeBehaviors(semanticModel: IBlueprintSemanticModel): ISpatialBehaviorModel {
    const behaviorProfiles: ISpatialBehaviorProfile[] = [];

    let heatSourcesCount = 0;
    let waterSourcesCount = 0;
    let noiseSourcesCount = 0;
    let movementGeneratorsCount = 0;
    let gatheringAreasCount = 0;
    let isolationAreasCount = 0;
    let restAreasCount = 0;
    let transitionAreasCount = 0;
    let waitingAreasCount = 0;
    let storageAreasCount = 0;

    semanticModel.semanticRooms.forEach(room => {
      let primaryBehavior: SclBehaviorType = 'REST_AREA';
      const secondaryBehaviors: SclBehaviorType[] = [];
      const evidence: IEvidenceSource[] = [];
      let behaviorIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';

      const type = room.canonicalType;

      switch (type) {
        case 'KITCHEN':
          primaryBehavior = 'HEAT_SOURCE';
          secondaryBehaviors.push('WATER_SOURCE', 'NOISE_SOURCE', 'STORAGE_AREA');
          behaviorIntensity = 'HIGH';
          heatSourcesCount++;
          waterSourcesCount++;
          noiseSourcesCount++;
          storageAreasCount++;
          evidence.push({
            sourceType: 'GEOMETRY',
            evidenceKey: 'KITCHEN_BEHAVIOR_THERMAL_HYDRO',
            weight: 0.95,
            description: 'Kitchen contains thermal cooking appliances, plumbing water fixtures, and utility noise sources.',
            rawConfidence: 0.95
          });
          break;

        case 'TOILET':
        case 'BATHROOM':
          primaryBehavior = 'WATER_SOURCE';
          secondaryBehaviors.push('ISOLATION_AREA');
          behaviorIntensity = 'HIGH';
          waterSourcesCount++;
          isolationAreasCount++;
          evidence.push({
            sourceType: 'GEOMETRY',
            evidenceKey: 'BATHROOM_BEHAVIOR_HYDRO',
            weight: 0.95,
            description: 'Sanitary facilities represent primary domestic water consumption and drainage nodes.',
            rawConfidence: 0.95
          });
          break;

        case 'LIVING_ROOM':
          primaryBehavior = 'GATHERING_AREA';
          secondaryBehaviors.push('NOISE_SOURCE', 'WAITING_AREA', 'TRANSITION_AREA');
          behaviorIntensity = 'HIGH';
          gatheringAreasCount++;
          noiseSourcesCount++;
          waitingAreasCount++;
          evidence.push({
            sourceType: 'GEOMETRY',
            evidenceKey: 'LIVING_BEHAVIOR_GATHERING',
            weight: 0.90,
            description: 'Central communal hall functions as primary human gathering hub and acoustics source.',
            rawConfidence: 0.90
          });
          break;

        case 'DINING_ROOM':
          primaryBehavior = 'GATHERING_AREA';
          secondaryBehaviors.push('REST_AREA');
          behaviorIntensity = 'MEDIUM';
          gatheringAreasCount++;
          evidence.push({
            sourceType: 'GEOMETRY',
            evidenceKey: 'DINING_BEHAVIOR_MEAL_SHARING',
            weight: 0.88,
            description: 'Dining space acts as secondary social gathering and nutrition space.',
            rawConfidence: 0.88
          });
          break;

        case 'BEDROOM':
        case 'MASTER_BEDROOM':
        case 'GUEST_BEDROOM':
        case 'CHILDREN_BEDROOM':
          primaryBehavior = 'REST_AREA';
          secondaryBehaviors.push('ISOLATION_AREA', 'STORAGE_AREA');
          behaviorIntensity = 'MEDIUM';
          restAreasCount++;
          isolationAreasCount++;
          evidence.push({
            sourceType: 'GEOMETRY',
            evidenceKey: 'BEDROOM_BEHAVIOR_REST_PRIVACY',
            weight: 0.92,
            description: 'Private quarters dedicated to nocturnal rest, quiet isolation, and personal storage.',
            rawConfidence: 0.92
          });
          break;

        case 'CIRCULATION':
        case 'STAIRCASE':
          primaryBehavior = 'MOVEMENT_GENERATOR';
          secondaryBehaviors.push('TRANSITION_AREA');
          behaviorIntensity = 'CRITICAL';
          movementGeneratorsCount++;
          transitionAreasCount++;
          evidence.push({
            sourceType: 'CONNECTIVITY',
            evidenceKey: 'CIRCULATION_BEHAVIOR_MOVEMENT',
            weight: 0.98,
            description: 'Primary transit corridors experience continuous human movement and spatial transition.',
            rawConfidence: 0.98
          });
          break;

        case 'UTILITY':
        case 'STORE_ROOM':
          primaryBehavior = 'STORAGE_AREA';
          secondaryBehaviors.push('WATER_SOURCE');
          behaviorIntensity = 'LOW';
          storageAreasCount++;
          evidence.push({
            sourceType: 'GEOMETRY',
            evidenceKey: 'UTILITY_BEHAVIOR_STORAGE',
            weight: 0.85,
            description: 'Service node dedicated to household equipment, laundry washing, and item storage.',
            rawConfidence: 0.85
          });
          break;

        case 'TEMPLE':
          primaryBehavior = 'ISOLATION_AREA';
          secondaryBehaviors.push('REST_AREA', 'WAITING_AREA');
          behaviorIntensity = 'MEDIUM';
          isolationAreasCount++;
          evidence.push({
            sourceType: 'GEOMETRY',
            evidenceKey: 'TEMPLE_BEHAVIOR_QUIET_WORSHIP',
            weight: 0.90,
            description: 'Devotional space characterized by quiet contemplative isolation and spiritual focus.',
            rawConfidence: 0.90
          });
          break;

        default:
          primaryBehavior = 'TRANSITION_AREA';
          secondaryBehaviors.push('WAITING_AREA');
          behaviorIntensity = 'LOW';
          transitionAreasCount++;
          evidence.push({
            sourceType: 'GEOMETRY',
            evidenceKey: 'FLEX_BEHAVIOR_TRANSITION',
            weight: 0.70,
            description: 'Flexible general space with low specific behavioral intensity.',
            rawConfidence: 0.70
          });
          break;
      }

      behaviorProfiles.push({
        behaviorId: `BEH_${room.roomId}`,
        roomId: room.roomId,
        roomName: room.semanticLabel || room.canonicalType,
        primaryBehavior,
        secondaryBehaviors,
        behaviorConfidence: Math.round(room.confidence * 100) / 100,
        supportingEvidence: evidence,
        behaviorIntensity
      });
    });

    return {
      behaviorProfiles,
      behaviorSummary: {
        heatSourcesCount,
        waterSourcesCount,
        noiseSourcesCount,
        movementGeneratorsCount,
        gatheringAreasCount,
        isolationAreasCount,
        restAreasCount,
        transitionAreasCount,
        waitingAreasCount,
        storageAreasCount
      },
      futureExpansion: {
        thermalBehaviorProjection: `Detected ${heatSourcesCount} primary heat source(s) requiring thermal ventilation.`,
        acousticProfileProjection: `Detected ${noiseSourcesCount} high-noise source(s) requiring acoustic insulation buffers.`,
        moistureZoneProjection: `Detected ${waterSourcesCount} active hydro-zone(s) requiring moisture management.`
      }
    };
  }
}

export const sclSpatialBehaviorEngine = SclSpatialBehaviorEngine.getInstance();
