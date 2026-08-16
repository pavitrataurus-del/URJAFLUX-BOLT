/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 1 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Foundation & Architecture
 * 
 * UKATypes.ts: Core Domain Types, Assistant Identity, Roles, Modes, Context Models & Permissions.
 */

import { DecisionChain, PropertyHealthIndex } from "../engines/decision/types";
import { DoshaItem } from "../services/vastuAnalysisOrchestrator";

/**
 * Assistant Identity Definition
 */
export interface UKAAssistantIdentity {
  id: "UKA_OS_ASSISTANT";
  name: "UKA";
  fullName: "URJAFLUX Knowledge Assistant";
  title: "Professional Property Intelligence Assistant of URJAFLUX AI OS";
  systemRole: "Professional AI Advisor & Spatial Decision Intelligence Partner";
  version: "4.0.0-SPRINT4A";
}

export const UKA_IDENTITY: UKAAssistantIdentity = {
  id: "UKA_OS_ASSISTANT",
  name: "UKA",
  fullName: "URJAFLUX Knowledge Assistant",
  title: "Professional Property Intelligence Assistant of URJAFLUX AI OS",
  systemRole: "Professional AI Advisor & Spatial Decision Intelligence Partner",
  version: "4.0.0-SPRINT4A"
};

/**
 * User Roles
 */
export type UKAUserRole = "VISITOR" | "PAID_CUSTOMER" | "CONSULTANT" | "FOUNDER";

/**
 * Supported Consultation Modes
 */
export type UKAConsultationMode =
  | "PROPERTY_CONSULTATION"
  | "KNOWLEDGE_CONSULTATION"
  | "DECISION_EXPLANATION"
  | "CONSULTANT_REVIEW"
  | "FOUNDER_DIAGNOSTICS";

/**
 * Architectural Permission Matrix Model
 */
export interface UKAPermissionSet {
  role: UKAUserRole;
  canAccessRawRuleTraces: boolean;
  canAccessFounderDiagnostics: boolean;
  canModifyRemedies: boolean;
  canExportDossier: boolean;
  canViewFullDecisionChains: boolean;
  canAccessKnowledgeCanons: boolean;
  canViewPropertyHealthIndex: boolean;
  canOverrideZoneAssignments: boolean;
  allowedConsultationModes: UKAConsultationMode[];
}

/**
 * Property Context Model (Reusable context across OS engines)
 */
export interface UKAPropertyModel {
  id: string;
  name: string;
  propertyType: string; // e.g. Residential, Commercial, Industrial, Layout
  address?: string;
  totalAreaSqFt?: number;
  totalFloors?: number;
  facingDirection?: string;
  netNorthAngleDeg?: number;
}

export interface UKAClientModel {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tier: "FREE" | "PRO" | "ENTERPRISE" | "CONSULTANT";
  companyName?: string;
}

export interface UKAFloorModel {
  id: string;
  levelName: string;
  floorNumber: number;
  planImageUrl?: string;
  cadFileRef?: string;
  entitiesCount?: number;
}

export interface UKARecommendationItem {
  id: string;
  findingId: string;
  title: string;
  zone: string;
  remedy: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  expectedImpact: string;
  implementationEase: string;
  isCustomOverride?: boolean;
}

export interface UKAPropertyContext {
  currentProperty: UKAPropertyModel | null;
  currentClient: UKAClientModel | null;
  currentFloor: UKAFloorModel | null;
  currentEvaluation: PropertyHealthIndex | null;
  currentFindings: DecisionChain[];
  rawDoshas: DoshaItem[];
  currentRecommendations: UKARecommendationItem[];
  currentActiveModule:
    | "RECOGNITION"
    | "PROCEDURAL_RULES"
    | "DECISION_ENGINE"
    | "PROPERTY_HEALTH"
    | "CONSULTANT_SUITE"
    | "WORKSPACE"
    | string;
  updatedAt: string;
}

/**
 * Conversation Context Model (For future prompt integrations)
 */
export type UKAMessageRole = "user" | "assistant" | "system" | "tool";

export interface UKAMessage {
  id: string;
  role: UKAMessageRole;
  content: string;
  timestamp: string;
  consultationMode: UKAConsultationMode;
  metadata?: Record<string, unknown>;
}

export interface UKAConversationContext {
  sessionId: string;
  activeMode: UKAConsultationMode;
  messages: UKAMessage[];
  totalTokenUsageEstimate?: number;
  lastInteractionAt: string;
}

/**
 * Session Model
 */
export interface UKASessionModel {
  sessionId: string;
  userId: string;
  userRole: UKAUserRole;
  activeMode: UKAConsultationMode;
  createdAt: string;
  updatedAt: string;
  context: UKAPropertyContext;
  permissions: UKAPermissionSet;
  metadata: Record<string, unknown>;
}

/**
 * Sprint 4A Prompt 2 — Conversation Intelligence & Intent Types
 */
