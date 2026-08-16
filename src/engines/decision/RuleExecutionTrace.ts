/**
 * URJAFLUX AI OS — SPRINT 3B
 * Rule Execution Trace Engine
 * Exposes exact execution traces, inputs, outputs, pass/fail status,
 * execution timing, and rule pack versions for complete auditability.
 */

export interface RuleExecutionRecord {
  ruleId: string;
  ruleName: string;
  rulePack: string;
  version: string;
  domain: "VASTU" | "AYADI" | "ENERGY" | "STRUCTURAL" | "ENVIRONMENTAL";
  inputValues: Record<string, any>;
  evaluationResult: "PASS" | "FAIL" | "IGNORED" | "SKIPPED";
  conditionEvaluated: string;
  executionTimeMs: number;
  timestamp: string;
}

export interface RuleExecutionSummary {
  totalExecuted: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  totalExecutionTimeMs: number;
  records: RuleExecutionRecord[];
}

export class RuleExecutionTracker {
  private static records: RuleExecutionRecord[] = [];

  public static logExecution(record: Omit<RuleExecutionRecord, "timestamp">): RuleExecutionRecord {
    const fullRecord: RuleExecutionRecord = {
      ...record,
      timestamp: new Date().toISOString()
    };
    this.records.push(fullRecord);
    return fullRecord;
  }

  public static getRecords(): RuleExecutionRecord[] {
    return [...this.records];
  }

  public static getSummary(): RuleExecutionSummary {
    const totalExecuted = this.records.length;
    const passedCount = this.records.filter((r) => r.evaluationResult === "PASS").length;
    const failedCount = this.records.filter((r) => r.evaluationResult === "FAIL").length;
    const skippedCount = this.records.filter((r) => r.evaluationResult === "SKIPPED" || r.evaluationResult === "IGNORED").length;
    const totalExecutionTimeMs = this.records.reduce((acc, r) => acc + r.executionTimeMs, 0);

    return {
      totalExecuted,
      passedCount,
      failedCount,
      skippedCount,
      totalExecutionTimeMs: Math.round(totalExecutionTimeMs * 100) / 100,
      records: [...this.records]
    };
  }

  public static clear(): void {
    this.records = [];
  }
}
