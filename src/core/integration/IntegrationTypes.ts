export interface BaseIntegrationEntity {
  id: string; // UUID
  version: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED' | 'COMPLETED' | 'FAILED' | 'PENDING';
  owner: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface ApiDefinition extends BaseIntegrationEntity {
  name: string;
  description: string;
  basePath: string;
  type: 'REST' | 'GRAPHQL';
  versions: ApiVersion[];
  rateLimitTier: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
}

export interface ApiVersion {
  id: string;
  versionString: string; // e.g. "v1", "v2"
  status: 'CURRENT' | 'DEPRECATED' | 'RETIRED';
  releasedAt: string;
  deprecationDate?: string;
  endpointsCount: number;
}

export interface ApiConsumer extends BaseIntegrationEntity {
  name: string;
  email: string;
  company: string;
  tier: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  credentials: ApiCredential[];
}

export interface ApiCredential {
  id: string;
  name: string;
  apiKeyHex: string; // Masked API Key or secret
  clientId: string;
  clientSecretHex?: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'REVOKED';
  createdAt: string;
}

export interface Connector extends BaseIntegrationEntity {
  name: string;
  provider: 'ERP_SAP' | 'CRM_SALESFORCE' | 'GIS_ARCGIS' | 'DMS_SHAREPOINT' | 'CLOUD_STORAGE_S3' | 'MESSAGING_SLACK' | 'ACCOUNTING_QUICKBOOKS' | 'IOT_AZURE' | 'CUSTOM';
  type: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncAt?: string;
  configuration: ConnectorConfiguration;
}

export interface ConnectorConfiguration {
  endpointUrl: string;
  authType: 'OAUTH2' | 'API_KEY' | 'BASIC' | 'NONE';
  timeoutMs: number;
  retryCount: number;
  syncIntervalCron?: string;
  customHeaders?: Record<string, string>;
}

export interface ConnectorExecution {
  id: string;
  connectorId: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
  payloadSizeKb: number;
  latencyMs: number;
}

export interface IntegrationProfile extends BaseIntegrationEntity {
  name: string;
  sourceSystem: string;
  targetSystem: string;
  mappingRules: {
    sourceField: string;
    targetField: string;
    transformationRule?: string;
  }[];
}

export interface WebhookSubscription extends BaseIntegrationEntity {
  url: string;
  secretToken: string;
  events: string[]; // e.g. ["DOMAIN-012.DEFECT_DETECTED", "DOMAIN-013.WORKFLOW_COMPLETED"]
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number; // e.g. 2 for exponential backoff
  };
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  eventId: string;
  eventName: string;
  timestamp: string;
  payloadPreview: string;
  deliveryStatus: 'SUCCESS' | 'FAILED';
  responseCode?: number;
  latencyMs: number;
  attemptNumber: number;
}

export interface ImportJob extends BaseIntegrationEntity {
  fileName: string;
  fileType: 'CSV' | 'JSON' | 'XML' | 'EXCEL';
  targetDomain: 'DOMAIN-009' | 'DOMAIN-011' | 'DOMAIN-012' | 'DOMAIN-013';
  recordsCount: number;
  successCount: number;
  failedCount: number;
  errorLog?: string;
}

export interface ExportJob extends BaseIntegrationEntity {
  jobType: 'CSV' | 'JSON' | 'XML' | 'EXCEL';
  sourceDomain: 'DOMAIN-009' | 'DOMAIN-011' | 'DOMAIN-012' | 'DOMAIN-013';
  queryCriteria: string;
  recordsCount: number;
  downloadUrl?: string;
}
