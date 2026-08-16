// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENGINE 2: ACTIVITY INFERENCE ENGINE
// Derives primary & secondary human activities for every spatial polygon
// ============================================================================

import { 
  IActivityInferenceSummary, 
  IRoomActivityInference 
} from "../types/bsue_v1_5.types";

import { ISemanticRoom } from "../types/bsue.types";
import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class ActivityInferenceEngine {
  private static instance: ActivityInferenceEngine;

  private constructor() {}

  public static getInstance(): ActivityInferenceEngine {
    if (!ActivityInferenceEngine.instance) {
      ActivityInferenceEngine.instance = new ActivityInferenceEngine();
    }
    return ActivityInferenceEngine.instance;
  }

  public inferActivities(
    semanticRooms: ISemanticRoom[],
    bmueModel: IBlueprintMathematicalModel
  ): IActivityInferenceSummary {
    const roomActivities: IRoomActivityInference[] = [];
    const uniqueActivitiesSet = new Set<string>();

    semanticRooms.forEach(room => {
      let primaryActivity = 'GENERAL_OCCUPANCY';
      const secondaryActivities: string[] = [];
      let activityConfidence = room.confidence;

      const containedObjs = bmueModel.containmentGraph.containments
        .filter(c => c.assignedRoomId === room.roomId)
        .map(c => c.objectType.toUpperCase());

      switch (room.canonicalType) {
        case 'KITCHEN':
          primaryActivity = 'COOKING';
          secondaryActivities.push('FOOD_PREPARATION', 'DISH_WASHING', 'APPLIANCE_STORAGE');
          if (containedObjs.some(o => o.includes('STOVE') || o.includes('HOB'))) {
            activityConfidence = Math.min(0.99, activityConfidence + 0.05);
          }
          break;

        case 'BEDROOM':
        case 'MASTER_BEDROOM':
        case 'GUEST_BEDROOM':
        case 'CHILDREN_BEDROOM':
          primaryActivity = 'SLEEPING';
          secondaryActivities.push('RESTING', 'PERSONAL_DRESSING', 'CLOTHING_STORAGE');
          if (containedObjs.some(o => o.includes('DESK') || o.includes('LAPTOP') || o.includes('COMPUTER'))) {
            secondaryActivities.push('WORK_STUDY_DESK');
          }
          break;

        case 'LIVING_ROOM':
          primaryActivity = 'GATHERING';
          secondaryActivities.push('FAMILY_ENTERTAINMENT', 'GUEST_RECEPTION', 'LOUNGE_RELAXATION');
          if (containedObjs.some(o => o.includes('TV') || o.includes('SOFA'))) {
            activityConfidence = Math.min(0.99, activityConfidence + 0.05);
          }
          break;

        case 'DINING_ROOM':
          primaryActivity = 'EATING';
          secondaryActivities.push('MEAL_SHARING', 'FAMILY_DINING', 'TABLE_CONVERSATION');
          break;

        case 'TEMPLE':
          primaryActivity = 'PRAYER';
          secondaryActivities.push('MEDITATION', 'DEVOTIONAL_WORSHIP', 'SPIRITUAL_CONTEMPLATION');
          break;

        case 'OFFICE':
          primaryActivity = 'WORKING';
          secondaryActivities.push('DESK_COMPUTING', 'STUDYING', 'DOCUMENT_FILING');
          break;

        case 'UTILITY':
          primaryActivity = 'MAINTENANCE';
          secondaryActivities.push('LAUNDRY_WASHING', 'HOUSEKEEPING_STORAGE', 'SERVICE_UTILITY');
          break;

        case 'TOILET':
        case 'BATHROOM':
          primaryActivity = 'HYGIENE';
          secondaryActivities.push('BATHING', 'PERSONAL_SANITATION', 'GROOMING');
          break;

        case 'STORE_ROOM':
          primaryActivity = 'INVENTORY_STORAGE';
          secondaryActivities.push('ITEM_STACKING', 'LONG_TERM_STORAGE');
          break;

        case 'BALCONY':
          primaryActivity = 'OUTDOOR_RELAXATION';
          secondaryActivities.push('NATURAL_VENTILATION_VIEWING', 'CLOTHES_DRYING');
          break;

        case 'CIRCULATION':
        case 'STAIRCASE':
          primaryActivity = 'TRANSIT';
          secondaryActivities.push('CIRCULATION_MOVEMENT', 'INTER_ROOM_ACCESS');
          break;

        default:
          primaryActivity = 'GENERAL_OCCUPANCY';
          secondaryActivities.push('FLEXIBLE_USAGE');
          break;
      }

      // Track unique activities
      uniqueActivitiesSet.add(primaryActivity);
      secondaryActivities.forEach(a => uniqueActivitiesSet.add(a));

      roomActivities.push({
        roomId: room.roomId,
        primaryActivity,
        secondaryActivities,
        activityConfidence: Math.round(activityConfidence * 100) / 100
      });
    });

    return {
      roomActivities,
      uniqueActivitiesIdentified: Array.from(uniqueActivitiesSet)
    };
  }
}

export const activityInferenceEngine = ActivityInferenceEngine.getInstance();
