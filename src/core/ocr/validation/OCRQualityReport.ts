import { OCRIssue } from './OCRIssue';

export interface IOCRQualityReportData {
  readonly reportId: string;
  readonly documentId: string;
  readonly averageConfidence: number;
  readonly totalPages: number;
  readonly unreadablePagesCount: number;
  readonly lowConfidencePageCount: number;
  readonly issues: readonly OCRIssue[];
  readonly isAcceptable: boolean;
  readonly generatedAt: number;
}

export class OCRQualityReport implements IOCRQualityReportData {
  public readonly reportId: string;
  public readonly documentId: string;
  public readonly averageConfidence: number;
  public readonly totalPages: number;
  public readonly unreadablePagesCount: number;
  public readonly lowConfidencePageCount: number;
  public readonly issues: readonly OCRIssue[];
  public readonly isAcceptable: boolean;
  public readonly generatedAt: number;

  constructor(data: {
    reportId?: string;
    documentId: string;
    averageConfidence: number;
    totalPages: number;
    unreadablePagesCount?: number;
    lowConfidencePageCount?: number;
    issues: readonly OCRIssue[];
    isAcceptable?: boolean;
    generatedAt?: number;
  }) {
    this.reportId = data.reportId || `qrep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.documentId = data.documentId;
    this.averageConfidence = data.averageConfidence;
    this.totalPages = data.totalPages;
    this.unreadablePagesCount = data.unreadablePagesCount ?? 0;
    this.lowConfidencePageCount = data.lowConfidencePageCount ?? 0;
    this.issues = Object.freeze([...data.issues]);
    this.generatedAt = data.generatedAt ?? Date.now();

    const criticalCount = this.issues.filter(i => i.severity === 'CRITICAL').length;
    this.isAcceptable = data.isAcceptable !== undefined
      ? data.isAcceptable
      : (this.averageConfidence >= 0.70 && criticalCount === 0);

    Object.freeze(this);
  }

  public toJSON(): IOCRQualityReportData {
    return {
      reportId: this.reportId,
      documentId: this.documentId,
      averageConfidence: this.averageConfidence,
      totalPages: this.totalPages,
      unreadablePagesCount: this.unreadablePagesCount,
      lowConfidencePageCount: this.lowConfidencePageCount,
      issues: this.issues,
      isAcceptable: this.isAcceptable,
      generatedAt: this.generatedAt
    };
  }
}
