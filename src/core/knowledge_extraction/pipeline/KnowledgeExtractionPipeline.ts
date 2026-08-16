import { ParsedDocument, BaseNode } from '../../knowledge_parsing/types/document.types';
import { IKnowledgeEngineConfig } from '../types/config.types';
import { DEFAULT_KNOWLEDGE_CONFIG } from '../config/knowledge.config';
import { KnowledgePackage } from '../models/KnowledgePackage';
import { PipelineStage } from './PipelineStage';
import {
  PipelineContext,
  CancellationToken,
  ICancellationToken,
  IPipelineError
} from './PipelineContext';
import { PipelineResult } from './PipelineResult';
import {
  PipelineEventListener,
  IPipelineEventEmitter,
  PipelineEvent
} from './PipelineEvents';
import { PipelineLogger } from '../utils/pipelineLogger';
import { generateExecutionId, generatePackageId, safeStageTransition } from '../utils/pipelineHelpers';

export class KnowledgeExtractionPipeline implements IPipelineEventEmitter {
  public static readonly PIPELINE_VERSION = '1.0.0-BUILD-017C.2';
  private readonly listeners: PipelineEventListener[] = [];

  public addEventListener(listener: PipelineEventListener): () => void {
    if (!this.listeners) (this as any).listeners = [];
    this.listeners.push(listener);
    return () => this.removeEventListener(listener);
  }

  public addListener(listener: PipelineEventListener): () => void {
    return this.addEventListener(listener);
  }

  public on(event: string | PipelineEventListener, listener?: PipelineEventListener): () => void {
    if (typeof event === 'function') return this.addEventListener(event);
    if (typeof listener === 'function') return this.addEventListener(listener);
    return () => {};
  }

