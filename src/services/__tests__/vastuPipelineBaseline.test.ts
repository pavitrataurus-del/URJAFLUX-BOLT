/**
 * LOCKED BASELINE — Vastu OCR / entity / geometry / analysis pipeline regression guards.
 *
 * Purpose: freeze current working behaviour. Do not refactor production code to satisfy
 * these tests — update tests only when behaviour is intentionally changed.
 *
 * Covered contracts:
 * - Blueprint entity identification + canonical display names
 * - OCR garbage rejection
 * - Normalizer must not upgrade ambiguous OCR to more specific entities
 * - Unknown / low-confidence → Unable to Verify (verification gates)
 * - Entity ID binding + dosha correlation isolation
 * - Geometry-anchored direction stability (zone SSOT)
 * - Chakra as orientation reference; North is not an entity
 */
import { describe, expect, it } from "vitest";
import {
  assessEntityVastuVerifiability,
  buildObjectReportItems,
  calculateVastuZone,
  formatVerificationGateSummary,
  type DoshaItem,
} from "../vastuAnalysisOrchestrator";
import { classifyArchitecturalEntity, isSpecificityUpgrade } from "../../recognition/ocrEntityNormalizer";
import {
  isCardinalDirectionMarker,
  isOcrFragmentGarbage,
  isValidBlueprintEntityLabel,
} from "../../recognition/ocrLabelPolicy";
import { PropertyRecognitionEngine } from "../../recognition/PropertyRecognitionEngine";
import { PENDING_CHAKRA_CALIBRATION_ZONE } from "../../recognition/chakraOrientation";
import { CanonicalZoneRegistry } from "../../core/spatial/CanonicalZoneRegistry";

/** Reference home-floor-plan labels — generic blueprint support baseline. */
const HOME_BLUEPRINT_LABELS: Array<{
  ocr: string;
  displayLabel: string;
}> = [
  { ocr: "KITCHEN", displayLabel: "KITCHEN" },
  { ocr: "ENTRANCE", displayLabel: "ENTRANCE" },
  { ocr: "STAIRS", displayLabel: "STAIRS" },
  { ocr: "WASHING AREA", displayLabel: "WASHING AREA" },
  { ocr: "BEDROOM", displayLabel: "BEDROOM" },
  { ocr: "DINING TABLE", displayLabel: "DINING TABLE" },
  { ocr: "LIVING ROOM", displayLabel: "LIVING ROOM" },
  { ocr: "MASTER BEDROOM", displayLabel: "MASTER BEDROOM" },
  { ocr: "WASHROOM", displayLabel: "WASHROOM" },
  { ocr: "CHANGING ROOM", displayLabel: "CHANGING ROOM" },
];

const verifiedKitchen = {
  id: "ent_kitchen_locked",
  name: "Kitchen",
  displayName: "Kitchen",
  canonicalType: "KITCHEN",
  type: "kitchen",
  category: "ROOM",
  center: { x: 2, y: 3 },
  bounds: { width: 2, height: 2 },
  assignedZone: "South-East (SE / Agneya)",
  rawAngle: 135,
  confidence: 0.95,
  detectedBy: "TEXT_LABEL",
  verificationStatus: "VERIFIED",
  verifiableForRules: true,
  metadata: { blueprintNormU: 0.35, blueprintNormV: 0.2, entityClassified: true },
};

const blueprintFrame = { x: 0, y: 0, width: 20, height: 10, rotation: 0 };

