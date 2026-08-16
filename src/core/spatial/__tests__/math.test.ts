import { describe, it, expect } from 'vitest';
import { SpatialMath, Point2D, Polygon2D } from '../math';

describe('SpatialMath', () => {
  it('calculates distance between two points', () => {
    const p1: Point2D = { x: 0, y: 0 };
    const p2: Point2D = { x: 3, y: 4 };
    expect(SpatialMath.distance(p1, p2)).toBe(5);
  });

  it('calculates angle between center and point', () => {
    const center: Point2D = { x: 0, y: 0 };
    const pRight: Point2D = { x: 10, y: 0 };
    const pUp: Point2D = { x: 0, y: 10 };
    const pLeft: Point2D = { x: -10, y: 0 };
    const pDown: Point2D = { x: 0, y: -10 };

    expect(SpatialMath.angle(center, pRight)).toBe(0);
    expect(SpatialMath.angle(center, pUp)).toBe(90);
    expect(SpatialMath.angle(center, pLeft)).toBe(180);
    expect(SpatialMath.angle(center, pDown)).toBe(270);
  });

  it('calculates centroid of a square', () => {
    const square: Polygon2D = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ]
    };
    const centroid = SpatialMath.calculateCentroid(square);
    expect(centroid.x).toBe(5);
    expect(centroid.y).toBe(5);
  });

  it('generates equal sectors', () => {
    const center: Point2D = { x: 0, y: 0 };
    const sectors = SpatialMath.generateEqualSectors(center, 4, 0, 100);
    
    expect(sectors.length).toBe(4);
    
    expect(sectors[0].startAngle).toBe(0);
    expect(sectors[0].endAngle).toBe(90);
    
    expect(sectors[1].startAngle).toBe(90);
    expect(sectors[1].endAngle).toBe(180);
    
    expect(sectors[2].startAngle).toBe(180);
    expect(sectors[2].endAngle).toBe(270);
    
    expect(sectors[3].startAngle).toBe(270);
    expect(sectors[3].endAngle).toBe(360);
  });

  it('checks if point is in polygon', () => {
    const square: Polygon2D = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ]
    };

    expect(SpatialMath.isPointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
    expect(SpatialMath.isPointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
  });
});
