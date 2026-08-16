import { IRecommendation, RecommendationStatus } from "../models/ReasoningModels";
import { RecommendationRepositoryFactory } from "../repository/RecommendationRepositoryFactory";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { ReasoningEventType, createReasoningEvent } from "../events/ReasoningEvents";

export class RecommendationEngine {
  private static instance: RecommendationEngine;

  private constructor() {}

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  public async generateRecommendation(data: Omit<IRecommendation, "id" | "status" | "version">): Promise<IRecommendation> {
    const recommendation: IRecommendation = {
      ...data,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
      status: RecommendationStatus.DRAFT,
      version: "1.0"
    };

    const repo = RecommendationRepositoryFactory.getInstance().getRepository();
    const created = await repo.createRecommendation(recommendation);
    
    EventBus.getInstance().publish(createReasoningEvent(ReasoningEventType.RECOMMENDATION_CREATED, { recommendationId: created.id }));
    return created;
  }
}
