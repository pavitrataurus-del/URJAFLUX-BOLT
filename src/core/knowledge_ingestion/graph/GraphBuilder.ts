// ============================================================================
// GRAPH BUILDER (PHASE 4)
// Automated Ingestion Orchestrator: Create Nodes -> Create Edges -> Validate References -> Store Graph Model
// ============================================================================

import { StructuredDocumentModel } from "../../../types/documentStructure";
import { 
  SemanticDocumentModel, 
  DynamicLearnedConcept, 
  KnowledgeProvenance, 
  SourceCitation 
} from "../../../types/semanticKnowledge";
import { GraphNodeType, GraphEdgeType } from "../types/graphKnowledge";
import { GraphNodeManager } from "./GraphNodeManager";
import { GraphEdgeManager } from "./GraphEdgeManager";
import { GraphIntegrityValidator } from "./GraphIntegrityValidator";
import { GraphStorageManager } from "./GraphStorageManager";
import {
  deleteAllGraphs as purgeAllGraphs,
  deleteDocumentGraph as purgeDocumentGraph,
} from "./graphDocumentDeletion";

export class GraphBuilder {
  /**
   * Automatically builds and stores Knowledge Graph model from ingested document models.
   */
  public static async buildDocumentGraph(
    structuredModel: StructuredDocumentModel,
    semanticModel: SemanticDocumentModel,
    learnedConcepts: DynamicLearnedConcept[] = []
  ): Promise<{
    nodesCreated: number;
    edgesCreated: number;
    validationStatus: boolean;
  }> {
    const docId = structuredModel.documentId;
    const prov = semanticModel.provenance;
    const fallbackCitation = this.createFallbackCitation(structuredModel);

    let nodesCreatedCount = 0;
    let edgesCreatedCount = 0;

    // ============================================================================
    // STEP 1: CREATE DOCUMENT ROOT NODE
    // ============================================================================
    const docNode = await GraphNodeManager.createNode({
      id: `NODE-DOC-${docId}`,
      label: structuredModel.title || structuredModel.originalName,
      nodeType: "DOCUMENT",
      semanticObjectId: docId,
      documentId: docId,
      citation: fallbackCitation,
      provenance: prov,
      properties: {
        pageCount: structuredModel.metadata?.pageCount || 1,
        chapterCount: structuredModel.chapters.length,
        domain: prov.knowledgeDomain
      }
    });
    nodesCreatedCount++;

    // ============================================================================
    // STEP 2: CREATE SEMANTIC NODES
    // ============================================================================

    // A. Dynamic Learned Concepts
    for (const concept of learnedConcepts) {
      const cProv = concept.provenances[0] || prov;
      const cCit = concept.definitions[0]?.citation || fallbackCitation;
      const conceptNode = await GraphNodeManager.createNode({
        id: `NODE-DYN-${concept.id}`,
        label: concept.canonicalName,
        nodeType: "DYNAMIC_CONCEPT",
        semanticObjectId: concept.id,
        documentId: docId,
        citation: cCit,
        provenance: cProv,
        properties: { synonyms: concept.discoveredSynonyms }
      });
      nodesCreatedCount++;

      // Edge: DYNAMIC_CONCEPT -> CITED_BY -> DOCUMENT
      await GraphEdgeManager.createEdge({
        sourceNodeId: conceptNode.id,
        targetNodeId: docNode.id,
        edgeType: "CITED_BY",
        label: "cited in document",
        evidence: { citation: cCit, provenance: cProv, supportingText: concept.canonicalName }
      });
      edgesCreatedCount++;
    }

    // B. Semantic Concepts & Domain Specific Nodes (Direction, Room, Element, Remedy, Symbol, Number, Planet)
    const conceptNodeMap = new Map<string, string>(); // semanticObjectId -> nodeId

    for (const concept of semanticModel.concepts) {
      const nodeType = this.mapConceptToNodeType(concept.canonicalName, concept.category || "");
      const conceptNode = await GraphNodeManager.createNode({
        id: `NODE-CONCEPT-${concept.id}`,
        label: concept.canonicalName,
        nodeType,
        semanticObjectId: concept.id,
        documentId: docId,
        citation: concept.citation,
        provenance: concept.provenance,
        properties: { definition: concept.definition, category: concept.category }
      });
      nodesCreatedCount++;
      conceptNodeMap.set(concept.id, conceptNode.id);

      // Edge to Document
      await GraphEdgeManager.createEdge({
        sourceNodeId: conceptNode.id,
        targetNodeId: docNode.id,
        edgeType: "BELONGS_TO",
        label: "belongs to document",
        evidence: { citation: concept.citation, provenance: concept.provenance, supportingText: concept.canonicalName }
      });
      edgesCreatedCount++;
    }

    // C. Rules & Exceptions
    const ruleNodeMap = new Map<string, string>();

    for (const rule of semanticModel.rules) {
      const nodeType: GraphNodeType = rule.isException ? "EXCEPTION" : "RULE";
      const ruleNode = await GraphNodeManager.createNode({
        id: `NODE-RULE-${rule.id}`,
        label: `${rule.isException ? "Exception" : "Rule"}: ${rule.directionOrZone || "General"}`,
        nodeType,
        semanticObjectId: rule.id,
        documentId: docId,
        citation: rule.citation,
        provenance: rule.provenance,
        properties: { ruleText: rule.ruleText, directionOrZone: rule.directionOrZone }
      });
      nodesCreatedCount++;
      ruleNodeMap.set(rule.id, ruleNode.id);

      // Edge: RULE -> CITED_BY -> DOCUMENT
      await GraphEdgeManager.createEdge({
        sourceNodeId: ruleNode.id,
        targetNodeId: docNode.id,
        edgeType: "CITED_BY",
        label: "defined in document",
        evidence: { citation: rule.citation, provenance: rule.provenance, supportingText: rule.ruleText }
      });
      edgesCreatedCount++;
    }

    // D. Formulae
    for (const formula of semanticModel.formulae) {
      const formulaNode = await GraphNodeManager.createNode({
        id: `NODE-FORMULA-${formula.id}`,
        label: formula.formulaName,
        nodeType: "FORMULA",
        semanticObjectId: formula.id,
        documentId: docId,
        citation: formula.citation,
        provenance: formula.provenance,
        properties: { expression: formula.expression, explanation: formula.explanation }
      });
      nodesCreatedCount++;

      await GraphEdgeManager.createEdge({
        sourceNodeId: formulaNode.id,
        targetNodeId: docNode.id,
        edgeType: "DERIVED_FROM",
        label: "formulated in document",
        evidence: { citation: formula.citation, provenance: formula.provenance, supportingText: formula.expression }
      });
      edgesCreatedCount++;
    }

    // E. Tables
    for (const table of semanticModel.tables) {
      const tableNode = await GraphNodeManager.createNode({
        id: `NODE-TABLE-${table.id}`,
        label: table.caption || `Table ${table.id}`,
        nodeType: "TABLE",
        semanticObjectId: table.id,
        documentId: docId,
        citation: table.citation,
        provenance: table.provenance,
        properties: { headers: table.headers, rowCount: table.rows.length }
      });
      nodesCreatedCount++;

      await GraphEdgeManager.createEdge({
        sourceNodeId: tableNode.id,
        targetNodeId: docNode.id,
        edgeType: "PART_OF",
        label: "part of document",
        evidence: { citation: table.citation, provenance: table.provenance, supportingText: table.caption || "Table" }
      });
      edgesCreatedCount++;
    }

    // ============================================================================
    // STEP 3: CREATE RELATIONSHIP EDGES
    // ============================================================================

    // A. Inter-Entity Relationships
    for (const rel of semanticModel.relationships) {
      const sourceNodeId = conceptNodeMap.get(rel.subjectId) || `NODE-CONCEPT-${rel.subjectId}`;
      const targetNodeId = conceptNodeMap.get(rel.objectId) || `NODE-CONCEPT-${rel.objectId}`;

      const edgeType = this.mapRelationToEdgeType(rel.relation);

      // Verify both nodes exist before linking
      const sourceNode = await GraphNodeManager.getNodeById(sourceNodeId);
      const targetNode = await GraphNodeManager.getNodeById(targetNodeId);

      if (sourceNode && targetNode) {
        await GraphEdgeManager.createEdge({
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          edgeType,
          label: rel.relation,
          evidence: {
            citation: rel.citation,
            provenance: rel.provenance,
            supportingText: `${rel.subjectName} ${rel.relation} ${rel.objectName}`
          }
        });
        edgesCreatedCount++;
      }
    }

    // B. Cross Domain Links
    for (const link of semanticModel.crossDomainLinks) {
      const sourceNodeId = conceptNodeMap.get(link.sourceEntity) || `NODE-CONCEPT-${link.sourceEntity}`;
      const targetNodeId = conceptNodeMap.get(link.targetEntityOrConcept) || `NODE-CONCEPT-${link.targetEntityOrConcept}`;

      const sourceNode = await GraphNodeManager.getNodeById(sourceNodeId);
      const targetNode = await GraphNodeManager.getNodeById(targetNodeId);

      if (sourceNode && targetNode) {
        await GraphEdgeManager.createEdge({
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          edgeType: "CROSS_DOMAIN_LINK",
          label: `Cross Domain Link (${link.sourceDomain} -> ${link.targetDomain})`,
          evidence: {
            citation: fallbackCitation,
            provenance: prov,
            supportingText: link.mappingRules.join("; ")
          }
        });
        edgesCreatedCount++;
      }
    }

    // ============================================================================
    // STEP 4: VALIDATE GRAPH REFERENCES & INTEGRITY (LOCK 44, 45, 46)
    // ============================================================================
    const valReport = await GraphIntegrityValidator.validateGraph();

    return {
      nodesCreated: nodesCreatedCount,
      edgesCreated: edgesCreatedCount,
      validationStatus: valReport.isValid
    };
  }

