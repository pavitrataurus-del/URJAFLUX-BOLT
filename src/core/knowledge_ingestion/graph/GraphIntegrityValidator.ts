// ============================================================================
// GRAPH INTEGRITY VALIDATOR (PHASE 4)
// Audits every Node & Edge against Locks 44, 45 & 46
// Ensures citations, documents, semantic objects, provenances and versions exist
// ============================================================================

import { GraphValidationReport } from "../types/graphKnowledge";
import { GraphStorageManager } from "./GraphStorageManager";

export class GraphIntegrityValidator {
  /**
   * Validates the complete knowledge graph model against strict integrity locks.
   */
  public static async validateGraph(): Promise<GraphValidationReport> {
    const storage = GraphStorageManager.getActiveBackend();
    const nodes = await storage.getAllNodes();
    const edges = await storage.getAllEdges();

    const nodeIds = new Set(nodes.map(n => n.id));
    const errors: string[] = [];

    let missingCitations = 0;
    let missingDocuments = 0;
    let missingSemanticObjects = 0;
    let missingProvenances = 0;
    let missingVersions = 0;
    let danglingEdgeCount = 0;

    // 1. Audit Nodes (LOCK 45)
    for (const node of nodes) {
      if (!node.citation || !node.citation.rawCitationText) {
        missingCitations++;
        errors.push(`LOCK 45 VIOLATION: Node ${node.id} (${node.label}) missing Source Citation.`);
      }
      if (!node.documentId) {
        missingDocuments++;
        errors.push(`LOCK 45 VIOLATION: Node ${node.id} (${node.label}) missing Document Reference.`);
      }
      if (!node.semanticObjectId) {
        missingSemanticObjects++;
        errors.push(`LOCK 45 VIOLATION: Node ${node.id} (${node.label}) missing Semantic Object ID.`);
      }
      if (!node.provenance || !node.provenance.knowledgeDomain) {
        missingProvenances++;
        errors.push(`LOCK 45 VIOLATION: Node ${node.id} (${node.label}) missing Knowledge Provenance.`);
      }
      if (!node.knowledgeVersion) {
        missingVersions++;
        errors.push(`LOCK 45 VIOLATION: Node ${node.id} (${node.label}) missing Knowledge Version.`);
      }
    }

    // 2. Audit Edges (LOCK 46)
    for (const edge of edges) {
      if (!edge.evidence || !edge.evidence.citation || !edge.evidence.citation.rawCitationText) {
        missingCitations++;
        errors.push(`LOCK 46 VIOLATION: Edge ${edge.id} (${edge.label}) missing supporting Evidence Citation.`);
      }
      if (!edge.evidence || !edge.evidence.provenance) {
        missingProvenances++;
        errors.push(`LOCK 46 VIOLATION: Edge ${edge.id} (${edge.label}) missing supporting Evidence Provenance.`);
      }
      if (!nodeIds.has(edge.sourceNodeId)) {
        danglingEdgeCount++;
        errors.push(`DANGLING EDGE ERROR: Source node ${edge.sourceNodeId} for edge ${edge.id} does not exist in graph.`);
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        danglingEdgeCount++;
        errors.push(`DANGLING EDGE ERROR: Target node ${edge.targetNodeId} for edge ${edge.id} does not exist in graph.`);
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      totalNodesChecked: nodes.length,
      totalEdgesChecked: edges.length,
      missingCitations,
      missingDocuments,
      missingSemanticObjects,
      missingProvenances,
      missingVersions,
      danglingEdgeCount,
      errors,
      timestamp: new Date().toISOString()
    };
  }
}
