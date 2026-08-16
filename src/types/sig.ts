/**
 * ============================================================================
 *               URJAFLUX AI OS — FOUNDATION LAYER 03
 *             SPATIAL INTELLIGENCE GRAPH (SIG) ONTOLOGY
 * ============================================================================
 * 
 * This file defines the permanent, multi-tenant knowledge graph ontology for the
 * URJAFLUX AI OS. The Spatial Intelligence Graph (SIG) decouples logical spatial 
 * relationships, architectural entities, scripture evidence, rule constraints,
 * and human decisions from any drawing interface, database layer, or ephemeral frontends.
 * 
 * DESIGN INSPIRATION:
 * - Palantir Foundry / Ontology: Strong typing, immutable objects, and transaction histories.
 * - Neo4j Enterprise: Property graphs, fast traversals, directed and labeled relationships.
 * - Google Knowledge Graph: Entity resolution, rich semantic connections, and global identifiers.
 * 
 * CHARACTERISTICS:
 * 1. DIRECTED: Every edge is typed and points from a source vertex to a target vertex.
 * 2. VERSIONED: Entities and relationships have transaction hashes, and logical state changes 
 *    generate new immutable revisions.
 * 3. EXPLAINABLE: A chain of relationships can be traversed backwards to produce natural-language
 *    justifications (e.g., SKO -> Observation -> Decision -> Recommendation -> Rule -> Evidence).
 * 4. MULTI-TENANT: Isolation is built into the node and edge levels using TenantID scopes.
 * 5. SEPARATION OF CONCERNS: The graph holds structure and data; it does not perform reasoning or AI.
 * 
 * @scale Supporting graph instances of 1,000,000+ vertices and 10,000,000+ edges in a distributed store.
 * @compatibility Integrates directly with EREF (rules.ts) and RPE (rulePacks.ts).
 */

import { 
  RuleID, 
  RuleVersionString, 
  KnowledgeSystemType, 
  RuleEvidence,
  TenantID
} from "./rules";

import { RulePackID } from "./rulePacks";

export type EntityID = string;
export type RelationshipID = string;
export type TransactionID = string;

// ============================================================================
// 1. ENTITY TYPE CLASSIFICATION (VERTICES)
// ============================================================================

export enum SIGEntityType {
  CLIENT = "CLIENT",
  PROPERTY = "PROPERTY",
  PROJECT = "PROJECT",
  DRAWING = "DRAWING",
  FLOOR = "FLOOR",
  SPATIAL_KNOWLEDGE_OBJECT = "SPATIAL_KNOWLEDGE_OBJECT", // SKO
  RULE = "RULE",
  KNOWLEDGE_PACK = "KNOWLEDGE_PACK",
  EVIDENCE = "EVIDENCE",
  OBSERVATION = "OBSERVATION",
  CONSULTANT_DECISION = "CONSULTANT_DECISION",
  RECOMMENDATION_CANDIDATE = "RECOMMENDATION_CANDIDATE",
  CASE_STUDY = "CASE_STUDY",
  PHOTO = "PHOTO",
  VIDEO = "VIDEO",
  VOICE_NOTE = "VOICE_NOTE",
  DOCUMENT = "DOCUMENT",
  TIMELINE_EVENT = "TIMELINE_EVENT"
}

// ============================================================================
// 2. RELATIONSHIP TYPE CLASSIFICATION (EDGES)
// ============================================================================

export enum SIGRelationshipType {
  OWNS = "OWNS",                       // Client -> Property
  CONTAINS = "CONTAINS",               // Property -> Project, Floor -> SKO
  HAS = "HAS",                         // Project -> Drawing
  HAS_FLOOR = "HAS_FLOOR",             // Drawing -> Floor
  REFERENCES = "REFERENCES",           // SKO -> Rule, Recommendation -> Evidence, Observation -> SKO
  BELONGS_TO = "BELONGS_TO",           // Rule -> Knowledge Pack
  HAS_EVIDENCE = "HAS_EVIDENCE",       // Rule -> Evidence
  SUPPORTS = "SUPPORTS",               // Evidence -> Rule
  CONTRADICTS = "CONTRADICTS",         // Flags potential design/logical disputes
  CREATED = "CREATED",                 // Consultant -> Observation
  APPROVED = "APPROVED",               // Consultant -> Decision
  GENERATED = "GENERATED",             // Decision -> Recommendation Candidate
  VALIDATES = "VALIDATES",             // Case Study -> Rule
  ATTACHED_TO = "ATTACHED_TO",         // Photo/Video/Document -> SKO
  TRACKS = "TRACKS"                    // Timeline Event -> Entity (or generic audit trail)
}

