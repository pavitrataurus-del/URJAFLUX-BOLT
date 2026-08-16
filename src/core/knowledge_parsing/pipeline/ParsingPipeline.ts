import {
  ParsingPipelineStage,
  ParsingPipelineContext,
  ParsingStageResult,
  ParsingPipelineResult
} from '../types/pipeline.types';
import { ParsedDocument } from '../types/document.types';
import { parserRegistry } from '../services/ParserRegistry';
import { documentValidator } from '../validators/documentValidator';
import { logger } from '../../knowledge_ingestion/utils/logger';
import { SupportedFileExtension } from '../../knowledge_ingestion/types/ingestion.types';

export class ParsingPipeline {
  public async execute(context: ParsingPipelineContext): Promise<ParsingPipelineResult> {
    const pipelineStartTime = Date.now();
    const stageResults: ParsingStageResult[] = [];

    logger.info('Starting Enterprise Parsing Pipeline', {
      fileName: context.fileName,
      extension: context.extension
    });

    let currentDocument: Partial<ParsedDocument> = {
      fileName: context.fileName,
      packageHash: context.packageHash
    };

    // Stage 1: Package Validation
    const stage1Start = Date.now();
    if (!context.file || (context.file instanceof File && context.file.size === 0)) {
      const duration = Date.now() - stage1Start;
      stageResults.push({
        stage: ParsingPipelineStage.PACKAGE_VALIDATION,
        success: false,
        errorMessage: 'Package file is null or 0 bytes.',
        durationMs: duration
      });
      return {
        success: false,
        stageResults,
        totalDurationMs: Date.now() - pipelineStartTime,
        errorMessage: 'Package validation failed.'
      };
    }
    stageResults.push({
      stage: ParsingPipelineStage.PACKAGE_VALIDATION,
      success: true,
      durationMs: Date.now() - stage1Start
    });

    // Stage 2: Parser Selection
    const stage2Start = Date.now();
    const ext = context.extension.toLowerCase() as SupportedFileExtension;
    const parser = parserRegistry.getParserForExtension(ext);

    if (!parser) {
      const duration = Date.now() - stage2Start;
      stageResults.push({
        stage: ParsingPipelineStage.PARSER_SELECTION,
        success: false,
        errorMessage: `No registered parser for extension .${ext}`,
        durationMs: duration
      });
      return {
        success: false,
        stageResults,
        totalDurationMs: Date.now() - pipelineStartTime,
        errorMessage: `Unsupported file extension .${ext}`
      };
    }
    context.selectedParserId = parser.parserId;
    stageResults.push({
      stage: ParsingPipelineStage.PARSER_SELECTION,
      success: true,
      data: { parserId: parser.parserId },
      durationMs: Date.now() - stage2Start
    });

    // Execute core parser
    const stage3Start = Date.now();
    let parseResult;
    try {
      parseResult = await parser.parse(context.file, context.fileName, context.config);
    } catch (err) {
      return {
        success: false,
        stageResults,
        totalDurationMs: Date.now() - pipelineStartTime,
        errorMessage: `Parser exception: ${String(err)}`
      };
    }

    // Stage 3: Metadata Extraction
    stageResults.push({
      stage: ParsingPipelineStage.METADATA_EXTRACTION,
      success: true,
      data: parseResult.document.metadata,
      durationMs: Date.now() - stage3Start
    });

    // Stage 4: Structure Extraction
    const stage4Start = Date.now();
    stageResults.push({
      stage: ParsingPipelineStage.STRUCTURE_EXTRACTION,
      success: true,
      data: { chapterCount: parseResult.document.metadata.chapterCount },
      durationMs: Date.now() - stage4Start
    });

    // Stage 5: Content Segmentation
    const stage5Start = Date.now();
    stageResults.push({
      stage: ParsingPipelineStage.CONTENT_SEGMENTATION,
      success: true,
      data: parseResult.document.statistics,
      durationMs: Date.now() - stage5Start
    });

    // Stage 6: Document Assembly
    const stage6Start = Date.now();
    currentDocument = parseResult.document;
    stageResults.push({
      stage: ParsingPipelineStage.DOCUMENT_ASSEMBLY,
      success: true,
      durationMs: Date.now() - stage6Start
    });

    // Stage 7: Document Validation
    const stage7Start = Date.now();
    const validationReport = documentValidator.validate(parseResult.document);
    stageResults.push({
      stage: ParsingPipelineStage.DOCUMENT_VALIDATION,
      success: validationReport.isValid,
      data: validationReport,
      durationMs: Date.now() - stage7Start
    });

    // Stage 8: Completed
    stageResults.push({
      stage: ParsingPipelineStage.COMPLETED,
      success: true,
      durationMs: 0
    });

    const totalDuration = Date.now() - pipelineStartTime;

    logger.info('Completed Enterprise Parsing Pipeline', {
      fileName: context.fileName,
      totalDurationMs: totalDuration,
      isValid: validationReport.isValid
    });

    return {
      success: true,
      document: parseResult.document,
      metrics: parseResult.metrics,
      validationReport,
      stageResults,
      totalDurationMs: totalDuration
    };
  }
}

export const parsingPipeline = new ParsingPipeline();
