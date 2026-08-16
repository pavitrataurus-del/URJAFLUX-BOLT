// Enterprise Integration & Automation Platform Domain Types
// Covers Modules 1 through 15 for URJAFLUX AI OS

// ==========================================
// MODULE 1 & 2: PLUGIN SDK & RUNTIME
// ==========================================

export type PluginPermission =
  | "READ_PROJECTS"
  | "WRITE_PROJECTS"
  | "EXECUTE_VASTU_RULES"
  | "READ_KNOWLEDGE"
  | "WRITE_KNOWLEDGE"
  | "SEND_WEBHOOKS"
  | "ACCESS_STORAGE"
  | "CALL_EXTERNAL_API";

export type PluginLifecycleStatus =
  | "UNINSTALLED"
  | "INSTALLING"
  | "DISABLED"
  | "ACTIVE"
  | "CRASHED"
  | "ERROR";

export type ExtensionPointType =
  | "UI_HEADER_ACTION"
  | "WORKFLOW_CUSTOM_NODE"
  | "REPORT_EXPORTER_HOOK"
  | "DATA_TRANSFORMER_HOOK"
  | "CAD_CANVAS_OVERLAY";

export interface PluginExtensionPoint {
  id: string;
  type: ExtensionPointType;
  title: string;
  handlerFnName: string;
}

export interface PluginSandboxConfig {
  memoryLimitMb: number;
  cpuQuotaPercent: number;
  timeoutMs: number;
  allowNetworkAccess: boolean;
}

export interface PluginManifest {
  id: string; // e.g. "com.urjaflux.solar-vastu-optimizer"
  name: string;
  version: string; // e.g. "1.2.0"
  publisher: string;
  description: string;
  entryPoint: string;
  minOsVersion: string;
  permissions: PluginPermission[];
  extensionPoints: PluginExtensionPoint[];
  sandboxConfig: PluginSandboxConfig;
  dependencies?: Record<string, string>; // pluginId -> minVersion
  iconUrl?: string;
  signedChecksum?: string;
}

export interface PluginRuntimeInstance {
  manifest: PluginManifest;
  status: PluginLifecycleStatus;
  installedAt: string;
  updatedAt: string;
  memoryUsageMb: number;
  crashCount: number;
  healthStatus: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  lastErrorMessage?: string;
}

// ==========================================
// MODULE 3: EVENT BUS
// ==========================================

export type EventPriority = "HIGH" | "NORMAL" | "LOW";

export interface BusEvent<T = Record<string, unknown>> {
  id: string;
  topic: string; // e.g., "project.imported", "analysis.finished", "report.generated"
  publisher: string;
  priority: EventPriority;
  payload: T;
  correlationId: string;
  tenantId: string;
  version: string;
  timestamp: string;
}

export interface DeadLetterQueueItem {
  id: string;
  event: BusEvent;
  failureReason: string;
  retryCount: number;
  maxRetries: number;
  lastAttemptAt: string;
  status: "PENDING_REPLAY" | "REPLAYED" | "DISCARDED";
}

// ==========================================
// MODULE 4, 5 & 11: WORKFLOW & RULE AUTOMATION (LOW-CODE)
// ==========================================

export type WorkflowNodeType =
  | "TRIGGER_EVENT"
  | "TRIGGER_SCHEDULE"
  | "CONDITION_IF_ELSE"
  | "ACTION_WEBHOOK"
  | "ACTION_SLACK_NOTIFY"
  | "ACTION_EMAIL"
  | "ACTION_RUN_PLUGIN"
  | "ACTION_UPDATE_KNOWLEDGE"
  | "DELAY_TIMER"
  | "LOOP_COLLECTION";

export interface WorkflowNodeConfig {
  [key: string]: unknown;
  eventTopic?: string;
  conditionExpression?: string;
  endpointUrl?: string;
  messageTemplate?: string;
  pluginId?: string;
  delaySeconds?: number;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  config: WorkflowNodeConfig;
}

export interface WorkflowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  conditionBranch?: "TRUE" | "FALSE" | "DEFAULT";
}

export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  version: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggerType: "EVENT" | "SCHEDULE" | "MANUAL";
  triggerRule?: SystemRuleTrigger;
  createdAt: string;
  updatedAt: string;
}

export type SystemRuleTrigger =
  | "WHEN_PROJECT_IMPORTED"
  | "WHEN_ANALYSIS_FINISHED"
  | "WHEN_REPORT_GENERATED"
  | "WHEN_AI_CREDITS_LOW"
  | "WHEN_SUBSCRIPTION_CHANGES"
  | "WHEN_KNOWLEDGE_UPDATED"
  | "WHEN_PLUGIN_INSTALLED"
  | "WHEN_USER_INVITED";

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  executionId: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  stepsExecuted: {
    nodeId: string;
    nodeLabel: string;
    status: "SUCCESS" | "FAILED";
    output: Record<string, unknown>;
    durationMs: number;
  }[];
  durationMs: number;
  startedAt: string;
  completedAt?: string;
  errorDetails?: string;
}

