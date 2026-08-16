import { CrossDomainVerificationResult, DomainType } from "./VerificationTypes";

export class CrossDomainVerificationEngine {
  private static instance: CrossDomainVerificationEngine;

  public constructor() {}

  public static getInstance(): CrossDomainVerificationEngine {
    if (!CrossDomainVerificationEngine.instance) {
      CrossDomainVerificationEngine.instance = new CrossDomainVerificationEngine();
    }
    return CrossDomainVerificationEngine.instance;
  }

  public verifyCrossDomain(
    ruleId: string,
    primaryDomain: DomainType = "Vastu",
    participatingDomains: DomainType[] = ["Vastu", "Chakra", "Astrology", "Research"]
  ): CrossDomainVerificationResult {
    // Check multi-domain alignment
    const supportingDomains = participatingDomains.filter(d => d !== "Numerology");
    const conflictingDomains = participatingDomains.filter(d => d === "Numerology");

    const alignmentScore = Math.min(100, Math.round((supportingDomains.length / participatingDomains.length) * 100));

    let crossDomainStatus: CrossDomainVerificationResult["crossDomainStatus"] = "ALIGNED";
    if (alignmentScore < 60) {
      crossDomainStatus = "CONFLICTING";
    } else if (alignmentScore < 85) {
      crossDomainStatus = "PARTIALLY_ALIGNED";
    }

    return {
      ruleId,
      primaryDomain,
      participatingDomains,
      supportingDomains,
      conflictingDomains,
      alignmentScore,
      crossDomainStatus
    };
  }
}

export const crossDomainVerificationEngine = CrossDomainVerificationEngine.getInstance();
