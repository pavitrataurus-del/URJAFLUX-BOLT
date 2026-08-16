import { PipelineStage } from './PipelineStage';
import { IPipelineMetricsData } from './PipelineMetrics';

export interface PipelineStartedEvent {
  readonly type: 'PIPELINE_STARTED';
  readonly executionId: string;
  readonly documentId: string;
  readonly sourceFileName: string;
  readonly timestamp: number;
}

export interface StageStartedEvent {
  readonly type: 'STAGE_STARTED';
  readonly executionId: string;
  readonly stage: PipelineStage;
  readonly timestamp: number;
}

export interface StageCompletedEvent {
  readonly type: 'STAGE_COMPLETED';
  readonly executionId: string;
  readonly stage: PipelineStage;
  readonly durationMs: number;
  readonly timestamp: number;
}

export interface StageFailedEvent {
  readonly type: 'STAGE_FAILED';
  readonly executionId: string;
  readonly stage: PipelineStage;
  readonly error: string;
  readonly isFatal: boolean;
  readonly timestamp: number;
}

export interface WarningRaisedEvent {
  readonly type: 'WARNING_RAISED';
  readonly executionId: string;
  readonly stage: PipelineStage;
  readonly code: string;
  readonly message: string;
  readonly timestamp: number;
}

export interface ErrorRaisedEvent {
  readonly type: 'ERROR_RAISED';
  readonly executionId: string;
  readonly stage: PipelineStage;
  readonly code: string;
  readonly message: string;
  readonly isFatal: boolean;
  readonly timestamp: number;
}

export interface PipelineCompletedEvent {
  readonly type: 'PIPELINE_COMPLETED';
  readonly executionId: string;
  readonly packageId?: string;
  readonly metrics: IPipelineMetricsData;
  readonly timestamp: number;
}

export interface PipelineCancelledEvent {
  readonly type: 'PIPELINE_CANCELLED';
  readonly executionId: string;
  readonly reason: string;
  readonly timestamp: number;
}

export type PipelineEvent =
  | PipelineStartedEvent
  | StageStartedEvent
  | StageCompletedEvent
  | StageFailedEvent
  | WarningRaisedEvent
  | ErrorRaisedEvent
  | PipelineCompletedEvent
  | PipelineCancelledEvent;

export type PipelineEventListener = (event: PipelineEvent) => void;

export interface IPipelineEventEmitter {
  addEventListener(listener: PipelineEventListener): () => void;
  removeEventListener(listener: PipelineEventListener): void;
  emit(event: PipelineEvent): void;
}
