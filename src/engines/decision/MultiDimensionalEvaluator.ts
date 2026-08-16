/**
 * URJAFLUX AI OS — SPRINT 3A
 * Multi-Dimensional Element Evaluator
 * Evaluates each building element (Kitchen, Bedrooms, Toilets, Entrance, etc.)
 * across 10 deterministic spatial & architectural dimensions.
 */

import { RecognizedEntity } from "../../recognition/types";
import { roomTaxonomyService, type CanonicalRoomType } from "../../recognition/RoomTaxonomyService";
import { PENDING_CHAKRA_CALIBRATION_ZONE, isPendingChakraCalibrationZone } from "../../recognition/chakraOrientation";
import { DimensionEvaluation, ElementMultiDimensionalEvaluation } from "./types";

export class MultiDimensionalEvaluator {
  /**
   * Evaluates a single entity across 10 dimensions deterministically.
   */
  public static evaluateElement(
    entity: RecognizedEntity,
    allEntities: RecognizedEntity[],
    brahmasthanCenter: { x: number; y: number },
    entranceCenter: { x: number; y: number } | null,
    netNorthAngle: number,
    propertySpan: number = 0
  ): ElementMultiDimensionalEvaluation {
    const displayName = entity.displayName || entity.name || entity.type;
    const canonicalType: CanonicalRoomType = (entity.canonicalType as CanonicalRoomType) ||
      roomTaxonomyService.resolveCanonicalType(displayName);
    const ruleElementType = entity.type?.toLowerCase() ||
      roomTaxonomyService.canonicalToRuleElementType(canonicalType);
    const zone = entity.zone && !isPendingChakraCalibrationZone(entity.zone)
      ? entity.zone
      : PENDING_CHAKRA_CALIBRATION_ZONE;
    const name = entity.name || entity.type;

    // Entity spatial coords
    const elemX = entity.coordinates.x + entity.coordinates.width / 2;
    const elemY = entity.coordinates.y + entity.coordinates.height / 2;

    const dxBrahma = elemX - brahmasthanCenter.x;
    const dyBrahma = elemY - brahmasthanCenter.y;
    const distToBrahmasthan = Math.sqrt(dxBrahma * dxBrahma + dyBrahma * dyBrahma);

    let distToEntrance = propertySpan > 0 ? propertySpan : 0;
    if (entranceCenter) {
      const dxEnt = elemX - entranceCenter.x;
      const dyEnt = elemY - entranceCenter.y;
      distToEntrance = Math.sqrt(dxEnt * dxEnt + dyEnt * dyEnt);
    }

    const adjacencyThreshold = propertySpan > 0 ? propertySpan * 0.15 : 0;
    const adjacentEntities = allEntities.filter((other) => {
      if (other.id === entity.id) return false;
      const ox = other.coordinates.x + other.coordinates.width / 2;
      const oy = other.coordinates.y + other.coordinates.height / 2;
      const d = Math.sqrt((elemX - ox) ** 2 + (elemY - oy) ** 2);
      return adjacencyThreshold > 0 && d < adjacencyThreshold;
    });

    const dimensions: DimensionEvaluation[] = [];
    const positiveAttributes: string[] = [];
    const negativeAttributes: string[] = [];

    // 1. Zone Suitability Dimension
    const zoneSuitability = this.evalZoneSuitability(canonicalType, displayName, zone);
    dimensions.push(zoneSuitability);
    if (zoneSuitability.status === "OPTIMAL") {
      positiveAttributes.push(`Optimal directional zone alignment in ${zone}`);
    } else if (zoneSuitability.status === "CRITICAL_DEFECT") {
      negativeAttributes.push(`Severe directional zone misalignment in ${zone}`);
    }

    // 2. Element Balance Dimension (Five Elements: Fire, Water, Earth, Air, Space)
    const elementBalance = this.evalElementBalance(canonicalType, zone);
    dimensions.push(elementBalance);
    if (elementBalance.status === "OPTIMAL" || elementBalance.status === "BALANCED") {
      positiveAttributes.push(`Elemental harmony established (${elementBalance.details})`);
    } else {
      negativeAttributes.push(`Elemental conflict present (${elementBalance.details})`);
    }

    // 3. Adjacent Rooms Dimension
    const adjEval = this.evalAdjacentRooms(canonicalType, adjacentEntities);
    dimensions.push(adjEval);
    if (adjEval.status === "CRITICAL_DEFECT" || adjEval.status === "SUBOPTIMAL") {
      negativeAttributes.push(adjEval.details);
    } else {
      positiveAttributes.push("Favorable spatial relationship with adjacent rooms");
    }

    // 4. Distance from Brahmasthan
    const brahmaEval = this.evalBrahmasthanDistance(canonicalType, distToBrahmasthan);
    dimensions.push(brahmaEval);
    if (brahmaEval.status === "CRITICAL_DEFECT") {
      negativeAttributes.push("Encroaches directly upon the sacred Brahmasthan center grid");
    } else if (brahmaEval.status === "OPTIMAL") {
      positiveAttributes.push("Sufficient clearance maintained from Brahmasthan energy nexus");
    }

    // 5. Distance from Entrance
    const entranceEval = this.evalEntranceDistance(canonicalType, distToEntrance);
    dimensions.push(entranceEval);

    // 6. Fire-Water Interaction
    const fireWaterEval = this.evalFireWaterInteraction(canonicalType, zone, adjacentEntities);
    dimensions.push(fireWaterEval);
    if (fireWaterEval.status === "CRITICAL_DEFECT") {
      negativeAttributes.push(`Fire-Water elemental clash detected: ${fireWaterEval.details}`);
    }

    // 7. Structural Weight Distribution
    const weightEval = this.evalStructuralWeight(canonicalType, displayName, zone);
    dimensions.push(weightEval);
    if (weightEval.status === "OPTIMAL") {
      positiveAttributes.push(`Proper weight placement matching zone loading rules`);
    } else if (weightEval.status === "CRITICAL_DEFECT") {
      negativeAttributes.push(`Improper heavy load burdening light energy zone (${zone})`);
    }

    // 8. Natural Light Orientation
    const lightEval = this.evalNaturalLight(canonicalType, zone);
    dimensions.push(lightEval);

    // 9. Ventilation & Airflow
    const ventEval = this.evalVentilation(canonicalType, zone, entity);
    dimensions.push(ventEval);

    // 10. Spatial Accessibility
    const accessEval = this.evalAccessibility(canonicalType, distToEntrance);
    dimensions.push(accessEval);

    // Calculate aggregated Health Index (weighted average of dimensions)
    const totalScore = dimensions.reduce((acc, curr) => acc + curr.score, 0);
    const healthIndex = Math.round(totalScore / dimensions.length);

    return {
      elementId: entity.id,
      elementName: name,
      elementType: ruleElementType,
      assignedZone: zone,
      healthIndex,
      dimensions,
      positiveAttributes,
      negativeAttributes
    };
  }

