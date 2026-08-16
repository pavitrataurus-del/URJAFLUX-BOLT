import { IDecisionRepository } from "./IDecisionRepository";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class DecisionRepositoryFactory {
  private static instance: DecisionRepositoryFactory;
  private repository: IDecisionRepository | null = null;

  private constructor() {}

  public static getInstance(): DecisionRepositoryFactory {
    if (!DecisionRepositoryFactory.instance) {
      DecisionRepositoryFactory.instance = new DecisionRepositoryFactory();
    }
    return DecisionRepositoryFactory.instance;
  }

  public registerRepository(repository: IDecisionRepository): void {
    this.repository = repository;
  }

  public getRepository(): IDecisionRepository {
    if (!this.repository) {
      throw new EnterpriseError("Decision repository not configured", { category: ErrorCategory.VALIDATION });
    }
    return this.repository;
  }
  
  public clear(): void {
    this.repository = null;
  }
}
