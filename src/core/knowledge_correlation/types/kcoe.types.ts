// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE CORRELATION ENGINE (KCoE) TYPES
// Domain-Independent Structural Knowledge Relationship & Graph Architecture
// ============================================================================

import { KnowledgeDomain } from "../../knowledge_ingestion/types/universalIngestion.types";
import { VaultKnowledgeCategory } from "../../knowledge_vault/types/vaultRecord.types";

export type { KnowledgeDomain, VaultKnowledgeCategory };

/**
 * 32 Standardized Structural Relationship Types supported by KCoE
 */
export type KCoERelationshipType =
  | 'RULE_TO_SUPPORTING_RULE'
  | 'RULE_TO_RELATED_RULE'
  | 'RULE_TO_CONDITION'
  | 'RULE_TO_EXCEPTION'
  | 'RULE_TO_CAUSE'
  | 'RULE_TO_EFFECT'
  | 'RULE_TO_POSITIVE_FINDING'
  | 'RULE_TO_DOSHA'
  | 'RULE_TO_REMEDY'
  | 'RULE_TO_ALTERNATIVE_REMEDY'
  | 'RULE_TO_CONTRAINDICATION'
  | 'RULE_TO_OBSERVATION'
  | 'RULE_TO_DEFINITION'
  | 'RULE_TO_FORMULA'
  | 'RULE_TO_ILLUSTRATION'
  | 'RULE_TO_OBJECT'
  | 'RULE_TO_ROOM'
  | 'RULE_TO_DIRECTION'
  | 'RULE_TO_ZONE'
  | 'RULE_TO_ELEMENT'
  | 'RULE_TO_PLANET'
  | 'RULE_TO_CHAKRA'
  | 'RULE_TO_ACTIVITY'
  | 'RULE_TO_CROSS_REFERENCE'
  | 'RULE_TO_SAME_TOPIC'
  | 'RULE_TO_SAME_CHAPTER'
  | 'RULE_TO_SAME_BOOK'
  | 'RULE_TO_SAME_AUTHOR'
  | 'RULE_TO_SAME_DOMAIN'
  | 'RULE_TO_RELATED_DOMAIN'
  | 'RULE_TO_FUTURE_RESEARCH';

/**
 * Structural Relationship Link (Edge in the Correlation Graph)
 */
export interface IKCoERelationshipEdge {
  relationshipId: string;
  sourceId: string;
  targetId: string;
  relationshipType: KCoERelationshipType;
  
  /**
   * Structural weight based strictly on schema proximity (1.0 = direct linked entity, 0.8 = shared zone/element, etc.)
   * DOES NOT represent confidence or authority ranking.
   */
  structuralStrength: number;
  
  metadata: {
    sourceDomain: KnowledgeDomain;
    targetDomain: KnowledgeDomain;
    establishedAt: string;
    correlationRuleOrigin: string;
    chapterRef?: string;
    bookTitle?: string;
    authorName?: string;
    [key: string]: any;
  };
  
  version: string;
}

/**
 * Knowledge Correlation Node (Node in the Correlation Graph)
 */
export interface IKCoEGraphNode {
  nodeId: string; // Record ID or Registry Rule ID
  nodeType: 'RECORD' | 'RULE' | 'ENTITY_CONCEPT';
  domain: KnowledgeDomain;
  category: VaultKnowledgeCategory;
  label: string;
  
  // Dimensional attributes
  dimensions: {
    directions: string[];
    zones: string[];
    elements: string[];
    planets: string[];
    rooms: string[];
    objectTypes: string[];
    chakras: string[];
    activities: string[];
  };

  outgoingEdgeIds: string[];
  incomingEdgeIds: string[];
}

/**
 * Traverse Request Options
 */
export interface IKCoETraversalQuery {
  startNodeId: string;
  maxDepth?: number; // Defaults to 2
  allowedRelationshipTypes?: KCoERelationshipType[];
  targetDomains?: KnowledgeDomain[];
  direction?: 'OUTGOING' | 'INCOMING' | 'BOTH';
}

/**
 * Graph Traversal Result Path Package
 */
export interface IKCoETraversalPath {
  nodes: IKCoEGraphNode[];
  edges: IKCoERelationshipEdge[];
  depth: number;
  startNodeId: string;
  endNodeId: string;
}

/**
 * Correlation Graph Snapshot
 */
export interface IKCoEGraphSnapshot {
  totalNodes: number;
  totalEdges: number;
  domainNodeDistribution: Record<string, number>;
  relationshipTypeDistribution: Record<string, number>;
  graphVersion: string;
  timestamp: string;
}