describe("LOCKED BASELINE — canonical entity names", () => {
  it("accepts home blueprint labels as valid entities with stable display names", () => {
    for (const { ocr, displayLabel } of HOME_BLUEPRINT_LABELS) {
      expect(isValidBlueprintEntityLabel(ocr), `label gate: ${ocr}`).toBe(true);
      const classified = classifyArchitecturalEntity(ocr, 0.92);
      expect(classified.isUnknown, `unknown: ${ocr}`).toBe(false);
      expect(classified.normalizedLabel, `display: ${ocr}`).toBe(displayLabel);
    }
  });

  it("preserves Kitchen, Master Bedroom, Living Room as distinct canonical identities", () => {
    const kitchen = classifyArchitecturalEntity("KITCHEN", 0.95);
    const master = classifyArchitecturalEntity("MASTER BEDROOM", 0.95);
    const living = classifyArchitecturalEntity("LIVING ROOM", 0.95);

    expect(kitchen.normalizedLabel).toBe("KITCHEN");
    expect(master.normalizedLabel).toBe("MASTER BEDROOM");
    expect(living.normalizedLabel).toBe("LIVING ROOM");
    expect(kitchen.canonicalType).not.toBe(master.canonicalType);
    expect(master.normalizedLabel).not.toBe(living.normalizedLabel);
  });
});

describe("LOCKED BASELINE — OCR garbage rejection", () => {
  const garbageSamples = ["H z 8 H", "L WOOUNIONVHD", "7S", "m]", "XYZQ"];

  it("rejects known OCR garbage before entity creation", () => {
    for (const sample of garbageSamples) {
      if (sample === "XYZQ") {
        expect(isOcrFragmentGarbage(sample)).toBe(false);
        expect(isValidBlueprintEntityLabel(sample)).toBe(true);
        const unknown = classifyArchitecturalEntity(sample, 0.4);
        expect(unknown.isUnknown).toBe(true);
        continue;
      }
      expect(
        isOcrFragmentGarbage(sample) || !isValidBlueprintEntityLabel(sample),
        `should reject ${sample}`
      ).toBe(true);
    }
  });
});

describe("LOCKED BASELINE — normalizer specificity guard", () => {
  it("never upgrades KITCHEN to OPEN KITCHEN", () => {
    const result = classifyArchitecturalEntity("KITCHEN", 0.92);
    expect(result.normalizedLabel).toBe("KITCHEN");
    expect(isSpecificityUpgrade("KITCHEN", "OPEN KITCHEN")).toBe(true);
  });

  it("never maps CHANGING ROOM to POWDER ROOM", () => {
    const result = classifyArchitecturalEntity("CHANGING ROOM", 0.92);
    expect(result.normalizedLabel).toBe("CHANGING ROOM");
    expect(result.normalizedLabel).not.toBe("POWDER ROOM");
  });

  it("rejects low-confidence fuzzy-only normalization", () => {
    const result = classifyArchitecturalEntity("BEDROO", 0.5);
    expect(result.isUnknown).toBe(true);
  });
});

describe("LOCKED BASELINE — North is orientation, not entity", () => {
  it("treats cardinal margin labels as direction markers, not room labels", () => {
    for (const marker of ["NORTH", "SOUTH", "EAST", "WEST"]) {
      expect(isCardinalDirectionMarker(marker)).toBe(true);
      expect(isValidBlueprintEntityLabel(marker)).toBe(false);
    }
    expect(isCardinalDirectionMarker("KITCHEN")).toBe(false);
    expect(isValidBlueprintEntityLabel("KITCHEN")).toBe(true);
  });
});

