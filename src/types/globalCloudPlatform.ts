export type CloudProviderId = "GCP" | "AZURE" | "AWS" | "PRIVATE_K8S";

export type CapabilityClassification = 
  | "VALIDATED"
  | "IMPLEMENTED" 
  | "DEPLOYMENT_TEMPLATE" 
  | "REQUIRES_EXTERNAL_INFRASTRUCTURE" 
  | "FUTURE_ENHANCEMENT";

export interface CloudProviderProfile {
  id: CloudProviderId;
  name: string;
  regionCount: number;
  managedKubernetesEngine: string; // e.g. GKE, AKS, EKS, RKE2
  secretManagerService: string; // Secret Manager, Key Vault, AWS Secrets Mgr
  defaultRegion: string;
  supportedCapabilities: string[];
  status: "ACTIVE" | "STANDBY" | "CONFIGURED";
}

export interface KubernetesResourceDef {
  kind: "Namespace" | "Deployment" | "Service" | "Ingress" | "ConfigMap" | "Secret" | "HorizontalPodAutoscaler" | "PodDisruptionBudget" | "NetworkPolicy";
  name: string;
  namespace: string;
  replicas?: number;
  cpuRequest?: string;
  cpuLimit?: string;
  memoryRequest?: string;
  memoryLimit?: string;
  yamlContent: string;
}

export interface IaCTemplate {
  id: string;
  tool: "TERRAFORM" | "HELM" | "KUSTOMIZE";
  name: string;
  targetProvider: CloudProviderId | "MULTI_CLOUD";
  filePath: string;
  content: string;
  requiresRealCredentials: boolean;
  requiredCredentialsList: string[];
}

export interface RegionDeploymentConfig {
  regionId: string;
  cloudProvider: CloudProviderId;
  locationName: string;
  isPrimary: boolean;
  trafficWeightPercentage: number;
  latencyMs: number;
  deploymentRing: "RING_0_CANARY" | "RING_1_STAGING" | "RING_2_PROD_PRIMARY" | "RING_3_PROD_SECONDARY";
  status: "HEALTHY" | "DEGRADED" | "FAILOVER_ACTIVE";
}

export interface EdgeNodeConfig {
  nodeId: string;
  locationName: string;
  edgeType: "REGIONAL_POP" | "ON_PREM_GATEWAY" | "FIELD_SENSOR_HUB";
  offlineQueueLength: number;
  lastSyncTimestamp: string;
  bandwidthMbps: number;
  syncStatus: "IN_SYNC" | "OFFLINE_QUEUED" | "CONFLICT_RESOLVING";
  externalCdnDependency: boolean;
}

export interface SecretVaultRecord {
  secretKey: string;
  vaultEngine: string;
  version: string;
  environment: "PRODUCTION" | "STAGING" | "DEVELOPMENT";
  lastRotatedAt: string;
  autoRotationDays: number;
  encryptedRef: string;
}

export interface SloMetric {
  serviceName: string;
  sloTargetPercentage: number;
  currentSliPercentage: number;
  errorBudgetRemainingPercentage: number;
  status: "HEALTHY" | "AT_RISK" | "BREACHED";
}

export interface InfrastructureSecurityPolicy {
  policyId: string;
  name: string;
  standard: "ZERO_TRUST" | "POD_SECURITY_RESTRICTED" | "WORKLOAD_IDENTITY" | "IMAGE_SIGNING";
  status: "ENFORCED" | "AUDIT_ONLY";
  requiresExternalSigner: boolean;
  externalServiceDependency?: string;
  details: string;
}

export interface RegionalCostEstimate {
  cloudProvider: CloudProviderId;
  region: string;
  monthlyComputeUsd: number;
  monthlyStorageUsd: number;
  monthlyNetworkUsd: number;
  monthlyAiTokensUsd: number;
  monthlyTotalUsd: number;
  savingsOpportunityUsd: number;
}

export interface ClusterHealthStatus {
  clusterId: string;
  provider: CloudProviderId;
  region: string;
  k8sVersion: string;
  nodeCount: number;
  cpuUsagePercentage: number;
  memoryUsagePercentage: number;
  podCount: number;
  healthState: "OPTIMAL" | "WARNING" | "CRITICAL";
}

export interface DeploymentPipelineStage {
  stageId: string;
  name: string;
  environment: string;
  gateType: "AUTOMATED_TESTS" | "SECURITY_SCAN" | "MANUAL_APPROVAL";
  status: "PASSED" | "RUNNING" | "WAITING" | "ROLLED_BACK";
  durationSeconds: number;
}

export interface DisasterRecoveryPlaybook {
  id: string;
  title: string;
  targetRegion: string;
  backupRegion: string;
  rpoTargetMinutes: number;
  rtoTargetMinutes: number;
  lastTestedDate: string;
  testedStatus: "PASS" | "NEEDS_RETEST";
  steps: string[];
  assumptions: string[];
}

export interface CloudReadinessModuleReport {
  moduleNumber: number;
  moduleName: string;
  classification: CapabilityClassification;
  summary: string;
  testedCapabilities: string[];
  externalDependencies: string[];
}
