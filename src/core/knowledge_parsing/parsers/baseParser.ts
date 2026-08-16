import { SupportedFileExtension } from '../../knowledge_ingestion/types/ingestion.types';
import {
  ParsedDocument,
  DocumentMetadata,
  DocumentStructure,
  DocumentStatistics,
  NodeType
} from '../types/document.types';
import {
  IDocumentParser,
  ParserCapabilities,
  ParserConfig,
  ParsingMetrics,
  ParsingWarning,
  ParsingError
} from '../types/parser.types';
import { IParserBackend } from '../types/backend.types';
import { logger } from '../../knowledge_ingestion/utils/logger';

export abstract class BaseDocumentParser implements IDocumentParser {
  abstract readonly parserId: string;
  abstract readonly parserVersion: string;
  abstract readonly capabilities: ParserCapabilities;
  protected abstract readonly backend: IParserBackend;

  public supports(extension: SupportedFileExtension): boolean {
    return this.capabilities.supportedExtensions.includes(extension);
  }

  public abstract validate(file: File | Uint8Array): Promise<boolean>;

  public async extractMetadata(file: File | Uint8Array, fileName: string): Promise<DocumentMetadata> {
    return await this.backend.extractMetadata(file, fileName);
  }

  public async extractStructure(file: File | Uint8Array, config: ParserConfig): Promise<DocumentStructure> {
    return await this.backend.extractStructure(file, config);
  }

  public async parse(
    file: File | Uint8Array,
    fileName: string,
    config: ParserConfig
  ): Promise<{ document: ParsedDocument; metrics: ParsingMetrics }> {
    const startTime = Date.now();
    const warnings: ParsingWarning[] = [];
    const errors: ParsingError[] = [];
    const fileSize = file instanceof File ? file.size : file.byteLength;

    logger.info(`[Parser Engine] Initializing parsing pass`, {
      parserId: this.parserId,
      backendId: this.backend.backendId,
      fileName,
      fileSize
    });

    // 1. Validate File Header / Structure
    const isValid = await this.validate(file).catch((err) => {
      errors.push({
        code: 'VALIDATION_FAILED',
        message: String(err),
        isFatal: false
      });
      return false;
    });

    if (!isValid) {
      warnings.push({
        code: 'FILE_VALIDATION_WARNING',
        message: 'File header validation failed strict checks; proceeding with resilient inspection.'
      });
      logger.warn(`[Parser Engine] Header validation warning for ${fileName}`, { parserId: this.parserId });
    }

    // 2. Extract Metadata safely
    let metadata: DocumentMetadata;
    try {
      metadata = await this.extractMetadata(file, fileName);
      logger.info(`[Parser Engine] Metadata extracted successfully`, { title: metadata.title, pageCount: metadata.pageCount });
    } catch (err) {
      errors.push({
        code: 'METADATA_EXTRACTION_ERROR',
        message: `Error extracting metadata: ${String(err)}`,
        isFatal: false
      });
      metadata = this.getFallbackMetadata(file, fileName);
      logger.error(`[Parser Engine] Metadata extraction failed; used fallback metadata`, { error: String(err) });
    }

    // 3. Extract Structure safely
    let structure: DocumentStructure;
    try {
      structure = await this.extractStructure(file, config);
      if (!this.backend.capabilities.hasTextExtraction && structure.unassignedSections.length === 0 && structure.chapters.length === 0) {
        warnings.push({
          code: 'PARSER_BACKEND_NO_TEXT_EXTRACTOR',
          message: `Active backend ${this.backend.backendId} performs header metadata inspection only. Production library integration is required for deep binary payload structure extraction.`
        });
      }
      logger.info(`[Parser Engine] Structure extracted successfully`, {
        chaptersCount: structure.chapters.length,
        unassignedSectionsCount: structure.unassignedSections.length
      });
    } catch (err) {
      errors.push({
        code: 'STRUCTURE_EXTRACTION_ERROR',
        message: `Error extracting document structure: ${String(err)}`,
        isFatal: false
      });
      structure = { chapters: [], unassignedSections: [], pages: [] };
      logger.error(`[Parser Engine] Structure extraction failed`, { error: String(err) });
    }

    // Compute statistics
    const statistics = this.calculateStatistics(structure);

    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const packageHash = `pkg-${Math.random().toString(36).substring(2, 10)}`;

    const parsedDocument: ParsedDocument = {
      documentId,
      packageHash,
      fileName,
      metadata,
      structure,
      statistics,
      parsedAt: Date.now()
    };

    const processingTimeMs = Date.now() - startTime;
    const fatalErrorsCount = errors.filter((e) => e.isFatal).length;
    const recoverableErrorsCount = errors.length - fatalErrorsCount;

    const metrics: ParsingMetrics = {
      processingTimeMs,
      elapsedTimeMs: processingTimeMs,
      bytesProcessed: fileSize,
      pagesParsed: metadata.pageCount || structure.pages.length || 0,
      chaptersFound: metadata.chapterCount || structure.chapters.length || 0,
      sectionsFound: structure.chapters.reduce((sum, ch) => sum + ch.sections.length, 0) + structure.unassignedSections.length,
      tablesFound: statistics.totalTables,
      imagesFound: statistics.totalImages,
      warnings,
      errors,
      warningsCount: warnings.length,
      recoverableErrorCount: recoverableErrorsCount,
      fatalErrorCount: fatalErrorsCount,
      skippedObjectsCount: 0,
      memoryEstimateBytes: Math.round(fileSize * 1.5),
      parserBackendId: this.backend.backendId,
      parserVersion: this.parserVersion,
      pipelineVersion: '1.0.0-build017b.1'
    };

    logger.info(`[Parser Engine] Completed document parsing run`, {
      documentId,
      processingTimeMs,
      warningsCount: metrics.warningsCount,
      errorsCount: metrics.errors.length
    });

    return {
      document: parsedDocument,
      metrics
    };
  }

