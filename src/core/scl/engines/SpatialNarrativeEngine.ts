// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 9: SPATIAL NARRATIVE ENGINE
// Machine-readable architectural narrative graph solver.
// Transforms floor plan into structured spatial graph story:
// Main Entrance -> Living -> Dining -> Kitchen -> Utility -> Private Quarters
// NO natural language text paragraphs. Strictly machine-readable structured graph.
// ============================================================================

import { 
  ISpatialNarrativeModel, 
  INarrativeStep 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class SpatialNarrativeEngine {
  private static instance: SpatialNarrativeEngine;

  private constructor() {}

  public static getInstance(): SpatialNarrativeEngine {
    if (!SpatialNarrativeEngine.instance) {
      SpatialNarrativeEngine.instance = new SpatialNarrativeEngine();
    }
    return SpatialNarrativeEngine.instance;
  }

  public generateNarrativeGraph(semanticModel: IBlueprintSemanticModel): ISpatialNarrativeModel {
    const narrativeSequence: INarrativeStep[] = [];
    const rooms = semanticModel.semanticRooms;

    const living = rooms.find(r => r.canonicalType === 'LIVING_ROOM') || rooms[0];
    const dining = rooms.find(r => r.canonicalType === 'DINING_ROOM');
    const kitchen = rooms.find(r => r.canonicalType === 'KITCHEN');
    const utility = rooms.find(r => r.canonicalType === 'UTILITY' || r.canonicalType === 'STORE_ROOM');
    const bedrooms = rooms.filter(r => r.canonicalType.includes('BEDROOM'));
    const bathrooms = rooms.filter(r => r.canonicalType === 'TOILET' || r.canonicalType === 'BATHROOM');

    let stepIndex = 1;

    // Step 1: Main Entrance Transition
    if (living) {
      narrativeSequence.push({
        stepIndex: stepIndex++,
        toRoomId: living.roomId,
        transitionType: 'ENTRANCE',
        spatialNarrativeLabel: 'MAIN_ENTRANCE_TO_RECEPTION_LIVING'
      });
    }

    // Step 2: Living to Dining
    if (living && dining) {
      narrativeSequence.push({
        stepIndex: stepIndex++,
        fromRoomId: living.roomId,
        toRoomId: dining.roomId,
        transitionType: 'MAIN_CIRCULATION',
        spatialNarrativeLabel: 'LIVING_TO_DINING_COMMUNAL_HUB'
      });
    }

    // Step 3: Dining to Kitchen
    if (dining && kitchen) {
      narrativeSequence.push({
        stepIndex: stepIndex++,
        fromRoomId: dining.roomId,
        toRoomId: kitchen.roomId,
        transitionType: 'ZONE_CHANGE',
        spatialNarrativeLabel: 'DINING_TO_CULINARY_KITCHEN'
      });
    } else if (living && kitchen) {
      narrativeSequence.push({
        stepIndex: stepIndex++,
        fromRoomId: living.roomId,
        toRoomId: kitchen.roomId,
        transitionType: 'ZONE_CHANGE',
        spatialNarrativeLabel: 'LIVING_TO_CULINARY_KITCHEN'
      });
    }

    // Step 4: Kitchen to Utility
    if (kitchen && utility) {
      narrativeSequence.push({
        stepIndex: stepIndex++,
        fromRoomId: kitchen.roomId,
        toRoomId: utility.roomId,
        transitionType: 'SERVICE_ENTRY',
        spatialNarrativeLabel: 'KITCHEN_TO_SERVICE_UTILITY'
      });
    }

    // Step 5: Living to Bedrooms
    bedrooms.forEach((bed, idx) => {
      narrativeSequence.push({
        stepIndex: stepIndex++,
        fromRoomId: living?.roomId,
        toRoomId: bed.roomId,
        transitionType: 'ZONE_CHANGE',
        spatialNarrativeLabel: `PUBLIC_HUB_TO_PRIVATE_BEDROOM_${idx + 1}`
      });
    });

    // Step 6: Bedrooms to Bathrooms
    bedrooms.forEach((bed, idx) => {
      if (bathrooms[idx]) {
        narrativeSequence.push({
          stepIndex: stepIndex++,
          fromRoomId: bed.roomId,
          toRoomId: bathrooms[idx].roomId,
          transitionType: 'TERMINAL_DESTINATION',
          spatialNarrativeLabel: `BEDROOM_${idx + 1}_TO_SANITARY_SUITE`
        });
      }
    });

    const nodes = rooms.map(r => ({
      id: r.roomId,
      label: r.semanticLabel || r.canonicalType
    }));

    const edges = narrativeSequence.map(s => ({
      source: s.fromRoomId || 'EXTERNAL_MAIN_ENTRANCE',
      target: s.toRoomId,
      transition: s.spatialNarrativeLabel
    }));

    const summaryParts = narrativeSequence.map(s => `${s.fromRoomId || 'ENTRANCE'}->${s.toRoomId}[${s.spatialNarrativeLabel}]`);

    return {
      narrativeSequence,
      narrativeGraph: {
        nodes,
        edges
      },
      narrativeSummary: `STRUCTURED_NARRATIVE_GRAPH: ${summaryParts.join(' | ')}`
    };
  }
}

export const spatialNarrativeEngine = SpatialNarrativeEngine.getInstance();