// ============================================================================
// 3. BASE DATA SCHEMAS (IMMUTABILITY & AUDITING)
// ============================================================================

export interface SIGAuditTrail {
  createdTimestamp: string; // ISO 8601
  modifiedTimestamp: string; // ISO 8601
  createdByUser: string;
  modifiedByUser: string;
  transactionId: TransactionID; // Associates graph operations with a logical commit
  schemaVersion: string; // Internal ontology version (e.g. "1.0.0")
}

/**
 * Base Node structure in the graph. All first-class entities inherit from this.
 */
export interface SIGBaseNode {
  id: EntityID;
  type: SIGEntityType;
  tenantId: TenantID;
  version: number; // Monotonically increasing revision number
  lifecycleState: "ACTIVE" | "ARCHIVED" | "DRAFT" | "DELETED";
  properties: Record<string, any>; // Arbitrary typed payload indexed by query engine
  audit: SIGAuditTrail;
}

/**
 * Base Edge structure representing a semantic connection.
 */
export interface SIGBaseEdge {
  id: RelationshipID;
  type: SIGRelationshipType;
  tenantId: TenantID;
  sourceId: EntityID;
  targetId: EntityID;
  weight: number; // Strength of relationship, 0.0 to 1.0 (defaults to 1.0)
  properties: Record<string, any>;
  audit: SIGAuditTrail;
}

// ============================================================================
// 4. STRONGLY-TYPED DOMAIN ENTITIES (LEVEL 3 & 4 PLATFORM ASSETS)
// ============================================================================

export interface ClientEntity extends SIGBaseNode {
  type: SIGEntityType.CLIENT;
  properties: {
    fullName: string;
    organization?: string;
    tier: "STANDARD" | "PREMIUM" | "ENTERPRISE";
    email: string;
    phone?: string;
  };
}

export interface PropertyEntity extends SIGBaseNode {
  type: SIGEntityType.PROPERTY;
  properties: {
    address: string;
    geopoint: { latitude: number; longitude: number };
    totalAreaSqFt: number;
    elevationAboveSeaLevelMeters?: number;
    terrainSlopeAngle?: number;
    siteClassification: "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "TEMPLE" | "AGRICULTURAL";
  };
}

export interface ProjectEntity extends SIGBaseNode {
  type: SIGEntityType.PROJECT;
  properties: {
    projectName: string;
    status: "ONBOARDING" | "CALIBRATION" | "ASSESSMENT" | "COMPLETED" | "AUDIT";
    primaryConsultantId: string;
    targetCompletionDate?: string;
  };
}

export interface DrawingEntity extends SIGBaseNode {
  type: SIGEntityType.DRAWING;
  properties: {
    fileName: string;
    fileUrl: string;
    format: "DXF" | "DWG" | "PDF" | "PNG" | "SVG";
    originalResolution: { width: number; height: number };
    scaleMultiplier: number; // Pixels to meters
    gridCalibrationHash: string; // Links orientation vectors with physical compass offsets
  };
}

export interface FloorEntity extends SIGBaseNode {
  type: SIGEntityType.FLOOR;
  properties: {
    floorIndex: number; // 0 = Ground, 1 = First, etc.
    floorName: string;
    heightOffsetMeters: number;
    floorAreaSqFt: number;
  };
}

/**
 * Spatial Knowledge Object (SKO). Represents physical geometry paired with semantic meanings.
 * e.g., A polygon containing coordinate boundaries labeled "Master Bedroom".
 */
