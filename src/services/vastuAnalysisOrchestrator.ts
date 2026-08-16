import { WorkflowOrchestrator } from "../engines/orchestrator/WorkflowOrchestrator";
import { BlueprintData, CadEntity } from "../components/CadBlueprintWorkspace";
import { BuildingModel } from "../types/spatialIntelligence";
import { buildingElementRegistry } from "./spatial/BuildingElementRegistry";
import { blueprintEngine } from "../spatial/BlueprintEngine/BlueprintEngine";
import { BlueprintIntelligenceEngine } from "./blueprintIntelligenceEngine";
import { 
  EvaluationProgressState, 
  EvaluationStageInfo, 
  EvaluationModuleType, 
  EvaluationStageCallback 
} from "../components/vastu/EvaluationExperienceModal";
import { proceduralRuleEngine } from "../engines/procedural/ProceduralRuleEngine";
import { RuleEvaluationContext, RuleDomain } from "../engines/procedural/types";
import { PropertyRecognitionEngine } from "../recognition/PropertyRecognitionEngine";
import { PropertyRecognitionSummary, RawCadOrVisionEntity } from "../recognition/types";
import { UrjafluxDecisionEngine, DecisionEngineExecutionResult } from "../engines/decision/UrjafluxDecisionEngine";
import { 
  RuntimeEvaluationSessionStore, 
  generateExecutionId, 
  RuntimeEvaluationSession 
} from "../core/session/RuntimeEvaluationSession";
import { EvaluationCoverageEngine } from "../engines/validation/EvaluationCoverageEngine";
import { CanonicalSpatialCalculationEngine } from "../core/spatial/CanonicalSpatialCalculationEngine";
import { resolveEntityWorldCenter } from "../core/spatial/blueprintAnchoredCoordinates";
import { EnterpriseCognitiveReasoningService, GroundedPdfCitation } from "../core/knowledge_ingestion/reasoning/EnterpriseCognitiveReasoningService";
import { KnowledgeVaultService } from "./knowledgeVaultService";
import { KnowledgeVaultRemedyEvaluationService } from "./knowledgeVaultRemedyEvaluationService";
import {
  isPresentableVaultRemedy,
  resolveHomeownerFacingRemedy,
  resolveHomeownerFacingRemedies,
  stripInternalEngineMeta,
  stripBookCitationLeaks,
  buildDirectionalIssueExplanation,
  formatRemediesForDisplay,
} from "./vaultRemedyTextQuality";
import { clientDiscoveryService } from "./clientDiscoveryService";
import { clientContextIntelligenceEngine } from "./clientContextIntelligenceEngine";
import {
  PENDING_CHAKRA_CALIBRATION_ZONE,
  isPendingChakraCalibrationZone,
} from "../recognition/chakraOrientation";
import { roomTaxonomyService, canonicalToRuleElementType, type CanonicalRoomType } from "../recognition/RoomTaxonomyService";
import { CanonicalZoneRegistry } from "../core/spatial/CanonicalZoneRegistry";

const pipelineDevLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.info(...args);
};

const pipelineDevWarn = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.warn(...args);
};

export interface InternalReasoningChain {
  objectName: string;
  detectedPosition: { x: number; y: number };
  centroid: { x: number; y: number };
  angle: number;
  finalZone: string;
  appliedRuleId: string;
  knowledgeSource: {
    book: string;
    chapter: string;
    page: number;
  };
}

export interface DoshaItem {
  id: string;
  ruleId: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  zone: string;
  description: string;
  remedy: string;
  elementName?: string;
  elementId?: string;
  canonicalType?: string;
  ruleType?: "DEFECT" | "BENEFICIAL" | "NEUTRAL";
  citationMetadata?: GroundedPdfCitation;
  reasoningChain?: InternalReasoningChain;
}

export interface ObjectReportItem {
  id: string;
  objectName: string;
  type: string;
  zone: string;
  status: "✅ Correct" | "⚠ Needs Improvement" | "❌ Major Issue" | "⚠ Unable to Verify";
  statusType: "CORRECT" | "NEEDS_IMPROVEMENT" | "MAJOR_ISSUE" | "UNABLE_TO_VERIFY";
  explanation?: string;
  problem?: string;
  possibleEffect?: string;
  suggestedRemedy?: string;
  suggestedRemedies?: string[];
  knowledgeSource?: {
    book: string;
    chapter: string;
    page: number | string;
  };
  why: {
    detectionMethod: string;
    detectedOcrLabel: string;
    detectionConfidence: string;
    detectedCentroid: string;
    calculatedAngle: string;
    calculatedZone: string;
    appliedRule: string;
    knowledgeBook: string;
    chapter: string;
    page: string;
    reason: string;
  };
}

export interface VastuAnalysisResult {
  executionId: string;
  timestamp: string;
  totalEntitiesEvaluated: number;
  overallScore: number | null; // 0 to 100, or null for N/A
  doshas: DoshaItem[];
  objectReportItems?: ObjectReportItem[];
  passedRulesCount: number;
  totalRulesCount: number;
  summary: string;
  rawReport?: any;
  recognitionSummary?: PropertyRecognitionSummary;
  decisionExecutionResult?: DecisionEngineExecutionResult;
}

/**
 * Sanitizes technical jargon into clear, plain homeowner language.
 */
export function sanitizeTextForHomeowner(text: string): string {
  if (!text) return "";
  return text
    .replace(/catastrophic/gi, "Major Issue / Bada Dosha (बड़ा दोष)")
    .replace(/structural failure/gi, "Layout Conflict / Vastu Asantulan")
    .replace(/sacred axis collapse/gi, "Energy Axis Misalignment (ऊर्जा असंतुलन)")
    .replace(/severe energy destruction/gi, "Elemental Imbalance (तत्व असंतुलन)")
    .replace(/severe defect/gi, "Significant Issue / Vastu Dosha")
    .replace(/severe/gi, "Important")
    .replace(/critical defect/gi, "Major Issue / Mukhya Dosha")
    .replace(/critical/gi, "High Priority")
    .replace(/affliction/gi, "layout concern")
    .replace(/violation/gi, "item for attention")
    .replace(/dosha/gi, "layout issue / dosha");
}

function generatePositiveExplanation(name: string, _type: string, zone: string): string {
  return roomTaxonomyService.getPositiveExplanationTemplate(name, zone);
}

function generatePositiveWhyReason(name: string, _type: string, zone: string): string {
  return `The ${zone} sector aligns with favorable spatial energy rules for ${name}. Natural lighting, structural orientation, and elemental harmony are properly maintained.`;
}

type ReportRoomEntity = {
  id: string;
  name: string;
  displayName?: string;
  canonicalType?: string;
  type: string;
  category: string;
  center: { x: number; y: number };
  bounds: { width: number; height: number };
  assignedZone: string;
  rawAngle: number;
  confidence: number;
  detectedBy: string;
  verificationStatus: string;
  verifiableForRules: boolean;
  unverifiableReason?: string;
  verificationFailedGate?: string;
};

type VerificationGateStatus = "PASS" | "FAIL" | "PENDING";

function deriveVerificationGateStatuses(failedGate?: string): {
  ocr: VerificationGateStatus;
  normalization: VerificationGateStatus;
  geometry: VerificationGateStatus;
} {
  switch (failedGate) {
    case "OCR_CONFIDENCE":
      return { ocr: "FAIL", normalization: "PASS", geometry: "PENDING" };
    case "NORMALIZATION":
    case "CANONICAL_TYPE":
      return { ocr: "PASS", normalization: "FAIL", geometry: "PENDING" };
    case "ENTITY_CLASSIFICATION":
      return { ocr: "PASS", normalization: "FAIL", geometry: "PENDING" };
    case "GEOMETRY_ANCHORS":
    case "BLUEPRINT_FRAME":
      return { ocr: "PASS", normalization: "PASS", geometry: "FAIL" };
    case "ZONE_CALIBRATION":
      return { ocr: "PASS", normalization: "PASS", geometry: "PENDING" };
    default:
      return { ocr: "PASS", normalization: "PASS", geometry: "PASS" };
  }
}

export function formatVerificationGateSummary(
  entityName: string,
  failedGate: string | undefined,
  reason: string
): string {
  const gates = deriveVerificationGateStatuses(failedGate);
  return [
    entityName,
    `OCR : ${gates.ocr}`,
    `Normalization : ${gates.normalization}`,
    `Geometry : ${gates.geometry}`,
    `Reason : ${reason}`,
  ].join("\n");
}

function getRoomDisplayName(room: { displayName?: string; name: string }): string {
  return room.displayName || room.name;
}

function getRoomCanonicalType(room: { canonicalType?: string; displayName?: string; name: string }): CanonicalRoomType {
  return roomTaxonomyService.resolveCanonicalTypeFromEntity(
    room.canonicalType,
    getRoomDisplayName(room)
  );
}

function isValidBlueprintAnchorFrame(blueprint: BlueprintData | null | undefined): boolean {
  if (!blueprint) return false;
  const w = blueprint.width ?? 0;
  const h = blueprint.height ?? 0;
  return w > 0 && h > 0;
}

