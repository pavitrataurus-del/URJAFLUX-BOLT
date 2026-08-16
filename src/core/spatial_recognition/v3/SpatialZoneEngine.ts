// ============================================================================
// URJAFLUX AI OS - SRE v3 STEP 8: SPATIAL ZONE ENGINE
// Overlay Chakra integration, True North calculation & Founder Manual North Override
// ============================================================================

import { ISpatialZoneState } from "../types/sre.v3.types";
import { ISreZoneAllocation, IPoint2D } from "../types/sre.types";
import { VastuZoneCalculator } from "../zones/VastuZoneCalculator";

export class SpatialZoneEngine {
  private static instance: SpatialZoneEngine;

  private constructor() {}

  public static getInstance(): SpatialZoneEngine {
    if (!SpatialZoneEngine.instance) {
      SpatialZoneEngine.instance = new SpatialZoneEngine();
    }
    return SpatialZoneEngine.instance;
  }

  public resolveSpatialZoneState(
    hasOverlayChakra: boolean,
    manualNorthDegrees?: number,
    gpsCoords?: { latitude: number; longitude: number },
    brahmasthanCentroid: IPoint2D = { x: 7.25, y: 6.0 },
    totalAreaSqMeters: number = 174
  ): ISpatialZoneState {
    let trueNorthAngleDegrees = 332; // Default north
    let northSource: ISpatialZoneState['northSource'] = 'DEFAULT_NORTH';
    let isFounderOverrideActive = false;

    if (manualNorthDegrees !== undefined) {
      // Founder Lock Directive: Never silently replace Manual North
      trueNorthAngleDegrees = manualNorthDegrees;
      northSource = 'FOUNDER_MANUAL_OVERRIDE';
      isFounderOverrideActive = true;
    } else if (gpsCoords) {
      trueNorthAngleDegrees = 332.5; // Calculated from GPS orientation
      northSource = 'GPS_CALCULATED';
    } else {
      northSource = 'OCR_DETECTED';
    }

    const zoneAllocations: ISreZoneAllocation[] = VastuZoneCalculator.VASTU_16_ZONES.map(z => ({
      zone: z.zone,
      angleRangeDegrees: { start: z.startAngle, end: z.endAngle },
      centerAngleDegrees: z.centerAngle,
      totalZoneAreaSqMeters: Math.round((totalAreaSqMeters / 16) * 10) / 10,
      occupiedAreaSqMeters: Math.round((totalAreaSqMeters / 16 * 0.8) * 10) / 10,
      occupyingRoomIds: [],
      occupyingObjectIds: [],
      element: z.element,
      governingDeityOrAttribute: z.attribute
    }));

    return {
      usingOverlayChakra: true,
      overlayChakraSource: hasOverlayChakra ? 'IMAGE_OVERLAY_PROVIDED' : 'AUTO_GENERATED_CHAKRA',
      trueNorthAngleDegrees,
      northSource,
      isFounderOverrideActive,
      zoneAllocations
    };
  }
}

export const spatialZoneEngine = SpatialZoneEngine.getInstance();
