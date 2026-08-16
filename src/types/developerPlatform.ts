export type SdkLanguage = "TYPESCRIPT" | "PYTHON" | "JAVA" | "DOTNET" | "GO";
export type SdkType = "HANDWRITTEN" | "GENERATED" | "HYBRID";
export type DeploymentClassification = "VALIDATED" | "REQUIRES_EXTERNAL_INFRASTRUCTURE" | "FUTURE_ENHANCEMENT";

export interface DeveloperApplication {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  publisherName: string;
  appType: "WEB_APP" | "CLI_TOOL" | "PLUGIN_EXTENSION" | "AUTOMATION_BOT";
  status: "ACTIVE" | "PENDING_REVIEW" | "SUSPENDED";
  createdAt: string;
  apiKeysCount: number;
  webhooksCount: number;
  monthlyApiRequests: number;
}

export interface ApiKeyRecord {
  id: string;
  appId: string;
  keyPrefix: string;
  label: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string;
  active: boolean;
}

export interface WebhookEndpoint {
  id: string;
  appId: string;
  targetUrl: string;
  eventsSubscribed: string[];
  secretToken: string;
  status: "HEALTHY" | "DEGRADED" | "PAUSED";
  lastDeliveredAt: string;
  successRate: number;
}

export interface SdkMetadata {
  language: SdkLanguage;
  version: string;
  sdkType: SdkType;
  packageUrl: string;
  docsUrl: string;
  supportsWebsocket: boolean;
  supportsRetryLogic: boolean;
  monthlyDownloads: number;
}

export interface CliCommandDef {
  command: string;
  description: string;
  subcommands: string[];
  options: { name: string; type: string; description: string }[];
  exampleUsage: string;
}

export interface PluginTemplate {
  id: string;
  name: string;
  category: "CAD_EXTENSION" | "SPATIAL_ANALYTICS" | "TWIN_WIDGET" | "WORKFLOW_NODE";
  version: string;
  author: string;
  minOsVersion: string;
  lifecycleHooks: string[];
  requiredPermissions: string[];
}

export interface ApiSandboxRequest {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  bodyJson?: string;
}

export interface ApiSandboxResponse {
  statusCode: number;
  statusText: string;
  latencyMs: number;
  rateLimitRemaining: number;
  rateLimitResetSec: number;
  responseHeaders: Record<string, string>;
  bodyData: any;
}

export interface RegisteredPackage {
  id: string;
  packageName: string;
  packageType: "PLUGIN" | "KNOWLEDGE_PACK" | "WORKFLOW_TEMPLATE" | "SDK_LIBRARY";
  version: string;
  authorPublisher: string;
  signatureVerified: boolean;
  dependencies: string[];
  downloadCount: number;
  createdAt: string;
  status: "PUBLISHED" | "DEPRECATED" | "REVIEWING";
}

export interface MarketplaceSubmission {
  id: string;
  packageName: string;
  version: string;
  publisherName: string;
  submissionDate: string;
  validationStatus: "PASSED" | "FAILED" | "SECURITY_SCANNING";
  securityScanResult: {
    vulnerabilitiesFound: number;
    requiresExternalScanner: boolean;
    scannerToolName: string;
    details: string;
  };
  approvalState: "APPROVED" | "PENDING_APPROVAL" | "REJECTED";
  releaseChannel: "STABLE" | "BETA" | "LTS";
}

export interface CicdTemplate {
  provider: "GITHUB_ACTIONS" | "GITLAB_CI" | "AZURE_DEVOPS" | "JENKINS";
  fileName: string;
  yamlContent: string;
  description: string;
  requiresExternalRunner: boolean;
}

export interface DeveloperAnalyticsMetrics {
  totalRegisteredDevs: number;
  totalActiveApps: number;
  totalMonthlyApiRequests: number;
  totalSdkDownloads: number;
  marketplacePackagesCount: number;
  avgApiLatencyMs: number;
  apiErrorRatePercentage: number;
}
