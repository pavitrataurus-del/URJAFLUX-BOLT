/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 8
 *         UNIVERSAL WORKFLOW ORCHESTRATOR STATE
 * ============================================================================
 * 
 * Defines standard runtime state machines for the workflow pipeline execution.
 * Follows strict TypeScript and the workspace-specific enum directives.
 */

export enum WorkflowExecutionState {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
  CANCELLED = "CANCELLED"
}

export interface StageExecutionReport {
  stageId: string;
  stageName: string;
  state: WorkflowExecutionState;
  durationMs: number;
  startTime: string;
  endTime?: string;
  warnings: string[];
  errors: string[];
  outputKeys: string[];
}