export interface SpatialKnowledgeObjectEntity extends SIGBaseNode {
  type: SIGEntityType.SPATIAL_KNOWLEDGE_OBJECT;
  properties: {
    label: string;                  // e.g. "Primary Kitchen"
    functionalZoneType: string;     // e.g. "KITCHEN", "TOILET", "MAIN_ENTRANCE", "LIVING_ROOM"
    geometricalType: "POLYGON" | "POINT" | "POLYLINE" | "CIRCLE";
    
    // Relative coordinates based on drawing origin
    coordinates: Array<{ x: number; y: number; z?: number }>;
    centerOfMass: { x: number; y: number; z?: number };
    rotationAngleDegrees: number;
    
    // Energetic attributes mapped dynamically
    cardinalSector: "NORTH" | "NORTHEAST" | "EAST" | "SOUTHEAST" | "SOUTH" | "SOUTHWEST" | "WEST" | "NORTHWEST" | "CENTER" | "UNKNOWN";
    primaryElement: "Water" | "Fire" | "Earth" | "Air" | "Space" | "None";
    calculatedGridAreaSqMeters: number;
  };
}

export interface RuleEntity extends SIGBaseNode {
  type: SIGEntityType.RULE;
  properties: {
    ruleId: RuleID;
    ruleVersion: RuleVersionString;
    name: string;
    system: KnowledgeSystemType;
    category: string;
    subcategory: string;
    severity: string;
    priority: string;
  };
}

export interface KnowledgePackEntity extends SIGBaseNode {
  type: SIGEntityType.KNOWLEDGE_PACK;
  properties: {
    packId: RulePackID;
    version: RuleVersionString;
    title: string;
    publisher: string;
    licenseType: string;
  };
}

export interface EvidenceEntity extends SIGBaseNode {
  type: SIGEntityType.EVIDENCE;
  properties: {
    evidenceId: string;
    sourceType: "SCRIPTURE" | "BOOK" | "RESEARCH_PAPER" | "INTERNAL_DECISION";
    primaryTitle: string;
    citationReference: string; // e.g., "Chapter 4, Verse 11"
    evidenceTextQuote: string;
    confidenceWeight: number; // 0.0 to 1.0
  };
}

export interface ObservationEntity extends SIGBaseNode {
  type: SIGEntityType.OBSERVATION;
  properties: {
    id: string;
    ruleEvaluatedId: RuleID;
    findingText: string;
    severityScore: "CRITICAL" | "MAJOR" | "MODERATE" | "MINOR" | "NONE";
    calculatedRiskFactor: number; // 0.0 to 10.0
    detectedAtTimestamp: string;
  };
}

export interface ConsultantDecisionEntity extends SIGBaseNode {
  type: SIGEntityType.CONSULTANT_DECISION;
  properties: {
    decisionId: string;
    approvedStatus: "IMPLEMENTED" | "REJECTED" | "DEFERRED" | "MODIFIED";
    consultantSignatureHash: string; // Cryptographic stamp proving human validation
    consultantComments: string;
    timestamp: string;
  };
}

export interface RecommendationCandidateEntity extends SIGBaseNode {
  type: SIGEntityType.RECOMMENDATION_CANDIDATE;
  properties: {
    id: string;
    remedyTitle: string;
    actionDescription: string;
    materialRequirements?: string[];
    remedialMethod: "ELEMENT_BALANCE" | "GEOMETRICAL_BLOCK" | "PYRAMID_ENERGY" | "AERATION" | "COLOR_THERAPY";
    estimatedEfficacyScore: number; // 0.0 to 1.00
  };
}

export interface CaseStudyEntity extends SIGBaseNode {
  type: SIGEntityType.CASE_STUDY;
  properties: {
    id: string;
    projectTitle: string;
    problemBefore: string;
    interventionApplied: string;
    measuredOutcome: string;
    durationToResultsDays: number;
    isPublic: boolean;
  };
}

export interface PhotoEntity extends SIGBaseNode {
  type: SIGEntityType.PHOTO;
  properties: {
    url: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    compassHeadingDegrees?: number; // Compass orientation when photo was taken
    gpsCoordinates?: { lat: number; lng: number };
  };
}

export interface VideoEntity extends SIGBaseNode {
  type: SIGEntityType.VIDEO;
  properties: {
    url: string;
    fileName: string;
    durationSeconds: number;
    fileSizeBytes: number;
  };
}

