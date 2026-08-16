/**
 * KIE Sprint-2 Module-2: Client Context Intelligence Engine (CCIE)
 * Converts official Discovery Summary into a structured Consultant Context Profile.
 * 
 * STRICT ARCHITECTURE RULES:
 * - Accepts ONLY official DiscoverySummary as input (never raw form inputs).
 * - Must NOT perform Vastu analysis.
 * - Must NOT predict problems or evaluate property defects.
 * - Must NOT generate remedies.
 * - Must ONLY perform consultant-level client understanding.
 */

import { DiscoverySummary, ConsultationPurpose } from "../types/clientDiscovery";
import { 
  ClientContextProfile, 
  ConsultationPriority, 
  ProblemClassification, 
  ClientConstraintsSummary, 
  ClientPreferenceSummary, 
  FamilyContextSummary 
} from "../types/clientContext";

export class ClientContextIntelligenceEngineManager {

  /**
   * Main Engine Entry Point: Transforms Discovery Summary into Client Context Profile
   */
  public generateClientContextProfile(summary: DiscoverySummary): ClientContextProfile {
    if (!summary || !summary.clientId) {
      throw new Error("[CCIE Error] Invalid or missing Discovery Summary provided to Client Context Intelligence Engine.");
    }

    const problemClassification = this.classifyProblems(summary);
    const primaryGoalText = this.extractPrimaryGoal(summary.primaryGoals, problemClassification.primaryProblem);
    const { consultationPriority, priorityReasoning } = this.determineConsultationPriority(problemClassification, summary);
    const constraintsSummary = this.summarizeConstraints(summary);
    const preferenceSummary = this.summarizePreferences(summary);
    const familyContextSummary = this.summarizeFamilyContext(summary);
    const consultationObjective = this.generateConsultationObjective(
      summary.clientName,
      problemClassification.primaryProblem,
      primaryGoalText,
      constraintsSummary,
      preferenceSummary
    );

    const profile: ClientContextProfile = {
      profileId: `CCIE-PRF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      clientId: summary.clientId,
      consultationId: summary.consultationId,
      generatedAtTimestamp: Date.now(),
      problemClassification,
      primaryGoalText,
      consultationPriority,
      priorityReasoning,
      constraintsSummary,
      preferenceSummary,
      familyContextSummary,
      consultationObjective
    };

    return profile;
  }

  /**
   * 1. Classifies primary vs secondary client problems
   * Strictly adheres to Founder Boundaries:
   * - No predefined static category weights.
   * - Primary problem selected from client's explicitly stated priority / goal / notes / context.
   * - If available discovery summary does not provide enough evidence to select one primary problem,
   *   marks it clearly as "Priority not explicitly specified" instead of guessing.
   */
  private classifyProblems(summary: DiscoverySummary): ProblemClassification {
    const problems = summary.primaryProblems || [];
    if (problems.length === 0) {
      return {
        primaryProblem: "Priority not explicitly specified",
        secondaryProblems: [],
        totalProblemsCount: 0
      };
    }

    if (problems.length === 1) {
      return {
        primaryProblem: problems[0],
        secondaryProblems: [],
        totalProblemsCount: 1
      };
    }

    // Multiple problems selected. Check if client's stated goal or notes explicitly identifies a primary focus.
    const textContext = `${summary.primaryGoals || ""} ${summary.additionalNotes || ""}`.toLowerCase();

    // Check for explicit statements of primary focus in client's goal or notes text
    const explicitlyStated = problems.filter(p => {
      const pLower = (p || "").toLowerCase();
      if (!pLower) return false;
      return textContext.includes(`primary: ${pLower}`) ||
             textContext.includes(`main: ${pLower}`) ||
             textContext.includes(`top priority: ${pLower}`) ||
             textContext.includes(`urgent: ${pLower}`) ||
             textContext.includes(`focus on ${pLower}`) ||
             textContext.includes(`priority is ${pLower}`);
    });

    if (explicitlyStated.length === 1) {
      const primaryProblem = explicitlyStated[0];
      const secondaryProblems = problems.filter(p => p !== primaryProblem);
      return {
        primaryProblem,
        secondaryProblems,
        totalProblemsCount: problems.length
      };
    }

    // If no single explicit primary problem can be confidently determined from client context,
    // refuse to guess using category severity! Mark as "Priority not explicitly specified".
    return {
      primaryProblem: "Priority not explicitly specified",
      secondaryProblems: problems,
      totalProblemsCount: problems.length
    };
  }

  /**
   * 2. Extracts & cleans primary client goal without predictive claims
   */
  private extractPrimaryGoal(rawGoalText: string, primaryProblem: ConsultationPurpose | "Priority not explicitly specified"): string {
    const trimmed = rawGoalText ? rawGoalText.trim() : "";
    if (trimmed.length > 0) {
      return trimmed;
    }
    if (primaryProblem !== "Priority not explicitly specified") {
      return `Address client-reported ${primaryProblem} concerns as specified in discovery.`;
    }
    return "Address client-reported concerns as specified in discovery summary.";
  }

  /**
   * 3. Determines Consultation Priority (HIGH, MEDIUM, LOW)
   * Strictly adheres to Founder Boundaries:
   * - Priority represents "How important this issue is to THIS CLIENT".
   * - NEVER represents Vastu severity, medical severity, financial severity, legal severity,
   *   or predefined category ranking.
   */
  private determineConsultationPriority(
    classification: ProblemClassification,
    summary: DiscoverySummary
  ): { consultationPriority: ConsultationPriority; priorityReasoning: string } {
    const contextText = `${summary.primaryGoals || ""} ${summary.additionalNotes || ""}`.toLowerCase();

    // High client urgency markers in client context
    const hasHighUrgencyMarker = 
      contextText.includes("urgent") ||
      contextText.includes("critical") ||
      contextText.includes("high priority") ||
      contextText.includes("immediate") ||
      contextText.includes("asap") ||
      contextText.includes("emergency") ||
      contextText.includes("severe") ||
      contextText.includes("distressed");

    // Low client urgency / routine markers in client context
    const hasLowUrgencyMarker = 
      contextText.includes("routine") ||
      contextText.includes("preventive") ||
      contextText.includes("general check") ||
      contextText.includes("low priority") ||
      contextText.includes("curiosity") ||
      contextText.includes("future planning");

    if (hasHighUrgencyMarker) {
      return {
        consultationPriority: "HIGH",
        priorityReasoning: "High consultation priority assigned based on explicit client urgency markers communicated in discovery context."
      };
    }

    if (hasLowUrgencyMarker) {
      return {
        consultationPriority: "LOW",
        priorityReasoning: "Low consultation priority assigned based on routine or general inquiry markers communicated in discovery context."
      };
    }

    return {
      consultationPriority: "MEDIUM",
      priorityReasoning: "Standard consultation priority reflecting client-stated focus without explicit urgency escalation."
    };
  }

  /**
   * 4. Summarizes client constraints
   */
  private summarizeConstraints(summary: DiscoverySummary): ClientConstraintsSummary {
    const constraints = summary.propertyConstraints || [];
    const ownership = summary.ownership;

    const hasNoDemolitionRule = constraints.includes("No Demolition");
    const hasStructuralLimitations = constraints.includes("Society Restrictions") || ownership === "Rented";
    const hasSocietyOrRentalRestrictions = constraints.includes("Society Restrictions") || constraints.includes("Rental Restrictions") || ownership === "Rented";

    let budgetLevel = "Standard Budget";
    if (constraints.includes("Low Budget")) budgetLevel = "Strict Low Budget";
    else if (constraints.includes("Moderate Budget")) budgetLevel = "Moderate Budget";
    else if (constraints.includes("Premium Budget")) budgetLevel = "Flexible High Budget";

    const parts: string[] = [];
    parts.push(`Ownership: ${ownership}`);
    parts.push(`Budget: ${budgetLevel}`);
    if (hasNoDemolitionRule) parts.push("Strict No Demolition Rule");
    if (hasSocietyOrRentalRestrictions) parts.push("Rental/Society Restrictions Apply");

    return {
      budgetLevel,
      ownershipStatus: ownership,
      hasNoDemolitionRule,
      hasStructuralLimitations,
      hasSocietyOrRentalRestrictions,
      rawConstraints: constraints,
      formattedSummary: parts.join(" • ")
    };
  }

  /**
   * 5. Summarizes client preferences & deliverable preferences
   * Records client remedy style preferences only — does NOT select, recommend, evaluate, or generate remedies.
   */
  private summarizePreferences(summary: DiscoverySummary): ClientPreferenceSummary {
    const preferences = summary.clientPreferences || [];
    
    let remedyStyle = "Practical Remedies Preferred";
    if (preferences.includes("Non-Invasive Remedies Only")) {
      remedyStyle = "Non-Invasive Element & Color Remedies Only";
    } else if (preferences.includes("Traditional Remedies Accepted")) {
      remedyStyle = "Traditional Vedic Pyramids & Yantras Accepted";
    }

    const parts: string[] = [];
    parts.push(`Remedy Preference: ${remedyStyle}`);
    parts.push(`Language: ${summary.preferredLanguage}`);
    parts.push(`Deliverable: ${summary.preferredReportType}`);

    return {
      remedyStyle,
      preferredReportType: summary.preferredReportType,
      preferredLanguage: summary.preferredLanguage,
      rawPreferences: preferences,
      formattedSummary: parts.join(" • ")
    };
  }

  /**
   * 6. Summarizes family context
   */
  private summarizeFamilyContext(summary: DiscoverySummary): FamilyContextSummary {
    const family = summary.familySummary;
    const text = family.breakdownText || "";

    const hasSeniorCitizens = text.includes("Senior");
    const hasChildren = text.includes("Children") || text.includes("Child");
    const hasWorkingProfessionals = text.includes("Professionals") || text.includes("Professional");

    const parts: string[] = [];
    parts.push(`${family.totalMembers} Total Occupants (${text})`);
    parts.push(`Property Category: ${summary.propertyCategory}`);

    return {
      totalMembers: family.totalMembers,
      breakdownText: text,
      hasSeniorCitizens,
      hasChildren,
      hasWorkingProfessionals,
      formattedSummary: parts.join(" • ")
    };
  }

  /**
   * 7. Generates single-sentence consultation objective without predictive claims
   */
  private generateConsultationObjective(
    clientName: string,
    primaryProblem: ConsultationPurpose | "Priority not explicitly specified",
    primaryGoal: string,
    constraints: ClientConstraintsSummary,
    preferences: ClientPreferenceSummary
  ): string {
    const restrictionClause = constraints.hasNoDemolitionRule 
      ? "under strict no-demolition constraint" 
      : constraints.hasSocietyOrRentalRestrictions 
        ? "respecting property restrictions" 
        : "within stated property parameters";

    const problemDesc = !primaryProblem || primaryProblem === "Priority not explicitly specified"
      ? "client concerns"
      : `${primaryProblem.toLowerCase()} concerns`;

    return `Consultation objective for ${clientName || "the client"}: Address ${problemDesc} and support "${primaryGoal}" ${restrictionClause}, aligned with client preferences (${preferences.formattedSummary}).`;
  }
}

class ClientDiscoveryServiceManagerAdapter {
  private engine = new ClientContextIntelligenceEngineManager();

  public processFromSummary(summary: DiscoverySummary): ClientContextProfile {
    return this.engine.generateClientContextProfile(summary);
  }
}

export const clientContextIntelligenceEngine = new ClientDiscoveryServiceManagerAdapter();