  /**
   * Deletes all knowledge graph nodes and connected edges associated with a document.
   */
  public static async deleteDocumentGraph(documentId: string): Promise<{ nodesDeleted: number; edgesDeleted: number }> {
    return purgeDocumentGraph(documentId);
  }

  /**
   * Clears all knowledge graph nodes and connected edges across all documents.
   */
  public static async deleteAllGraphs(): Promise<{ nodesDeleted: number; edgesDeleted: number }> {
    return purgeAllGraphs();
  }

  private static mapConceptToNodeType(canonicalName: string, category: string): GraphNodeType {
    const text = `${canonicalName} ${category}`.toLowerCase();
    if (text.includes("direction") || text.includes("north") || text.includes("south") || text.includes("east") || text.includes("west") || text.includes("ne") || text.includes("nw") || text.includes("se") || text.includes("sw")) return "DIRECTION";
    if (text.includes("room") || text.includes("kitchen") || text.includes("bedroom") || text.includes("puja") || text.includes("bathroom") || text.includes("entrance")) return "ROOM";
    if (text.includes("element") || text.includes("water") || text.includes("fire") || text.includes("earth") || text.includes("air") || text.includes("space") || text.includes("ether")) return "ELEMENT";
    if (text.includes("remedy") || text.includes("pyramid") || text.includes("helix") || text.includes("crystal") || text.includes("color")) return "REMEDY";
    if (text.includes("symbol") || text.includes("swastika") || text.includes("om") || text.includes("yantra")) return "SYMBOL";
    if (text.includes("number") || text.includes("numerology")) return "NUMBER";
    if (text.includes("planet") || text.includes("sun") || text.includes("moon") || text.includes("mars") || text.includes("jupiter") || text.includes("saturn") || text.includes("venus") || text.includes("mercury") || text.includes("rahu") || text.includes("ketu")) return "PLANET";

    return "CONCEPT";
  }

