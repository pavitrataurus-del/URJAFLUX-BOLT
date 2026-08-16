import { 
  IReasoningContext, 
  IRecommendation, 
  IConflictRecord, 
  IHumanReviewRecord,
  IExpertExecutionResult
} from "../models/ReasoningModels";
import { AIReasoningEngine } from "../engine/AIReasoningEngine";
import { ExpertExecutionEngine } from "../expert/ExpertExecutionEngine";
import { RecommendationEngine } from "../recommendation/RecommendationEngine";
import { ConflictResolutionEngine } from "../conflict/ConflictResolutionEngine";
import { HumanReviewWorkflow } from "../review/HumanReviewWorkflow";
import { ReasoningValidator } from "../validation/ReasoningValidator";
import { RecommendationRepositoryFactory } from "../repository/RecommendationRepositoryFactory";

export class ReasoningApi {
  private static instance: ReasoningApi;

  private constructor() {}

  public static getInstance(): ReasoningApi {
    if (!ReasoningApi.instance) {
      ReasoningApi.instance = new ReasoningApi();
    }
    return ReasoningApi.instance;
  }

  public async runAnalysis(context: IReasoningContext): Promise<IExpertExecutionResult[]> {
    return AIReasoningEngine.getInstance().runAnalysis(context);
  }

  public async executeExperts(context: IReasoningContext): Promise<IExpertExecutionResult[]> {
    return ExpertExecutionEngine.getInstance().executeExperts(context);
  }

  public async getRecommendations(twinId: string): Promise<IRecommendation[]> {
    const repo = RecommendationRepositoryFactory.getInstance().getRepository();
    return repo.listRecommendations(twinId);
  }

  public detectConflicts(recommendations: IRecommendation[]): IConflictRecord[] {
    return ConflictResolutionEngine.getInstance().detectConflicts(recommendations);
  }

  public async resolveConflict(conflictId: string, resolutionStrategy: string, winningRecId?: string): Promise<IConflictRecord | null> {
    return ConflictResolutionEngine.getInstance().resolveConflict(conflictId, resolutionStrategy, winningRecId);
  }

  public async submitForReview(recommendationId: string): Promise<IRecommendation> {
    return HumanReviewWorkflow.getInstance().submitForReview(recommendationId);
  }

  public async processReview(recommendationId: string, reviewer: string, isApproved: boolean, comments: string): Promise<IHumanReviewRecord> {
    return HumanReviewWorkflow.getInstance().processReview(recommendationId, reviewer, isApproved, comments);
  }

  public validateRecommendation(recommendation: IRecommendation): boolean {
    return ReasoningValidator.getInstance().validateRecommendation(recommendation);
  }
}
