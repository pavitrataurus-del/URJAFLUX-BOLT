import { Point2D, Circle } from '../types';

export class CircleUtils {
  public static create(center: Point2D, radius: number): Circle {
    if (radius < 0) {
      throw new Error('Circle radius cannot be negative');
    }
    return Object.freeze({ center, radius });
  }

  public static area(circle: Circle): number {
    return Math.PI * circle.radius * circle.radius;
  }

  public static circumference(circle: Circle): number {
    return 2 * Math.PI * circle.radius;
  }
}
