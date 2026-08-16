/**
 * ============================================================================
 *               URJAFLUX AI OS — FOUNDATION LAYER 02
 *         ENTERPRISE RULE ENGINE FRAMEWORK (EREF) ARCHITECTURE
 * ============================================================================
 * 
 * This file defines the permanent, 20-year enterprise rule specification for
 * the URJAFLUX AI OS. It represents the core intellectual property (IP) and
 * data modeling schema that abstracts spatial and domain reasoning away from
 * specific frontend or AI implementation technologies.
 * 
 * DESIGN PRINCIPLES:
 * 1. UNIVERSE OF KNOWLEDGE: Agnostic to any single knowledge system (Vastu, 
 *    Feng Shui, Lal Kitab, Building Codes, Corporate/Environmental Standards).
 * 2. FIRST-CLASS OBJECTS: Rules are versioned, traceable, and fully audited.
 * 3. EXPLICIT EVIDENCE: Every rule evaluation must point to primary/secondary 
 *    textual, scientific, or historical scripture sources.
 * 4. CONFLICT-AUTHORITATIVE: Handles contradictions through priority and weight,
 *    never suppressing disagreement, but formalizing resolving steps.
 * 5. HUMAN-IN-THE-LOOP: Rules generate candidate assessments, leaving the final 
 *    clinical/architectural decision with the human consultant.
 * 
 * @scale Supporting 100,000+ concurrently loaded rules across clustered instances.
 * @compliance Enterprise SDK compatible.
 */

// ============================================================================
// 1. CORE TYPES & METADATA
// ============================================================================

export type RuleID = string;
export type RuleVersionString = string; // e.g. "2.4.1"
export type AuthorID = string;
export type ReviewerID = string;
export type TenantID = string;

/**
 * Priority of rule evaluation in execution queues.
 */
export enum RulePriority {
  CRITICAL = "CRITICAL", // Evaluated first, failures can halt assessment pipeline
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}

/**
 * Severity impact on the target space or entity if violated.
 */
export enum RuleSeverity {
  CATASTROPHIC = "CATASTROPHIC", // Vital threat (e.g., core element clashing, safety risk)
  MAJOR = "MAJOR",        // Significant disruption of energetic or structural integrity
  MODERATE = "MODERATE",  // Sub-optimal design configurations
  MINOR = "MINOR"         // Marginal aesthetic or secondary advice
}

/**
 * Lifecycle status of the rule definition itself.
 */
export enum RuleStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  DEPRECATED = "DEPRECATED",
  FUTURE = "FUTURE", // Staged for future enforcement dates
  SUSPENDED = "SUSPENDED"
}

/**
 * Multi-layer approval workflow status.
 */
