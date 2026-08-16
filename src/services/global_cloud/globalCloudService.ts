import { 
  CloudProviderProfile, 
  KubernetesResourceDef, 
  IaCTemplate, 
  RegionDeploymentConfig, 
  EdgeNodeConfig, 
  SecretVaultRecord, 
  SloMetric, 
  InfrastructureSecurityPolicy, 
  RegionalCostEstimate, 
  ClusterHealthStatus, 
  DeploymentPipelineStage, 
  DisasterRecoveryPlaybook, 
  CloudReadinessModuleReport 
} from "../../types/globalCloudPlatform";

export const CLOUD_PROVIDER_PROFILES: CloudProviderProfile[] = [
  {
    id: "GCP",
    name: "Google Cloud Platform",
    regionCount: 38,
    managedKubernetesEngine: "Google Kubernetes Engine (GKE Autopilot)",
    secretManagerService: "Google Cloud Secret Manager",
    defaultRegion: "us-central1 (Iowa)",
    supportedCapabilities: ["Workload Identity", "Anthos Service Mesh", "Cloud Spanner Multi-Region", "Vertex AI Endpoints"],
    status: "ACTIVE"
  },
  {
    id: "AZURE",
    name: "Microsoft Azure",
    regionCount: 60,
    managedKubernetesEngine: "Azure Kubernetes Service (AKS)",
    secretManagerService: "Azure Key Vault",
    defaultRegion: "eastus (Virginia)",
    supportedCapabilities: ["Azure AD Workload ID", "Azure Service Bus", "Cosmos DB Global Replication", "Azure CDN"],
    status: "STANDBY"
  },
  {
    id: "AWS",
    name: "Amazon Web Services",
    regionCount: 33,
    managedKubernetesEngine: "Elastic Kubernetes Service (EKS)",
    secretManagerService: "AWS Secrets Manager & KMS",
    defaultRegion: "us-east-1 (N. Virginia)",
    supportedCapabilities: ["IRSA Workload IAM", "AWS App Mesh", "DynamoDB Global Tables", "AWS CloudFront Edge"],
    status: "STANDBY"
  },
  {
    id: "PRIVATE_K8S",
    name: "Private On-Premises Kubernetes",
    regionCount: 4,
    managedKubernetesEngine: "Rancher / RKE2 Enterprise",
    secretManagerService: "HashiCorp Vault On-Prem",
    defaultRegion: "datacenter-primary-01",
    supportedCapabilities: ["MetalLB LoadBalancer", "Cilium CNI Zero Trust", "Ceph RBD Storage", "Local S3 MinIO"],
    status: "CONFIGURED"
  }
];

export const KUBERNETES_RESOURCE_TEMPLATES: KubernetesResourceDef[] = [
  {
    kind: "Namespace",
    name: "urjaflux-system",
    namespace: "urjaflux-system",
    yamlContent: `apiVersion: v1
kind: Namespace
metadata:
  name: urjaflux-system
  labels:
    pod-security.kubernetes.io/enforce: restricted
    app.kubernetes.io/part-of: urjaflux-global-cloud`
  },
  {
    kind: "Deployment",
    name: "urjaflux-api-gateway",
    namespace: "urjaflux-system",
    replicas: 5,
    cpuRequest: "500m",
    cpuLimit: "2000m",
    memoryRequest: "1Gi",
    memoryLimit: "4Gi",
    yamlContent: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: urjaflux-api-gateway
  namespace: urjaflux-system
spec:
  replicas: 5
  selector:
    matchLabels:
      app: urjaflux-api-gateway
  template:
    metadata:
      labels:
        app: urjaflux-api-gateway
        azure.workload.identity/use: "true"
    spec:
      serviceAccountName: urjaflux-workload-sa
      containers:
      - name: gateway
        image: gcr.io/urjaflux-prod/api-gateway:v3.2.0-GA
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "2000m"
            memory: "4Gi"
        ports:
        - containerPort: 3000
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5`
  },
  {
    kind: "HorizontalPodAutoscaler",
    name: "urjaflux-gateway-hpa",
    namespace: "urjaflux-system",
    yamlContent: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: urjaflux-gateway-hpa
  namespace: urjaflux-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: urjaflux-api-gateway
  minReplicas: 3
  maxReplicas: 30
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`
  },
  {
    kind: "PodDisruptionBudget",
    name: "urjaflux-gateway-pdb",
    namespace: "urjaflux-system",
    yamlContent: `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: urjaflux-gateway-pdb
  namespace: urjaflux-system
spec:
  minAvailable: 80%
  selector:
    matchLabels:
      app: urjaflux-api-gateway`
  },
  {
    kind: "NetworkPolicy",
    name: "default-deny-all",
    namespace: "urjaflux-system",
    yamlContent: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: urjaflux-system
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress`
  }
];

export const IAC_TEMPLATES: IaCTemplate[] = [
  {
    id: "TF-MULTI-CLOUD-01",
    tool: "TERRAFORM",
    name: "Multi-Cloud Kubernetes & VPC Foundation",
    targetProvider: "MULTI_CLOUD",
    filePath: "terraform/main.tf",
    requiresRealCredentials: true,
    requiredCredentialsList: ["GOOGLE_CREDENTIALS", "AWS_ACCESS_KEY_ID", "AZURE_SUBSCRIPTION_ID"],
    content: `# Terraform Multi-Cloud Infrastructure Provider Manifest
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    google = { source = "hashicorp/google", version = "~> 5.15" }
    aws    = { source = "hashicorp/aws", version = "~> 5.35" }
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.90" }
  }
}

