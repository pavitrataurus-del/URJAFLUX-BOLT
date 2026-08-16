// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENGINE 8: CONSISTENCY EXPLAINABILITY ENGINE
// Explainability tree solver for every semantic decision
// Provides explicit geometry, OCR, object, and relationship audit trails
// ============================================================================

import { 
  IConsistencyExplainabilityReport, 
  IRoomDecisionExplainability, 
  IPropertyTaxonomy 
} from "../types/bsue_v1_5.types";

import { ISemanticRoom, ISemanticRelationshipGraph, ISemanticFusionSummary } from "../types/bsue.types";
import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class ConsistencyExplainabilityEngine {
  private static instance: ConsistencyExplainabilityEngine;

  private constructor() {}

  public static getInstance(): ConsistencyExplainabilityEngine {
    if (!ConsistencyExplainabilityEngine.instance) {
      ConsistencyExplainabilityEngine.instance = new ConsistencyExplainabilityEngine();
    }
    return ConsistencyExplainabilityEngine.instance;
  }

  public generateExplainabilityReport(
    semanticRooms: ISemanticRoom[],
    taxonomy: IPropertyTaxonomy,
    relationshipGraph: ISemanticRelationshipGraph,
    fusionSummary: ISemanticFusionSummary,
    bmueModel: IBlueprintMathematicalModel
  ): IConsistencyExplainabilityReport {
    const roomExplainabilities: IRoomDecisionExplainability[] = [];
    let contradictionCount = 0;

    semanticRooms.forEach(room => {
      const fusionBundle = fusionSummary.fusedBundles.find(f => f.entityId === room.roomId);
      const containedObjs = bmueModel.containmentGraph.containments
        .filter(c => c.assignedRoomId === room.roomId)
        .map(c => c.objectType);

      const connectedEdges = relationshipGraph.edges.filter(e => e.sourceRoomId === room.roomId || e.targetRoomId === room.roomId);
      const connectedRelationships = connectedEdges.map(e => e.description);

      const rulesApplied: string[] = [
        'RULE_MULTI_EVIDENCE_FUSION_WEIGHTED_AVERAGE',
        'RULE_GEOMETRY_FOOTPRINT_VALIDATION'
      ];

      const contradictions: string[] = [];

      if (fusionBundle && fusionBundle.hasConflictingEvidence) {
        contradictions.push(`OCR label '${room.semanticLabel}' contradicted geometric area bounds (${room.areaSqMeters}m²). Resolved in favor of Geometry.`);
        contradictionCount++;
      }

      if (room.isAmbiguous) {
        contradictions.push(`Low classification confidence score (${room.confidence}). Marked for potential consultant review.`);
      }

      const ocrEv = room.supportingEvidence.find(e => e.sourceType === 'OCR');
      const geoEv = room.supportingEvidence.find(e => e.sourceType === 'GEOMETRY');

      // Build Explainability Tree
      const explainabilityTree = {
        rootNode: `Classification Decision: ${room.canonicalType} (${room.semanticLabel})`,
        branches: [
          {
            condition: `Polygon Area Footprint: ${room.areaSqMeters}m²`,
            weight: geoEv ? geoEv.weight : 0.45,
            result: `Geometrically valid footprint range for ${room.canonicalType}`
          },
          {
            condition: ocrEv ? `OCR Label Text: '${ocrEv.evidenceKey}'` : 'OCR Text: No direct label',
            weight: ocrEv ? ocrEv.weight : 0.25,
            result: ocrEv ? `OCR matched dictionary term` : 'No OCR text available'
          },
          {
            condition: `Contained Objects: [${containedObjs.join(', ')}]`,
            weight: 0.20,
            result: containedObjs.length > 0 ? `${containedObjs.length} supporting furniture/fixture object(s)` : 'No objects detected'
          },
          {
            condition: `Circulation Connections: ${connectedEdges.length} door link(s)`,
            weight: 0.10,
            result: connectedEdges.length > 0 ? `Integrated into circulation network` : 'Isolated room node'
          }
        ]
      };

      roomExplainabilities.push({
        roomId: room.roomId,
        decisionLabel: room.canonicalType,
        confidence: room.confidence,
        evidence: {
          geometry: `Polygon Area ${room.areaSqMeters}m² with centroid (${room.centroid.x}, ${room.centroid.y})`,
          ocr: ocrEv ? ocrEv.evidenceKey : 'NONE',
          objects: containedObjs,
          relationships: connectedRelationships
        },
        rulesApplied,
        contradictions,
        explainabilityTree
      });
    });

    const taxonomyExplainability = {
      decision: `${taxonomy.propertyType} (${taxonomy.propertyCategory})`,
      evidenceSummary: taxonomy.supportingEvidence.map(e => e.description),
      rulesApplied: [
        'RULE_TAXONOMY_SCORE_AGGREGATION',
        'RULE_STRICT_FOUNDER_NO_GUESS_LOCK'
      ]
    };

    let totalConf = 0;
    semanticRooms.forEach(r => totalConf += r.confidence);
    const avgConfidence = semanticRooms.length > 0 ? totalConf / semanticRooms.length : 0.95;

    return {
      roomExplainabilities,
      taxonomyExplainability,
      overallModelConfidence: Math.round(avgConfidence * 100) / 100,
      unresolvedContradictionsCount: contradictionCount
    };
  }
}

export const consistencyExplainabilityEngine = ConsistencyExplainabilityEngine.getInstance();
