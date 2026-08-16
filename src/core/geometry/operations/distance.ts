import { Point2D, LineSegment, InfiniteLine, Ray } from '../types';
import { VectorUtils } from '../primitives/Vector';
import { projectPointOntoInfiniteLine, projectPointOntoLineSegment, projectPointOntoRay } from './projections';

/**
 * Calculates Euclidean distance between two points
 */
export function distancePointToPoint(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Calculates perpendicular distance from a point to an infinite line
 */
export function distancePointToInfiniteLine(point: Point2D, line: InfiniteLine): number {
  const projected = projectPointOntoInfiniteLine(point, line);
  return distancePointToPoint(point, projected);
}

/**
 * Calculates shortest distance from a point to a finite line segment
 */
export function distancePointToLineSegment(point: Point2D, segment: LineSegment): number {
  const projected = projectPointOntoLineSegment(point, segment);
  return distancePointToPoint(point, projected);
}

/**
 * Calculates shortest distance from a point to a Ray
 */
export function distancePointToRay(point: Point2D, ray: Ray): number {
  const projected = projectPointOntoRay(point, ray);
  return distancePointToPoint(point, projected);
}
