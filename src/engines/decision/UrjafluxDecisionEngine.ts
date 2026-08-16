/**
 * URJAFLUX AI OS — SPRINT 3A
 * Urjaflux Decision Engine
 * Orchestrates the full 8-layer architecture pipeline & generates
 * complete, reproducible Decision Chains for every finding.
 */

import { PropertyRecognitionSummary, RecognizedEntity } from "../../recognition/types";
import { DoshaItem } from "../../services/vastuAnalysisOrchestrator";
import { DecisionChain, ElementMultiDimensionalEvaluation, PositiveNegativeAudit, PropertyHealthIndex } from "./types";
import { MultiDimensionalEvaluator } from "./MultiDimensionalEvaluator";
import { PropertyHealthEvaluator } from "./PropertyHealthEvaluator";
import { PositiveNegativeAuditEngine } from "./PositiveNegativeAuditEngine";
import { DecisionEvidenceEngine } from "./DecisionEvidenceEngine";
import { roomTaxonomyService } from "../../recognition/RoomTaxonomyService";
import { CanonicalSpatialCalculationEngine } from "../../core/spatial/CanonicalSpatialCalculationEngine";

function deriveEntityCentroid(entity: RecognizedEntity): { x: number; y: number } {
  const halfW = (entity.coordinates.width || 0) / 2;
  const halfH = (entity.coordinates.height || 0) / 2;
  return {
    x: entity.coordinates.x + halfW,
    y: entity.coordinates.y + halfH,
  };
}

function derivePropertyCentroid(entities: RecognizedEntity[]): { x: number; y: number } {
  if (entities.length === 0) return { x: 0, y: 0 };
  const points = entities.map(deriveEntityCentroid);
  return CanonicalSpatialCalculationEngine.calculateCentroid(points);
}

function derivePropertySpan(entities: RecognizedEntity[]): number {
  const points = entities.map(deriveEntityCentroid);
  if (points.length === 0) return 0;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

export interface DecisionEngineExecutionResult {
  decisionChains: DecisionChain[];
  elementEvaluations: ElementMultiDimensionalEvaluation[];
  propertyHealthIndex: PropertyHealthIndex;
  positiveNegativeAudit: PositiveNegativeAudit;
  overallConfidence: number; // 0 to 1.0
}

export class UrjafluxDecisionEngine {
  /**
   * Main entry point to process recognition summary, entities, and doshas through the decision engine.
   */
  public static processDecisionPipeline(
    recognitionSummary: PropertyRecognitionSummary | null,
    entities: RecognizedEntity[],
    doshas: DoshaItem[],
    netNorthAngle: number,
    baseOverallScore: number
  ): DecisionEngineExecutionResult {
    const propertyCentroid = derivePropertyCentroid(entities);
    const brahmasthanCenter = propertyCentroid;
    const entranceEntity = entities.find(
      (e) =>
        e.canonicalType === "MAIN_ENTRANCE" ||
        e.type === "main_entrance" ||
        e.type === "door"
    );
    const entranceCenter = entranceEntity
      ? { x: entranceEntity.coordinates.x + entranceEntity.coordinates.width / 2, y: entranceEntity.coordinates.y + entranceEntity.coordinates.height / 2 }
      : null;

    // 1. Execute Multi-Dimensional Element Evaluations
    const elementEvaluations = entities.map((entity) =>
      MultiDimensionalEvaluator.evaluateElement(
        entity,
        entities,
        brahmasthanCenter,
        entranceCenter,
        netNorthAngle,
        derivePropertySpan(entities)
      )
    );

    // 2. Compute Property Health Index across 8 sub-indices
    const propertyHealthIndex = PropertyHealthEvaluator.calculatePropertyHealth(
      elementEvaluations,
      doshas,
      baseOverallScore
    );

    // 3. Generate Positive + Negative Audit
    const positiveNegativeAudit = PositiveNegativeAuditEngine.generateAudit(
      elementEvaluations,
      doshas
    );

    // 4. Construct Deterministic 15-Stage Decision Evidence Chains for every Dosha finding
    const decisionChains: DecisionChain[] = doshas.map((dosha, idx) => {
      // Canonical Entity Resolution (Phase 5 & 6 SSOT)
      const foundEntity = entities.find(
        (e) =>
          (dosha.elementId && e.id === dosha.elementId) ||
          (dosha.elementName && (e.displayName || e.name) === dosha.elementName)
      );

      const fallbackDisplayName = dosha.elementName || "Unresolved Architectural Entity";
      const matchedEntity: RecognizedEntity = foundEntity || {
        id: `ENTITY_RESOLUTION_FAILED_${idx + 1}`,
        name: fallbackDisplayName,
        displayName: fallbackDisplayName,
        canonicalType: roomTaxonomyService.resolveCanonicalType(fallbackDisplayName),
        type: "Room",
        category: "ROOM" as const,
        zone: dosha.zone,
        coordinates: { x: 0, y: 0, width: 0, height: 0 },
        confidence: 0.0,
        detectedBy: "SPATIAL_GEOMETRY" as const,
        verificationStatus: "UNVERIFIED" as const,
        evidence: ["ENTITY_RESOLUTION_FAILED: No matching spatial entity for finding"]
      };

      const matchedEval = elementEvaluations.find((ev) => ev.elementId === matchedEntity.id) || {
        elementId: matchedEntity.id,
        elementName: matchedEntity.name,
        elementType: matchedEntity.type,
        assignedZone: matchedEntity.zone || dosha.zone,
        healthIndex: 65,
        dimensions: [],
        positiveAttributes: ["Functional spatial layout"],
        negativeAttributes: [dosha.description]
      };

      return DecisionEvidenceEngine.generateDecisionEvidenceChain(
        dosha.id || `DOSHA-${idx + 1}`,
        matchedEntity,
        dosha,
        matchedEval,
        netNorthAngle,
        baseOverallScore
      );
    });

    const avgConfidence = decisionChains.length > 0
      ? decisionChains.reduce((acc, c) => acc + c.confidenceBreakdown.overallConfidence, 0) / decisionChains.length
      : 0.95;

    return {
      decisionChains,
      elementEvaluations,
      propertyHealthIndex,
      positiveNegativeAudit,
      overallConfidence: Math.round(avgConfidence * 100) / 100
    };
  }
}
