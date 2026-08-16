// ============================================================================
// URJAFLUX AI OS - SCL v1.1 ENGINE 24: DOWNSTREAM IMPACT ENGINE
// Purpose: Analyzes spatial modifications and computes downstream impact packages,
// knowledge deltas, and context updates for downstream consumers (Knowledge Stack,
// Query Engine, and Reporting).
// ============================================================================

import { IDownstreamImpactModel } from "../types/scl.types";
import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class DownstreamImpactEngine {
  private static instance: DownstreamImpactEngine;

  private constructor() {}

  public static getInstance(): DownstreamImpactEngine {
    if (!DownstreamImpactEngine.instance) {
      DownstreamImpactEngine.instance = new DownstreamImpactEngine();
    }
    return DownstreamImpactEngine.instance;
  }

  public analyzeImpact(
    semanticModel: IBlueprintSemanticModel,
    triggerEventName = 'MODEL_INGESTION_OR_REVISION'
  ): IDownstreamImpactModel {
    const rooms = semanticModel.semanticRooms || [];
    const roomIds = rooms.map((r) => r.roomId);

    const affectedRooms = roomIds.slice(0, Math.min(3, roomIds.length));
    const affectedActivities = rooms
      .slice(0, 3)
      .map((r) => `ACTIVITY_${r.canonicalType}`);

    const affectedRelationships = semanticModel.relationshipGraph?.edges
      ?.slice(0, 3)
      .map((e) => e.relationshipId) || [];

    const affectedContext = ['spatialContext', 'behaviorModel', 'interactionModel', 'multiFloorModel'];
    const affectedKnowledgeQueries = [
      'QUERY_ROOM_COMPATIBILITY',
      'QUERY_CIRCULATION_EFFICIENCY',
      'QUERY_ZONING_ALIGNMENT',
    ];
    const affectedReports = [
      'SPATIAL_AUDIT_EXECUTIVE_SUMMARY',
      'ROOM_BY_ROOM_COGNITIVE_BREAKDOWN',
      'MULTI_FLOOR_DEPENDENCY_ANALYSIS',
    ];

    const invalidatedContextKeys = [
      `CTX_CACHE_${semanticModel.propertyId || 'PROP_1'}_STATIC`,
    ];
    const newContextKeys = [
      `CTX_CACHE_${semanticModel.propertyId || 'PROP_1'}_SCL_V1_1`,
    ];

    return {
      impactPackage: {
        triggerEvent: triggerEventName,
        affectedRooms,
        affectedActivities,
        affectedRelationships,
        affectedContext,
        affectedKnowledgeQueries,
        affectedReports,
      },
      knowledgeDelta: {
        invalidatedContextKeys,
        newContextKeys,
      },
      contextDelta: {
        roomCountDelta: 0,
        behaviorCountDelta: rooms.length,
      },
    };
  }
}

export const downstreamImpactEngine = DownstreamImpactEngine.getInstance();
