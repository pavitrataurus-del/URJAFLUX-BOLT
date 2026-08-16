// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 1: SPATIAL HIERARCHY ENGINE
// Establishes multi-level spatial hierarchy:
// Property -> Zones -> Spaces -> Rooms -> Objects -> Activities -> Relationships -> Behaviors
// ============================================================================

import { 
  ISpatialHierarchyModel, 
  IHierarchyNode 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";
import { IBlueprintSemanticModelV15 } from "../../bsue/types/bsue_v1_5.types";

export class SpatialHierarchyEngine {
  private static instance: SpatialHierarchyEngine;

  private constructor() {}

  public static getInstance(): SpatialHierarchyEngine {
    if (!SpatialHierarchyEngine.instance) {
      SpatialHierarchyEngine.instance = new SpatialHierarchyEngine();
    }
    return SpatialHierarchyEngine.instance;
  }

  public buildHierarchy(semanticModel: IBlueprintSemanticModel): ISpatialHierarchyModel {
    const v15Model = semanticModel as IBlueprintSemanticModelV15;
    const propertyId = semanticModel.propertyId || 'PROP_1';
    const propertyName = semanticModel.propertyName || 'Property';

    // Level 0: Property Node
    const propertyNode: IHierarchyNode = {
      entityId: propertyId,
      entityType: 'PROPERTY',
      entityName: propertyName,
      childIds: [],
      depthLevel: 0,
      metadata: { totalRooms: semanticModel.semanticRooms.length }
    };

    // Level 1: Zone Nodes (Public, Private, Utility, Service)
    const zoneMap = new Map<string, IHierarchyNode>();
    const zones = ['PUBLIC_ZONE', 'PRIVATE_ZONE', 'SERVICE_ZONE', 'CIRCULATION_ZONE'];

    zones.forEach(zoneKey => {
      const zoneId = `ZONE_${zoneKey}_${propertyId}`;
      const zoneNode: IHierarchyNode = {
        entityId: zoneId,
        entityType: 'ZONE',
        entityName: zoneKey.replace('_', ' '),
        parentId: propertyId,
        childIds: [],
        depthLevel: 1
      };
      zoneMap.set(zoneKey, zoneNode);
      propertyNode.childIds.push(zoneId);
    });

    const spaceNodes: IHierarchyNode[] = [];
    const roomNodes: IHierarchyNode[] = [];
    const objectNodes: IHierarchyNode[] = [];
    const activityNodes: IHierarchyNode[] = [];
    const relationshipNodes: IHierarchyNode[] = [];
    const behaviorNodes: IHierarchyNode[] = [];

    // Level 2 & Level 3: Spaces & Rooms
    semanticModel.semanticRooms.forEach(room => {
      // Determine zone
      let targetZoneKey = 'SERVICE_ZONE';
      if (room.canonicalType.includes('BEDROOM') || room.canonicalType === 'TOILET') {
        targetZoneKey = 'PRIVATE_ZONE';
      } else if (room.canonicalType === 'LIVING_ROOM' || room.canonicalType === 'DINING_ROOM' || room.canonicalType === 'TEMPLE') {
        targetZoneKey = 'PUBLIC_ZONE';
      } else if (room.canonicalType === 'CIRCULATION' || room.canonicalType === 'STAIRCASE') {
        targetZoneKey = 'CIRCULATION_ZONE';
      }

      const parentZone = zoneMap.get(targetZoneKey);
      const spaceId = `SPACE_${room.roomId}`;

      // Level 2: Space Node
      const spaceNode: IHierarchyNode = {
        entityId: spaceId,
        entityType: 'SPACE',
        entityName: `Space of ${room.semanticLabel || room.canonicalType}`,
        parentId: parentZone?.entityId,
        childIds: [room.roomId],
        depthLevel: 2,
        metadata: { canonicalType: room.canonicalType, areaSqMeters: room.areaSqMeters }
      };
      spaceNodes.push(spaceNode);
      if (parentZone) parentZone.childIds.push(spaceId);

      // Level 3: Room Node
      const roomNode: IHierarchyNode = {
        entityId: room.roomId,
        entityType: 'ROOM',
        entityName: room.semanticLabel || room.canonicalType,
        parentId: spaceId,
        childIds: [],
        depthLevel: 3,
        metadata: { centroid: room.centroid, area: room.areaSqMeters, confidence: room.confidence }
      };

      // Level 4: Objects inside room
      const objectsInRoom = v15Model.knowledgeReadyContext?.rooms?.find(r => r.roomId === room.roomId)?.containedObjects || [];

      // Level 5: Activities in room
      const roomAct = v15Model.activityInference?.roomActivities?.find(a => a.roomId === room.roomId);
      if (roomAct) {
        const actId = `ACT_${room.roomId}`;
        const actNode: IHierarchyNode = {
          entityId: actId,
          entityType: 'ACTIVITY',
          entityName: roomAct.primaryActivity,
          parentId: room.roomId,
          childIds: [],
          depthLevel: 5,
          metadata: { secondaryActivities: roomAct.secondaryActivities }
        };
        activityNodes.push(actNode);
        roomNode.childIds.push(actId);
      }

      // Level 7: Behaviors
      const behId = `BEH_${room.roomId}`;
      const behNode: IHierarchyNode = {
        entityId: behId,
        entityType: 'BEHAVIOR',
        entityName: `Behavior of ${room.canonicalType}`,
        parentId: room.roomId,
        childIds: [],
        depthLevel: 7
      };
      behaviorNodes.push(behNode);
      roomNode.childIds.push(behId);

      roomNodes.push(roomNode);
    });

    // Relationships (Level 6)
    semanticModel.relationshipGraph.edges.forEach(edge => {
      const relNode: IHierarchyNode = {
        entityId: edge.relationshipId,
        entityType: 'RELATIONSHIP',
        entityName: edge.description,
        parentId: edge.sourceRoomId,
        childIds: [edge.targetRoomId],
        depthLevel: 6,
        metadata: { relationshipType: edge.type, strengthScore: edge.strengthScore }
      };
      relationshipNodes.push(relNode);
    });

    const zoneNodesList = Array.from(zoneMap.values());

    return {
      propertyNode,
      zoneNodes: zoneNodesList,
      spaceNodes,
      roomNodes,
      objectNodes,
      activityNodes,
      relationshipNodes,
      behaviorNodes,
      totalHierarchyDepth: 7,
      hierarchyTree: propertyNode
    };
  }
}

export const spatialHierarchyEngine = SpatialHierarchyEngine.getInstance();
