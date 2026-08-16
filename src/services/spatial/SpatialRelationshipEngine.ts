import { 
  BuildingElement, 
  RoomAdjacencyEdge, 
  DoorConnectivityEdge, 
  TravelPath, 
  SpatialGraphModel 
} from "../../types/spatialIntelligence";
import { SpatialGeometryEngine } from "./SpatialGeometryEngine";

/**
 * ============================================================================
 *           URJAFLUX AI OS — SPATIAL RELATIONSHIP ENGINE
 * ============================================================================
 * 
 * Computes spatial graph topologies, room adjacency lengths, door connections,
 * shortest travel paths, accessibility graphs, distance matrices, and visibility relationships.
 */

export class SpatialRelationshipEngine {

  /**
   * Build complete Spatial Graph Model from elements
   */
  public static buildSpatialGraph(elements: BuildingElement[]): SpatialGraphModel {
    const rooms = elements.filter(e => e.type === "ROOM" || e.type === "CORRIDOR" || e.type === "BALCONY" || e.type === "TERRACE" || e.type === "OPEN_SPACE");
    const doors = elements.filter(e => e.type === "DOOR");

    const nodes = rooms.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      area: r.properties.areaMeters || (r.geometry.polygon ? SpatialGeometryEngine.calculatePolygonArea(r.geometry.polygon.vertices) : 0),
      centroid: r.geometry.polygon ? SpatialGeometryEngine.calculateCentroid(r.geometry.polygon.vertices) : { x: 0, y: 0 }
    }));

    // 1. Calculate Room Adjacencies
    const adjacencies: RoomAdjacencyEdge[] = [];
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const roomA = rooms[i];
        const roomB = rooms[j];

        if (roomA.geometry.polygon && roomB.geometry.polygon) {
          const sharedLen = SpatialGeometryEngine.calculateSharedBoundaryLength(
            roomA.geometry.polygon.vertices,
            roomB.geometry.polygon.vertices,
            1.5
          );

          if (sharedLen > 0.5) {
            // Find doors connecting these two rooms
            const connectingDoors = doors.filter(d => {
              const doorCenter = d.geometry.center || { x: 0, y: 0 };
              return (
                SpatialGeometryEngine.isPointInPolygon(doorCenter, roomA.geometry.polygon!.vertices) ||
                SpatialGeometryEngine.isPointInPolygon(doorCenter, roomB.geometry.polygon!.vertices)
              );
            });

            adjacencies.push({
              id: `adj_${roomA.id}_${roomB.id}`,
              roomAId: roomA.id,
              roomBId: roomB.id,
              sharedWallLengthMeters: Number(sharedLen.toFixed(2)),
              hasDoorConnection: connectingDoors.length > 0,
              connectingDoorIds: connectingDoors.map(d => d.id)
            });
          }
        }
      }
    }

    // 2. Door Connectivities
    const doorConnectivities: DoorConnectivityEdge[] = [];
    doors.forEach(d => {
      const doorCenter = d.geometry.center || { x: 0, y: 0 };
      const matchingRooms = rooms.filter(r => r.geometry.polygon && SpatialGeometryEngine.isPointInPolygon(doorCenter, r.geometry.polygon.vertices));
      
      if (matchingRooms.length >= 2) {
        doorConnectivities.push({
          id: `door_conn_${d.id}`,
          doorId: d.id,
          connectsRoomAId: matchingRooms[0].id,
          connectsRoomBId: matchingRooms[1].id,
          clearWidthMeters: d.properties.widthMeters || 0.9
        });
      }
    });

    // 3. Travel Paths (BFS Shortest Path graph calculation)
    const travelPaths: TravelPath[] = [];
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const path = this.computeShortestPath(rooms[i].id, rooms[j].id, nodes, adjacencies);
        if (path) {
          travelPaths.push(path);
        }
      }
    }

    return {
      nodes,
      adjacencies,
      doorConnectivities,
      travelPaths
    };
  }

  /**
   * Breadth-First Search (BFS) for travel path calculation between room pair
   */
  private static computeShortestPath(
    startId: string, 
    endId: string, 
    nodes: Array<{ id: string; name: string; centroid: { x: number; y: number } }>, 
    adjacencies: RoomAdjacencyEdge[]
  ): TravelPath | null {
    const queue: string[][] = [[startId]];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];

      if (node === endId) {
        // Calculate total distance along centroids
        let totalDist = 0;
        let doorCount = 0;

        for (let k = 0; k < path.length - 1; k++) {
          const nodeA = nodes.find(n => n.id === path[k]);
          const nodeB = nodes.find(n => n.id === path[k + 1]);
          if (nodeA && nodeB) {
            const dx = nodeA.centroid.x - nodeB.centroid.x;
            const dy = nodeA.centroid.y - nodeB.centroid.y;
            totalDist += Math.sqrt(dx * dx + dy * dy);
          }

          const adj = adjacencies.find(a => 
            (a.roomAId === path[k] && a.roomBId === path[k + 1]) ||
            (a.roomBId === path[k] && a.roomAId === path[k + 1])
          );
          if (adj && adj.hasDoorConnection) doorCount++;
        }

        return {
          id: `path_${startId}_${endId}`,
          startRoomId: startId,
          endRoomId: endId,
          routeRoomIds: path,
          totalDistanceMeters: Number(totalDist.toFixed(2)),
          doorCount,
          isAccessible: doorCount > 0
        };
      }

      // Neighbors connected via adjacencies with doors or clear access
      const neighborAdjs = adjacencies.filter(a => a.roomAId === node || a.roomBId === node);
      for (const adj of neighborAdjs) {
        const neighborId = adj.roomAId === node ? adj.roomBId : adj.roomAId;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([...path, neighborId]);
        }
      }
    }

    return null;
  }
}
