import { describe, expect, it } from "vitest";
import { applyReportAccessGate } from "../freeTierReportGate";
import type { IIntegratedConsultationPackage } from "../../integrated_intelligence/types/iie.types";

function mockPackage(): IIntegratedConsultationPackage {
  return {
    packageId: "TEST",
    kiePackageId: "K",
    kcePackageId: "C",
    crePackageId: "R",
    timestamp: new Date().toISOString(),
    integratedFindings: [
      {
        findingId: "1",
        title: "Vastu A",
        domain: "VASTU",
        spatialZone: "NE",
        description: "d",
        doshaOrEffect: "DEFECT",
        severity: "CRITICAL",
        associatedRuleIds: [],
        associatedRecordIds: [],
        confidenceScore: 0.8,
      },
      {
        findingId: "2",
        title: "Vastu B",
        domain: "VASTU",
        spatialZone: "SE",
        description: "d",
        doshaOrEffect: "DEFECT",
        severity: "HIGH",
        associatedRuleIds: [],
        associatedRecordIds: [],
        confidenceScore: 0.7,
      },
      {
        findingId: "3",
        title: "Vastu C",
        domain: "VASTU",
        spatialZone: "SW",
        description: "d",
        doshaOrEffect: "DEFECT",
        severity: "HIGH",
        associatedRuleIds: [],
        associatedRecordIds: [],
        confidenceScore: 0.6,
      },
      {
        findingId: "4",
        title: "LK",
        domain: "LAL_KITAB",
        spatialZone: "N",
        description: "d",
        doshaOrEffect: "DEFECT",
        severity: "HIGH",
        associatedRuleIds: [],
        associatedRecordIds: [],
        confidenceScore: 0.6,
      },
    ],
    bestRemedyCandidates: [
      {
        remedyId: "r1",
        candidateId: "c1",
        primaryRemedyText: "Remedy 1",
        alternativeRemedies: [],
        targetDomain: "VASTU",
        targetZoneOrDirection: "NE",
        selectionRationale: "r",
        priority: "HIGH_PRIORITY",
        executionPhase: "IMMEDIATE_ACTION",
        structuralCategory: "NON_STRUCTURAL",
        confidenceScore: 0.8,
        confidenceBand: "HIGH",
        confidenceProfile: {} as any,
        originatingRecordId: "x",
        originatingRuleId: "x",
        evidenceHashes: [],
        citationIds: [],
        relationshipChain: [],
        founderApprovalReference: "PENDING",
      },
      {
        remedyId: "r2",
        candidateId: "c2",
        primaryRemedyText: "Remedy 2",
        alternativeRemedies: [],
        targetDomain: "VASTU",
        targetZoneOrDirection: "SE",
        selectionRationale: "r",
        priority: "MEDIUM_PRIORITY",
        executionPhase: "SHORT_TERM_ACTION",
        structuralCategory: "NON_STRUCTURAL",
        confidenceScore: 0.7,
        confidenceBand: "MODERATE",
        confidenceProfile: {} as any,
        originatingRecordId: "y",
        originatingRuleId: "y",
        evidenceHashes: [],
        citationIds: [],
        relationshipChain: [],
        founderApprovalReference: "PENDING",
      },
    ],
    alternativeRemedyCandidates: [],
    executionRoadmap: [],
    compatibilityMatrix: { compatibilityLinks: [], mutuallyExclusivePairs: [], synergisticClusters: [] },
    productPreparationPackage: { items: [], totalRequiredProducts: 0, totalOptionalProducts: 0 },
    consultantDecisionLayer: { evaluationTimestamp: "", decisions: [], isLockedForClient: true },
    crossDomainSummary: { involvedDomains: ["VASTU", "LAL_KITAB"], crossDomainSynergiesCount: 0, crossDomainConflictsCount: 0 },
    conflictSummary: { totalConflicts: 0, directContradictions: 0, alternativePathsCount: 0, alternativePaths: [] },
    evidencePackage: [],
    citationPackage: [],
    executionMetadata: {
      engineVersion: "test",
      pipelineDurationMs: 0,
      totalRulesProcessed: 0,
      totalRemediesEvaluated: 0,
      selectedBestRemediesCount: 0,
    },
  };
}

describe("Free tier report gate", () => {
  it("limits free tier to 2 doshas and 1 remedy (Vastu only)", () => {
    const { consultation, metadata } = applyReportAccessGate(mockPackage(), "FREE");
    expect(consultation.integratedFindings).toHaveLength(2);
    expect(consultation.bestRemedyCandidates).toHaveLength(1);
    expect(metadata.lockedModules).toContain("LAL_KITAB");
    expect(metadata.lockedModules).toContain("NUMEROLOGY");
  });

  it("does not limit consultant tier", () => {
    const { consultation, metadata } = applyReportAccessGate(mockPackage(), "CONSULTANT");
    expect(consultation.integratedFindings.length).toBeGreaterThan(2);
    expect(metadata.lockedModules).toHaveLength(0);
  });
});
