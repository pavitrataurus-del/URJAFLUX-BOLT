import { Point2D, Vector2D, Polygon } from '../types';

/**
 * Rotates a 2D point around a pivot center point
 */
export function rotatePointAround(
  point: Point2D,
  center: Point2D,
  angle: number,
  isDegrees: boolean = true
): Point2D {
  const rad = isDegrees ? (angle * Math.PI) / 180 : angle;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return Object.freeze({
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos)
  });
}

/**
 * Rotates a vector by an angle
 */
export function rotateVector(
  v: Vector2D,
  angle: number,
  isDegrees: boolean = true
): Vector2D {
  const rad = isDegrees ? (angle * Math.PI) / 180 : angle;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return Object.freeze({
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos
  });
}

/**
 * Translates a point by a offset vector or dx, dy
 */
export function translatePoint(point: Point2D, translation: Vector2D): Point2D {
  return Object.freeze({
    x: point.x + translation.x,
    y: point.y + translation.y
  });
}

/**
 * Scales a point relative to a pivot center
 */
export function scalePointAround(
  point: Point2D,
  center: Point2D,
  scaleX: number,
  scaleY: number = scaleX
): Point2D {
  return Object.freeze({
    x: center.x + (point.x - center.x) * scaleX,
    y: center.y + (point.y - center.y) * scaleY
  });
}

/**
 * Rotates all vertices of a polygon around a center point
 */
export function rotatePolygonAround(
  polygon: Polygon,
  center: Point2D,
  angle: number,
  isDegrees: boolean = true
): Polygon {
  const rotated = polygon.vertices.map((v) => rotatePointAround(v, center, angle, isDegrees));
  return Object.freeze({ vertices: Object.freeze(rotated) });
}