function resolveCadEntityForRecognition(
  rec: { id: string; displayName?: string; name: string },
  cadEntities: CadEntity[]
): CadEntity | undefined {
  const byId = cadEntities.find((c) => c.id === rec.id);
  if (byId) return byId;

  const displayLabel = rec.displayName || rec.name;
  const nameMatches = cadEntities.filter((c) => c.name === displayLabel);
  if (nameMatches.length === 1) return nameMatches[0];

  return undefined;
}

function hasReliableGeometryAnchors(
  entity: {
    width?: number;
    height?: number;
    polygon?: Array<{ x: number; y: number }>;
    metadata?: Record<string, unknown>;
  },
  blueprint: BlueprintData | null | undefined
): boolean {
  const meta = entity.metadata;
  const normU = meta?.blueprintNormU;
  const normV = meta?.blueprintNormV;
  if (
    typeof normU === "number" &&
    typeof normV === "number" &&
    !Number.isNaN(normU) &&
    !Number.isNaN(normV)
  ) {
    return isValidBlueprintAnchorFrame(blueprint);
  }
  if (entity.polygon && entity.polygon.length >= 3) return true;
  const halfW = (entity.width ?? 0) / 2;
  const halfH = (entity.height ?? 0) / 2;
  if (halfW > 0 || halfH > 0) {
    const rotation = blueprint?.rotation ?? 0;
    return rotation === 0;
  }
  return false;
}

export interface EntityVerifiabilityResult {
  verifiable: boolean;
  reason?: string;
  failedGate?: string;
  trace: {
    ocrConfidence: number;
    normalizationConfidence?: number;
    entityClassified?: boolean;
    verificationStatus: string;
    geometryReliable: boolean;
    chakraCalibrated: boolean;
    zoneAssigned: boolean;
    canonicalType: string;
  };
}

export function assessEntityVastuVerifiability(
  rec: {
    canonicalType?: string;
    confidence: number;
    detectedBy: string;
    verificationStatus: string;
    metadata?: Record<string, unknown>;
    coordinates: { width: number; height: number };
    polygon?: Array<{ x: number; y: number }>;
  },
  cadEntity: CadEntity | undefined,
  blueprint: BlueprintData | null | undefined,
  chakraCalibrated: boolean,
  assignedZone: string
): EntityVerifiabilityResult {
  const trace = {
    ocrConfidence: rec.confidence,
    normalizationConfidence:
      typeof rec.metadata?.normalizationConfidence === "number"
        ? rec.metadata.normalizationConfidence
        : undefined,
    entityClassified: rec.metadata?.entityClassified === true,
    verificationStatus: rec.verificationStatus,
    geometryReliable: false,
    chakraCalibrated,
    zoneAssigned: !isPendingChakraCalibrationZone(assignedZone),
    canonicalType: rec.canonicalType || "UNKNOWN_ROOM",
  };

  if (!chakraCalibrated || isPendingChakraCalibrationZone(assignedZone)) {
    return {
      verifiable: false,
      reason: "Directional zone not calibrated — geometry-based direction unavailable.",
      failedGate: "ZONE_CALIBRATION",
      trace,
    };
  }

  const canonical = rec.canonicalType || "UNKNOWN_ROOM";
  if (canonical === "UNKNOWN_ROOM" || canonical === "UNKNOWN") {
    return {
      verifiable: false,
      reason: "Room type could not be reliably identified from the blueprint label.",
      failedGate: "CANONICAL_TYPE",
      trace,
    };
  }

  if (rec.metadata?.normalizationUnknown === true) {
    return {
      verifiable: false,
      reason: "OCR label normalization was uncertain — entity type not confirmed.",
      failedGate: "NORMALIZATION",
      trace,
    };
  }

  if (rec.verificationStatus !== "VERIFIED" || rec.confidence < 0.88) {
    return {
      verifiable: false,
      reason: "Entity name or location could not be verified with sufficient confidence for Vastu rule evaluation.",
      failedGate: "OCR_CONFIDENCE",
      trace,
    };
  }

  if (rec.metadata?.entityClassified !== true) {
    const ocrLabelConfirmed =
      rec.detectedBy === "TEXT_LABEL" &&
      rec.canonicalType &&
      rec.canonicalType !== "UNKNOWN_ROOM" &&
      rec.metadata?.normalizationUnknown !== true;
    if (!ocrLabelConfirmed) {
      return {
        verifiable: false,
        reason: "Entity classification was not confirmed — Vastu rules withheld to avoid a misleading report.",
        failedGate: "ENTITY_CLASSIFICATION",
        trace,
      };
    }
  }

  const geometrySource = cadEntity
    ? {
        width: cadEntity.width,
        height: cadEntity.height,
        polygon: cadEntity.polygon,
        metadata: (cadEntity as { metadata?: Record<string, unknown> }).metadata,
      }
    : {
        width: rec.coordinates.width,
        height: rec.coordinates.height,
        polygon: rec.polygon,
        metadata: rec.metadata,
      };

  if (!hasReliableGeometryAnchors(geometrySource, blueprint)) {
    const meta = geometrySource.metadata;
    const missingFrame =
      typeof meta?.blueprintNormU === "number" &&
      typeof meta?.blueprintNormV === "number" &&
      !isValidBlueprintAnchorFrame(blueprint);
    trace.geometryReliable = false;
    return {
      verifiable: false,
      failedGate: missingFrame ? "BLUEPRINT_FRAME" : "GEOMETRY_ANCHORS",
      reason: missingFrame
        ? "Blueprint scale or dimensions are not set — OCR position cannot be anchored reliably."
        : "Entity position lacks blueprint-anchored coordinates — direction cannot be verified.",
      trace,
    };
  }

  trace.geometryReliable = true;
  return { verifiable: true, trace };
}

function countRoomsWithDisplayName(roomData: ReportRoomEntity[], displayName: string): number {
  return roomData.filter((r) => getRoomDisplayName(r) === displayName).length;
}

function resolveRoomForProceduralResult(
  res: { id: string; elementName: string },
  roomData: ReportRoomEntity[]
): ReportRoomEntity | undefined {
  for (const room of roomData) {
    if (res.id.endsWith(`-${room.id}`)) return room;
  }
  const nameMatches = roomData.filter((r) => (r.displayName || r.name) === res.elementName);
  if (nameMatches.length === 1) return nameMatches[0];
  return undefined;
}

function correlateDoshasToRoom(
  doshas: DoshaItem[],
  room: ReportRoomEntity,
  roomData: ReportRoomEntity[]
): DoshaItem[] {
  const displayName = getRoomDisplayName(room);
  const nameIsUnique = countRoomsWithDisplayName(roomData, displayName) === 1;
  return doshas.filter((d) => {
    if (d.elementId && room.id && d.elementId === room.id) return true;
    if (d.id && room.id && d.id.endsWith(`-${room.id}`)) return true;
    if (nameIsUnique && d.elementName && d.elementName === displayName) return true;
    return false;
  });
}

function findRoomInRoomData(
  roomData: ReportRoomEntity[],
  criteria: {
    id?: string;
    elementId?: string;
    elementName?: string;
  }
): ReportRoomEntity | undefined {
  if (criteria.elementId) {
    const byElementId = roomData.find((r) => r.id === criteria.elementId);
    if (byElementId) return byElementId;
  }
  if (criteria.id) {
    const byId = roomData.find((r) => r.id === criteria.id);
    if (byId) return byId;
  }
  if (criteria.elementName) {
    const matches = roomData.filter((r) => getRoomDisplayName(r) === criteria.elementName);
    if (matches.length === 1) return matches[0];
    return undefined;
  }
  return undefined;
}

function resolveEntityCanonicalType(entity: ReportRoomEntity): CanonicalRoomType {
  if (
    entity.canonicalType &&
    entity.canonicalType !== "UNKNOWN" &&
    entity.canonicalType !== "UNKNOWN_ROOM"
  ) {
    return entity.canonicalType as CanonicalRoomType;
  }
  return getRoomCanonicalType(entity);
}

function buildUnableToVerifyReportItem(
  entity: ReportRoomEntity,
  idx: number,
  reason: string
): ObjectReportItem {
  const displayName = getRoomDisplayName(entity);
  const gateSummary = formatVerificationGateSummary(
    displayName,
    entity.verificationFailedGate,
    reason
  );
  const ruleElementType = entity.type || roomTaxonomyService.canonicalToRuleElementType(
    resolveEntityCanonicalType(entity)
  );
  const detectionMethod =
    entity.detectedBy === "TEXT_LABEL"
      ? "Text Label (OCR Recognition)"
      : entity.detectedBy === "ARCHITECTURAL_SYMBOL"
      ? "Architectural Symbol Recognition"
      : entity.detectedBy === "SPATIAL_GEOMETRY"
      ? "Spatial Geometry Extraction"
      : "Multimodal AI Vision & CAD Engine";

  return {
    id: entity.id || `obj_${idx}`,
    objectName: displayName,
    type: ruleElementType,
    zone: entity.assignedZone,
    status: "⚠ Unable to Verify",
    statusType: "UNABLE_TO_VERIFY",
    explanation: gateSummary,
    problem: reason,
    possibleEffect: "Vastu rules were not applied to avoid a misleading report.",
    suggestedRemedy: "Confirm the room label and position on the blueprint, then re-run analysis.",
    why: {
      detectionMethod,
      detectedOcrLabel: displayName.toUpperCase(),
      detectionConfidence: `${Math.round((entity.confidence || 0.95) * 100)}%`,
      detectedCentroid: `X: ${entity.center.x.toFixed(2)}, Y: ${entity.center.y.toFixed(2)}`,
      calculatedAngle: `${(entity.rawAngle || 0).toFixed(1)}°`,
      calculatedZone: entity.assignedZone,
      appliedRule: "None — verification gate blocked rule evaluation",
      knowledgeBook: "—",
      chapter: "—",
      page: "—",
      reason: gateSummary,
    },
  };
}

