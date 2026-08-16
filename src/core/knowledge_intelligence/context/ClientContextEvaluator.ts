// ============================================================================
// URJAFLUX AI OS - CLIENT CONTEXT EVALUATOR (KIE)
// Parses Client Goals, Problems, Property Type & Restrictions for Knowledge Mapping
// ============================================================================

import { IClientContextProfile } from "../types/kie.types";

export interface IClientContextEvaluationResult {
  normalizedPropertyType: string;
  normalizedOwnership: string;
  normalizedBudget: string;
  extractedKeywords: string[];
  hasRentalRestrictions: boolean;
  hasBudgetRestrictions: boolean;
  activeGoalCategories: string[];
}

export class ClientContextEvaluator {

  public evaluateClientContext(profile: IClientContextProfile): IClientContextEvaluationResult {
    const propertyType = (profile.propertyType || "RESIDENTIAL").toUpperCase();
    const ownership = (profile.ownership || "OWNED").toUpperCase();
    const budget = (profile.budgetLevel || "FLEXIBLE").toUpperCase();

    const keywords = new Set<string>();

    (profile.clientGoals || []).forEach(goal => {
      goal.toLowerCase().split(/\s+/).forEach(w => w.length > 2 && keywords.add(w));
    });

    (profile.clientProblems || []).forEach(prob => {
      prob.toLowerCase().split(/\s+/).forEach(w => w.length > 2 && keywords.add(w));
    });

    (profile.restrictions || []).forEach(restr => {
      restr.toLowerCase().split(/\s+/).forEach(w => w.length > 2 && keywords.add(w));
    });

    const hasRentalRestrictions = ownership === "RENTED" || ownership === "LEASED" || (profile.restrictions || []).some(r => r.toLowerCase().includes("no demolition") || r.toLowerCase().includes("rental"));
    const hasBudgetRestrictions = budget === "LOW";

    const activeGoalCategories: string[] = [];
    const joined = Array.from(keywords).join(" ");

    if (joined.includes("wealth") || joined.includes("money") || joined.includes("finance") || joined.includes("business")) {
      activeGoalCategories.push("FINANCIAL_PROSPERITY");
    }
    if (joined.includes("health") || joined.includes("sleep") || joined.includes("disease") || joined.includes("vitality")) {
      activeGoalCategories.push("HEALTH_VITALITY");
    }
    if (joined.includes("family") || joined.includes("marriage") || joined.includes("relationship") || joined.includes("harmony")) {
      activeGoalCategories.push("RELATIONSHIP_HARMONY");
    }
    if (joined.includes("career") || joined.includes("job") || joined.includes("education") || joined.includes("study")) {
      activeGoalCategories.push("CAREER_GROWTH");
    }

    return {
      normalizedPropertyType: propertyType,
      normalizedOwnership: ownership,
      normalizedBudget: budget,
      extractedKeywords: Array.from(keywords),
      hasRentalRestrictions,
      hasBudgetRestrictions,
      activeGoalCategories
    };
  }
}