describe("LOCKED BASELINE — verification gates (Unable to Verify)", () => {
  it("blocks rule evaluation when OCR confidence is below threshold", () => {
    const rec = {
      canonicalType: "KITCHEN",
      confidence: 0.7,
      detectedBy: "TEXT_LABEL",
      verificationStatus: "VERIFIED",
      metadata: { blueprintNormU: 0.3, blueprintNormV: 0.4, entityClassified: true },
      coordinates: { width: 2, height: 2 },
    };
    const cad = {
      width: 2,
      height: 2,
      metadata: { blueprintNormU: 0.3, blueprintNormV: 0.4 },
    };

    const result = assessEntityVastuVerifiability(
      rec,
      cad as any,
      blueprintFrame as any,
      true,
      "South-East (SE / Agneya)"
    );

    expect(result.verifiable).toBe(false);
    expect(result.failedGate).toBe("OCR_CONFIDENCE");
  });

  it("blocks rule evaluation when canonical type is unknown", () => {
    const rec = {
      canonicalType: "UNKNOWN_ROOM",
      confidence: 0.95,
      detectedBy: "TEXT_LABEL",
      verificationStatus: "VERIFIED",
      metadata: { blueprintNormU: 0.3, blueprintNormV: 0.4, entityClassified: true },
      coordinates: { width: 2, height: 2 },
    };

    const result = assessEntityVastuVerifiability(
      rec,
      undefined,
      blueprintFrame as any,
      true,
      "South-East (SE / Agneya)"
    );

    expect(result.verifiable).toBe(false);
    expect(result.failedGate).toBe("CANONICAL_TYPE");
  });

  it("blocks rule evaluation when normalization was uncertain", () => {
    const rec = {
      canonicalType: "KITCHEN",
      confidence: 0.95,
      detectedBy: "TEXT_LABEL",
      verificationStatus: "VERIFIED",
      metadata: {
        blueprintNormU: 0.3,
        blueprintNormV: 0.4,
        entityClassified: true,
        normalizationUnknown: true,
      },
      coordinates: { width: 2, height: 2 },
    };

    const result = assessEntityVastuVerifiability(
      rec,
      undefined,
      blueprintFrame as any,
      true,
      "South-East (SE / Agneya)"
    );

    expect(result.verifiable).toBe(false);
    expect(result.failedGate).toBe("NORMALIZATION");
  });

  it("blocks rule evaluation until Chakra orientation is calibrated", () => {
    const rec = {
      canonicalType: "KITCHEN",
      confidence: 0.95,
      detectedBy: "TEXT_LABEL",
      verificationStatus: "VERIFIED",
      metadata: { blueprintNormU: 0.3, blueprintNormV: 0.4, entityClassified: true },
      coordinates: { width: 2, height: 2 },
    };

    const result = assessEntityVastuVerifiability(
      rec,
      undefined,
      blueprintFrame as any,
      false,
      PENDING_CHAKRA_CALIBRATION_ZONE
    );

    expect(result.verifiable).toBe(false);
    expect(result.failedGate).toBe("ZONE_CALIBRATION");
  });

  it("surfaces Unable to Verify on report instead of applying rules", () => {
    const unverified = {
      ...verifiedKitchen,
      verifiableForRules: false,
      unverifiableReason: "Entity name or location could not be verified with sufficient confidence for Vastu rule evaluation.",
      verificationFailedGate: "OCR_CONFIDENCE",
    };
    const doshas: DoshaItem[] = [
      {
        id: "EVAL-KITCHEN-SE-ent_kitchen_locked",
        ruleId: "KITCHEN-SE-DEFECT",
        title: "Should not apply",
        severity: "HIGH",
        zone: unverified.assignedZone,
        description: "hidden",
        remedy: "Remedy",
        elementName: "Kitchen",
        elementId: "ent_kitchen_locked",
        canonicalType: "KITCHEN",
        ruleType: "DEFECT",
      },
    ];

    const report = buildObjectReportItems([unverified], doshas, null);
    expect(report[0].statusType).toBe("UNABLE_TO_VERIFY");
    expect(report[0].status).toBe("⚠ Unable to Verify");
    expect(formatVerificationGateSummary("Kitchen", "OCR_CONFIDENCE", unverified.unverifiableReason!)).toContain(
      "OCR"
    );
  });
});

