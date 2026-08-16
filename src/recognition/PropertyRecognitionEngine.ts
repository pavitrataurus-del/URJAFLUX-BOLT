import { CanonicalSpatialCalculationEngine } from "../core/spatial/CanonicalSpatialCalculationEngine";
import { 
  RawCadOrVisionEntity, 
  RecognizedEntity, 
  PropertyRecognitionSummary, 
  RecognitionMethod 
} from "./types";
import { RecognitionEvidenceBuilder } from "./RecognitionEvidenceBuilder";
import { RecognitionConfidenceService } from "./RecognitionConfidenceService";
import { RecognitionSummaryBuilder } from "./RecognitionSummaryBuilder";
import {
  isBlueprintNoiseText,
  isLikelyRoomLabel,
  isStructuralBlueprintLabel,
  preserveOcrLabel,
} from "./ocrLabelPolicy";
import { PENDING_CHAKRA_CALIBRATION_ZONE } from "./chakraOrientation";
import {
  roomTaxonomyService,
  canonicalToRuleElementType,
  type CanonicalRoomType,
} from "./RoomTaxonomyService";

/**
 * ============================================================================
 *             URJAFLUX AI OS — PROPERTY RECOGNITION ENGINE (PRE)
 * ============================================================================
 * 
 * Production Ground-Truth Architectural Recognition Engine
 * 
 * STRICT DUAL MODE ARCHITECTURE:
 * 
 * MODE A — LABELLED BLUEPRINT
 * - OCR is the ONLY source of room identity.
 * - Geometry is used ONLY for boundary extraction, centroid, dimensions, coordinates.
 * - Unlabelled room shapes are strictly classified as UNKNOWN ROOM.
 * - NO position-based, geometry-first, or context-based room guessing.
 * 
 * MODE B — UNLABELLED BLUEPRINT
 * - Triggered automatically when NO readable room labels exist on blueprint.
 * - Geometry + Vision + Object Detection may identify rooms ONLY when confidence > 0.85.
 * - Otherwise classified as UNKNOWN ROOM.
 * 
 * STRUCTURAL OBJECTS (NOT ROOMS):
 * - Staircase, Doors, Windows, Columns, Beams, Fixtures, Entry Gates remain
 *   independent architectural entities (STRUCTURE / OPENING / FIXTURE / UTILITY).
 */
export class PropertyRecognitionEngine {
  private static STRUCTURAL_KEYWORDS = [
    "staircase", "stair", "steps", "door", "main door", "main_door", "entrance", "entry", "window", "column", "beam", "gate",
    "fixture", "basin", "wash_basin", "sink", "septic_tank", "septic", "water_tank", "borewell",
    "stove", "burner", "stove_burner", "toilet_seat", "toilet seat", "wc", "bed", "dining_table", "dining table"
  ];

