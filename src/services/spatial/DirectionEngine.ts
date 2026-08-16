import { 
  BuildingElement, 
  OrientationAnalysis, 
  NorthSourceType, 
  CardinalDirection, 
  Point2D 
} from "../../types/spatialIntelligence";
import { SpatialGeometryEngine } from "./SpatialGeometryEngine";
import { CanonicalZoneRegistry, CanonicalZoneCode } from "../../core/spatial/CanonicalZoneRegistry";
import { CanonicalSpatialCalculationEngine } from "../../core/spatial/CanonicalSpatialCalculationEngine";

/**
 * ============================================================================
 *               URJAFLUX AI OS — DIRECTION & COMPASS ENGINE
 * ============================================================================
 * 
 * Handles compass interpretation, North detection, 16-point cardinal zone mapping,
 * coordinate transformations, and spatial orientation analysis for building rooms.
 */

export class DirectionEngine {

  /**
   * Translate bearing angle (0-360 degrees, 0 = North, clockwise) to 16-point cardinal direction
   * Delegates directly to CanonicalZoneRegistry (SSOT)
   */
  public static angleToCardinal16(deg: number): CardinalDirection {
    const code = CanonicalZoneRegistry.fromBearing(deg, false);
    return (code === CanonicalZoneCode.BRAHMASTHAN ? "N" : code) as CardinalDirection;
  }

  /**
   * Analyze spatial orientation for all rooms in a building
   */
  public static analyzeOrientation(
    elements: BuildingElement[], 
    northAngleDegrees = 0, 
    northSource: NorthSourceType = "Manual North"
  ): OrientationAnalysis {
    const rooms = elements.filter(e => e.type === "ROOM" || e.type === "CORRIDOR" || e.type === "BALCONY" || e.type === "TERRACE");
    
    // Find building center (centroid of all room centroids via SSOT engine)
    const centroids = rooms.map(r => r.geometry.polygon ? CanonicalSpatialCalculationEngine.calculateCentroid(r.geometry.polygon.vertices) : { x: 0, y: 0 });
    const bldgCenter = centroids.length > 0 
      ? {
          x: centroids.reduce((sum, c) => sum + c.x, 0) / centroids.length,
          y: centroids.reduce((sum, c) => sum + c.y, 0) / centroids.length
        }
      : { x: 0, y: 0 };

    const cardinalZones: Record<string, { startAngle: number; endAngle: number }> = {};
    const step = 22.5;
    const CARDINAL_16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    CARDINAL_16.forEach((dir, i) => {
      const centerAngle = (i * step + northAngleDegrees) % 360;
      cardinalZones[dir] = {
        startAngle: (centerAngle - step / 2 + 360) % 360,
        endAngle: (centerAngle + step / 2) % 360
      };
    });

    const roomOrientations = rooms.map(room => {
      const centroid = room.geometry.polygon 
        ? CanonicalSpatialCalculationEngine.calculateCentroid(room.geometry.polygon.vertices) 
        : { x: 0, y: 0 };

      const bearingDeg = CanonicalSpatialCalculationEngine.calculateBearing(bldgCenter, centroid);
      const trueBearing = CanonicalSpatialCalculationEngine.adjustBearingForNorth(bearingDeg, northAngleDegrees);
      const cardinal = this.angleToCardinal16(trueBearing);

      return {
        roomId: room.id,
        roomName: room.name,
        centroid,
        bearingDegrees: Number(trueBearing.toFixed(1)),
        cardinalDirection: cardinal
      };
    });

    return {
      northSource,
      northAngleDegrees,
      cardinalZones: cardinalZones as any,
      roomOrientations
    };
  }

  /**
   * Rotate a 2D point around an origin by given degrees
   */
  public static rotatePoint(point: Point2D, origin: Point2D, degrees: number): Point2D {
    const rad = (degrees * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = point.x - origin.x;
    const dy = point.y - origin.y;

    return {
      x: origin.x + (dx * cos - dy * sin),
      y: origin.y + (dx * sin + dy * cos)
    };
  }
}
