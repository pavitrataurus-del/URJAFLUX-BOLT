import { FloorPlan, Room, Door, Coordinate, TopologyGraph } from './SpatialTypes';

export class SpatialRelationshipEngine {
  private static instance: SpatialRelationshipEngine;

  private constructor() {}

  public static getInstance(): SpatialRelationshipEngine {
    if (!SpatialRelationshipEngine.instance) {
      SpatialRelationshipEngine.instance = new SpatialRelationshipEngine();
    }
    return SpatialRelationshipEngine.instance;
  }

  /**
   * Check if point is contained inside polygon
   */
  public isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Synthesize topology network graph representing room connectivity and door access
   */
  public buildTopologyGraph(floorPlan: FloorPlan): TopologyGraph {
    const nodes = floorPlan.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.roomType,
      direction: r.cardinalDirection
    }));

    const edges: { source: string; target: string; relationship: 'ADJACENT' | 'CONNECTED_DOOR' | 'CONTAINS' }[] = [];

    // Door connectivity
    floorPlan.doors.forEach((door) => {
      if (door.connectsRoomIds.length === 2) {
        edges.push({
          source: door.connectsRoomIds[0],
          target: door.connectsRoomIds[1],
          relationship: 'CONNECTED_DOOR'
        });
      }
    });

    // Room adjacency
    floorPlan.rooms.forEach((r1) => {
      r1.adjacentRoomIds.forEach((adjId) => {
        // avoid duplicates
        if (!edges.some((e) => (e.source === r1.id && e.target === adjId) || (e.source === adjId && e.target === r1.id))) {
          edges.push({
            source: r1.id,
            target: adjId,
            relationship: 'ADJACENT'
          });
        }
      });
    });

    return {
      nodes,
      edges
    };
  }

  /**
   * Determine room containing point
   */
  public findContainingRoom(point: Coordinate, rooms: Room[]): Room | null {
    for (const room of rooms) {
      if (this.isPointInPolygon(point, room.boundary.points)) {
        return room;
      }
    }
    return null;
  }
}
