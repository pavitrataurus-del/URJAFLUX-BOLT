import { ImportContext } from './ImportContext';
import { ImportPipeline, ImportStage } from './ImportPipeline';
import { ImportResult } from './ImportResult';

import { ImportReport } from '../reports/ImportReport';
import { ImportStatistics } from '../reports/ImportStatistics';
import { ImportWarnings } from '../reports/ImportWarnings';

import { DocumentParserService } from '../../knowledge_parsing/services/DocumentParserService';
import { KnowledgeExtractionService } from '../../knowledge_extraction/services/KnowledgeExtractionService';
import { KnowledgeValidationService } from '../../knowledge_extraction/services/KnowledgeValidationService';
import { KnowledgeRepositoryService } from '../../knowledge_extraction/services/KnowledgeRepositoryService';

export interface IOrchestratorOptions {
  readonly version?: string;
  readonly partialConfig?: Record<string, unknown>;
}

export class KnowledgeImportOrchestrator {
  private readonly parserService = DocumentParserService.getInstance();
  private readonly extractionService = KnowledgeExtractionService.getInstance();
  private readonly validationService = KnowledgeValidationService.getInstance();
  private readonly repositoryService = KnowledgeRepositoryService.getInstance();

  public async orchestrateImport(
    file: File | Uint8Array,
    fileName: string,
    bookId: string,
    options?: IOrchestratorOptions
  ): Promise<ImportResult> {
    const startTime = Date.now();
    const importId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const warningsCollection = new ImportWarnings();

    let context = new ImportContext({
      importId,
      bookId,
      version: options?.version || '1.0.0-BUILD-018A'
    });

    try {
      // Stage 1: REGISTER_DOCUMENT
      context = context.setStage('REGISTER_DOCUMENT');
      const regStart = Date.now();
      const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : 'txt';
      const packageHash = `hash_${bookId}_${Date.now()}`;
      context = context.recordStageTiming('REGISTER_DOCUMENT', Date.now() - regStart);

      // Stage 2: PARSE_DOCUMENT
      context = context.setStage('PARSE_DOCUMENT');
      const parseStart = Date.now();
      const parseResult = await this.parserService.parsePackage(file, fileName, packageHash, ext);
      context = context.recordStageTiming('PARSE_DOCUMENT', Date.now() - parseStart);

      if (!parseResult.success || !parseResult.document) {
        const parseErr = parseResult.errorMessage || 'Failed to parse document';
        context = context.addError(parseErr).setStage('FAILED');
        return this.buildFailureResult(context, warningsCollection, startTime, parseErr);
      }

      const parsedDocument = parseResult.document;
      const pagesCount = parsedDocument.metadata?.pageCount || parsedDocument.structure?.chapters?.length || 1;
      context = context.setStageCount('pagesParsed', pagesCount);

      if (parseResult.validationReport) {
        parseResult.validationReport.warnings.forEach((warn) => {
          warningsCollection.addWarning(warn.message, 'PARSING', warn.code);
          context = context.addWarning(warn.message);
        });
        parseResult.validationReport.errors.forEach((err) => {
          context = context.addError(`[${err.code}] ${err.message}`);
        });
      }

      // Stage 3: EXTRACT_KNOWLEDGE
      context = context.setStage('EXTRACT_KNOWLEDGE');
      const extractStart = Date.now();
      const extractionResult = await this.extractionService.extractKnowledge(
        parsedDocument,
        options?.partialConfig
      );
      context = context.recordStageTiming('EXTRACT_KNOWLEDGE', Date.now() - extractStart);

      const knowledgePackage = extractionResult.knowledgePackage;
      context = context
        .setStageCount('knowledgeObjects', knowledgePackage.objects.length)
        .setStageCount('relationships', knowledgePackage.relationships.length);

      if (extractionResult.pipelineContext.warnings.length > 0) {
        extractionResult.pipelineContext.warnings.forEach((w) => {
          warningsCollection.addWarning(w.message, 'EXTRACTION', w.code);
          context = context.addWarning(w.message);
        });
      }

      // Stage 4 & 5: VALIDATE & CANONICALIZE
      context = context.setStage('VALIDATE');
      const valStart = Date.now();
      const validatedResult = await this.validationService.validateAndRefinePackage(knowledgePackage);
      context = context
        .recordStageTiming('VALIDATE', Date.now() - valStart)
        .setStage('CANONICALIZE')
        .recordStageTiming('CANONICALIZE', 0)
        .setStageCount('canonicalEntities', validatedResult.canonicalEntities.length)
        .setStageCount('duplicates', validatedResult.metrics.duplicateCount)
        .setStageCount('conflicts', validatedResult.metrics.conflictCount);

      if (validatedResult.warnings.length > 0) {
        validatedResult.warnings.forEach((w) => {
          warningsCollection.addWarning(w, 'VALIDATION', 'WARN_VALIDATION');
          context = context.addWarning(w);
        });
      }

      if (validatedResult.errors.length > 0) {
        validatedResult.errors.forEach((e) => context = context.addError(e));
      }

      // Stage 6: STORE
      context = context.setStage('STORE');
      const storeStart = Date.now();
      const repoResult = await this.repositoryService.persistValidatedResult(validatedResult);
      context = context.recordStageTiming('STORE', Date.now() - storeStart);

      if (!repoResult.records[0]) {
        const repoErr = repoResult.errors.join('; ') || 'Failed to persist knowledge in repository';
        context = context.addError(repoErr).setStage('FAILED');
        return this.buildFailureResult(context, warningsCollection, startTime, repoErr);
      }

      // Stage 7: BUILD_INDEX
      context = context.setStage('BUILD_INDEX');
      const indexStart = Date.now();
      const indexStats = this.repositoryService.getIndexManager().getIndexStats();
      context = context
        .recordStageTiming('BUILD_INDEX', Date.now() - indexStart)
        .setStageCount('indexesActive', indexStats.length);

      // Stage 8: GENERATE_REPORT
      context = context.setStage('GENERATE_REPORT');
      const totalTimeMs = Date.now() - startTime;

      const stats = new ImportStatistics({
        booksImported: 1,
        pagesParsed: pagesCount,
        knowledgeObjects: validatedResult.validatedObjects.length,
        canonicalEntities: validatedResult.canonicalEntities.length,
        relationships: knowledgePackage.relationships.length,
        duplicates: validatedResult.metrics.duplicateCount,
        conflicts: validatedResult.metrics.conflictCount,
        warningsCount: warningsCollection.count,
        errorsCount: context.errors.length,
        executionTimeMs: totalTimeMs
      });

      const report = new ImportReport({
        importId,
        bookId,
        documentId: parsedDocument.documentId,
        status: 'SUCCESS',
        statistics: stats,
        warnings: warningsCollection,
        errors: context.errors,
        executionTime: totalTimeMs,
        completedAt: Date.now()
      });

      // Stage 9: COMPLETED
      context = context.setStage('COMPLETED', 100);

      return new ImportResult({
        importId,
        bookId,
        documentId: parsedDocument.documentId,
        success: true,
        stage: 'COMPLETED',
        report,
        executionTimeMs: totalTimeMs,
        warnings: warningsCollection.toStringArray(),
        errors: context.errors
      });
    } catch (err) {
      const totalTimeMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      context = context.addError(errorMsg).setStage('FAILED', 0);
      return this.buildFailureResult(context, warningsCollection, startTime, errorMsg);
    }
  }

