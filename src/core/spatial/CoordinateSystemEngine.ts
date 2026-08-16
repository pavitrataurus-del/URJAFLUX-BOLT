import { Coordinate, MeasurementUnit, Grid } from './SpatialTypes';

export class CoordinateSystemEngine {
  private static instance: CoordinateSystemEngine;

  private constructor() {}

  public static getInstance(): CoordinateSystemEngine {
    if (!CoordinateSystemEngine.instance) {
      CoordinateSystemEngine.instance = new CoordinateSystemEngine();
    }
    return CoordinateSystemEngine.instance;
  }

  /**
   * Convert linear distance between units
   */
  public convertUnit(value: number, from: MeasurementUnit, to: MeasurementUnit): number {
    if (from === to) return value;

    // Convert to meters first
    let inMeters = value;
    switch (from) {
      case 'mm': inMeters = value / 1000; break;
      case 'cm': inMeters = value / 100; break;
      case 'm': inMeters = value; break;
      case 'ft': inMeters = value * 0.3048; break;
      case 'inch': inMeters = value * 0.0254; break;
    }

    // Convert meters to target unit
    switch (to) {
      case 'mm': return inMeters * 1000;
      case 'cm': return inMeters * 100;
      case 'm': return inMeters;
      case 'ft': return inMeters / 0.3048;
      case 'inch': return inMeters / 0.0254;
    }
  }

  /**
   * Snap point to nearest architectural grid
   */
  public snapToGrid(coord: Coordinate, grid: Grid): Coordinate {
    if (!grid.isSnapToGrid || grid.minorSpacingMeters <= 0) return coord;
    const spacing = grid.minorSpacingMeters;
    return {
      x: Math.round(coord.x / spacing) * spacing,
      y: Math.round(coord.y / spacing) * spacing,
      z: coord.z !== undefined ? Math.round(coord.z / spacing) * spacing : undefined
    };
  }

  /**
   * Transform coordinate with rotation angle (degrees) and translation vector
   */
  public transformCoordinate(
    coord: Coordinate,
    angleDegrees: number,
    translation: Coordinate = { x: 0, y: 0 }
  ): Coordinate {
    const rad = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rotatedX = coord.x * cos - coord.y * sin;
    const rotatedY = coord.x * sin + coord.y * cos;

    return {
      x: rotatedX + translation.x,
      y: rotatedY + translation.y,
      z: coord.z
    };
  }

  /**
   * Convert pixel coordinates to world meters based on scale and origin
   */
  public pixelToMeter(
    pixelCoord: Coordinate,
    scalePixelsPerMeter: number,
    originPixel: Coordinate = { x: 0, y: 0 }
  ): Coordinate {
    return {
      x: (pixelCoord.x - originPixel.x) / scalePixelsPerMeter,
      y: (originPixel.y - pixelCoord.y) / scalePixelsPerMeter, // inverted Y axis for screen canvas
      z: pixelCoord.z
    };
  }

  /**
   * Convert world meters to screen canvas pixels
   */
  public meterToPixel(
    meterCoord: Coordinate,
    scalePixelsPerMeter: number,
    originPixel: Coordinate = { x: 0, y: 0 }
  ): Coordinate {
    return {
      x: originPixel.x + meterCoord.x * scalePixelsPerMeter,
      y: originPixel.y - meterCoord.y * scalePixelsPerMeter,
      z: meterCoord.z
    };
  }
}