  /**
   * Main recognition entry point: accepts raw entities & net north angle, produces PropertyRecognitionSummary
   */
  public static recognizeProperty(
    rawEntities: RawCadOrVisionEntity[],
    netNorthAngleDegrees: number = 0,
    hasScale: boolean = true,
    centerOverride?: { x: number; y: number }
  ): PropertyRecognitionSummary {
    if (!rawEntities || rawEntities.length === 0) {
      return RecognitionSummaryBuilder.buildSummary([], netNorthAngleDegrees, hasScale, false);
    }

    // Determine Mode: Check if ANY entity has an explicit OCR label
    const isLabelledBlueprint = rawEntities.some(e => this.hasExplicitOcrLabel(e));
    const mode: "MODE_A_LABELLED" | "MODE_B_UNLABELLED" = isLabelledBlueprint
      ? "MODE_A_LABELLED"
      : "MODE_B_UNLABELLED";

    // Calculate property centroid for spatial zone assignment (or use centerOverride if provided)
    const center = centerOverride || this.calculatePropertyCentroid(rawEntities);

    // Process each entity under selected mode
    const recognizedEntities: RecognizedEntity[] = rawEntities.map((raw) => {
      return this.processEntity(raw, center, netNorthAngleDegrees, mode);
    });

    // Spatial Association: Attach containing room info to architectural/interior objects
    const rooms = recognizedEntities.filter(e => e.category === "ROOM");
    recognizedEntities.forEach(obj => {
      if (obj.category !== "ROOM" && obj.category !== "UNKNOWN") {
        const objCentroid = {
          x: obj.coordinates.x + obj.coordinates.width / 2,
          y: obj.coordinates.y + obj.coordinates.height / 2
        };
        let closestRoom: RecognizedEntity | null = null;
        let minDist = Infinity;

        for (const room of rooms) {
          const roomCentroid = {
            x: room.coordinates.x + room.coordinates.width / 2,
            y: room.coordinates.y + room.coordinates.height / 2
          };
          const dx = objCentroid.x - roomCentroid.x;
          const dy = objCentroid.y - roomCentroid.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const isInside = objCentroid.x >= room.coordinates.x &&
                           objCentroid.x <= room.coordinates.x + room.coordinates.width &&
                           objCentroid.y >= room.coordinates.y - room.coordinates.height &&
                           objCentroid.y <= room.coordinates.y;
          if (isInside) {
            closestRoom = room;
            break;
          } else if (dist < minDist) {
            minDist = dist;
            closestRoom = room;
          }
        }

        if (closestRoom) {
          obj.metadata = {
            ...obj.metadata,
            containingRoom: closestRoom.name,
            containingRoomId: closestRoom.id
          };
        }
      }
    });

    return RecognitionSummaryBuilder.buildSummary(
      recognizedEntities,
      netNorthAngleDegrees,
      hasScale,
      true
    );
  }

  /**
   * Processes a single entity according to strict mode rules
   */
  private static processEntity(
    raw: RawCadOrVisionEntity,
    center: { x: number; y: number },
    netNorthAngleDegrees: number,
    mode: "MODE_A_LABELLED" | "MODE_B_UNLABELLED"
  ): RecognizedEntity {
    if (raw.metadata?.entityClassified && !raw.metadata?.normalizationUnknown) {
      return this.processPreClassifiedEntity(raw, center, netNorthAngleDegrees, mode);
    }

    const rawName = (raw.name || "").trim();
    const rawType = (raw.type || "").trim().toLowerCase();

    const ocrLabel = this.extractOcrLabel(raw);
    const isStructural = this.isStructuralObject(rawName, rawType, raw.symbols, raw.fixtures);

    let method: RecognitionMethod = "UNKNOWN";
    let entityType = "unknown";
    let entityName = "UNKNOWN ROOM";
    let category: "ROOM" | "FIXTURE" | "UTILITY" | "STRUCTURE" | "UNKNOWN" = "UNKNOWN";

    if (isStructural) {
      // STRUCTURAL OBJECT: NOT A ROOM
      entityType = this.normalizeStructuralType(rawType || rawName, raw.symbols, raw.fixtures);
      entityName = rawName || this.formatTypeToName(entityType);
      category = this.determineStructuralCategory(entityType);
      method = ocrLabel ? "TEXT_LABEL" : (raw.symbols?.length || raw.fixtures?.length) ? "ARCHITECTURAL_SYMBOL" : "SPATIAL_GEOMETRY";
    } else if (mode === "MODE_A_LABELLED") {
      // MODE A — LABELLED BLUEPRINT
      if (ocrLabel) {
        method = "TEXT_LABEL";
        entityName = ocrLabel;
        category = "ROOM";
      } else {
        method = "UNKNOWN";
        entityType = "unknown";
        entityName = rawName && !rawName.toLowerCase().includes("entity") ? rawName : "UNKNOWN ROOM";
        category = "UNKNOWN";
      }
    } else {
      method = "UNKNOWN";
      entityType = "unknown";
      entityName = rawName && !rawName.toLowerCase().includes("entity") ? rawName : "UNKNOWN ROOM";
      category = "UNKNOWN";
    }

    const displayName = entityName;
    let canonicalType: CanonicalRoomType | string = "UNKNOWN_ROOM";
    if (category === "ROOM" && displayName && displayName !== "UNKNOWN ROOM") {
      canonicalType = roomTaxonomyService.resolveFromDisplayName(displayName).canonicalType;
    } else if (isStructural) {
      canonicalType = entityType.toUpperCase().replace(/\s+/g, "_");
    } else if (category === "UNKNOWN") {
      canonicalType = "UNKNOWN_ROOM";
    }

    const confidence = RecognitionConfidenceService.calculateConfidence(
      method,
      Boolean(raw.symbols?.length),
      Boolean(raw.fixtures?.length),
      false
    );
    const verificationStatus = RecognitionConfidenceService.determineVerificationStatus(confidence);

    // Direction/sectors are assigned only after Vastu Chakra calibration (see vastuAnalysisOrchestrator).
    const zone = PENDING_CHAKRA_CALIBRATION_ZONE;

    const evidence = RecognitionEvidenceBuilder.buildEvidence(
      entityName,
      entityType,
      method,
      confidence,
      raw.symbols,
      raw.fixtures,
      raw.adjacentTo
    );

    return {
      id: raw.id,
      name: displayName,
      displayName,
      canonicalType,
      type: category === "ROOM" ? canonicalToRuleElementType(canonicalType as CanonicalRoomType) : entityType,
      category,
      detectedBy: method,
      confidence,
      evidence,
      verificationStatus,
      zone,
      coordinates: {
        x: raw.x,
        y: raw.y,
        width: raw.width || 100,
        height: raw.height || 100
      },
      polygon: raw.polygon,
      metadata: {
        ...raw.metadata,
        recognitionMode: mode,
        taxonomyCanonicalType: canonicalType,
      }
    };
  }

