// ============================================================================
// URJAFLUX AI OS - BSUE STEP 10: BLUEPRINT KNOWLEDGE READINESS ENGINE
// Prepare canonical semantic data package for downstream KQE/KIE intelligence stack
// Generates Knowledge-Ready Rooms, Objects, Activities, Relationships, and Context
// ============================================================================

import { 
  IKnowledgeReadyContext, 
  IKnowledgeReadyRoom, 
  ISemanticRoom, 
  ISemanticRelationshipGraph, 
  IFunctionalSpace 
} from "../types/bsue.types";

import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class BlueprintKnowledgeReadinessEngine {
  private static instance: BlueprintKnowledgeReadinessEngine;

  private constructor() {}

  public static getInstance(): BlueprintKnowledgeReadinessEngine {
    if (!BlueprintKnowledgeReadinessEngine.instance) {
      BlueprintKnowledgeReadinessEngine.instance = new BlueprintKnowledgeReadinessEngine();
    }
    return BlueprintKnowledgeReadinessEngine.instance;
  }

  public generateKnowledgeReadyContext(
    semanticRooms: ISemanticRoom[],
    functionalSpaces: IFunctionalSpace[],
    relationshipGraph: ISemanticRelationshipGraph,
    bmueModel: IBlueprintMathematicalModel
  ): IKnowledgeReadyContext {
    const knowledgeRooms: IKnowledgeReadyRoom[] = [];
    let habitableCount = 0;
    let sanitaryCount = 0;

    semanticRooms.forEach(room => {
      const funcSpace = functionalSpaces.find(f => f.roomId === room.roomId);
      const connectedEdges = relationshipGraph.edges.filter(e => e.sourceRoomId === room.roomId || e.targetRoomId === room.roomId);
      const connectedRoomIds = Array.from(new Set(connectedEdges.map(e => e.sourceRoomId === room.roomId ? e.targetRoomId : e.sourceRoomId)));

      const containedObjs = bmueModel.containmentGraph.containments
        .filter(c => c.assignedRoomId === room.roomId)
        .map(c => c.objectType);

      const activities: string[] = [];
      switch (room.canonicalType) {
        case 'KITCHEN': activities.push('COOKING', 'FOOD_PREPARATION', 'DISH_WASHING'); break;
        case 'BEDROOM':
        case 'MASTER_BEDROOM': activities.push('SLEEPING', 'RESTING', 'CLOTHING_STORAGE'); habitableCount++; break;
        case 'TOILET': activities.push('BATHING', 'SANITATION', 'PERSONAL_HYGIENE'); sanitaryCount++; break;
        case 'LIVING_ROOM': activities.push('FAMILY_GATHERING', 'ENTERTAINMENT', 'GUEST_RECEPTION'); habitableCount++; break;
        case 'DINING_ROOM': activities.push('DINING', 'MEAL_SHARING'); break;
        case 'TEMPLE': activities.push('DEVOTIONAL_PRAYER', 'MEDITATION'); break;
        case 'OFFICE': activities.push('WORKING', 'STUDYING', 'COMPUTER_USAGE'); break;
        default: activities.push('GENERAL_USAGE'); break;
      }

      knowledgeRooms.push({
        roomId: room.roomId,
        type: room.canonicalType,
        areaSqMeters: room.areaSqMeters,
        privacyZone: funcSpace ? funcSpace.primaryFunction : 'PRIMARY_HABITABLE',
        associatedActivities: activities,
        containedObjects: containedObjs,
        connectedRoomIds
      });
    });

    const hasAttachedBathrooms = relationshipGraph.attachedToiletPairs.length > 0;
    const hasOpenKitchen = relationshipGraph.kitchenDiningPairs.length > 0;

    const keywords = [
      bmueModel.propertyName,
      `HABITABLE_ROOMS_${habitableCount}`,
      `SANITARY_ROOMS_${sanitaryCount}`,
      hasAttachedBathrooms ? 'ATTACHED_BATHROOMS_PRESENT' : 'COMMUNAL_BATHROOMS_ONLY',
      hasOpenKitchen ? 'OPEN_KITCHEN_LAYOUT' : 'ENCLOSED_KITCHEN_LAYOUT'
    ];

    return {
      propertyId: bmueModel.propertyId,
      propertyName: bmueModel.propertyName,
      totalHabitableRooms: habitableCount,
      totalSanitaryRooms: sanitaryCount,
      hasAttachedBathrooms,
      hasOpenKitchen,
      overallSemanticConfidence: 0.95,
      rooms: knowledgeRooms,
      semanticKeywords: keywords
    };
  }
}

export const blueprintKnowledgeReadinessEngine = BlueprintKnowledgeReadinessEngine.getInstance();