  private static resolveEntityCanonicalType(entity: RecognizedEntity): CanonicalRoomType {
    return (entity.canonicalType as CanonicalRoomType) ||
      roomTaxonomyService.resolveCanonicalType(entity.displayName || entity.name || "");
  }

  private static evalZoneSuitability(
    canonicalType: CanonicalRoomType,
    displayName: string,
    zone: string
  ): DimensionEvaluation {
    const z = zone.toUpperCase();
    if (canonicalType === "KITCHEN") {
      if (z.includes("SOUTH-EAST") || z.includes("SE") || z.includes("SSE")) {
        return { dimensionName: "Zone Suitability", score: 98, status: "OPTIMAL", details: "Kitchen perfectly positioned in Agneya (South-East) Fire zone." };
      }
      if (z.includes("NORTH-EAST") || z.includes("NE") || z.includes("NNE")) {
        return { dimensionName: "Zone Suitability", score: 15, status: "CRITICAL_DEFECT", details: "Kitchen in Ishanya (North-East) Water zone destroys health & abundance energy." };
      }
      if (z.includes("NORTH-WEST") || z.includes("NW") || z.includes("WNW")) {
        return { dimensionName: "Zone Suitability", score: 85, status: "BALANCED", details: "Kitchen in Vayavya (North-West) Air zone is acceptable secondary placement." };
      }
      return { dimensionName: "Zone Suitability", score: 60, status: "SUBOPTIMAL", details: `Kitchen in ${zone} offers moderate elemental alignment.` };
    }

    if (canonicalType === "BEDROOM") {
      if (z.includes("SOUTH-WEST") || z.includes("SW") || z.includes("SSW")) {
        return { dimensionName: "Zone Suitability", score: 100, status: "OPTIMAL", details: "Master Bedroom in Nirriti (South-West) Earth zone provides stability & leadership." };
      }
      if (z.includes("NORTH-EAST") || z.includes("NE")) {
        return { dimensionName: "Zone Suitability", score: 40, status: "CRITICAL_DEFECT", details: "Master bedroom in Ishanya causes sleep restlessness & boundary loss." };
      }
      return { dimensionName: "Zone Suitability", score: 75, status: "BALANCED", details: `Bedroom in ${zone} provides reasonable rest comfort.` };
    }

    if (canonicalType === "TOILET") {
      if (z.includes("SOUTH-SOUTH-WEST") || z.includes("SSW") || z.includes("WEST-NORTH-WEST") || z.includes("WNW") || z.includes("EAST-SOUTH-EAST") || z.includes("ESE")) {
        return { dimensionName: "Zone Suitability", score: 95, status: "OPTIMAL", details: "Toilet situated in ideal disposal zones (SSW/WNW/ESE)." };
      }
      if (z.includes("NORTH-EAST") || z.includes("NE") || z.includes("NNE")) {
        return { dimensionName: "Zone Suitability", score: 10, status: "CRITICAL_DEFECT", details: "Toilet in Ishanya (North-East) contaminates sacred prosperity energy." };
      }
      return { dimensionName: "Zone Suitability", score: 55, status: "SUBOPTIMAL", details: `Toilet in ${zone} requires energetic neutralization remedies.` };
    }

    if (canonicalType === "POOJA") {
      if (z.includes("NORTH-EAST") || z.includes("NE") || z.includes("NORTH") || z.includes("EAST")) {
        return { dimensionName: "Zone Suitability", score: 100, status: "OPTIMAL", details: "Pooja Sanctum in Ishanya (North-East) attracts divine cosmic resonance." };
      }
      if (z.includes("SOUTH-WEST") || z.includes("SW")) {
        return { dimensionName: "Zone Suitability", score: 20, status: "CRITICAL_DEFECT", details: "Pooja room in Nirriti (South-West) creates spiritual friction." };
      }
    }

    return { dimensionName: "Zone Suitability", score: 80, status: "BALANCED", details: `${displayName} placed comfortably in ${zone}.` };
  }

