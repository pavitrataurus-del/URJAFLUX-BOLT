import { KnowledgePackage } from '../models/KnowledgePackage';
import {
  IValidationRule,
  IValidationIssue,
  MandatoryFieldsRule,
  EvidenceTraceabilityRule,
  ConfidenceThresholdRule,
  RelationshipIntegrityRule
} from './ValidationRule';
import { ValidationResult } from './ValidationResult';

export class ValidationEngine {
  private readonly rules: Map<string, IValidationRule> = new Map();

  constructor(customRules?: IValidationRule[]) {
    if (customRules && customRules.length > 0) {
      customRules.forEach((rule) => this.registerRule(rule));
    } else {
      this.registerDefaultRules();
    }
  }

  private registerDefaultRules(): void {
    this.registerRule(new MandatoryFieldsRule());
    this.registerRule(new EvidenceTraceabilityRule());
    this.registerRule(new ConfidenceThresholdRule());
    this.registerRule(new RelationshipIntegrityRule());
  }

  public registerRule(rule: IValidationRule): void {
    this.rules.set(rule.ruleName, rule);
  }

  public unregisterRule(ruleName: string): boolean {
    return this.rules.delete(ruleName);
  }

  public getRules(): readonly IValidationRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  public async validatePackage(knowledgePackage: KnowledgePackage): Promise<ValidationResult> {
    const startTime = Date.now();
    const activeRules = this.getRules().filter((r) => r.enabled);
    const aggregatedIssues: IValidationIssue[] = [];

    for (const rule of activeRules) {
      try {
        const result = await rule.validate(knowledgePackage);
        aggregatedIssues.push(...result.issues);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        aggregatedIssues.push({
          code: 'ERR_RULE_EXECUTION_EXCEPTION',
          message: `Validation rule '${rule.ruleName}' threw exception: ${errMsg}`,
          severity: 'ERROR',
          ruleName: rule.ruleName,
          timestamp: Date.now()
        });
      }
    }

    const errorCount = aggregatedIssues.filter((i) => i.severity === 'ERROR').length;
    const warningCount = aggregatedIssues.filter((i) => i.severity === 'WARNING').length;
    const isSuccess = errorCount === 0;

    return new ValidationResult({
      success: isSuccess,
      totalObjectsEvaluated: knowledgePackage.objects.length,
      totalEvidenceEvaluated: knowledgePackage.evidenceList.length,
      totalRelationshipsEvaluated: knowledgePackage.relationships.length,
      errorCount,
      warningCount,
      issues: aggregatedIssues,
      executionTimeMs: Date.now() - startTime,
      timestamp: Date.now()
    });
  }
}
