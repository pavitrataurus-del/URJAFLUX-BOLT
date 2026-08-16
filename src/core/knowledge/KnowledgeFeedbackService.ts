// Module 8: Knowledge Feedback & Reinforcement (RLHF) Loop
import { CitationFeedback } from "../../types/knowledgeIntelligence";

class KnowledgeFeedbackServiceStore {
  private feedbackItems: CitationFeedback[] = [];

  constructor() {
    this.seedInitialFeedback();
  }

  private seedInitialFeedback(): void {
    this.feedbackItems.push({
      id: "FB-1001",
      tenantId: "tenant_org_01",
      query: "Where should Chief Executive office be located?",
      responseId: "RESP-901",
      citationId: "CIT-1",
      userId: "USR-CONSULTANT-01",
      rating: "POSITIVE",
      feedbackType: "PERFECT_MATCH",
      status: "APPROVED",
      createdAt: new Date().toISOString()
    });
  }

  public submitFeedback(
    tenantId: string,
    query: string,
    responseId: string,
    citationId: string,
    userId: string,
    rating: "POSITIVE" | "NEGATIVE",
    feedbackType: CitationFeedback["feedbackType"],
    userCorrectionText?: string
  ): CitationFeedback {
    const feedback: CitationFeedback = {
      id: `FB-${Date.now().toString(36).toUpperCase()}`,
      tenantId,
      query,
      responseId,
      citationId,
      userId,
      rating,
      feedbackType,
      userCorrectionText,
      status: "PENDING_REVIEW",
      createdAt: new Date().toISOString()
    };

    this.feedbackItems.unshift(feedback);
    return feedback;
  }

  public getFeedbackQueue(tenantId: string): CitationFeedback[] {
    return this.feedbackItems.filter(
      fb => fb.tenantId === tenantId || fb.tenantId === "global_tenant"
    );
  }

  public reviewFeedback(
    feedbackId: string,
    newStatus: "APPROVED" | "REJECTED"
  ): boolean {
    const item = this.feedbackItems.find(f => f.id === feedbackId);
    if (!item) return false;
    item.status = newStatus;
    return true;
  }
}

export const KnowledgeFeedbackService = new KnowledgeFeedbackServiceStore();
