export enum PipelineStatus {
  INITIALIZED = "INITIALIZED",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface IPipelineContext {
  id: string;
  tenantId?: string;
  metadata: Record<string, any>;
  state: Record<string, any>;
}

export interface IPipelineStage<TInput = any, TOutput = any> {
  id: string;
  name: string;
  execute(input: TInput, context: IPipelineContext): Promise<TOutput>;
  rollback?(context: IPipelineContext): Promise<void>;
}

export interface IPipelineDefinition {
  id: string;
  name: string;
  stages: IPipelineStage[];
}

export interface IPipelineExecutionResult {
  pipelineId: string;
  status: PipelineStatus;
  output?: any;
  error?: Error;
  durationMs: number;
}
