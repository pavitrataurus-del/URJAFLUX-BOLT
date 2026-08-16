/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 8
 *         UNIVERSAL WORKFLOW ORCHESTRATOR LOGGER
 * ============================================================================
 * 
 * Performance logging and audit trail tracker for multi-stage workflow pipelines.
 */

import { WorkflowLogger as IWorkflowLogger, WorkflowContext } from "./WorkflowTypes";
import { StageExecutionReport } from "./ExecutionState";

export class WorkflowLogger implements IWorkflowLogger {
  private reports: StageExecutionReport[] = [];
  private activePipelineId: string | null = null;
  private pipelineStartTimeMs = 0;

  public logPipelineStart(pipelineId: string, context: WorkflowContext): void {
    this.activePipelineId = pipelineId;
    this.pipelineStartTimeMs = performance.now();
    this.reports = [];
    
    console.log(
      `[WorkflowOrchestrator] Starting Pipeline "${pipelineId}" triggered by ${context.metadata.executorEmail}.`
    );
  }

  public logStage(report: StageExecutionReport): void {
    this.reports.push(report);
    console.log(
      `[WorkflowOrchestrator] Stage "${report.stageId}" completed as ${report.state} in ${report.durationMs.toFixed(2)}ms.`
    );
    if (report.warnings.length > 0) {
      console.warn(`[WorkflowOrchestrator] [Stage: ${report.stageId}] Warnings:`, report.warnings);
    }
    if (report.errors.length > 0) {
      console.error(`[WorkflowOrchestrator] [Stage: ${report.stageId}] Errors:`, report.errors);
    }
  }

  public logPipelineEnd(pipelineId: string, success: boolean, durationMs: number): void {
    const outcome = success ? "SUCCESS" : "FAILURE";
    console.log(
      `[WorkflowOrchestrator] Pipeline "${pipelineId}" execution finished with status: [${outcome}] in ${durationMs.toFixed(2)}ms.`
    );
    this.activePipelineId = null;
  }

  public getReports(): StageExecutionReport[] {
    return [...this.reports];
  }

  public clear(): void {
    this.reports = [];
    this.activePipelineId = null;
  }
}
