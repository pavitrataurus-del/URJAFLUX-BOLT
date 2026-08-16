export type AgentId = 
  | "AGENT_SPATIAL_ANALYSIS"
  | "AGENT_KNOWLEDGE"
  | "AGENT_COMPLIANCE"
  | "AGENT_REPORT_GENERATION"
  | "AGENT_DIGITAL_TWIN"
  | "AGENT_WORKFLOW_AUTOMATION"
  | "AGENT_CUSTOMER_SUCCESS"
  | "AGENT_DEPLOYMENT_ADVISOR"
  | "AGENT_PLUGIN_ADVISOR"
  | "AGENT_OPERATIONS";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "QUEUED" | "PLANNING" | "AWAITING_APPROVAL" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  requiredPermission: string;
  inputTypes: string[];
  outputTypes: string[];
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  title: string;
  category: "ANALYTICAL font" | "COGNITIVE" | "GOVERNANCE" | "OPERATIONAL" | "AUTONOMOUS";
  capabilities: AgentCapability[];
  permissions: string[];
  inputs: string[];
  outputs: string[];
  dependencies: AgentId[];
  status: "ONLINE" | "BUSY" | "IDLE" | "MAINTENANCE";
  healthScore: number;
  totalExecutions: number;
  successRate: number;
}

export interface TaskExecutionLog {
  timestamp: string;
  stepName: string;
  agentId?: AgentId;
  status: "SUCCESS" | "WARNING" | "ERROR" | "INFO";
  message: string;
  details?: Record<string, any>;
}

export interface AiTask {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  primaryAgentId: AgentId;
  collaboratingAgentIds: AgentId[];
  riskLevel: RiskLevel;
  requiresHumanApproval: boolean;
  approvalRequestId?: string;
  dependencies: string[]; // parent task IDs
  inputContext: Record<string, any>;
  outputResult?: {
    summary: string;
    explanation: string;
    citations: string[];
    confidenceScore: number; // 0 - 100
    artifactsGenerated?: string[];
  };
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executionLogs: TaskExecutionLog[];
}

export type ApprovalAction = "APPROVE" | "REJECT" | "DELEGATE" | "ESCALATE";

export interface HumanApprovalRequest {
  id: string;
  taskId: string;
  tenantId: string;
  actionTitle: string;
  requestorAgentId: AgentId;
  riskLevel: RiskLevel;
  riskDetails: string;
  requiredRole: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DELEGATED" | "ESCALATED" | "EXPIRED";
  assignedToUser: string;
  timeoutMinutes: number;
  createdAt: string;
  resolvedAt?: string;
  decisionBy?: string;
  decisionAction?: ApprovalAction;
  decisionComment?: string;
  auditTrail: {
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }[];
}

export interface ProjectMemoryItem {
  id: string;
  tenantId: string;
  key: string;
  category: "SPATIAL" | "TWIN" | "DECISION" | "PREFERENCE" | "KNOWLEDGE_REF";
  content: string;
  citations?: string[];
  confidence: number;
  createdTime: string;
  lastAccessedTime: string;
  ttlDays: number;
}

export interface ConversationContext {
  sessionId: string;
  tenantId: string;
  userId: string;
  workingSummary: string;
  activeTopic: string;
  lastUpdated: string;
  referencedKnowledgeIds: string[];
}

export interface ExecutionPolicy {
  id: string;
  tenantId: string;
  name: string;
  category: "SECURITY" | "RISK" | "APPROVAL" | "COMPLIANCE";
  riskLevel: RiskLevel;
  condition: string;
  actionRequired: "ALLOW" | "REQUIRE_APPROVAL" | "BLOCK";
  approvalTimeoutMinutes: number;
  autoEscalateOnTimeout: boolean;
  active: boolean;
}

export type ModelProvider = "GEMINI" | "OPENAI" | "LOCAL_LLM" | "FUTURE_ENTERPRISE";

export interface ModelRouteConfig {
  id: string;
  provider: ModelProvider;
  modelName: string;
  capabilityMatch: string[];
  costPer1kTokensUsd: number;
  latencyMs: number;
  healthStatus: "HEALTHY" | "DEGRADED" | "OFFLINE";
  isFallback: boolean;
  isExternalDependency: boolean;
}

export interface ReasoningPipelineStep {
  stepNumber: number;
  stepName: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";
  agentInvolved?: AgentId;
  outputSummary?: string;
  citationsUsed?: string[];
}

export interface ScheduledAiTask {
  id: string;
  tenantId: string;
  title: string;
  cronExpression: string;
  targetAgentId: AgentId;
  category: "COMPLIANCE_SWEEP" | "TWIN_MONITOR" | "KNOWLEDGE_SYNC" | "HEALTH_CHECK";
  lastRunTimestamp?: string;
  nextRunTimestamp: string;
  enabled: boolean;
  status: "IDLE" | "RUNNING" | "PAUSED";
}

export interface AgentObservabilityMetrics {
  totalTasksExecuted: number;
  activeQueueLength: number;
  avgTaskLatencyMs: number;
  avgApprovalLatencyMinutes: number;
  failureRatePercentage: number;
  policyViolationsPrevented: number;
  estimatedMonthlyCostUsd: number;
}

export type DeploymentClassification = "VALIDATED" | "REQUIRES_EXTERNAL_SERVICES" | "FUTURE_ENHANCEMENT";
