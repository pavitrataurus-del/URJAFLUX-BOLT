import { describe, it, expect } from 'vitest';
import {
  projectPointOntoInfiniteLine,
  projectPointOntoLineSegment,
  projectPointOntoRay,
  projectVectorOntoVector
} from '../operations/projections';
import { PointUtils, LineUtils, VectorUtils } from '../primitives';

describe('Projection Operations', () => {
  it('projects point onto infinite line', () => {
    const line = LineUtils.createInfiniteLine(PointUtils.create(0, 0), PointUtils.create(10, 0));
    const point = PointUtils.create(5, 10);

    const proj = projectPointOntoInfiniteLine(point, line);
    expect(proj.x).toBe(5);
    expect(proj.y).toBe(0);
  });

  it('projects point onto line segment', () => {
    const seg = LineUtils.createSegment(PointUtils.create(0, 0), PointUtils.create(10, 0));

    // Clamped inside
    const p1 = projectPointOntoLineSegment(PointUtils.create(5, 8), seg);
    expect(p1.x).toBe(5);
    expect(p1.y).toBe(0);

    // Clamped before start
    const p2 = projectPointOntoLineSegment(PointUtils.create(-5, 8), seg);
    expect(p2.x).toBe(0);
    expect(p2.y).toBe(0);

    // Clamped after end
    const p3 = projectPointOntoLineSegment(PointUtils.create(15, 8), seg);
    expect(p3.x).toBe(10);
    expect(p3.y).toBe(0);
  });

  it('projects point onto ray', () => {
    const ray = LineUtils.rayFromTwoPoints(PointUtils.create(0, 0), PointUtils.create(1, 0));

    const p1 = projectPointOntoRay(PointUtils.create(12, 5), ray);
    expect(p1.x).toBe(12);
    expect(p1.y).toBe(0);

    const p2 = projectPointOntoRay(PointUtils.create(-5, 5), ray);
    expect(p2.x).toBe(0);
    expect(p2.y).toBe(0);
  });

  it('projects vector onto vector', () => {
    const v = VectorUtils.create(3, 4);
    const onto = VectorUtils.create(1, 0);

    const proj = projectVectorOntoVector(v, onto);
    expect(proj.x).toBe(3);
    expect(proj.y).toBe(0);
  });
});
