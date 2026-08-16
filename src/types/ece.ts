/**
 * ============================================================================
 *               URJAFLUX AI OS — FOUNDATION LAYER 04
 *               EVIDENCE & CITATION ENGINE (ECE) SCHEMAS
 * ============================================================================
 * 
 * This file specifies the permanent, enterprise-grade trust ontology for the
 * URJAFLUX AI OS Evidence & Citation Engine (ECE). The ECE forms the formal trust
 * boundary of the spatial computing platform—ensuring that every automated,
 * semi-automated, or human decision can be traceably audited back to primary
 * classical texts, empirical research, peer-reviewed journals, or validated case studies.
 * 
 * DESIGN PHILOSOPHY:
 * 1. SCIENTIFIC & CLASSICAL DUALITY: Seamlessly links ancient sutras and verses
 *    with contemporary architectural codes, environmental research, and empirical data.
 * 2. STRUCTURAL TRACEABILITY: Supports deep traversal pipelines answering:
 *    "Why was this rule executed, which verse supports it, in which translation, and what is its confidence?"
 * 3. EXPLAINABILITY DECOUPLING: Rather than using speculative, opaque generative AI,
 *    this layer maps explicit semantic relations that can be traversed deterministically.
 * 4. SECURE AUDITING: Tracks the full history of sources, translations, and translations' mergers over decades.
 * 
 * @scale Supporting 100,000+ classical scriptures, commentaries, codes, and digital media attachments.
 * @compatibility Integrates directly with EREF (rules.ts), RPE (rulePacks.ts), and SIG (sig.ts).
 */

import { 
  RuleID, 
  RuleVersionString, 
  TenantID,
  AuthorID,
  ReviewerID,
  ApprovalStatus,
  KnowledgeSystemType
} from "./rules";

import { RulePackID } from "./rulePacks";
import { EntityID } from "./sig";

export type EvidenceID = string;
export type SourceID = string;
export type CitationID = string;
export type LanguageCode = string; // ISO 639-1 or 639-2 codes (e.g., "sa", "hi", "en", "de")

// ============================================================================
// 1. EVIDENCE SYSTEM CLASSIFICATIONS
// ============================================================================

/**
 * Categorization of evidence types supported in URJAFLUX.
 */
export enum EvidenceType {
  CLASSICAL_SCRIPTURE = "CLASSICAL_SCRIPTURE", // Primary historic texts (e.g., Mayamatam, Samarangana Sutradhara)
  BOOK = "BOOK",                               // Modern translations or independent textbooks
  COMMENTARY = "COMMENTARY",                   // Critical reviews or notes on classic texts by recognized pundits
  RESEARCH_PAPER = "RESEARCH_PAPER",           // Contemporary peer-reviewed studies (e.g., environmental physics, magnetics)
  JOURNAL_ARTICLE = "JOURNAL_ARTICLE",         // Shorter serial papers
  GOVERNMENT_STANDARD = "GOVERNMENT_STANDARD", // Civic zoning, seismic safety layouts
  BUILDING_CODE = "BUILDING_CODE",             // Municipal regulations (e.g., IBC, NBC India)
  CASE_STUDY = "CASE_STUDY",                   // Empirically tracked interventions and spatial remedies
  EXPERT_OPINION = "EXPERT_OPINION",           // Attested reviews from grandmasters or senior spatial engineers
  INTERNAL_CONSULTANT_NOTE = "INTERNAL_CONSULTANT_NOTE", // Proprietary institutional lessons
  TRAINING_MATERIAL = "TRAINING_MATERIAL",     // Certified educational modules
  VIDEO = "VIDEO",                             // Audiovisual site records or master lectures
  PHOTO = "PHOTO",                             // Graphical visual proofs or sensor telemetry photographs
  FIELD_OBSERVATION = "FIELD_OBSERVATION",     // Sensor logs, structural surveyor readouts
  FUTURE_AI_EVIDENCE = "FUTURE_AI_EVIDENCE"     // Machine-inferred statistical patterns (flagged as experimental)
}