export enum ApprovalStatus {
  DRAFTED = "DRAFTED",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

/**
 * Knowledge Systems supported by EREF.
 * Allows URJAFLUX to run multiple distinct rulesets on the same architectural asset.
 */
export type KnowledgeSystemType = 
  | "VASTU_SHASTRA"
  | "FENG_SHUI"
  | "LAL_KITAB"
  | "NUMEROLOGY"
  | "MUNICIPAL_BUILDING_CODE"
  | "CORPORATE_STANDARD"
  | "ENVIRONMENTAL_LEED_STANDARD"
  | "CUSTOM_KNOWLEDGE_BASE";

// ============================================================================
// 2. EVIDENCE & CITATION SYSTEM
// ============================================================================

/**
 * Complete citation framework validating the authority of a rule.
 * No rule may exist in production without associated evidence.
 */
export interface RuleEvidence {
  id: string;
  sourceType: "SCRIPTURE" | "BOOK" | "RESEARCH_PAPER" | "CASE_STUDY" | "INTERNAL_DECISION" | "EMPIRICAL_DATA";
  primarySource: string;   // e.g. "Mayamatam" or "IEEE Spatial Computing Journal"
  secondarySource?: string; // e.g. "Vastu Vidya translation by Dr. Shukla"
  bookTitle?: string;
  chapter?: string;
  verse?: string;         // e.g. "Chapter 12, Verse 4"
  researchPaperDoi?: string;
  authorOrTranslator: string;
  internalNotes?: string;
  confidenceScore: number; // 0.00 to 1.00 indicating authority reliability weight
}

// ============================================================================
// 3. RULE STRUCTURE & CONDITIONAL SCHEMAS
// ============================================================================

/**
 * Broad categories of spatial and environmental rules.
 */
export type RuleType =
  | "SPATIAL"       // Geometry, proportions, dimensional layouts (Aya calculations)
  | "DIRECTIONAL"   // Orientation relative to cardinals or intercardinals
  | "ELEMENT"       // Element balancing (Water, Fire, Earth, Air, Space)
  | "PLANETARY"     // Astral or cosmological correspondences (deities and energy nodes)
  | "OCCUPANCY"     // Usage mappings (Master Bed, Kitchen, Toilet placement)
  | "CONSTRUCTION"  // Materials, soil density, foundation depths, load distribution
  | "TEMPORAL"      // Muhurta, building ages, astronomical times
  | "ENVIRONMENTAL" // Natural ventilation, light channels, slope analysis, noise
  | "CUSTOM";       // Consultant or firm-specific overrides

/**
 * Target Scope of rule enforcement.
 */
export interface RuleScope {
  propertyType: ("VILLA" | "APARTMENT" | "COMMERCIAL" | "INDUSTRIAL" | "TEMPLE" | "LAND_PLOT" | "ALL")[];
  floorsAffected?: number[]; // Empty denotes all floors
  geographicalRegions?: string[]; // e.g., ["North-India", "Global"]
  occupantDemographics?: string[];
}

/**
 * Mathematical or boolean assertion conditions.
 * Modeled for abstract serializable AST (Abstract Syntax Tree) configurations.
 */
export interface RuleCondition {
  field: string;           // Target attribute (e.g. "occupancy.type", "geometry.orientation.offset")
  operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "LESS_THAN" | "CONTAINS" | "CLASHES_WITH" | "INTERSECTS" | "OUTSIDE_OF_SECTOR";
  value: any;              // Expected value or coordinates boundary set
  logicalGate?: "AND" | "OR" | "NOT";
  subConditions?: RuleCondition[]; // Recursive conditions support nested logic trees
}

/**
 * Exceptions defining circumstances under which the rule is bypassed.
 */
export interface RuleException {
  exceptionId: string;
  description: string;
  condition: RuleCondition;
  remedyMitigationRequired: boolean;
  alternativeRuleIdTrigger?: RuleID; // Diverts evaluation to another rule
}

// ============================================================================
// 4. RULE RELATIONSHIPS & CONFLICT ENGINE
// ============================================================================

export type RelationshipType =
  | "DEPENDS_ON"      // This rule requires prior evaluation & validation of target rule
  | "OVERRIDES"       // This rule completely supersedes target rule when active
  | "SUPPORTS"        // Multiplier effect: if both are met, composite confidence increases
  | "CONTRADICTS"      // Flags potential design disputes
  | "REFERENCES";     // Contextual connection without execution binding

/**
 * Expresses relationships between first-class rule objects.
 */
export interface RuleRelationship {
  sourceRuleId: RuleID;
  targetRuleId: RuleID;
  type: RelationshipType;
  strengthFactor: number; // 0.0 to 1.0 multiplier
  contextNotes?: string;
}

/**
 * Handles logic conflicts when rules disagree on a single spatial vector.
 */
export interface RuleConflictDefinition {
  ruleIdA: RuleID;
  ruleIdB: RuleID;
  conflictType: "DIRECTIONS_CLASH" | "ELEMENT_MUTUAL_DESTRUCTION" | "MUNICIPAL_VS_TRADITIONAL" | "WEIGHT_TIE";
  priorityResolutionStrategy: "HIGHER_PRIORITY_WINS" | "LATEST_VERSION_WINS" | "COMPROMISE_RATIO" | "MANDATORY_HUMAN_INTERVENTION";
  customResolutionScript?: string; // Sandboxed expression evaluated for resolve parameters
}

// ============================================================================
// 5. FIRST-CLASS ENTERPRISE RULE OBJECT
// ============================================================================

/**
 * The core Enterprise Rule Object. Fully normalized, serializable to JSON,
 * database-ready, and optimized for indexing in search layers or rule stores.
 */
export interface EnterpriseRule {
  // Identification & Classification
  id: RuleID;
  version: RuleVersionString;
  name: string;
  system: KnowledgeSystemType;
  type: RuleType;
  category: string;
  subcategory: string;
  tags: string[];

