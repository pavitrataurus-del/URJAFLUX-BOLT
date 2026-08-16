import { KnowledgeDomain } from '../reasoning/ReasoningTypes';

export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'FIELD_ENGINEER' | 'END_USER';

export type ConversationSessionStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type MessageSender = 'USER' | 'ASSISTANT' | 'SYSTEM';

export type IntentCategory =
  | 'KNOWLEDGE_QUERY'
  | 'PROPERTY_ANALYSIS'
  | 'RECOMMENDATION_EXPLANATION'
  | 'PROJECT_STATUS'
  | 'MONITORING_STATUS'
  | 'COMPLIANCE_QUERY'
  | 'MAINTENANCE_QUERY'
  | 'REPORT_REQUEST'
  | 'FOLLOW_UP'
  | 'GENERAL_CONSULTATION';

export type SuggestedActionType =
  | 'VIEW_RECOMMENDATION'
  | 'OPEN_EXECUTION_PROJECT'
  | 'VIEW_MONITORING_STATUS'
  | 'SCHEDULE_INSPECTION'
  | 'REVIEW_EVIDENCE'
  | 'GENERATE_REPORT';

export interface ISuggestedAction {
  actionId: string;
  label: string;
  actionType: SuggestedActionType;
  targetModule: 'Reasoning' | 'Execution' | 'Monitoring' | 'Vastu' | 'Chakra' | 'LalKitab' | 'Numerology' | 'Astrology' | 'Verification';
  payload?: Record<string, any>;
  description?: string;
}

export interface ICitation {
  citationId: string;
  domain: KnowledgeDomain;
  sourceBook: string;
  chapter?: string;
  verseOrShloka?: string;
  author?: string;
  reliabilityScore: number;
  canonicalRefId?: string;
  excerptText?: string;
}

export interface IExplanationStep {
  stepIndex: number;
  domain: KnowledgeDomain;
  title: string;
  description: string;
  contributingRuleOrEntity: string;
  confidenceContribution: number;
}

export interface IExplanationChain {
  explanationId: string;
  primaryDomain: KnowledgeDomain;
  contributingDomains: KnowledgeDomain[];
  overallConfidence: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C';
  steps: IExplanationStep[];
  rejectedAlternatives?: Array<{
    optionName: string;
    rejectionReason: string;
    domainConflict: KnowledgeDomain;
  }>;
}

export interface IConversationMessage {
  id: string;
  uuid: string;
  version: number;
  sessionId: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  intent?: IntentCategory;
  detectedKeywords?: string[];
  confidenceLevel?: number;
  confidenceGrade?: 'A+' | 'A' | 'B' | 'C';
  sourceDomains?: KnowledgeDomain[];
  citations?: ICitation[];
  explanationChain?: IExplanationChain;
  suggestedActions?: ISuggestedAction[];
  isInternalDebug?: boolean;
  metadata?: Record<string, any>;
}

export interface IUserProfileContext {
  userId: string;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  accessibleProjects: string[];
}

export interface IPropertyContextSnapshot {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  facingDirection: string;
  totalAreaSqFt: number;
  healthScore: number;
  complianceRating: number;
  activeSnapshotId: string;
}

export interface IProjectContextSnapshot {
  projectId: string;
  projectTitle: string;
  currentPhase: string;
  completionPercentage: number;
  activeTasksCount: number;
  assignedEngineer: string;
}

export interface IMonitoringContextSnapshot {
  activeAlertsCount: number;
  criticalAlertsCount: number;
  maintenancePriority: string;
  lastSnapshotTimestamp: string;
  sensorAnomaliesCount: number;
}

export interface IExecutionContextSnapshot {
  pendingChecklistsCount: number;
  verifiedEvidenceCount: number;
  delayedSlaTasksCount: number;
}

export interface IRecommendationContextSnapshot {
  totalRecommendations: number;
  criticalRemediesCount: number;
  topRecommendationTitle?: string;
}

export interface IKnowledgeContextSnapshot {
  ingestedDocumentsCount: number;
  verifiedCanonicalEntitiesCount: number;
  activeRulesCount: number;
}

export interface IConversationContext {
  contextId: string;
  updatedAt: string;
  userProfile: IUserProfileContext;
  propertyContext?: IPropertyContextSnapshot;
  projectContext?: IProjectContextSnapshot;
  monitoringContext?: IMonitoringContextSnapshot;
  executionContext?: IExecutionContextSnapshot;
  recommendationContext?: IRecommendationContextSnapshot;
  knowledgeContext?: IKnowledgeContextSnapshot;
}

export interface IConversationSession {
  sessionId: string;
  uuid: string;
  version: number;
  conversationTitle: string;
  status: ConversationSessionStatus;
  activeUserRole: UserRole;
  ownerId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  lastActiveTime: string;
  messageCount: number;
  primaryDomainContexts: KnowledgeDomain[];
  propertyId?: string;
  projectId?: string;
  contextSnapshot: IConversationContext;
}

export interface IConversationSummary {
  summaryId: string;
  sessionId: string;
  generatedAt: string;
  summaryText: string;
  keyTopics: string[];
  keyRecommendations: string[];
  resolvedQueries: number;
  openActionItems: string[];
}

export interface IUserIntent {
  intentCategory: IntentCategory;
  detectedKeywords: string[];
  targetEntityId?: string;
  targetDomain?: KnowledgeDomain;
  confidenceScore: number;
}

export interface IConsultationAuditLog {
  auditId: string;
  sessionId: string;
  messageId: string;
  userRole: UserRole;
  intent: IntentCategory;
  processingTimeMs: number;
  sourceDomains: KnowledgeDomain[];
  confidenceScore: number;
  timestamp: string;
}
