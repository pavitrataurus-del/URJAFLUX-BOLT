import { ParsedDocument } from '../types/document.types';
import { ParserConfig, ParsingMetrics } from '../types/parser.types';
import { ParsingPipelineResult, ParsingPipelineContext, ParsingPipelineStage } from '../types/pipeline.types';
import { DEFAULT_PARSER_CONFIG } from '../utils/config';
import { parsingPipeline } from '../pipeline/ParsingPipeline';
import { logger } from '../../knowledge_ingestion/utils/logger';

export class DocumentParserService {
  private static instance: DocumentParserService;
  private parsedDocumentsCache: Map<string, ParsedDocument> = new Map();
  private documentMetricsCache: Map<string, ParsingMetrics> = new Map();
  private config: ParserConfig = DEFAULT_PARSER_CONFIG;

  private constructor() {}

  public static getInstance(): DocumentParserService {
    if (!DocumentParserService.instance) {
      DocumentParserService.instance = new DocumentParserService();
    }
    return DocumentParserService.instance;
  }

  public getConfig(): ParserConfig {
    return { ...this.config };
  }

  public updateConfig(patch: Partial<ParserConfig>): void {
    this.config = { ...this.config, ...patch };
    logger.info('DocumentParserService configuration updated', { patch });
  }

  public async parsePackage(
    file: File | Uint8Array,
    fileName: string,
    packageHash: string,
    extension: string
  ): Promise<ParsingPipelineResult> {
    const context: ParsingPipelineContext = {
      file,
      fileName,
      packageHash,
      extension,
      config: this.config,
      stageTimings: new Map<ParsingPipelineStage, number>()
    };

    const result = await parsingPipeline.execute(context);

    if (result.success && result.document && result.metrics) {
      this.parsedDocumentsCache.set(result.document.documentId, result.document);
      this.documentMetricsCache.set(result.document.documentId, result.metrics);
    }

    return result;
  }

  public getParsedDocument(documentId: string): ParsedDocument | undefined {
    return this.parsedDocumentsCache.get(documentId);
  }

  public getMetrics(documentId: string): ParsingMetrics | undefined {
    return this.documentMetricsCache.get(documentId);
  }

  public getAllParsedDocuments(): readonly ParsedDocument[] {
    return Array.from(this.parsedDocumentsCache.values());
  }

  public clearCache(): void {
    this.parsedDocumentsCache.clear();
    this.documentMetricsCache.clear();
  }
}

export const documentParserService = DocumentParserService.getInstance();
