export enum AIProviderType {
  GEMINI = "google_gemini",
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  AZURE = "azure_openai",
  AWS_BEDROCK = "aws_bedrock",
  OLLAMA = "ollama",
  LOCAL = "local",
  HUGGINGFACE = "huggingface"
}

export enum ModelStatus {
  ACTIVE = "ACTIVE",
  DEPRECATED = "DEPRECATED",
  EXPERIMENTAL = "EXPERIMENTAL",
  INACTIVE = "INACTIVE"
}

export enum PromptApprovalStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum ExperimentType {
  AB_TEST = "AB_TEST",
  SHADOW = "SHADOW",
  CANARY = "CANARY"
}

export enum PolicyAction {
  ALLOW = "ALLOW",
  DENY = "DENY",
  FLAG = "FLAG",
  REQUIRE_APPROVAL = "REQUIRE_APPROVAL"
}

export interface BaseAuditEntity {
  id: string; // UUID
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: string; // Semantic version e.g. "1.0.0"
  status: string;
  tags: string[];
  metadata: Record<string, any>;
}

// Phase 1 Entities
export interface AIModel extends BaseAuditEntity {
  name: string;
  provider: AIProviderType;
  endpointUrl: string;
  capabilities: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
    functionCalling: boolean;
    structuredOutput: boolean;
    maxContextTokens: number;
  };
  performanceProfile: {
    latencyMs: number; // Avg latency
    accuracyScore: number; // Benchmark result 0-100
    avgThroughput: number; // Tokens per sec
  };
  costProfile: {
    costPerMillionInputTokens: number;
    costPerMillionOutputTokens: number;
  };
  availabilityStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
}

export interface ModelVersion extends BaseAuditEntity {
  modelId: string;
  releaseDate: string;
  changelog: string;
  isActive: boolean;
}

export interface PromptTemplate extends BaseAuditEntity {
  name: string;
  description: string;
  category: string;
  activeVersionId: string;
  variables: string[]; // Parsed template variables e.g. ["client_name", "date"]
  isApproved: boolean;
  approvalStatus: PromptApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export interface PromptVersion extends BaseAuditEntity {
  templateId: string;
  promptText: string;
  changeSummary: string;
  testCases: Record<string, string>[]; // Inputs -> Outputs tests
}

export interface AIProvider extends BaseAuditEntity {
  name: string;
  type: AIProviderType;
  config: {
    baseUrl?: string;
    apiKeyEnvName?: string;
    timeoutMs?: number;
    maxRetries?: number;
  };
  isHealthy: boolean;
  lastCheckedAt: string;
  errorCount: number;
}

export interface AIEndpoint extends BaseAuditEntity {
  providerId: string;
  modelId: string;
  url: string;
  isCustomUrl: boolean;
  headers: Record<string, string>;
}

export interface AIExperiment extends BaseAuditEntity {
  name: string;
  description: string;
  type: ExperimentType;
  baseModelId: string;
  variantModelId: string;
  trafficAllocation: number; // 0-100 percentage for variant
  active: boolean;
  metrics: {
    baseCount: number;
    variantCount: number;
    baseLatencyAvg: number;
    variantLatencyAvg: number;
    baseCostTotal: number;
    variantCostTotal: number;
    baseUserRatingAvg: number; // Human evaluation feedback
    variantUserRatingAvg: number;
  };
}

export interface EvaluationRun extends BaseAuditEntity {
  experimentId?: string;
  targetModelId: string;
  evaluatorModelId: string;
  datasetSize: number;
  qualityScores: {
    relevance: number; // 0-1
    safety: number; // 0-1
    conciseness: number; // 0-1
    factualAccuracy: number; // 0-1
  };
  findings: string[];
}

export interface Benchmark extends BaseAuditEntity {
  name: string;
  description: string;
  metricType: "LATENCY" | "ACCURACY" | "COST" | "SAFETY";
  results: {
    modelId: string;
    score: number;
    timestamp: string;
  }[];
}

export interface ModelRoute extends BaseAuditEntity {
  pattern: string; // e.g. "vastu:*" or "kundli:*"
  primaryModelId: string;
  fallbackModelId?: string;
  timeoutMs: number;
  maxRetries: number;
  loadBalanceWeights?: Record<string, number>; // modelId -> weight
}

export interface AIPolicy extends BaseAuditEntity {
  name: string;
  description: string;
  ruleType: "SAFETY" | "COST" | "RESTRICTION";
  action: PolicyAction;
  matchPattern?: string; // Regex or trigger word list
  maxMonthlyCostLimit?: number;
  isEnforced: boolean;
}

export interface TokenUsage {
  id: string;
  timestamp: string;
  modelId: string;
  provider: AIProviderType;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costInUsd: number;
  userId: string;
  department: string;
  contextDomain: string; // e.g. "DOMAIN-006:VastuReasoning"
}

export interface CostRecord {
  id: string;
  month: string; // "YYYY-MM"
  department: string;
  totalCost: number;
  tokenCount: number;
  budgetLimit: number;
}

export interface AIAuditRecord {
  id: string;
  timestamp: string;
  userId: string;
  action: string; // "PROMPT_DECRYPT", "PROMPT_ROLLBACK", "MODEL_DEPRECATION", "POLICY_ENFORCE"
  details: string;
  ipAddress?: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  justification?: string;
}
