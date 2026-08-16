import { SupportedFileExtension } from '../../knowledge_ingestion/types/ingestion.types';
import { IDocumentParser } from '../types/parser.types';
import { TxtDocumentParser } from '../parsers/txtParser';
import { MarkdownDocumentParser } from '../parsers/markdownParser';
import { PdfDocumentParser } from '../parsers/pdfParser';
import { EpubDocumentParser } from '../parsers/epubParser';
import { DocxDocumentParser } from '../parsers/docxParser';
import { logger } from '../../knowledge_ingestion/utils/logger';

export class ParserRegistry {
  private static instance: ParserRegistry;
  private parsers: Map<string, IDocumentParser> = new Map();

  private constructor() {
    // Register standard enterprise parsers
    this.registerParser(new TxtDocumentParser());
    this.registerParser(new MarkdownDocumentParser());
    this.registerParser(new PdfDocumentParser());
    this.registerParser(new EpubDocumentParser());
    this.registerParser(new DocxDocumentParser());
  }

  public static getInstance(): ParserRegistry {
    if (!ParserRegistry.instance) {
      ParserRegistry.instance = new ParserRegistry();
    }
    return ParserRegistry.instance;
  }

  public registerParser(parser: IDocumentParser): void {
    if (this.parsers.has(parser.parserId)) {
      logger.warn(`Overwriting existing parser registration for ${parser.parserId}`);
    }
    this.parsers.set(parser.parserId, parser);
    logger.info(`Registered document parser: ${parser.parserId} v${parser.parserVersion}`);
  }

  public unregisterParser(parserId: string): boolean {
    return this.parsers.delete(parserId);
  }

  public getParserForExtension(extension: SupportedFileExtension): IDocumentParser | undefined {
    for (const parser of this.parsers.values()) {
      if (parser.supports(extension)) {
        return parser;
      }
    }
    return undefined;
  }

  public getAllParsers(): readonly IDocumentParser[] {
    return Array.from(this.parsers.values());
  }
}

export const parserRegistry = ParserRegistry.getInstance();
