export type OCRIssueType =
  | 'LOW_CONFIDENCE_PAGE'
  | 'LOW_CONFIDENCE_WORD'
  | 'UNREADABLE_PAGE'
  | 'MISSING_TEXT'
  | 'BROKEN_TABLE'
  | 'BROKEN_PARAGRAPH'
  | 'MIXED_SCRIPT_WARNING';

export type OCRIssueSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface IOCRIssueData {
  readonly issueId: string;
  readonly type: OCRIssueType;
  readonly severity: OCRIssueSeverity;
  readonly pageNumber?: number;
  readonly blockId?: string;
  readonly description: string;
  readonly confidenceScore?: number;
  readonly recommendation?: string;
}

export class OCRIssue implements IOCRIssueData {
  public readonly issueId: string;
  public readonly type: OCRIssueType;
  public readonly severity: OCRIssueSeverity;
  public readonly pageNumber?: number;
  public readonly blockId?: string;
  public readonly description: string;
  public readonly confidenceScore?: number;
  public readonly recommendation?: string;

  constructor(data: {
    issueId?: string;
    type: OCRIssueType;
    severity?: OCRIssueSeverity;
    pageNumber?: number;
    blockId?: string;
    description: string;
    confidenceScore?: number;
    recommendation?: string;
  }) {
    this.issueId = data.issueId || `iss_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.type = data.type;
    this.severity = data.severity || 'WARNING';
    this.pageNumber = data.pageNumber;
    this.blockId = data.blockId;
    this.description = data.description;
    this.confidenceScore = data.confidenceScore;
    this.recommendation = data.recommendation;

    Object.freeze(this);
  }

  public toJSON(): IOCRIssueData {
    return {
      issueId: this.issueId,
      type: this.type,
      severity: this.severity,
      pageNumber: this.pageNumber,
      blockId: this.blockId,
      description: this.description,
      confidenceScore: this.confidenceScore,
      recommendation: this.recommendation
    };
  }
}
