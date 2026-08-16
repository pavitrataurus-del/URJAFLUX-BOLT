import { Point2D, RoomDetection } from "../../types/aiVision";
import { RoomGraph, RoomNode } from "../types/spatialModel";
import { CanonicalSpatialCalculationEngine } from "../../core/spatial/CanonicalSpatialCalculationEngine";

/**
 * Calculates the centroid of a 2D polygon
 * Delegates directly to CanonicalSpatialCalculationEngine (SSOT)
 */
export function calculateCentroid(polygon: Point2D[]): Point2D {
  return CanonicalSpatialCalculationEngine.calculateCentroid(polygon);
}

/**
 * Calculates the area of a polygon in square meters using Shoelace Formula
 * areaInPixels * (scaleRatio^2) = areaInMeters
 */
export function calculatePolygonArea(polygon: Point2D[], scaleRatio: number): number {
  if (!polygon || polygon.length < 3) {
    return 0;
  }

  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    area += p1.x * p2.y - p2.x * p1.y;
  }
  
  const areaInPixels = Math.abs(area) * 0.5;
  // Convert square pixels to square meters
  return areaInPixels * (scaleRatio * scaleRatio);
}

/**
 * Determines if two room polygons are adjacent by checking minimum distance between vertices/edges
 */
export function areRoomsAdjacent(polyA: Point2D[], polyB: Point2D[], thresholdPx: number = 30): boolean {
  if (!polyA || !polyB || polyA.length === 0 || polyB.length === 0) {
    return false;
  }

  // Simple heuristic check: distance between any vertex of polyA and any vertex of polyB
  for (const ptA of polyA) {
    for (const ptB of polyB) {
      const dx = ptA.x - ptB.x;
      const dy = ptA.y - ptB.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= thresholdPx) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Converts detected rooms into a room graph with adjacencies
 */
export function buildRoomGraph(
  detections: RoomDetection[], 
  scaleRatio: number
): RoomGraph {
  const rooms: RoomNode[] = detections.map((det) => {
    const centroid = calculateCentroid(det.polygon);
    const calculatedArea = calculatePolygonArea(det.polygon, scaleRatio);
    
    return {
      id: det.id,
      name: det.name,
      centroid,
      area: det.areaMeters || calculatedArea,
      polygon: det.polygon,
      adjacencies: []
    };
  });

  const adjacencyList: Record<string, string[]> = {};

  // Build adjacencies
  for (let i = 0; i < rooms.length; i++) {
    const rA = rooms[i];
    adjacencyList[rA.id] = [];
    
    for (let j = 0; j < rooms.length; j++) {
      if (i === j) continue;
      const rB = rooms[j];
      
      if (areRoomsAdjacent(rA.polygon, rB.polygon)) {
        adjacencyList[rA.id].push(rB.id);
      }
    }
    
    rA.adjacencies = adjacencyList[rA.id];
  }

  return {
    rooms,
    adjacencyList
  };
}
