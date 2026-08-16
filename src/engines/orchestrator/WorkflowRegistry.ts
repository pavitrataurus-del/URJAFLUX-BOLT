/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 8
 *         UNIVERSAL WORKFLOW REGISTRY
 * ============================================================================
 * 
 * Reusable Registry interface to dynamic-register workflow plugins, pipelines,
 * stages, and future custom domain models.
 */

import { WorkflowStage, WorkflowPipeline, WorkflowPlugin } from "./WorkflowTypes";

export class WorkflowRegistry {
  private stages = new Map<string, WorkflowStage>();
  private pipelines = new Map<string, WorkflowPipeline>();
  private plugins = new Map<string, WorkflowPlugin>();

  /**
   * Registers an execution stage.
   */
  public registerStage(stage: WorkflowStage): void {
    if (this.stages.has(stage.stageId)) {
      throw new Error(`[WorkflowRegistry] Execution stage with ID "${stage.stageId}" is already registered.`);
    }
    this.stages.set(stage.stageId, stage);
  }

  /**
   * Retrieves an execution stage.
   */
  public getStage(stageId: string): WorkflowStage | undefined {
    return this.stages.get(stageId);
  }

  /**
   * Registers a full execution pipeline.
   */
  public registerPipeline(pipeline: WorkflowPipeline): void {
    if (this.pipelines.has(pipeline.pipelineId)) {
      throw new Error(`[WorkflowRegistry] Pipeline with ID "${pipeline.pipelineId}" is already registered.`);
    }
    this.pipelines.set(pipeline.pipelineId, pipeline);
  }

  /**
   * Retrieves a full pipeline.
   */
  public getPipeline(pipelineId: string): WorkflowPipeline | undefined {
    return this.pipelines.get(pipelineId);
  }

  /**
   * Registers a custom workflow plugin.
   */
  public registerPlugin(plugin: WorkflowPlugin): void {
    if (this.plugins.has(plugin.pluginId)) {
      throw new Error(`[WorkflowRegistry] Workflow plugin with ID "${plugin.pluginId}" is already registered.`);
    }
    this.plugins.set(plugin.pluginId, plugin);
  }

  /**
   * Lists all registered workflow plugins.
   */
  public getPlugins(): WorkflowPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Cleans down active configurations.
   */
  public clear(): void {
    this.stages.clear();
    this.pipelines.clear();
    this.plugins.clear();
  }
}
