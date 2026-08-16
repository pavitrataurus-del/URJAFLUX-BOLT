import { describe, it, expect } from 'vitest';
import {
  distancePointToPoint,
  distancePointToInfiniteLine,
  distancePointToLineSegment,
  distancePointToRay
} from '../operations/distance';
import { PointUtils, LineUtils } from '../primitives';

describe('Distance Operations', () => {
  it('calculates point-to-point distance', () => {
    const p1 = PointUtils.create(0, 0);
    const p2 = PointUtils.create(3, 4);
    expect(distancePointToPoint(p1, p2)).toBe(5);
  });

  it('calculates point to infinite line distance', () => {
    const line = LineUtils.createInfiniteLine(PointUtils.create(0, 0), PointUtils.create(10, 0));
    const p = PointUtils.create(5, 7);
    expect(distancePointToInfiniteLine(p, line)).toBe(7);
  });

  it('calculates point to line segment distance', () => {
    const seg = LineUtils.createSegment(PointUtils.create(0, 0), PointUtils.create(10, 0));

    // Perpendicular projection within segment
    expect(distancePointToLineSegment(PointUtils.create(5, 5), seg)).toBe(5);

    // Closest to p1 endpoint
    expect(distancePointToLineSegment(PointUtils.create(-3, 4), seg)).toBe(5);

    // Closest to p2 endpoint
    expect(distancePointToLineSegment(PointUtils.create(13, 4), seg)).toBe(5);
  });

  it('calculates point to ray distance', () => {
    const ray = LineUtils.rayFromTwoPoints(PointUtils.create(0, 0), PointUtils.create(10, 0));

    // Point in ray direction
    expect(distancePointToRay(PointUtils.create(15, 6), ray)).toBe(6);

    // Point behind ray origin
    expect(distancePointToRay(PointUtils.create(-3, 4), ray)).toBe(5);
  });
});
