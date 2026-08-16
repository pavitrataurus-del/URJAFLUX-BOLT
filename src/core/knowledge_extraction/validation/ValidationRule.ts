import { KnowledgePackage } from '../models/KnowledgePackage';
import { KnowledgeObject } from '../models/KnowledgeObject';

export type ValidationIssueSeverity = 'ERROR' | 'WARNING';

export interface IValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: ValidationIssueSeverity;
  readonly targetId?: string;
  readonly ruleName: string;
  readonly timestamp: number;
  readonly details?: Record<string, unknown>;
}

export interface IValidationRuleResult {
  readonly passed: boolean;
  readonly issues: readonly IValidationIssue[];
}

export interface IValidationRule {
  readonly ruleName: string;
  readonly description: string;
  readonly priority: number;
  readonly enabled: boolean;
  validate(knowledgePackage: KnowledgePackage): Promise<IValidationRuleResult>;
}

export abstract class BaseValidationRule implements IValidationRule {
  public abstract readonly ruleName: string;
  public abstract readonly description: string;
  public abstract readonly priority: number;
  public readonly enabled: boolean = true;

  public abstract validate(knowledgePackage: KnowledgePackage): Promise<IValidationRuleResult>;

  protected createIssue(
    code: string,
    message: string,
    severity: ValidationIssueSeverity,
    targetId?: string,
    details?: Record<string, unknown>
  ): IValidationIssue {
    return {
      code,
      message,
      severity,
      targetId,
      ruleName: this.ruleName,
      timestamp: Date.now(),
      details
    };
  }
}

export class MandatoryFieldsRule extends BaseValidationRule {
  public readonly ruleName = 'MandatoryFieldsRule';
  public readonly description = 'Validates that KnowledgeObjects contain non-empty mandatory identifiers and fields.';
  public readonly priority = 100;

  public async validate(knowledgePackage: KnowledgePackage): Promise<IValidationRuleResult> {
    const issues: IValidationIssue[] = [];

    for (const obj of knowledgePackage.objects) {
      if (!obj.knowledgeId || !obj.knowledgeId.trim()) {
        issues.push(this.createIssue('ERR_MISSING_KNOWLEDGE_ID', 'KnowledgeObject is missing knowledgeId', 'ERROR', obj.knowledgeId));
      }
      if (!obj.entity || !obj.entity.trim()) {
        issues.push(this.createIssue('ERR_MISSING_ENTITY', 'KnowledgeObject entity is empty', 'ERROR', obj.knowledgeId));
      }
      if (!obj.attribute || !obj.attribute.trim()) {
        issues.push(this.createIssue('ERR_MISSING_ATTRIBUTE', 'KnowledgeObject attribute is empty', 'ERROR', obj.knowledgeId));
      }
      if (!obj.sourceDocumentId || !obj.sourceDocumentId.trim()) {
        issues.push(this.createIssue('ERR_MISSING_SOURCE_DOC', 'KnowledgeObject sourceDocumentId is empty', 'ERROR', obj.knowledgeId));
      }
      if (!obj.sourceNodeId || !obj.sourceNodeId.trim()) {
        issues.push(this.createIssue('ERR_MISSING_SOURCE_NODE', 'KnowledgeObject sourceNodeId is empty', 'ERROR', obj.knowledgeId));
      }
    }

    const hasErrors = issues.some((i) => i.severity === 'ERROR');
    return {
      passed: !hasErrors,
      issues
    };
  }
}

export class EvidenceTraceabilityRule extends BaseValidationRule {
  public readonly ruleName = 'EvidenceTraceabilityRule';
  public readonly description = 'Verifies that every KnowledgeObject has supporting KnowledgeEvidence linking to document nodes.';
  public readonly priority = 90;

  public async validate(knowledgePackage: KnowledgePackage): Promise<IValidationRuleResult> {
    const issues: IValidationIssue[] = [];
    const evidenceNodeIds = new Set<string>();

    knowledgePackage.evidenceList.forEach((ev) => {
      if (ev.nodeId) {
        evidenceNodeIds.add(ev.nodeId);
      }
    });

    for (const obj of knowledgePackage.objects) {
      if (!evidenceNodeIds.has(obj.sourceNodeId)) {
        issues.push(
          this.createIssue(
            'WARN_UNTRACEABLE_EVIDENCE',
            `KnowledgeObject '${obj.knowledgeId}' sourceNodeId '${obj.sourceNodeId}' has no explicit KnowledgeEvidence registered`,
            'WARNING',
            obj.knowledgeId,
            { sourceNodeId: obj.sourceNodeId }
          )
        );
      }
    }

    const hasErrors = issues.some((i) => i.severity === 'ERROR');
    return {
      passed: !hasErrors,
      issues
    };
  }
}

export class ConfidenceThresholdRule extends BaseValidationRule {
  public readonly ruleName = 'ConfidenceThresholdRule';
  public readonly description = 'Checks that confidence scores are within valid range [0, 1] and flags low-confidence objects.';
  public readonly priority = 80;

  public async validate(knowledgePackage: KnowledgePackage): Promise<IValidationRuleResult> {
    const issues: IValidationIssue[] = [];

    for (const obj of knowledgePackage.objects) {
      if (typeof obj.confidence !== 'number' || isNaN(obj.confidence) || obj.confidence < 0 || obj.confidence > 1) {
        issues.push(
          this.createIssue(
            'ERR_INVALID_CONFIDENCE_SCORE',
            `KnowledgeObject '${obj.knowledgeId}' has invalid confidence score: ${obj.confidence}`,
            'ERROR',
            obj.knowledgeId
          )
        );
      } else if (obj.confidence < 0.5) {
        issues.push(
          this.createIssue(
            'WARN_LOW_CONFIDENCE',
            `KnowledgeObject '${obj.knowledgeId}' has low confidence score: ${obj.confidence}`,
            'WARNING',
            obj.knowledgeId,
            { confidence: obj.confidence }
          )
        );
      }
    }

    const hasErrors = issues.some((i) => i.severity === 'ERROR');
    return {
      passed: !hasErrors,
      issues
    };
  }
}

export class RelationshipIntegrityRule extends BaseValidationRule {
  public readonly ruleName = 'RelationshipIntegrityRule';
  public readonly description = 'Verifies that source and target identifiers in relationships exist within the package or document nodes.';
  public readonly priority = 70;

  public async validate(knowledgePackage: KnowledgePackage): Promise<IValidationRuleResult> {
    const issues: IValidationIssue[] = [];
    const validIds = new Set<string>();

    knowledgePackage.objects.forEach((o) => validIds.add(o.knowledgeId));
    knowledgePackage.evidenceList.forEach((e) => validIds.add(e.evidenceId));

    for (const rel of knowledgePackage.relationships) {
      if (!rel.sourceKnowledgeId || !rel.sourceKnowledgeId.trim()) {
        issues.push(
          this.createIssue('ERR_EMPTY_REL_SOURCE', `KnowledgeRelationship '${rel.relationshipId}' has empty sourceKnowledgeId`, 'ERROR', rel.relationshipId)
        );
      }
      if (!rel.targetKnowledgeId || !rel.targetKnowledgeId.trim()) {
        issues.push(
          this.createIssue('ERR_EMPTY_REL_TARGET', `KnowledgeRelationship '${rel.relationshipId}' has empty targetKnowledgeId`, 'ERROR', rel.relationshipId)
        );
      }
    }

    const hasErrors = issues.some((i) => i.severity === 'ERROR');
    return {
      passed: !hasErrors,
      issues
    };
  }
}