  private buildFailureResult(
    context: ImportContext,
    warnings: ImportWarnings,
    startTime: number,
    fatalError: string
  ): ImportResult {
    const totalTimeMs = Date.now() - startTime;

    const stats = new ImportStatistics({
      booksImported: 0,
      pagesParsed: context.stageCounts['pagesParsed'] || 0,
      knowledgeObjects: context.stageCounts['knowledgeObjects'] || 0,
      canonicalEntities: context.stageCounts['canonicalEntities'] || 0,
      relationships: context.stageCounts['relationships'] || 0,
      duplicates: context.stageCounts['duplicates'] || 0,
      conflicts: context.stageCounts['conflicts'] || 0,
      warningsCount: warnings.count,
      errorsCount: context.errors.length,
      executionTimeMs: totalTimeMs
    });

    const report = new ImportReport({
      importId: context.importId,
      bookId: context.bookId,
      documentId: context.documentId,
      status: 'FAILED',
      statistics: stats,
      warnings,
      errors: context.errors,
      executionTime: totalTimeMs,
      completedAt: Date.now(),
      summary: `Import ${context.importId} failed at stage ${context.currentStage}: ${fatalError}`
    });

    return new ImportResult({
      importId: context.importId,
      bookId: context.bookId,
      documentId: context.documentId,
      success: false,
      stage: 'FAILED',
      report,
      executionTimeMs: totalTimeMs,
      warnings: warnings.toStringArray(),
      errors: [fatalError, ...context.errors]
    });
  }
}