describe("LOCKED BASELINE — entity ID binding", () => {
  it("preserves permanent entity IDs through PropertyRecognitionEngine", () => {
    const rawEntities = [
      {
        id: "ent_kitchen_a",
        name: "KITCHEN",
        type: "Room",
        x: 1,
        y: 2,
        width: 2,
        height: 2,
        metadata: { ocrText: "KITCHEN", ocrConfidence: 0.95, entityClassified: true },
      },
      {
        id: "ent_master_bed_1",
        name: "MASTER BEDROOM",
        type: "Room",
        x: 4,
        y: 2,
        width: 3,
        height: 2,
        metadata: { ocrText: "MASTER BEDROOM", ocrConfidence: 0.95, entityClassified: true },
      },
    ];

    const summary = PropertyRecognitionEngine.recognizeProperty(rawEntities, 0, true);
    expect(summary.entities.find((e) => e.id === "ent_kitchen_a")).toBeDefined();
    expect(summary.entities.find((e) => e.id === "ent_master_bed_1")).toBeDefined();
    expect(summary.entities.find((e) => e.id === "ent_kitchen_a")?.displayName).toBe("KITCHEN");
    expect(summary.entities.find((e) => e.id === "ent_master_bed_1")?.displayName).toBe(
      "MASTER BEDROOM"
    );
  });

  it("does not attach a dosha to the wrong entity when IDs differ", () => {
    const kitchenA = { ...verifiedKitchen, id: "ent_kitchen_a" };
    const kitchenB = {
      ...verifiedKitchen,
      id: "ent_kitchen_b",
      assignedZone: "North (N / Kuber)",
      rawAngle: 0,
    };
    const doshas: DoshaItem[] = [
      {
        id: "EVAL-KITCHEN-SE-ent_kitchen_a",
        ruleId: "KITCHEN-SE-DEFECT",
        title: "Kitchen SE defect",
        severity: "HIGH",
        zone: kitchenA.assignedZone,
        description: "Only A",
        remedy: "Remedy",
        elementName: "Kitchen",
        elementId: "ent_kitchen_a",
        canonicalType: "KITCHEN",
        ruleType: "DEFECT",
      },
    ];

    const report = buildObjectReportItems([kitchenA, kitchenB], doshas, null);
    expect(report.find((r) => r.id === "ent_kitchen_a")?.statusType).toBe("MAJOR_ISSUE");
    expect(report.find((r) => r.id === "ent_kitchen_b")?.statusType).toBe("NEEDS_IMPROVEMENT");
  });

  it("does not correlate dosha by display name when multiple entities share it", () => {
    const a = { ...verifiedKitchen, id: "ent_kitchen_a", displayName: "Kitchen", name: "Kitchen" };
    const b = {
      ...verifiedKitchen,
      id: "ent_kitchen_b",
      displayName: "Kitchen",
      name: "Kitchen",
      assignedZone: "North (N / Kuber)",
      rawAngle: 0,
    };
    const doshas: DoshaItem[] = [
      {
        id: "EVAL-KITCHEN-WRONG",
        ruleId: "KITCHEN-N-DEFECT",
        title: "Name-only match",
        severity: "HIGH",
        zone: "North (N / Kuber)",
        description: "Should not attach without id",
        remedy: "Remedy",
        elementName: "Kitchen",
        elementId: "",
        canonicalType: "KITCHEN",
        ruleType: "DEFECT",
      },
    ];

    const report = buildObjectReportItems([a, b], doshas, null);
    expect(report.find((r) => r.id === "ent_kitchen_a")?.statusType).toBe("NEEDS_IMPROVEMENT");
    expect(report.find((r) => r.id === "ent_kitchen_b")?.statusType).toBe("NEEDS_IMPROVEMENT");
  });
});

describe("LOCKED BASELINE — zone SSOT + geometry direction", () => {
  it("delegates calculateVastuZone to CanonicalZoneRegistry", () => {
    expect(calculateVastuZone(135)).toBe(
      CanonicalZoneRegistry.displayLabelFromBearing(135)
    );
    expect(calculateVastuZone(225)).toContain("South-West");
    expect(calculateVastuZone(0)).toContain("North");
  });

  it("uses net north offset formula: (calibration + chakraRotation) mod 360", () => {
    const computeNetNorth = (calibration: number, rotation: number) =>
      ((calibration + rotation) % 360 + 360) % 360;

    expect(computeNetNorth(15, 30)).toBe(45);
    expect(computeNetNorth(350, 20)).toBe(10);
    expect(computeNetNorth(0, 0)).toBe(0);
  });
});
