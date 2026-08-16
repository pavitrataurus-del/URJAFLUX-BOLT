import { SupportedFileExtension } from '../../knowledge_ingestion/types/ingestion.types';

export enum NodeType {
  DOCUMENT = 'DOCUMENT',
  PAGE = 'PAGE',
  CHAPTER = 'CHAPTER',
  SECTION = 'SECTION',
  PARAGRAPH = 'PARAGRAPH',
  HEADING = 'HEADING',
  LIST = 'LIST',
  LIST_ITEM = 'LIST_ITEM',
  TABLE = 'TABLE',
  IMAGE_REF = 'IMAGE_REF',
  FOOTNOTE = 'FOOTNOTE',
  CROSS_REF = 'CROSS_REF'
}

export interface SourceLocation {
  readonly pageNumber?: number;
  readonly startOffset?: number;
  readonly endOffset?: number;
  readonly byteOffset?: number;
  readonly characterOffset?: number;
  readonly lineIndex?: number;
}

export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation?: number;
  readonly confidence?: number;
}

export interface DocumentMetadata {
  readonly title: string;
  readonly author?: string;
  readonly language?: string;
  readonly pageCount?: number;
  readonly chapterCount?: number;
  readonly fileSize: number;
  readonly extension: SupportedFileExtension;
  readonly creationDate?: number;
  readonly modificationDate?: number;
  readonly version?: string;
  readonly publisher?: string;
  readonly isbn?: string;
}

export interface BaseNode {
  readonly id: string;
  readonly type: NodeType;
  readonly orderIndex: number;
  readonly pageNumber?: number;
  readonly sourceLocation?: SourceLocation;
  readonly boundingBox?: BoundingBox;
}

export interface HeadingNode extends BaseNode {
  readonly type: NodeType.HEADING;
  readonly level: number; // 1-6
  readonly text: string;
}

export interface ParagraphNode extends BaseNode {
  readonly type: NodeType.PARAGRAPH;
  readonly text: string;
}

export interface TableCell {
  readonly rowIndex: number;
  readonly colIndex: number;
  readonly content: string;
  readonly isHeader?: boolean;
}

export interface TableNode extends BaseNode {
  readonly type: NodeType.TABLE;
  readonly caption?: string;
  readonly rowCount: number;
  readonly colCount: number;
  readonly cells: readonly TableCell[];
}

export interface ImageReferenceNode extends BaseNode {
  readonly type: NodeType.IMAGE_REF;
  readonly imageId: string;
  readonly altText?: string;
  readonly caption?: string;
  readonly mimeType?: string;
}

export interface FootnoteNode extends BaseNode {
  readonly type: NodeType.FOOTNOTE;
  readonly symbol: string;
  readonly text: string;
}

export interface CrossReferenceNode extends BaseNode {
  readonly type: NodeType.CROSS_REF;
  readonly targetId: string;
  readonly displayText: string;
}

export interface SectionNode extends BaseNode {
  readonly type: NodeType.SECTION;
  readonly title: string;
  readonly level: number;
  readonly nodes: readonly (ParagraphNode | HeadingNode | TableNode | ImageReferenceNode | FootnoteNode | CrossReferenceNode)[];
}

export interface ChapterNode extends BaseNode {
  readonly type: NodeType.CHAPTER;
  readonly chapterNumber: number;
  readonly title: string;
  readonly sections: readonly SectionNode[];
}

export interface PageNode extends BaseNode {
  readonly type: NodeType.PAGE;
  readonly pageNumber: number;
  readonly nodes: readonly BaseNode[];
}

export interface DocumentStructure {
  readonly chapters: readonly ChapterNode[];
  readonly unassignedSections: readonly SectionNode[];
  readonly pages: readonly PageNode[];
}

export interface DocumentStatistics {
  readonly totalCharacters: number;
  readonly totalWords: number;
  readonly totalParagraphs: number;
  readonly totalHeadings: number;
  readonly totalTables: number;
  readonly totalImages: number;
  readonly totalFootnotes: number;
}

export interface ParsedDocument {
  readonly documentId: string;
  readonly packageHash: string;
  readonly fileName: string;
  readonly metadata: DocumentMetadata;
  readonly structure: DocumentStructure;
  readonly statistics: DocumentStatistics;
  readonly parsedAt: number;
}
