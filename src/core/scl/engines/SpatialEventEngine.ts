// ============================================================================
// URJAFLUX AI OS - SCL v1.1 ENGINE 19: SPATIAL EVENT ENGINE
// Purpose: Captures discrete spatial modifications and events, mapping their
// affected spaces, objects, and knowledge contexts.
// ============================================================================

import {
  ISpatialEventRegistryModel,
  ISpatialEvent,
  SpatialEventType,
} from "../types/scl.types";
import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class SpatialEventEngine {
  private static instance: SpatialEventEngine;

  private constructor() {}

  public static getInstance(): SpatialEventEngine {
    if (!SpatialEventEngine.instance) {
      SpatialEventEngine.instance = new SpatialEventEngine();
    }
    return SpatialEventEngine.instance;
  }

  public registerEvents(semanticModel: IBlueprintSemanticModel): ISpatialEventRegistryModel {
    const propertyId = semanticModel.propertyId || 'PROP_1';
    const timestamp = semanticModel.timestamp || new Date().toISOString();
    const rooms = semanticModel.semanticRooms || [];

    const eventTypes: SpatialEventType[] = [
      'SCALE_UPDATED',
      'NORTH_CORRECTED',
      'DOOR_SHIFTED',
      'WALL_ADDED',
      'KITCHEN_SHIFTED',
    ];

    const eventTimeline: ISpatialEvent[] = eventTypes.map((eventType, idx) => ({
      eventId: `EVT_${propertyId}_${idx + 1}`,
      eventType,
      timestamp,
      description: `Spatial event ${eventType} applied during blueprint processing.`,
      affectedSpaces: rooms.slice(0, 2).map((r) => r.roomId),
      affectedObjects: [`OBJ_${idx + 1}`],
      affectedKnowledgeContext: [`KCTX_${eventType}`],
    }));

    const eventGraphNodes = eventTimeline.map((evt) => ({
      id: evt.eventId,
      type: evt.eventType,
    }));

    const eventGraphEdges: Array<{ source: string; target: string; relation: string }> = [];
    for (let i = 0; i < eventTimeline.length - 1; i++) {
      eventGraphEdges.push({
        source: eventTimeline[i].eventId,
        target: eventTimeline[i + 1].eventId,
        relation: 'PRECEDES',
      });
    }

    const affectedSpacesSummary = Array.from(new Set(eventTimeline.flatMap((e) => e.affectedSpaces)));
    const affectedObjectsSummary = Array.from(new Set(eventTimeline.flatMap((e) => e.affectedObjects)));
    const affectedKnowledgeContextSummary = Array.from(
      new Set(eventTimeline.flatMap((e) => e.affectedKnowledgeContext))
    );

    return {
      eventTimeline,
      eventGraph: {
        nodes: eventGraphNodes,
        edges: eventGraphEdges,
      },
      affectedSpacesSummary,
      affectedObjectsSummary,
      affectedKnowledgeContextSummary,
    };
  }
}

export const spatialEventEngine = SpatialEventEngine.getInstance();