// ==========================================
// MODULE 6: ENTERPRISE CONNECTORS
// ==========================================

export type ConnectorProviderType =
  | "GOOGLE_DRIVE"
  | "ONEDRIVE"
  | "DROPBOX"
  | "SHAREPOINT"
  | "GOOGLE_WORKSPACE"
  | "MICROSOFT_365"
  | "SLACK"
  | "MICROSOFT_TEAMS"
  | "SMTP_EMAIL"
  | "REST_API"
  | "WEBHOOK";

export interface ConnectorCredentialConfig {
  authType: "OAUTH2" | "API_KEY" | "BASIC" | "NONE";
  clientId?: string;
  clientSecretMasked?: string;
  apiKeyMasked?: string;
  endpointUrl?: string;
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
}

export interface EnterpriseConnector {
  id: string;
  tenantId: string;
  name: string;
  provider: ConnectorProviderType;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";
  config: ConnectorCredentialConfig;
  lastSyncAt?: string;
  latencyMs: number;
  totalEventsProcessed: number;
  errorCount: number;
}

// ==========================================
// MODULE 7: PUBLIC API PLATFORM V2
// ==========================================

export interface ApiV2Endpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  version: "v1" | "v2";
  summary: string;
  requiredScope: string;
  rateLimitPerMinute: number;
  deprecated?: boolean;
}

export interface ApiKeyCredentialV2 {
  id: string;
  tenantId: string;
  keyName: string;
  keyPrefix: string; // e.g. "urja_live_9a8f..."
  scopes: string[];
  rateLimitTier: "STANDARD" | "PREMIUM" | "ENTERPRISE";
  createdDate: string;
  lastUsedDate?: string;
  status: "ACTIVE" | "REVOKED";
}

// ==========================================
// MODULE 8: WEBHOOK PLATFORM
// ==========================================

export interface WebhookEndpointSubscription {
  id: string;
  tenantId: string;
  targetUrl: string;
  secretKeyMasked: string;
  subscribedEvents: string[];
  status: "ACTIVE" | "SUSPENDED" | "FAILED";
  deliverySuccessCount: number;
  deliveryFailureCount: number;
  lastDeliveryAt?: string;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  eventTopic: string;
  payload: Record<string, unknown>;
  responseCode: number;
  durationMs: number;
  status: "SUCCESS" | "FAILED";
  retryCount: number;
  signatureHeader: string;
  timestamp: string;
}

// ==========================================
// MODULE 9: BACKGROUND JOB SYSTEM
// ==========================================

export type JobPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

export interface BackgroundJob {
  id: string;
  tenantId: string;
  jobType: string; // e.g. "GEO_SPATIAL_COMPUTE", "PDF_REPORT_COMPILE", "BULK_KNOWLEDGE_EMBEDDING"
  payload: Record<string, unknown>;
  priority: JobPriority;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "SCHEDULED";
  cronExpression?: string;
  workerId?: string;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface WorkerPoolNode {
  id: string;
  name: string;
  status: "IDLE" | "BUSY" | "OFFLINE";
  currentJobId?: string;
  jobsCompleted: number;
  uptimeSeconds: number;
}

// ==========================================
// MODULE 10: MARKETPLACE FOUNDATION
// ==========================================

export type MarketplaceItemType = "PLUGIN" | "KNOWLEDGE_PACK" | "WORKFLOW_TEMPLATE";

export interface MarketplaceReview {
  id: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  type: MarketplaceItemType;
  title: string;
  publisher: string;
  isVerifiedPublisher: boolean;
  version: string;
  description: string;
  category: string;
  rating: number;
  reviewsCount: number;
  downloadsCount: number;
  compatibilityMinOsVersion: string;
  iconUrl?: string;
  reviews: MarketplaceReview[];
  manifestOrData: Record<string, unknown>;
}

// ==========================================
// MODULE 12, 13 & 14: OBSERVABILITY & SECURITY METRICS
// ==========================================

export interface SystemObservabilityMetrics {
  activePluginsCount: number;
  pluginCrashRatePercent: number;
  eventsProcessedPerSec: number;
  deadLetterCount: number;
  workflowExecutions24h: number;
  workflowSuccessRatePercent: number;
  connectorHealthPercent: number;
  apiRequestsPerMin: number;
  apiAvgLatencyMs: number;
  webhookDeliverySuccessRatePercent: number;
  activeBackgroundWorkers: number;
  jobQueueDepth: number;
  tenantIsolationViolationsCount: number;
}
