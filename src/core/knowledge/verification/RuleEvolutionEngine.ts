import { RuleEvolutionSnapshot } from "./VerificationTypes";

export class RuleEvolutionEngine {
  private static instance: RuleEvolutionEngine;
  private evolutionStore: Map<string, RuleEvolutionSnapshot[]> = new Map();

  public constructor() {}

  public static getInstance(): RuleEvolutionEngine {
    if (!RuleEvolutionEngine.instance) {
      RuleEvolutionEngine.instance = new RuleEvolutionEngine();
    }
    return RuleEvolutionEngine.instance;
  }

  public recordEvolution(
    ruleId: string,
    statement: string,
    version: string,
    evidenceAdded: string[],
    evidenceRemoved: string[],
    expertChanges: string[],
    changedBy: string,
    reason: string
  ): RuleEvolutionSnapshot {
    const history = this.evolutionStore.get(ruleId) || [];

    const snapshot: RuleEvolutionSnapshot = {
      version,
      timestamp: new Date().toISOString(),
      statement,
      evidenceAdded,
      evidenceRemoved,
      expertChanges,
      changedBy,
      reason
    };

    history.push(snapshot);
    this.evolutionStore.set(ruleId, history);
    return snapshot;
  }

  public getRuleHistory(ruleId: string): RuleEvolutionSnapshot[] {
    return this.evolutionStore.get(ruleId) || [];
  }

  public getEvolutionHistory(ruleId: string): RuleEvolutionSnapshot[] {
    return this.getRuleHistory(ruleId);
  }
}

export const ruleEvolutionEngine = RuleEvolutionEngine.getInstance();