export type UKAUserIntent =
  | "PROPERTY_QUERY"
  | "KNOWLEDGE_QUERY"
  | "DECISION_QUERY"
  | "REPORT_QUERY"
  | "CONSULTANT_QUERY"
  | "DIAGNOSTIC_QUERY"
  | "MEMBERSHIP_QUERY"
  | "GENERAL_QUERY"
  | "UNKNOWN";

export type UKALanguage = "EN" | "HI" | "HINGLISH" | "OTHER";

export interface UKAIntentResult {
  intent: UKAUserIntent;
  confidence: number;
  matchedKeywords: string[];
  targetEntityHint: string | null;
  languageDetected: UKALanguage;
  rawInput: string;
}

export type UKAResolutionStatus =
  | "RESOLVED"
  | "AMBIGUOUS"
  | "CONTEXT_REQUIRED"
  | "NOT_FOUND";

export interface UKAResolvedContextTarget {
  status: UKAResolutionStatus;
  targetType: "PROPERTY" | "FLOOR" | "ENTITY" | "FINDING" | "RECOMMENDATION" | "REPORT" | "CLIENT" | "NONE";
  entityId?: string;
  entityName?: string;
  matchedFindingId?: string;
  candidates?: Array<{ id: string; name: string; type: string; zone?: string }>;
  missingContextFields?: string[];
  explanation: string;
}

export interface UKAGuardResult {
  allowed: boolean;
  reason: string;
  userRole: UKAUserRole;
  requestedIntent: UKAUserIntent;
  upgradeRequired?: boolean;
  suggestedRole?: UKAUserRole;
}

export type UKARouteDestination =
  | "RECOGNITION_ENGINE"
  | "DECISION_ENGINE"
  | "PROPERTY_HEALTH_ENGINE"
  | "KNOWLEDGE_FRAMEWORK"
  | "CONSULTANT_SUITE"
  | "WORKSPACE"
  | "MEMBERSHIP_MODULE"
  | "DIAGNOSTIC_MODULE";

export interface UKARoutingResult {
  destination: UKARouteDestination;
  intent: UKAUserIntent;
  guardResult: UKAGuardResult;
  resolvedTarget: UKAResolvedContextTarget;
  sessionId: string;
  userRole: UKAUserRole;
  executionMetadata: {
    timestamp: string;
    processingTimeMs: number;
    routingTrace: string[];
  };
}

/**
 * Sprint 4A Prompt 3 — Knowledge Planning, Retrieval & Response Assembly Types
 */
export type UKAKnowledgeRetrievalTarget =
  | "CURRENT_PROPERTY_CONTEXT"
  | "CURRENT_EVALUATION"
  | "DECISION_ENGINE"
  | "RECOGNITION_ENGINE"
  | "PROPERTY_HEALTH"
  | "APPROVED_KNOWLEDGE_FRAMEWORK"
  | "CONSULTANT_NOTES";

export interface UKAKnowledgePlan {
  planId: string;
  intent: UKAUserIntent;
  destination: UKARouteDestination;
  requiredRetrievalTargets: UKAKnowledgeRetrievalTarget[];
  priorityOrder: UKAKnowledgeRetrievalTarget[];
  targetFindingId?: string;
  targetEntityId?: string;
  targetFloorId?: string;
  evidenceRequirements: string[];
  permittedSources: string[];
  createdTimestamp: string;
}

export interface UKASourceAttribution {
  sourceName: string; // e.g., "Approved URJAFLUX Knowledge Framework", "Urjaflux Decision Engine"
  engineId: string;
  timestamp: string;
}

export interface UKAUnifiedEvidencePackage {
  packageId: string;
  propertyContextSummary?: string;
  evaluationSummary?: {
    overallScore: number;
    ratingTier: string;
    elementCount: number;
  };
  matchedFinding?: DecisionChain;
  recognitionEvidence?: {
    entityName: string;
    confidence: number;
    detectedBy: string;
    evidenceList: string[];
  };
  decisionEvidence?: {
    pipelineStagesCount: number;
    appliedRuleTitle?: string;
    severity?: string;
    scoreDeduction?: number;
  };
  knowledgeEvidence?: {
    canonAttribution: string; // "Approved URJAFLUX Knowledge Framework"
    verseReference?: string;
    coverageScore: number;
  };
  consultantNotes?: string[];
  evidenceCompletenessPercent: number;
  hasSufficientEvidence: boolean;
  sourceAttributions: UKASourceAttribution[];
}

export type UKAResponseType =
  | "PROPERTY_RESPONSE"
  | "KNOWLEDGE_RESPONSE"
  | "DECISION_RESPONSE"
  | "REPORT_RESPONSE"
  | "CONSULTANT_RESPONSE"
  | "DIAGNOSTIC_RESPONSE"
  | "MEMBERSHIP_RESPONSE";

export type UKAReviewStatus =
  | "DRAFT"
  | "PROFESSIONALLY_VERIFIED"
  | "PROFESSIONAL_REVIEW_RECOMMENDED";

export interface UKAResponseConfidence {
  recognitionConfidence: number | null;
  evaluationConfidence: number | null;
  knowledgeCoverage: number | null;
  evidenceCompleteness: number | null;
  overallConfidence: number | null;
}