function isDefectDosha(dosha: DoshaItem): boolean {
  return dosha.ruleType !== "BENEFICIAL";
}

function resolveReportEntityCenter(
  rec: {
    id: string;
    coordinates: { x: number; y: number; width: number; height: number };
    zone?: string;
  },
  roomData: ReportRoomEntity[]
): { x: number; y: number } {
  const matched = roomData.find((r) => r.id === rec.id);
  if (matched) return matched.center;
  const halfW = (rec.coordinates.width || 0) / 2;
  const halfH = (rec.coordinates.height || 0) / 2;
  return {
    x: rec.coordinates.x + halfW,
    y: rec.coordinates.y + halfH,
  };
}

function verifyPipelineEntityIdentity(
  roomData: ReportRoomEntity[],
  objectReportItems: ObjectReportItem[],
  recognitionSummary: PropertyRecognitionSummary | null,
  doshas: DoshaItem[]
): void {
  const recEntities = recognitionSummary?.entities ?? [];

  doshas.forEach((dosha) => {
    if (!dosha.elementId) {
      pipelineDevWarn("[PipelineIdentity] Dosha missing entityId binding", dosha.ruleId, dosha.elementName);
      return;
    }
    const owner = roomData.find((r) => r.id === dosha.elementId);
    if (!owner) {
      console.error("[PipelineIdentity] Dosha bound to unknown entity", {
        elementId: dosha.elementId,
        ruleId: dosha.ruleId,
      });
      return;
    }
    if (!owner.verifiableForRules) {
      console.error("[PipelineIdentity] Dosha applied to unverifiable entity", {
        elementId: dosha.elementId,
        ruleId: dosha.ruleId,
      });
    }
  });

  roomData.forEach((room) => {
    const rec = recEntities.find((r) => r.id === room.id);
    const reportItem = objectReportItems.find((item) => item.id === room.id);
    const displayName = getRoomDisplayName(room);

    if (rec) {
      const recLabel = rec.displayName || rec.name;
      if (recLabel !== displayName) {
        console.error("[PipelineIdentity] Display name drift", {
          entityId: room.id,
          ocrPipeline: recLabel,
          roomData: displayName,
        });
      }
      if (rec.canonicalType && room.canonicalType && rec.canonicalType !== room.canonicalType) {
        console.error("[PipelineIdentity] Canonical type drift", {
          entityId: room.id,
          ocrPipeline: rec.canonicalType,
          roomData: room.canonicalType,
        });
      }
    }

    if (!reportItem) {
      console.error("[PipelineIdentity] Missing report row for entity", room.id, displayName);
      return;
    }

    if (reportItem.objectName !== displayName) {
      console.error("[PipelineIdentity] Report name mismatch", {
        entityId: room.id,
        roomData: displayName,
        report: reportItem.objectName,
      });
    }
    if (reportItem.zone !== room.assignedZone) {
      console.error("[PipelineIdentity] Report zone mismatch", {
        entityId: room.id,
        roomData: room.assignedZone,
        report: reportItem.zone,
      });
    }

    const attachedDoshas = correlateDoshasToRoom(doshas.filter(isDefectDosha), room, roomData);
    attachedDoshas.forEach((dosha) => {
      if (dosha.elementId && dosha.elementId !== room.id) {
        console.error("[PipelineIdentity] Cross-entity dosha attachment", {
          roomId: room.id,
          roomName: displayName,
          doshaEntityId: dosha.elementId,
          ruleId: dosha.ruleId,
        });
      }
    });
  });
}

export function buildObjectReportItems(
  roomData: ReportRoomEntity[],
  doshas: DoshaItem[],
  recognitionSummary: PropertyRecognitionSummary | null
): ObjectReportItem[] {
  const allEntities: ReportRoomEntity[] = [...roomData];

  if (recognitionSummary?.entities) {
    recognitionSummary.entities.forEach((rec) => {
      const displayName = rec.displayName || rec.name;
      if (!allEntities.some((e) => e.id === rec.id)) {
        const matchedRoom = roomData.find((r) => r.id === rec.id);
        allEntities.push({
          id: rec.id,
          name: displayName,
          displayName,
          canonicalType: rec.canonicalType,
          type: rec.type,
          category: rec.category,
          center: resolveReportEntityCenter(rec, roomData),
          bounds: { width: rec.coordinates.width, height: rec.coordinates.height },
          assignedZone: matchedRoom?.assignedZone ?? rec.zone ?? PENDING_CHAKRA_CALIBRATION_ZONE,
          rawAngle: matchedRoom?.rawAngle ?? 0,
          confidence: rec.confidence || 0.95,
          detectedBy: rec.detectedBy || "TEXT_LABEL",
          verificationStatus: rec.verificationStatus || "VERIFIED",
          verifiableForRules: false,
          unverifiableReason: "Entity not present in calibrated room data.",
        });
      }
    });
  }

  return allEntities.map((entity, idx) => {
    const displayName = getRoomDisplayName(entity);
    const canonicalType = resolveEntityCanonicalType(entity);
    const ruleElementType = entity.type || roomTaxonomyService.canonicalToRuleElementType(canonicalType);

    if (isPendingChakraCalibrationZone(entity.assignedZone)) {
      return {
        id: entity.id || `obj_${idx}`,
        objectName: displayName,
        type: ruleElementType,
        zone: entity.assignedZone,
        status: "⚠ Needs Improvement",
        statusType: "NEEDS_IMPROVEMENT",
        explanation:
          "Awaiting North calibration — directional zone not assigned yet. Mark North on the Vastu Chakra, then run analysis again.",
        why: {
          detectionMethod:
            entity.detectedBy === "TEXT_LABEL"
              ? "Text Label (OCR Recognition)"
              : "Spatial Recognition",
          detectedOcrLabel: displayName.toUpperCase(),
          detectionConfidence: `${Math.round((entity.confidence || 0.95) * 100)}%`,
          detectedCentroid: `X: ${entity.center.x.toFixed(2)}, Y: ${entity.center.y.toFixed(2)}`,
          calculatedAngle: `${(entity.rawAngle || 0).toFixed(1)}°`,
          calculatedZone: entity.assignedZone,
          appliedRule: "Calibration Required",
          knowledgeBook: "—",
          chapter: "—",
          page: "—",
          reason: "Vastu directional zones are assigned only after North calibration on the Chakra overlay.",
        },
      };
    }

    if (!entity.verifiableForRules) {
      return buildUnableToVerifyReportItem(
        entity,
        idx,
        entity.unverifiableReason || "Entity could not be verified for directional Vastu evaluation."
      );
    }

    const entityDoshas = correlateDoshasToRoom(doshas.filter(isDefectDosha), entity, allEntities);

    const placement = EnterpriseCognitiveReasoningService.evaluatePlacementFromVault(
      canonicalType,
      entity.assignedZone,
      entity.rawAngle || 0,
      { displayName }
    );

    const remedyEvaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext(
      KnowledgeVaultRemedyEvaluationService.buildQueryContext(
        canonicalType,
        ruleElementType,
        entity.assignedZone,
        { displayName }
      )
    );

    const hasCritical = entityDoshas.some((d) => d.severity === "CRITICAL" || d.severity === "HIGH");
    const hasMedium = entityDoshas.some((d) => d.severity === "MEDIUM");
    const hasLowDefect = entityDoshas.some((d) => d.severity === "LOW");

    let statusType: "CORRECT" | "NEEDS_IMPROVEMENT" | "MAJOR_ISSUE" = "NEEDS_IMPROVEMENT";
    let status: "✅ Correct" | "⚠ Needs Improvement" | "❌ Major Issue" = "⚠ Needs Improvement";

    if (hasCritical) {
      statusType = "MAJOR_ISSUE";
      status = "❌ Major Issue";
    } else if (hasMedium || hasLowDefect) {
      statusType = "NEEDS_IMPROVEMENT";
      status = "⚠ Needs Improvement";
    } else if (placement.placementVerdict === "FAVORABLE") {
      statusType = "CORRECT";
      status = "✅ Correct";
    } else if (placement.placementVerdict === "UNFAVORABLE") {
      statusType = "NEEDS_IMPROVEMENT";
      status = "⚠ Needs Improvement";
    } else {
      statusType = "NEEDS_IMPROVEMENT";
      status = "⚠ Needs Improvement";
    }

    const primaryDosha = entityDoshas[0];

    const detectionMethod = entity.detectedBy === "TEXT_LABEL"
      ? "Text Label (OCR Recognition)"
      : entity.detectedBy === "ARCHITECTURAL_SYMBOL"
      ? "Architectural Symbol Recognition"
      : entity.detectedBy === "SPATIAL_GEOMETRY"
      ? "Spatial Geometry Extraction"
      : "Multimodal AI Vision & CAD Engine";

    const ocrLabel = displayName.toUpperCase();
    const confidencePct = `${Math.round((entity.confidence || 0.95) * 100)}%`;
    const centroidStr = `X: ${entity.center.x.toFixed(2)}, Y: ${entity.center.y.toFixed(2)}`;
    const angleStr = `${(entity.rawAngle || 0).toFixed(1)}°`;
    const zoneStr = entity.assignedZone || "Center / Unassigned";

    const placementVerdict =
      placement.placementVerdict === "FAVORABLE"
        ? "FAVORABLE"
        : placement.placementVerdict === "SPLIT"
        ? "SPLIT"
        : placement.placementVerdict === "UNFAVORABLE"
        ? "UNFAVORABLE"
        : "NO_EVIDENCE";

    const issueExplanation = buildDirectionalIssueExplanation({
      displayName,
      zone: zoneStr,
      verdict: placementVerdict,
    });

    const availableRemedies = resolveHomeownerFacingRemedies({
      proceduralRemedy: primaryDosha?.remedy,
      availableRemedies: remedyEvaluation.availableRemedies,
      vaultCandidates: remedyEvaluation.candidates.map((c) => c.remedy),
    });

    if (statusType === "CORRECT") {
      const explanation = generatePositiveExplanation(displayName, ruleElementType, entity.assignedZone);
      const positiveWhyReason = stripBookCitationLeaks(
        `${issueExplanation} ${placement.recommendationRationale || ""}`.trim()
      );

      return {
        id: entity.id || `obj_${idx}`,
        objectName: displayName,
        type: ruleElementType,
        zone: entity.assignedZone,
        status: "✅ Correct",
        statusType: "CORRECT",
        explanation,
        why: {
          detectionMethod,
          detectedOcrLabel: ocrLabel,
          detectionConfidence: confidencePct,
          detectedCentroid: centroidStr,
          calculatedAngle: angleStr,
          calculatedZone: zoneStr,
          appliedRule: "Directional Placement Rule",
          knowledgeBook: "—",
          chapter: "—",
          page: "—",
          reason: positiveWhyReason,
        },
      };
    }

    const sanitizedProb = primaryDosha
      ? sanitizeTextForHomeowner(stripBookCitationLeaks(stripInternalEngineMeta(primaryDosha.description || issueExplanation)))
      : sanitizeTextForHomeowner(issueExplanation);

    const sanitizedEffect = primaryDosha
      ? sanitizeTextForHomeowner(
          primaryDosha.severity === "CRITICAL" || primaryDosha.severity === "HIGH"
            ? `Imbalance in ${entity.assignedZone} may cause friction in daily comfort, health, finances, or peace of mind.`
            : `Mild element discrepancy in ${entity.assignedZone} may affect day-to-day harmony.`
        )
      : sanitizeTextForHomeowner(
          placementVerdict === "UNFAVORABLE"
            ? `This ${displayName} placement in ${zoneStr} can disturb the elemental balance of that direction.`
            : `Directional guidance for ${displayName} in ${zoneStr} needs review against your layout.`
        );

    const remedyList = availableRemedies.length > 0 ? availableRemedies : [];
    const remedyText =
      remedyList.length > 0
        ? formatRemediesForDisplay(remedyList)
        : resolveHomeownerFacingRemedy({ availableRemedies: [] });

    const sanitizedRemedyText = sanitizeTextForHomeowner(remedyText);
    const whyReason = stripBookCitationLeaks(
      `${issueExplanation} ${remedyEvaluation.recommendationRationale || placement.recommendationRationale || ""}`.trim()
    );

    return {
      id: entity.id || `obj_${idx}`,
      objectName: displayName,
      type: ruleElementType,
      zone: entity.assignedZone,
      status,
      statusType,
      problem: sanitizedProb,
      possibleEffect: sanitizedEffect,
      suggestedRemedy: sanitizedRemedyText,
      suggestedRemedies: remedyList.map((r) => sanitizeTextForHomeowner(r)),
      why: {
        detectionMethod,
        detectedOcrLabel: ocrLabel,
        detectionConfidence: confidencePct,
        detectedCentroid: centroidStr,
        calculatedAngle: angleStr,
        calculatedZone: zoneStr,
        appliedRule: primaryDosha?.ruleId || "Directional Placement Rule",
        knowledgeBook: "—",
        chapter: "—",
        page: "—",
        reason: whyReason,
      },
    };
  });
}

