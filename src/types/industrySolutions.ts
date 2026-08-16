export type IndustryId = 
  | "CONSTRUCTION" 
  | "SMART_CITY" 
  | "HEALTHCARE" 
  | "MANUFACTURING" 
  | "ENERGY" 
  | "COMMERCIAL_RE" 
  | "EDUCATION" 
  | "LOGISTICS" 
  | "ESG_SUSTAINABILITY";

export type IndustryCapabilityClassification = 
  | "IMPLEMENTED" 
  | "TEMPLATE" 
  | "CONFIGURATION" 
  | "KNOWLEDGE_PACK" 
  | "WORKFLOW_PACK"
  | "REQUIRES_EXTERNAL_DATA" 
  | "FUTURE_ENHANCEMENT"
  | "VALIDATED";

export interface IndustrySolutionMetadata {
  id: string;
  industryId: IndustryId;
  name: string;
  tagline: string;
  description: string;
  version: string;
  brandingColor: string; // Tailwind color accent
  iconName: string;
  isActive: boolean;
  featureFlags: Record<string, boolean>;
  rolePresets: string[];
  moduleActivations: string[];
  licensingTier: "ENTERPRISE_PREMIUM" | "CORE_SOLUTION" | "ADD_ON_MODULE";
  externalDependencies: string[];
}

export interface IndustryDigitalTwinTemplate {
  id: string;
  name: string;
  industryId: IndustryId;
  type: string;
  sensorCount: number;
  cadIntegrationReady: boolean;
  classification: IndustryCapabilityClassification;
  description: string;
}

export interface IndustryKpiMetric {
  id: string;
  name: string;
  category: string;
  currentValue: string;
  targetValue: string;
  unit: string;
  trend: "UP" | "DOWN" | "STABLE";
  classification: IndustryCapabilityClassification;
}

export interface IndustryWorkflowTemplate {
  id: string;
  name: string;
  industryId: IndustryId;
  stepsCount: number;
  requiresHumanApproval: boolean;
  triggerEvent: string;
  classification: IndustryCapabilityClassification;
  description: string;
}

export interface DomainKnowledgePack {
  id: string;
  industryId: IndustryId;
  domainName: string;
  version: string;
  topicCount: number;
  ruleCount: number;
  lastUpdated: string;
  activeStatus: "ACTIVE" | "AVAILABLE" | "UPDATE_PENDING";
  externalDataDependency?: string;
  classification: IndustryCapabilityClassification;
  summary: string;
}

export interface DomainAiAgent {
  id: string;
  name: string;
  industryId: IndustryId;
  roleTitle: string;
  capabilities: string[];
  permissions: string[];
  knowledgeSources: string[];
  reasoningScope: string;
  evidenceRequirements: string;
  humanApprovalPolicy: "STRICT_HUMAN_APPROVAL" | "AUTONOMOUS_WITH_AUDIT" | "HYBRID_SEVERITY_BASED";
  classification: IndustryCapabilityClassification;
}

export interface ExecutiveDashboardMetric {
  id: string;
  role: "CEO" | "COO" | "CTO" | "CFO" | "OPERATIONS" | "COMPLIANCE" | "DIGITAL_TWIN" | "AI_PERFORMANCE";
  title: string;
  value: string;
  changeText: string;
  trend: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  industryScope: IndustryId | "CROSS_INDUSTRY";
  classification: IndustryCapabilityClassification;
}

export interface MarketplacePackageItem {
  id: string;
  packageType: "INDUSTRY_PACK" | "KNOWLEDGE_PACK" | "AI_PACK" | "WORKFLOW_PACK" | "DASHBOARD_PACK" | "TEMPLATE_PACK";
  name: string;
  industryId: IndustryId;
  version: string;
  publisher: string;
  downloads: number;
  rating: number;
  compatibilityStatus: "VERIFIED_COMPATIBLE" | "REQUIRES_DEPENDENCY";
  priceTier: "INCLUDED" | "ADD_ON_LICENSE";
  description: string;
  classification: IndustryCapabilityClassification;
}

export interface IndustryModuleAuditReport {
  moduleNumber: number;
  moduleName: string;
  industryScope: string;
  classification: IndustryCapabilityClassification;
  summary: string;
  validatedFeatures: string[];
  externalDependencies: string[];
}