  protected getFallbackMetadata(file: File | Uint8Array, fileName: string): DocumentMetadata {
    const size = file instanceof File ? file.size : file.byteLength;
    const ext = fileName.split('.').pop()?.toLowerCase() as SupportedFileExtension || 'txt';
    return {
      title: fileName,
      fileSize: size,
      extension: ext,
      creationDate: Date.now()
    };
  }

  protected calculateStatistics(structure: DocumentStructure): DocumentStatistics {
    let totalCharacters = 0;
    let totalWords = 0;
    let totalParagraphs = 0;
    let totalHeadings = 0;
    let totalTables = 0;
    let totalImages = 0;
    let totalFootnotes = 0;

    const processNodes = (nodes: readonly unknown[]) => {
      nodes.forEach((n) => {
        if (typeof n !== 'object' || n === null || !('type' in n)) return;
        const node = n as { type: NodeType; text?: string; cells?: readonly { content: string }[] };

        switch (node.type) {
          case NodeType.PARAGRAPH:
            totalParagraphs++;
            if (node.text) {
              totalCharacters += node.text.length;
              totalWords += node.text.trim().split(/\s+/).filter(Boolean).length;
            }
            break;
          case NodeType.HEADING:
            totalHeadings++;
            if (node.text) {
              totalCharacters += node.text.length;
              totalWords += node.text.trim().split(/\s+/).filter(Boolean).length;
            }
            break;
          case NodeType.TABLE:
            totalTables++;
            if (node.cells) {
              node.cells.forEach((cell) => {
                totalCharacters += cell.content.length;
                totalWords += cell.content.trim().split(/\s+/).filter(Boolean).length;
              });
            }
            break;
          case NodeType.IMAGE_REF:
            totalImages++;
            break;
          case NodeType.FOOTNOTE:
            totalFootnotes++;
            break;
        }
      });
    };

    structure.chapters.forEach((ch) => {
      ch.sections.forEach((sec) => processNodes(sec.nodes));
    });

    structure.unassignedSections.forEach((sec) => processNodes(sec.nodes));

    return {
      totalCharacters,
      totalWords,
      totalParagraphs,
      totalHeadings,
      totalTables,
      totalImages,
      totalFootnotes
    };
  }

  protected async readAsText(file: File | Uint8Array): Promise<string> {
    if (file instanceof File) {
      return await file.text();
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(file);
  }
}