/**
 * Strict quality control states ensuring source reliability across the ecosystem.
 */
export enum EvidenceQualityStatus {
  DRAFT = "DRAFT",             // Staged, awaiting validation checks
  VERIFIED = "VERIFIED",       // Approved and confirmed by standard reviewers
  CERTIFIED = "CERTIFIED",     // Verified and endorsed by institutional boards/partners
  DEPRECATED = "DEPRECATED",   // Superseded by modern editions or scientific corrections
  EXPERIMENTAL = "EXPERIMENTAL", // Undergoing validation in isolated testing sites
  REJECTED = "REJECTED"        // Disproven or flagged as non-conforming source material
}

// ============================================================================
// 2. THE CHRONICLE OF EVIDENCE (THE CORE ENTITY)
// ============================================================================

/**
 * First-class enterprise object representing verified, audited citation materials.
 */
export interface EnterpriseEvidence {
  id: EvidenceID;
  version: number; // Monotonically increasing revision version
  title: string;
  type: EvidenceType;
  qualityStatus: EvidenceQualityStatus;
  
  // Scoring metadata used by confidence engines
  confidenceScore: number; // Aggregated score 0.00 to 1.00 (calculated based on trust matrices)
  
  // Publisher & Academic metadata
  publisher: string;
  author: AuthorID;
  reviewer: ReviewerID;
  approvalStatus: ApprovalStatus;
  
  primaryLanguage: LanguageCode; // e.g., "sa" (Sanskrit), "zh" (Chinese)
  supportedTranslations: LanguageCode[]; // Locales available in translation tables
  
  createdDate: string; // ISO 8601
  updatedDate: string; // ISO 8601
  
  // Inner textual payload or asset links
  payload: {
    excerptPlaintext: string;      // The exact raw verse/standard paragraph in original language
    excerptTranslationEnglish: string; // Normalized English translation
    originalScriptQuote?: string; // Original non-romanized characters (Devanagari, Hanzi, etc.)
    mediaUrl?: string;            // S3/Cloud Storage link if this links to a photo/video/document
    attachmentMimeType?: string;
  };
  
  tags: string[];
}

// ============================================================================
// 3. CITATION MODEL (LOCATIVE REFERENCE SCHEMA)
// ============================================================================

/**
 * Granular coordinates inside a book, digital record, or physical standard.
 */
export interface ECECitation {
  id: CitationID;
  evidenceId: EvidenceID;
  sourceTitle: string; // e.g. "Brihat Samhita" or "Vastu Shastra Handbook"
  edition: string;     // e.g. "Third revised edition"
  publicationYear: number;
  
  // Navigational indexes
  page?: string;
  chapter?: string;
  verse?: string;      // e.g. "Sutra 14"
  paragraph?: string;
  lineRange?: string;  // e.g. "Lines 3-6"
  
  // Identifiers
  isbn?: string;
  doi?: string;        // Digital Object Identifier for academic research papers
  url?: string;        // Interactive direct hyperlink to reference database/digital library
  
  // Translation attribution
  translator?: string;
  originalLanguage: LanguageCode;
  translatedLanguage: LanguageCode;
}

// ============================================================================
// 4. RELATIONSHIPS & THE EVIDENCE GRAPH (ECE GRAPH INTEGRATION)
// ============================================================================

export enum EvidenceRelationshipType {
  SUPPORTS = "SUPPORTS",                 // Evidence matches the exact instruction of the Rule
  CONTRADICTS = "CONTRADICTS",           // Evidence describes a directly opposite outcome/guideline
  STRENGTHENS = "STRENGTHENS",           // Evidence corroborates another rule/evidence pair, heightening confidence
  WEAKENS = "WEAKENS",                   // Evidence raises edge cases or reduces applicability weights
  REFERENCES = "REFERENCES",             // Cross-citation between sources (Evidence A references Evidence B)
  BELONGS_TO = "BELONGS_TO",             // Evidence is bundled inside an active commercial Rule/Knowledge Pack
  ATTACHED_TO = "ATTACHED_TO"            // Evidence serves as the evidentiary proof of a physical Case Study
}

