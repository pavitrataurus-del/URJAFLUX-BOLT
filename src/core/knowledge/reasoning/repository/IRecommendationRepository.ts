import { IRecommendation } from "../models/ReasoningModels";

export interface IRecommendationRepository {
  createRecommendation(recommendation: IRecommendation): Promise<IRecommendation>;
  updateRecommendation(recommendation: IRecommendation): Promise<IRecommendation>;
  deleteRecommendation(id: string): Promise<void>;
  getRecommendation(id: string): Promise<IRecommendation | null>;
  listRecommendations(twinId: string): Promise<IRecommendation[]>;
}
