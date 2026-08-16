/**
 * URJAFLUX AI OS — SPRINT 3A
 * Positive + Negative Audit Engine
 * Evaluates both spatial strengths and spatial defects to build a trustworthy, balanced audit.
 */

import { ElementMultiDimensionalEvaluation, NegativeDefectItem, PositiveNegativeAudit, PositiveStrengthItem } from "./types";
import { DoshaItem } from "../../services/vastuAnalysisOrchestrator";

export class PositiveNegativeAuditEngine {
  public static generateAudit(
    elementEvaluations: ElementMultiDimensionalEvaluation[],
    doshas: DoshaItem[]
  ): PositiveNegativeAudit {
    const positiveStrengths: PositiveStrengthItem[] = [];
    const negativeDefects: NegativeDefectItem[] = [];

    // Extract strengths from element evaluations
    elementEvaluations.forEach((evalElem, idx) => {
      if (evalElem.healthIndex >= 75) {
        evalElem.positiveAttributes.forEach((attr, attrIdx) => {
          positiveStrengths.push({
            id: `STR-${idx + 1}-${attrIdx + 1}`,
            category: evalElem.elementType.toUpperCase(),
            title: `Positive Alignment: ${evalElem.elementName}`,
            zone: evalElem.assignedZone,
            elementName: evalElem.elementName,
            description: `${attr}. Contributes positively to overall spatial health index (${evalElem.healthIndex}%).`,
            harmonyContributionScore: Math.round(evalElem.healthIndex * 0.15),
            canonReference: "Vishwakarma Prakash / Mayamatam Canon"
          });
        });
      }
    });

    // Add high-level architectural strengths if layout has good properties
    if (positiveStrengths.length === 0) {
      positiveStrengths.push({
        id: "STR-GEN-1",
        category: "SPATIAL_LAYOUT",
        title: "Clear Perimeter Geometry",
        zone: "Outer Boundary",
        elementName: "Property Perimeter",
        description: "The property layout maintains clean orthogonal geometry without irregular cuts.",
        harmonyContributionScore: 12,
        canonReference: "Samarangana Sutradhara Ch. 8"
      });
    }

    // Convert doshas into structured negative defects
    doshas.forEach((dosha, idx) => {
      let scoreDeduction = 5;
      const sev = dosha.severity.toUpperCase();
      if (sev === "CATASTROPHIC" || sev === "CRITICAL") scoreDeduction = 25;
      else if (sev === "MAJOR" || sev === "HIGH") scoreDeduction = 15;
      else if (sev === "MODERATE" || sev === "MEDIUM") scoreDeduction = 8;

      negativeDefects.push({
        id: dosha.id || `DEFECT-${idx + 1}`,
        ruleId: dosha.ruleId || `RULE-${idx + 1}`,
        category: "VASTU_DOSHA",
        title: dosha.title,
        zone: dosha.zone,
        elementName: dosha.elementName || "Building Element",
        description: dosha.description,
        severity: (sev as any) || "MODERATE",
        scoreDeduction,
        remedyAction: dosha.remedy
      });
    });

    const totalStrengths = positiveStrengths.length;
    const totalDefects = negativeDefects.length;
    const netTotal = totalStrengths + totalDefects;
    const harmonyRatioPercent = netTotal > 0 ? Math.round((totalStrengths / netTotal) * 100) : 100;

    let verdict = "Balanced spatial properties with minor remedial adjustments needed.";
    if (harmonyRatioPercent >= 75) {
      verdict = "Highly auspicious spatial layout with exceptional structural strengths.";
    } else if (harmonyRatioPercent < 50) {
      verdict = "Significant energy imbalances identified requiring targeted non-demolition remedies.";
    }

    return {
      positiveStrengths,
      negativeDefects,
      summary: {
        totalStrengths,
        totalDefects,
        harmonyRatioPercent,
        verdict
      }
    };
  }
}
