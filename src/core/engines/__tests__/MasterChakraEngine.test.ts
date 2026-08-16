import { describe, it, expect, beforeEach } from 'vitest';
import { MasterChakraEngine } from '../MasterChakraEngine';
import { SpatialReferenceMatrix } from '../../spatial/SpatialReferenceMatrix';
import { Polygon2D } from '../../spatial/math';

describe('MasterChakraEngine', () => {
  let engine: MasterChakraEngine;

  beforeEach(async () => {
    engine = new MasterChakraEngine();
    await engine.initialize();
  });

  it('generates 8 geometric sectors correctly from square centroid', () => {
    const square: Polygon2D = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ]
    };
    
    const matrix = new SpatialReferenceMatrix({ x: 0, y: 0 }, 0); // No global rotation

    // Shift by -22.5 to center the first sector around 0 degrees if we wanted 8 sectors
    const sectors = engine.generateGeometricSectors(square, matrix, {
      numberOfSectors: 8,
      startingAngleOffset: 337.5 // 360 - 22.5
    });

    expect(sectors.length).toBe(8);
    
    // Centroid of square is (5,5)
    expect(sectors[0].center.x).toBe(5);
    expect(sectors[0].center.y).toBe(5);

    expect(sectors[0].startAngle).toBe(337.5);
    expect(sectors[0].endAngle).toBe(22.5); // (337.5 + 45) % 360

    expect(sectors[1].startAngle).toBe(22.5);
    expect(sectors[1].endAngle).toBe(67.5);
  });

  it('applies global rotation from SpatialReferenceMatrix', () => {
    const square: Polygon2D = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ]
    };
    
    // Global matrix has a 10 degree rotation
    const matrix = new SpatialReferenceMatrix({ x: 0, y: 0 }, 10);

    const sectors = engine.generateGeometricSectors(square, matrix, {
      numberOfSectors: 4,
      startingAngleOffset: 0
    });

    expect(sectors.length).toBe(4);
    
    // The first sector should start at 10 degrees (0 + 10)
    expect(sectors[0].startAngle).toBe(10);
    expect(sectors[0].endAngle).toBe(100);
  });
  
  it('throws if not initialized', () => {
    const uninitializedEngine = new MasterChakraEngine();
    const square: Polygon2D = { vertices: [{x:0,y:0},{x:1,y:0},{x:1,y:1}] };
    const matrix = new SpatialReferenceMatrix();
    
    expect(() => {
      uninitializedEngine.generateGeometricSectors(square, matrix, { numberOfSectors: 4, startingAngleOffset: 0 });
    }).toThrow(/not initialized/);
  });
});
