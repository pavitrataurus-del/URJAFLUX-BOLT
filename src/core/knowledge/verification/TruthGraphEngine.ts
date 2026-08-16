import { TruthGraphData, TruthGraphNode, TruthGraphEdge } from "./VerificationTypes";

export class TruthGraphEngine {
  private static instance: TruthGraphEngine;

  public constructor() {}

  public static getInstance(): TruthGraphEngine {
    if (!TruthGraphEngine.instance) {
      TruthGraphEngine.instance = new TruthGraphEngine();
    }
    return TruthGraphEngine.instance;
  }

  public generateTruthGraph(ruleId: string = "rule-vastu-001"): TruthGraphData {
    const nodes: TruthGraphNode[] = [
      {
        id: `truth-${ruleId}`,
        type: "TRUTH_NODE",
        label: "Kitchen Placement in Agni Zone (SE)",
        data: { canonicalVersion: "1.0.0", status: "CANONICAL", domain: "Vastu Shastra" }
      },
      {
        id: `evidence-${ruleId}-1`,
        type: "EVIDENCE_NODE",
        label: "Mayamatam Chapter 18 Verse 4",
        data: { type: "PRIMARY", strength: 95, quality: "HIGH" }
      },
      {
        id: `source-${ruleId}-1`,
        type: "SOURCE_NODE",
        label: "Mayamatam Vastu Shastra Manuscript",
        data: { authorityScore: 98, overallReliability: 96 }
      },
      {
        id: `consensus-${ruleId}-1`,
        type: "CONSENSUS_NODE",
        label: "SME Acharya Panel Sign-Off",
        data: { state: "APPROVED_CANONICAL", approveVotes: 4 }
      },
      {
        id: `confidence-${ruleId}-1`,
        type: "CONFIDENCE_NODE",
        label: "Confidence Grade A+ (96%)",
        data: { score: 96, grade: "A+" }
      },
      {
        id: `dep-${ruleId}-1`,
        type: "DEPENDENCY_NODE",
        label: "Agni Fire Element & Manipura Chakra",
        data: { element: "Agni", zone: "South-East (SE)" }
      },
      {
        id: `version-${ruleId}-1`,
        type: "VERSION_NODE",
        label: "Version 1.0.0 (IGNCA Critical Edition)",
        data: { publicationYear: 1995, edition: "Critical Translation" }
      }
    ];

    const edges: TruthGraphEdge[] = [
      { id: "edge-t-1", source: `truth-${ruleId}`, target: `evidence-${ruleId}-1`, label: "SUPPORTED_BY_EVIDENCE" },
      { id: "edge-t-2", source: `evidence-${ruleId}-1`, target: `source-${ruleId}-1`, label: "EXTRACTED_FROM_SOURCE" },
      { id: "edge-t-3", source: `truth-${ruleId}`, target: `consensus-${ruleId}-1`, label: "SANCTIONED_BY_CONSENSUS" },
      { id: "edge-t-4", source: `truth-${ruleId}`, target: `confidence-${ruleId}-1`, label: "HAS_CONFIDENCE_RATING" },
      { id: "edge-t-5", source: `truth-${ruleId}`, target: `dep-${ruleId}-1`, label: "GOVERNED_BY_DEPENDENCY" },
      { id: "edge-t-6", source: `source-${ruleId}-1`, target: `version-${ruleId}-1`, label: "HAS_VERSION_RECORD" }
    ];

    return { nodes, edges };
  }
}

export const truthGraphEngine = TruthGraphEngine.getInstance();
