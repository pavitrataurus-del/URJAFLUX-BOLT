import { CanonicalRule, KnowledgeEvidence, KnowledgeConfidence } from "./VerificationTypes";

export class CanonicalRuleBuilder {
  private static instance: CanonicalRuleBuilder;
  private canonicalStore: Map<string, CanonicalRule> = new Map();

  public constructor() {}

  public static getInstance(): CanonicalRuleBuilder {
    if (!CanonicalRuleBuilder.instance) {
      CanonicalRuleBuilder.instance = new CanonicalRuleBuilder();
    }
    return CanonicalRuleBuilder.instance;
  }

  public buildCanonicalRule(
    ruleId: string,
    title: string,
    statement: string,
    domain: string,
    evidence?: KnowledgeEvidence,
    confidence?: KnowledgeConfidence,
    reviewer: string = "Acharya SME Reviewer"
  ): CanonicalRule {
    const canonical: CanonicalRule = {
      ruleId,
      canonicalVersion: "1.0.0",
      title,
      statement,
      domain,
      supportingEvidence: evidence ? evidence.primarySources.map(s => `${s.title} (${s.author})`) : ["Classical Scriptural Canon"],
      confidenceScore: confidence ? confidence.confidenceScore : 92,
      confidenceGrade: confidence ? confidence.confidenceGrade : "A",
      approvalDate: new Date().toISOString().split("T")[0],
      reviewer,
      status: "CANONICAL"
    };

    this.canonicalStore.set(ruleId, canonical);
    return canonical;
  }

  public getCanonicalRule(ruleId: string): CanonicalRule | undefined {
    return this.canonicalStore.get(ruleId);
  }

  public generateCanonicalRule(
    ruleId: string,
    title: string,
    statement: string,
    domain: string,
    evidence?: KnowledgeEvidence,
    confidence?: KnowledgeConfidence,
    reviewer: string = "Acharya SME Reviewer"
  ): CanonicalRule {
    return this.buildCanonicalRule(ruleId, title, statement, domain, evidence, confidence, reviewer);
  }

  public getAllCanonicalRules(): CanonicalRule[] {
    return Array.from(this.canonicalStore.values());
  }
}

export const canonicalRuleBuilder = CanonicalRuleBuilder.getInstance();