/**
 * Strongly typed relationship edges within the trust engine.
 */
export interface EvidenceRelationship {
  id: string;
  sourceId: EvidenceID;
  targetId: EvidenceID | RuleID | RulePackID | EntityID; // Can connect to Rules, Packs, Case Studies, or general SKOs
  type: EvidenceRelationshipType;
  strengthFactor: number; // 0.0 to 1.0 modifier representing correlation significance
  tenantId: TenantID;
  justificationNotes?: string;
}

// ============================================================================
// 5. EXPLAINABLE CONFIDENCE MODEL
// ============================================================================

/**
 * Multi-criteria weight structure. Ensures complete visibility into how a
 * rule's diagnostic confidence is automatically computed—avoiding opaque bias.
 */
export interface EvidenceConfidenceCriteria {
  sourceAuthority: number;       // Trust level of source (Classical Scripture: 0.95, Blog/Unverified Expert: 0.20)
  isPeerReviewed: boolean;       // Standard academic journals or master committee clearance
  peerReviewMultiplier: number;  // Multiplier for peer review (e.g. 1.2x)
  supportingSourcesCount: number; // Direct citations validating this rule (more citations = higher confidence)
  fieldValidationYears: number;  // Time elapsed in empirical commercial usage
  consultantConsensusScore: number; // Normalized agreement (0.00 to 1.00) from practitioner panels
  historicalAccuracyScore: number; // Accuracy tracked in active case study outcomes
  empiricalResearchWeight: number; // Scientific validation scoring (Leed Standards, physical sensor audits)
}

// ============================================================================
// 6. VERSIONING & EVOLUTION SCHEMA
// ============================================================================

export interface EvidenceVersionEntry {
  version: number;
  modifiedTimestamp: string;
  modifiedBy: AuthorID;
  status: EvidenceQualityStatus;
  changeSummary: string;
  
  // Revision linkages (merges, deprecation routing)
  supersededByVersion?: number;
  alternativeEvidenceId?: EvidenceID; // Route query to another evidence object if this is deprecated
}

export interface EvidenceHistoryLog {
  evidenceId: EvidenceID;
  versions: EvidenceVersionEntry[];
  mergeHistory: Array<{
    timestamp: string;
    mergedFromEvidenceId: EvidenceID;
    reconciledBy: AuthorID;
    reason: string;
  }>;
}

// ============================================================================
// 7. CORE SERVICE INTERFACES (ECE ENGINE ENDPOINTS)
// ============================================================================

/**
 * Handles bulk query and asset loader from secure databases or content registries.
 */
export interface IEvidenceLoader {
  fetchEvidenceById(id: EvidenceID, version?: number): Promise<EnterpriseEvidence>;
  queryEvidenceByTags(tags: string[]): Promise<EnterpriseEvidence[]>;
  loadActiveEvidentiaryGraph(packId: RulePackID): Promise<EnterpriseEvidence[]>;
}

/**
 * Matches rules against supporting scripture chapters/verses and validates the bibliographic schema.
 */
export interface ICitationResolver {
  resolveCitation(citationId: CitationID): Promise<ECECitation>;
  getBibliographicReferenceLine(citationId: CitationID): Promise<string>;
}

/**
 * Evaluates raw citation metadata against empirical scores to compute clean, 
 * un-biased confidence weights for rule evaluations.
 */
export interface IConfidenceCalculator {
  calculateConfidence(
    evidence: EnterpriseEvidence, 
    criteria: EvidenceConfidenceCriteria
  ): number; // Returns float 0.00 to 1.00
}

/**
 * Structural validation framework ensuring schema syntax compliance.
 */
export interface IEvidenceValidator {
  validateEvidenceStructure(evidence: EnterpriseEvidence): { isValid: boolean; errors: string[] };
}

