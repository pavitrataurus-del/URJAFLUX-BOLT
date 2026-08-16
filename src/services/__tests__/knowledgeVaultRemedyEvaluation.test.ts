import { describe, expect, it, beforeEach } from "vitest";
import { KnowledgeVaultService, type VaultRule } from "../knowledgeVaultService";
import { KnowledgeVaultRemedyEvaluationService } from "../knowledgeVaultRemedyEvaluationService";
import { EnterpriseCognitiveReasoningService } from "../../core/knowledge_ingestion/reasoning/EnterpriseCognitiveReasoningService";

function makeRule(
  partial: Partial<VaultRule> & {
    id: string;
    documentId: string;
    documentTitle: string;
    condition: string;
    recommendation: string;
  }
): VaultRule {
  return {
    category: partial.category || "Kitchen Rules",
    severity: partial.severity || "HIGH",
    confidence: partial.confidence ?? 0.92,
    applicableObjects: partial.applicableObjects || ["kitchen"],
    createdDate: "2026-01-01T00:00:00.000Z",
    updatedDate: "2026-01-01T00:00:00.000Z",
    approvalStatus: "APPROVED",
    version: "1.0",
    revisionNumber: 1,
    evidence: partial.evidence || {
      sourceBook: partial.documentTitle,
      chapter: "Ch. 3",
      pageNumber: partial.evidence?.pageNumber ?? 42,
      confidence: 0.9,
    },
    ...partial,
  };
}

