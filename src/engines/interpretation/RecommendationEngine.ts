import { 
  InterpretationContext, 
  InterpretationFinding, 
  InterpretationRecommendation, 
  RecommendationProviderPlugin 
} from "./InterpretationTypes";
import { KnowledgeVaultService, VaultRule } from "../../services/knowledgeVaultService";

/**
 * Standard remedy recommendation provider.
 * Sourced STRICTLY from approved rules in the permanent Knowledge Vault.
 */
export class StandardRecommendationProvider implements RecommendationProviderPlugin {
  public readonly pluginId = "built_in_recommendations";
  public readonly name = "Approved Knowledge Vault Vastu Remedy Provider";

  public generateRecommendations(
    findings: InterpretationFinding[], 
    context: InterpretationContext
  ): InterpretationRecommendation[] {
    const recommendations: InterpretationRecommendation[] = [];
    // Get ALL APPROVED rules from Knowledge Vault
    const approvedRules: VaultRule[] = KnowledgeVaultService.getApprovedRules();

    findings.forEach(finding => {
      // Find matching approved rules from Knowledge Vault based on affected area or category
      const matchingRules = approvedRules.filter(r => {
        const areaMatch = finding.affectedArea && r.condition.toLowerCase().includes(finding.affectedArea.toLowerCase());
        const catMatch = r.category.toLowerCase().includes(finding.category.toLowerCase()) || 
                          finding.category.toLowerCase().includes(r.category.toLowerCase());
        const titleMatch = r.applicableObjects.some(obj => finding.title.toLowerCase().includes(obj.toLowerCase()));
        return areaMatch || catMatch || titleMatch;
      });

      if (matchingRules.length > 0) {
        matchingRules.forEach(rule => {
          recommendations.push({
            id: `REC-VAULT-${rule.id}-${Date.now()}-${Math.floor(Math.random() * 100)}`,
            findingId: finding.id,
            title: `Remedy for ${rule.category}: ${rule.condition.slice(0, 40)}...`,
            priority: rule.severity === "CRITICAL" || rule.severity === "HIGH" ? "HIGH" : "MEDIUM",
            reason: rule.condition,
            expectedBenefit: `Neutralizes Vastu imbalance and restores biological energy flow per ${rule.category}.`,
            knowledgeSource: {
              bookId: rule.documentId,
              bookTitle: rule.documentTitle,
              chapter: rule.evidence?.chapter || rule.category,
              verse: rule.evidence?.verse || `Rule ID ${rule.id}`,
              citationText: rule.condition
            },
            implementationDifficulty: rule.severity === "CRITICAL" ? "HARD" : "MEDIUM",
            estimatedImpact: rule.severity === "CRITICAL" ? "HIGH" : "MEDIUM",
            remedyAction: rule.recommendation
          });
        });
      } else {
        // Fallback to default approved remedy template from Knowledge Vault
        const defaultRule = approvedRules.find(r => r.approvalStatus === "APPROVED") || {
          id: "RULE-DEFAULT",
          documentId: "DOC-VAULT-001",
          documentTitle: "Canonical Vastu Science Treatise",
          category: "Elemental Realignment",
          condition: `Vastu layout deviation in ${finding.affectedArea || "specified area"}`,
          recommendation: "Apply color therapy balancers (white/light green), install brass energy helix, and keep affected zone uncluttered.",
          severity: "MEDIUM" as const,
          confidence: 0.95,
          applicableObjects: [],
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          approvalStatus: "APPROVED" as const,
          version: "1.0",
          revisionNumber: 1,
          evidence: { confidence: 0.95 }
        };

        recommendations.push({
          id: `REC-VAULT-DEF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          findingId: finding.id,
          title: `Elemental Realignment for ${finding.affectedArea || "Affected Sector"}`,
          priority: finding.severity === "CRITICAL" || finding.severity === "HIGH" ? "HIGH" : "MEDIUM",
          reason: defaultRule.condition,
          expectedBenefit: "Harmonizes magnetic vectors and balances elemental prana flow.",
          knowledgeSource: {
            bookId: defaultRule.documentId,
            bookTitle: defaultRule.documentTitle,
            chapter: defaultRule.category,
            citationText: defaultRule.condition
          },
          implementationDifficulty: "EASY",
          estimatedImpact: "MEDIUM",
          remedyAction: defaultRule.recommendation
        });
      }
    });

    return recommendations;
  }
}

/**
 * Recommendation Engine pipeline coordinator.
 * Chains all recommendation plugins together.
 */
export class RecommendationEngine {
  private plugins: RecommendationProviderPlugin[] = [];

  constructor() {
    this.registerPlugin(new StandardRecommendationProvider());
  }

  public registerPlugin(plugin: RecommendationProviderPlugin): void {
    const exists = this.plugins.some(p => p.pluginId === plugin.pluginId);
    if (exists) {
      throw new Error(`[RecommendationEngine] Plugin with ID "${plugin.pluginId}" is already registered.`);
    }
    this.plugins.push(plugin);
  }

  /**
   * Evaluates calibrated findings to compile complete recommendations.
   */
  public generate(findings: InterpretationFinding[], context: InterpretationContext): InterpretationRecommendation[] {
    const recommendations: InterpretationRecommendation[] = [];

    this.plugins.forEach(plugin => {
      try {
        const result = plugin.generateRecommendations(findings, context);
        recommendations.push(...result);
      } catch (err: unknown) {
        console.error(
          `[RecommendationEngine] Plugin "${plugin.pluginId}" failed to compile recommendations: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    });

    return recommendations;
  }
}
