import { ContradictionRecord, ContradictionType, ContradictionResolutionState } from "./VerificationTypes";

export class ContradictionResolutionEngine {
  private static instance: ContradictionResolutionEngine;
  private contradictionStore: Map<string, ContradictionRecord[]> = new Map();

  public constructor() {}

  public static getInstance(): ContradictionResolutionEngine {
    if (!ContradictionResolutionEngine.instance) {
      ContradictionResolutionEngine.instance = new ContradictionResolutionEngine();
    }
    return ContradictionResolutionEngine.instance;
  }

  public logContradiction(
    ruleId: string,
    contradictionType: ContradictionType,
    claimA: string,
    claimB: string,
    sourceAId: string,
    sourceBId: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM"
  ): ContradictionRecord {
    const existing = this.contradictionStore.get(ruleId) || [];

    const record: ContradictionRecord = {
      id: `contradiction-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ruleId,
      contradictionType,
      claimA,
      claimB,
      sourceAId,
      sourceBId,
      severity,
      resolutionState: "UNRESOLVED",
      history: [
        {
          timestamp: new Date().toISOString(),
          action: "CONTRADICTION_LOGGED",
          actor: "System / Ingestion Engine",
          notes: `Logged contradiction: ${claimA} vs ${claimB}`
        }
      ]
    };

    existing.push(record);
    this.contradictionStore.set(ruleId, existing);
    return record;
  }

  public resolveContradiction(
    contradictionId: string,
    resolutionState: ContradictionResolutionState,
    actor: string,
    notes: string
  ): ContradictionRecord | undefined {
    for (const [ruleId, list] of this.contradictionStore.entries()) {
      const target = list.find(c => c.id === contradictionId);
      if (target) {
        target.resolutionState = resolutionState;
        target.resolutionNote = notes;
        target.history.push({
          timestamp: new Date().toISOString(),
          action: `RESOLVED_${resolutionState}`,
          actor,
          notes
        });
        return target;
      }
    }
    return undefined;
  }

  public getContradictionsByRule(ruleId: string): ContradictionRecord[] {
    return this.contradictionStore.get(ruleId) || [];
  }

  public getContradictionsForRule(ruleId: string): ContradictionRecord[] {
    return this.getContradictionsByRule(ruleId);
  }

  public getAllContradictions(): ContradictionRecord[] {
    const all: ContradictionRecord[] = [];
    for (const list of this.contradictionStore.values()) {
      all.push(...list);
    }
    return all;
  }
}

export const contradictionResolutionEngine = ContradictionResolutionEngine.getInstance();
