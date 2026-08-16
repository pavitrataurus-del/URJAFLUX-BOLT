import { IPipelineDefinition, IPipelineContext, PipelineStatus, IPipelineExecutionResult } from "./PipelineTypes";
import { Logger } from "../logging/Logger";
import { TelemetryService } from "../telemetry/TelemetryService";
import { MetricType } from "../telemetry/TelemetryTypes";

export class Pipeline {
  public status: PipelineStatus = PipelineStatus.INITIALIZED;
  private currentStageIndex = 0;

  constructor(
    public readonly definition: IPipelineDefinition,
    public readonly context: IPipelineContext
  ) {}

  public async execute(initialInput?: any): Promise<IPipelineExecutionResult> {
    const logger = Logger.getInstance();
    const telemetry = TelemetryService.getInstance();
    const startTime = Date.now();

    this.status = PipelineStatus.RUNNING;
    logger.info(`Pipeline ${this.definition.id} started.`, { pipelineId: this.context.id });

    let currentInput = initialInput;

    try {
      for (this.currentStageIndex = 0; this.currentStageIndex < this.definition.stages.length; this.currentStageIndex++) {
        if (this.status as PipelineStatus === PipelineStatus.CANCELLED) {
          logger.info(`Pipeline ${this.definition.id} was cancelled.`, { pipelineId: this.context.id });
          break;
        }

        const stage = this.definition.stages[this.currentStageIndex];
        const stageStartTime = Date.now();

        logger.debug(`Executing stage: ${stage.name}`, { pipelineId: this.context.id, stageId: stage.id });
        
        currentInput = await stage.execute(currentInput, this.context);

        const stageDuration = Date.now() - stageStartTime;
        telemetry.record(`pipeline.stage.duration`, stageDuration, MetricType.HISTOGRAM, { stageId: stage.id });
      }

      if (this.status as PipelineStatus !== PipelineStatus.CANCELLED) {
        this.status = PipelineStatus.COMPLETED;
      }
      
      const totalDuration = Date.now() - startTime;
      telemetry.record(`pipeline.duration`, totalDuration, MetricType.HISTOGRAM, { pipelineId: this.definition.id });
      logger.info(`Pipeline ${this.definition.id} finished.`, { pipelineId: this.context.id, durationMs: totalDuration });

      return {
        pipelineId: this.context.id,
        status: this.status,
        output: currentInput,
        durationMs: totalDuration,
      };

    } catch (error: any) {
      this.status = PipelineStatus.FAILED;
      logger.error(`Pipeline ${this.definition.id} failed at stage ${this.definition.stages[this.currentStageIndex]?.name}`, { pipelineId: this.context.id }, error);

      await this.rollback();

      const totalDuration = Date.now() - startTime;
      telemetry.record(`pipeline.duration`, totalDuration, MetricType.HISTOGRAM, { pipelineId: this.definition.id, error: "true" });

      return {
        pipelineId: this.context.id,
        status: this.status,
        error,
        durationMs: totalDuration,
      };
    }
  }

  public cancel(): void {
    if (this.status === PipelineStatus.RUNNING || this.status === PipelineStatus.PAUSED) {
      this.status = PipelineStatus.CANCELLED;
    }
  }

  private async rollback(): Promise<void> {
    const logger = Logger.getInstance();
    logger.info(`Starting rollback for pipeline ${this.definition.id}`, { pipelineId: this.context.id });
    
    // Rollback in reverse order, starting from the current failed stage
    for (let i = this.currentStageIndex; i >= 0; i--) {
      const stage = this.definition.stages[i];
      if (stage.rollback) {
        try {
          await stage.rollback(this.context);
        } catch (rollbackError: any) {
          logger.error(`Rollback failed for stage ${stage.name}`, { pipelineId: this.context.id }, rollbackError);
          // Continue rollback of other stages even if one fails
        }
      }
    }
  }
}
