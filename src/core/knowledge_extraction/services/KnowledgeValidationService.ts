import { KnowledgePackage } from '../models/KnowledgePackage';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { ValidationEngine } from '../validation/ValidationEngine';
import { ValidationResult } from '../validation/ValidationResult';
import { IValidationIssue } from '../validation/ValidationRule';
import { CanonicalizationEngine } from '../canonicalization/CanonicalizationEngine';
import { KnowledgeValidator, IKnowledgeValidationOptions } from '../validation/KnowledgeValidator';
import { DuplicateValidator, IDuplicateReport } from '../validation/DuplicateValidator';
import { RelationshipValidator } from '../validation/RelationshipValidator';
import { EvidenceValidator } from '../validation/EvidenceValidator';
import { ValidatedKnowledgeResult } from '../validation/ValidatedKnowledgeResult';
import { CanonicalEntity } from '../canonicalization/CanonicalEntity';
import { AliasDictionary } from '../canonicalization/AliasDictionary';
import { ConflictDetector, IKnowledgeConflict } from '../canonicalization/ConflictDetector';

export interface IValidationAndCanonicalizationResult {
  readonly canonicalPackage: KnowledgePackage;
  readonly validationResult: ValidationResult;
  readonly executionTimeMs: number;
}

export class KnowledgeValidationService {
  private static instance: KnowledgeValidationService;
  private readonly validationEngine: ValidationEngine;
  private readonly canonicalizationEngine: CanonicalizationEngine;
  private readonly knowledgeValidator: KnowledgeValidator;
  private readonly duplicateValidator: DuplicateValidator;
  private readonly relationshipValidator: RelationshipValidator;
  private readonly evidenceValidator: EvidenceValidator;
  private readonly aliasDictionary: AliasDictionary;
  private readonly conflictDetector: ConflictDetector;

  private constructor(
    validationEngine: ValidationEngine = new ValidationEngine(),
    canonicalizationEngine: CanonicalizationEngine = new CanonicalizationEngine(),
    aliasDictionary: AliasDictionary = new AliasDictionary()
  ) {
    this.validationEngine = validationEngine;
    this.canonicalizationEngine = canonicalizationEngine;
    this.aliasDictionary = aliasDictionary;
    this.knowledgeValidator = new KnowledgeValidator(this.validationEngine);
    this.duplicateValidator = new DuplicateValidator();
    this.relationshipValidator = new RelationshipValidator();
    this.evidenceValidator = new EvidenceValidator();
    this.conflictDetector = new ConflictDetector(this.aliasDictionary);
  }

  public static getInstance(): KnowledgeValidationService {
    if (!KnowledgeValidationService.instance) {
      KnowledgeValidationService.instance = new KnowledgeValidationService();
    }
    return KnowledgeValidationService.instance;
  }

  // --- BACKWARD COMPATIBLE APIS ---

  public async validatePackage(knowledgePackage: KnowledgePackage): Promise<ValidationResult> {
    return this.validationEngine.validatePackage(knowledgePackage);
  }

  public canonicalizeObjects(objects: readonly KnowledgeObject[]): readonly KnowledgeObject[] {
    return this.canonicalizationEngine.canonicalizeObjects(objects);
  }

  public async validateAndCanonicalize(
    knowledgePackage: KnowledgePackage
  ): Promise<IValidationAndCanonicalizationResult> {
    const startTime = Date.now();

    // 1. Perform Canonicalization
    const canonicalObjects = this.canonicalizationEngine.canonicalizeObjects(knowledgePackage.objects);

    // 2. Build Canonical Package
    const canonicalPackage = new KnowledgePackage({
      packageId: knowledgePackage.packageId,
      documentId: knowledgePackage.documentId,
      packageHash: knowledgePackage.packageHash,
      sourceFileName: knowledgePackage.sourceFileName,
      version: knowledgePackage.version,
      createdAt: knowledgePackage.createdAt,
      objects: canonicalObjects,
      relationships: knowledgePackage.relationships,
      evidenceList: knowledgePackage.evidenceList,
      metrics: {
        ...knowledgePackage.metrics,
        knowledgeObjectCount: canonicalObjects.length
      },
      metadata: {
        ...knowledgePackage.metadata,
        validatedAndCanonicalizedAt: Date.now()
      }
    });

    // 3. Perform Validation
    const validationResult = await this.validationEngine.validatePackage(canonicalPackage);

    const executionTimeMs = Date.now() - startTime;

    return {
      canonicalPackage,
      validationResult,
      executionTimeMs
    };
  }

  // --- ENTERPRISE API (BUILD-017C.4R) ---

