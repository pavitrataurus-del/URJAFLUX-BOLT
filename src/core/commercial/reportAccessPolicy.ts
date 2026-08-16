/**
 * URJAFLUX Commercial Report Access Policy (Founder Lock #6 + integrated report spec).
 * Extension layer — does not modify frozen IIE/RPE engines.
 */

export type ReportAccessTier = "FREE" | "PAID_ONE_TIME" | "CONSULTANT" | "FOUNDER";

export const FREE_TIER_LIMITS = {
  maxDoshasShown: 2,
  maxRemediesShown: 1,
  maxChatQuestions: 3,
  showIntegratedScore: true,
  allowedDomains: ["VASTU"] as const,
  lockedModules: ["LAL_KITAB", "NUMEROLOGY"] as const,
};

export const PAID_TIER_MODULES = ["VASTU", "LAL_KITAB", "NUMEROLOGY"] as const;

export interface ReportAccessMetadata {
  tier: ReportAccessTier;
  doshasShown: number;
  doshasTotal: number;
  remediesShown: number;
  remediesTotal: number;
  lockedModules: string[];
  upsellMessage: string;
}

export function resolveReportTypeForTier(tier: ReportAccessTier): string {
  if (tier === "FREE") return "VISITOR_REPORT";
  if (tier === "PAID_ONE_TIME") return "COMPREHENSIVE_INTEGRATED";
  return "COMPREHENSIVE_INTEGRATED";
}

export function buildUpsellMessage(tier: ReportAccessTier): string {
  if (tier !== "FREE") return "";
  return "Unlock full Lal Kitab, Numerology, all doshas & remedies — book Founder Consultation or Premium Membership.";
}

export function canAccessModule(tier: ReportAccessTier, module: string): boolean {
  if (tier === "FREE") {
    return module.toUpperCase() === "VASTU";
  }
  return true;
}

export function isWhiteLabelEnabled(tier: ReportAccessTier): boolean {
  return tier === "CONSULTANT" || tier === "FOUNDER" || tier === "PAID_ONE_TIME";
}
