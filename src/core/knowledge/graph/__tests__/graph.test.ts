import { describe, it, expect, beforeEach } from "vitest";
import { 
  GraphApi,
  GraphRepositoryFactory,
  IGraphRepository,
  IKnowledgeGraph,
  NodeType,
  EdgeType,
  IExpertModule,
  ExpertHealthStatus,
  ExpertRegistry,
  EvidenceManager
} from "../index";

describe("Knowledge Graph and Orchestrator", () => {
  class MockGraphRepository implements IGraphRepository {
    private graphs: Map<string, IKnowledgeGraph> = new Map();

    async createGraph(graph: IKnowledgeGraph) {
      this.graphs.set(graph.id, graph);
      return graph;
    }
    async updateGraph(graph: IKnowledgeGraph) {
      this.graphs.set(graph.id, graph);
      return graph;
    }
    async deleteGraph(id: string) {
      this.graphs.delete(id);
    }
    async getGraph(id: string) {
      return this.graphs.get(id) || null;
    }
    async listGraphs() {
      return Array.from(this.graphs.values());
    }
  }

  beforeEach(() => {
    GraphRepositoryFactory.getInstance().clear();
    GraphRepositoryFactory.getInstance().registerRepository(new MockGraphRepository());
    ExpertRegistry.getInstance().clear();
    EvidenceManager.getInstance().clear();
  });

  const mockGraph: IKnowledgeGraph = {
    id: "g_1",
    version: 1,
    metadata: {},
    nodes: [
      { id: "n_1", type: NodeType.CONCEPT, label: "Room", namespace: "CORE", properties: {}, version: 1 },
      { id: "n_2", type: NodeType.CONCEPT, label: "Door", namespace: "CORE", properties: {}, version: 1 }
    ],
    edges: [
      { id: "e_1", sourceId: "n_1", targetId: "n_2", type: EdgeType.CONNECTED_TO, properties: {} }
    ],
    evidenceLinks: [
      {
        id: "ev_1",
        edgeId: "e_1",
        knowledgeSource: "Architecture Standards",
        documentId: "doc_1",
        namespaceId: "CORE",
        checksum: "abc1234",
        approvalStatus: "APPROVED"
      }
    ]
  };

  it("should create graph and preserve evidence links", async () => {
    const api = GraphApi.getInstance();
    const created = await api.createGraph(mockGraph);
    
    expect(created.id).toBe("g_1");
    
    const evidence = api.getEvidenceLookup("e_1");
    expect(evidence.length).toBe(1);
    expect(evidence[0].knowledgeSource).toBe("Architecture Standards");
  });

  it("should fail graph validation if circular reference exists", async () => {
    const api = GraphApi.getInstance();
    const invalidGraph: IKnowledgeGraph = {
      ...mockGraph,
      id: "g_invalid",
      edges: [
        { id: "e_bad", sourceId: "n_1", targetId: "n_1", type: EdgeType.RELATED_TO, properties: {} }
      ]
    };
    
    await expect(api.createGraph(invalidGraph)).rejects.toThrow(/Circular reference detected/);
  });

  it("should register experts and prepare routing with dependencies", () => {
    const api = GraphApi.getInstance();
    
    api.registerExpert({
      identifier: "EXPERT_B",
      version: "1.0",
      capabilities: ["ANALYSIS"],
      supportedNamespaces: ["VASTU"],
      healthStatus: ExpertHealthStatus.HEALTHY,
      dependencies: ["EXPERT_A"]
    });

    api.registerExpert({
      identifier: "EXPERT_A",
      version: "1.0",
      capabilities: ["EXTRACTION"],
      supportedNamespaces: ["VASTU"],
      healthStatus: ExpertHealthStatus.HEALTHY,
      dependencies: []
    });

    const route = api.prepareExpertRouting("VASTU");
    expect(route.length).toBe(2);
    // EXPERT_A must come before EXPERT_B
    expect(route[0].identifier).toBe("EXPERT_A");
    expect(route[1].identifier).toBe("EXPERT_B");
  });

  it("should fail routing if circular dependency exists in experts", () => {
    const api = GraphApi.getInstance();
    
    api.registerExpert({
      identifier: "EXPERT_X",
      version: "1.0",
      capabilities: [],
      supportedNamespaces: ["LAL_KITAB"],
      healthStatus: ExpertHealthStatus.HEALTHY,
      dependencies: ["EXPERT_Y"]
    });

    api.registerExpert({
      identifier: "EXPERT_Y",
      version: "1.0",
      capabilities: [],
      supportedNamespaces: ["LAL_KITAB"],
      healthStatus: ExpertHealthStatus.HEALTHY,
      dependencies: ["EXPERT_X"]
    });

    expect(() => api.prepareExpertRouting("LAL_KITAB")).toThrow(/Circular dependency detected/);
  });
});
