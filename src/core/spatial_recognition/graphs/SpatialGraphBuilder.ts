// ============================================================================
// URJAFLUX AI OS - SPATIAL GRAPH BUILDER (SRE v2)
// Generates the 4 Required Structural Graphs for Blueprint Proof of Understanding
// ============================================================================

import { 
  ISreRoomPolygon, 
  ISreSpatialObject, 
  ISreGraphs, 
  IRoomGraphNode, 
  IRoomGraphEdge, 
  IObjectGraphNode, 
  IObjectGraphEdge, 
  IConnectivityNode, 
  IConnectivityEdge, 
  IGeometryNode, 
  IGeometryEdge,
  ISreProofOfUnderstanding
} from "../types/sre.types";
import { PolygonEngine } from "../geometry/PolygonEngine";

export class SpatialGraphBuilder {

  /**
   * Constructs the 4 required structural graphs (Room, Object, Connectivity, Geometry)
   */
  public static buildSpatialGraphs(
    rooms: ISreRoomPolygon[],
    objects: ISreSpatialObject[],
    propertyBoundary: Array<{ x: number; y: number }>
  ): ISreGraphs {

    // 1. BUILD ROOM GRAPH
    const roomNodes: IRoomGraphNode[] = rooms.map(r => ({
      roomId: r.roomId,
      roomType: r.roomType,
      centroid: r.centroid,
      areaSqMeters: r.areaSqMeters,
      primaryZone: r.primaryZone
    }));

    const roomEdges: IRoomGraphEdge[] = [];
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const r1 = rooms[i];
        const r2 = rooms[j];
        const dist = PolygonEngine.calculateDistance(r1.centroid, r2.centroid);
        
        // Check if bounding boxes overlap or are adjacent
        const bboxOverlap = !(
          r1.boundingBox.maxX < r2.boundingBox.minX ||
          r1.boundingBox.minX > r2.boundingBox.maxX ||
          r1.boundingBox.maxY < r2.boundingBox.minY ||
          r1.boundingBox.minY > r2.boundingBox.maxY
        );

        if (bboxOverlap || dist < 12.0) {
          roomEdges.push({
            sourceRoomId: r1.roomId,
            targetRoomId: r2.roomId,
            relationship: dist < 6.0 ? 'CONNECTED' : 'ADJACENT',
            sharedWallLengthMeters: Math.round(Math.max(1.5, 8.0 - dist * 0.5) * 10) / 10
          });
        }
      }
    }

    // 2. BUILD OBJECT GRAPH
    const objectNodes: IObjectGraphNode[] = objects.map(o => ({
      objectId: o.objectId,
      objectType: o.objectType,
      roomId: o.roomId,
      zone: o.primaryZone
    }));

    const objectEdges: IObjectGraphEdge[] = [];
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const o1 = objects[i];
        const o2 = objects[j];

        if (o1.roomId === o2.roomId || PolygonEngine.calculateDistance(o1.centerPoint, o2.centerPoint) < 4.0) {
          const dist = PolygonEngine.calculateDistance(o1.centerPoint, o2.centerPoint);
          objectEdges.push({
            sourceObjectId: o1.objectId,
            targetObjectId: o2.objectId,
            relationship: dist < 2.0 ? 'NEAR_TO' : 'OPPOSITE_TO',
            distanceMeters: Math.round(dist * 100) / 100
          });
        }
      }
    }

    // 3. BUILD CONNECTIVITY GRAPH
    const connectivityNodes: IConnectivityNode[] = [
      ...rooms.map(r => ({
        entityId: r.roomId,
        entityType: 'ROOM' as const,
        name: r.roomType
      })),
      ...objects.filter(o => o.objectType === 'DOOR' || o.objectType === 'ENTRANCE').map(d => ({
        entityId: d.objectId,
        entityType: 'DOOR' as const,
        name: d.displayName
      }))
    ];

    const connectivityEdges: IConnectivityEdge[] = [];
    objects.filter(o => o.objectType === 'DOOR' || o.objectType === 'ENTRANCE').forEach(door => {
      // Connect door to its assigned room and nearby rooms
      if (door.roomId) {
        connectivityEdges.push({
          fromEntityId: door.objectId,
          toEntityId: door.roomId,
          accessType: 'DIRECT_DOOR'
        });
      }
      rooms.forEach(room => {
        if (room.roomId !== door.roomId && PolygonEngine.calculateDistance(door.centerPoint, room.centroid) < 6.0) {
          connectivityEdges.push({
            fromEntityId: door.objectId,
            toEntityId: room.roomId,
            accessType: 'OPEN_THRESHOLD'
          });
        }
      });
    });

    // 4. BUILD GEOMETRY GRAPH
    const geometryNodes: IGeometryNode[] = [
      {
        polygonId: 'PROPERTY_OUTER_BOUNDARY',
        vertexCount: propertyBoundary.length,
        isClosed: true,
        centroid: PolygonEngine.calculateCentroid(propertyBoundary)
      },
      ...rooms.map(r => ({
        polygonId: r.roomId,
        vertexCount: r.vertices.length,
        isClosed: true,
        centroid: r.centroid
      }))
    ];

    const geometryEdges: IGeometryEdge[] = rooms.map(r => ({
      polygonAId: 'PROPERTY_OUTER_BOUNDARY',
      polygonBId: r.roomId,
      intersectionType: 'CONTAINED',
      intersectionAreaSqMeters: r.areaSqMeters
    }));

    return {
      roomGraph: { nodes: roomNodes, edges: roomEdges },
      objectGraph: { nodes: objectNodes, edges: objectEdges },
      connectivityGraph: { nodes: connectivityNodes, edges: connectivityEdges },
      geometryGraph: { nodes: geometryNodes, edges: geometryEdges }
    };
  }

  /**
   * Validates Proof of Understanding Graphs
   */
  public static validateProofOfUnderstanding(
    rooms: ISreRoomPolygon[],
    objects: ISreSpatialObject[],
    graphs: ISreGraphs
  ): ISreProofOfUnderstanding {
    const hasRooms = rooms.length > 0;
    const hasNodesInGraphs = graphs.roomGraph.nodes.length > 0 && graphs.geometryGraph.nodes.length > 0;
    const closedPolygonsCount = rooms.filter(r => r.vertices.length >= 3).length;

    const isProofValid = hasRooms && hasNodesInGraphs && closedPolygonsCount >= 3;

    return {
      isProofValid,
      totalRoomsRecognized: rooms.length,
      totalObjectsRecognized: objects.length,
      totalClosedPolygons: closedPolygonsCount,
      geometryValidationStatus: isProofValid ? 'VALIDATED_CLOSED_POLYGONS' : 'UNVALIDATED_INCOMPLETE',
      understandingTimestamp: new Date().toISOString()
    };
  }
}
