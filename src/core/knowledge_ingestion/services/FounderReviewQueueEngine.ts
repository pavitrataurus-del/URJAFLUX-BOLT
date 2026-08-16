import { 
  IFounderReviewItem, 
  IStructuredKnowledgeItem, 
  FounderApprovalStatus,
  KnowledgeDomain,
  KnowledgeItemType 
} from "../types/knowledgePipeline.types";
import { KnowledgeVaultEngine } from "./KnowledgeVaultEngine";

const QUEUE_STORAGE_KEY = "urjaflux_founder_review_queue_v1";

export class FounderReviewQueueEngine {
  private static instance: FounderReviewQueueEngine;
  private queueItems: Map<string, IFounderReviewItem> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): FounderReviewQueueEngine {
    if (!FounderReviewQueueEngine.instance) {
      FounderReviewQueueEngine.instance = new FounderReviewQueueEngine();
    }
    return FounderReviewQueueEngine.instance;
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        const parsed: IFounderReviewItem[] = JSON.parse(raw);
        parsed.forEach(item => this.queueItems.set(item.reviewId, item));
      }
    } catch (err) {
      console.error("[FounderReviewQueueEngine] Failed loading review queue", err);
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(
        QUEUE_STORAGE_KEY,
        JSON.stringify(Array.from(this.queueItems.values()))
      );
    } catch (err) {
      console.error("[FounderReviewQueueEngine] Failed saving review queue", err);
    }
  }

  /**
   * Enqueue extracted knowledge items for mandatory Founder Review
   */
  public enqueueItems(
    sourceId: string, 
    items: IStructuredKnowledgeItem[]
  ): IFounderReviewItem[] {
    const reviewItems: IFounderReviewItem[] = [];

    items.forEach(item => {
      const reviewId = `REV-${item.id}`;
      const reviewItem: IFounderReviewItem = {
        reviewId,
        sourceId,
        knowledgeItem: item,
        founderStatus: "PENDING_FOUNDER_REVIEW",
        submittedAt: new Date().toISOString(),
        reviewer: "Pending Founder Action"
      };

      this.queueItems.set(reviewId, reviewItem);
      reviewItems.push(reviewItem);
    });

    this.saveToStorage();
    return reviewItems;
  }

  /**
   * Query Founder Review Queue with filters
   */
  public getReviewQueue(filters?: {
    status?: FounderApprovalStatus;
    domain?: KnowledgeDomain;
    itemType?: KnowledgeItemType;
    sourceId?: string;
    searchQuery?: string;
  }): IFounderReviewItem[] {
    let items = Array.from(this.queueItems.values());

    if (filters?.status) {
      items = items.filter(i => i.founderStatus === filters.status);
    }

    if (filters?.domain) {
      items = items.filter(i => i.knowledgeItem.domain === filters.domain);
    }

    if (filters?.itemType) {
      items = items.filter(i => i.knowledgeItem.itemType === filters.itemType);
    }

    if (filters?.sourceId) {
      items = items.filter(i => i.sourceId === filters.sourceId);
    }

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      items = items.filter(
        i =>
          i.knowledgeItem.title.toLowerCase().includes(q) ||
          i.knowledgeItem.content.toLowerCase().includes(q) ||
          i.knowledgeItem.citation.exactEvidenceQuote.toLowerCase().includes(q)
      );
    }

    // Sort newest submitted first
    return items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public getReviewItemById(reviewId: string): IFounderReviewItem | undefined {
    return this.queueItems.get(reviewId);
  }

  /**
   * Founder Action: APPROVE
   * Persists approved item to the Knowledge Vault
   */
  public approveItem(reviewId: string, reviewer: string, founderComments?: string): boolean {
    const item = this.queueItems.get(reviewId);
    if (!item) return false;

    item.founderStatus = "APPROVED";
    item.reviewedAt = new Date().toISOString();
    item.reviewer = reviewer || "Founder";
    if (founderComments) item.founderComments = founderComments;

    // Direct Sync to Knowledge Vault
    const vault = KnowledgeVaultEngine.getInstance();
    vault.storeRecord(item.knowledgeItem, item.reviewer);

    this.saveToStorage();
    return true;
  }

  /**
   * Founder Action: REJECT
   */
  public rejectItem(reviewId: string, reviewer: string, founderComments: string): boolean {
    const item = this.queueItems.get(reviewId);
    if (!item) return false;

    item.founderStatus = "REJECTED";
    item.reviewedAt = new Date().toISOString();
    item.reviewer = reviewer || "Founder";
    item.founderComments = founderComments;

    this.saveToStorage();
    return true;
  }

  /**
   * Founder Action: EDIT AND APPROVE
   * Allows Founder to refine title, content, conditions, or remedies before approving to Vault
   */
  public editAndApproveItem(
    reviewId: string, 
    edits: Partial<IStructuredKnowledgeItem>, 
    reviewer: string, 
    founderComments?: string
  ): boolean {
    const item = this.queueItems.get(reviewId);
    if (!item) return false;

    item.editedContent = edits;
    item.knowledgeItem = {
      ...item.knowledgeItem,
      ...edits
    };

    item.founderStatus = "APPROVED";
    item.reviewedAt = new Date().toISOString();
    item.reviewer = reviewer || "Founder";
    if (founderComments) item.founderComments = founderComments;

    // Sync edited approved item to Knowledge Vault
    const vault = KnowledgeVaultEngine.getInstance();
    vault.storeRecord(item.knowledgeItem, item.reviewer);

    this.saveToStorage();
    return true;
  }

  /**
   * Founder Action: REQUEST RECLEANING
   */
  public requestRecleaning(reviewId: string, reviewer: string, founderComments: string): boolean {
    const item = this.queueItems.get(reviewId);
    if (!item) return false;

    item.founderStatus = "REQUEST_RECLEANING";
    item.reviewedAt = new Date().toISOString();
    item.reviewer = reviewer || "Founder";
    item.founderComments = founderComments;

    this.saveToStorage();
    return true;
  }

  /**
   * Batch Approve All Pending Items for a given Source
   */
  public batchApproveSource(sourceId: string, reviewer: string): number {
    let approvedCount = 0;
    const items = this.getReviewQueue({ sourceId, status: "PENDING_FOUNDER_REVIEW" });

    items.forEach(item => {
      const success = this.approveItem(item.reviewId, reviewer, "Batch approved by Founder");
      if (success) approvedCount++;
    });

    return approvedCount;
  }

  public getQueueSummaryStats() {
    const all = Array.from(this.queueItems.values());
    return {
      total: all.length,
      pending: all.filter(i => i.founderStatus === "PENDING_FOUNDER_REVIEW").length,
      approved: all.filter(i => i.founderStatus === "APPROVED").length,
      rejected: all.filter(i => i.founderStatus === "REJECTED").length,
      recleaningRequested: all.filter(i => i.founderStatus === "REQUEST_RECLEANING").length
    };
  }
}

export const founderReviewQueueEngine = FounderReviewQueueEngine.getInstance();
