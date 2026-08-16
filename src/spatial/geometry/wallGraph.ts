import { Point2D, WallDetection } from "../../types/aiVision";
import { RoomNode, WallGraph, WallSegment } from "../types/spatialModel";

/**
 * Calculates the shortest distance from a 2D point to a line segment
 */
export function pointToSegmentDistance(p: Point2D, s1: Point2D, s2: Point2D): number {
  const dx = s2.x - s1.x;
  const dy = s2.y - s1.y;
  
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) {
    // Segment is a single point
    const diffX = p.x - s1.x;
    const diffY = p.y - s1.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  }

  // Projection fraction t
  let t = ((p.x - s1.x) * dx + (p.y - s1.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t)); // Clamp to segment length

  const projX = s1.x + t * dx;
  const projY = s1.y + t * dy;

  const diffX = p.x - projX;
  const diffY = p.y - projY;
  return Math.sqrt(diffX * diffX + diffY * diffY);
}

/**
 * Finds which room IDs are connected/adjacent to a wall segment
 * Heuristic: rooms whose polygon vertices are very close to the wall segment
 */
export function findConnectedRooms(
  wallStart: Point2D,
  wallEnd: Point2D,
  rooms: RoomNode[],
  thresholdPx: number = 25
): string[] {
  const connected: string[] = [];

  for (const room of rooms) {
    // Check if any of the room polygon vertices is close to the wall
    let isClose = false;
    for (const vert of room.polygon) {
      if (pointToSegmentDistance(vert, wallStart, wallEnd) <= thresholdPx) {
        isClose = true;
        break;
      }
    }
    
    // Check centroid as well
    if (!isClose && pointToSegmentDistance(room.centroid, wallStart, wallEnd) <= thresholdPx * 2) {
      isClose = true;
    }

    if (isClose) {
      connected.push(room.id);
    }
  }

  return connected;
}

/**
 * Builds a wall graph from wall detections and resolved room nodes
 */
export function buildWallGraph(
  detections: WallDetection[],
  rooms: RoomNode[]
): WallGraph {
  const walls: WallSegment[] = detections.map((det) => {
    const connectedRooms = findConnectedRooms(det.startPoint, det.endPoint, rooms);
    
    return {
      id: det.id,
      startPoint: det.startPoint,
      endPoint: det.endPoint,
      thickness: det.thicknessPx || 10,
      type: det.type,
      connectedRooms
    };
  });

  return {
    walls
  };
}
