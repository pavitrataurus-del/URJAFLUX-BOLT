export type OCRContractViolationType =
  | 'MISSING_BLOCK'
  | 'BROKEN_PARAGRAPH'
  | 'READING_ORDER'
  | 'TABLE_INTEGRITY' | 'BOUNDING_BOX'
  | 'CONFIDENCE'
  | 'METADATA';

export type OCRContractViolationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface IOCRContractViolationData {
  readonly type: OCRContractViolationType;
  readonly severity: OCRContractViolationSeverity;
  readonly message: string;
  readonly nodeId?: string;
  readonly pageNumber?: number;
  readonly details?: Record<string, unknown>;
}

export class OCRContractViolation implements IOCRContractViolationData {
  public readonly type: OCRContractViolationType;
  public readonly severity: OCRContractViolationSeverity;
  public readonly message: string;
  public readonly nodeId?: string;
  public readonly pageNumber?: number;
  public readonly details?: Record<string, unknown>;

  constructor(data: {
    type: OCRContractViolationType;
    severity?: OCRContractViolationSeverity;
    message: string;
    nodeId?: string;
    pageNumber?: number;
    details?: Record<string, unknown>;
  }) {
    this.type = data.type;
    this.severity = data.severity || 'WARNING';
    this.message = data.message;
    this.nodeId = data.nodeId;
    this.pageNumber = data.pageNumber;
    this.details = data.details ? Object.freeze({ ...data.details }) : undefined;

    Object.freeze(this);
  }
}

export interface IOCRCompatibilityReportData {
  readonly reportId: string;
  readonly documentId: string;
  readonly isCompatible: boolean;
  readonly compatibilityScore: number;
  readonly missingBlocksCount: number;
  readonly brokenParagraphsCount: number;
  readonly readingOrderViolationsCount: number;
  readonly tableIntegrityViolationsCount: number;
  readonly invalidBoundingBoxesCount: number;
  readonly lowConfidenceNodesCount: number;
  readonly metadataIncomplete: boolean;
  readonly violations: readonly OCRContractViolation[];
  readonly checkedAt: number;
}

export class OCRCompatibilityReport implements IOCRCompatibilityReportData {
  public readonly reportId: string;
  public readonly documentId: string;
  public readonly isCompatible: boolean;
  public readonly compatibilityScore: number;
  public readonly missingBlocksCount: number;
  public readonly brokenParagraphsCount: number;
  public readonly readingOrderViolationsCount: number;
  public readonly tableIntegrityViolationsCount: number;
  public readonly invalidBoundingBoxesCount: number;
  public readonly lowConfidenceNodesCount: number;
  public readonly metadataIncomplete: boolean;
  public readonly violations: readonly OCRContractViolation[];
  public readonly checkedAt: number;

  constructor(data: {
    reportId?: string;
    documentId: string;
    isCompatible?: boolean;
    compatibilityScore?: number;
    missingBlocksCount?: number;
    brokenParagraphsCount?: number;
    readingOrderViolationsCount?: number;
    tableIntegrityViolationsCount?: number;
    invalidBoundingBoxesCount?: number;
    lowConfidenceNodesCount?: number;
    metadataIncomplete?: boolean;
    violations: readonly OCRContractViolation[];
    checkedAt?: number;
  }) {
    this.reportId = data.reportId || `cmpr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.documentId = data.documentId;
    this.violations = Object.freeze([...data.violations]);
    this.checkedAt = data.checkedAt ?? Date.now();

    this.missingBlocksCount = data.missingBlocksCount ?? this.violations.filter(v => v.type === 'MISSING_BLOCK').length;
    this.brokenParagraphsCount = data.brokenParagraphsCount ?? this.violations.filter(v => v.type === 'BROKEN_PARAGRAPH').length;
    this.readingOrderViolationsCount = data.readingOrderViolationsCount ?? this.violations.filter(v => v.type === 'READING_ORDER').length;
    this.tableIntegrityViolationsCount = data.tableIntegrityViolationsCount ?? this.violations.filter(v => v.type === 'TABLE_INTEGRITY').length;
    this.invalidBoundingBoxesCount = data.invalidBoundingBoxesCount ?? this.violations.filter(v => v.type === 'BOUNDING_BOX').length;
    this.lowConfidenceNodesCount = data.lowConfidenceNodesCount ?? this.violations.filter(v => v.type === 'CONFIDENCE').length;
    this.metadataIncomplete = data.metadataIncomplete ?? this.violations.some(v => v.type === 'METADATA');

    const criticalCount = this.violations.filter(v => v.severity === 'CRITICAL').length;
    const warningCount = this.violations.filter(v => v.severity === 'WARNING').length;

    // Score calculation (1.0 = perfect contract compatibility)
    const penalty = (criticalCount * 0.25) + (warningCount * 0.05);
    const calculatedScore = Math.max(0, Math.min(1.0, 1.0 - penalty));

    this.compatibilityScore = data.compatibilityScore ?? Math.round(calculatedScore * 100) / 100;
    this.isCompatible = data.isCompatible !== undefined
      ? data.isCompatible
      : (criticalCount === 0 && this.compatibilityScore >= 0.70);

    Object.freeze(this);
  }

  public toJSON(): IOCRCompatibilityReportData {
    return {
      reportId: this.reportId,
      documentId: this.documentId,
      isCompatible: this.isCompatible,
      compatibilityScore: this.compatibilityScore,
      missingBlocksCount: this.missingBlocksCount,
      brokenParagraphsCount: this.brokenParagraphsCount,
      readingOrderViolationsCount: this.readingOrderViolationsCount,
      tableIntegrityViolationsCount: this.tableIntegrityViolationsCount,
      invalidBoundingBoxesCount: this.invalidBoundingBoxesCount,
      lowConfidenceNodesCount: this.lowConfidenceNodesCount,
      metadataIncomplete: this.metadataIncomplete,
      violations: this.violations,
      checkedAt: this.checkedAt
    };
  }
}