export interface VoiceNoteEntity extends SIGBaseNode {
  type: SIGEntityType.VOICE_NOTE;
  properties: {
    audioUrl: string;
    fileName: string;
    durationSeconds: number;
    speechToTextTranscript?: string; // Auto-transcribed content indexed for searches
  };
}

export interface DocumentEntity extends SIGBaseNode {
  type: SIGEntityType.DOCUMENT;
  properties: {
    url: string;
    fileName: string;
    formatType: "PDF" | "DOCX" | "EXCEL" | "JSON";
    pagesCount?: number;
  };
}

export interface TimelineEventEntity extends SIGBaseNode {
  type: SIGEntityType.TIMELINE_EVENT;
  properties: {
    eventId: string;
    eventActionType: "OBJECT_ADDED" | "OBJECT_MOVED" | "RULE_VIOLATED" | "DECISION_LOGGED" | "REPORT_EXPORTED";
    userEmail: string;
    timestamp: string;
    summaryDescription: string;
    rollbackTransactionId?: string; // Allows transaction undoing at graph levels
  };
}

// Union type of all possible first-class nodes in SIG
export type SIGNode = 
  | ClientEntity 
  | PropertyEntity 
  | ProjectEntity 
  | DrawingEntity 
  | FloorEntity 
  | SpatialKnowledgeObjectEntity 
  | RuleEntity 
  | KnowledgePackEntity 
  | EvidenceEntity 
  | ObservationEntity 
  | ConsultantDecisionEntity 
  | RecommendationCandidateEntity 
  | CaseStudyEntity 
  | PhotoEntity 
  | VideoEntity 
  | VoiceNoteEntity 
  | DocumentEntity 
  | TimelineEventEntity;

// ============================================================================
// 5. GRAPH QUERY SCHEMAS & TRAVERSAL ARGUMENTS
// ============================================================================

export interface SIGQueryFilter {
  entityType?: SIGEntityType;
  propertyKey?: string;
  propertyValue?: any;
  lifecycleState?: "ACTIVE" | "ARCHIVED" | "DRAFT" | "DELETED";
}

export interface SIGTraversalOptions {
  direction: "OUTGOING" | "INCOMING" | "BOTH";
  maxDepth: number; // Prevent infinite memory allocation loops (max 10 by default)
  edgeTypes?: SIGRelationshipType[];
  targetNodeTypes?: SIGEntityType[];
}

/**
 * Result structure representing retrieved graph sub-networks.
 */
export interface SIGGraphQueryResult {
  nodes: SIGNode[];
  edges: SIGBaseEdge[];
  executionTimeMs: number;
}

// ============================================================================
// 6. SIG ENGINE SERVICE INTERFACES
// ============================================================================

/**
 * Validates transaction rules, schema structures, and multi-tenant constraints.
 */
export interface ISIGValidator {
  validateNode(node: SIGNode): { isValid: boolean; errors: string[] };
  validateEdge(edge: SIGBaseEdge, sourceNode: SIGNode, targetNode: SIGNode): { isValid: boolean; errors: string[] };
  verifyMultiTenantConstraint(tenantId: TenantID, entities: EntityID[]): Promise<boolean>;
}

/**
 * Graph Writer: Manages atomic transaction commits, revisions, and audits.
 */
export interface ISIGWriter {
  /**
   * Commits updates to the graph in a single atomic transaction transaction ID.
   */
  commitTransaction(
    tenantId: TenantID, 
    userId: string,
    nodesToWrite: SIGNode[], 
    edgesToWrite: SIGBaseEdge[]
  ): Promise<{ transactionId: TransactionID; success: boolean }>;

  /**
   * Performs an audit-level roll-back of a complete transaction.
   */
  rollbackTransaction(tenantId: TenantID, transactionId: TransactionID): Promise<boolean>;
}

/**
 * Graph Reader: Optimized for multi-hop graph traversals.
 */
export interface ISIGReader {
  /**
   * Direct fetch of a specific node version.
   */
  fetchNode(id: EntityID, version?: number): Promise<SIGNode>;