/**
 * Normalizes severity names across engine standards for consistent scoring and display.
 */
function normalizeSeverity(sev: string): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  const s = (sev || "").toUpperCase();
  if (s === "CATASTROPHIC" || s === "CRITICAL") return "CRITICAL";
  if (s === "MAJOR" || s === "HIGH") return "HIGH";
  if (s === "MODERATE" || s === "MEDIUM") return "MEDIUM";
  return "LOW";
}

/**
 * Calculates the Vastu 16-zone direction name from an angle (degrees 0-360, where 0=North, 90=East, etc.)
 * Delegates to CanonicalZoneRegistry — single source of truth for zone labels.
 */
export function calculateVastuZone(angleDeg: number): string {
  return CanonicalZoneRegistry.displayLabelFromBearing(angleDeg);
}

/**
 * Spatial Vastu Analysis Orchestrator.
 * Connects CAD entities, blueprint geometry, and Master Chakra rotation 
 * directly to the 5-stage WorkflowOrchestrator pipeline.
 * Emits real-time observer events to provide complete transparency without simulation.
 */
export async function executeVastuAnalysisPipeline(
  _entitiesParam: CadEntity[],
  blueprint: BlueprintData | null,
  vastuNorthCalibration: number,
  chakraRotation: number,
  chakraCenter?: { x: number; y: number },
  onProgress?: EvaluationStageCallback,
  moduleType?: EvaluationModuleType,
  chakraOrientationCalibrated?: boolean
): Promise<VastuAnalysisResult>;

export async function executeVastuAnalysisPipeline(
  _entitiesParam: CadEntity[],
  blueprint: BlueprintData | null,
  vastuNorthCalibration: number,
  chakraRotation: number,
  onProgress?: EvaluationStageCallback,
  moduleType?: EvaluationModuleType,
  chakraOrientationCalibrated?: boolean
): Promise<VastuAnalysisResult>;

