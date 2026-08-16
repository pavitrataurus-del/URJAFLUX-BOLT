import { IRecommendation } from "../models/ReasoningModels";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class ReasoningValidator {
  private static instance: ReasoningValidator;

  private constructor() {}

  public static getInstance(): ReasoningValidator {
    if (!ReasoningValidator.instance) {
      ReasoningValidator.instance = new ReasoningValidator();
    }
    return ReasoningValidator.instance;
  }

  public validateRecommendation(recommendation: IRecommendation): boolean {
    if (!recommendation.id) {
      throw new EnterpriseError("Recommendation ID is missing", { category: ErrorCategory.VALIDATION });
    }

    if (!recommendation.evidenceReferences || recommendation.evidenceReferences.length === 0) {
      throw new EnterpriseError("Recommendation missing evidence", { category: ErrorCategory.VALIDATION });
    }

    if (!recommendation.decisionTraceId) {
      throw new EnterpriseError("Recommendation missing decision trace", { category: ErrorCategory.VALIDATION });
    }

    if (!recommendation.confidence || recommendation.confidence.compositeConfidence === undefined) {
      throw new EnterpriseError("Recommendation missing confidence", { category: ErrorCategory.VALIDATION });
    }

    if (recommendation.expertsResponsible.length === 0) {
      throw new EnterpriseError("Recommendation missing responsible experts", { category: ErrorCategory.VALIDATION });
    }

    return true;
  }
}