  /**
   * Traverses outward from a central pivot node to extract linked sub-graphs.
   * Leveraged by explanation models to rebuild visual justification pathways.
   */
  traverse(
    pivotId: EntityID, 
    options: SIGTraversalOptions
  ): Promise<SIGGraphQueryResult>;

  /**
   * Cypher/GraphQL-style semantic searches over flat key properties.
   */
  search(filters: SIGQueryFilter[]): Promise<SIGNode[]>;
}

/**
 * Graph Versioning and History Manager.
 */
export interface ISIGHistoryManager {
  getNodeHistory(id: EntityID): Promise<Array<{
    version: number;
    modifiedTimestamp: string;
    modifiedByUser: string;
    transactionId: TransactionID;
    changes: Record<string, { old: any; new: any }>;
  }>>;
}

// ============================================================================
// 7. CONCRETE SIG REFERENCE COORDINATOR
// ============================================================================

/**
 * Core Orchestrator for Spatial Intelligence Graph traversal.
 * Realizes complex reasoning traversals used by explainable decision workflows.
 */
export class SIGGraphCoordinator {
  private reader: ISIGReader;
  private writer: ISIGWriter;
  private validator: ISIGValidator;

  constructor(reader: ISIGReader, writer: ISIGWriter, validator: ISIGValidator) {
    this.reader = reader;
    this.writer = writer;
    this.validator = validator;
  }

  /**
   * Strategic Traversal Query: "Show complete reasoning chain for a spatial layout"
   * Pivot point: Floor -> SKO -> Observation -> Decision -> Recommendation -> Rule -> Evidence
   */
  public async getCompleteReasoningChain(
    floorId: EntityID,
    tenantId: TenantID
  ): Promise<SIGGraphQueryResult> {
    const trackingNodes: Record<string, SIGNode> = {};
    const trackingEdges: Record<string, SIGBaseEdge> = {};

    try {
      // 1. Load Floor Node
      const floorNode = await this.reader.fetchNode(floorId);
      if (floorNode.tenantId !== tenantId) {
        throw new Error("SECURE_ACCESS_VIOLATION: Multi-tenant boundary mismatch.");
      }
      trackingNodes[floorNode.id] = floorNode;

      // 2. Traversal 1: Floor -> CONTAINS -> SKO
      const skoResult = await this.reader.traverse(floorId, {
        direction: "OUTGOING",
        maxDepth: 1,
        edgeTypes: [SIGRelationshipType.CONTAINS],
        targetNodeTypes: [SIGEntityType.SPATIAL_KNOWLEDGE_OBJECT]
      });

      for (const node of skoResult.nodes) {
        trackingNodes[node.id] = node;
      }
      for (const edge of skoResult.edges) {
        trackingEdges[edge.id] = edge;
      }

      // 3. Traversal 2: Multi-hop trace from SKOs outwards to Recommendations, Decisions, Rules, and scripture Evidence
      const skos = skoResult.nodes;
      for (const sko of skos) {
        const reasoningSubGraph = await this.reader.traverse(sko.id, {
          direction: "BOTH", // Explores incoming Observations and outgoing Rules
          maxDepth: 5,
          edgeTypes: [
            SIGRelationshipType.REFERENCES,
            SIGRelationshipType.APPROVED,
            SIGRelationshipType.GENERATED,
            SIGRelationshipType.HAS_EVIDENCE,
            SIGRelationshipType.SUPPORTS
          ],
          targetNodeTypes: [
            SIGEntityType.OBSERVATION,
            SIGEntityType.CONSULTANT_DECISION,
            SIGEntityType.RECOMMENDATION_CANDIDATE,
            SIGEntityType.RULE,
            SIGEntityType.EVIDENCE
          ]
        });

        for (const node of reasoningSubGraph.nodes) {
          trackingNodes[node.id] = node;
        }
        for (const edge of reasoningSubGraph.edges) {
          trackingEdges[edge.id] = edge;
        }
      }

      return {
        nodes: Object.values(trackingNodes),
        edges: Object.values(trackingEdges),
        executionTimeMs: 0 // Mock telemetry placeholder
      };
    } catch (error: any) {
      console.error("SIG Reasoning Traversal Fail:", error);
      throw new Error(`SIG_TRAVERSAL_CRASH: ${error.message || error}`);
    }
  }
}
