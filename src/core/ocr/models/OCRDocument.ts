import { OCRConfidence } from './OCRConfidence';
import { OCRPage } from './OCRPage';

export interface IOCRDocumentData {
  readonly documentId: string;
  readonly title: string;
  readonly pages: readonly OCRPage[];
  readonly totalPages: number;
  readonly primaryLanguage: string;
  readonly primaryScript: string;
  readonly overallConfidence: OCRConfidence;
  readonly createdAt: number;
}

export class OCRDocument implements IOCRDocumentData {
  public readonly documentId: string;
  public readonly title: string;
  public readonly pages: readonly OCRPage[];
  public readonly totalPages: number;
  public readonly primaryLanguage: string;
  public readonly primaryScript: string;
  public readonly overallConfidence: OCRConfidence;
  public readonly createdAt: number;

  constructor(data: {
    documentId?: string;
    title?: string;
    pages: readonly OCRPage[];
    totalPages?: number;
    primaryLanguage?: string;
    primaryScript?: string;
    overallConfidence?: OCRConfidence;
    createdAt?: number;
  }) {
    this.documentId = data.documentId || `ocr_doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.title = data.title || 'Untitled Scanned Document';
    this.pages = Object.freeze([...data.pages]);
    this.totalPages = data.totalPages ?? this.pages.length;
    this.primaryLanguage = data.primaryLanguage || (this.pages[0]?.language ?? 'en');
    this.primaryScript = data.primaryScript || (this.pages[0]?.script ?? 'Latin');
    this.createdAt = data.createdAt ?? Date.now();

    if (data.overallConfidence) {
      this.overallConfidence = data.overallConfidence;
    } else {
      this.overallConfidence = OCRConfidence.combine(this.pages.map(p => p.averageConfidence));
    }

    Object.freeze(this);
  }

  public toJSON(): IOCRDocumentData {
    return {
      documentId: this.documentId,
      title: this.title,
      pages: this.pages,
      totalPages: this.totalPages,
      primaryLanguage: this.primaryLanguage,
      primaryScript: this.primaryScript,
      overallConfidence: this.overallConfidence,
      createdAt: this.createdAt
    };
  }
}
