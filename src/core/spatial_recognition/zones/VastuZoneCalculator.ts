// ============================================================================
// URJAFLUX AI OS - VASTU ZONE CALCULATOR (SRE v2)
// Mathematical 16-Zone Wedge Generation & Room Polygon Intersections
// ============================================================================

import { IPoint2D, Vastu16Zone, ISreZoneIntersection, ISreZoneAllocation } from "../types/sre.types";
import { PolygonEngine } from "../geometry/PolygonEngine";

export interface IZonedWedge {
  zone: Vastu16Zone;
  startAngleDegrees: number;
  endAngleDegrees: number;
  centerAngleDegrees: number;
  polygon: IPoint2D[];
  element: 'FIRE' | 'WATER' | 'EARTH' | 'AIR' | 'SPACE';
  attribute: string;
}

export class VastuZoneCalculator {
  public static readonly VASTU_16_ZONES: Array<{
    zone: Vastu16Zone;
    startAngle: number;
    endAngle: number;
    centerAngle: number;
    element: 'FIRE' | 'WATER' | 'EARTH' | 'AIR' | 'SPACE';
    attribute: string;
  }> = [
    { zone: 'NORTH', startAngle: 348.75, endAngle: 11.25, centerAngle: 0, element: 'WATER', attribute: 'Money, Opportunities' },
    { zone: 'NNE', startAngle: 11.25, endAngle: 33.75, centerAngle: 22.5, element: 'WATER', attribute: 'Health, Healing' },
    { zone: 'NE', startAngle: 33.75, endAngle: 56.25, centerAngle: 45, element: 'WATER', attribute: 'Clarity, Wisdom, Divine Connection' },
    { zone: 'ENE', startAngle: 56.25, endAngle: 78.75, centerAngle: 67.5, element: 'AIR', attribute: 'Fun, Recreation' },
    { zone: 'EAST', startAngle: 78.75, endAngle: 101.25, centerAngle: 90, element: 'AIR', attribute: 'Social Connections' },
    { zone: 'ESE', startAngle: 101.25, endAngle: 123.75, centerAngle: 112.5, element: 'AIR', attribute: 'Churning, Anxiety, Overthinking' },
    { zone: 'SE', startAngle: 123.75, endAngle: 146.25, centerAngle: 135, element: 'FIRE', attribute: 'Cash Flow, Liquidity, Energy' },
    { zone: 'SSE', startAngle: 146.25, endAngle: 168.75, centerAngle: 157.5, element: 'FIRE', attribute: 'Confidence, Power' },
    { zone: 'SOUTH', startAngle: 168.75, endAngle: 191.25, centerAngle: 180, element: 'FIRE', attribute: 'Fame, Relaxation' },
    { zone: 'SSW', startAngle: 191.25, endAngle: 213.75, centerAngle: 202.5, element: 'EARTH', attribute: 'Expenditure, Disposal, Waste' },
    { zone: 'SW', startAngle: 213.75, endAngle: 236.25, centerAngle: 225, element: 'EARTH', attribute: 'Relationships, Skills, Stability' },
    { zone: 'WSW', startAngle: 236.25, endAngle: 258.75, centerAngle: 247.5, element: 'SPACE', attribute: 'Education, Savings' },
    { zone: 'WEST', startAngle: 258.75, endAngle: 281.25, centerAngle: 270, element: 'SPACE', attribute: 'Gains, Profits' },
    { zone: 'WNW', startAngle: 281.25, endAngle: 303.75, centerAngle: 292.5, element: 'SPACE', attribute: 'Depression, Detoxification' },
    { zone: 'NW', startAngle: 303.75, endAngle: 326.25, centerAngle: 315, element: 'AIR', attribute: 'Support, Banking' },
    { zone: 'NNW', startAngle: 326.25, endAngle: 348.75, centerAngle: 337.5, element: 'WATER', attribute: 'Attraction, Sensual Pleasure' }
  ];

  /**
   * Generates 16 Zone Wedge Polygons based on Brahmasthan centroid and property radius
   */
  public static generate16ZoneWedges(
    brahmasthan: IPoint2D, 
    radius: number, 
    northOrientationOffsetDegrees: number = 0
  ): IZonedWedge[] {
    return this.VASTU_16_ZONES.map(z => {
      // Adjust angles for north orientation offset
      const startAngleRad = ((z.startAngle + northOrientationOffsetDegrees) % 360) * (Math.PI / 180);
      const endAngleRad = ((z.endAngle + northOrientationOffsetDegrees) % 360) * (Math.PI / 180);

      const p1 = brahmasthan;
      const p2 = {
        x: brahmasthan.x + radius * Math.cos(startAngleRad),
        y: brahmasthan.y + radius * Math.sin(startAngleRad)
      };
      const p3 = {
        x: brahmasthan.x + radius * Math.cos(endAngleRad),
        y: brahmasthan.y + radius * Math.sin(endAngleRad)
      };

      return {
        zone: z.zone,
        startAngleDegrees: z.startAngle,
        endAngleDegrees: z.endAngle,
        centerAngleDegrees: z.centerAngle,
        polygon: [p1, p2, p3],
        element: z.element,
        attribute: z.attribute
      };
    });
  }

  /**
   * Calculates exact mathematical polygon intersections between Room Polygon and Vastu Zone Wedges
   */
  public static calculateRoomZoneIntersections(
    roomPolygon: IPoint2D[], 
    wedges: IZonedWedge[]
  ): ISreZoneIntersection[] {
    const totalRoomArea = PolygonEngine.calculateArea(roomPolygon);
    if (totalRoomArea === 0) return [];

    const intersections: ISreZoneIntersection[] = [];

    wedges.forEach(w => {
      const overlapArea = PolygonEngine.calculatePolygonIntersectionArea(roomPolygon, w.polygon);
      if (overlapArea > 0.05) { // threshold > 0.05 sq meters
        const percentage = Math.min(100, Math.round((overlapArea / totalRoomArea) * 1000) / 10);
        intersections.push({
          zone: w.zone,
          percentage,
          areaSqMeters: Math.round(overlapArea * 100) / 100
        });
      }
    });

    // Normalize percentages to sum 100%
    const sumPerc = intersections.reduce((s, i) => s + i.percentage, 0);
    if (sumPerc > 0) {
      intersections.forEach(i => {
        i.percentage = Math.round((i.percentage / sumPerc) * 1000) / 10;
      });
    }

    return intersections.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Determines zone for a given point relative to Brahmasthan
   */
  public static getZoneForPoint(
    point: IPoint2D, 
    brahmasthan: IPoint2D, 
    northOrientationDegrees: number = 0
  ): Vastu16Zone {
    const dx = point.x - brahmasthan.x;
    const dy = point.y - brahmasthan.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1.0) { // Within 1 meter center radius = Brahmasthan
      return 'BRAHMASTHAN';
    }

    let angleDegrees = (Math.atan2(dy, dx) * (180 / Math.PI) - northOrientationDegrees + 360) % 360;

    for (const z of this.VASTU_16_ZONES) {
      if (z.startAngle > z.endAngle) { // Crosses 0°/360° (NORTH: 348.75 to 11.25)
        if (angleDegrees >= z.startAngle || angleDegrees < z.endAngle) {
          return z.zone;
        }
      } else {
        if (angleDegrees >= z.startAngle && angleDegrees < z.endAngle) {
          return z.zone;
        }
      }
    }

    return 'NORTH';
  }
}
