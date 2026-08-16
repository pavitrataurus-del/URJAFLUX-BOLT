import { CanonicalRule, KnowledgeStatus, AIExplainabilityOutput } from "./VerificationTypes";

export class VerificationRBACService {
  /**
   * Filter output based on user role.
   * END_USER receives only final approved/canonical knowledge.
   * Internal votes, source conflicts, review comments, and confidence calculations are hidden.
   */
  public filterCanonicalRulesForUser(
    rules: CanonicalRule[],
    userRole: "ADMIN" | "END_USER"
  ): Partial<CanonicalRule>[] {
    if (userRole === "ADMIN") {
      return rules;
    }

    // END_USER: Only CANONICAL rules, strip internal fields like reviewer, raw confidence score math
    return rules
      .filter(r => r.status === "CANONICAL")
      .map(r => ({
        ruleId: r.ruleId,
        title: r.title,
        statement: r.statement,
        domain: r.domain,
        supportingEvidence: r.supportingEvidence,
        canonicalVersion: r.canonicalVersion,
        approvalDate: r.approvalDate,
        status: r.status
      }));
  }

  public filterExplainabilityForUser(
    explainability: AIExplainabilityOutput,
    userRole: "ADMIN" | "END_USER"
  ): Partial<AIExplainabilityOutput> {
    if (userRole === "ADMIN") {
      return explainability;
    }

    // Strip raw confidence score & internal conflicts for END_USER
    return {
      ruleId: explainability.ruleId,
      selectedRecommendation: explainability.selectedRecommendation,
      whySelected: explainability.whySelected,
      supportingEvidence: explainability.supportingEvidence,
      approvalStatus: explainability.approvalStatus,
      applicableConditions: explainability.applicableConditions
    };
  }

  public canAccessVerificationDashboard(userRole: "ADMIN" | "END_USER"): boolean {
    return userRole === "ADMIN";
  }
}
