import { describe, expect, it } from "vitest";
import { buildObjectReportItems, assessEntityVastuVerifiability, formatVerificationGateSummary, type DoshaItem } from "../vastuAnalysisOrchestrator";
import { PENDING_CHAKRA_CALIBRATION_ZONE } from "../../recognition/chakraOrientation";

const baseRoom = {
  id: "ent_kitchen_1",
  name: "Kitchen",
  displayName: "Kitchen",
  canonicalType: "KITCHEN",
  type: "kitchen",
  category: "ROOM",
  center: { x: 2, y: 3 },
  bounds: { width: 2, height: 2 },
  assignedZone: "South-East (SE / Agneya)",
  rawAngle: 135,
  confidence: 1,
  detectedBy: "TEXT_LABEL",
  verificationStatus: "VERIFIED",
  verifiableForRules: true,
};

const masterBedroom = {
  ...baseRoom,
  id: "ent_master_bed_1",
  name: "Master Bedroom",
  displayName: "Master Bedroom",
  canonicalType: "MASTER_BEDROOM",
  type: "master_bedroom",
  assignedZone: "South-West (SW / Nirriti)",
  rawAngle: 225,
};

const guestBedroom = {
  ...baseRoom,
  id: "ent_guest_bed_1",
  name: "Bedroom",
  displayName: "Bedroom",
  canonicalType: "BEDROOM",
  type: "bedroom",
  assignedZone: "North-West (NW / Vayavya)",
  rawAngle: 315,
};