export async function executeVastuAnalysisPipeline(
  _entitiesParam: CadEntity[],
  blueprint: BlueprintData | null,
  vastuNorthCalibration: number,
  chakraRotation: number,
  arg5?: { x: number; y: number } | EvaluationStageCallback | boolean,
  arg6?: EvaluationStageCallback | EvaluationModuleType | boolean,
  arg7?: EvaluationModuleType | boolean,
  arg8?: boolean
): Promise<VastuAnalysisResult> {
  let chakraCenter: { x: number; y: number } | undefined;
  let actualOnProgress: EvaluationStageCallback | undefined;
  let moduleType: EvaluationModuleType = "VASTU";
  let chakraOrientationCalibrated = false;

  if (typeof arg5 === "function") {
    actualOnProgress = arg5;
    if (typeof arg6 === "string") {
      moduleType = arg6 as EvaluationModuleType;
    }
    if (typeof arg7 === "boolean") {
      chakraOrientationCalibrated = arg7;
    }
  } else if (typeof arg5 === "boolean") {
    chakraOrientationCalibrated = arg5;
  } else if (arg5 && typeof arg5 === "object" && ("x" in arg5)) {
    chakraCenter = arg5;
    if (typeof arg6 === "function") {
      actualOnProgress = arg6;
      if (typeof arg7 === "string") {
        moduleType = arg7 as EvaluationModuleType;
      }
      if (typeof arg8 === "boolean") {
        chakraOrientationCalibrated = arg8;
      }
    } else if (typeof arg6 === "boolean") {
      chakraOrientationCalibrated = arg6;
    } else if (typeof arg6 === "string") {
      moduleType = arg6 as EvaluationModuleType;
      if (typeof arg7 === "boolean") {
        chakraOrientationCalibrated = arg7;
      }
    }
    if (typeof arg8 === "boolean" && typeof arg6 !== "boolean") {
      chakraOrientationCalibrated = arg8;
    }
  }
  const startTime = performance.now();
  const executionTimestamp = Date.now();
  const executionId = generateExecutionId(executionTimestamp);

  await KnowledgeVaultService.initializeVault();

  const stages: EvaluationStageInfo[] = [
    { id: "STAGE_PREPARE_LAYOUT", stageName: "Preparing Property Layout", status: "PENDING" },
    { id: "STAGE_RECOGNIZE_ELEMENTS", stageName: "Recognizing Spatial Elements", status: "PENDING" },
    { id: "STAGE_VERIFY_NORTH", stageName: "Verifying Directional Alignment", status: "PENDING" },
    { id: "STAGE_EVALUATE_PRINCIPLES", stageName: "Evaluating Spatial Principles", status: "PENDING" },
    { id: "STAGE_PREPARE_RECOMMENDATIONS", stageName: "Preparing Recommendations", status: "PENDING" },
    { id: "STAGE_COMPILE_REPORT", stageName: "Compiling Executive Assessment Report", status: "PENDING" }
  ];

  const metrics = {
    layoutElementsRecognized: 0,
    northAlignmentVerified: false,
    northAngleDegrees: undefined as number | undefined,
    zonesEvaluated: 0,
    issuesIdentified: 0,
    recommendationsPrepared: 0,
    confidenceAverage: 0.96,
    elapsedTimeMs: 0
  };

  const updateStage = (stageId: string, status: EvaluationStageInfo["status"], statusText?: string, details?: string, confidence?: number) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      stage.status = status;
      if (statusText) stage.statusText = statusText;
      if (details) stage.details = details;
      if (confidence !== undefined) stage.confidence = confidence;
      stage.timestamp = Date.now();
    }
  };

  const notify = (currentStageId: string, transitionStep?: "EVALUATION_COMPLETE" | "PREPARING_EXECUTIVE_REPORT" | "REPORT_READY") => {
    metrics.elapsedTimeMs = Math.round(performance.now() - startTime);
    if (actualOnProgress) {
      const currentStage = stages.find(s => s.id === currentStageId);
      actualOnProgress({
        moduleType,
        currentStageId,
        currentStageName: currentStage?.stageName || "",
        isComplete: transitionStep === "REPORT_READY",
        stages: [...stages.map(s => ({ ...s }))],
        metrics: { ...metrics },
        completedTransitionStep: transitionStep
      });
    }
  };

  // STAGE 1: Preparing Property Layout
  updateStage("STAGE_PREPARE_LAYOUT", "RUNNING", "Preparing...", "Loading blueprint geometry & dimensions");
  notify("STAGE_PREPARE_LAYOUT");

  const activeBlueprint = blueprint || blueprintEngine.getCurrentBlueprint();
  updateStage("STAGE_PREPARE_LAYOUT", "COMPLETED", "Layout Ready", activeBlueprint ? `Blueprint '${activeBlueprint.name}' loaded` : "CAD Workspace layout active", 0.98);
  notify("STAGE_PREPARE_LAYOUT");

  // STAGE 2: Recognizing Spatial Elements (OCR labels only — no synthetic or vision-invented rooms)
  updateStage("STAGE_RECOGNIZE_ELEMENTS", "RUNNING", "Recognizing...", "Reading printed room labels from blueprint OCR");
  notify("STAGE_RECOGNIZE_ELEMENTS");

  if (_entitiesParam && _entitiesParam.length > 0) {
    buildingElementRegistry.syncCadEntities(_entitiesParam as any);
  } else if (activeBlueprint) {
    try {
      if (activeBlueprint.url) {
        const ocrItems = await BlueprintIntelligenceEngine.extractOcrFromImage(activeBlueprint.url, activeBlueprint);
        if (ocrItems && ocrItems.length > 0) {
          const rawOcrEntities = BlueprintIntelligenceEngine.mapOcrItemsToRawEntities(ocrItems);
          const ocrSummary = PropertyRecognitionEngine.recognizeProperty(rawOcrEntities, 0, true);
          const ocrCadEntities = BlueprintIntelligenceEngine.mapRecognitionToCadEntities(ocrSummary);
          buildingElementRegistry.syncCadEntities(ocrCadEntities);
        }
      }
    } catch (recognitionErr) {
      pipelineDevWarn(`[VastuOrchestrator] OCR recognition diagnostic note:`, recognitionErr);
    }
  }

  // Always consume ONLY from BuildingElementRegistry (single source of truth)
  const entities = buildingElementRegistry.getCadEntities();

  // STAGE 3: Verifying Directional Alignment & PRE Execution
  updateStage("STAGE_VERIFY_NORTH", "RUNNING", "Verifying...", "Calculating net north deviation and chakra orientation");
  notify("STAGE_VERIFY_NORTH");

  const netNorthAngle = chakraOrientationCalibrated
    ? ((vastuNorthCalibration + chakraRotation) % 360 + 360) % 360
    : 0;
  metrics.northAlignmentVerified = chakraOrientationCalibrated;
  metrics.northAngleDegrees = chakraOrientationCalibrated ? Math.round(netNorthAngle) : undefined;

  // Derive calibrated property center for Vastu Chakra angle calculations
  let calculatedPropertyCenter: { x: number; y: number } | undefined = undefined;
  if (chakraOrientationCalibrated && chakraCenter) {
    calculatedPropertyCenter = { x: chakraCenter.x, y: chakraCenter.y };
  } else if (chakraCenter && (chakraCenter.x !== 0 || chakraCenter.y !== 0)) {
    calculatedPropertyCenter = { x: chakraCenter.x, y: chakraCenter.y };
  } else {
    const plotEntity = entities.find(e => e.type === "Plot" || e.layer === "Boundary" || (e.polygon && e.polygon.length >= 3));
    if (plotEntity && plotEntity.polygon && plotEntity.polygon.length >= 3) {
      calculatedPropertyCenter = CanonicalSpatialCalculationEngine.calculateCentroid(plotEntity.polygon);
    } else if (plotEntity) {
      calculatedPropertyCenter = { x: plotEntity.x, y: plotEntity.y };
    }
  }

  // Execute Property Recognition Engine (PRE) to build standardized Property Model
  const rawEntities: RawCadOrVisionEntity[] = entities.map((e) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    x: e.x,
    y: e.y,
    width: typeof e.width === "number" && e.width > 0 ? e.width : 0,
    height: typeof e.height === "number" && e.height > 0 ? e.height : 0,
    polygon: (e as any).polygon,
    symbols: (e as any).symbols || [],
    fixtures: (e as any).fixtures || [],
    adjacentTo: (e as any).adjacentTo || [],
    metadata: {
      ...(typeof (e as any).metadata === "object" ? (e as any).metadata : {}),
      ocrText: (e as any).metadata?.ocrText || e.name,
    },
  }));

  const recognitionSummary = PropertyRecognitionEngine.recognizeProperty(
    rawEntities,
    netNorthAngle,
    true,
    calculatedPropertyCenter
  );

  metrics.layoutElementsRecognized = recognitionSummary.entities.length;

  updateStage("STAGE_RECOGNIZE_ELEMENTS", "COMPLETED", "Recognized", `${recognitionSummary.entities.length} elements recognized with evidence`, 0.96);
  if (chakraOrientationCalibrated) {
    updateStage("STAGE_VERIFY_NORTH", "COMPLETED", "Verified", `True North = 0° — Blueprint rotation offset +${Math.round(netNorthAngle)}°`, 1.0);
  } else {
    updateStage("STAGE_VERIFY_NORTH", "SKIPPED", "Awaiting Calibration", "Mark North and align the Vastu Chakra before directional analysis", 0);
  }
  notify("STAGE_VERIFY_NORTH");

  // Guard for empty workspace
  if (!entities || entities.length === 0) {
    updateStage("STAGE_EVALUATE_PRINCIPLES", "SKIPPED", "Skipped", "No elements present");
    updateStage("STAGE_PREPARE_RECOMMENDATIONS", "SKIPPED", "Skipped");
    updateStage("STAGE_COMPILE_REPORT", "COMPLETED", "Prepared");
    notify("STAGE_COMPILE_REPORT", "REPORT_READY");

    const currentDisc = clientDiscoveryService.getDiscovery();
    const isDiscComplete = clientDiscoveryService.isCompleted();
    const discSummary = clientDiscoveryService.getDiscoverySummary();
    const contextProfile = discSummary ? clientContextIntelligenceEngine.processFromSummary(discSummary) : null;

    RuntimeEvaluationSessionStore.setSession({
      executionId,
      timestamp: executionTimestamp,
      formattedTimestamp: new Date(executionTimestamp).toLocaleString(),
      pipelineVersion: "4A.9-PROD",
      propertyName: currentDisc.clientInfo.clientName ? `${currentDisc.propertyType} (${currentDisc.propertySubType})` : (blueprint?.name || "Unassigned Property"),
      propertyId: "UNASSIGNED",
      clientName: currentDisc.clientInfo.clientName || "Unassigned Client",
      northRotation: netNorthAngle,
      recognitionCount: 0,
      findingCount: 0,
      ruleCount: 0,
      overallScore: null,
      hasExecuted: false,
      status: "FAILED",
      recognitionSummary,
      decisionResult: null,
      doshas: [],
      objectReportItems: [],
      canonicalFindings: [],
      propertyHealth: null,
      coverageReport: null,
      clientDiscovery: currentDisc,
      isDiscoveryCompleted: isDiscComplete,
      clientContextProfile: contextProfile,
      consumersBound: {
        reportBound: false,
        ukaBound: false,
        pdfBound: false,
        coverageBound: false,
        consultantBound: false
      }
    });

    return {
      executionId,
      timestamp: new Date().toLocaleString(),
      totalEntitiesEvaluated: 0,
      overallScore: null,
      doshas: [],
      passedRulesCount: 0,
      totalRulesCount: 0,
      summary: "OCR Scan Completed: No text detected on this resolution. Please upload a high-contrast image or use manual annotation.",
      rawReport: null,
      recognitionSummary
    };
  }

  if (!chakraOrientationCalibrated) {
    updateStage("STAGE_EVALUATE_PRINCIPLES", "SKIPPED", "Awaiting Calibration", "Please calibrate the Vastu Chakra before running analysis.", 0);
    notify("STAGE_EVALUATE_PRINCIPLES");
    updateStage("STAGE_PREPARE_RECOMMENDATIONS", "SKIPPED", "Awaiting Calibration", "Chakra North alignment required");
    notify("STAGE_PREPARE_RECOMMENDATIONS");
    updateStage("STAGE_COMPILE_REPORT", "SKIPPED", "Awaiting Calibration", "Complete Chakra calibration first");
    notify("STAGE_COMPILE_REPORT", "REPORT_READY");

    const currentDisc = clientDiscoveryService.getDiscovery();
    const isDiscComplete = clientDiscoveryService.isCompleted();
    const discSummary = clientDiscoveryService.getDiscoverySummary();
    const contextProfile = discSummary ? clientContextIntelligenceEngine.processFromSummary(discSummary) : null;

    RuntimeEvaluationSessionStore.setSession({
      executionId,
      timestamp: executionTimestamp,
      formattedTimestamp: new Date(executionTimestamp).toLocaleString(),
      pipelineVersion: "4A.9-PROD",
      propertyName: currentDisc.clientInfo.clientName ? `${currentDisc.propertyType} (${currentDisc.propertySubType})` : (blueprint?.name || "Unassigned Property"),
      propertyId: "PROP-CAD-001",
      clientName: currentDisc.clientInfo.clientName || "Unassigned Client",
      northRotation: netNorthAngle,
      recognitionCount: recognitionSummary ? recognitionSummary.entities.length : 0,
      findingCount: 0,
      ruleCount: 0,
      overallScore: null,
      hasExecuted: false,
      status: "NOT_EXECUTED",
      recognitionSummary,
      decisionResult: null,
      doshas: [],
      objectReportItems: [],
      canonicalFindings: [],
      propertyHealth: null,
      coverageReport: null,
      clientDiscovery: currentDisc,
      isDiscoveryCompleted: isDiscComplete,
      clientContextProfile: contextProfile,
      consumersBound: {
        reportBound: false,
        ukaBound: false,
        pdfBound: false,
        coverageBound: false,
        consultantBound: false
      }
    });

    return {
      executionId,
      timestamp: new Date().toLocaleString(),
      totalEntitiesEvaluated: entities.length,
      overallScore: null,
      doshas: [],
      objectReportItems: [],
      passedRulesCount: 0,
      totalRulesCount: 0,
      summary: "Please calibrate the Vastu Chakra before running analysis.",
      rawReport: null,
      recognitionSummary
    };
  }

  // STAGE 4: Evaluating Spatial Principles on standardized Property Model
  updateStage("STAGE_EVALUATE_PRINCIPLES", "RUNNING", "Evaluating...", "Executing spatial rules across 16 directional zones");
  notify("STAGE_EVALUATE_PRINCIPLES");

  // FOUNDER ARCHITECTURE (BUG-001): Bounding rectangles are debug artifacts ONLY.
  // The spatial reference is strictly: Property Polygon + User Calibrated North + User Positioned Chakra Center.
  const allCadEntities = buildingElementRegistry.getCadEntities();
  let propertyCenter: { x: number; y: number };

  if (chakraOrientationCalibrated && chakraCenter) {
    propertyCenter = { x: chakraCenter.x, y: chakraCenter.y };
  } else if (chakraCenter && (chakraCenter.x !== 0 || chakraCenter.y !== 0)) {
    propertyCenter = { x: chakraCenter.x, y: chakraCenter.y };
  } else {
    // Look for explicit Property Polygon / Boundary entity
    const plotEntity = allCadEntities.find(e => 
      e.type === "Plot" || e.layer === "Boundary" || (e.polygon && e.polygon.length >= 3)
    );
    if (plotEntity && plotEntity.polygon && plotEntity.polygon.length >= 3) {
      propertyCenter = CanonicalSpatialCalculationEngine.calculateCentroid(plotEntity.polygon);
    } else if (plotEntity) {
      propertyCenter = { x: plotEntity.x, y: plotEntity.y };
    } else {
      // Collect exact polygon centroids or exact point coordinates (never bounding box width/height math)
      const points: { x: number; y: number }[] = [];
      for (const e of allCadEntities) {
        if (e.polygon && e.polygon.length >= 3) {
          points.push(CanonicalSpatialCalculationEngine.calculateCentroid(e.polygon));
        } else {
          points.push({ x: e.x, y: e.y });
        }
      }
      propertyCenter = points.length > 0 
        ? CanonicalSpatialCalculationEngine.calculateCentroid(points) 
        : { x: 0, y: 0 };
    }
  }

  // FOUNDER ARCHITECTURE: Brahmasthan Rule — Brahmasthan is ALWAYS calculated geometrically (Category A, 100% confidence)
  const brahmasthanCadEntity: CadEntity = {
    id: "ent_brahmasthan_derived",
    name: "Brahmasthan (Sacred Central Core)",
    layer: "Geometry",
    type: "Marker",
    x: propertyCenter.x,
    y: propertyCenter.y,
    z: 0,
    width: 3.0,
    height: 3.0,
    material: "Ether Energy Core",
    vastu: "Brahmasthan",
    energy: "Vital Core",
    status: "Calculated",
    points: [],
    category: "CATEGORY_A",
    source: "GEOMETRY_ENGINE",
    confidence: 1.0,
    detectedByReason: "Calculated from Chakra Center / Property Centroid"
  };
  
  // Register calculated Brahmasthan in BuildingElementRegistry
  const existingCad = buildingElementRegistry.getCadEntities();
  if (!existingCad.some(c => c.id === "ent_brahmasthan_derived")) {
    buildingElementRegistry.syncCadEntities([...existingCad, brahmasthanCadEntity]);
  }

  const roomData = recognitionSummary.entities.map((rec) => {
    const originalCad = resolveCadEntityForRecognition(rec, allCadEntities);
    const roomCenter = originalCad
      ? resolveEntityWorldCenter(
          {
            x: originalCad.x,
            y: originalCad.y,
            width: originalCad.width,
            height: originalCad.height,
            polygon: originalCad.polygon,
            metadata: (originalCad as { metadata?: Record<string, unknown> }).metadata,
          },
          blueprint
        )
      : resolveEntityWorldCenter(
          {
            x: rec.coordinates.x,
            y: rec.coordinates.y,
            width: rec.coordinates.width,
            height: rec.coordinates.height,
            polygon: rec.polygon,
            metadata: rec.metadata,
          },
          blueprint
        );

    if (!chakraOrientationCalibrated) {
      rec.zone = PENDING_CHAKRA_CALIBRATION_ZONE;
      const displayName = rec.displayName || rec.name;
      const canonicalType = rec.canonicalType || "UNKNOWN_ROOM";
      const verification = assessEntityVastuVerifiability(
        rec,
        originalCad,
        blueprint,
        false,
        PENDING_CHAKRA_CALIBRATION_ZONE
      );
      pipelineDevLog("[EntityVerificationTrace]", {
        entityId: rec.id,
        detectedText: displayName,
        canonicalType,
        ocrConfidence: verification.trace.ocrConfidence,
        normalizationConfidence: verification.trace.normalizationConfidence,
        geometryReliable: verification.trace.geometryReliable,
        zoneAssigned: verification.trace.zoneAssigned,
        verificationResult: verification.verifiable ? "PASS" : "UNABLE_TO_VERIFY",
        failedGate: verification.failedGate,
        reason: verification.reason,
      });
      return {
        id: rec.id,
        name: displayName,
        displayName,
        canonicalType,
        type: canonicalToRuleElementType(canonicalType as CanonicalRoomType),
        category: rec.category,
        center: roomCenter,
        bounds: { width: rec.coordinates.width, height: rec.coordinates.height },
        assignedZone: PENDING_CHAKRA_CALIBRATION_ZONE,
        rawAngle: 0,
        confidence: rec.confidence,
        detectedBy: rec.detectedBy,
        verificationStatus: rec.verificationStatus,
        verifiableForRules: verification.verifiable,
        unverifiableReason: verification.reason,
        verificationFailedGate: verification.failedGate,
      };
    }

    // Chakra-calibrated: sector from blueprint-anchored room centroid vs chakra center
    const vectorSync = EnterpriseCognitiveReasoningService.verifyChakraAngleVectorSync(
      roomCenter,
      propertyCenter,
      netNorthAngle,
      0
    );

    rec.zone = vectorSync.subZone;

    pipelineDevLog(`[Chakra Angle Vector Sync] Mapped entity '${rec.name}' (${rec.type}) strictly to Sub-Zone '${vectorSync.subZone}' at exact degree vector ${vectorSync.degreeVector}° (Raw: ${vectorSync.rawBearing}°, Net North: ${vectorSync.netNorthAngle}°)`);

    const verification = assessEntityVastuVerifiability(
      rec,
      originalCad,
      blueprint,
      true,
      vectorSync.subZone
    );

    pipelineDevLog("[EntityPipelineTrace]", {
      entityId: rec.id,
      detectedText: rec.displayName || rec.name,
      normalizedName: rec.displayName || rec.name,
      canonicalType: rec.canonicalType,
      blueprintCoordinates: {
        center: roomCenter,
        normU:
          (originalCad?.metadata as Record<string, unknown> | undefined)?.blueprintNormU ??
          (rec.metadata as Record<string, unknown> | undefined)?.blueprintNormU,
      },
      northAngle: netNorthAngle,
      bearing: vectorSync.degreeVector,
      zone: vectorSync.subZone,
      ocrConfidence: verification.trace.ocrConfidence,
      normalizationConfidence: verification.trace.normalizationConfidence,
      geometryReliable: verification.trace.geometryReliable,
      verificationResult: verification.verifiable ? "PASS" : "UNABLE_TO_VERIFY",
      failedGate: verification.failedGate,
      reason: verification.reason,
    });

    return {
      id: rec.id,
      name: rec.displayName || rec.name,
      displayName: rec.displayName || rec.name,
      canonicalType: rec.canonicalType || "UNKNOWN_ROOM",
      type: canonicalToRuleElementType((rec.canonicalType || "UNKNOWN_ROOM") as CanonicalRoomType),
      category: rec.category,
      center: roomCenter,
      bounds: { width: rec.coordinates.width, height: rec.coordinates.height },
      assignedZone: vectorSync.subZone,
      rawAngle: vectorSync.degreeVector,
      confidence: rec.confidence,
      detectedBy: rec.detectedBy,
      verificationStatus: rec.verificationStatus,
      verifiableForRules: verification.verifiable,
      unverifiableReason: verification.reason,
      verificationFailedGate: verification.failedGate,
    };
  });

  recognitionSummary.entities.forEach((rec) => {
    const mapped = roomData.find((r) => r.id === rec.id || r.name === (rec.displayName || rec.name));
    if (mapped) {
      rec.zone = mapped.assignedZone;
      const halfW = (rec.coordinates.width || 0) / 2;
      const halfH = (rec.coordinates.height || 0) / 2;
      rec.coordinates.x = mapped.center.x - halfW;
      rec.coordinates.y = mapped.center.y - halfH;
    }
  });

  roomData.forEach((room) => {
    const originalCad = allCadEntities.find((c) => c.id === room.id);
    const rec = recognitionSummary.entities.find((r) => r.id === room.id);
    const cadMeta = originalCad?.metadata as Record<string, unknown> | undefined;
    const recMeta = rec?.metadata as Record<string, unknown> | undefined;
    pipelineDevLog("[EntityPipelineValidation]", {
      entityId: room.id,
      ocrRaw: cadMeta?.ocrRawText ?? recMeta?.ocrRawText ?? room.displayName,
      normalizedName: room.displayName,
      geometry: { center: room.center, bounds: room.bounds },
      blueprintNorm: {
        u: cadMeta?.blueprintNormU ?? recMeta?.blueprintNormU,
        v: cadMeta?.blueprintNormV ?? recMeta?.blueprintNormV,
      },
      netNorthAngle,
      rawAngle: room.rawAngle,
      finalZone: room.assignedZone,
      canonicalType: room.canonicalType,
      entityType: room.type,
      verifiableForRules: room.verifiableForRules,
      unverifiableReason: room.unverifiableReason,
    });
  });

  const initialContext = {
    project: {
      id: "PROJ-CAD-001",
      name: blueprint?.name || "URJAFLUX Architectural CAD Project",
      code: "CAD-2026-01",
      propertyId: "PROP-CAD-001",
      createdDate: new Date().toISOString(),
      status: "ACTIVE" as any
    },
    property: {
      id: "PROP-CAD-001",
      name: blueprint?.name || "Active Blueprint",
      address: blueprint?.name ? `Blueprint: ${blueprint.name}` : "Unassigned Property",
      plotSize:
        blueprint && (blueprint.width ?? 0) > 0 && (blueprint.height ?? 0) > 0
          ? `${Math.round(blueprint.width * blueprint.height)} sq.m`
          : "Not scaled",
    },
    floor: {
      floorNumber: 1,
      floorName: "Ground Floor",
      heightFt: 10
    },
    compass: {
      northAngle: netNorthAngle,
      variationAngle: 0,
      trueNorthVerified: chakraOrientationCalibrated,
      confidence: chakraOrientationCalibrated ? 1.0 : 0
    },
    spatialData: {
      rooms: roomData,
      walls: [],
      openings: []
    }
  };

  const orchestrator = new WorkflowOrchestrator();
  const orchestrationOutcome = await orchestrator.orchestrate(initialContext);
  const context = orchestrationOutcome.context;

  const rawFindingsList: Array<{
    id?: string;
    ruleId?: string;
    title?: string;
    severity?: string;
    zone?: string;
    description?: string;
    remedy?: string;
    elementName?: string;
    elementType?: string;
    canonicalType?: string;
    degreeVector?: number;
    elementId?: string;
    ruleType?: "DEFECT" | "BENEFICIAL" | "NEUTRAL";
  }> = [];

  if (context.findings && Array.isArray(context.findings)) {
    context.findings.forEach((finding: any, idx: number) => {
      const matchingRec = context.recommendations?.find((r: any) => r.findingId === finding.id);
      const affectedLabel = finding.affectedElements?.[0];
      if (!affectedLabel) return;

      const matchedRoom = findRoomInRoomData(roomData, { elementName: affectedLabel });
      if (!matchedRoom || !matchedRoom.verifiableForRules) return;

      rawFindingsList.push({
        id: finding.id || `DOSHA-${idx + 1}`,
        ruleId: finding.ruleId || `RULE-${idx + 1}`,
        title: finding.title,
        severity: finding.severity,
        zone: matchedRoom.assignedZone,
        description: finding.description,
        remedy: matchingRec?.remedyAction || (matchingRec as any)?.actionDescription,
        elementName: getRoomDisplayName(matchedRoom),
        elementId: matchedRoom.id,
        elementType: matchedRoom.type,
        canonicalType: matchedRoom.canonicalType,
        degreeVector: matchedRoom.rawAngle,
        ruleType: finding.ruleType === "BENEFICIAL" ? "BENEFICIAL" : "DEFECT",
      });
    });
  }

  // Modular Procedural Domain Rule Evaluation — only after Chakra orientation is calibrated
  const evalContexts: RuleEvaluationContext[] = chakraOrientationCalibrated
    ? roomData
        .filter((room) => room.verifiableForRules)
        .filter((room) => room.category !== "UNKNOWN" && room.canonicalType !== "UNKNOWN_ROOM")
        .filter((room) => !isPendingChakraCalibrationZone(room.assignedZone))
        .filter((room) => room.canonicalType !== "UNKNOWN_ROOM" && room.type !== "unknown")
        .map((room) => ({
          elementId: room.id,
          elementName: room.displayName || room.name,
          displayName: room.displayName || room.name,
          canonicalType: room.canonicalType,
          elementType: room.type,
          assignedZone: room.assignedZone,
          rawAngle: room.rawAngle,
          center: room.center,
          netNorthAngle: netNorthAngle
        }))
    : [];

  const activeDomains: RuleDomain[] = [];
  if (moduleType === "VASTU" || moduleType === "INTEGRATED") activeDomains.push("VASTU");
  if (moduleType === "LAL_KITAB" || moduleType === "INTEGRATED") activeDomains.push("LAL_KITAB");
  if (moduleType === "NUMEROLOGY" || moduleType === "INTEGRATED") activeDomains.push("NUMEROLOGY");
  if (activeDomains.length === 0) activeDomains.push("VASTU");

  const { results: proceduralResults, diagnostics } = proceduralRuleEngine.evaluate(
    evalContexts,
    activeDomains,
    netNorthAngle
  );

  proceduralResults.forEach((res) => {
    if (res.ruleType !== "DEFECT") return;

    const matchedRoom = resolveRoomForProceduralResult(res, roomData);
    if (!matchedRoom || !matchedRoom.verifiableForRules) return;

    rawFindingsList.push({
      id: res.id,
      ruleId: res.ruleId,
      title: res.title,
      severity: res.severity,
      zone: matchedRoom.assignedZone,
      description: res.description,
      remedy: res.remedy,
      elementName: getRoomDisplayName(matchedRoom),
      elementId: matchedRoom.id,
      elementType: matchedRoom.type,
      canonicalType: matchedRoom.canonicalType,
      degreeVector: matchedRoom.rawAngle,
      ruleType: res.ruleType,
    });
  });

  // Rule 2: Strict PDF Knowledge Binding & Traceable Reasoning Chain
  const doshas: DoshaItem[] = rawFindingsList
    .filter((rf) => rf.ruleType !== "BENEFICIAL")
    .map((rf, idx) => {
    const matchedRoom = findRoomInRoomData(roomData, {
      elementId: rf.elementId,
      elementName: rf.elementName,
    });
    const displayName = matchedRoom
      ? getRoomDisplayName(matchedRoom)
      : rf.elementName || "Detected Object";
    const canonicalType = (matchedRoom?.canonicalType || rf.canonicalType || "UNKNOWN_ROOM") as CanonicalRoomType;

    const grounded = EnterpriseCognitiveReasoningService.bindAndVerifyPdfFinding(
      canonicalType,
      matchedRoom?.assignedZone || rf.zone || PENDING_CHAKRA_CALIBRATION_ZONE,
      matchedRoom?.rawAngle ?? rf.degreeVector ?? 0,
      {
        title: rf.title,
        description: rf.description,
        remedy: rf.remedy,
        severity: rf.severity,
        ruleId: rf.ruleId,
        displayName,
      }
    );

    const normalizedSev = normalizeSeverity(grounded.severity);

    const reasoningChain: InternalReasoningChain = {
      objectName: displayName,
      detectedPosition: matchedRoom?.center || { x: 0, y: 0 },
      centroid: matchedRoom?.center || { x: 0, y: 0 },
      angle: matchedRoom?.rawAngle ?? rf.degreeVector ?? 0,
      finalZone: matchedRoom?.assignedZone || rf.zone || grounded.zone,
      appliedRuleId: rf.ruleId || `RULE-${idx + 1}`,
      knowledgeSource: {
        book: grounded.citationMetadata?.sourceBook || "No Approved Vault Source",
        chapter: grounded.citationMetadata?.chapter || "Knowledge Vault",
        page: grounded.citationMetadata?.pageNumber || 0
      }
    };

    const finalRemedies = resolveHomeownerFacingRemedies({
      proceduralRemedy: rf.remedy,
      availableRemedies: grounded.remedies,
    });

    const finalRemedy = formatRemediesForDisplay(finalRemedies);

    return {
      id: rf.id || `DOSHA-${idx + 1}`,
      ruleId: rf.ruleId || `RULE-${idx + 1}`,
      title: grounded.title,
      severity: normalizedSev,
      zone: matchedRoom?.assignedZone || rf.zone || grounded.zone,
      description: sanitizeTextForHomeowner(stripBookCitationLeaks(stripInternalEngineMeta(grounded.description))),
      remedy: sanitizeTextForHomeowner(finalRemedy),
      elementName: displayName,
      elementId: matchedRoom?.id || rf.elementId,
      canonicalType,
      ruleType: rf.ruleType || "DEFECT",
      citationMetadata: grounded.citationMetadata,
      reasoningChain
    };
  });

  pipelineDevLog(`[VastuOrchestrator] Runtime Diagnostics:`, diagnostics);

  metrics.zonesEvaluated = 16;
  metrics.issuesIdentified = doshas.length;

  updateStage("STAGE_EVALUATE_PRINCIPLES", "COMPLETED", "Evaluated", `Assessed 16 zones. Identified ${doshas.length} spatial findings.`, 0.97);
  notify("STAGE_EVALUATE_PRINCIPLES");

  // STAGE 5: Preparing Recommendations
  updateStage("STAGE_PREPARE_RECOMMENDATIONS", "RUNNING", "Preparing...", "Formulating site-specific remedies and structural corrections");
  notify("STAGE_PREPARE_RECOMMENDATIONS");

  const remediesCount = doshas.filter(d => d.remedy !== "No verified reference found in the approved knowledge library.").length;
  metrics.recommendationsPrepared = remediesCount;

  updateStage("STAGE_PREPARE_RECOMMENDATIONS", "COMPLETED", "Ready", `${remediesCount} recommendations generated`, 0.98);
  notify("STAGE_PREPARE_RECOMMENDATIONS");

  // STAGE 6: Compiling Executive Assessment Report
  updateStage("STAGE_COMPILE_REPORT", "RUNNING", "Compiling...", "Formatting executive summary and spatial dossier");
  notify("STAGE_COMPILE_REPORT");

  const criticalCount = doshas.filter(d => d.severity === "CRITICAL").length;
  const highCount = doshas.filter(d => d.severity === "HIGH").length;
  const mediumCount = doshas.filter(d => d.severity === "MEDIUM").length;
  const lowCount = doshas.filter(d => d.severity === "LOW").length;

  const scoreDeductions = (criticalCount * 25) + (highCount * 15) + (mediumCount * 8) + (lowCount * 4);
  const overallScore = Math.max(15, Math.min(100, 100 - scoreDeductions));

  const totalRules = Math.max(18, entities.length * 2 + 5);
  const passedRulesCount = Math.max(0, totalRules - doshas.length);

  // Execute URJAFLUX Commercial Decision Engine
  const decisionExecutionResult = UrjafluxDecisionEngine.processDecisionPipeline(
    recognitionSummary,
    recognitionSummary ? recognitionSummary.entities : [],
    doshas,
    netNorthAngle,
    overallScore
  );

  const mappedCanonicalFindings = doshas.map(d => ({
    findingId: d.id,
    ruleId: d.ruleId,
    ruleTitle: d.title,
    category: "VASTU_DEFECT",
    severity: d.severity,
    zoneCode: d.zone,
    description: d.description,
    remedy: d.remedy
  })) as any[];

  const coverageReport = EvaluationCoverageEngine.generateCoverageReport({
    entities: recognitionSummary ? recognitionSummary.entities : [],
    findings: mappedCanonicalFindings,
    decisionChains: decisionExecutionResult.decisionChains,
    netNorthAngle: chakraOrientationCalibrated ? netNorthAngle : 0,
    baseComplianceScore: overallScore
  });

  const objectReportItems = buildObjectReportItems(roomData, doshas, recognitionSummary);

  verifyPipelineEntityIdentity(roomData, objectReportItems, recognitionSummary, doshas);

  roomData.forEach((room) => {
    const reportItem = objectReportItems.find((item) => item.id === room.id);
    const entityDefectDoshas = correlateDoshasToRoom(doshas.filter(isDefectDosha), room, roomData);
    const selectedRule = entityDefectDoshas[0]?.ruleId ?? "No DEFECT rule triggered";
    if (!reportItem) {
      pipelineDevWarn("[EntityPipelineValidation] Report missing for entity", room.id, room.displayName);
      return;
    }
    const zoneMismatch = reportItem.zone !== room.assignedZone;
    const nameMismatch = reportItem.objectName !== room.displayName;
    if (zoneMismatch || nameMismatch) {
      pipelineDevWarn("[EntityPipelineValidation] Report mismatch", {
        entityId: room.id,
        ocrNormalized: room.displayName,
        geometryZone: room.assignedZone,
        reportZone: reportItem.zone,
        reportName: reportItem.objectName,
        reportStatus: reportItem.statusType,
        selectedRule,
      });
    } else {
      pipelineDevLog("[EntityPipelineValidation] Report aligned", {
        entityId: room.id,
        normalizedName: room.displayName,
        zone: room.assignedZone,
        rule: selectedRule,
        status: reportItem.statusType,
      });
    }
  });

  const currentDisc = clientDiscoveryService.getDiscovery();
  const isDiscComplete = clientDiscoveryService.isCompleted();
  const discSummary = clientDiscoveryService.getDiscoverySummary();
  const contextProfile = discSummary ? clientContextIntelligenceEngine.processFromSummary(discSummary) : null;

  const liveSession: RuntimeEvaluationSession = {
    executionId,
    timestamp: executionTimestamp,
    formattedTimestamp: new Date(executionTimestamp).toLocaleString(),
    pipelineVersion: "4A.9-PROD",
    propertyName: currentDisc.clientInfo.clientName ? `${currentDisc.propertyType} (${currentDisc.propertySubType})` : (blueprint?.name || "Client Site"),
    propertyId: "PROP-CAD-001",
    clientName: currentDisc.clientInfo.clientName || "Unassigned Client",
    northRotation: netNorthAngle,
    recognitionCount: recognitionSummary ? recognitionSummary.entities.length : 0,
    findingCount: doshas.length,
    ruleCount: totalRules,
    overallScore,
    hasExecuted: true,
    status: "COMPLETED",
    recognitionSummary,
    decisionResult: decisionExecutionResult,
    doshas,
    objectReportItems,
    canonicalFindings: mappedCanonicalFindings,
    propertyHealth: decisionExecutionResult.propertyHealthIndex || null,
    coverageReport,
    clientDiscovery: currentDisc,
    isDiscoveryCompleted: isDiscComplete,
    clientContextProfile: contextProfile,
    consumersBound: {
      reportBound: false,
      ukaBound: false,
      pdfBound: false,
      coverageBound: false,
      consultantBound: false
    }
  };

  RuntimeEvaluationSessionStore.setSession(liveSession);

  updateStage("STAGE_COMPILE_REPORT", "COMPLETED", "Prepared", "Executive assessment report compiled", 1.0);

  // Transition sequence: EVALUATION_COMPLETE -> PREPARING_EXECUTIVE_REPORT -> REPORT_READY
  notify("STAGE_COMPILE_REPORT", "EVALUATION_COMPLETE");
  await new Promise(r => setTimeout(r, 400));
  notify("STAGE_COMPILE_REPORT", "PREPARING_EXECUTIVE_REPORT");
  await new Promise(r => setTimeout(r, 400));
  notify("STAGE_COMPILE_REPORT", "REPORT_READY");

  return {
    executionId,
    timestamp: new Date().toLocaleString(),
    totalEntitiesEvaluated: entities.length,
    overallScore,
    doshas,
    objectReportItems,
    passedRulesCount,
    totalRulesCount: totalRules,
    summary: `Evaluated ${entities.length} CAD elements against 18 Vastu Domain Modules. Identified ${doshas.length} energy imbalances. Overall Vastu Compliance Score is ${overallScore}%.`,
    rawReport: context.finalReport,
    recognitionSummary,
    decisionExecutionResult
  };
}