describe("Knowledge Vault remedy evaluation", () => {
  beforeEach(() => {
    KnowledgeVaultService.clearRulesCacheForTesting();
  });

  it("single source: returns one available remedy option (no auto-pick beyond listing)", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-PDF1-1",
        documentId: "doc_a",
        documentTitle: "Vastu Treatise A",
        condition: "Kitchen in North-East (Ishanya) is inauspicious for fire element.",
        recommendation: "Shift kitchen stove to South-East (Agneya) and face East while cooking.",
        applicableObjects: ["kitchen"],
        evidence: { sourceBook: "Vastu Treatise A", pageNumber: 88, confidence: 0.9 },
      }),
    ]);

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Kitchen",
      canonicalType: "KITCHEN",
      objectType: "kitchen",
      zoneDisplay: "North-East (NE / Ishanya)",
      zoneCode: "NE",
      issueTitle: "Kitchen in North-East",
      issueDescription: "Fire element in North-East zone",
    });

    expect(evaluation.candidates.length).toBe(1);
    expect(evaluation.isVerified).toBe(true);
    expect(evaluation.consensusStatus).toBe("SINGLE_OPTION");
    expect(evaluation.recommendedRemedy).toBeNull();
    expect(evaluation.availableRemedies).toHaveLength(1);
    expect(evaluation.availableRemedies[0]).toContain("South-East");
  });

  it("four sources with same remedy: lists one option (not forced unanimous pick)", () => {
    const remedy = "Place yellow stone slab under stove and keep North-East light.";
    const docs = ["Vastu Book A", "Vastu Book B", "Vastu Book C", "Vastu Book D"];

    KnowledgeVaultService.seedApprovedRulesForTesting(
      docs.map((title, i) =>
        makeRule({
          id: `RULE-UNAN-${i}`,
          documentId: `doc_${i}`,
          documentTitle: title,
          condition: `Kitchen in North-East is harmful.`,
          recommendation: remedy,
          evidence: { sourceBook: title, pageNumber: 10 + i, confidence: 0.9 },
        })
      )
    );

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Kitchen",
      canonicalType: "KITCHEN",
      objectType: "kitchen",
      zoneDisplay: "North-East (NE / Ishanya)",
      zoneCode: "NE",
      issueTitle: "Kitchen placement defect",
    });

    expect(evaluation.candidates.length).toBe(4);
    expect(evaluation.consensusStatus).toBe("SINGLE_OPTION");
    expect(evaluation.recommendedRemedy).toBeNull();
    expect(evaluation.availableRemedies).toHaveLength(1);
    expect(evaluation.availableRemedies[0]).toBe(remedy);
  });

  it("four sources with 2 vs 2 split: shows both remedy options for user/consultant selection", () => {
    const remedyA = "Relocate kitchen to South-East and face East.";
    const remedyB = "Install copper helix in North-East and use yellow paint.";

    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-SPLIT-1",
        documentId: "doc_1",
        documentTitle: "Source A",
        condition: "Kitchen in North-East must be corrected.",
        recommendation: remedyA,
        evidence: { sourceBook: "Source A", pageNumber: 12, confidence: 0.9 },
      }),
      makeRule({
        id: "RULE-SPLIT-2",
        documentId: "doc_2",
        documentTitle: "Source B",
        condition: "Kitchen in North-East is inauspicious.",
        recommendation: remedyA,
        evidence: { sourceBook: "Source B", pageNumber: 22, confidence: 0.9 },
      }),
      makeRule({
        id: "RULE-SPLIT-3",
        documentId: "doc_3",
        documentTitle: "Source C",
        condition: "Kitchen in North-East requires elemental remedy.",
        recommendation: remedyB,
        evidence: { sourceBook: "Source C", pageNumber: 33, confidence: 0.9 },
      }),
      makeRule({
        id: "RULE-SPLIT-4",
        documentId: "doc_4",
        documentTitle: "Source D",
        condition: "Kitchen in North-East should not remain.",
        recommendation: remedyB,
        evidence: { sourceBook: "Source D", pageNumber: 44, confidence: 0.9 },
      }),
    ]);

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Kitchen",
      canonicalType: "KITCHEN",
      objectType: "kitchen",
      zoneDisplay: "North-East (NE / Ishanya)",
      zoneCode: "NE",
      issueTitle: "Kitchen in North-East",
    });

    expect(evaluation.consensusStatus).toBe("MULTIPLE_OPTIONS");
    expect(evaluation.recommendedRemedy).toBeNull();
    expect(evaluation.availableRemedies).toHaveLength(2);
    expect(evaluation.availableRemedies).toContain(remedyA);
    expect(evaluation.availableRemedies).toContain(remedyB);
    expect(evaluation.recommendationRationale).not.toContain("Source A");
    expect(evaluation.recommendationRationale).not.toContain("No single remedy auto-selected");

    const grounded = EnterpriseCognitiveReasoningService.bindAndVerifyPdfFinding(
      "KITCHEN",
      "North-East (NE / Ishanya)",
      45,
      { title: "Kitchen in North-East", displayName: "Kitchen" }
    );

    expect(grounded.isVerified).toBe(true);
    expect(grounded.remedies).toHaveLength(2);
    expect(grounded.remedy).toContain("Option 1:");
    expect(grounded.remedy).toContain("Option 2:");
    expect(grounded.description).not.toContain("Source A");
    expect(grounded.citationMetadata.formattedCitation).toBe("[Internal trace only]");
  });

  it("does not apply kitchen rule to master bedroom context", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-KITCHEN-NE",
        documentId: "doc_k",
        documentTitle: "Kitchen Book",
        condition: "Kitchen in North-East is inauspicious.",
        recommendation: "Shift stove to South-East.",
        applicableObjects: ["kitchen"],
      }),
      makeRule({
        id: "RULE-BED-SW",
        documentId: "doc_b",
        documentTitle: "Bedroom Book",
        category: "Bedroom Rules",
        condition: "Master bedroom in South-West is auspicious and recommended.",
        recommendation: "Keep master bedroom in South-West with head towards South.",
        applicableObjects: ["bedroom", "master_bedroom"],
        evidence: { sourceBook: "Bedroom Book", pageNumber: 67, confidence: 0.9 },
      }),
    ]);

    const kitchenEval = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Kitchen",
      canonicalType: "KITCHEN",
      objectType: "kitchen",
      zoneDisplay: "North-East (NE / Ishanya)",
      zoneCode: "NE",
    });

    const bedroomEval = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Master Bedroom",
      canonicalType: "MASTER_BEDROOM",
      objectType: "master_bedroom",
      zoneDisplay: "South-West (SW / Nirriti)",
      zoneCode: "SW",
    });

    expect(kitchenEval.candidates.every((c) => c.documentTitle === "Kitchen Book")).toBe(true);
    expect(bedroomEval.candidates.every((c) => c.documentTitle === "Bedroom Book")).toBe(true);
    expect(kitchenEval.availableRemedies[0]).not.toBe(bedroomEval.availableRemedies[0]);
  });

  it("cross-direction impact: states insufficient evidence when vault is silent", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-NE-ONLY",
        documentId: "doc_ne",
        documentTitle: "NE Remedy Book",
        condition: "Kitchen in North-East should use copper strip remedy.",
        recommendation: "Install copper strip in North-East kitchen wall.",
      }),
    ]);

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Kitchen",
      canonicalType: "KITCHEN",
      objectType: "kitchen",
      zoneDisplay: "North-East (NE / Ishanya)",
      zoneCode: "NE",
    });

    expect(evaluation.crossDirectionImpact.summary).toContain(
      "do not provide enough evidence to determine the cross-direction impact"
    );
  });

  it("cross-direction impact: surfaces vault evidence when another zone is referenced", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-NE-TARGET",
        documentId: "doc_target",
        documentTitle: "Target Zone Book",
        condition: "Kitchen in North-East remedy uses copper helix installation.",
        recommendation: "Install copper helix in North-East kitchen.",
      }),
      makeRule({
        id: "RULE-SW-WARN",
        documentId: "doc_warn",
        documentTitle: "Cross Zone Book",
        category: "Direction Rules",
        condition: "Do not install copper helix remedy in South-West bedroom zone — inauspicious.",
        recommendation: "Avoid copper helix in South-West; use earth element remedy instead.",
        applicableObjects: ["bedroom", "room"],
        evidence: { sourceBook: "Cross Zone Book", pageNumber: 101, confidence: 0.9 },
      }),
    ]);

    const impact = KnowledgeVaultRemedyEvaluationService.assessCrossDirectionImpact(
      "Install copper helix in North-East kitchen.",
      {
        entityDisplayName: "Kitchen",
        canonicalType: "KITCHEN",
        objectType: "kitchen",
        zoneDisplay: "North-East (NE / Ishanya)",
        zoneCode: "NE",
      },
      KnowledgeVaultService.getStrictApprovedRulesForContext("kitchen", "NE", "KITCHEN")
    );

    expect(impact.hasNegativeImpactEvidence).toBe(true);
    expect(impact.sourceReferences.some((r) => r.documentTitle === "Cross Zone Book")).toBe(true);
  });

  it("returns no options when no approved vault rules match context", () => {
    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Kitchen",
      canonicalType: "KITCHEN",
      objectType: "kitchen",
      zoneDisplay: "North-East (NE / Ishanya)",
      zoneCode: "NE",
    });

    expect(evaluation.consensusStatus).toBe("NO_EVIDENCE");
    expect(evaluation.recommendedRemedy).toBeNull();
    expect(evaluation.availableRemedies).toHaveLength(0);

    const grounded = EnterpriseCognitiveReasoningService.bindAndVerifyPdfFinding(
      "KITCHEN",
      "North-East (NE / Ishanya)",
      45,
      { title: "Kitchen defect", displayName: "Kitchen" }
    );

    expect(grounded.isVerified).toBe(false);
    expect(grounded.remedies).toHaveLength(0);
    expect(grounded.citationMetadata.formattedCitation).toBe("[Internal trace only]");
  });

  it("staircase in North: multi-source unfavorable placement without book names in rationale", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-MAYA-STAIRS-N",
        documentId: "doc_mayamatam",
        documentTitle: "Mayamatam Vastu Shastra",
        category: "Staircase Rules",
        condition: "Staircase in North zone is not recommended — heavy structure disturbs Kuber energy.",
        recommendation: "Avoid staircase in North; relocate to South or West if possible.",
        applicableObjects: ["staircase", "stairs"],
        evidence: { sourceBook: "Mayamatam Vastu Shastra", pageNumber: 112, confidence: 0.9 },
      }),
      makeRule({
        id: "RULE-VISW-STAIRS-N",
        documentId: "doc_viswakarma",
        documentTitle: "Viswakarma Vastu Shastra",
        category: "Staircase Rules",
        condition: "Do not place staircase in North direction — inauspicious for wealth flow.",
        recommendation: "Shift staircase to South-West or external side.",
        applicableObjects: ["staircase"],
        evidence: { sourceBook: "Viswakarma Vastu Shastra", pageNumber: 78, confidence: 0.9 },
      }),
    ]);

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluatePlacementForContext({
      entityDisplayName: "Staircase",
      canonicalType: "STAIRCASE",
      objectType: "staircase",
      zoneDisplay: "North (N / Kuber)",
      zoneCode: "N",
    });

    expect(evaluation.matchedRules.length).toBe(2);
    expect(evaluation.placementVerdict).toBe("UNFAVORABLE");
    expect(evaluation.consensusStatus).toBe("MULTIPLE_OPTIONS");
    expect(evaluation.multiSourceSummary).toBe("2 approved knowledge source(s)");
    expect(evaluation.recommendationRationale).not.toContain("Mayamatam");
    expect(evaluation.recommendationRationale).not.toContain("Viswakarma");

    const grounded = EnterpriseCognitiveReasoningService.evaluatePlacementFromVault(
      "STAIRCASE",
      "North (N / Kuber)",
      0,
      { displayName: "Staircase" }
    );

    expect(grounded.placementVerdict).toBe("UNFAVORABLE");
    expect(grounded.recommendationRationale).not.toContain("Mayamatam");
    expect(grounded.citationMetadata.formattedCitation).toBe("[Internal trace only]");
  });

  it("tiered fallback: object-only vault rule still yields remedy option", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-LR-GENERAL",
        documentId: "doc_visw",
        documentTitle: "Viswakarm1",
        category: "Living Room Rules",
        condition: "Living room should be well lit and avoid heavy storage clutter.",
        recommendation: "Place warm yellow accents in the living area and keep North-East corner open.",
        applicableObjects: ["living_room", "general"],
        evidence: { sourceBook: "Viswakarm1", pageNumber: 41, confidence: 0.9 },
      }),
    ]);

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Living Room",
      canonicalType: "LIVING_ROOM",
      objectType: "living_room",
      zoneDisplay: "South-East (SE / Agneya)",
      zoneCode: "SE",
    });

    expect(evaluation.candidates.length).toBeGreaterThan(0);
    expect(evaluation.availableRemedies[0]).toContain("warm yellow");
  });

  it("matches Hindi Devanagari zone text for bedroom remedy without English keywords", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-HI-BED-S",
        documentId: "doc_visw",
        documentTitle: "Viswakarm1",
        category: "Extracted Vastu Knowledge",
        condition: "दक्षिण दिशा में शयन कक्ष के लिए भारी वस्तुएं न रखें।",
        recommendation: "दक्षिण दिशा में हल्के पीले रंग का प्रयोग करें और शयन कक्ष को व्यवस्थित रखें।",
        applicableObjects: ["general"],
        evidence: { sourceBook: "Viswakarm1", pageNumber: 12, confidence: 0.9 },
      }),
    ]);

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Master Bedroom",
      canonicalType: "BEDROOM",
      objectType: "bedroom",
      zoneDisplay: "South (S)",
      zoneCode: "S",
    });

    expect(evaluation.candidates.length).toBeGreaterThan(0);
    expect(evaluation.availableRemedies.length).toBeGreaterThan(0);
  });

  it("returns up to five distinct remedy options from five different books", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting(
      Array.from({ length: 5 }, (_, i) =>
        makeRule({
          id: `RULE-MULTI-${i}`,
          documentId: `doc_${i}`,
          documentTitle: `Book ${i}`,
          condition: "Kitchen in North-East is inauspicious.",
          recommendation: `Remedy option ${i + 1}: shift cooking zone and install correction ${i + 1}.`,
          evidence: { sourceBook: `Book ${i}`, pageNumber: i + 1, confidence: 0.9 },
        })
      )
    );

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Kitchen",
      canonicalType: "KITCHEN",
      objectType: "kitchen",
      zoneDisplay: "North-East (NE / Ishanya)",
      zoneCode: "NE",
    });

    expect(evaluation.availableRemedies).toHaveLength(5);
    expect(evaluation.consensusStatus).toBe("MULTIPLE_OPTIONS");
  });

  it("rejects unrelated zone-only historical prose for window context", () => {
    KnowledgeVaultService.seedApprovedRulesForTesting([
      makeRule({
        id: "RULE-HIST-N",
        documentId: "doc_visw",
        documentTitle: "Viswakarm1",
        category: "Extracted Vastu Knowledge",
        condition: "North direction discussion in treatise.",
        recommendation:
          "This translates to 'The king should provide land and villages to the four architects who are skilled in measurement.' This makes grammatical sense.",
        applicableObjects: ["general"],
        evidence: { sourceBook: "Viswakarm1", pageNumber: 9, confidence: 0.9 },
      }),
    ]);

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext({
      entityDisplayName: "Stairs",
      canonicalType: "STAIRCASE",
      objectType: "staircase",
      zoneDisplay: "North (N)",
      zoneCode: "N",
    });

    expect(evaluation.candidates.length).toBe(0);
    expect(evaluation.availableRemedies).toHaveLength(0);
  });
});