  // Critical Weights & Priorities
  priority: RulePriority;
  severity: RuleSeverity;
  inherentConfidence: number; // Inherent authority score (0.0 to 1.0)
  status: RuleStatus;

  // Audit Trails
  createdDate: string; // ISO 8601
  modifiedDate: string; // ISO 8601
  author: AuthorID;
  reviewer: ReviewerID;
  approvalStatus: ApprovalStatus;

  // Core Structural Logic
  scope: RuleScope;
  condition: RuleCondition;
  exceptions: RuleException[];
  dependencies: RuleID[];
  conflictRuleIds: RuleID[];

  // Citations & Knowledge
  evidence: RuleEvidence[];
  references: string[];
  examples?: string[];
  caseStudies?: { title: string; outcome: string; url?: string }[];
}

// ============================================================================
// 6. PIPELINE RUNTIME EXECUTION STRUCTURES
// ============================================================================

/**
 * The input model fed into the EREF engine. Represents the fully calibrated
 * properties, annotated vectors, compass orientations, and user intent.
 */
export interface RuleExecutionInput {
  propertyId: string;
  knowledgeSystems: KnowledgeSystemType[]; // Systems active for this run (e.g. Vastu + Codes)
  spatialModel: {
    dimensions: { width: number; height: number; scaleRatio: number };
    cardinalOrientationOffset: number; // North compass deviation
    zones: Array<{
      id: string;
      name: string;
      boundaryCoordinates: Array<{ x: number; y: number }>;
      element: "Water" | "Fire" | "Earth" | "Air" | "Space" | "None";
    }>;
    objects: Array<{
      id: string;
      type: string; // e.g., "bed", "toilet", "kitchen_counter"
      coordinates: { x: number; y: number; z?: number };
      rotation: number;
      dimensions?: { width: number; height: number; depth?: number };
    }>;
  };
  contextualMetadata?: Record<string, any>;
}

/**
 * Individual evaluations produced by a single rule run.
 */
export interface RuleEvaluationResult {
  ruleId: RuleID;
  ruleVersion: RuleVersionString;
  ruleName: string;
  system: KnowledgeSystemType;
  evaluationState: "TRIGGERED_MET" | "TRIGGERED_VIOLATED" | "BYPASSED_BY_SCOPE" | "BYPASSED_BY_EXCEPTION" | "FAILED_ERROR";
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  
  // Rule outputs — NEVER direct diagnoses, only structured diagnostic components
  observations: string[];
  scientificReasons: string[];
  associatedEvidence: RuleEvidence[];
  recommendationCandidates: Array<{
    remedyId: string;
    description: string;
    efficacyScore: number; // 0.0 to 1.0
    materialRequired?: string;
  }>;
  
  errorDetails?: string;
}

/**
 * Comprehensive resolution context after conflict resolvers have run.
 */
export interface ConsolidatedAssessment {
  assessmentId: string;
  timestamp: string;
  propertyId: string;
  overallComplianceScore: number; // 0 to 100
  evaluatedSystems: KnowledgeSystemType[];
  
  evaluations: RuleEvaluationResult[];
  
  unresolvedConflicts: Array<{
    rulesInvolved: RuleID[];
    description: string;
    suggestedHumanResolution: string;
  }>;
  
  resolvedConflicts: Array<{
    rulesInvolved: RuleID[];
    winningRuleId: RuleID;
    strategyApplied: string;
    justification: string;
  }>;

