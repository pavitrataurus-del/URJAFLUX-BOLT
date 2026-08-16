export type DeploymentClassification = 
  | "IMPLEMENTED"
  | "VALIDATED"
  | "REQUIRES_EXTERNAL_INFRASTRUCTURE"
  | "FUTURE_ENHANCEMENT";

export interface OrganizationProfile {
  id: string;
  companyName: string;
  industry: string;
  size: string;
  primaryAdminEmail: string;
  primaryAdminName: string;
  country: string;
  defaultTimezone: string;
  initialWorkspaceName: string;
  sampleProjectTemplate: "SMART_BUILDING" | "INDUSTRIAL_PLANT" | "URBAN_INFRA" | "CUSTOM";
  defaultSecurityPolicy: "STRICT_RBAC" | "ENTERPRISE_LTS" | "FEDRAMP_COMPLIANT" | "AIRGAPPED";
  createdAt: string;
  status: "ACTIVE" | "PENDING_PROVISIONING" | "PROVISIONED";
}

export interface TenantProvisioningRecord {
  tenantId: string;
  orgId: string;
  storageQuotaGb: number;
  allocatedStorageGb: number;
  databaseIsolationType: "SCHEMA_ISOLATED" | "DEDICATED_INSTANCE" | "AIRGAPPED_NODE";
  roleTemplates: string[];
  defaultPermissions: string[];
  apiKey: string;
  billingStatus: "ACTIVE" | "TRIAL" | "OVERDUE";
  provisionedAt: string;
}

export interface LicenseRecord {
  licenseId: string;
  orgName: string;
  tier: "ENTERPRISE_LTS" | "GLOBAL_OPERATIONS" | "PLATINUM_SUITE" | "TRIAL_30_DAY";
  seatsAllocated: number;
  seatsUsed: number;
  issuedAt: string;
  expiresAt: string;
  activationKey: string;
  offlineValidationHash: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | "WARNING_EXPIRING_SOON";
  registeredDevices: {
    deviceId: string;
    deviceName: string;
    os: string;
    lastPing: string;
  }[];
  offlineValidationEnabled: boolean;
  allowedIpRanges: string[];
}

export interface DesktopPackagingConfig {
  platform: "WINDOWS_MSI" | "MACOS_PKG" | "LINUX_APPIMAGE";
  appName: string;
  version: string;
  installerBuilder: string;
  silentInstallCommand: string;
  autoConfigPath: string;
  repairCommand: string;
  uninstallCommand: string;
  externalInfraDependency: string;
  packagingStatus: "SPECIFICATION_READY" | "REQUIRES_BUILD_RUNNER";
}

export interface UpdateChannelConfig {
  channel: "STABLE" | "BETA" | "ENTERPRISE_LTS";
  currentVersion: string;
  latestAvailableVersion: string;
  updatePolicy: "AUTO_APPLY" | "SCHEDULED_WINDOW" | "MANUAL_APPROVAL" | "AIRGAPPED_PACKAGE";
  lastVerifiedSha256: string;
  releaseNotes: string[];
  rollbackSnapshotAvailable: boolean;
}

export interface CustomerHealthMetric {
  tenantId: string;
  companyName: string;
  overallHealthScore: number; // 0-100
  adoptionScore: number;
  dauToMauRatio: number; // e.g. 0.68
  activeSeats: number;
  totalSeats: number;
  featureUsageMap: Record<string, number>;
  trainingCompletionRate: number; // percentage
  renewalRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  supportTicketsOpen: number;
  npsScore: number;
}

export interface InteractiveTutorialStep {
  id: string;
  title: string;
  description: string;
  targetElementId?: string;
  category: "ONBOARDING" | "CAD" | "DIGITAL_TWIN" | "KNOWLEDGE" | "ADMIN";
  completed: boolean;
}

