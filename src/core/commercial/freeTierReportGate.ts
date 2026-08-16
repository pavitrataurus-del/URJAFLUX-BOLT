import type { IIntegratedConsultationPackage, IIntegratedFinding } from "../integrated_intelligence/types/iie.types";
import {
  buildUpsellMessage,
  FREE_TIER_LIMITS,
  type ReportAccessMetadata,
  type ReportAccessTier,
} from "./reportAccessPolicy";

const SEVERITY_RANK: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  MINOR: 1,
};

function sortBySeverity(findings: IIntegratedFinding[]): IIntegratedFinding[] {
  return [...findings].sort(
    (a, b) => (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0)
  );
}

/** Apply free/paid content gates without mutating source package semantics upstream. */
export function applyReportAccessGate(
  consultation: IIntegratedConsultationPackage,
  tier: ReportAccessTier
): { consultation: IIntegratedConsultationPackage; metadata: ReportAccessMetadata } {
  const totalDoshas = consultation.integratedFindings.filter(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
  ).length;
  const totalRemedies = consultation.bestRemedyCandidates.length;

  if (tier !== "FREE") {
    return {
      consultation,
      metadata: {
        tier,
        doshasShown: totalDoshas,
        doshasTotal: totalDoshas,
        remediesShown: totalRemedies,
        remediesTotal: totalRemedies,
        lockedModules: [],
        upsellMessage: "",
      },
    };
  }

  const vastuFindings = consultation.integratedFindings.filter(
    (f) => f.domain.toUpperCase() === "VASTU"
  );
  const gatedDoshas = sortBySeverity(vastuFindings).slice(0, FREE_TIER_LIMITS.maxDoshasShown);
  const gatedRemedies = consultation.bestRemedyCandidates
    .filter((r) => r.targetDomain.toUpperCase() === "VASTU")
    .slice(0, FREE_TIER_LIMITS.maxRemediesShown);

  return {
    consultation: {
      ...consultation,
      integratedFindings: gatedDoshas,
      bestRemedyCandidates: gatedRemedies,
      crossDomainSummary: {
        ...consultation.crossDomainSummary,
        involvedDomains: ["VASTU"],
      },
    },
    metadata: {
      tier,
      doshasShown: gatedDoshas.length,
      doshasTotal: totalDoshas,
      remediesShown: gatedRemedies.length,
      remediesTotal: totalRemedies,
      lockedModules: [...FREE_TIER_LIMITS.lockedModules],
      upsellMessage: buildUpsellMessage(tier),
    },
  };
}
