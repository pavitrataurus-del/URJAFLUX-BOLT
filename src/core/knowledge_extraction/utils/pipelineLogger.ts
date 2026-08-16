import { logger } from '../../knowledge_ingestion/utils/logger';
import { PipelineStage } from '../pipeline/PipelineStage';

export class PipelineLogger {
  private static readonly MODULE_TAG = '[KnowledgeExtractionPipeline]';

  public static logPipelineStart(executionId: string, documentId: string, fileName: string): void {
    logger.info(`${PipelineLogger.MODULE_TAG} Pipeline Execution Started`, {
      executionId,
      documentId,
      fileName,
      timestamp: Date.now()
    });
  }

  public static logStageStart(executionId: string, stage: PipelineStage): void {
    logger.debug(`${PipelineLogger.MODULE_TAG} Stage Started: ${stage}`, {
      executionId,
      stage,
      timestamp: Date.now()
    });
  }

  public static logStageFinish(executionId: string, stage: PipelineStage, durationMs: number): void {
    logger.debug(`${PipelineLogger.MODULE_TAG} Stage Finished: ${stage}`, {
      executionId,
      stage,
      durationMs,
      timestamp: Date.now()
    });
  }

  public static logPipelineWarning(executionId: string, stage: PipelineStage, code: string, message: string): void {
    logger.warn(`${PipelineLogger.MODULE_TAG} Warning [${code}] at ${stage}: ${message}`, {
      executionId,
      stage,
      code,
      message,
      timestamp: Date.now()
    });
  }

  public static logPipelineError(
    executionId: string,
    stage: PipelineStage,
    code: string,
    message: string,
    isFatal: boolean,
    cause?: unknown
  ): void {
    const levelName = isFatal ? 'FATAL ERROR' : 'RECOVERABLE ERROR';
    logger.error(`${PipelineLogger.MODULE_TAG} ${levelName} [${code}] at ${stage}: ${message}`, {
      executionId,
      stage,
      code,
      message,
      isFatal,
      cause: cause instanceof Error ? cause.message : cause,
      timestamp: Date.now()
    });
  }

  public static logPipelineEnd(
    executionId: string,
    success: boolean,
    durationMs: number,
    packageId?: string
  ): void {
    logger.info(`${PipelineLogger.MODULE_TAG} Pipeline Execution Ended`, {
      executionId,
      success,
      durationMs,
      packageId,
      timestamp: Date.now()
    });
  }
}