  private static mapRelationToEdgeType(relation: string): GraphEdgeType {
    const rel = relation.toLowerCase();
    if (rel.includes("is_a") || rel.includes("is a") || rel.includes("type of")) return "IS_A";
    if (rel.includes("part_of") || rel.includes("part of") || rel.includes("contains")) return "PART_OF";
    if (rel.includes("belongs")) return "BELONGS_TO";
    if (rel.includes("located") || rel.includes("situated") || rel.includes("in zone")) return "LOCATED_IN";
    if (rel.includes("support") || rel.includes("enhances")) return "SUPPORTS";
    if (rel.includes("conflict") || rel.includes("opposes") || rel.includes("violates")) return "CONFLICTS_WITH";
    if (rel.includes("require") || rel.includes("needs")) return "REQUIRES";
    if (rel.includes("depend")) return "DEPENDS_ON";
    if (rel.includes("derive")) return "DERIVED_FROM";
    if (rel.includes("remed")) return "REMEDIED_BY";
    if (rel.includes("reference")) return "REFERENCES";

    return "RELATED_TO";
  }

  private static createFallbackCitation(docModel: StructuredDocumentModel): SourceCitation {
    const title = docModel.title || docModel.originalName;
    return {
      documentId: docModel.documentId,
      sourceDocument: title,
      chapterId: "CH-1",
      chapterTitle: "Chapter 1",
      sectionId: "SEC-1",
      sectionTitle: "General Section",
      paragraphId: "P-1",
      pageNumber: 1,
      rawCitationText: `${title}, P 1`,
      formattedCitation: `${title}, P 1`
    };
  }
}
