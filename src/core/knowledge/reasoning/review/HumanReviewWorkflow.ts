import { IHumanReviewRecord, IRecommendation, RecommendationStatus } from "../models/ReasoningModels";
import { RecommendationRepositoryFactory } from "../repository/RecommendationRepositoryFactory";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { ReasoningEventType, createReasoningEvent } from "../events/ReasoningEvents";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class HumanReviewWorkflow {
  private static instance: HumanReviewWorkflow;

  private constructor() {}

  public static getInstance(): HumanReviewWorkflow {
    if (!HumanReviewWorkflow.instance) {
      HumanReviewWorkflow.instance = new HumanReviewWorkflow();
    }
    return HumanReviewWorkflow.instance;
  }

  public async submitForReview(recommendationId: string): Promise<IRecommendation> {
    const repo = RecommendationRepositoryFactory.getInstance().getRepository();
    const rec = await repo.getRecommendation(recommendationId);
    if (!rec) throw new EnterpriseError("Recommendation not found", { category: ErrorCategory.NOT_FOUND });
    
    rec.status = RecommendationStatus.PENDING_REVIEW;
    return repo.updateRecommendation(rec);
  }

  public async processReview(recommendationId: string, reviewer: string, isApproved: boolean, comments: string): Promise<IHumanReviewRecord> {
    const repo = RecommendationRepositoryFactory.getInstance().getRepository();
    const rec = await repo.getRecommendation(recommendationId);
    if (!rec) throw new EnterpriseError("Recommendation not found", { category: ErrorCategory.NOT_FOUND });

    rec.status = isApproved ? RecommendationStatus.APPROVED : RecommendationStatus.REJECTED;
    await repo.updateRecommendation(rec);

    const record: IHumanReviewRecord = {
      id: `review_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
      recommendationId,
      reviewer,
      status: rec.status,
      comments,
      timestamp: Date.now()
    };

    const eventType = isApproved ? ReasoningEventType.RECOMMENDATION_APPROVED : ReasoningEventType.RECOMMENDATION_REJECTED;
    EventBus.getInstance().publish(createReasoningEvent(eventType, { recommendationId, reviewId: record.id }));

    return record;
  }
}
