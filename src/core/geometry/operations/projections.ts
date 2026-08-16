import { Point2D, Vector2D, LineSegment, InfiniteLine, Ray } from '../types';
import { VectorUtils } from '../primitives/Vector';

/**
 * Projects a 2D point onto an infinite line
 */
export function projectPointOntoInfiniteLine(point: Point2D, line: InfiniteLine): Point2D {
  const v = VectorUtils.fromPoints(line.p1, line.p2);
  const lenSq = VectorUtils.dot(v, v);
  if (lenSq === 0) return line.p1;

  const w = VectorUtils.fromPoints(line.p1, point);
  const t = VectorUtils.dot(w, v) / lenSq;

  return Object.freeze({
    x: line.p1.x + t * v.x,
    y: line.p1.y + t * v.y
  });
}

/**
 * Projects a 2D point onto a finite line segment (clamped to segment bounds)
 */
export function projectPointOntoLineSegment(point: Point2D, segment: LineSegment): Point2D {
  const v = VectorUtils.fromPoints(segment.p1, segment.p2);
  const lenSq = VectorUtils.dot(v, v);
  if (lenSq === 0) return segment.p1;

  const w = VectorUtils.fromPoints(segment.p1, point);
  const t = Math.max(0, Math.min(1, VectorUtils.dot(w, v) / lenSq));

  return Object.freeze({
    x: segment.p1.x + t * v.x,
    y: segment.p1.y + t * v.y
  });
}

/**
 * Projects a 2D point onto a Ray (clamped to origin in ray direction)
 */
export function projectPointOntoRay(point: Point2D, ray: Ray): Point2D {
  const w = VectorUtils.fromPoints(ray.origin, point);
  const t = Math.max(0, VectorUtils.dot(w, ray.direction));

  return Object.freeze({
    x: ray.origin.x + t * ray.direction.x,
    y: ray.origin.y + t * ray.direction.y
  });
}

/**
 * Projects vector `v` onto vector `onto`
 */
export function projectVectorOntoVector(v: Vector2D, onto: Vector2D): Vector2D {
  const ontoLenSq = VectorUtils.dot(onto, onto);
  if (ontoLenSq === 0) return Object.freeze({ x: 0, y: 0 });

  const scalar = VectorUtils.dot(v, onto) / ontoLenSq;
  return VectorUtils.scale(onto, scalar);
}
