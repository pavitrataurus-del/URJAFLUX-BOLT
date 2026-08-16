import { FileMetadata } from './ingestion.types';

export enum PipelineStageType {
  VALIDATION = 'VALIDATION',
  REGISTER = 'REGISTER',
  UPLOAD = 'UPLOAD',
  OCR = 'OCR',
  PARSING = 'PARSING',
  EXTRACTION = 'EXTRACTION',
  NORMALIZATION = 'NORMALIZATION',
  INDEXING = 'INDEXING'
}

export interface PipelineContext {
  readonly packageId: string;
  readonly metadata: FileMetadata;
  readonly rawFileRef?: File;
  readonly options?: Record<string, unknown>;
  readonly currentStage: PipelineStageType;
  readonly executionParams?: Record<string, unknown>;
}

export interface PipelineResult<T = unknown> {
  readonly success: boolean;
  readonly stage: PipelineStageType;
  readonly data?: T;
  readonly errorMessage?: string;
  readonly executionTimeMs: number;
}

export interface PipelineProcessor<TInput = unknown, TOutput = unknown> {
  readonly stageType: PipelineStageType;
  execute(context: PipelineContext, input?: TInput): Promise<PipelineResult<TOutput>>;
}

export interface ProcessingPipeline {
  readonly pipelineId: string;
  readonly stages: readonly PipelineStageType[];
  executePipeline(context: PipelineContext): Promise<readonly PipelineResult[]>;
}
