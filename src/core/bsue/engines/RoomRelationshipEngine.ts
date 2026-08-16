// ============================================================================
// URJAFLUX AI OS - BSUE STEP 6: ROOM RELATIONSHIP ENGINE
// Semantic spatial relationship graph builder: Attached Toilets, Kitchen-Dining,
// Living-Dining-Circulation, Temple-Living, Entrance-Garage
// ============================================================================

import { 
  ISemanticRelationshipGraph, 
  ISemanticRelationshipEdge, 
  ISemanticRoom, 
  BmueRelationshipType 
} from "../types/bsue.types";

import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class RoomRelationshipEngine {
  private static instance: RoomRelationshipEngine;

  private constructor() {}

  public static getInstance(): RoomRelationshipEngine {
    if (!RoomRelationshipEngine.instance) {
      RoomRelationshipEngine.instance = new RoomRelationshipEngine();
    }
    return RoomRelationshipEngine.instance;
  }

  public buildRelationshipGraph(
    semanticRooms: ISemanticRoom[],
    bmueModel: IBlueprintMathematicalModel
  ): ISemanticRelationshipGraph {
    const edges: ISemanticRelationshipEdge[] = [];
    const attachedToiletPairs: Array<{ bedroomId: string; toiletId: string }> = [];
    const kitchenDiningPairs: Array<{ kitchenId: string; diningId: string }> = [];
    let idx = 1;

    // Helper to find room by ID or type
    const findRoom = (id: string) => semanticRooms.find(r => r.roomId === id);

    // 1. Traverse Door Connections from BMUE Connectivity Graph
    bmueModel.connectivityGraph.edges.forEach(conn => {
      const roomA = findRoom(conn.roomAId);
      const roomB = findRoom(conn.roomBId);

      if (roomA && roomB) {
        let type: BmueRelationshipType = 'DIRECTLY_CONNECTED_BY_DOOR';
        let description = `${roomA.semanticLabel} connects directly to ${roomB.semanticLabel}`;

        // Check Attached Toilet relationship
        const isBedA = roomA.canonicalType.includes('BEDROOM');
        const isBedB = roomB.canonicalType.includes('BEDROOM');
        const isToiletA = roomA.canonicalType === 'TOILET';
        const isToiletB = roomB.canonicalType === 'TOILET';

        if ((isBedA && isToiletB) || (isBedB && isToiletA)) {
          type = 'ATTACHED';
          const bedId = isBedA ? roomA.roomId : roomB.roomId;
          const toiletId = isToiletA ? roomA.roomId : roomB.roomId;
          description = `Private attached toilet dedicated to ${isBedA ? roomA.semanticLabel : roomB.semanticLabel}`;
          
          if (!attachedToiletPairs.some(p => p.bedroomId === bedId && p.toiletId === toiletId)) {
            attachedToiletPairs.push({ bedroomId: bedId, toiletId });
          }
        }

        // Check Kitchen-Dining direct connection
        const isKitA = roomA.canonicalType === 'KITCHEN';
        const isKitB = roomB.canonicalType === 'KITCHEN';
        const isDinA = roomA.canonicalType === 'DINING_ROOM' || roomA.canonicalType === 'LIVING_ROOM';
        const isDinB = roomB.canonicalType === 'DINING_ROOM' || roomB.canonicalType === 'LIVING_ROOM';

        if ((isKitA && isDinB) || (isKitB && isDinA)) {
          const kitId = isKitA ? roomA.roomId : roomB.roomId;
          const dinId = isDinA ? roomA.roomId : roomB.roomId;
          description = `Direct service circulation between Kitchen and Dining area`;

          if (!kitchenDiningPairs.some(p => p.kitchenId === kitId && p.diningId === dinId)) {
            kitchenDiningPairs.push({ kitchenId: kitId, diningId: dinId });
          }
        }

        edges.push({
          relationshipId: `REL_${idx++}`,
          sourceRoomId: roomA.roomId,
          targetRoomId: roomB.roomId,
          type,
          description,
          strengthScore: 0.95
        });
      }
    });

    // 2. Spatial Adjacency (Sharing Wall Vectors without door)
    bmueModel.wallGraph.walls.forEach(wall => {
      // If wall shared between 2 rooms
      if (wall.connectedVertexIds.length >= 2) {
        // Look up rooms close to this wall
        semanticRooms.forEach((rA, i) => {
          semanticRooms.forEach((rB, j) => {
            if (i < j) {
              const distA = Math.hypot(rA.centroid.x - wall.start.x, rA.centroid.y - wall.start.y);
              const distB = Math.hypot(rB.centroid.x - wall.start.x, rB.centroid.y - wall.start.y);
              if (distA < 4.0 && distB < 4.0) {
                const exists = edges.some(e => (e.sourceRoomId === rA.roomId && e.targetRoomId === rB.roomId) || (e.sourceRoomId === rB.roomId && e.targetRoomId === rA.roomId));
                if (!exists) {
                  edges.push({
                    relationshipId: `REL_${idx++}`,
                    sourceRoomId: rA.roomId,
                    targetRoomId: rB.roomId,
                    type: 'ADJACENT_WALL_SHARING',
                    description: `${rA.semanticLabel} shares a partition wall vector with ${rB.semanticLabel}`,
                    strengthScore: 0.80
                  });
                }
              }
            }
          });
        });
      }
    });

    return {
      edges,
      attachedToiletPairs,
      kitchenDiningPairs
    };
  }
}

export const roomRelationshipEngine = RoomRelationshipEngine.getInstance();