# GCP Primary Cluster
resource "google_container_cluster" "primary" {
  name     = "urjaflux-gke-us-central1"
  location = "us-central1"
  enable_autopilot = true
}

# AWS Secondary Cluster
resource "aws_eks_cluster" "secondary" {
  name     = "urjaflux-eks-us-east-1"
  role_arn = var.aws_eks_role_arn
}`
  },
  {
    id: "HELM-URJAFLUX-02",
    tool: "HELM",
    name: "UrjaFlux Core Platform Helm Chart",
    targetProvider: "MULTI_CLOUD",
    filePath: "charts/urjaflux-platform/values.yaml",
    requiresRealCredentials: false,
    requiredCredentialsList: [],
    content: `# UrjaFlux Platform Helm Chart Values
global:
  environment: production
  domain: cloud.urjaflux.io
  multiRegion: true

replicaCount: 5
image:
  repository: gcr.io/urjaflux-prod/core-platform
  tag: v3.2.0-GA
  pullPolicy: IfNotPresent

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod`
  },
  {
    id: "KUSTOMIZE-OVERLAY-03",
    tool: "KUSTOMIZE",
    name: "Multi-Region Production Kustomize Overlay",
    targetProvider: "MULTI_CLOUD",
    filePath: "kustomize/overlays/production/kustomization.yaml",
    requiresRealCredentials: false,
    requiredCredentialsList: [],
    content: `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base
  - hpa.yaml
  - network-policy.yaml

