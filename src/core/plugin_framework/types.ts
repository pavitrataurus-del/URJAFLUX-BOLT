export enum PluginStatus {
  INSTALLED = "INSTALLED",
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
  SUSPENDED = "SUSPENDED",
  UPGRADABLE = "UPGRADABLE"
}

export enum PluginPermission {
  UI_INJECT = "UI_INJECT",
  NETWORK_ACCESS = "NETWORK_ACCESS",
  CORE_API_READ = "CORE_API_READ",
  CORE_API_WRITE = "CORE_API_WRITE",
  STORAGE_READ = "STORAGE_READ",
  STORAGE_WRITE = "STORAGE_WRITE",
  AI_EXECUTION = "AI_EXECUTION"
}

export enum ExtensionPointType {
  DASHBOARD_WIDGET = "DASHBOARD_WIDGET",
  WORKFLOW_STEP = "WORKFLOW_STEP",
  CONSULTATION_TOOL = "CONSULTATION_TOOL",
  SPATIAL_TOOL = "SPATIAL_TOOL",
  VISION_PIPELINE = "VISION_PIPELINE",
  REPORT_TEMPLATE = "REPORT_TEMPLATE",
  AI_PROVIDER = "AI_PROVIDER",
  ANALYTICS_WIDGET = "ANALYTICS_WIDGET",
  IMPORT_EXPORT = "IMPORT_EXPORT",
  COLLABORATION_FEATURE = "COLLABORATION_FEATURE"
}

export interface PluginDependency {
  pluginId: string;
  versionConstraint: string; // e.g. ">=1.0.0 <2.0.0"
  optional: boolean;
}

export interface PluginPermissionGrant {
  permission: PluginPermission;
  granted: boolean;
  grantedBy?: string;
  grantedAt?: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  publisher: string;
  minCoreVersion: string;
  dependencies: PluginDependency[];
  permissions: PluginPermission[];
  entryPoint: string;
  extensionPoints: {
    pointType: ExtensionPointType;
    pointId: string;
    config: Record<string, any>;
  }[];
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  publisherId: string;
  latestVersion: string;
  currentVersion: string;
  status: PluginStatus;
  isVerified: boolean;
  isSuspended: boolean;
  downloads: number;
  rating: number;
  permissions: PluginPermissionGrant[];
  manifest: PluginManifest;
  digitalSignature: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ExtensionPoint {
  id: string;
  type: ExtensionPointType;
  name: string;
  description: string;
  targetDomain: string;
  schemaInterface: string;
}

export interface Extension {
  id: string;
  pluginId: string;
  extensionPointId: string;
  name: string;
  config: Record<string, any>;
  status: "ACTIVE" | "INACTIVE";
}

export interface PluginHealth {
  pluginId: string;
  status: "HEALTHY" | "DEGRADED" | "CRASHED";
  cpuUsagePct: number;
  memoryUsageMb: number;
  responseTimeMs: number;
  apiCallsCount: number;
  errorsCount: number;
  lastErrorMsg?: string;
  lastCrashTime?: string;
}

export interface PluginAuditLog {
  id: string;
  timestamp: string;
  pluginId: string;
  userId: string;
  action: "INSTALL" | "ENABLE" | "DISABLE" | "UPDATE" | "UNINSTALL" | "SANDBOX_VIOLATION" | "API_EXECUTION";
  severity: "INFO" | "WARNING" | "CRITICAL";
  details: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
}

export interface DeveloperAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  isVerified: boolean;
  joinedAt: string;
  publicationsCount: number;
  apiKeys: string[];
}

export interface MarketplaceListing {
  id: string;
  pluginId: string;
  name: string;
  description: string;
  publisherName: string;
  category: string;
  downloads: number;
  rating: number;
  isVerifiedPublisher: boolean;
  sizeKb: number;
  licenseType: string;
  priceUsd: number;
  versions: string[];
  reviews: {
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}