export interface UKAStructuredResponseObject {
  responseId: string;
  responseType: UKAResponseType;
  status: "SUCCESS" | "INSUFFICIENT_EVIDENCE" | "ACCESS_DENIED" | "ERROR";
  observation: string;
  explanation: string;
  evidencePackage: UKAUnifiedEvidencePackage | null;
  recommendations: UKARecommendationItem[];
  decisionChain?: DecisionChain;
  suggestedNextSteps: string[];
  confidence: UKAResponseConfidence;
  professionalReviewStatus: UKAReviewStatus;
  metadata: {
    sessionId: string;
    userRole: UKAUserRole;
    activeMode: UKAConsultationMode;
    attributableCanonName: string; // Always "Approved URJAFLUX Knowledge Framework"
    assemblyTimeMs: number;
    commercialCapabilities: {
      multiPropertySupported: boolean;
      multiFloorSupported: boolean;
      beforeAfterComparisonSupported: boolean;
      lalKitabNumerologyIntegrationReady: boolean;
      whiteLabelModeSupported: boolean;
      founderDiagnosticsSupported: boolean;
      humanReviewWorkflowReady: boolean;
      explainableTraceable: boolean;
    };
  };
}

/**
 * Sprint 4A Prompt 4 — Professional Response Generation & Consultation Experience Types
 */
export interface UKAFormattedSections {
  observation: string;
  explanation: string;
  supportingEvidence: string;
  professionalRecommendation: string;
  expectedBenefit: string;
  suggestedNextSteps: string[];
  professionalReviewStatus: string;
}

export interface UKAFollowUpAction {
  label: string;
  actionQuery: string;
  category: "REMEDY" | "EVALUATION" | "COMPARISON" | "CANON" | "DIAGNOSTIC";
}

export interface UKAFounderAuditPackage {
  modulesConsulted: string[];
  retrievalSequence: string[];
  evidenceSourcesUsed: string[];
  missingEvidence: string[];
  confidenceBreakdown: UKAResponseConfidence;
  permissionChecks: {
    role: UKAUserRole;
    allowed: boolean;
    reason?: string;
  };
  processingDurationMs: number;
}

export interface ProfessionalConsultationResult {
  responseId: string;
  publicResponseText: string;
  structuredSections: UKAFormattedSections;
  followUpActions: UKAFollowUpAction[];
  isMembershipGated: boolean;
  membershipGatingNotice?: string;
  founderAuditPackage?: UKAFounderAuditPackage;
}

/**
 * Sprint 4A Prompt 5 — Conversation State Management & Consultation Memory Engine Types
 */
export type UKAConsultationState =
  | "INITIAL"
  | "PROPERTY_SELECTED"
  | "ENTITY_SELECTED"
  | "CONSULTATION_ACTIVE"
  | "FOLLOW_UP"
  | "COMPARISON"
  | "REPORT_DISCUSSION"
  | "COMPLETED";

export type UKAConsultationStyle =
  | "PROFESSIONAL_CONSULTANT"
  | "SIMPLE_HOMEOWNER"
  | "TRADITIONAL_SCHOLAR"
  | "BUILDER"
  | "ARCHITECT"
  | "FOUNDER";

export type UKAMemoryScope = "SHORT_LIVED" | "SESSION_LONG" | "LONG_LIVED" | "TEMPORARY";

export interface UKAMemoryPolicy {
  scope: UKAMemoryScope;
  ttlSeconds?: number;
}

export interface UKAConsultationRecord {
  recordId: string;
  timestamp: string;
  userQuestion: string;
  intent: string;
  targetType: string;
  targetId?: string;
  evidenceUsed: string[];
  recommendationGiven?: string;
  outcomeStatus: string;
  responseId: string;
}

export interface UKAConsultationContextMemory {
  sessionId: string;
  userRole: UKAUserRole;
  currentPropertyId?: string;
  currentPropertyName?: string;
  currentFloorId?: string;
  currentFloorName?: string;
  currentEntityId?: string;
  currentEntityName?: string;
  currentFindingId?: string;
  currentFinding?: any;
  currentRecommendation?: any;
  currentDecision?: any;
  currentTopic?: string;
  currentModule?: string;
  selectedLanguage: UKALanguage;
  consultationStyle: UKAConsultationStyle;
  activeState: UKAConsultationState;
  visitorUsage: {
    questionsUsed: number;
    maxFreeQuestions: number;
    gatingPromptDisplayed: boolean;
  };
  founderDiagnostics?: UKAFounderAuditPackage;
  lastUpdatedTimestamp: string;
}

export interface UKAMemoryPersistenceAdapter {
  saveSessionMemory(memory: UKAConsultationContextMemory): Promise<void>;
  loadSessionMemory(sessionId: string): Promise<UKAConsultationContextMemory | null>;
  appendHistoryRecord(sessionId: string, record: UKAConsultationRecord): Promise<void>;
  loadHistory(sessionId: string): Promise<UKAConsultationRecord[]>;
}