patchesStrategicMerge:
  - deployment-patch.yaml`
  }
];

export const REGIONAL_DEPLOYMENTS: RegionDeploymentConfig[] = [
  {
    regionId: "US-CENTRAL-GCP",
    cloudProvider: "GCP",
    locationName: "us-central1 (Iowa, USA)",
    isPrimary: true,
    trafficWeightPercentage: 60,
    latencyMs: 14,
    deploymentRing: "RING_2_PROD_PRIMARY",
    status: "HEALTHY"
  },
  {
    regionId: "EU-WEST-AZURE",
    cloudProvider: "AZURE",
    locationName: "westeurope (Amsterdam, NL)",
    isPrimary: false,
    trafficWeightPercentage: 25,
    latencyMs: 28,
    deploymentRing: "RING_3_PROD_SECONDARY",
    status: "HEALTHY"
  },
  {
    regionId: "AP-SOUTH-AWS",
    cloudProvider: "AWS",
    locationName: "ap-south-1 (Mumbai, India)",
    isPrimary: false,
    trafficWeightPercentage: 15,
    latencyMs: 32,
    deploymentRing: "RING_0_CANARY",
    status: "HEALTHY"
  }
];

export const EDGE_NODES: EdgeNodeConfig[] = [
  {
    nodeId: "EDGE-DELHI-POP-01",
    locationName: "New Delhi Industrial Park Edge PoP",
    edgeType: "REGIONAL_POP",
    offlineQueueLength: 0,
    lastSyncTimestamp: "2026-07-27 15:20:00",
    bandwidthMbps: 1000,
    syncStatus: "IN_SYNC",
    externalCdnDependency: true
  },
  {
    nodeId: "EDGE-FRANKFURT-GATEWAY",
    locationName: "Frankfurt CAD High-Speed Gateway",
    edgeType: "ON_PREM_GATEWAY",
    offlineQueueLength: 12,
    lastSyncTimestamp: "2026-07-27 15:18:45",
    bandwidthMbps: 500,
    syncStatus: "OFFLINE_QUEUED",
    externalCdnDependency: false
  },
  {
    nodeId: "EDGE-TEXAS-SENSOR-HUB",
    locationName: "Austin Digital Twin IoT Aggregator",
    edgeType: "FIELD_SENSOR_HUB",
    offlineQueueLength: 0,
    lastSyncTimestamp: "2026-07-27 15:21:10",
    bandwidthMbps: 100,
    syncStatus: "IN_SYNC",
    externalCdnDependency: false
  }
];

export const SECRET_VAULT_RECORDS: SecretVaultRecord[] = [
  {
    secretKey: "DATABASE_CREDENTIALS_MASTER",
    vaultEngine: "Google Cloud Secret Manager",
    version: "v4",
    environment: "PRODUCTION",
    lastRotatedAt: "2026-07-01",
    autoRotationDays: 30,
    encryptedRef: "projects/urjaflux-prod/secrets/db-master/versions/4"
  },
  {
    secretKey: "OAUTH_CLIENT_RSA_PRIVATE_KEY",
    vaultEngine: "Azure Key Vault",
    version: "v2",
    environment: "PRODUCTION",
    lastRotatedAt: "2026-06-15",
    autoRotationDays: 90,
    encryptedRef: "https://urjaflux-vault.vault.azure.net/secrets/oauth-rsa/v2"
  },
  {
    secretKey: "GEMINI_API_KEY_SERVER_SIDE",
    vaultEngine: "AWS Secrets Manager",
    version: "v5",
    environment: "PRODUCTION",
    lastRotatedAt: "2026-07-20",
    autoRotationDays: 15,
    encryptedRef: "arn:aws:secretsmanager:us-east-1:123456789:secret:gemini-api-key-v5"
  }
];

export const SLO_METRICS: SloMetric[] = [
  {
    serviceName: "Global API Gateway Router",
    sloTargetPercentage: 99.99,
    currentSliPercentage: 99.995,
    errorBudgetRemainingPercentage: 88.4,
    status: "HEALTHY"
  },
  {
    serviceName: "Digital Twin Telemetry Ingestion",
    sloTargetPercentage: 99.90,
    currentSliPercentage: 99.94,
    errorBudgetRemainingPercentage: 92.1,
    status: "HEALTHY"
  },
  {
    serviceName: "CAD Wall Vector Extraction Engine",
    sloTargetPercentage: 99.50,
    currentSliPercentage: 99.62,
    errorBudgetRemainingPercentage: 74.0,
    status: "HEALTHY"
  },
  {
    serviceName: "Vastu AI Recommendation Inference",
    sloTargetPercentage: 99.00,
    currentSliPercentage: 99.18,
    errorBudgetRemainingPercentage: 65.2,
    status: "HEALTHY"
  }
];

export const INFRASTRUCTURE_SECURITY_POLICIES: InfrastructureSecurityPolicy[] = [
  {
    policyId: "SEC-POL-01",
    name: "GCP/Azure/AWS Workload Identity Federation",
    standard: "WORKLOAD_IDENTITY",
    status: "ENFORCED",
    requiresExternalSigner: false,
    details: "Eliminates static long-lived cloud service account keys using OpenID Connect (OIDC) token exchange."
  },
  {
    policyId: "SEC-POL-02",
    name: "Pod Security Standard: Restricted Profile",
    standard: "POD_SECURITY_RESTRICTED",
    status: "ENFORCED",
    requiresExternalSigner: false,
    details: "Disallows root containers, privilege escalation, and restricts host path volume mounts."
  },
  {
    policyId: "SEC-POL-03",
    name: "Container Image Cryptographic Signing (Cosign)",
    standard: "IMAGE_SIGNING",
    status: "ENFORCED",
    requiresExternalSigner: true,
    externalServiceDependency: "Sigstore / External OIDC Authority",
    details: "Validates digital signatures of container images on Kyverno admission controller before pod scheduling."
  }
];

export const REGIONAL_COST_ESTIMATES: RegionalCostEstimate[] = [
  {
    cloudProvider: "GCP",
    region: "us-central1 (Iowa)",
    monthlyComputeUsd: 14200,
    monthlyStorageUsd: 4800,
    monthlyNetworkUsd: 3200,
    monthlyAiTokensUsd: 8500,
    monthlyTotalUsd: 30700,
    savingsOpportunityUsd: 2400
  },
  {
    cloudProvider: "AZURE",
    region: "westeurope (Amsterdam)",
    monthlyComputeUsd: 8900,
    monthlyStorageUsd: 2900,
    monthlyNetworkUsd: 1800,
    monthlyAiTokensUsd: 4100,
    monthlyTotalUsd: 17700,
    savingsOpportunityUsd: 1200
  },
  {
    cloudProvider: "AWS",
    region: "ap-south-1 (Mumbai)",
    monthlyComputeUsd: 6200,
    monthlyStorageUsd: 1900,
    monthlyNetworkUsd: 1100,
    monthlyAiTokensUsd: 2800,
    monthlyTotalUsd: 12000,
    savingsOpportunityUsd: 900
  }
];

export const CLUSTER_HEALTH_LIST: ClusterHealthStatus[] = [
  {
    clusterId: "gke-us-central1-prod",
    provider: "GCP",
    region: "us-central1",
    k8sVersion: "v1.29.2-gke.1100",
    nodeCount: 18,
    cpuUsagePercentage: 42.1,
    memoryUsagePercentage: 58.4,
    podCount: 142,
    healthState: "OPTIMAL"
  },
  {
    clusterId: "aks-westeurope-prod",
    provider: "AZURE",
    region: "westeurope",
    k8sVersion: "v1.29.1",
    nodeCount: 10,
    cpuUsagePercentage: 38.6,
    memoryUsagePercentage: 49.2,
    podCount: 88,
    healthState: "OPTIMAL"
  },
  {
    clusterId: "eks-apsouth1-prod",
    provider: "AWS",
    region: "ap-south-1",
    k8sVersion: "v1.29.0",
    nodeCount: 6,
    cpuUsagePercentage: 31.0,
    memoryUsagePercentage: 44.1,
    podCount: 52,
    healthState: "OPTIMAL"
  }
];

export const DEPLOYMENT_PIPELINE_STAGES: DeploymentPipelineStage[] = [
  {
    stageId: "STAGE-01",
    name: "Automated K8s Manifest Validation & Security Linting",
    environment: "BUILD",
    gateType: "SECURITY_SCAN",
    status: "PASSED",
    durationSeconds: 42
  },
  {
    stageId: "STAGE-02",
    name: "Canary Deployment to Ring 0 (AWS ap-south-1)",
    environment: "CANARY",
    gateType: "AUTOMATED_TESTS",
    status: "PASSED",
    durationSeconds: 120
  },
  {
    stageId: "STAGE-03",
    name: "Production Rollout Ring 2 (GCP us-central1)",
    environment: "PRODUCTION",
    gateType: "MANUAL_APPROVAL",
    status: "PASSED",
    durationSeconds: 210
  }
];

export const DISASTER_RECOVERY_PLAYBOOKS: DisasterRecoveryPlaybook[] = [
  {
    id: "DR-PLAYBOOK-01",
    title: "Primary Region Failover (GCP us-central1 -> Azure westeurope)",
    targetRegion: "us-central1 (GCP)",
    backupRegion: "westeurope (Azure)",
    rpoTargetMinutes: 1,
    rtoTargetMinutes: 5,
    lastTestedDate: "2026-07-15",
    testedStatus: "PASS",
    steps: [
      "Detect GCP us-central1 health failure via Global Health Checks",
      "Update Cloudflare / AWS Route53 Traffic Steering weight to Azure (100%)",
      "Promote Azure Cosmos/Spanner read-replica to primary write leader",
      "Scale Azure AKS cluster deployments from 10 to 30 pods via HPA",
      "Verify API health status at https://cloud.urjaflux.io/api/health"
    ],
    assumptions: [
      "Assumes cross-region database replication lag remains under 500ms",
      "Assumes Azure Key Vault secret versions match GCP Secret Manager"
    ]
  }
];

export const CLOUD_READINESS_MODULE_REPORTS: CloudReadinessModuleReport[] = [
  {
    moduleNumber: 1,
    moduleName: "Multi-Cloud Abstraction",
    classification: "VALIDATED",
    summary: "Cloud provider profile interfaces and capability definitions implemented for GCP, Azure, AWS, and Private K8s.",
    testedCapabilities: ["Provider Selection", "Capability Querying", "Config Profiles"],
    externalDependencies: ["Cloud Account Subscriptions"]
  },
  {
    moduleNumber: 2,
    moduleName: "Kubernetes Platform",
    classification: "VALIDATED",
    summary: "Production K8s descriptors for Deployment, HPA, PDB, NetworkPolicies, and Resource Requests/Limits.",
    testedCapabilities: ["Manifest Generation", "RBAC Mapping", "Autoscaling Spec"],
    externalDependencies: ["Running Kubernetes Cluster"]
  },
  {
    moduleNumber: 3,
    moduleName: "Infrastructure as Code",
    classification: "DEPLOYMENT_TEMPLATE",
    summary: "Terraform, Helm chart values, and Kustomize overlays provided as deployment templates.",
    testedCapabilities: ["Template Verification", "Variable Parameterization"],
    externalDependencies: ["Terraform CLI / Helm CLI Execution"]
  },
  {
    moduleNumber: 4,
    moduleName: "Global Deployment",
    classification: "VALIDATED",
    summary: "Multi-region traffic steering weights, deployment ring hierarchies, and canary blue/green strategies.",
    testedCapabilities: ["Traffic Weight Adjustment", "Ring Promotion Logic"],
    externalDependencies: ["Global Anycast DNS / CDN Engine"]
  },
  {
    moduleNumber: 5,
    moduleName: "Edge Computing",
    classification: "VALIDATED",
    summary: "Regional PoP and IoT gateway sync state manager with offline queueing and conflict resolution.",
    testedCapabilities: ["Offline Queue Tracking", "Bandwidth Optimization"],
    externalDependencies: ["Edge Hardware / CDN Provider"]
  },
  {
    moduleNumber: 6,
    moduleName: "Secret Management",
    classification: "VALIDATED",
    summary: "Secret rotation scheduler, encrypted references, and multi-vault provider abstraction.",
    testedCapabilities: ["Key Version Tracking", "Rotation Schedule Checks"],
    externalDependencies: ["Cloud KMS / HashiCorp Vault"]
  },
  {
    moduleNumber: 7,
    moduleName: "Global Observability",
    classification: "VALIDATED",
    summary: "Distributed tracing correlation, SLO error budgets, and regional latency metrics.",
    testedCapabilities: ["SLI Calculation", "Error Budget Tracking"],
    externalDependencies: ["Prometheus / OpenTelemetry Collector"]
  },
  {
    moduleNumber: 8,
    moduleName: "Infrastructure Security",
    classification: "REQUIRES_EXTERNAL_INFRASTRUCTURE",
    summary: "Zero Trust Workload Identity and Pod Security policies defined; container signing requires external authority.",
    testedCapabilities: ["Policy Validation", "Workload Identity Mapping"],
    externalDependencies: ["Sigstore / Cosign External Authority"]
  },
  {
    moduleNumber: 9,
    moduleName: "Platform Resilience",
    classification: "VALIDATED",
    summary: "Regional circuit isolation, queue recovery algorithms, and maintenance window schedulers.",
    testedCapabilities: ["Circuit Isolation", "Graceful Degradation"],
    externalDependencies: []
  },
  {
    moduleNumber: 10,
    moduleName: "Cost Governance",
    classification: "VALIDATED",
    summary: "Regional compute, storage, network, and AI token consumption cost breakdown with optimization recommendations.",
    testedCapabilities: ["Cost Breakdown Calculation", "Savings Analytics"],
    externalDependencies: []
  },
  {
    moduleNumber: 11,
    moduleName: "Global Operations Center",
    classification: "VALIDATED",
    summary: "Unified Operations Dashboard tracking cluster health, queue status, Digital Twin, and AI platform telemetry.",
    testedCapabilities: ["Cluster Health Aggregation", "Subsystem Status"],
    externalDependencies: []
  },
  {
    moduleNumber: 12,
    moduleName: "Enterprise Deployment Automation",
    classification: "DEPLOYMENT_TEMPLATE",
    summary: "Pipeline release gates, environment promotion rules, and rollback automation templates.",
    testedCapabilities: ["Gate Evaluation", "Release Report Generation"],
    externalDependencies: ["CI/CD Execution Engine"]
  },
  {
    moduleNumber: 13,
    moduleName: "Disaster Recovery Orchestration",
    classification: "VALIDATED",
    summary: "Regional failover playbooks with RPO/RTO validation workflows and explicit assumption documentation.",
    testedCapabilities: ["Playbook Execution Simulation", "RPO/RTO Tracking"],
    externalDependencies: ["Cross-Region Database Replicas"]
  },
  {
    moduleNumber: 14,
    moduleName: "Platform Administration",
    classification: "VALIDATED",
    summary: "Cloud Administration Console for cluster registry, environment manager, and configuration audits.",
    testedCapabilities: ["Cluster Registry Management", "Audit Logging"],
    externalDependencies: []
  },
  {
    moduleNumber: 15,
    moduleName: "Global Cloud Certification",
    classification: "VALIDATED",
    summary: "Comprehensive 15-module GA audit report, readiness scoring, and Go/No-Go recommendation.",
    testedCapabilities: ["Audit Consolidation", "Readiness Scoring"],
    externalDependencies: []
  }
];
