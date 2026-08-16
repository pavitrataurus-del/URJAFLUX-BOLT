/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 7
 *         UNIVERSAL INTERPRETATION ENGINE TYPES
 * ============================================================================
 * 
 * Clean, robust, type-safe interfaces and domain models for the Sprint 7 
 * Universal Interpretation Engine, completely decoupled from UI or database layers.
 */

import { 
  CalculationProject, 
  CalculationProperty, 
  CalculationFloor, 
  CalculationCompass, 
  CalculationSpatialData, 
  KnowledgeReference, 
  TriggeredRule 
} from "../calculation/CalculationTypes";

export type InterpretationSeverity = 
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFORMATIONAL";

export interface InterpretationFinding {
  id: string;
  title: string;
  description: string;
  category: string; // e.g. "VASTU_DEFECT", "ASTRO_CONSTRAINTS", "NUMEROLOGY_MISMATCH"
  severity: InterpretationSeverity;
  confidence: number; // 0.0 to 1.0 confidence score
  evidence: KnowledgeReference[]; // Citations backing this finding
  relatedRules: string[]; // Rule IDs that triggered this
  relatedCalculations: string[]; // Names of calculated variables used
  affectedArea?: string; // e.g. "North-East Quadrant", "Brahmasthan"
  pluginSource: string; // Plugin ID that created this finding
  timestamp: string; // ISO timestamp
}

export interface InterpretationRecommendation {
  id: string;
  findingId: string; // Pointer to the related finding
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  expectedBenefit: string;
  knowledgeSource?: KnowledgeReference;
  implementationDifficulty: "EASY" | "MEDIUM" | "HARD";
  estimatedImpact: "HIGH" | "MEDIUM" | "LOW";
  remedyAction: string; // Practical step to take
}

export interface InterpretationContext {
  project: CalculationProject;
  property: CalculationProperty;
  floor?: CalculationFloor;
  compass: CalculationCompass;
  spatialData: CalculationSpatialData;
  triggeredRules: TriggeredRule[];
  calculationResults: Record<string, number>;
  knowledgeReferences: KnowledgeReference[];
  pluginContext: Record<string, unknown>;
  variables: Record<string, number>; // Local context variables
}

export interface InterpretationModuleResult {
  moduleId: string;
  findings: InterpretationFinding[];
  recommendations: InterpretationRecommendation[];
  logs: string[];
  success: boolean;
  error?: string;
}

export interface FindingGeneratorPlugin {
  pluginId: string;
  name: string;
  generateFindings(context: InterpretationContext): InterpretationFinding[];
}

export interface SeverityScorerPlugin {
  pluginId: string;
  name: string;
  scoreSeverity(finding: InterpretationFinding, context: InterpretationContext): InterpretationSeverity;
}

export interface RecommendationProviderPlugin {
  pluginId: string;
  name: string;
  generateRecommendations(
    findings: InterpretationFinding[], 
    context: InterpretationContext
  ): InterpretationRecommendation[];
}

export interface InterpretationLog {
  id: string;
  timestamp: string;
  durationMs: number;
  projectId: string;
  propertyId: string;
  findingsCount: number;
  recommendationsCount: number;
  warnings: string[];
  errors: string[];
  trace: string[];
}
