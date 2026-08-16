import { IValidationIssue } from './ValidationRule';

export interface IValidationResultData {
  readonly success: boolean;
  readonly totalObjectsEvaluated: number;
  readonly totalEvidenceEvaluated: number;
  readonly totalRelationshipsEvaluated: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly issues: readonly IValidationIssue[];
  readonly executionTimeMs: number;
  readonly timestamp: number;
}

export class ValidationResult implements IValidationResultData {
  public readonly success: boolean;
  public readonly totalObjectsEvaluated: number;
  public readonly totalEvidenceEvaluated: number;
  public readonly totalRelationshipsEvaluated: number;
  public readonly errorCount: number;
  public readonly warningCount: number;
  public readonly issues: readonly IValidationIssue[];
  public readonly executionTimeMs: number;
  public readonly timestamp: number;

  constructor(data: IValidationResultData) {
    this.success = data.success;
    this.totalObjectsEvaluated = data.totalObjectsEvaluated;
    this.totalEvidenceEvaluated = data.totalEvidenceEvaluated;
    this.totalRelationshipsEvaluated = data.totalRelationshipsEvaluated;
    this.errorCount = data.errorCount;
    this.warningCount = data.warningCount;
    this.issues = data.issues;
    this.executionTimeMs = data.executionTimeMs;
    this.timestamp = data.timestamp;
  }

  public toJSON(): IValidationResultData {
    return {
      success: this.success,
      totalObjectsEvaluated: this.totalObjectsEvaluated,
      totalEvidenceEvaluated: this.totalEvidenceEvaluated,
      totalRelationshipsEvaluated: this.totalRelationshipsEvaluated,
      errorCount: this.errorCount,
      warningCount: this.warningCount,
      issues: this.issues,
      executionTimeMs: this.executionTimeMs,
      timestamp: this.timestamp
    };
  }
}
