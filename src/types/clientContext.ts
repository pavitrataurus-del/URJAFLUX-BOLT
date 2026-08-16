/**
 * KIE Sprint-2 Module-2: Client Context Intelligence Engine (CCIE) Types
 * Represents the distilled, structured consultant-level understanding of the client.
 * Strictly adheres to Frozen KIE Architecture (No Vastu Analysis / No Remedies / Client Understanding Only).
 */

import { 
  ConsultationPurpose, 
  PropertyConstraint, 
  ClientPreference, 
  ReportLanguage, 
  ReportTypePreference,
  PropertyOwnership
} from "./clientDiscovery";

export type ConsultationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface ProblemClassification {
  primaryProblem: ConsultationPurpose | "Priority not explicitly specified";
  secondaryProblems: ConsultationPurpose[];
  totalProblemsCount: number;
}

export interface ClientConstraintsSummary {
  budgetLevel: string;
  ownershipStatus: PropertyOwnership;
  hasNoDemolitionRule: boolean;
  hasStructuralLimitations: boolean;
  hasSocietyOrRentalRestrictions: boolean;
  rawConstraints: PropertyConstraint[];
  formattedSummary: string;
}

export interface ClientPreferenceSummary {
  remedyStyle: string;
  preferredReportType: ReportTypePreference;
  preferredLanguage: ReportLanguage;
  rawPreferences: ClientPreference[];
  formattedSummary: string;
}

export interface FamilyContextSummary {
  totalMembers: number;
  breakdownText: string;
  hasSeniorCitizens: boolean;
  hasChildren: boolean;
  hasWorkingProfessionals: boolean;
  formattedSummary: string;
}

export interface ClientContextProfile {
  profileId: string;
  clientId: string;
  consultationId: string;
  generatedAtTimestamp: number;

  // 1. Primary Client Problem (Primary vs Secondary Classification)
  problemClassification: ProblemClassification;

  // 2. Primary Client Goal
  primaryGoalText: string;

  // 3. Consultation Priority
  consultationPriority: ConsultationPriority;
  priorityReasoning: string;

  // 4. Client Constraints Summary
  constraintsSummary: ClientConstraintsSummary;

  // 5. Client Preference Summary
  preferenceSummary: ClientPreferenceSummary;

  // 6. Family Context Summary
  familyContextSummary: FamilyContextSummary;

  // 7. Consultation Objective
  consultationObjective: string;
}