  public removeEventListener(listener: PipelineEventListener): void {
    if (!this.listeners) return;
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  public emit(event: PipelineEvent): void {
    if (!this.listeners) return;
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Safe event callback handler
      }
    });
  }

  public async execute(
    document: ParsedDocument,
    config: IKnowledgeEngineConfig = DEFAULT_KNOWLEDGE_CONFIG,
    cancellationToken: ICancellationToken = new CancellationToken()
  ): Promise<PipelineResult> {
    const executionId = generateExecutionId();
    const startTime = Date.now();

    PipelineLogger.logPipelineStart(executionId, document.documentId, document.fileName);

    let ctx = new PipelineContext({
      executionId,
      pipelineVersion: KnowledgeExtractionPipeline.PIPELINE_VERSION,
      document,
      config,
      cancellationToken,
      createdAt: startTime,
      currentStage: PipelineStage.INITIALIZED,
      warnings: [],
      errors: [],
      intermediateObjects: [],
      intermediateRelationships: [],
      intermediateEvidence: [],
      collectedNodes: [],
      sharedContext: new Map()
    });

    this.emit({
      type: 'PIPELINE_STARTED',
      executionId,
      documentId: document.documentId,
      sourceFileName: document.fileName,
      timestamp: startTime
    });

    try {
      // Stage 1: DOCUMENT_VALIDATION
      ctx = await this.runStage(ctx, PipelineStage.DOCUMENT_VALIDATION, async (c) => {
        if (!c.document.documentId || !c.document.fileName) {
          return c.addError('ERR_INVALID_DOC', 'Document missing mandatory documentId or fileName', true);
        }
        return c;
      });

      // Stage 2: DOCUMENT_PREPARATION
      ctx = await this.runStage(ctx, PipelineStage.DOCUMENT_PREPARATION, async (c) => {
        // Architecture stage: Prepare document structure hierarchy index
        return c;
      });

      // Stage 3: NODE_COLLECTION
      ctx = await this.runStage(ctx, PipelineStage.NODE_COLLECTION, async (c) => {
        const nodes: BaseNode[] = [];
        // Flatten nodes from chapters and unassigned sections
        c.document.structure.chapters.forEach((ch) => {
          ch.sections.forEach((sec) => {
            sec.nodes.forEach((n) => nodes.push(n));
          });
        });
        c.document.structure.unassignedSections.forEach((sec) => {
          sec.nodes.forEach((n) => nodes.push(n));
        });
        return c.setCollectedNodes(nodes);
      });

      // Stage 4: NORMALIZATION
      ctx = await this.runStage(ctx, PipelineStage.NORMALIZATION, async (c) => {
        // Architecture stage: Normalization rules ready for implementation
        return c;
      });

      // Stage 5: EXTRACTOR_DISPATCH
      ctx = await this.runStage(ctx, PipelineStage.EXTRACTOR_DISPATCH, async (c) => {
        // Architecture stage: Strategy extractors dispatch ready for implementation
        return c;
      });

      // Stage 6: KNOWLEDGE_COLLECTION
      ctx = await this.runStage(ctx, PipelineStage.KNOWLEDGE_COLLECTION, async (c) => {
        // Architecture stage: Knowledge aggregation
        return c;
      });

      // Stage 7: VALIDATION
      ctx = await this.runStage(ctx, PipelineStage.VALIDATION, async (c) => {
        // Architecture stage: Knowledge validation
        return c;
      });

      // Stage 8: PACKAGE_BUILD
      let createdPackage: KnowledgePackage | undefined;
      ctx = await this.runStage(ctx, PipelineStage.PACKAGE_BUILD, async (c) => {
        const pkgId = generatePackageId(c.document.documentId);
        createdPackage = new KnowledgePackage({
          packageId: pkgId,
          documentId: c.document.documentId,
          packageHash: c.document.packageHash,
          sourceFileName: c.document.fileName,
          version: KnowledgeExtractionPipeline.PIPELINE_VERSION,
          createdAt: Date.now(),
          objects: c.intermediateObjects,
          relationships: c.intermediateRelationships,
          evidenceList: c.intermediateEvidence,
          metrics: {
            knowledgeObjectCount: c.intermediateObjects.length,
            relationshipCount: c.intermediateRelationships.length,
            evidenceCount: c.intermediateEvidence.length,
            warningCount: c.warnings.length,
            errorCount: c.errors.length,
            executionTimeMs: Date.now() - startTime,
            memoryEstimateBytes: c.metrics.peakMemoryEstimateBytes,
            pipelineVersion: KnowledgeExtractionPipeline.PIPELINE_VERSION,
            extractedAt: Date.now()
          },
          metadata: {
            executionId,
            pipelineVersion: KnowledgeExtractionPipeline.PIPELINE_VERSION
          }
        });
        return c;
      });

      // Finalize Pipeline COMPLETED
      ctx.metricsTracker.finish(PipelineStage.COMPLETED);
      ctx = ctx.withStage(PipelineStage.COMPLETED);

      const fatalErrors = ctx.errors.filter((e) => e.isFatal);
      const recoverableErrors = ctx.errors.filter((e) => !e.isFatal);
      const isSuccess = fatalErrors.length === 0;

      const result = new PipelineResult({
        success: isSuccess,
        executionId,
        knowledgePackage: createdPackage,
        metrics: ctx.metrics,
        warnings: ctx.warnings,
        recoverableErrors,
        fatalErrors,
        executionTimeMs: Date.now() - startTime,
        pipelineVersion: KnowledgeExtractionPipeline.PIPELINE_VERSION,
        completedAt: Date.now()
      });

      this.emit({
        type: 'PIPELINE_COMPLETED',
        executionId,
        packageId: createdPackage?.packageId,
        metrics: ctx.metrics,
        timestamp: Date.now()
      });

      PipelineLogger.logPipelineEnd(
        executionId,
        isSuccess,
        result.executionTimeMs,
        createdPackage?.packageId
      );

      return result;
    } catch (err: unknown) {
      const isCancellation = ctx.cancellationToken.isCancelled;
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (isCancellation) {
        ctx.metricsTracker.finish(PipelineStage.CANCELLED);
        this.emit({
          type: 'PIPELINE_CANCELLED',
          executionId,
          reason: errorMsg,
          timestamp: Date.now()
        });

        PipelineLogger.logPipelineEnd(executionId, false, Date.now() - startTime);

        return new PipelineResult({
          success: false,
          executionId,
          metrics: ctx.metrics,
          warnings: ctx.warnings,
          recoverableErrors: ctx.errors.filter((e) => !e.isFatal),
          fatalErrors: ctx.errors.filter((e) => e.isFatal),
          executionTimeMs: Date.now() - startTime,
          pipelineVersion: KnowledgeExtractionPipeline.PIPELINE_VERSION,
          completedAt: Date.now()
        });
      }

      ctx.metricsTracker.failStage(ctx.currentStage, errorMsg);
      const fatalErr: IPipelineError = {
        code: 'ERR_STAGE_EXCEPTION',
        message: errorMsg,
        stage: ctx.currentStage,
        isFatal: true,
        timestamp: Date.now(),
        cause: err
      };

      PipelineLogger.logPipelineError(
        executionId,
        ctx.currentStage,
        'ERR_STAGE_EXCEPTION',
        errorMsg,
        true,
        err
      );

      this.emit({
        type: 'STAGE_FAILED',
        executionId,
        stage: ctx.currentStage,
        error: errorMsg,
        isFatal: true,
        timestamp: Date.now()
      });

      const finalFatal = [...ctx.errors.filter((e) => e.isFatal), fatalErr];

      return new PipelineResult({
        success: false,
        executionId,
        metrics: ctx.metrics,
        warnings: ctx.warnings,
        recoverableErrors: ctx.errors.filter((e) => !e.isFatal),
        fatalErrors: finalFatal,
        executionTimeMs: Date.now() - startTime,
        pipelineVersion: KnowledgeExtractionPipeline.PIPELINE_VERSION,
        completedAt: Date.now()
      });
    }
  }

  private async runStage(
    context: PipelineContext,
    stage: PipelineStage,
    stageFn: (ctx: PipelineContext) => Promise<PipelineContext>
  ): Promise<PipelineContext> {
    context.throwIfCancelled();
    const currentCtx = safeStageTransition(context, stage);
    currentCtx.metricsTracker.startStage(stage);

    PipelineLogger.logStageStart(currentCtx.executionId, stage);
    this.emit({
      type: 'STAGE_STARTED',
      executionId: currentCtx.executionId,
      stage,
      timestamp: Date.now()
    });

    const stageStartTime = Date.now();
    let updatedCtx = await stageFn(currentCtx);

    updatedCtx.throwIfCancelled();

    // Check if stage logged fatal errors
    const fatalErrors = updatedCtx.errors.filter((e) => e.isFatal && e.stage === stage);
    if (fatalErrors.length > 0) {
      const primaryError = fatalErrors[0];
      updatedCtx.metricsTracker.failStage(stage, primaryError.message);
      throw new Error(`[Stage Fatal Error][${primaryError.code}]: ${primaryError.message}`);
    }

    const durationMs = Date.now() - stageStartTime;
    updatedCtx.metricsTracker.completeStage(stage);
    PipelineLogger.logStageFinish(updatedCtx.executionId, stage, durationMs);

    this.emit({
      type: 'STAGE_COMPLETED',
      executionId: updatedCtx.executionId,
      stage,
      durationMs,
      timestamp: Date.now()
    });

    return updatedCtx;
  }
}