  /**
   * Uses standardized classification from the OCR entity classifier.
   * Vastu analysis always consumes canonicalType / ruleElementType — never raw OCR text.
   */
  private static processPreClassifiedEntity(
    raw: RawCadOrVisionEntity,
    center: { x: number; y: number },
    netNorthAngleDegrees: number,
    mode: "MODE_A_LABELLED" | "MODE_B_UNLABELLED"
  ): RecognizedEntity {
    const displayName = preserveOcrLabel(raw.metadata?.ocrText || raw.name || "UNKNOWN ROOM");
    const canonicalType = String(raw.metadata?.canonicalType || "UNKNOWN_ROOM");
    const entityCategory = raw.metadata?.entityCategory as
      | "ROOM"
      | "STRUCTURE"
      | undefined;
    const ruleElementType = String(raw.metadata?.ruleElementType || "unknown");

    const isStructural = entityCategory === "STRUCTURE";
    let category: "ROOM" | "FIXTURE" | "UTILITY" | "STRUCTURE" | "UNKNOWN";
    let entityType = ruleElementType;
    let method: RecognitionMethod = "TEXT_LABEL";

    if (isStructural) {
      category = this.determineStructuralCategory(ruleElementType);
      entityType = ruleElementType;
    } else if (entityCategory === "ROOM") {
      category = "ROOM";
      entityType = ruleElementType;
    } else {
      category = "UNKNOWN";
      entityType = "unknown";
      method = "UNKNOWN";
    }

    const ocrConf = typeof raw.metadata?.ocrConfidence === "number" ? raw.metadata.ocrConfidence : 0.85;
    const normConf =
      typeof raw.metadata?.normalizationConfidence === "number"
        ? raw.metadata.normalizationConfidence
        : 0.85;
    const confidence = Math.min(1, Math.max(0.5, (ocrConf + normConf) / 2));
    const verificationStatus = RecognitionConfidenceService.determineVerificationStatus(confidence);
    const zone = PENDING_CHAKRA_CALIBRATION_ZONE;

    const evidence = RecognitionEvidenceBuilder.buildEvidence(
      displayName,
      entityType,
      method,
      confidence,
      raw.symbols,
      raw.fixtures,
      raw.adjacentTo
    );

    return {
      id: raw.id,
      name: displayName,
      displayName,
      canonicalType,
      type: isStructural ? entityType : canonicalToRuleElementType(canonicalType as CanonicalRoomType),
      category,
      detectedBy: method,
      confidence,
      evidence,
      verificationStatus,
      zone,
      coordinates: {
        x: raw.x,
        y: raw.y,
        width: raw.width || 100,
        height: raw.height || 100,
      },
      polygon: raw.polygon,
      metadata: {
        ...raw.metadata,
        recognitionMode: mode,
        taxonomyCanonicalType: canonicalType,
        ocrRawText: raw.metadata?.ocrRawText,
      },
    };
  }

