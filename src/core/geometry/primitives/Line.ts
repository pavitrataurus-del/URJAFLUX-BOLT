import { Point2D, Vector2D, LineSegment, InfiniteLine, Ray } from '../types';
import { VectorUtils } from './Vector';

export class LineUtils {
  public static createSegment(p1: Point2D, p2: Point2D): LineSegment {
    return Object.freeze({ p1, p2 });
  }

  public static createInfiniteLine(p1: Point2D, p2: Point2D): InfiniteLine {
    return Object.freeze({ p1, p2 });
  }

  public static createRay(origin: Point2D, direction: Vector2D): Ray {
    const normalizedDir = VectorUtils.normalize(direction);
    return Object.freeze({ origin, direction: normalizedDir });
  }

  public static rayFromTwoPoints(origin: Point2D, target: Point2D): Ray {
    const dir = VectorUtils.fromPoints(origin, target);
    return LineUtils.createRay(origin, dir);
  }

  public static segmentLength(segment: LineSegment): number {
    return Math.hypot(segment.p2.x - segment.p1.x, segment.p2.y - segment.p1.y);
  }

  public static segmentVector(segment: LineSegment): Vector2D {
    return VectorUtils.fromPoints(segment.p1, segment.p2);
  }
}
