import { KnowledgeStatus } from "./VerificationTypes";

export interface TruthEvaluationInput {
  ruleId: string;
  confidenceScore: number;
  consensusState: "APPROVED_CANONICAL" | "REJECTED" | "PENDING_REVIEW" | "REVISION_REQUESTED";
  hasUnresolvedContradictions: boolean;
  isDeprecatedSource: boolean;
  isFutureResearch: boolean;
  isArchived: boolean;
}

export class TruthEngine {
  private statusMap: Map<string, KnowledgeStatus> = new Map();

  constructor() {
    this.seedDefaultStatuses();
  }

  private seedDefaultStatuses(): void {
    this.statusMap.set("rule-kitchen-se", "CANONICAL");
    this.statusMap.set("rule-sw-master-bedroom", "CANONICAL");
    this.statusMap.set("rule-manipura-fire-se", "CANONICAL");
    this.statusMap.set("rule-staircase-nw-vs-sw", "DISPUTED");
    this.statusMap.set("rule-pyramid-energy-amplification", "DRAFT");
  }

  public evaluateTruthStatus(input: TruthEvaluationInput): KnowledgeStatus {
    if (input.isArchived) {
      this.statusMap.set(input.ruleId, "ARCHIVED");
      return "ARCHIVED";
    }

    if (input.isDeprecatedSource) {
      this.statusMap.set(input.ruleId, "DEPRECATED");
      return "DEPRECATED";
    }

    if (input.isFutureResearch) {
      this.statusMap.set(input.ruleId, "FUTURE");
      return "FUTURE";
    }

    if (input.hasUnresolvedContradictions || input.consensusState === "REVISION_REQUESTED") {
      this.statusMap.set(input.ruleId, "DISPUTED");
      return "DISPUTED";
    }

    if (input.consensusState === "APPROVED_CANONICAL" && input.confidenceScore >= 85) {
      this.statusMap.set(input.ruleId, "CANONICAL");
      return "CANONICAL";
    }

    this.statusMap.set(input.ruleId, "DRAFT");
    return "DRAFT";
  }

  public getStatus(ruleId: string): KnowledgeStatus {
    return this.statusMap.get(ruleId) || "DRAFT";
  }

  public registerKnowledgeState(ruleId: string, status: KnowledgeStatus): void {
    this.statusMap.set(ruleId, status);
  }

  public promoteToCanonical(ruleId: string, reviewer?: string): KnowledgeStatus {
    this.statusMap.set(ruleId, "CANONICAL");
    return "CANONICAL";
  }
}

export const truthEngine = new TruthEngine();
