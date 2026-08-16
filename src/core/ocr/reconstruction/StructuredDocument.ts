import {
  ParsedDocument,
  DocumentStructure,
  DocumentStatistics,
  DocumentMetadata,
  ChapterNode,
  SectionNode,
  PageNode,
  NodeType,
  ParagraphNode,
  HeadingNode,
  TableNode,
  ImageReferenceNode,
  FootnoteNode,
  BaseNode
} from '../../knowledge_parsing/types/document.types';

export interface IStructuredDocumentData {
  readonly documentId: string;
  readonly title: string;
  readonly fileName: string;
  readonly metadata: DocumentMetadata;
  readonly structure: DocumentStructure;
  readonly statistics: DocumentStatistics;
  readonly parsedAt: number;
}

export class StructuredDocument implements ParsedDocument {
  public readonly documentId: string;
  public readonly packageHash: string;
  public readonly fileName: string;
  public readonly metadata: DocumentMetadata;
  public readonly structure: DocumentStructure;
  public readonly statistics: DocumentStatistics;
  public readonly parsedAt: number;

  constructor(data: {
    documentId?: string;
    packageHash?: string;
    fileName?: string;
    title?: string;
    author?: string;
    language?: string;
    pageCount?: number;
    chapters?: readonly ChapterNode[];
    unassignedSections?: readonly SectionNode[];
    pages?: readonly PageNode[];
    statistics?: Partial<DocumentStatistics>;
    parsedAt?: number;
  }) {
    this.documentId = data.documentId || `doc_recon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.packageHash = data.packageHash || `hash_${Date.now()}`;
    this.fileName = data.fileName || `${data.title || 'reconstructed_document'}.pdf`;
    this.parsedAt = data.parsedAt ?? Date.now();

    const pages = Object.freeze([...(data.pages || [])]);
    const chapters = Object.freeze([...(data.chapters || [])]);
    const unassignedSections = Object.freeze([...(data.unassignedSections || [])]);

    this.structure = Object.freeze({
      chapters,
      unassignedSections,
      pages
    });

    // Calculate node stats across pages
    let totalParagraphs = 0;
    let totalHeadings = 0;
    let totalTables = 0;
    let totalImages = 0;
    let totalFootnotes = 0;
    let totalWords = 0;
    let totalCharacters = 0;

    for (const page of pages) {
      for (const node of page.nodes) {
        if (node.type === NodeType.PARAGRAPH) {
          totalParagraphs++;
          const txt = (node as ParagraphNode).text || '';
          totalCharacters += txt.length;
          totalWords += txt.split(/\s+/).filter(Boolean).length;
        } else if (node.type === NodeType.HEADING) {
          totalHeadings++;
          const txt = (node as HeadingNode).text || '';
          totalCharacters += txt.length;
          totalWords += txt.split(/\s+/).filter(Boolean).length;
        } else if (node.type === NodeType.TABLE) {
          totalTables++;
        } else if (node.type === NodeType.IMAGE_REF) {
          totalImages++;
        } else if (node.type === NodeType.FOOTNOTE) {
          totalFootnotes++;
        }
      }
    }

    this.statistics = Object.freeze({
      totalCharacters: data.statistics?.totalCharacters ?? totalCharacters,
      totalWords: data.statistics?.totalWords ?? totalWords,
      totalParagraphs: data.statistics?.totalParagraphs ?? totalParagraphs,
      totalHeadings: data.statistics?.totalHeadings ?? totalHeadings,
      totalTables: data.statistics?.totalTables ?? totalTables,
      totalImages: data.statistics?.totalImages ?? totalImages,
      totalFootnotes: data.statistics?.totalFootnotes ?? totalFootnotes
    });

    this.metadata = Object.freeze({
      title: data.title || 'Reconstructed OCR Document',
      author: data.author || 'OCR Reconstruction Engine',
      language: data.language || 'en',
      pageCount: data.pageCount ?? pages.length,
      chapterCount: chapters.length,
      fileSize: 1024 * (pages.length || 1),
      extension: 'pdf'
    });

    Object.freeze(this);
  }

  public toParsedDocument(): ParsedDocument {
    return {
      documentId: this.documentId,
      packageHash: this.packageHash,
      fileName: this.fileName,
      metadata: this.metadata,
      structure: this.structure,
      statistics: this.statistics,
      parsedAt: this.parsedAt
    };
  }

  public getAllNodes(): readonly BaseNode[] {
    return Object.freeze(this.structure.pages.flatMap(p => p.nodes));
  }
}
