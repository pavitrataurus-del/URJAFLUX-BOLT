import { 
  ProceduralRule, 
  RuleEvaluationContext, 
  EvaluationResultItem, 
  ProceduralDiagnostics,
  RuleDomain 
} from "./types";
import { vastuRuleRegistry } from "./VastuRuleRegistry";
import { lalKitabRuleRegistry } from "./LalKitabRuleRegistry";
import { numerologyRuleRegistry } from "./NumerologyRuleRegistry";

export class ProceduralRuleEngine {
  /**
   * Executes multi-domain procedural rule evaluation for property elements.
   */
  public evaluate(
    contexts: RuleEvaluationContext[],
    activeDomains: RuleDomain[] = ["VASTU"],
    netNorthAngle: number = 0
  ): { results: EvaluationResultItem[]; diagnostics: ProceduralDiagnostics } {
    const allRegisteredRules: ProceduralRule[] = [];
    const results: EvaluationResultItem[] = [];

    // Gather rules for requested domains
    if (activeDomains.includes("VASTU")) {
      allRegisteredRules.push(...vastuRuleRegistry.getAllRules());
    }
    if (activeDomains.includes("LAL_KITAB")) {
      allRegisteredRules.push(...lalKitabRuleRegistry.getAllRules());
    }
    if (activeDomains.includes("NUMEROLOGY")) {
      allRegisteredRules.push(...numerologyRuleRegistry.getAllRules());
    }

    let applicableRulesCount = 0;
    let executedRulesCount = 0;

    for (const ctx of contexts) {
      // For each element context, evaluate across active domain registries
      if (activeDomains.includes("VASTU")) {
        const vastuResults = vastuRuleRegistry.evaluateElement(ctx);
        results.push(...vastuResults);
        executedRulesCount += vastuRuleRegistry.getAllRules().length;
      }
      if (activeDomains.includes("LAL_KITAB")) {
        const lkResults = lalKitabRuleRegistry.evaluateElement(ctx);
        results.push(...lkResults);
        executedRulesCount += lalKitabRuleRegistry.getAllRules().length;
      }
      if (activeDomains.includes("NUMEROLOGY")) {
        const numResults = numerologyRuleRegistry.evaluateElement(ctx);
        results.push(...numResults);
        executedRulesCount += numerologyRuleRegistry.getAllRules().length;
      }
    }

    // Deduplicate results by element + ruleId
    const seenMap = new Map<string, EvaluationResultItem>();
    for (const item of results) {
      const key = `${item.ruleId}_${item.elementName}_${item.zone}`;
      if (!seenMap.has(key)) {
        seenMap.set(key, item);
      }
    }
    const deduplicatedResults = Array.from(seenMap.values());

    const defects = deduplicatedResults.filter(r => r.ruleType === "DEFECT");

    const diagnostics: ProceduralDiagnostics = {
      registeredRulesCount: allRegisteredRules.length,
      applicableRulesCount: contexts.length * allRegisteredRules.length,
      executedRulesCount: executedRulesCount,
      triggeredRulesCount: defects.length,
      findingsCount: defects.length,
      recommendationsCount: defects.length,
      netNorthAngle: netNorthAngle,
      domainsEvaluated: activeDomains
    };

    console.info(`[ProceduralRuleEngine] Evaluation Diagnostic Summary:`, {
      registeredRules: diagnostics.registeredRulesCount,
      elementsEvaluated: contexts.length,
      netNorthAngle: diagnostics.netNorthAngle,
      defectsFound: diagnostics.triggeredRulesCount,
      domains: diagnostics.domainsEvaluated
    });

    return {
      results: deduplicatedResults,
      diagnostics
    };
  }
}

export const proceduralRuleEngine = new ProceduralRuleEngine();