  public async validateAndRefinePackage(
    knowledgePackage: KnowledgePackage,
    options?: IKnowledgeValidationOptions
  ): Promise<ValidatedKnowledgeResult> {
    const startTime = Date.now();

    // 1. Canonicalize Objects
    const canonicalObjects = this.canonicalizationEngine.canonicalizeObjects(knowledgePackage.objects);

    const canonicalPackage = new KnowledgePackage({
      packageId: knowledgePackage.packageId,
      documentId: knowledgePackage.documentId,
      packageHash: knowledgePackage.packageHash,
      sourceFileName: knowledgePackage.sourceFileName,
      version: knowledgePackage.version,
      createdAt: knowledgePackage.createdAt,
      objects: canonicalObjects,
      relationships: knowledgePackage.relationships,
      evidenceList: knowledgePackage.evidenceList,
      metrics: {
        ...knowledgePackage.metrics,
        knowledgeObjectCount: canonicalObjects.length
      },
      metadata: {
        ...knowledgePackage.metadata,
        validatedAndRefinedAt: Date.now()
      }
    });

    // 2. Build Canonical Entities List
    const canonicalEntityMap = new Map<string, CanonicalEntity>();
    for (const obj of canonicalObjects) {
      const canonicalName = this.aliasDictionary.getCanonicalName(obj.entity);
      const normKey = CanonicalEntity.normalizeKey(canonicalName);

      if (!canonicalEntityMap.has(normKey)) {
        const entity = CanonicalEntity.create(
          `CAN_ENT_${normKey.toUpperCase()}`,
          canonicalName,
          {
            aliases: [obj.entity],
            category: (obj.metadata?.category as string) || 'GENERAL',
            version: '1.0.0-BUILD-017C.4R'
          }
        );
        canonicalEntityMap.set(normKey, entity);
      } else {
        const existing = canonicalEntityMap.get(normKey)!;
        if (!existing.aliases.includes(obj.entity)) {
          const updatedEntity = CanonicalEntity.create(existing.entityId, existing.canonicalName, {
            displayName: existing.displayName,
            aliases: [...existing.aliases, obj.entity],
            category: existing.category,
            version: existing.version,
            metadata: existing.metadata
          });
          canonicalEntityMap.set(normKey, updatedEntity);
        }
      }
    }
    const canonicalEntities = Array.from(canonicalEntityMap.values());

    // 3. Specialized Validations
    const knowledgeValidationRes = await this.knowledgeValidator.validate(canonicalPackage, options);
    const relIssues = this.relationshipValidator.validateRelationships(
      canonicalPackage.relationships,
      canonicalObjects
    );
    const evIssues = this.evidenceValidator.validateEvidence(canonicalPackage);
    const duplicates = this.duplicateValidator.validateDuplicates(
      canonicalObjects,
      canonicalPackage.evidenceList,
      canonicalPackage.relationships,
      canonicalEntities
    );
    const conflicts = this.conflictDetector.detectConflicts(
      canonicalObjects,
      canonicalPackage.relationships,
      canonicalEntities
    );

    // 4. Combine Issues
    const allIssues: IValidationIssue[] = [
      ...knowledgeValidationRes.issues,
      ...relIssues,
      ...evIssues
    ];

    const errorCount = allIssues.filter((i) => i.severity === 'ERROR').length;
    const warningCount = allIssues.filter((i) => i.severity === 'WARNING').length;

    const consolidatedValidationResult = new ValidationResult({
      success: errorCount === 0,
      totalObjectsEvaluated: canonicalObjects.length,
      totalEvidenceEvaluated: canonicalPackage.evidenceList.length,
      totalRelationshipsEvaluated: canonicalPackage.relationships.length,
      errorCount,
      warningCount,
      issues: allIssues,
      executionTimeMs: Date.now() - startTime,
      timestamp: Date.now()
    });

    const warnings = allIssues
      .filter((i) => i.severity === 'WARNING')
      .map((i) => `[${i.ruleName}] ${i.message}`);
    const errors = allIssues
      .filter((i) => i.severity === 'ERROR')
      .map((i) => `[${i.ruleName}] ${i.message}`);

    const brokenRelationshipsCount = relIssues.filter((i) => i.code.includes('BROKEN') || i.code.includes('CIRCULAR')).length;
    const evidenceFailuresCount = evIssues.filter((i) => i.severity === 'ERROR').length;

    const executionTimeMs = Date.now() - startTime;

    return new ValidatedKnowledgeResult({
      validatedObjects: canonicalObjects,
      canonicalEntities,
      validationResult: consolidatedValidationResult,
      conflicts,
      duplicates,
      metrics: {
        objectsValidatedCount: canonicalObjects.length,
        canonicalEntitiesCount: canonicalEntities.length,
        duplicateCount: duplicates.length,
        conflictCount: conflicts.length,
        brokenRelationshipsCount,
        evidenceFailuresCount,
        warningCount,
        errorCount,
        executionTimeMs
      },
      warnings,
      errors,
      pipelineVersion: '1.0.0-BUILD-017C.4R',
      executionTimeMs
    });
  }

  public getAliasDictionary(): AliasDictionary {
    return this.aliasDictionary;
  }
}

export const knowledgeValidationService = KnowledgeValidationService.getInstance();
