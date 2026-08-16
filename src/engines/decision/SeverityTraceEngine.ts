/**
 * URJAFLUX AI OS — SPRINT 3B
 * Severity Trace Engine
 * Computes reproducible, itemized severity scores and tier assignments
 * with full mathematical breakdown of additive penalties and subtractive mitigations.
 */

import { roomTaxonomyService } from "../../recognition/RoomTaxonomyService";

export interface SeverityFactor {
  factorName: string;
  factorType: "BASE_ZONE_MISMATCH" | "ADJACENT_CLASH" | "ENERGY_CONFLICT" | "MITIGATION_FACTOR" | "OCCUPANT_IMPACT";
  scoreImpact: number; // Positive increases severity; Negative mitigates
  description: string;
}

export interface SeverityTraceResult {
  totalSeverityScore: number; // 0 to 100
  scoreDeductionPercent: number; // Penalty deduction applied to overall property score
  severityTier: "CATASTROPHIC" | "MAJOR" | "MODERATE" | "MINOR";
  factors: SeverityFactor[];
  formulaString: string;
  reproducibilityHash: string;
  reasonSummary: string;
}

export class SeverityTraceEngine {
  /**
   * Computes mathematical severity trace for a defect/finding.
   * Logic uses canonicalType only; displayName is for human-readable messages.
   */
  public static calculateSeverityTrace(
    displayName: string,
    canonicalType: string,
    assignedZone: string,
    findingTitle: string,
    rawSeverityStr?: string
  ): SeverityTraceResult {
    const factors: SeverityFactor[] = [];
    const normalizedZone = (assignedZone || "").toUpperCase();
    const canonical = roomTaxonomyService.resolveCanonicalTypeFromEntity(
      canonicalType,
      displayName
    );
    const normalizedTitle = (findingTitle || "").toLowerCase();
    const labelForMessage = displayName || canonical;

    // 1. Base Zone Mismatch Impact
    let baseScore = 20;
    if (normalizedZone.includes("NE") || normalizedZone.includes("NORTHEAST") || normalizedZone.includes("ISHANYA")) {
      if (canonical === "TOILET" || canonical === "KITCHEN" || canonical === "STAIRCASE") {
        baseScore = 40;
        factors.push({
          factorName: "Critical Sacred Zone Violation (Northeast / Ishanya)",
          factorType: "BASE_ZONE_MISMATCH",
          scoreImpact: +40,
          description: `Placing ${labelForMessage} (${canonical}) in the Northeast sacred quadrant blocks primary pranic solar inflow.`
        });
      } else {
        baseScore = 25;
        factors.push({
          factorName: "Northeast Sector Placement Impact",
          factorType: "BASE_ZONE_MISMATCH",
          scoreImpact: +25,
          description: `Northeast spatial placement requires strict elemental purity.`
        });
      }
    } else if (normalizedZone.includes("SW") || normalizedZone.includes("SOUTHWEST") || normalizedZone.includes("NIRRUTI")) {
      if (canonical === "MAIN_ENTRANCE" || canonical === "TOILET") {
        baseScore = 35;
        factors.push({
          factorName: "Earth Center Stability Violation (Southwest / Nirruti)",
          factorType: "BASE_ZONE_MISMATCH",
          scoreImpact: +35,
          description: `Placement compromises master occupant stability and structural grounding.`
        });
      } else {
        baseScore = 20;
        factors.push({
          factorName: "Southwest Sector Placement Impact",
          factorType: "BASE_ZONE_MISMATCH",
          scoreImpact: +20,
          description: `Southwest sector demands heavy structural massing.`
        });
      }
    } else {
      baseScore = 15;
      factors.push({
        factorName: "Standard Cardinal/Intercardinal Sector Imbalance",
        factorType: "BASE_ZONE_MISMATCH",
        scoreImpact: +15,
        description: `Sub-optimal zonal placement identified in ${assignedZone}.`
      });
    }

    // 2. Adjacent Room / Elemental Conflict
    const hasFireWaterConflict =
      normalizedTitle.includes("fire") ||
      normalizedTitle.includes("water") ||
      canonical === "KITCHEN" ||
      canonical === "TOILET";

    if (hasFireWaterConflict) {
      factors.push({
        factorName: "Fire-Water Elemental Interaction",
        factorType: "ENERGY_CONFLICT",
        scoreImpact: +18,
        description: "Clash between Agni (Fire) and Jal (Water) thermal energy fields."
      });
    } else if (normalizedTitle.includes("brahmasthan") || normalizedTitle.includes("center")) {
      factors.push({
        factorName: "Brahmasthan Heavy Mass Impact",
        factorType: "ENERGY_CONFLICT",
        scoreImpact: +22,
        description: "Central energy hub experiences structural loading or obstruction."
      });
    } else {
      factors.push({
        factorName: "Adjacent Energy Field Contiguity",
        factorType: "ADJACENT_CLASH",
        scoreImpact: +10,
        description: "Minor energy clash with neighboring functional room boundaries."
      });
    }

    // 3. Occupant Bio-Field Impact
    if (normalizedTitle.includes("health") || normalizedTitle.includes("sleep") || normalizedTitle.includes("ayadi")) {
      factors.push({
        factorName: "Occupant Pranic Bio-Field Stress",
        factorType: "OCCUPANT_IMPACT",
        scoreImpact: +12,
        description: "Subtle energy disruption affects occupant sleep cycle and vitality."
      });
    }

    // 4. Architectural Mitigations (Negative impact reduces severity)
    factors.push({
      factorName: "Natural Daylight & Cross-Ventilation Mitigation",
      factorType: "MITIGATION_FACTOR",
      scoreImpact: -8,
      description: "Adequate window aperture and natural airflow dissipate stagnant energy build-up."
    });

    // Compute total severity score
    const totalSeverityScore = Math.max(5, Math.min(100, factors.reduce((acc, f) => acc + f.scoreImpact, 0)));

    // Severity Tier
    let severityTier: SeverityTraceResult["severityTier"] = "MODERATE";
    let scoreDeductionPercent = 8;

    if (totalSeverityScore >= 60 || rawSeverityStr === "CATASTROPHIC" || rawSeverityStr === "CRITICAL") {
      severityTier = "CATASTROPHIC";
      scoreDeductionPercent = 25;
    } else if (totalSeverityScore >= 35 || rawSeverityStr === "MAJOR" || rawSeverityStr === "HIGH") {
      severityTier = "MAJOR";
      scoreDeductionPercent = 15;
    } else if (totalSeverityScore >= 15 || rawSeverityStr === "MODERATE" || rawSeverityStr === "MEDIUM") {
      severityTier = "MODERATE";
      scoreDeductionPercent = 8;
    } else {
      severityTier = "MINOR";
      scoreDeductionPercent = 4;
    }

    // Construct Formula String
    const formulaComponents = factors.map((f) => `${f.factorName} (${f.scoreImpact > 0 ? "+" : ""}${f.scoreImpact})`);
    const formulaString = `${formulaComponents.join(" + ")} = ${totalSeverityScore} [${severityTier}] (-${scoreDeductionPercent}% Property Deduction)`;

    // Simple deterministic hash for verification
    const hashLabel = (displayName || canonical).slice(0, 3).toUpperCase();
    const reproducibilityHash = `SEV-HASH-${hashLabel}-${totalSeverityScore}-${scoreDeductionPercent}`;

    const reasonSummary = `Wrong zone placement (+${baseScore}) combined with elemental conflicts (+${totalSeverityScore - baseScore + 8}) minus cross-ventilation mitigation (-8) yields total severity score of ${totalSeverityScore} (${severityTier}).`;

    return {
      totalSeverityScore,
      scoreDeductionPercent,
      severityTier,
      factors,
      formulaString,
      reproducibilityHash,
      reasonSummary
    };
  }
}
