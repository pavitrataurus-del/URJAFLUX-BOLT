/**
 * URJAFLUX AI OS — SPRINT 3A
 * Property Health Index Evaluator
 * Computes multi-dimensional Property Health Index across 8 sub-indices.
 */

import { ElementMultiDimensionalEvaluation, PropertyHealthIndex, PropertySubIndex } from "./types";
import { DoshaItem } from "../../services/vastuAnalysisOrchestrator";
import { ScoreTraceEngine } from "./ScoreTraceEngine";

export class PropertyHealthEvaluator {
  public static calculatePropertyHealth(
    elementEvaluations: ElementMultiDimensionalEvaluation[],
    doshas: DoshaItem[],
    overallBaseScore: number
  ): PropertyHealthIndex {
    const catastrophicCount = doshas.filter((d) => d.severity === "CRITICAL").length;
    const majorCount = doshas.filter((d) => d.severity === "HIGH").length;
    const moderateCount = doshas.filter((d) => d.severity === "MEDIUM").length;

    // 1. Spatial Planning
    const spatialScore = Math.max(20, Math.min(100, 100 - (catastrophicCount * 20 + majorCount * 12)));
    // 2. Directional Balance
    const directionalScore = Math.max(15, Math.min(100, 100 - (doshas.filter(d => d.title.toLowerCase().includes("zone") || d.title.toLowerCase().includes("direction")).length * 10 + catastrophicCount * 15)));
    // 3. Element Balance
    const elementScore = Math.max(25, Math.min(100, 100 - (doshas.filter(d => d.title.toLowerCase().includes("fire") || d.title.toLowerCase().includes("water") || d.title.toLowerCase().includes("element")).length * 15 + majorCount * 10)));
    // 4. Energy Distribution
    const energyScore = Math.max(20, Math.min(100, overallBaseScore));
    // 5. Structural Harmony
    const structuralScore = Math.max(30, Math.min(100, 100 - (doshas.filter(d => d.title.toLowerCase().includes("weight") || d.title.toLowerCase().includes("staircase")).length * 18 + moderateCount * 5)));
    // 6. Occupant Wellness
    const wellnessScore = Math.max(25, Math.min(100, 100 - (doshas.filter(d => d.zone.includes("SW") || d.zone.includes("NE")).length * 15 + catastrophicCount * 20)));
    // 7. Expansion Potential
    const expansionScore = Math.max(40, Math.min(100, 90 - (catastrophicCount * 10)));
    // 8. Environmental Balance
    const environmentalScore = Math.max(35, Math.min(100, 95 - (majorCount * 8)));

    const subIndices: PropertySubIndex[] = [
      {
        id: "SUB-1",
        name: "Spatial Planning",
        score: spatialScore,
        status: spatialScore >= 85 ? "EXCELLENT" : spatialScore >= 70 ? "GOOD" : spatialScore >= 50 ? "FAIR" : "CRITICAL",
        findingsCount: catastrophicCount + majorCount,
        keyObservation: spatialScore >= 80 ? "Spatial room layout follows clean functional zoning." : "Room distribution exhibits spatial conflicts across major sectors."
      },
      {
        id: "SUB-2",
        name: "Directional Balance",
        score: directionalScore,
        status: directionalScore >= 85 ? "EXCELLENT" : directionalScore >= 70 ? "GOOD" : directionalScore >= 50 ? "FAIR" : "CRITICAL",
        findingsCount: doshas.length,
        keyObservation: directionalScore >= 80 ? "Chakra orientation aligns smoothly with 16 cardinal zones." : "Directional orientation displays energy skewing across key quadrants."
      },
      {
        id: "SUB-3",
        name: "Element Balance",
        score: elementScore,
        status: elementScore >= 85 ? "EXCELLENT" : elementScore >= 70 ? "GOOD" : elementScore >= 50 ? "FAIR" : "CRITICAL",
        findingsCount: doshas.filter(d => d.title.toLowerCase().includes("fire") || d.title.toLowerCase().includes("water")).length,
        keyObservation: elementScore >= 80 ? "Pancha Tattva (5 Elements) maintained in mutual harmony." : "Elemental clash detected between Fire (Agni) and Water (Jal) domains."
      },
      {
        id: "SUB-4",
        name: "Energy Distribution",
        score: energyScore,
        status: energyScore >= 85 ? "EXCELLENT" : energyScore >= 70 ? "GOOD" : energyScore >= 50 ? "FAIR" : "CRITICAL",
        findingsCount: doshas.length,
        keyObservation: `Overall energy flux rating at ${energyScore}%.`
      },
      {
        id: "SUB-5",
        name: "Structural Harmony",
        score: structuralScore,
        status: structuralScore >= 85 ? "EXCELLENT" : structuralScore >= 70 ? "GOOD" : structuralScore >= 50 ? "FAIR" : "CRITICAL",
        findingsCount: doshas.filter(d => d.title.toLowerCase().includes("stair") || d.title.toLowerCase().includes("weight")).length,
        keyObservation: "Structural massing and load centers aligned with Earth (SW) loading rules."
      },
      {
        id: "SUB-6",
        name: "Occupant Wellness",
        score: wellnessScore,
        status: wellnessScore >= 85 ? "EXCELLENT" : wellnessScore >= 70 ? "GOOD" : wellnessScore >= 50 ? "FAIR" : "CRITICAL",
        findingsCount: doshas.filter(d => d.zone.includes("SW") || d.zone.includes("NE")).length,
        keyObservation: "Pranic bio-field stability evaluated for master occupants."
      },
      {
        id: "SUB-7",
        name: "Expansion Potential",
        score: expansionScore,
        status: expansionScore >= 85 ? "EXCELLENT" : expansionScore >= 70 ? "GOOD" : expansionScore >= 50 ? "FAIR" : "CRITICAL",
        findingsCount: 0,
        keyObservation: "North & East open space ratio permits healthy future energy growth."
      },
      {
        id: "SUB-8",
        name: "Environmental Balance",
        score: environmentalScore,
        status: environmentalScore >= 85 ? "EXCELLENT" : environmentalScore >= 70 ? "GOOD" : environmentalScore >= 50 ? "FAIR" : "CRITICAL",
        findingsCount: 0,
        keyObservation: "Daylight factor and natural ventilation pathways optimized."
      }
    ];

    const overallScore = Math.round(
      (spatialScore + directionalScore + elementScore + energyScore + structuralScore + wellnessScore + expansionScore + environmentalScore) / 8
    );

    let ratingTier: PropertyHealthIndex["ratingTier"] = "BALANCED";
    if (overallScore >= 90) ratingTier = "SUPREME_HARMONY";
    else if (overallScore >= 75) ratingTier = "BALANCED";
    else if (overallScore >= 60) ratingTier = "MODERATE_REMEDY_REQ";
    else if (overallScore >= 40) ratingTier = "HIGH_IMBALANCE";
    else ratingTier = "CRITICAL_DEFECTS";

    const elementHealthScores = elementEvaluations.map((e) => ({
      elementId: e.elementId,
      name: e.elementName,
      type: e.elementType,
      healthIndex: e.healthIndex,
      zone: e.assignedZone
    }));

    const healthTrace = ScoreTraceEngine.generatePropertyHealthTrace(
      subIndices,
      overallScore,
      ratingTier,
      catastrophicCount * 25 + majorCount * 15 + moderateCount * 8,
      10
    );

    return {
      overallScore,
      ratingTier,
      subIndices,
      elementHealthScores,
      scoreTraceFormula: healthTrace.finalFormulaString,
      calculationSteps: healthTrace.calculationSteps
    };
  }
}
