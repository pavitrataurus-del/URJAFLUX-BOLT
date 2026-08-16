/**
 * ============================================================================
 *               URJAFLUX AI OS — PRODUCT VISION LOCK TYPES
 * ============================================================================
 * 
 * Formal Architectural Guardrails, Module Classifications,
 * Lightweight Design Studio Tool Manifests, and Workflow Compliance Models.
 */

export type VisionClassification = "CORE_VISION" | "OPTIONAL" | "FUTURE" | "OUTSIDE_VISION";

export interface SystemModuleAudit {
  id: string;
  moduleName: string;
  category: "Spatial Intelligence" | "Vastu Intelligence" | "AI Reasoning" | "Professional Reporting" | "Digital Twin" | "Knowledge Intelligence" | "CAD / Floorplan Tooling" | "Other";
  classification: VisionClassification;
  purpose: string;
  justification: string;
  recommendation: string;
  complianceScore: number; // 0-100%
  status: "Aligned" | "Needs Refactoring" | "Deprecated / Guarded";
}

export type DesignStudioToolId = 
  | "plot"
  | "wall"
  | "room"
  | "door"
  | "window"
  | "column"
  | "stair"
  | "dimension"
  | "move"
  | "delete"
  | "undo"
  | "redo"
  | "zoom"
  | "pan"
  | "grid"
  | "snap"
  | "north_arrow"
  | "layer_visibility"
  | "basic_properties";

export interface DesignStudioToolDefinition {
  id: DesignStudioToolId;
  name: string;
  category: "Structure" | "Elements" | "Annotation" | "Canvas Control" | "Manipulation";
  description: string;
  isAllowed: boolean;
  status: "Active" | "Supported";
}

export interface AntiFeatureGuardrail {
  id: string;
  featureName: string;
  category: "Full CAD" | "BIM Authoring" | "3D & Rendering" | "MEP Drafting" | "Engineering Design" | "Parametric / Advanced Annotations";
  status: "Strictly Forbidden" | "Out of Scope";
  reasoning: string;
  suggestedAlternative: string;
}

export interface WorkflowComplianceStep {
  stepNumber: number;
  phase: string;
  description: string;
  outputArtifact: string;
  supportedByUrjaflux: boolean;
}

export interface PrimaryWorkflowDefinition {
  id: "WORKFLOW_A" | "WORKFLOW_B";
  name: string;
  subtitle: string;
  targetUser: string;
  steps: WorkflowComplianceStep[];
}

export interface ProductVisionLockReport {
  lockedAt: string;
  visionVersion: string;
  executiveGuardians: string[];
  overallAlignmentScore: number; // 0-100%
  modulesAuditedCount: number;
  coreVisionCount: number;
  optionalCount: number;
  futureCount: number;
  outsideVisionCount: number;
  primaryWorkflows: PrimaryWorkflowDefinition[];
  moduleAudits: SystemModuleAudit[];
  supportedStudioTools: DesignStudioToolDefinition[];
  antiFeatureGuardrails: AntiFeatureGuardrail[];
  strategicArchitecturalRecommendations: string[];
}