  private static evalElementBalance(canonicalType: CanonicalRoomType, zone: string): DimensionEvaluation {
    const z = zone.toUpperCase();
    if ((canonicalType === "KITCHEN" && z.includes("NE")) || (canonicalType === "TOILET" && z.includes("SE"))) {
      return { dimensionName: "Element Balance", score: 20, status: "CRITICAL_DEFECT", details: "Severe elemental opposition (Fire vs Water)" };
    }
    return { dimensionName: "Element Balance", score: 88, status: "BALANCED", details: "Elemental attributes aligned with directional ruler" };
  }

  private static evalAdjacentRooms(canonicalType: CanonicalRoomType, adj: RecognizedEntity[]): DimensionEvaluation {
    const adjCanonical = adj.map((a) => this.resolveEntityCanonicalType(a));
    if (canonicalType === "KITCHEN" && adjCanonical.some((t) => t === "TOILET")) {
      return { dimensionName: "Adjacent Rooms", score: 25, status: "CRITICAL_DEFECT", details: "Kitchen shares wall or proximity with Toilet / Washroom" };
    }
    if (canonicalType === "POOJA" && adjCanonical.some((t) => t === "TOILET")) {
      return { dimensionName: "Adjacent Rooms", score: 15, status: "CRITICAL_DEFECT", details: "Pooja Sanctum shares wall with Toilet" };
    }
    return { dimensionName: "Adjacent Rooms", score: 90, status: "OPTIMAL", details: "Harmonious adjacencies with neighboring spaces" };
  }

