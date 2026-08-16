import { Point2D, LineSegment } from '../types';

/**
 * Calculates the midpoint between two points
 */
export function midpointBetweenPoints(p1: Point2D, p2: Point2D): Point2D {
  return Object.freeze({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  });
}

/**
 * Calculates the midpoint of a line segment
 */
export function midpointOfLineSegment(segment: LineSegment): Point2D {
  return midpointBetweenPoints(segment.p1, segment.p2);
}

/**
 * Calculates the average midpoint (centroid) of a set of points
 */
export function midpointOfPoints(points: readonly Point2D[]): Point2D {
  if (points.length === 0) {
    throw new Error('Cannot compute midpoint of empty point set');
  }
  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  return Object.freeze({
    x: sumX / points.length,
    y: sumY / points.length
  });
}