  private static hasExplicitOcrLabel(raw: RawCadOrVisionEntity): boolean {
    if (raw.metadata?.entityClassified && !raw.metadata?.normalizationUnknown) {
      return raw.metadata?.entityCategory === "ROOM";
    }
    return Boolean(this.extractOcrLabel(raw));
  }

  private static extractOcrLabel(raw: RawCadOrVisionEntity): string | null {
    if (raw.metadata?.normalizationUnknown) return null;

    const ocrText = raw.metadata?.ocrText ? preserveOcrLabel(raw.metadata.ocrText) : "";
    const nameText = raw.name ? preserveOcrLabel(raw.name) : "";
    const candidate = ocrText || (nameText.toLowerCase() !== "unknown room" ? nameText : "");

    if (!candidate) return null;

    const lower = candidate.toLowerCase();
    if (lower === "room" || lower === "entity" || lower === "unknown" || lower === "space") {
      return null;
    }
    if (isBlueprintNoiseText(candidate)) return null;
    if (isStructuralBlueprintLabel(candidate)) return null;

    return candidate;
  }

  private static isStructuralObject(
    name: string,
    type: string,
    symbols?: string[],
    fixtures?: string[]
  ): boolean {
    const text = `${name} ${type} ${(symbols || []).join(" ")} ${(fixtures || []).join(" ")}`.toLowerCase();

    if (isLikelyRoomLabel(name) || isLikelyRoomLabel(type)) {
      return false;
    }

    return this.STRUCTURAL_KEYWORDS.some(sk => {
      if (sk === "bed") {
        return text.includes("bed") && !text.includes("bedroom");
      }
      if (sk === "dining") {
        return text.includes("dining_table") || text.includes("dining table") || text.includes("dining_chair");
      }
      if (sk === "entrance" || sk === "entry") {
        return text.includes("door") || text.includes("gate") || text.includes("entrance") || text.includes("entry");
      }
      return text.includes(sk);
    });
  }

  private static normalizeStructuralType(input: string, symbols?: string[], fixtures?: string[]): string {
    const text = `${input} ${(symbols || []).join(" ")} ${(fixtures || []).join(" ")}`.toLowerCase();
    if (text.includes("stair")) return "staircase";
    if (text.includes("main door") || text.includes("main_door") || text.includes("main entrance") || text.includes("main_entrance")) return "main_entrance";
    if (text.includes("door")) return "door";
    if (text.includes("window")) return "window";
    if (text.includes("column")) return "column";
    if (text.includes("wc") || text.includes("toilet_fixture") || text.includes("toilet_seat") || text.includes("toilet seat")) return "toilet_seat";
    if (text.includes("sink") || text.includes("basin") || text.includes("wash_basin") || text.includes("wash basin")) return "wash_basin";
    if (text.includes("stove") || text.includes("burner")) return "stove_burner";
    if (text.includes("dining")) return "dining_table";
    if (text.includes("bed") && !text.includes("bedroom")) return "bed";
    if (text.includes("septic")) return "septic_tank";
    if (text.includes("water") || text.includes("borewell")) return "water_tank";
    if (text.includes("gate") || text.includes("entrance")) return "entry_gate";
    return "structure";
  }

  private static determineStructuralCategory(type: string): "FIXTURE" | "UTILITY" | "STRUCTURE" {
    if (type.includes("door") || type.includes("window") || type.includes("column") || type.includes("stair")) return "STRUCTURE";
    if (type.includes("tank") || type.includes("borewell") || type.includes("septic") || type.includes("gate")) return "UTILITY";
    return "FIXTURE";
  }

  private static formatTypeToName(type: string): string {
    if (type === "unknown") return "UNKNOWN ROOM";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private static calculatePropertyCentroid(entities: RawCadOrVisionEntity[]): { x: number; y: number } {
    const points = entities.map((e) => ({
      x: e.x + (e.width || 0) / 2,
      y: e.y + (e.height || 0) / 2
    }));
    return CanonicalSpatialCalculationEngine.calculateCentroid(points);
  }

}