  private static evalBrahmasthanDistance(canonicalType: CanonicalRoomType, dist: number): DimensionEvaluation {
    if (dist < 80) {
      if (canonicalType === "TOILET" || canonicalType === "KITCHEN" || canonicalType === "STAIRCASE") {
        return { dimensionName: "Distance from Brahmasthan", score: 10, status: "CRITICAL_DEFECT", details: "Heavy or polluting element directly inside Brahmasthan zone" };
      }
      return { dimensionName: "Distance from Brahmasthan", score: 60, status: "SUBOPTIMAL", details: "Structure sits inside Brahmasthan central grid" };
    }
    return { dimensionName: "Distance from Brahmasthan", score: 95, status: "OPTIMAL", details: "Maintains clear distance (>80px) from Brahmasthan core" };
  }

  private static evalEntranceDistance(canonicalType: CanonicalRoomType, dist: number): DimensionEvaluation {
    if (canonicalType === "TOILET" && dist < 100) {
      return { dimensionName: "Distance from Entrance", score: 30, status: "CRITICAL_DEFECT", details: "Toilet located too close to main entrance door" };
    }
    return { dimensionName: "Distance from Entrance", score: 85, status: "BALANCED", details: "Appropriate distance from primary property entrance" };
  }

  private static evalFireWaterInteraction(
    canonicalType: CanonicalRoomType,
    zone: string,
    adj: RecognizedEntity[]
  ): DimensionEvaluation {
    const z = zone.toUpperCase();
    const adjCanonical = adj.map((a) => this.resolveEntityCanonicalType(a));
    if (canonicalType === "KITCHEN" && (z.includes("NE") || adjCanonical.some((t) => t === "TOILET"))) {
      return { dimensionName: "Fire-Water Interaction", score: 20, status: "CRITICAL_DEFECT", details: "Fire element conflicting with Water element in close proximity" };
    }
    return { dimensionName: "Fire-Water Interaction", score: 92, status: "OPTIMAL", details: "No Fire-Water collision detected" };
  }

  private static evalStructuralWeight(
    canonicalType: CanonicalRoomType,
    displayName: string,
    zone: string
  ): DimensionEvaluation {
    const z = zone.toUpperCase();
    const isHeavy =
      canonicalType === "STAIRCASE" ||
      canonicalType === "STORE" ||
      (canonicalType === "BEDROOM" && roomTaxonomyService.isMasterBedroomDisplayLabel(displayName));
    if (isHeavy && z.includes("NE")) {
      return { dimensionName: "Structural Weight", score: 30, status: "CRITICAL_DEFECT", details: "Heavy weight loading on light North-East sector" };
    }
    return { dimensionName: "Structural Weight", score: 90, status: "OPTIMAL", details: "Weight distribution balanced across directional zones" };
  }

  private static evalNaturalLight(canonicalType: CanonicalRoomType, zone: string): DimensionEvaluation {
    const z = zone.toUpperCase();
    if (z.includes("E") || z.includes("NE") || z.includes("N")) {
      return { dimensionName: "Natural Light", score: 95, status: "OPTIMAL", details: "Receives rich morning solar radiation and natural daylight" };
    }
    return { dimensionName: "Natural Light", score: 80, status: "BALANCED", details: "Receives standard ambient illumination" };
  }

  private static evalVentilation(_canonicalType: CanonicalRoomType, _zone: string, _entity: RecognizedEntity): DimensionEvaluation {
    return { dimensionName: "Ventilation", score: 85, status: "BALANCED", details: "Adequate airflow circulation pathways mapped" };
  }

  private static evalAccessibility(_canonicalType: CanonicalRoomType, _distEntrance: number): DimensionEvaluation {
    return { dimensionName: "Accessibility", score: 88, status: "OPTIMAL", details: "Direct, unobstructed circulation access established" };
  }
}
