/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 8
 *         UNIVERSAL WORKFLOW ORCHESTRATOR TYPES
 * ============================================================================
 * 
 * Defines unified enterprise-grade orchestration types, pipeline signatures,
 * and interface structures that connect the Knowledge, Rule, Calculation, 
 * Interpretation, and Report Engines.
 */

import { WorkflowExecutionState, StageExecutionReport } from "./ExecutionState";
import { 
  CalculationProject, 
  CalculationProperty, 
  CalculationFloor, 
  CalculationCompass, 
  CalculationSpatialData, 
  KnowledgeReference, 
  TriggeredRule 
} from "../calculation/CalculationTypes";
import { 
  InterpretationFinding, 
  InterpretationRecommendation 
} from "../interpretation/InterpretationTypes";
import { ProfessionalReport } from "../report/ReportEngine";
import { WorkspaceKnowledgeModel } from "../../types/workspaceKnowledgeModel";

/**
 * Enterprise Orchestrator execution metadata tracking performance and users.
 */
export interface WorkflowExecutionMetadata {
  executorEmail: string;
  triggeredAt: string;
  completedAt?: string;
  totalDurationMs?: number;
  environmentUrl: string;
  isStagedRun: boolean;
}

/**
 * Universal Workflow Context that accumulates outputs from each engine stage.
 */
export interface WorkflowContext {
  // Inputs
  project: CalculationProject;
  property: CalculationProperty;
  floor?: CalculationFloor;
  compass: CalculationCompass;
  spatialData: CalculationSpatialData;
  workspaceModel?: WorkspaceKnowledgeModel;

  // Accumulated outputs from various engine stages
  knowledgeReferences: KnowledgeReference[];
  triggeredRules: TriggeredRule[];
  calculationResults: Record<string, number>;
  findings: InterpretationFinding[];
  recommendations: InterpretationRecommendation[];
  finalReport?: ProfessionalReport;

  // Custom contexts
  pluginContext: Record<string, unknown>;
  variables: Record<string, number>;
  metadata: WorkflowExecutionMetadata;
}

/**
 * Representation of a discrete execution stage in the pipeline.
 */
export interface WorkflowStage {
  stageId: string;
  name: string;
  description: string;
  execute(context: WorkflowContext): Promise<{
    success: boolean;
    outputs: Partial<WorkflowContext>;
    warnings: string[];
    errors: string[];
  }>;
}

/**
 * Structure of a composed pipeline.
 */
export interface WorkflowPipeline {
  pipelineId: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
}

/**
 * Unified Workflow Logger Interface.
 */
export interface WorkflowLogger {
  logStage(report: StageExecutionReport): void;
  logPipelineStart(pipelineId: string, context: WorkflowContext): void;
  logPipelineEnd(pipelineId: string, success: boolean, durationMs: number): void;
  getReports(): StageExecutionReport[];
  clear(): void;
}

/**
 * Workflow plugin hook for external extensions.
 */
export interface WorkflowPlugin {
  pluginId: string;
  name: string;
  onBeforeStage?(stageId: string, context: WorkflowContext): void;
  onAfterStage?(stageId: string, context: WorkflowContext, report: StageExecutionReport): void;
}