/**
 * Navigates topological relationships in the trust network.
 */
export interface IEvidenceGraphService {
  /**
   * Traverse out from a specific Rule to retrieve all justifying evidence objects.
   */
  getEvidenceForRule(ruleId: RuleID): Promise<EnterpriseEvidence[]>;

  /**
   * Traverse backwards: find all Rules supported or contradicted by this Evidence.
   */
  getAssociatedRules(evidenceId: EvidenceID): Promise<Array<{ ruleId: RuleID; relationship: EvidenceRelationshipType }>>;
}

// ============================================================================
// 8. EVIDENCE & CITATION COORDINATOR (REFERENCE IMPLEMENTATION)
// ============================================================================

/**
 * Orchestrator demonstrating the ECE pipeline:
 * Load Evidence -> Resolve Citations -> Calculate Weighted Confidence -> Audit Integrity.
 */
export class ECEPipelineCoordinator {
  private loader: IEvidenceLoader;
  private resolver: ICitationResolver;
  private calculator: IConfidenceCalculator;
  private validator: IEvidenceValidator;
  private graphService: IEvidenceGraphService;

  constructor(
    loader: IEvidenceLoader,
    resolver: ICitationResolver,
    calculator: IConfidenceCalculator,
    validator: IEvidenceValidator,
    graphService: IEvidenceGraphService
  ) {
    this.loader = loader;
    this.resolver = resolver;
    this.calculator = calculator;
    this.validator = validator;
    this.graphService = graphService;
  }

  /**
   * Queries the ECE to retrieve detailed evidence explanations and computed
   * confidence factors for a given Rule assessment outcome.
   * Enables clean "Why was this rule flagged?" tooltips in enterprise frontends.
   */
  public async generateTrustVerificationReport(
    ruleId: RuleID,
    confidenceInputs: EvidenceConfidenceCriteria
  ): Promise<Array<{
    evidence: EnterpriseEvidence;
    formattedCitation: string;
    computedConfidence: number;
    relationToRule: EvidenceRelationshipType;
  }>> {
    try {
      // 1. Fetch all associated evidence linked to this rule via graph traversal
      const evidenceList = await this.graphService.getEvidenceForRule(ruleId);
      const reportEntries: Array<{
        evidence: EnterpriseEvidence;
        formattedCitation: string;
        computedConfidence: number;
        relationToRule: EvidenceRelationshipType;
      }> = [];

      for (const evidence of evidenceList) {
        // 2. Schema integrity validation
        const syntaxCheck = this.validator.validateEvidenceStructure(evidence);
        if (!syntaxCheck.isValid) {
          console.warn(`[ECE Warning] Evidence integrity check failed for ${evidence.id}: ${syntaxCheck.errors.join(", ")}`);
          continue; // Skip corrupted references
        }

        // 3. Dynamic Citation string formulation (Pulls edition, chapters, etc.)
        const relationships = await this.graphService.getAssociatedRules(evidence.id);
        const activeRel = relationships.find(r => r.ruleId === ruleId);
        const relationType = activeRel ? activeRel.relationship : EvidenceRelationshipType.SUPPORTS;

        // Fetch citation link
        const formattedLine = `[ECE Citation #${evidence.id}] ${evidence.title}, Authored by: ${evidence.author}. Publisher: ${evidence.publisher}`;

        // 4. Calculate dynamic confidence multiplier based on the multi-criteria metrics input
        const resolvedConfidence = this.calculator.calculateConfidence(evidence, confidenceInputs);

        reportEntries.push({
          evidence,
          formattedCitation: formattedLine,
          computedConfidence: resolvedConfidence,
          relationToRule: relationType
        });
      }

      return reportEntries.sort((a, b) => b.computedConfidence - a.computedConfidence);
    } catch (error: any) {
      console.error("ECE Trust Report Generation Failed:", error);
      throw new Error(`ECE_VERIFICATION_REPORT_CRASH: ${error.message || error}`);
    }
  }
}