export interface DiagnosticBundle {
  bundleId: string;
  timestamp: string;
  environmentInfo: {
    appVersion: string;
    nodeEnv: string;
    userAgent: string;
    memoryUsageMb: number;
    activeDatabase: string;
  };
  sanitizedConfig: Record<string, any>;
  recentErrors: {
    timestamp: string;
    errorName: string;
    message: string;
    stackTraceSnippet: string;
  }[];
  healthReport: {
    databaseStatus: "HEALTHY" | "DEGRADED" | "OFFLINE";
    aiServiceStatus: "HEALTHY" | "DEGRADED";
    storageStatus: "HEALTHY" | "DEGRADED";
    websocketStatus: "HEALTHY" | "OFFLINE";
  };
  logSummary: string[];
}

export interface PrivacyTelemetrySettings {
  telemetryMode: "ANONYMOUS_MINIMAL" | "STANDARD_PRODUCT_IMPROVEMENT" | "FULL_DIAGNOSTIC" | "OPT_OUT_AIRGAPPED";
  anonymizationSalt: string;
  optInFeatureAdoption: boolean;
  optInCrashReporting: boolean;
  optInPerformanceMetrics: boolean;
  optInTwinUsageStats: boolean;
  auditTrailLogsEnabled: boolean;
}

export interface CustomerFeedbackEntry {
  id: string;
  type: "FEATURE_REQUEST" | "BUG_REPORT" | "SATISFACTION_SURVEY" | "GENERAL_FEEDBACK";
  title: string;
  description: string;
  userEmail: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  votes: number;
  status: "OPEN" | "UNDER_REVIEW" | "PLANNED" | "RESOLVED";
  createdAt: string;
}

export interface WhiteLabelConfig {
  companyLogoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  themeMode: "DARK_LUXURY" | "LIGHT_ENTERPRISE" | "HIGH_CONTRAST";
  customLoginHeading: string;
  customPdfWatermark: string;
  customPdfFooter: string;
  customDomainName: string;
}

export interface DeploymentChecklistItem {
  id: string;
  category: "INFRASTRUCTURE" | "ENVIRONMENT" | "CONNECTIVITY" | "STORAGE" | "SECURITY" | "BACKUP";
  title: string;
  description: string;
  passed: boolean;
  statusDetails: string;
  lastChecked: string;
}

export interface CommercialSubscription {
  subscriptionId: string;
  planName: "ENTERPRISE_CORE" | "DIGITAL_TWIN_SUITE" | "ULTIMATE_OPERATIONS";
  billingCycle: "ANNUAL" | "MULTI_YEAR_LTS";
  mrrAmountUsd: number;
  seatsPurchased: number;
  nextRenewalDate: string;
  invoices: {
    id: string;
    date: string;
    amountUsd: number;
    status: "PAID" | "PENDING" | "PROCESSING";
    pdfUrl: string;
  }[];
  externalBillingProviderNote: string;
}

export interface ProductAnalyticsCohort {
  cohortMonth: string;
  totalAccounts: number;
  retentionRates: number[]; // e.g., [100, 94, 91, 88, 86, 85]
  topFeaturesUsed: { feature: string; usageCount: number }[];
  twinQueriesExecuted: number;
  knowledgeSearchesExecuted: number;
}

export interface EnterpriseReleaseMatrix {
  version: string;
  releaseDate: string;
  status: "CURRENT_GA" | "LTS_SUPPORTED" | "DEPRECATED" | "EOL";
  compatibilityRating: "100% COMPATIBLE" | "REQUIRES_MIGRATION_SCRIPT";
  knownIssues: string[];
  endOfLifeDate: string;
}

export interface GaLifecycleReportSummary {
  commercialReadinessScore: number; // 0-100
  recommendation: "GO" | "NO-GO";
  completedModulesCount: number;
  totalModulesCount: number;
  moduleClassifications: Record<string, DeploymentClassification>;
  externalDependenciesList: string[];
  migrationNotes: string[];
}
