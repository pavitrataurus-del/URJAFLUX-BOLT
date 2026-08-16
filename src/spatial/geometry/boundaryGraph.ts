import { WorkspaceDigitalTwin } from "../../types/app";
import { BoundaryPoint } from "../types/spatialModel";

/**
 * Extracts and maps building boundary vertices from WorkspaceDigitalTwin
 */
export function extractBuildingBoundary(
  digitalTwin: WorkspaceDigitalTwin
): BoundaryPoint[] {
  if (digitalTwin.buildingVertices && digitalTwin.buildingVertices.length > 0) {
    return digitalTwin.buildingVertices.map((v) => ({ x: v.x, y: v.y }));
  }

  // Fallback if no building vertices are explicitly locked
  return [];
}

/**
 * Extracts and maps property boundary vertices from WorkspaceDigitalTwin
 */
export function extractPropertyBoundary(
  digitalTwin: WorkspaceDigitalTwin
): BoundaryPoint[] {
  if (digitalTwin.propertyVertices && digitalTwin.propertyVertices.length > 0) {
    return digitalTwin.propertyVertices.map((v) => ({ x: v.x, y: v.y }));
  }

  // Fallback if no property vertices are explicitly locked
  return [];
}

/**
 * Calculates building bounding box or convex hull placeholder properties if needed
 */
export function getBoundingBox(points: BoundaryPoint[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (!points || points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  return { minX, minY, maxX, maxY };
}
