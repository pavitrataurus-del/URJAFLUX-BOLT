import { 
  RecognizedEntity, 
  PropertyRecognitionSummary, 
  RecognitionCoverageReport, 
  RecognitionValidationChecklist 
} from "./types";
import { isPendingChakraCalibrationZone } from "./chakraOrientation";
import { roomTaxonomyService } from "./RoomTaxonomyService";

export class RecognitionSummaryBuilder {
  /**
   * Compiles complete property recognition summary, breakdown, coverage, and validation checklist
   */
  public static buildSummary(
    entities: RecognizedEntity[],
    netNorthAngle: number = 0,
    hasScale: boolean = true,
    hasBoundary: boolean = true
  ): PropertyRecognitionSummary {
    const totalEntities = entities.length || 1;

    let totalRooms = 0;
    let totalObjects = 0;
    let doorsCount = 0;
    let windowsCount = 0;

    const breakdown = {
      kitchens: 0,
      bedrooms: 0,
      toilets: 0,
      staircases: 0,
      septicTanks: 0,
      waterTanks: 0,
      parking: 0,
      poojaRooms: 0,
      livingRooms: 0,
      unknownSpaces: 0,
      otherElements: 0
    };

    let textCount = 0;
    let symbolCount = 0;
    let geometryCount = 0;
    let contextCount = 0;
    let unknownCount = 0;

    for (const entity of entities) {
      const canonicalType = entity.canonicalType || roomTaxonomyService.resolveCanonicalType(
        entity.displayName || entity.name || ""
      );
      const ruleElementType = entity.type?.toLowerCase() || "";

      // Category breakdown
      if (ruleElementType.includes("door") || canonicalType === "MAIN_ENTRANCE") {
        doorsCount++;
        totalObjects++;
      } else if (ruleElementType.includes("window")) {
        windowsCount++;
        totalObjects++;
      } else if (entity.category === "FIXTURE" || entity.category === "UTILITY") {
        totalObjects++;
      } else {
        totalRooms++;
      }

      const breakdownKey = roomTaxonomyService.getBreakdownCategory(canonicalType);
      breakdown[breakdownKey]++;

      // Method coverage
      switch (entity.detectedBy) {
        case "TEXT_LABEL":
          textCount++;
          break;
        case "ARCHITECTURAL_SYMBOL":
          symbolCount++;
          break;
        case "SPATIAL_GEOMETRY":
          geometryCount++;
          break;
        case "CONTEXTUAL_INFERENCE":
          contextCount++;
          break;
        case "UNKNOWN":
        default:
          unknownCount++;
          break;
      }
    }

    const coverage: RecognitionCoverageReport = {
      textCoveragePercent: Math.round((textCount / totalEntities) * 100),
      symbolCoveragePercent: Math.round((symbolCount / totalEntities) * 100),
      geometryCoveragePercent: Math.round((geometryCount / totalEntities) * 100),
      contextCoveragePercent: Math.round((contextCount / totalEntities) * 100),
      unknownCoveragePercent: Math.round((unknownCount / totalEntities) * 100),
      unknownSpacesCount: breakdown.unknownSpaces
    };

    const zonesAssigned = entities.length > 0 && entities.every(
      (e) => Boolean(e.zone && e.zone.trim().length > 0 && !isPendingChakraCalibrationZone(e.zone))
    );
    const allRoomsClassified = breakdown.unknownSpaces === 0;
    const unknownRoomsFlagged = breakdown.unknownSpaces > 0 ? entities.some(e => e.detectedBy === "UNKNOWN" && e.verificationStatus === "UNVERIFIED") : true;

    const validationChecklist: RecognitionValidationChecklist = {
      propertyBoundaryFound: hasBoundary && entities.length > 0,
      scaleAvailable: hasScale,
      northLocked: zonesAssigned,
      allRoomsClassified,
      objectsClassified: totalObjects >= 0,
      zonesAssigned,
      confidenceCalculated: entities.every(e => typeof e.confidence === "number"),
      unknownRoomsFlagged,
      allPassed: hasBoundary && zonesAssigned && entities.length > 0
    };

    return {
      totalRoomsRecognized: totalRooms,
      totalObjectsRecognized: totalObjects,
      doorsCount,
      windowsCount,
      breakdown,
      coverage,
      validationChecklist,
      entities
    };
  }
}
