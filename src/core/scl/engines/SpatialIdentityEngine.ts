// ============================================================================
// URJAFLUX AI OS - SCL v1.1 ENGINE 16: SPATIAL IDENTITY ENGINE
// Purpose: Every spatial entity receives a permanent persistent identity.
// Identity never changes even if names or locations evolve across revisions.
// ============================================================================

import {
  ISpatialIdentityRegistryModel,
  IPersistentIdentity,
  IIdentityHistoryRecord,
  IIdentityMapping,
  SpatialEntityType,
} from "../types/scl.types";
import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";
import { IBlueprintSemanticModelV15 } from "../../bsue/types/bsue_v1_5.types";

export class SpatialIdentityEngine {
  private static instance: SpatialIdentityEngine;

  private constructor() {}

  public static getInstance(): SpatialIdentityEngine {
    if (!SpatialIdentityEngine.instance) {
      SpatialIdentityEngine.instance = new SpatialIdentityEngine();
    }
    return SpatialIdentityEngine.instance;
  }

  public registerIdentities(semanticModel: IBlueprintSemanticModel): ISpatialIdentityRegistryModel {
    const v15Model = semanticModel as IBlueprintSemanticModelV15;
    const propertyId = semanticModel.propertyId || 'PROP_1';
    const timestamp = semanticModel.timestamp || new Date().toISOString();

    const persistentIds: string[] = [];
    const identityRegistry: IPersistentIdentity[] = [];
    const identityHistory: IIdentityHistoryRecord[] = [];
    const identityMapping: IIdentityMapping[] = [];

    // Register Rooms
    semanticModel.semanticRooms.forEach((room) => {
      const persistentId = `PID_ROOM_${propertyId}_${room.roomId}`;
      const locationHash = `LOC_${room.centroid.x.toFixed(2)}_${room.centroid.y.toFixed(2)}`;

      persistentIds.push(persistentId);

      const identity: IPersistentIdentity = {
        persistentId,
        entityType: 'ROOM',
        permanentCode: `CODE_ROOM_${room.canonicalType}`,
        createdTimestamp: timestamp,
        currentName: room.semanticLabel || room.canonicalType,
        currentLocationHash: locationHash,
      };
      identityRegistry.push(identity);

      identityHistory.push({
        persistentId,
        nameChanges: [],
        locationChanges: [],
      });

      identityMapping.push({
        persistentId,
        ephemeralId: room.roomId,
        entityType: 'ROOM',
      });
    });

    // Register Doors
    (semanticModel as any).connectivityGraph?.doors?.forEach((door: any) => {
      const persistentId = `PID_DOOR_${propertyId}_${door.doorId}`;
      const locationHash = `LOC_DOOR_${door.doorId}`;

      persistentIds.push(persistentId);

      identityRegistry.push({
        persistentId,
        entityType: 'DOOR',
        permanentCode: `CODE_DOOR_${door.connectsRooms?.join('_') || 'LINK'}`,
        createdTimestamp: timestamp,
        currentName: `Door ${door.doorId}`,
        currentLocationHash: locationHash,
      });

      identityHistory.push({
        persistentId,
        nameChanges: [],
        locationChanges: [],
      });

      identityMapping.push({
        persistentId,
        ephemeralId: door.doorId,
        entityType: 'DOOR',
      });
    });

    // Register Objects (from semanticObjects or KnowledgeReadyContext)
    const objects = semanticModel.semanticObjects || [];
    objects.forEach((obj, idx) => {
      const persistentId = `PID_OBJ_${propertyId}_${obj.objectId || idx + 1}`;
      persistentIds.push(persistentId);

      identityRegistry.push({
        persistentId,
        entityType: 'OBJECT',
        permanentCode: `CODE_OBJ_${obj.canonicalType || 'GENERIC'}`,
        createdTimestamp: timestamp,
        currentName: obj.canonicalType || `Object ${idx + 1}`,
        currentLocationHash: `LOC_OBJ_${idx + 1}`,
      });

      identityHistory.push({
        persistentId,
        nameChanges: [],
        locationChanges: [],
      });

      identityMapping.push({
        persistentId,
        ephemeralId: obj.objectId || `OBJ_${idx + 1}`,
        entityType: 'OBJECT',
      });
    });

    // Register Zones
    ['PUBLIC_ZONE', 'PRIVATE_ZONE', 'SERVICE_ZONE', 'CIRCULATION_ZONE'].forEach((zoneKey) => {
      const persistentId = `PID_ZONE_${propertyId}_${zoneKey}`;
      persistentIds.push(persistentId);

      identityRegistry.push({
        persistentId,
        entityType: 'ZONE',
        permanentCode: `CODE_ZONE_${zoneKey}`,
        createdTimestamp: timestamp,
        currentName: zoneKey.replace('_', ' '),
        currentLocationHash: `LOC_ZONE_${zoneKey}`,
      });

      identityHistory.push({
        persistentId,
        nameChanges: [],
        locationChanges: [],
      });

      identityMapping.push({
        persistentId,
        ephemeralId: zoneKey,
        entityType: 'ZONE',
      });
    });

    return {
      persistentIds,
      identityRegistry,
      identityHistory,
      identityMapping,
    };
  }
}

export const spatialIdentityEngine = SpatialIdentityEngine.getInstance();
