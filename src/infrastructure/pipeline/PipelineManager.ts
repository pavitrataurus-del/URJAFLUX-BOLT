import { IPipelineDefinition, IPipelineContext } from "./PipelineTypes";
import { Pipeline } from "./Pipeline";

export class PipelineManager {
  private static instance: PipelineManager;
  private activePipelines: Map<string, Pipeline> = new Map();

  private constructor() {}

  public static getInstance(): PipelineManager {
    if (!PipelineManager.instance) {
      PipelineManager.instance = new PipelineManager();
    }
    return PipelineManager.instance;
  }

  public createPipeline(definition: IPipelineDefinition, context: IPipelineContext): Pipeline {
    const pipeline = new Pipeline(definition, context);
    this.activePipelines.set(context.id, pipeline);
    return pipeline;
  }

  public getPipeline(pipelineId: string): Pipeline | undefined {
    return this.activePipelines.get(pipelineId);
  }

  public removePipeline(pipelineId: string): void {
    this.activePipelines.delete(pipelineId);
  }
}
