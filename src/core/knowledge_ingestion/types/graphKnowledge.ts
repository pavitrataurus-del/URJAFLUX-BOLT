// ============================================================================
// KNOWLEDGE GRAPH ENGINE TYPES & INTERFACES (PHASE 4)
// Locks 44 (Never Owns Knowledge - Brain is Single Source of Truth), 45 (Permanent Traceable Reference), 46 (Mandatory Evidence Citation for Edges)
// ============================================================================

import { KnowledgeProvenance, SourceCitation } from "../../../types/semanticKnowledge";

export type GraphNodeType =
  | "DYNAMIC_CONCEPT"
  | "CONCEPT"
  | "RULE"
  | "EXCEPTION"
  | "FORMULA"
  | "TABLE"
  | "RELATIONSHIP"
  | "DIRECTION"
  | "ROOM"
  | "ELEMENT"
  | "REMEDY"
  | "SYMBOL"
  | "NUMBER"
  | "PLANET"
  | "DOCUMENT";

export type GraphEdgeType =
  | "IS_A"
  | "PART_OF"
  | "BELONGS_TO"
  | "LOCATED_IN"
  | "ASSOCIATED_WITH"
  | "SUPPORTS"
  | "CONFLICTS_WITH"
  | "REQUIRES"
  | "DEPENDS_ON"
  | "DERIVED_FROM"
  | "REFERENCES"
  | "CITED_BY"
  | "RELATED_TO"
  | "REMEDIED_BY"
  | "CROSS_DOMAIN_LINK";

/**
 * GRAPH NODE (LOCK 45 COMPLIANT)
 * Represents a node in the Knowledge Graph.
 * Never owns raw knowledge payload; holds permanent traceable pointer to Semantic Object & Document.
 */
export interface GraphNode {
  id: string; // e.g. NODE-CONCEPT-123
  label: string;
  nodeType: GraphNodeType;
  semanticObjectId: string; // Refers to Knowledge Brain semantic object
  documentId: string; // Permanent document ref
  citation: SourceCitation; // Mandatory citation
  provenance: KnowledgeProvenance; // Mandatory provenance
  knowledgeVersion: string; // Mandatory versioning
  properties: Record<string, any>; // Extra structural metadata (domain, category, direction, etc.)
  createdDate: string;
  lastUpdated: string;
}

/**
 * GRAPH EDGE (LOCK 46 COMPLIANT)
 * Represents a directional relationship between two nodes in the graph.
 * MUST always contain supporting evidence citation.
 */
export interface GraphEdge {
  id: string; // e.g. EDGE-123
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: GraphEdgeType;
  label: string;
  weight: number;
  evidence: {
    citation: SourceCitation; // Mandatory Lock 46 citation evidence
    provenance: KnowledgeProvenance; // Mandatory provenance
    supportingText: string;
    confidenceScore: number;
  };
  properties: Record<string, any>;
  createdDate: string;
}

// ============================================================================
// TRAVERSAL TYPES
// ============================================================================

export interface GraphTraversalOptions {
  startNodeId: string;
  maxDepth?: number;
  allowedEdgeTypes?: GraphEdgeType[];
  allowedNodeTypes?: GraphNodeType[];
  direction?: "OUTGOING" | "INCOMING" | "BOTH";
}

export interface GraphPath {
  nodeIds: string[];
  edgeIds: string[];
  length: number;
}

export interface GraphTraversalResult {
  visitedNodeIds: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  paths: GraphPath[];
}

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface GraphQueryResult {
  queryType: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: Record<string, any>;
}

// ============================================================================
// INTEGRITY & ANALYTICS TYPES
// ============================================================================

export interface GraphValidationReport {
  isValid: boolean;
  totalNodesChecked: number;
  totalEdgesChecked: number;
  missingCitations: number;
  missingDocuments: number;
  missingSemanticObjects: number;
  missingProvenances: number;
  missingVersions: number;
  danglingEdgeCount: number;
  errors: string[];
  timestamp: string;
}

export interface AdminGraphAnalytics {
  totalNodes: number;
  totalEdges: number;
  connectedComponents: number;
  orphanNodes: number;
  brokenReferences: number;
  graphDensity: number;
  averageDegree: number;
  nodeTypeDistribution: Record<string, number>;
  relationshipDistribution: Record<string, number>;
  timestamp: string;
}

// ============================================================================
// FUTURE-READY GRAPH STORAGE BACKEND CONTRACT
// Prepares seamless integration with Neo4j, NetworkX, Memgraph, Neptune, Cosmos Graph
// ============================================================================

export interface IGraphStorageBackend {
  name: string;
  addNode(node: GraphNode): Promise<void>;
  addEdge(edge: GraphEdge): Promise<void>;
  getNode(id: string): Promise<GraphNode | null>;
  getEdge(id: string): Promise<GraphEdge | null>;
  getOutgoingEdges(nodeId: string): Promise<GraphEdge[]>;
  getIncomingEdges(nodeId: string): Promise<GraphEdge[]>;
  getAllNodes(): Promise<GraphNode[]>;
  getAllEdges(): Promise<GraphEdge[]>;
  deleteNode(id: string): Promise<boolean>;
  deleteEdge(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