  // Historical audit hash ensuring non-repudiation
  integritySignature: string;
}

// ============================================================================
// 7. ENTERPRISE SERVICE INTERFACES (API STRATEGY)
// ============================================================================

/**
 * Handles bulk or selective asynchronous loading of rules from databases,
 * CDNs, or file structures, scaling to 100,000+ definitions effortlessly.
 */
export interface IRuleLoader {
  loadRuleById(id: RuleID, version?: RuleVersionString): Promise<EnterpriseRule>;
  loadActiveRuleset(system: KnowledgeSystemType, scope: RuleScope): Promise<EnterpriseRule[]>;
  searchRules(query: string, filterTags?: string[]): Promise<EnterpriseRule[]>;
  registerNewRule(rule: EnterpriseRule): Promise<boolean>;
}

/**
 * Ensures syntactic and logical sanity of any registered rule to prevent circular
 * dependencies, duplicate rule bindings, or recursive loops.
 */
export interface IRuleValidator {
  validateSyntax(rule: EnterpriseRule): { isValid: boolean; errors: string[] };
  detectCircularDependencies(rules: EnterpriseRule[]): { hasCycles: boolean; cyclePaths: string[][] };
  auditConflictRuleOverlap(rule: EnterpriseRule): Promise<RuleConflictDefinition[]>;
}

/**
 * The central thread-safe processing engine that matches target spatial objects
 * with active business rules.
 */
export interface IRuleExecutor {
  execute(input: RuleExecutionInput, ruleset: EnterpriseRule[]): Promise<RuleEvaluationResult[]>;
}

/**
 * Resolves rule contradictions through pre-configured formulas, priority matrices,
 * and user-supplied weight modifiers.
 */
export interface IRuleResolver {
  resolveAssessment(
    rawResults: RuleEvaluationResult[], 
    activeRuleset: EnterpriseRule[]
  ): Promise<ConsolidatedAssessment>;
}

/**
 * Full audit log manager tracking the evolution of spatial intelligence rules over decades.
 */
export interface IRuleHistoryManager {
  getVersionHistory(id: RuleID): Promise<Array<{
    version: RuleVersionString;
    modifiedDate: string;
    modifiedBy: AuthorID;
    approvalStatus: ApprovalStatus;
    changeLog: string;
  }>>;
  compareVersions(id: RuleID, versionA: RuleVersionString, versionB: RuleVersionString): Promise<{
    differences: Record<string, { valueA: any; valueB: any }>;
  }>;
  restoreVersion(id: RuleID, targetVersion: RuleVersionString, restoredBy: AuthorID): Promise<EnterpriseRule>;
}

// ============================================================================
// 8. CONCRETE UTILS & PIPELINE COORDINATOR (REFERENCE IMPLEMENTATION)
// ============================================================================

/**
 * Architectural Pipeline Coordinator demonstrating the precise flow:
 * Input -> Validation -> Condition Match -> Conflict Detection -> Priority Resolution -> Evidence Collection -> Final Consolidated Output.
 */
export class EREFPipelineCoordinator {
  private loader: IRuleLoader;
  private validator: IRuleValidator;
  private executor: IRuleExecutor;
  private resolver: IRuleResolver;

  constructor(
    loader: IRuleLoader,
    validator: IRuleValidator,
    executor: IRuleExecutor,
    resolver: IRuleResolver
  ) {
    this.loader = loader;
    this.validator = validator;
    this.executor = executor;
    this.resolver = resolver;
  }

  /**
   * Execute entire pipeline. Standardized for high-performance enterprise runs.
   */
  public async runSpatialAssessment(
    input: RuleExecutionInput
  ): Promise<ConsolidatedAssessment> {
    try {
      // 1. Loader Phase: Dynamically load rulesets for all requested systems
      const activeRules: EnterpriseRule[] = [];
      for (const system of input.knowledgeSystems) {
        const systemRules = await this.loader.loadActiveRuleset(system, {
          propertyType: ["ALL"], // Broad scope match
        });
        activeRules.push(...systemRules);
      }

      // 2. Validation & Cycle-Detection Safeguard
      for (const rule of activeRules) {
        const syntaxCheck = this.validator.validateSyntax(rule);
        if (!syntaxCheck.isValid) {
          throw new Error(`Rule integrity compilation error in rule ${rule.id}: ${syntaxCheck.errors.join(", ")}`);
        }
      }
      const cycleCheck = this.validator.detectCircularDependencies(activeRules);
      if (cycleCheck.hasCycles) {
        throw new Error(`Fatal execution loop detected in rule dependency graph: ${JSON.stringify(cycleCheck.cyclePaths)}`);
      }

      // 3. Execution Phase: Condition Matching & Output Generation
      const rawEvaluations = await this.executor.execute(input, activeRules);

      // 4. Resolution Phase: Conflict management, priority resolution & consolidation
      const consolidatedOutput = await this.resolver.resolveAssessment(rawEvaluations, activeRules);

      return consolidatedOutput;
    } catch (error: any) {
      console.error("EREF Execution Pipeline Failed:", error);
      throw new Error(`EREF_PIPELINE_CRASH: ${error.message || error}`);
    }
  }
}
