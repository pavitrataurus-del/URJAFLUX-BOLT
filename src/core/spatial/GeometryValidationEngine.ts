import { FloorPlan, GeometryValidationResult } from './SpatialTypes';

export class GeometryValidationEngine {
  private static instance: GeometryValidationEngine;

  private constructor() {}

  public static getInstance(): GeometryValidationEngine {
    if (!GeometryValidationEngine.instance) {
      GeometryValidationEngine.instance = new GeometryValidationEngine();
    }
    return GeometryValidationEngine.instance;
  }

  /**
   * Validate entire floor plan geometry
   */
  public validateFloorPlan(floorPlan: FloorPlan): GeometryValidationResult {
    const timestamp = new Date().toISOString();
    const errors: GeometryValidationResult['errors'] = [];
    const warnings: GeometryValidationResult['warnings'] = [];

    let openPolygons = 0;
    let closedPolygons = 0;
    let unconnectedWalls = 0;
    let totalWallLength = 0;

    // 1. Validate Rooms
    floorPlan.rooms.forEach((room) => {
      if (!room.boundary.isClosed) {
        openPolygons++;
        errors.push({
          code: 'ERR_OPEN_POLYGON',
          message: `Room "${room.name}" (${room.id}) boundary is not closed.`,
          objectId: room.id,
          severity: 'CRITICAL'
        });
      } else {
        closedPolygons++;
      }

      if (room.areaSqMeters <= 0) {
        errors.push({
          code: 'ERR_ZERO_AREA_ROOM',
          message: `Room "${room.name}" has non-positive area (${room.areaSqMeters} sq m).`,
          objectId: room.id,
          severity: 'CRITICAL'
        });
      }
    });

    // 2. Validate Walls
    floorPlan.walls.forEach((wall) => {
      totalWallLength += wall.lengthMeters;
      if (wall.lengthMeters <= 0) {
        errors.push({
          code: 'ERR_ZERO_LENGTH_WALL',
          message: `Wall "${wall.name}" (${wall.id}) has zero length.`,
          objectId: wall.id,
          severity: 'CRITICAL'
        });
      }

      // Check if wall connects to another wall endpoint
      const isConnectedStart = floorPlan.walls.some(
        (other) => other.id !== wall.id && (
          this.isEqualPoint(wall.startPoint, other.startPoint) ||
          this.isEqualPoint(wall.startPoint, other.endPoint)
        )
      );
      const isConnectedEnd = floorPlan.walls.some(
        (other) => other.id !== wall.id && (
          this.isEqualPoint(wall.endPoint, other.startPoint) ||
          this.isEqualPoint(wall.endPoint, other.endPoint)
        )
      );

      if (!isConnectedStart || !isConnectedEnd) {
        unconnectedWalls++;
        warnings.push({
          code: 'WARN_UNCONNECTED_WALL_ENDPOINT',
          message: `Wall "${wall.name}" (${wall.id}) has an unattached dangling endpoint.`,
          objectId: wall.id
        });
      }
    });

    // 3. Validate Scale
    if (floorPlan.scalePixelsPerMeter <= 0) {
      errors.push({
        code: 'ERR_INVALID_SCALE',
        message: 'Floor plan scalePixelsPerMeter is invalid or missing.',
        severity: 'CRITICAL'
      });
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      validationTimestamp: timestamp,
      errors,
      warnings,
      metrics: {
        totalRooms: floorPlan.rooms.length,
        closedPolygons,
        openPolygons,
        totalWallLengthMeters: Math.round(totalWallLength * 100) / 100,
        unconnectedWallsCount: unconnectedWalls,
        duplicateObjectsCount: 0
      }
    };
  }

  private isEqualPoint(p1: { x: number; y: number }, p2: { x: number; y: number }, tolerance = 0.05): boolean {
    return Math.abs(p1.x - p2.x) <= tolerance && Math.abs(p1.y - p2.y) <= tolerance;
  }
}
