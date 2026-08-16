import { Point2D, Vector2D, Rectangle, Triangle, Polygon, Circle, LineSegment, BoundingBox } from '../types';
import { VectorUtils } from '../primitives/Vector';

/**
 * Calculates unsigned angle between two vectors [0, PI] or [0, 180°]
 */
export function angleBetweenVectors(v1: Vector2D, v2: Vector2D, inDegrees: boolean = true): number {
  const mag1 = VectorUtils.magnitude(v1);
  const mag2 = VectorUtils.magnitude(v2);
  if (mag1 === 0 || mag2 === 0) return 0;

  const dot = VectorUtils.dot(v1, v2);
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  const rad = Math.acos(cosTheta);

  return inDegrees ? rad * (180 / Math.PI) : rad;
}

/**
 * Calculates signed angle between two vectors [-PI, PI] or [-180°, 180°]
 */
export function signedAngleBetweenVectors(v1: Vector2D, v2: Vector2D, inDegrees: boolean = true): number {
  const rad = Math.atan2(VectorUtils.cross(v1, v2), VectorUtils.dot(v1, v2));
  return inDegrees ? rad * (180 / Math.PI) : rad;
}

/**
 * Calculates signed area of a polygon (positive if counter-clockwise, negative if clockwise)
 */
export function polygonSignedArea(polygon: Polygon): number {
  const verts = polygon.vertices;
  const n = verts.length;
  if (n < 3) return 0;

  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += verts[i].x * verts[j].y - verts[j].x * verts[i].y;
  }
  return area / 2;
}

/**
 * Calculates absolute area of a polygon using Shoelace formula
 */
export function polygonArea(polygon: Polygon): number {
  return Math.abs(polygonSignedArea(polygon));
}

/**
 * Calculates geometric centroid (center of mass) of a polygon
 */
export function polygonCentroid(polygon: Polygon): Point2D {
  const verts = polygon.vertices;
  const n = verts.length;
  if (n === 0) {
    throw new Error('Cannot compute centroid of empty polygon');
  }

  const signedArea = polygonSignedArea(polygon);

  if (Math.abs(signedArea) < 1e-10) {
    // Fallback for degenerate polygons
    let sumX = 0, sumY = 0;
    for (const v of verts) {
      sumX += v.x;
      sumY += v.y;
    }
    return Object.freeze({ x: sumX / n, y: sumY / n });
  }

  let cx = 0;
  let cy = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const factor = verts[i].x * verts[j].y - verts[j].x * verts[i].y;
    cx += (verts[i].x + verts[j].x) * factor;
    cy += (verts[i].y + verts[j].y) * factor;
  }

  cx /= (6 * signedArea);
  cy /= (6 * signedArea);

  return Object.freeze({ x: cx, y: cy });
}

/**
 * Calculates center point of a rectangle
 */
export function rectangleCenter(rect: Rectangle): Point2D {
  return Object.freeze({
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  });
}

/**
 * Calculates centroid of a triangle
 */
export function triangleCentroid(triangle: Triangle): Point2D {
  return Object.freeze({
    x: (triangle.a.x + triangle.b.x + triangle.c.x) / 3,
    y: (triangle.a.y + triangle.b.y + triangle.c.y) / 3
  });
}

/**
 * Calculates center of a circle
 */
export function circleCenter(circle: Circle): Point2D {
  return Object.freeze({
    x: circle.center.x,
    y: circle.center.y
  });
}

/**
 * Calculates bounding box for an arbitrary set of 2D points
 */
export function boundingBoxForPoints(points: readonly Point2D[]): BoundingBox {
  if (points.length === 0) {
    throw new Error('Cannot compute bounding box for empty point set');
  }

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  return Object.freeze({
    min: Object.freeze({ x: minX, y: minY }),
    max: Object.freeze({ x: maxX, y: maxY })
  });
}

/**
 * Calculates bounding box for a polygon
 */
export function boundingBoxForPolygon(polygon: Polygon): BoundingBox {
  return boundingBoxForPoints(polygon.vertices);
}

/**
 * Calculates bounding box for a triangle
 */
export function boundingBoxForTriangle(triangle: Triangle): BoundingBox {
  return boundingBoxForPoints([triangle.a, triangle.b, triangle.c]);
}

/**
 * Calculates bounding box for a circle
 */
export function boundingBoxForCircle(circle: Circle): BoundingBox {
  return Object.freeze({
    min: Object.freeze({ x: circle.center.x - circle.radius, y: circle.center.y - circle.radius }),
    max: Object.freeze({ x: circle.center.x + circle.radius, y: circle.center.y + circle.radius })
  });
}

/**
 * Calculates bounding box for a line segment
 */
export function boundingBoxForSegment(segment: LineSegment): BoundingBox {
  return boundingBoxForPoints([segment.p1, segment.p2]);
}
