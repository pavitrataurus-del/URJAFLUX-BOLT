import { KnowledgePackage } from '../models/KnowledgePackage';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { ValidationEngine } from './ValidationEngine';
import { ValidationResult } from './ValidationResult';
import { IValidationIssue } from './ValidationRule';

export interface IKnowledgeValidationOptions {
  readonly minConfidenceThreshold?: number;
  readonly supportedVersions?: readonly string[];
  readonly requireMetadata?: boolean;
}

export class KnowledgeValidator {
  private readonly validationEngine: ValidationEngine;

  constructor(validationEngine: ValidationEngine = new ValidationEngine()) {
    this.validationEngine = validationEngine;
  }

  public async validate(
    knowledgePackage: KnowledgePackage,
    options?: IKnowledgeValidationOptions
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    
    // 1. Run base rule validation using ValidationEngine
    const baseResult = await this.validationEngine.validatePackage(knowledgePackage);
    const enterpriseIssues: IValidationIssue[] = [...baseResult.issues];

    const minConfidence = options?.minConfidenceThreshold ?? 0.3;
    const supportedVersions = options?.supportedVersions ?? ['1.0.0', '1.0.0-BUILD-017C.3', '1.0.0-BUILD-017C.4'];

    // 2. Version validation
    if (!supportedVersions.includes(knowledgePackage.version)) {
      enterpriseIssues.push({
        code: 'ERR_UNSUPPORTED_PACKAGE_VERSION',
        message: `Package version '${knowledgePackage.version}' is not in supported list: ${supportedVersions.join(', ')}`,
        severity: 'ERROR',
        ruleName: 'KnowledgeValidator.VersionValidation',
        timestamp: Date.now(),
        details: { packageVersion: knowledgePackage.version, supportedVersions }
      });
    }

    // 3. Object Field, Metadata, Confidence & Status validation
    for (const obj of knowledgePackage.objects) {
      this.validateObjectFields(obj, enterpriseIssues);
      this.validateObjectMetadata(obj, enterpriseIssues, options?.requireMetadata);
      this.validateObjectConfidence(obj, enterpriseIssues, minConfidence);
      this.validateObjectStatus(obj, enterpriseIssues);
    }

    const errorCount = enterpriseIssues.filter((i) => i.severity === 'ERROR').length;
    const warningCount = enterpriseIssues.filter((i) => i.severity === 'WARNING').length;
    const isSuccess = errorCount === 0;

    return new ValidationResult({
      success: isSuccess,
      totalObjectsEvaluated: knowledgePackage.objects.length,
      totalEvidenceEvaluated: knowledgePackage.evidenceList.length,
      totalRelationshipsEvaluated: knowledgePackage.relationships.length,
      errorCount,
      warningCount,
      issues: enterpriseIssues,
      executionTimeMs: Date.now() - startTime,
      timestamp: Date.now()
    });
  }

  private validateObjectFields(obj: KnowledgeObject, issues: IValidationIssue[]): void {
    if (!obj.knowledgeId || typeof obj.knowledgeId !== 'string') {
      issues.push({
        code: 'ERR_INVALID_FIELD_KNOWLEDGE_ID',
        message: 'KnowledgeObject must have a valid string knowledgeId',
        severity: 'ERROR',
        targetId: obj.knowledgeId,
        ruleName: 'KnowledgeValidator.FieldValidation',
        timestamp: Date.now()
      });
    }

    if (!obj.entity || typeof obj.entity !== 'string') {
      issues.push({
        code: 'ERR_INVALID_FIELD_ENTITY',
        message: `KnowledgeObject '${obj.knowledgeId}' must have a valid string entity`,
        severity: 'ERROR',
        targetId: obj.knowledgeId,
        ruleName: 'KnowledgeValidator.FieldValidation',
        timestamp: Date.now()
      });
    }

    if (!obj.attribute || typeof obj.attribute !== 'string') {
      issues.push({
        code: 'ERR_INVALID_FIELD_ATTRIBUTE',
        message: `KnowledgeObject '${obj.knowledgeId}' must have a valid string attribute`,
        severity: 'ERROR',
        targetId: obj.knowledgeId,
        ruleName: 'KnowledgeValidator.FieldValidation',
        timestamp: Date.now()
      });
    }
  }

  private validateObjectMetadata(
    obj: KnowledgeObject,
    issues: IValidationIssue[],
    requireMetadata?: boolean
  ): void {
    if (!obj.metadata || typeof obj.metadata !== 'object') {
      if (requireMetadata) {
        issues.push({
          code: 'ERR_MISSING_METADATA',
          message: `KnowledgeObject '${obj.knowledgeId}' is missing required metadata object`,
          severity: 'ERROR',
          targetId: obj.knowledgeId,
          ruleName: 'KnowledgeValidator.MetadataValidation',
          timestamp: Date.now()
        });
      }
    }
  }

  private validateObjectConfidence(
    obj: KnowledgeObject,
    issues: IValidationIssue[],
    minConfidenceThreshold: number
  ): void {
    if (obj.confidence < minConfidenceThreshold) {
      issues.push({
        code: 'WARN_BELOW_MIN_CONFIDENCE',
        message: `KnowledgeObject '${obj.knowledgeId}' confidence (${obj.confidence}) is below threshold (${minConfidenceThreshold})`,
        severity: 'WARNING',
        targetId: obj.knowledgeId,
        ruleName: 'KnowledgeValidator.ConfidenceValidation',
        timestamp: Date.now(),
        details: { confidence: obj.confidence, threshold: minConfidenceThreshold }
      });
    }
  }

  private validateObjectStatus(obj: KnowledgeObject, issues: IValidationIssue[]): void {
    if (!obj.status) {
      issues.push({
        code: 'WARN_MISSING_STATUS',
        message: `KnowledgeObject '${obj.knowledgeId}' status is empty or undefined`,
        severity: 'WARNING',
        targetId: obj.knowledgeId,
        ruleName: 'KnowledgeValidator.StatusValidation',
        timestamp: Date.now()
      });
    }
  }
}
