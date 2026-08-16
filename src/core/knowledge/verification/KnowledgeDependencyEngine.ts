import { DependencyGraph, DependencyNode, DependencyEdge } from "./VerificationTypes";

export class KnowledgeDependencyEngine {
  private static instance: KnowledgeDependencyEngine;

  public constructor() {}

  public static getInstance(): KnowledgeDependencyEngine {
    if (!KnowledgeDependencyEngine.instance) {
      KnowledgeDependencyEngine.instance = new KnowledgeDependencyEngine();
    }
    return KnowledgeDependencyEngine.instance;
  }

  public generateDependencyGraph(rootKeyword: string = "Kitchen"): DependencyGraph {
    const nodes: DependencyNode[] = [
      { id: "dep-room-1", label: rootKeyword, type: "ROOM", domain: "Vastu" },
      { id: "dep-elem-1", label: "Fire Element (Agni Tattva)", type: "ELEMENT", domain: "Vastu / Chakra" },
      { id: "dep-dir-1", label: "South-East (Agneya) Direction", type: "DIRECTION", domain: "Vastu" },
      { id: "dep-chk-1", label: "Manipura (Solar Plexus) Chakra", type: "CHAKRA", domain: "Chakra" },
      { id: "dep-deity-1", label: "Lord Agni Dev", type: "DEITY", domain: "Vastu Shastra" },
      { id: "dep-rem-1", label: "Copper Helix & Red Jasper Crystal Rectifier", type: "REMEDY", domain: "Vastu Remedies" },
      { id: "dep-obj-1", label: "Culinary Burner / Stove Platform", type: "OBJECT", domain: "Vastu" },
      { id: "dep-yantra-1", label: "Agni Triangle Square Yantra", type: "YANTRA", domain: "Vastu Shastra" }
    ];

    const edges: DependencyEdge[] = [
      { id: "edge-1", source: "dep-room-1", target: "dep-elem-1", relationship: "GOVERNED_BY_ELEMENT" },
      { id: "edge-2", source: "dep-elem-1", target: "dep-dir-1", relationship: "LOCATED_IN_ZONE" },
      { id: "edge-3", source: "dep-elem-1", target: "dep-chk-1", relationship: "RESONATES_WITH_CHAKRA" },
      { id: "edge-4", source: "dep-dir-1", target: "dep-deity-1", relationship: "PRESIDED_BY_DEITY" },
      { id: "edge-5", source: "dep-room-1", target: "dep-rem-1", relationship: "RECTIFIED_BY_REMEDY" },
      { id: "edge-6", source: "dep-room-1", target: "dep-obj-1", relationship: "CONTAINS_OBJECT" },
      { id: "edge-7", source: "dep-chk-1", target: "dep-yantra-1", relationship: "HARMONIZED_BY_YANTRA" }
    ];

    return { nodes, edges };
  }
}

export const knowledgeDependencyEngine = KnowledgeDependencyEngine.getInstance();
