import { Point2D } from '../types';

export class PointUtils {
  public static create(x: number, y: number): Point2D {
    return Object.freeze({ x, y });
  }

  public static equals(p1: Point2D, p2: Point2D, tolerance: number = 1e-9): boolean {
    return Math.abs(p1.x - p2.x) <= tolerance && Math.abs(p1.y - p2.y) <= tolerance;
  }

  public static clone(p: Point2D): Point2D {
    return Object.freeze({ x: p.x, y: p.y });
  }

  public static origin(): Point2D {
    return Object.freeze({ x: 0, y: 0 });
  }
}
