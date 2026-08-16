import {
  RuleExecutionResult,
  RuleDefinition,
  ConflictDefinition,
  IKnowledgePlugin
} from "../../types/ruleEngine";

/**
 * Compares two semantic version strings (e.g., "1.2.0" vs "1.0.1")
 * Returns > 0 if v1 > v2, < 0 if v1 < v2, and 0 if equal.
 */
export function compareSemVer(v1: string, v2: string): number {
  const p1 = v1.split(".").map(x => parseInt(x, 10) || 0);
  const p2 = v2.split(".").map(x => parseInt(x, 10) || 0);
  const maxLen = Math.max(p1.length, p2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 !== num2) {
      return num1 - num2;
    }
  }
  return 0;
}

export interface ResolutionOutcome {
  conflict: ConflictDefinition;
  winnerRuleId: string;
  loserRuleId: string;
  strategyApplied: string;
  justification: string;
}

export class ConflictResolver {
  private conflicts: ConflictDefinition[] = [];

  /**
   * Registers a known conflict between two rules
   */
  public registerConflict(ruleIdA: string, ruleIdB: string, description: string): void {
    // Check if duplicate
    const exists = this.conflicts.some(
      c => (c.ruleIdA === ruleIdA && c.ruleIdB === ruleIdB) || (c.ruleIdA === ruleIdB && c.ruleIdB === ruleIdA)
    );
    if (!exists) {
      this.conflicts.push({ ruleIdA, ruleIdB, description });
    }
  }

  /**
   * Evaluates active conflicts among matched rule results, determines winners,
   * and overrides/filters out suppressed execution results.
   */
  public resolveConflicts(
    results: RuleExecutionResult[],
    ruleDefinitions: Map<string, RuleDefinition>,
    plugins: Map<string, IKnowledgePlugin>
  ): {
    resolvedResults: RuleExecutionResult[];
    outcomes: ResolutionOutcome[];
  } {
    // We only care about matched rules for active conflicts
    const matchedResults = results.filter(r => r.matched && r.status === "SUCCESS");
    const matchedRuleIds = new Set(matchedResults.map(r => r.ruleId));

    // Find which of our registered conflicts are triggered in this run
    const triggeredConflicts = this.conflicts.filter(
      c => matchedRuleIds.has(c.ruleIdA) && matchedRuleIds.has(c.ruleIdB)
    );

    const suppressedRuleIds = new Set<string>();
    const outcomes: ResolutionOutcome[] = [];

    for (const conflict of triggeredConflicts) {
      // If one of them is already suppressed by another conflict, we can skip or continue
      if (suppressedRuleIds.has(conflict.ruleIdA) || suppressedRuleIds.has(conflict.ruleIdB)) {
        continue;
      }

      const ruleA = ruleDefinitions.get(conflict.ruleIdA);
      const ruleB = ruleDefinitions.get(conflict.ruleIdB);
      const resultA = results.find(r => r.ruleId === conflict.ruleIdA);
      const resultB = results.find(r => r.ruleId === conflict.ruleIdB);

      if (!ruleA || !ruleB || !resultA || !resultB) {
        continue;
      }

      const pluginA = plugins.get(ruleA.pluginId);
      const pluginB = plugins.get(ruleB.pluginId);

      // Resolve!
      let winner: string = "";
      let loser: string = "";
      let strategy = "";
      let justification = "";

      // 1. Rule Priority
      if (ruleA.priority !== ruleB.priority) {
        const winRule = ruleA.priority > ruleB.priority ? ruleA : ruleB;
        const loseRule = winRule === ruleA ? ruleB : ruleA;
        winner = winRule.id;
        loser = loseRule.id;
        strategy = "Rule Priority";
        justification = `Rule "${winRule.name}" has higher priority (${winRule.priority}) than "${loseRule.name}" (${loseRule.priority}).`;
      } 
      // 2. Plugin Priority
      else if (pluginA && pluginB && pluginA.metadata.priority !== pluginB.metadata.priority) {
        const winPlugin = pluginA.metadata.priority > pluginB.metadata.priority ? pluginA : pluginB;
        const winRule = winPlugin === pluginA ? ruleA : ruleB;
        const loseRule = winRule === ruleA ? ruleB : ruleA;
        winner = winRule.id;
        loser = loseRule.id;
        strategy = "Plugin Priority";
        justification = `Plugin "${winPlugin.metadata.name}" has higher priority (${winPlugin.metadata.priority}) than "${winPlugin === pluginA ? pluginB.metadata.name : pluginA.metadata.name}" (${winPlugin === pluginA ? pluginB.metadata.priority : pluginA.metadata.priority}).`;
      } 
      // 3. Evidence Strength
      else if (resultA.evidence.strength !== resultB.evidence.strength) {
        const winResult = resultA.evidence.strength > resultB.evidence.strength ? resultA : resultB;
        const winRule = winResult === resultA ? ruleA : ruleB;
        const loseRule = winRule === ruleA ? ruleB : ruleA;
        winner = winRule.id;
        loser = loseRule.id;
        strategy = "Evidence Strength";
        justification = `Rule "${winRule.name}" has stronger evidence confidence/strength (${winResult.evidence.strength}) than "${loseRule.name}" (${winResult === resultA ? resultB.evidence.strength : resultA.evidence.strength}).`;
      } 
      // 4. Newest Version
      else {
        const verComp = compareSemVer(ruleA.version, ruleB.version);
        if (verComp !== 0) {
          const winRule = verComp > 0 ? ruleA : ruleB;
          const loseRule = winRule === ruleA ? ruleB : ruleA;
          winner = winRule.id;
          loser = loseRule.id;
          strategy = "Newest Version";
          justification = `Rule "${winRule.name}" is a newer version (${winRule.version}) than "${loseRule.name}" (${loseRule.version}).`;
        } else {
          // Absolute fallback tie breaker: Rule ID alphabetical sort
          const winRule = ruleA.id < ruleB.id ? ruleA : ruleB;
          const loseRule = winRule === ruleA ? ruleB : ruleA;
          winner = winRule.id;
          loser = loseRule.id;
          strategy = "Deterministic Fallback (Rule ID)";
          justification = `Deterministic fallback resolved in favor of "${winRule.name}" over "${loseRule.name}" (alphabetical sorting of Rule IDs).`;
        }
      }

      suppressedRuleIds.add(loser);
      outcomes.push({
        conflict,
        winnerRuleId: winner,
        loserRuleId: loser,
        strategyApplied: strategy,
        justification
      });
    }

    // Suppress losers by mapping their results to matched: false or completely filtering
    const resolvedResults = results.map(r => {
      if (suppressedRuleIds.has(r.ruleId)) {
        return {
          ...r,
          matched: false,
          warnings: [...r.warnings, `Suppressed due to override by winning rule in conflict resolution.`]
        };
      }
      return r;
    });

    return {
      resolvedResults,
      outcomes
    };
  }

  /**
   * Returns all registered conflicts
   */
  public getConflicts(): ConflictDefinition[] {
    return this.conflicts;
  }
}
