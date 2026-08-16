import { Coordinate, Direction8Zone, Orientation, FloorPlan } from './SpatialTypes';

export class NorthOrientationEngine {
  private static instance: NorthOrientationEngine;

  private constructor() {}

  public static getInstance(): NorthOrientationEngine {
    if (!NorthOrientationEngine.instance) {
      NorthOrientationEngine.instance = new NorthOrientationEngine();
    }
    return NorthOrientationEngine.instance;
  }

  /**
   * Determine cardinal 8-zone direction from point relative to plan center and North orientation angle
   */
  public calculateCardinalDirection(
    point: Coordinate,
    planCenter: Coordinate,
    orientation: Orientation,
    planBoundingBox: { minX: number; minY: number; maxX: number; maxY: number }
  ): Direction8Zone {
    // Check for Brahmasthan (central 3x3 grid out of 9x9 grid)
    const width = planBoundingBox.maxX - planBoundingBox.minX;
    const height = planBoundingBox.maxY - planBoundingBox.minY;

    const bMinX = planBoundingBox.minX + width * (1 / 3);
    const bMaxX = planBoundingBox.minX + width * (2 / 3);
    const bMinY = planBoundingBox.minY + height * (1 / 3);
    const bMaxY = planBoundingBox.minY + height * (2 / 3);

    if (point.x >= bMinX && point.x <= bMaxX && point.y >= bMinY && point.y <= bMaxY) {
      return 'BRAHMASTHAN';
    }

    // Calculate angle from center to point
    const dx = point.x - planCenter.x;
    const dy = point.y - planCenter.y;

    // Angle in degrees from positive X axis counterclockwise
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;

    // Adjust for North orientation rotation
    const totalNorthAngle = (orientation.northAngleDegrees + orientation.magneticDeclination) % 360;

    // Standard Cartesian angle where 90° = North, 0° = East, 180° = West, 270° = South
    // Transform so 0° = True North clockwise
    let compassHeading = (90 - angleDeg + totalNorthAngle + 360) % 360;

    if (compassHeading >= 337.5 || compassHeading < 22.5) return 'N';
    if (compassHeading >= 22.5 && compassHeading < 67.5) return 'NE';
    if (compassHeading >= 67.5 && compassHeading < 112.5) return 'E';
    if (compassHeading >= 112.5 && compassHeading < 157.5) return 'SE';
    if (compassHeading >= 157.5 && compassHeading < 202.5) return 'S';
    if (compassHeading >= 202.5 && compassHeading < 247.5) return 'SW';
    if (compassHeading >= 247.5 && compassHeading < 292.5) return 'W';
    return 'NW';
  }

  /**
   * Recalculate directions across all rooms, walls, doors, windows in floor plan
   */
  public updateFloorPlanOrientation(
    floorPlan: FloorPlan,
    newNorthAngleDegrees: number,
    magneticDeclination: number = 0
  ): FloorPlan {
    const updatedOrientation: Orientation = {
      northAngleDegrees: newNorthAngleDegrees,
      magneticDeclination,
      gridRotation: newNorthAngleDegrees
    };

    const bbox = floorPlan.outerBoundary.boundingBox;
    const planCenter: Coordinate = {
      x: (bbox.minX + bbox.maxX) / 2,
      y: (bbox.minY + bbox.maxY) / 2
    };

    // Recalculate room cardinal directions
    const updatedRooms = floorPlan.rooms.map((r) => ({
      ...r,
      cardinalDirection: this.calculateCardinalDirection(r.centroid, planCenter, updatedOrientation, bbox)
    }));

    // Recalculate wall cardinal directions
    const updatedWalls = floorPlan.walls.map((w) => {
      const midPoint: Coordinate = {
        x: (w.startPoint.x + w.endPoint.x) / 2,
        y: (w.startPoint.y + w.endPoint.y) / 2
      };
      return {
        ...w,
        cardinalDirection: this.calculateCardinalDirection(midPoint, planCenter, updatedOrientation, bbox)
      };
    });

    // Recalculate doors
    const updatedDoors = floorPlan.doors.map((d) => ({
      ...d,
      cardinalDirection: this.calculateCardinalDirection(d.location, planCenter, updatedOrientation, bbox)
    }));

    // Recalculate windows
    const updatedWindows = floorPlan.windows.map((w) => ({
      ...w,
      cardinalDirection: this.calculateCardinalDirection(w.location, planCenter, updatedOrientation, bbox)
    }));

    return {
      ...floorPlan,
      orientation: updatedOrientation,
      rooms: updatedRooms,
      walls: updatedWalls,
      doors: updatedDoors,
      windows: updatedWindows,
      updatedAt: new Date().toISOString()
    };
  }
}