describe("vastu pipeline entity identity", () => {
  it("does not attach kitchen dosha to master bedroom", () => {
    const roomData = [baseRoom, masterBedroom];
    const doshas: DoshaItem[] = [
      {
        id: "EVAL-KITCHEN-SE-ent_kitchen_1",
        ruleId: "KITCHEN-SE-DEFECT",
        title: "Kitchen in SE issue",
        severity: "HIGH",
        zone: baseRoom.assignedZone,
        description: "Kitchen defect",
        remedy: "Remedy",
        elementName: "Kitchen",
        elementId: "ent_kitchen_1",
        canonicalType: "KITCHEN",
        ruleType: "DEFECT",
      },
    ];

    const report = buildObjectReportItems(roomData, doshas, null);
    const kitchenReport = report.find((r) => r.id === "ent_kitchen_1");
    const masterReport = report.find((r) => r.id === "ent_master_bed_1");

    expect(kitchenReport?.objectName).toBe("Kitchen");
    expect(masterReport?.objectName).toBe("Master Bedroom");
    expect(masterReport?.statusType).toBe("NEEDS_IMPROVEMENT");
    expect(kitchenReport?.statusType).toBe("MAJOR_ISSUE");
  });

  it("keeps duplicate display names isolated by entity id", () => {
    const kitchenA = { ...baseRoom, id: "ent_kitchen_a", displayName: "Kitchen", name: "Kitchen" };
    const kitchenB = {
      ...baseRoom,
      id: "ent_kitchen_b",
      displayName: "Kitchen",
      name: "Kitchen",
      assignedZone: "North (N / Kuber)",
      rawAngle: 0,
    };
    const roomData = [kitchenA, kitchenB];
    const doshas: DoshaItem[] = [
      {
        id: "EVAL-KITCHEN-SE-ent_kitchen_a",
        ruleId: "KITCHEN-SE-DEFECT",
        title: "Kitchen SE",
        severity: "HIGH",
        zone: kitchenA.assignedZone,
        description: "Only kitchen A",
        remedy: "Remedy",
        elementName: "Kitchen",
        elementId: "ent_kitchen_a",
        canonicalType: "KITCHEN",
        ruleType: "DEFECT",
      },
    ];

    const report = buildObjectReportItems(roomData, doshas, null);
    expect(report.find((r) => r.id === "ent_kitchen_a")?.statusType).toBe("MAJOR_ISSUE");
    expect(report.find((r) => r.id === "ent_kitchen_b")?.statusType).toBe("NEEDS_IMPROVEMENT");
  });

  it("shows Unable to Verify instead of applying rules when not verifiable", () => {
    const unverified = {
      ...guestBedroom,
      verifiableForRules: false,
      unverifiableReason: "Entity position lacks blueprint-anchored coordinates — direction cannot be verified.",
      verificationFailedGate: "GEOMETRY_ANCHORS",
    };
    const doshas: DoshaItem[] = [
      {
        id: "EVAL-BED-NW-ent_guest_bed_1",
        ruleId: "BED-NW",
        title: "Should not apply",
        severity: "HIGH",
        zone: guestBedroom.assignedZone,
        description: "Should not show",
        remedy: "Remedy",
        elementName: "Bedroom",
        elementId: "ent_guest_bed_1",
        canonicalType: "BEDROOM",
        ruleType: "DEFECT",
      },
    ];

    const report = buildObjectReportItems([unverified], doshas, null);
    expect(report[0].statusType).toBe("UNABLE_TO_VERIFY");
    expect(report[0].status).toBe("⚠ Unable to Verify");
    expect(report[0].explanation).toContain("OCR : PASS");
    expect(report[0].explanation).toContain("Normalization : PASS");
    expect(report[0].explanation).toContain("Geometry : FAIL");
    expect(report[0].explanation).toContain("Reason :");
  });

  it("formats verification gate summary with per-gate pass/fail lines", () => {
    const summary = formatVerificationGateSummary(
      "Kitchen",
      "BLUEPRINT_FRAME",
      "Blueprint scale or dimensions are not set — OCR position cannot be anchored reliably."
    );
    expect(summary).toContain("Kitchen");
    expect(summary).toContain("OCR : PASS");
    expect(summary).toContain("Normalization : PASS");
    expect(summary).toContain("Geometry : FAIL");
    expect(summary).toContain("Reason : Blueprint scale");
  });

  it("preserves OCR display name through report output", () => {
    const report = buildObjectReportItems(
      [masterBedroom],
      [],
      {
        totalRoomsRecognized: 1,
        totalObjectsRecognized: 1,
        doorsCount: 0,
        windowsCount: 0,
        entities: [
          {
            id: masterBedroom.id,
            name: "Master Bedroom",
            displayName: "Master Bedroom",
            canonicalType: "MASTER_BEDROOM",
            type: "master_bedroom",
            category: "ROOM",
            detectedBy: "TEXT_LABEL",
            confidence: 1,
            evidence: [],
            verificationStatus: "VERIFIED",
            zone: masterBedroom.assignedZone,
            coordinates: { x: 0, y: 0, width: 2, height: 2 },
          },
        ],
        validationChecklist: {
          propertyBoundaryFound: true,
          scaleAvailable: true,
          northLocked: true,
          allRoomsClassified: true,
          objectsClassified: true,
          zonesAssigned: true,
          confidenceCalculated: true,
          unknownRoomsFlagged: true,
          allPassed: true,
        },
        breakdown: {
          kitchens: 0,
          bedrooms: 1,
          toilets: 0,
          staircases: 0,
          septicTanks: 0,
          waterTanks: 0,
          parking: 0,
          poojaRooms: 0,
          livingRooms: 0,
          unknownSpaces: 0,
          otherElements: 0,
        },
        coverage: {
          roomsRecognized: 1,
          objectsRecognized: 1,
          doorsDetected: 0,
          windowsDetected: 0,
          unknownSpacesCount: 0,
        },
        timestamp: new Date().toISOString(),
      } as any
    );

    expect(report[0].objectName).toBe("Master Bedroom");
    expect(report[0].why.detectedOcrLabel).toBe("MASTER BEDROOM");
  });

  it("marks entity unverifiable when OCR UV exists but blueprint frame is invalid", () => {
    const room = {
      ...baseRoom,
      metadata: { blueprintNormU: 0.3, blueprintNormV: 0.4, entityClassified: true },
    };
    const rec = {
      canonicalType: "KITCHEN",
      confidence: 1,
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
    const blueprint = { x: 0, y: 0, width: 0, height: 0, rotation: 0 } as any;

    const result = assessEntityVastuVerifiability(
      rec as any,
      cad as any,
      blueprint,
      true,
      room.assignedZone
    );

    expect(result.verifiable).toBe(false);
    expect(result.reason).toContain("Blueprint scale");
  });

  it("shows Unable to Verify for pending calibration instead of rules", () => {
    const pending = {
      ...baseRoom,
      assignedZone: PENDING_CHAKRA_CALIBRATION_ZONE,
      verifiableForRules: false,
      unverifiableReason: "Not calibrated",
    };
    const report = buildObjectReportItems([pending], [], null);
    expect(report[0].statusType).toBe("NEEDS_IMPROVEMENT");
  });
});
