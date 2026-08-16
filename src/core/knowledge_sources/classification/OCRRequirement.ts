export type OCRRequirementLevel =
  | 'NOT_REQUIRED'
  | 'OPTIONAL'
  | 'RECOMMENDED'
  | 'MANDATORY';

export interface IOCRRequirementData {
  readonly requirementLevel: OCRRequirementLevel;
  readonly reason: string;
  readonly estimatedPagesToOcr: number;
  readonly suggestedEngine: string;
}

export class OCRRequirement implements IOCRRequirementData {
  public readonly requirementLevel: OCRRequirementLevel;
  public readonly reason: string;
  public readonly estimatedPagesToOcr: number;
  public readonly suggestedEngine: string;

  constructor(data?: Partial<IOCRRequirementData>) {
    this.requirementLevel = data?.requirementLevel || 'NOT_REQUIRED';
    this.reason = data?.reason || 'Standard text document with selectable vector font';
    this.estimatedPagesToOcr = data?.estimatedPagesToOcr ?? 0;
    this.suggestedEngine = data?.suggestedEngine || 'Tesseract-OCR-v5';

    Object.freeze(this);
  }

  public toJSON(): IOCRRequirementData {
    return {
      requirementLevel: this.requirementLevel,
      reason: this.reason,
      estimatedPagesToOcr: this.estimatedPagesToOcr,
      suggestedEngine: this.suggestedEngine
    };
  }
}
