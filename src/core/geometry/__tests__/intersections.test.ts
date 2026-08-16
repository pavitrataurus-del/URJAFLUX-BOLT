import { describe, it, expect } from 'vitest';
import {
  intersectLineLine,
  intersectSegmentSegment,
  intersectRayRay,
  intersectRaySegment,
  intersectLineCircle,
  intersectSegmentCircle,
  intersectRayCircle
} from '../operations/intersections';
import { PointUtils, LineUtils, CircleUtils } from '../primitives';

describe('Intersection Operations', () => {
  it('intersects two infinite lines', () => {
    const l1 = LineUtils.createInfiniteLine(PointUtils.create(0, 0), PointUtils.create(10, 10));
    const l2 = LineUtils.createInfiniteLine(PointUtils.create(0, 10), PointUtils.create(10, 0));

    const intersection = intersectLineLine(l1, l2);
    expect(intersection).not.toBeNull();
    expect(intersection!.x).toBeCloseTo(5);
    expect(intersection!.y).toBeCloseTo(5);

    // Parallel lines
    const l3 = LineUtils.createInfiniteLine(PointUtils.create(0, 5), PointUtils.create(10, 15));
    expect(intersectLineLine(l1, l3)).toBeNull();
  });

  it('intersects line segments', () => {
    const s1 = LineUtils.createSegment(PointUtils.create(0, 0), PointUtils.create(10, 10));
    const s2 = LineUtils.createSegment(PointUtils.create(0, 10), PointUtils.create(10, 0));

    const inter = intersectSegmentSegment(s1, s2);
    expect(inter).not.toBeNull();
    expect(inter!.x).toBeCloseTo(5);

    // Segments that don't reach intersection point
    const s3 = LineUtils.createSegment(PointUtils.create(0, 10), PointUtils.create(2, 8));
    expect(intersectSegmentSegment(s1, s3)).toBeNull();
  });

  it('intersects rays and segments', () => {
    const ray = LineUtils.rayFromTwoPoints(PointUtils.create(0, 0), PointUtils.create(1, 0));
    const seg = LineUtils.createSegment(PointUtils.create(5, -5), PointUtils.create(5, 5));

    const inter = intersectRaySegment(ray, seg);
    expect(inter).not.toBeNull();
    expect(inter!.x).toBeCloseTo(5);
    expect(inter!.y).toBeCloseTo(0);
  });

  it('intersects ray with ray', () => {
    const r1 = LineUtils.rayFromTwoPoints(PointUtils.create(0, 0), PointUtils.create(1, 1));
    const r2 = LineUtils.rayFromTwoPoints(PointUtils.create(10, 0), PointUtils.create(9, 1));

    const inter = intersectRayRay(r1, r2);
    expect(inter).not.toBeNull();
    expect(inter!.x).toBeCloseTo(5);
    expect(inter!.y).toBeCloseTo(5);
  });

  it('intersects line and circle', () => {
    const line = LineUtils.createInfiniteLine(PointUtils.create(-10, 0), PointUtils.create(10, 0));
    const circle = CircleUtils.create(PointUtils.create(0, 0), 5);

    const pts = intersectLineCircle(line, circle);
    expect(pts.length).toBe(2);
    expect(pts[0].x).toBeCloseTo(-5);
    expect(pts[1].x).toBeCloseTo(5);
  });

  it('intersects segment and circle', () => {
    const seg = LineUtils.createSegment(PointUtils.create(0, 0), PointUtils.create(10, 0));
    const circle = CircleUtils.create(PointUtils.create(0, 0), 5);

    const pts = intersectSegmentCircle(seg, circle);
    expect(pts.length).toBe(1);
    expect(pts[0].x).toBeCloseTo(5);
  });

  it('intersects ray and circle', () => {
    const ray = LineUtils.rayFromTwoPoints(PointUtils.create(0, 0), PointUtils.create(1, 0));
    const circle = CircleUtils.create(PointUtils.create(0, 0), 5);

    const pts = intersectRayCircle(ray, circle);
    expect(pts.length).toBe(1);
    expect(pts[0].x).toBeCloseTo(5);
  });
});
