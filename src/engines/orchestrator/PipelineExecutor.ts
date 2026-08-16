/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 8
 *         UNIVERSAL PIPELINE EXECUTOR
 * ============================================================================
 * 
 * Pipeline executor running sequentially registered stages with robust pre-checks,
 * performance instrumentation, warning/error capture, and customizable fail-soft abort policies.
 */

import { WorkflowContext, WorkflowStage, WorkflowPlugin } from "./WorkflowTypes";
import { WorkflowExecutionState, StageExecutionReport } from "./ExecutionState";
import { WorkflowLogger } from "./WorkflowLogger";

export interface PipelineExecutorOptions {
  logger: WorkflowLogger;
  plugins?: WorkflowPlugin[];
  abortOnFailure?: boolean;
}

export class PipelineExecutor {
  private logger: WorkflowLogger;
  private plugins: WorkflowPlugin[];
  private abortOnFailure: boolean;

  constructor(options: PipelineExecutorOptions) {
    this.logger = options.logger;
    this.plugins = options.plugins || [];
    this.abortOnFailure = options.abortOnFailure !== false; // defaults to true
  }

  /**
   * Orchestrates the sequential execution of stages on the active context.
   * Modifies context in-place as values accumulate.
   */
  public async execute(
    stages: WorkflowStage[],
    context: WorkflowContext
  ): Promise<{ success: boolean; reports: StageExecutionReport[] }> {
    const pipelineStartTime = performance.now();
    let pipelineSuccess = true;

    for (const stage of stages) {
      if (!pipelineSuccess && this.abortOnFailure) {
        // Log skip for subsequent stages
        const skipReport: StageExecutionReport = {
          stageId: stage.stageId,
          stageName: stage.name,
          state: WorkflowExecutionState.SKIPPED,
          durationMs: 0,
          startTime: new Date().toISOString(),
          warnings: ["Pipeline execution was aborted due to a previous stage failure."],
          errors: [],
          outputKeys: []
        };
        this.logger.logStage(skipReport);
        continue;
      }

      const stageStartTimeMs = performance.now();
      const startTimeIso = new Date().toISOString();

      // Trigger pre-stage plugin hooks
      this.plugins.forEach(plugin => {
        try {
          plugin.onBeforeStage?.(stage.stageId, context);
        } catch (err: unknown) {
          console.warn(
            `[PipelineExecutor] Plugin "${plugin.pluginId}" pre-hook threw an exception on stage "${stage.stageId}":`,
            err
          );
        }
      });

      let stageState = WorkflowExecutionState.RUNNING;
      let stageWarnings: string[] = [];
      let stageErrors: string[] = [];
      let outputsProduced: string[] = [];

      try {
        // Stage self-validation: ensure context has the required fields
        if (!context.project.id || !context.property.id) {
          throw new Error("Pre-execution Context Validation Failed: Missing mandatory Project or Property identification.");
        }

        // Execute stage logic
        const result = await stage.execute(context);
        
        stageWarnings = result.warnings;
        stageErrors = result.errors;

        if (result.success) {
          stageState = WorkflowExecutionState.COMPLETED;
          
          // Merge generated outputs back into the shared workflow context
          Object.assign(context, result.outputs);
          outputsProduced = Object.keys(result.outputs);
        } else {
          stageState = WorkflowExecutionState.FAILED;
          pipelineSuccess = false;
        }

      } catch (err: unknown) {
        stageState = WorkflowExecutionState.FAILED;
        pipelineSuccess = false;
        const msg = err instanceof Error ? err.message : String(err);
        stageErrors.push(msg);
      }

      const durationMs = performance.now() - stageStartTimeMs;
      
      const report: StageExecutionReport = {
        stageId: stage.stageId,
        stageName: stage.name,
        state: stageState,
        durationMs,
        startTime: startTimeIso,
        endTime: new Date().toISOString(),
        warnings: stageWarnings,
        errors: stageErrors,
        outputKeys: outputsProduced
      };

      // Record stage outcomes
      this.logger.logStage(report);

      // Trigger post-stage plugin hooks
      this.plugins.forEach(plugin => {
        try {
          plugin.onAfterStage?.(stage.stageId, context, report);
        } catch (err: unknown) {
          console.warn(
            `[PipelineExecutor] Plugin "${plugin.pluginId}" post-hook threw an exception on stage "${stage.stageId}":`,
            err
          );
        }
      });
    }

    return {
      success: pipelineSuccess,
      reports: this.logger.getReports()
    };
  }
}
