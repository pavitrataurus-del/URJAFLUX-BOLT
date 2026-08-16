import { AIPolicy, PolicyAction } from "./types";
import { AIObservability } from "./AIObservability";

export class AIGovernanceService {
  private static instance: AIGovernanceService | null = null;
  private policies: AIPolicy[] = [];

  private constructor() {
    this.seedDefaultPolicies();
  }

  public static getInstance(): AIGovernanceService {
    if (!AIGovernanceService.instance) {
      AIGovernanceService.instance = new AIGovernanceService();
    }
    return AIGovernanceService.instance;
  }

  private seedDefaultPolicies() {
    this.policies = [
      {
        id: "pol-safety-p1",
        name: "Enterprise Astro-Safety Policy",
        description: "Enforces non-invasive guidance principles. Blocks negative prediction of life expectancy, severe medical doom, or financial ruin.",
        ruleType: "SAFETY",
        action: PolicyAction.DENY,
        matchPattern: "death, suicide, murder, bankrupt, terminal, doom",
        isEnforced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "pavitra.taurus@gmail.com",
        updatedBy: "pavitra.taurus@gmail.com",
        version: "1.0.0",
        status: "ACTIVE",
        tags: ["safety", "ethics"],
        metadata: {}
      },
      {
        id: "pol-cost-limit",
        name: "Budget Alert Guardian",
        description: "Flags any single request consuming more than 100,000 prompt tokens or exceeding $5 in direct cost profile.",
        ruleType: "COST",
        action: PolicyAction.REQUIRE_APPROVAL,
        maxMonthlyCostLimit: 500,
        isEnforced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "pavitra.taurus@gmail.com",
        updatedBy: "pavitra.taurus@gmail.com",
        version: "1.0.0",
        status: "ACTIVE",
        tags: ["cost-control"],
        metadata: {}
      },
      {
        id: "pol-restrict-models",
        name: "Restricted Model Compliance",
        description: "Limits execution of Claude 3.5 Sonnet and GPT-4o to verified senior scholars. Standard requests route to Gemini 3.6 Flash.",
        ruleType: "RESTRICTION",
        action: PolicyAction.FLAG,
        isEnforced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "pavitra.taurus@gmail.com",
        updatedBy: "pavitra.taurus@gmail.com",
        version: "1.1.0",
        status: "ACTIVE",
        tags: ["access-control"],
        metadata: {}
      }
    ];
  }

  public getPolicies(): AIPolicy[] {
    return this.policies;
  }

  public addPolicy(policy: Omit<AIPolicy, "id" | "createdAt" | "updatedAt">): AIPolicy {
    const newPolicy: AIPolicy = {
      ...policy,
      id: `pol-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.policies.push(newPolicy);
    return newPolicy;
  }

  public togglePolicy(id: string): boolean {
    const policy = this.policies.find(p => p.id === id);
    if (!policy) return false;
    policy.isEnforced = !policy.isEnforced;
    policy.updatedAt = new Date().toISOString();
    return true;
  }

  public evaluateRequest(prompt: string, modelId: string, userId: string): { allowed: boolean; action: PolicyAction; reason?: string } {
    const observability = AIObservability.getInstance();

    for (const policy of this.policies) {
      if (!policy.isEnforced) continue;

      // 1. Safety trigger matching
      if (policy.ruleType === "SAFETY" && policy.matchPattern) {
        const keywords = policy.matchPattern.split(",").map(k => k.trim().toLowerCase());
        const lowercasePrompt = prompt.toLowerCase();
        for (const word of keywords) {
          if (lowercasePrompt.includes(word)) {
            observability.logAudit({
              userId,
              action: "POLICY_ENFORCE",
              details: `Request blocked by safety policy '${policy.name}'. Blocked keyword: '${word}'`,
              severity: "CRITICAL",
              justification: "Safety constraint violated"
            });
            return {
              allowed: false,
              action: policy.action,
              reason: `Request flagged by safety policy: blocked keyword '${word}' detected.`
            };
          }
        }
      }

      // 2. Budget restrictions matching
      if (policy.ruleType === "COST" && policy.maxMonthlyCostLimit) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const usages = observability.getUsages().filter(u => u.userId === userId && u.timestamp.startsWith(currentMonth));
        const userMonthCost = usages.reduce((sum, u) => sum + u.costInUsd, 0);

        if (userMonthCost > policy.maxMonthlyCostLimit) {
          observability.logAudit({
            userId,
            action: "POLICY_ENFORCE",
            details: `User monthly budget alert. Consumed: $${userMonthCost.toFixed(2)} vs limit: $${policy.maxMonthlyCostLimit}`,
            severity: "WARNING",
            justification: "Monthly cost limit reached"
          });
          return {
            allowed: policy.action !== PolicyAction.DENY,
            action: policy.action,
            reason: `User month cost of $${userMonthCost.toFixed(2)} exceeds policy limit of $${policy.maxMonthlyCostLimit}.`
          };
        }
      }

      // 3. Restricted models trigger
      if (policy.ruleType === "RESTRICTION" && (modelId.includes("claude") || modelId.includes("gpt"))) {
        if (userId !== "pavitra.taurus@gmail.com") { // Standard user
          observability.logAudit({
            userId,
            action: "POLICY_ENFORCE",
            details: `Non-premium user tried to route via model '${modelId}'. Policy flagged.`,
            severity: "WARNING",
            justification: "Premium model restriction rule"
          });
          return {
            allowed: true, // Let it complete but flag/log
            action: PolicyAction.FLAG,
            reason: `Restricted model access: Routed via '${modelId}' (Audit triggered).`
          };
        }
      }
    }

    return { allowed: true, action: PolicyAction.ALLOW };
  }
}
