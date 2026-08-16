import { KnowledgeObject } from '../models/KnowledgeObject';
import { CanonicalEntity, ICanonicalEntityData } from '../canonicalization/CanonicalEntity';
import { ValidationResult, IValidationResultData } from './ValidationResult';
import { IKnowledgeConflict } from '../canonicalization/ConflictDetector';
import { IDuplicateReport } from './DuplicateValidator';
import { IKnowledgeObjectData } from '../types/knowledge.types';

export interface IEnterpriseValidationMetrics {
  readonly objectsValidatedCount: number;
  readonly canonicalEntitiesCount: number;
  readonly duplicateCount: number;
  readonly conflictCount: number;
  readonly brokenRelationshipsCount: number;
  readonly evidenceFailuresCount: number;
  readonly warningCount: number;
  readonly errorCount: number;
  readonly executionTimeMs: number;
}

export interface IValidatedKnowledgeResultJSON {
  readonly validatedObjects: readonly IKnowledgeObjectData[];
  readonly canonicalEntities: readonly ICanonicalEntityData[];
  readonly validationResult: IValidationResultData;
  readonly conflicts: readonly IKnowledgeConflict[];
  readonly duplicates: readonly IDuplicateReport[];
  readonly metrics: IEnterpriseValidationMetrics;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly pipelineVersion: string;
  readonly executionTimeMs: number;
}

export interface IValidatedKnowledgeResultData {
  readonly validatedObjects: readonly KnowledgeObject[];
  readonly canonicalEntities: readonly CanonicalEntity[];
  readonly validationResult: ValidationResult;
  readonly conflicts: readonly IKnowledgeConflict[];
  readonly duplicates: readonly IDuplicateReport[];
  readonly metrics: IEnterpriseValidationMetrics;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly pipelineVersion: string;
  readonly executionTimeMs: number;
}

export class ValidatedKnowledgeResult implements IValidatedKnowledgeResultData {
  public readonly validatedObjects: readonly KnowledgeObject[];
  public readonly canonicalEntities: readonly CanonicalEntity[];
  public readonly validationResult: ValidationResult;
  public readonly conflicts: readonly IKnowledgeConflict[];
  public readonly duplicates: readonly IDuplicateReport[];
  public readonly metrics: IEnterpriseValidationMetrics;
  public readonly warnings: readonly string[];
  public readonly errors: readonly string[];
  public readonly pipelineVersion: string;
  public readonly executionTimeMs: number;

  constructor(data: IValidatedKnowledgeResultData) {
    this.validatedObjects = Object.freeze([...data.validatedObjects]);
    this.canonicalEntities = Object.freeze([...data.canonicalEntities]);
    this.validationResult = data.validationResult;
    this.conflicts = Object.freeze([...data.conflicts]);
    this.duplicates = Object.freeze([...data.duplicates]);
    this.metrics = Object.freeze({ ...data.metrics });
    this.warnings = Object.freeze([...data.warnings]);
    this.errors = Object.freeze([...data.errors]);
    this.pipelineVersion = data.pipelineVersion;
    this.executionTimeMs = data.executionTimeMs;
    Object.freeze(this);
  }

  public toJSON(): IValidatedKnowledgeResultJSON {
    return {
      validatedObjects: this.validatedObjects.map((o) => o.toJSON()),
      canonicalEntities: this.canonicalEntities.map((c) => c.toJSON()),
      validationResult: this.validationResult.toJSON(),
      conflicts: this.conflicts,
      duplicates: this.duplicates,
      metrics: this.metrics,
      warnings: this.warnings,
      errors: this.errors,
      pipelineVersion: this.pipelineVersion,
      executionTimeMs: this.executionTimeMs
    };
  }
}
