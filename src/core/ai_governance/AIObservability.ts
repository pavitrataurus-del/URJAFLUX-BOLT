import { TokenUsage, CostRecord, AIAuditRecord, AIProviderType } from "./types";

export class AIObservability {
  private static instance: AIObservability | null = null;
  private usages: TokenUsage[] = [];
  private budgets: CostRecord[] = [];
  private auditLogs: AIAuditRecord[] = [];

  private constructor() {
    this.seedMockObservability();
  }

  public static getInstance(): AIObservability {
    if (!AIObservability.instance) {
      AIObservability.instance = new AIObservability();
    }
    return AIObservability.instance;
  }

  private seedMockObservability() {
    // Generate usage records for the past 30 days
    const departments = ["Vastu Analytics", "Lal Kitab Science", "Numerology Core", "System Orchestration"];
    const models = ["mdl-gemini-3-6-flash", "mdl-gemini-3-1-pro", "mdl-claude-3-5-sonnet", "mdl-gpt-4o", "mdl-local-llama3"];
    const providers = [AIProviderType.GEMINI, AIProviderType.GEMINI, AIProviderType.ANTHROPIC, AIProviderType.OPENAI, AIProviderType.OLLAMA];
    const domains = ["DOMAIN-006:VastuReasoning", "DOMAIN-009:Consultation", "DOMAIN-010:ReportGen", "DOMAIN-012:VisionAI"];

    const now = new Date();
    for (let i = 45; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 12 * 60 * 60 * 1000); // 2 samples per day
      const modelIndex = Math.floor(Math.random() * models.length);
      const deptIndex = Math.floor(Math.random() * departments.length);
      const domainIndex = Math.floor(Math.random() * domains.length);

      const promptTokens = Math.floor(Math.random() * 2000) + 300;
      const completionTokens = Math.floor(Math.random() * 1000) + 100;
      const totalTokens = promptTokens + completionTokens;

      // Pricing logic per Million
      let inputRate = 0.075;
      let outputRate = 0.30;
      if (modelIndex === 1) { // gemini pro
        inputRate = 1.25;
        outputRate = 5.00;
      } else if (modelIndex === 2) { // claude sonnet
        inputRate = 3.00;
        outputRate = 15.00;
      } else if (modelIndex === 3) { // gpt4o
        inputRate = 5.00;
        outputRate = 15.00;
      } else if (modelIndex === 4) { // llama local
        inputRate = 0;
        outputRate = 0;
      }

      const cost = ((promptTokens / 1000000) * inputRate) + ((completionTokens / 1000000) * outputRate);

      const usage: TokenUsage = {
        id: `tok-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: date.toISOString(),
        modelId: models[modelIndex],
        provider: providers[modelIndex],
        promptTokens,
        completionTokens,
        totalTokens,
        costInUsd: cost,
        userId: i % 2 === 0 ? "pavitra.taurus@gmail.com" : "scholar_user_02",
        department: departments[deptIndex],
        contextDomain: domains[domainIndex]
      };

      this.usages.push(usage);
    }

    // Monthly Budgets
    this.budgets = [
      {
        id: "bdg-vastu-july",
        month: "2026-07",
        department: "Vastu Analytics",
        totalCost: 145.20,
        tokenCount: 42000000,
        budgetLimit: 250.00
      },
      {
        id: "bdg-lalkitab-july",
        month: "2026-07",
        department: "Lal Kitab Science",
        totalCost: 98.45,
        tokenCount: 28500000,
        budgetLimit: 150.00
      },
      {
        id: "bdg-numerology-july",
        month: "2026-07",
        department: "Numerology Core",
        totalCost: 12.10,
        tokenCount: 15000000,
        budgetLimit: 50.00
      },
      {
        id: "bdg-sys-july",
        month: "2026-07",
        department: "System Orchestration",
        totalCost: 245.80,
        tokenCount: 110000000,
        budgetLimit: 300.00
      }
    ];

    // Audit logs
    this.auditLogs = [
      {
        id: "aud-001",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        userId: "pavitra.taurus@gmail.com",
        action: "PROMPT_DECRYPT",
        details: "User decrypted core Astro-Vastu template ver-vastu-1-0 to trace prompt payload leakage constraints.",
        ipAddress: "192.168.1.52",
        severity: "INFO",
        justification: "Diagnosing remedy precision output issues."
      },
      {
        id: "aud-002",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        userId: "pavitra.taurus@gmail.com",
        action: "MODEL_DEPRECATION",
        details: "Google Gemini 1.5 Flash deprecation workflow initiated due to migration to Gemini 3.6 Flash.",
        ipAddress: "192.168.1.52",
        severity: "WARNING",
        justification: "Upgrading to Gemini 3.1 & 3.6 generation."
      },
      {
        id: "aud-003",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        userId: "system-cron",
        action: "POLICY_ENFORCE",
        details: "Safety policy 'Block offensive profanity' automatically flagged prompt variable value with potential restricted keyword list.",
        ipAddress: "127.0.0.1",
        severity: "CRITICAL",
        justification: "Centralized policy enforcement."
      }
    ];
  }

  public getUsages(): TokenUsage[] {
    return this.usages;
  }

  public getBudgets(): CostRecord[] {
    return this.budgets;
  }

  public getAuditLogs(): AIAuditRecord[] {
    return this.auditLogs;
  }

  public logUsage(usage: Omit<TokenUsage, "id" | "timestamp">): TokenUsage {
    const record: TokenUsage = {
      ...usage,
      id: `tok-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    this.usages.push(record);

    // Update matching budget
    const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const budget = this.budgets.find(b => b.department === record.department && b.month === currentMonth);
    if (budget) {
      budget.totalCost += record.costInUsd;
      budget.tokenCount += record.totalTokens;
    } else {
      this.budgets.push({
        id: `bdg-${Math.random().toString(36).substr(2, 9)}`,
        month: currentMonth,
        department: record.department,
        totalCost: record.costInUsd,
        tokenCount: record.totalTokens,
        budgetLimit: 200.00
      });
    }

    return record;
  }

  public logAudit(audit: Omit<AIAuditRecord, "id" | "timestamp">): AIAuditRecord {
    const record: AIAuditRecord = {
      ...audit,
      id: `aud-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(record); // newest first
    return record;
  }

  // Cost Per Model Metrics for DOMAIN-016
  public getCostPerModelMetrics(): Record<string, { cost: number; tokens: number; count: number }> {
    const map: Record<string, { cost: number; tokens: number; count: number }> = {};
    for (const u of this.usages) {
      if (!map[u.modelId]) {
        map[u.modelId] = { cost: 0, tokens: 0, count: 0 };
      }
      map[u.modelId].cost += u.costInUsd;
      map[u.modelId].tokens += u.totalTokens;
      map[u.modelId].count += 1;
    }
    return map;
  }

  // Availability metrics helper
  public getProviderStatusSummary(): Record<string, { success: number; errors: number; latencyAvg: number }> {
    const summary: Record<string, { success: number; errors: number; latencyAvg: number }> = {
      [AIProviderType.GEMINI]: { success: 98.4, errors: 1.6, latencyAvg: 230 },
      [AIProviderType.OPENAI]: { success: 97.2, errors: 2.8, latencyAvg: 340 },
      [AIProviderType.ANTHROPIC]: { success: 99.1, errors: 0.9, latencyAvg: 380 },
      [AIProviderType.OLLAMA]: { success: 95.0, errors: 5.0, latencyAvg: 120 }
    };
    return summary;
  }
}
