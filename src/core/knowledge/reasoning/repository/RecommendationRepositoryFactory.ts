import { IRecommendationRepository } from "./IRecommendationRepository";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class RecommendationRepositoryFactory {
  private static instance: RecommendationRepositoryFactory;
  private repository: IRecommendationRepository | null = null;

  private constructor() {}

  public static getInstance(): RecommendationRepositoryFactory {
    if (!RecommendationRepositoryFactory.instance) {
      RecommendationRepositoryFactory.instance = new RecommendationRepositoryFactory();
    }
    return RecommendationRepositoryFactory.instance;
  }

  public registerRepository(repository: IRecommendationRepository): void {
    this.repository = repository;
  }

  public getRepository(): IRecommendationRepository {
    if (!this.repository) {
      throw new EnterpriseError("Recommendation repository not configured", { category: ErrorCategory.VALIDATION });
    }
    return this.repository;
  }
  
  public clear(): void {
    this.repository = null;
  }
}
