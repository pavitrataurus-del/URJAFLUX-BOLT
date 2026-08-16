import { StructuredDocument } from '../reconstruction/StructuredDocument';
import { ParsedDocument, PageNode, ChapterNode, SectionNode } from '../../knowledge_parsing/types/document.types';
import { SupportedFileExtension } from '../../knowledge_ingestion/types/ingestion.types';
import { Logger } from '../../utils/logger';

export interface IStructuredDocumentAdapter {
  canAdapt(input: unknown): boolean;
  adaptToParsedDocument(input: unknown): ParsedDocument;
  adaptFromParsedDocument(parsedDoc: ParsedDocument): StructuredDocument;
}

export class StandardStructuredDocumentAdapter implements IStructuredDocumentAdapter {
  public canAdapt(input: unknown): boolean {
    if (!input || typeof input !== 'object') {
      return false;
    }

    if (input instanceof StructuredDocument) return true;

    const obj = input as Record<string, unknown>;
    return (
      typeof obj.documentId === 'string' &&
      obj.structure !== undefined &&
      typeof obj.structure === 'object' &&
      Array.isArray((obj.structure as Record<string, unknown>).pages)
    );
  }

  public adaptToParsedDocument(input: unknown): ParsedDocument {
    Logger.info('[StandardStructuredDocumentAdapter] Adapting input to ParsedDocument');

    if (input instanceof StructuredDocument) {
      return input.toParsedDocument();
    }

    if (!this.canAdapt(input)) {
      throw new Error('[StandardStructuredDocumentAdapter] Input cannot be adapted to ParsedDocument: Missing structural fields');
    }

    const obj = input as Record<string, unknown>;
    const structureRec = (obj.structure || {}) as Record<string, unknown>;
    const pages = Array.isArray(structureRec.pages) ? structureRec.pages : [];
    const chapters = Array.isArray(structureRec.chapters) ? structureRec.chapters : [];
    const unassignedSections = Array.isArray(structureRec.unassignedSections) ? structureRec.unassignedSections : [];

    const metadataRec = (obj.metadata || {}) as Record<string, unknown>;
    const statisticsRec = (obj.statistics || {}) as Record<string, unknown>;

    return Object.freeze({
      documentId: typeof obj.documentId === 'string' ? obj.documentId : `doc_${Date.now()}`,
      packageHash: typeof obj.packageHash === 'string' ? obj.packageHash : `hash_${Date.now()}`,
      fileName: typeof obj.fileName === 'string' ? obj.fileName : 'ocr_reconstructed.pdf',
      parsedAt: typeof obj.parsedAt === 'number' ? obj.parsedAt : Date.now(),
      metadata: Object.freeze({
        title: typeof metadataRec.title === 'string' ? metadataRec.title : 'OCR Document',
        author: typeof metadataRec.author === 'string' ? metadataRec.author : 'OCR Pipeline',
        language: typeof metadataRec.language === 'string' ? metadataRec.language : 'en',
        pageCount: typeof metadataRec.pageCount === 'number' ? metadataRec.pageCount : pages.length,
        chapterCount: typeof metadataRec.chapterCount === 'number' ? metadataRec.chapterCount : chapters.length,
        fileSize: typeof metadataRec.fileSize === 'number' ? metadataRec.fileSize : 1024,
        extension: (typeof metadataRec.extension === 'string' ? metadataRec.extension : 'pdf') as SupportedFileExtension
      }),
      structure: Object.freeze({
        chapters: Object.freeze([...chapters]) as readonly ChapterNode[],
        unassignedSections: Object.freeze([...unassignedSections]) as readonly SectionNode[],
        pages: Object.freeze([...pages]) as readonly PageNode[]
      }),
      statistics: Object.freeze({
        totalCharacters: typeof statisticsRec.totalCharacters === 'number' ? statisticsRec.totalCharacters : 0,
        totalWords: typeof statisticsRec.totalWords === 'number' ? statisticsRec.totalWords : 0,
        totalParagraphs: typeof statisticsRec.totalParagraphs === 'number' ? statisticsRec.totalParagraphs : 0,
        totalHeadings: typeof statisticsRec.totalHeadings === 'number' ? statisticsRec.totalHeadings : 0,
        totalTables: typeof statisticsRec.totalTables === 'number' ? statisticsRec.totalTables : 0,
        totalImages: typeof statisticsRec.totalImages === 'number' ? statisticsRec.totalImages : 0,
        totalFootnotes: typeof statisticsRec.totalFootnotes === 'number' ? statisticsRec.totalFootnotes : 0
      })
    });
  }

  public adaptFromParsedDocument(parsedDoc: ParsedDocument): StructuredDocument {
    Logger.info(`[StandardStructuredDocumentAdapter] Constructing StructuredDocument from documentId: ${parsedDoc.documentId}`);

    return new StructuredDocument({
      documentId: parsedDoc.documentId,
      packageHash: parsedDoc.packageHash,
      fileName: parsedDoc.fileName,
      title: parsedDoc.metadata.title,
      author: parsedDoc.metadata.author,
      language: parsedDoc.metadata.language,
      pageCount: parsedDoc.metadata.pageCount,
      chapters: parsedDoc.structure.chapters,
      unassignedSections: parsedDoc.structure.unassignedSections,
      pages: parsedDoc.structure.pages,
      statistics: parsedDoc.statistics,
      parsedAt: parsedDoc.parsedAt
    });
  }
}
