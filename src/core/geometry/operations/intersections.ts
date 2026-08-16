import { Point2D, LineSegment, InfiniteLine, Ray, Circle } from '../types';
import { VectorUtils } from '../primitives/Vector';

const EPSILON = 1e-9;

/**
 * Finds intersection point between two infinite lines.
 * Returns null if lines are parallel or coincident.
 */
export function intersectLineLine(line1: InfiniteLine, line2: InfiniteLine): Point2D | null {
  const x1 = line1.p1.x, y1 = line1.p1.y;
  const x2 = line1.p2.x, y2 = line1.p2.y;
  const x3 = line2.p1.x, y3 = line2.p1.y;
  const x4 = line2.p2.x, y4 = line2.p2.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < EPSILON) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

  return Object.freeze({
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1)
  });
}

/**
 * Finds intersection point between two line segments.
 * Returns null if segments do not intersect.
 */
export function intersectSegmentSegment(seg1: LineSegment, seg2: LineSegment): Point2D | null {
  const x1 = seg1.p1.x, y1 = seg1.p1.y;
  const x2 = seg1.p2.x, y2 = seg1.p2.y;
  const x3 = seg2.p1.x, y3 = seg2.p1.y;
  const x4 = seg2.p2.x, y4 = seg2.p2.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < EPSILON) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= -EPSILON && t <= 1 + EPSILON && u >= -EPSILON && u <= 1 + EPSILON) {
    return Object.freeze({
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    });
  }

  return null;
}

/**
 * Finds intersection point between two rays.
 * Returns null if rays do not intersect.
 */
export function intersectRayRay(ray1: Ray, ray2: Ray): Point2D | null {
  const dx = ray2.origin.x - ray1.origin.x;
  const dy = ray2.origin.y - ray1.origin.y;

  const denom = ray1.direction.x * ray2.direction.y - ray1.direction.y * ray2.direction.x;
  if (Math.abs(denom) < EPSILON) return null;

  const t = (dx * ray2.direction.y - dy * ray2.direction.x) / denom;
  const u = (dx * ray1.direction.y - dy * ray1.direction.x) / denom;

  if (t >= -EPSILON && u >= -EPSILON) {
    return Object.freeze({
      x: ray1.origin.x + Math.max(0, t) * ray1.direction.x,
      y: ray1.origin.y + Math.max(0, t) * ray1.direction.y
    });
  }

  return null;
}

/**
 * Finds intersection point between a ray and a line segment.
 * Returns null if there is no intersection.
 */
export function intersectRaySegment(ray: Ray, segment: LineSegment): Point2D | null {
  const x1 = ray.origin.x, y1 = ray.origin.y;
  const x2 = ray.origin.x + ray.direction.x, y2 = ray.origin.y + ray.direction.y;
  const x3 = segment.p1.x, y3 = segment.p1.y;
  const x4 = segment.p2.x, y4 = segment.p2.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < EPSILON) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= -EPSILON && u >= -EPSILON && u <= 1 + EPSILON) {
    return Object.freeze({
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    });
  }

  return null;
}

/**
 * Finds intersection points between an infinite line and a circle.
 * Returns array of 0, 1, or 2 points.
 */
export function intersectLineCircle(line: InfiniteLine, circle: Circle): Point2D[] {
  const vx = line.p2.x - line.p1.x;
  const vy = line.p2.y - line.p1.y;
  const a = vx * vx + vy * vy;
  if (a < EPSILON) return [];

  const b = 2 * (vx * (line.p1.x - circle.center.x) + vy * (line.p1.y - circle.center.y));
  const c = Math.pow(line.p1.x - circle.center.x, 2) + Math.pow(line.p1.y - circle.center.y, 2) - circle.radius * circle.radius;

  const discr = b * b - 4 * a * c;
  if (discr < -EPSILON) return [];

  if (Math.abs(discr) < EPSILON) {
    const t = -b / (2 * a);
    return [Object.freeze({ x: line.p1.x + t * vx, y: line.p1.y + t * vy })];
  }

  const sqrtDiscr = Math.sqrt(discr);
  const t1 = (-b - sqrtDiscr) / (2 * a);
  const t2 = (-b + sqrtDiscr) / (2 * a);

  return [
    Object.freeze({ x: line.p1.x + t1 * vx, y: line.p1.y + t1 * vy }),
    Object.freeze({ x: line.p1.x + t2 * vx, y: line.p1.y + t2 * vy })
  ];
}

/**
 * Finds intersection points between a line segment and a circle.
 * Returns array of 0, 1, or 2 points on the segment.
 */
export function intersectSegmentCircle(segment: LineSegment, circle: Circle): Point2D[] {
  const line: InfiniteLine = { p1: segment.p1, p2: segment.p2 };
  const lineIntersections = intersectLineCircle(line, circle);

  const vx = segment.p2.x - segment.p1.x;
  const vy = segment.p2.y - segment.p1.y;
  const lenSq = vx * vx + vy * vy;
  if (lenSq < EPSILON) return [];

  return lineIntersections.filter((p) => {
    const dot = (p.x - segment.p1.x) * vx + (p.y - segment.p1.y) * vy;
    const t = dot / lenSq;
    return t >= -EPSILON && t <= 1 + EPSILON;
  });
}

/**
 * Finds intersection points between a Ray and a circle.
 * Returns array of 0, 1, or 2 points along ray direction.
 */
export function intersectRayCircle(ray: Ray, circle: Circle): Point2D[] {
  const dir = VectorUtils.normalize(ray.direction);
  const lineP2: Point2D = { x: ray.origin.x + dir.x, y: ray.origin.y + dir.y };
  const lineIntersections = intersectLineCircle({ p1: ray.origin, p2: lineP2 }, circle);

  return lineIntersections.filter((p) => {
    const dot = (p.x - ray.origin.x) * dir.x + (p.y - ray.origin.y) * dir.y;
    return dot >= -EPSILON;
  });
}
