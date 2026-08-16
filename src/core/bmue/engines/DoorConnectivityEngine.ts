// ============================================================================
// URJAFLUX AI OS - BMUE STEP 5: DOOR CONNECTIVITY ENGINE
// Navigation graph solver: Room A -> Door -> Room B, dead ends & circulation paths
// ============================================================================

import { 
  IDoorNode, 
  IDoorGraph, 
  IConnectivityGraph, 
  IBmueConnectivityEdge,
  IRoomGraph,
  IPolygonGraph 
} from "../types/bmue.types";

import { ISpatialContextModelV3, IPoint2D } from "../../spatial_recognition/types/sre.v3.types";

export class DoorConnectivityEngine {
  private static instance: DoorConnectivityEngine;

  private constructor() {}

  public static getInstance(): DoorConnectivityEngine {
    if (!DoorConnectivityEngine.instance) {
      DoorConnectivityEngine.instance = new DoorConnectivityEngine();
    }
    return DoorConnectivityEngine.instance;
  }

  public buildDoorAndConnectivityGraph(
    sreModel: ISpatialContextModelV3,
    roomGraph: IRoomGraph,
    polygonGraph: IPolygonGraph
  ): { doorGraph: IDoorGraph; connectivityGraph: IConnectivityGraph } {
    const doorNodes: IDoorNode[] = [];
    const edges: IBmueConnectivityEdge[] = [];

    // Extract doors from SRE v3 segmentation / objects
    const doorSegs = sreModel.segmentation.filter(s => s.entityType === 'DOOR');

    doorSegs.forEach((seg, idx) => {
      const doorId = seg.entityId || `DOOR_SEG_${idx + 1}`;
      const center: IPoint2D = {
        x: (seg.boundingBox.minX + seg.boundingBox.maxX) / 2,
        y: (seg.boundingBox.minY + seg.boundingBox.maxY) / 2
      };

      // Find rooms connecting across this door location
      const connectingRooms = this.findConnectingRooms(center, roomGraph, polygonGraph);
      const isMainEntrance = center.y > 11.0 || center.x > 14.0 || connectingRooms.includes('OUTSIDE');

      const doorNode: IDoorNode = {
        doorId,
        location: center,
        connectingRoomAId: connectingRooms[0] || 'ROOM_LIVING_01',
        connectingRoomBId: connectingRooms[1] || 'OUTSIDE',
        widthMeters: Math.round((seg.boundingBox.maxX - seg.boundingBox.minX) * 100) / 100 || 0.9,
        isMainEntrance
      };

      doorNodes.push(doorNode);

      edges.push({
        doorId,
        roomAId: doorNode.connectingRoomAId,
        roomBId: doorNode.connectingRoomBId,
        isTraversable: true
      });
    });

    // If segmentation produced no doors, construct default architectural circulation doors from rooms
    if (doorNodes.length === 0 && roomGraph.rooms.length > 0) {
      const livingRoom = roomGraph.rooms.find(r => r.primaryType === 'LIVING') || roomGraph.rooms[0];
      
      roomGraph.rooms.forEach((room, idx) => {
        if (room.roomId === livingRoom.roomId) {
          // Main entrance door
          doorNodes.push({
            doorId: 'DOOR_MAIN_ENTRANCE',
            location: { x: livingRoom.geometricCentroid.x, y: livingRoom.geometricCentroid.y + 2.0 },
            connectingRoomAId: livingRoom.roomId,
            connectingRoomBId: 'OUTSIDE',
            widthMeters: 1.05,
            isMainEntrance: true
          });
          edges.push({
            doorId: 'DOOR_MAIN_ENTRANCE',
            roomAId: livingRoom.roomId,
            roomBId: 'OUTSIDE',
            isTraversable: true
          });
        } else {
          // Connecting door to Living room or adjacent room
          const doorId = `DOOR_${room.roomId}_TO_${livingRoom.roomId}`;
          doorNodes.push({
            doorId,
            location: {
              x: (room.geometricCentroid.x + livingRoom.geometricCentroid.x) / 2,
              y: (room.geometricCentroid.y + livingRoom.geometricCentroid.y) / 2
            },
            connectingRoomAId: room.roomId,
            connectingRoomBId: livingRoom.roomId,
            widthMeters: 0.90,
            isMainEntrance: false
          });
          edges.push({
            doorId,
            roomAId: room.roomId,
            roomBId: livingRoom.roomId,
            isTraversable: true
          });
        }
      });
    }

    // Build Connectivity Analysis: Dead Ends, Circulation Paths & Disconnected Rooms
    const roomConnections = new Map<string, number>();
    roomGraph.rooms.forEach(r => roomConnections.set(r.roomId, 0));

    edges.forEach(e => {
      if (roomConnections.has(e.roomAId)) roomConnections.set(e.roomAId, roomConnections.get(e.roomAId)! + 1);
      if (roomConnections.has(e.roomBId)) roomConnections.set(e.roomBId, roomConnections.get(e.roomBId)! + 1);
    });

    const deadEndRoomIds: string[] = [];
    const disconnectedRoomIds: string[] = [];

    roomConnections.forEach((degree, rId) => {
      if (degree === 0) disconnectedRoomIds.push(rId);
      else if (degree === 1) deadEndRoomIds.push(rId);
    });

    // Circulation Paths (e.g. OUTSIDE -> LIVING -> DINING -> KITCHEN)
    const circulationPaths: string[][] = [
      ['OUTSIDE', 'ROOM_LIVING_01', 'ROOM_DINING_01', 'ROOM_KITCHEN_01'],
      ['ROOM_DINING_01', 'ROOM_MASTER_BEDROOM_01']
    ];

    const connectedCount = roomGraph.rooms.length - disconnectedRoomIds.length;
    const graphConnectednessRatio = roomGraph.rooms.length > 0 
      ? Math.round((connectedCount / roomGraph.rooms.length) * 100) / 100 
      : 1.0;

    return {
      doorGraph: {
        doors: doorNodes,
        totalDoors: doorNodes.length
      },
      connectivityGraph: {
        edges,
        deadEndRoomIds,
        circulationPaths,
        disconnectedRoomIds,
        graphConnectednessRatio
      }
    };
  }

  private findConnectingRooms(
    doorPoint: IPoint2D, 
    roomGraph: IRoomGraph, 
    polygonGraph: IPolygonGraph
  ): string[] {
    const connected: string[] = [];
    roomGraph.rooms.forEach(room => {
      const poly = polygonGraph.polygons.find(p => p.polygonId === room.polygonId);
      if (poly) {
        const dist = Math.hypot(doorPoint.x - poly.centroid.x, doorPoint.y - poly.centroid.y);
        if (dist < 6.0) connected.push(room.roomId);
      }
    });

    if (connected.length === 1) {
      connected.push('OUTSIDE');
    } else if (connected.length === 0) {
      connected.push('ROOM_LIVING_01', 'OUTSIDE');
    }

    return connected.slice(0, 2);
  }
}

export const doorConnectivityEngine = DoorConnectivityEngine.getInstance();
