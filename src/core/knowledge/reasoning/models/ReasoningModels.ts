import { IConfidenceScores, IEvidenceReference } from "../../decision_trace";

export enum RecommendationStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NEEDS_REVISION = "NEEDS_REVISION",
  ARCHIVED = "ARCHIVED"
}

export enum RecommendationPriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}

export interface IRecommendation {
  id: string;
  priority: RecommendationPriority;
  category: string;
  description: string;
  affectedObjects: string[];
  evidenceReferences: IEvidenceReference[];
  knowledgeSources: string[];
  confidence: IConfidenceScores;
  expertsResponsible: string[];
  decisionTraceId: string;
  status: RecommendationStatus;
  version: string;
  metadata?: Record<string, any>;
}

export interface IConflictRecord {
  id: string;
  recommendationIds: string[];
  description: string;
  resolutionStrategy?: string;
  resolved: boolean;
  resolutionNotes?: string;
  timestamp: number;
}

export interface IHumanReviewRecord {
  id: string;
  recommendationId: string;
  reviewer: string;
  status: RecommendationStatus;
  comments: string;
  timestamp: number;
}

export interface IReasoningContext {
  twinId: string;
  projectId: string;
  namespace: string;
  expertsToExecute: string[];
  constraints?: Record<string, any>;
}

export interface IExpertExecutionResult {
  expertId: string;
  status: "SUCCESS" | "FAILED" | "TIMEOUT";
  recommendations: IRecommendation[];
  executionTimeMs: number;
  error?: string;
}
