import { IGraphRepository } from "./IGraphRepository";

class FallbackGraphRepository implements IGraphRepository {
  private graphs = new Map<string, any>();

  constructor() {
    try {
      const stored = localStorage.getItem("urjaflux_knowledge_graphs");
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach(key => {
          this.graphs.set(key, parsed[key]);
        });
      }
    } catch (e) {
      console.warn("Fallback localStorage graphs failed:", e);
    }
  }

  private persist() {
    try {
      const obj: Record<string, any> = {};
      this.graphs.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem("urjaflux_knowledge_graphs", JSON.stringify(obj));
    } catch (e) {
      console.warn("Fallback save graphs failed:", e);
    }
  }

  async createGraph(graph: any): Promise<any> {
    this.graphs.set(graph.id, graph);
    this.persist();
    return graph;
  }

  async updateGraph(graph: any): Promise<any> {
    this.graphs.set(graph.id, graph);
    this.persist();
    return graph;
  }

  async deleteGraph(graphId: string): Promise<void> {
    this.graphs.delete(graphId);
    this.persist();
  }

  async getGraph(graphId: string): Promise<any | null> {
    return this.graphs.get(graphId) || null;
  }

  async listGraphs(): Promise<any[]> {
    return Array.from(this.graphs.values());
  }
}

export class GraphRepositoryFactory {
  private static instance: GraphRepositoryFactory;
  private repository: IGraphRepository | null = null;

  private constructor() {}

  public static getInstance(): GraphRepositoryFactory {
    if (!GraphRepositoryFactory.instance) {
      GraphRepositoryFactory.instance = new GraphRepositoryFactory();
    }
    return GraphRepositoryFactory.instance;
  }

  public registerRepository(repository: IGraphRepository): void {
    this.repository = repository;
  }

  public getRepository(): IGraphRepository {
    if (!this.repository) {
      console.warn("Graph repository not explicitly registered. Initializing resilient fallback graph repository...");
      this.repository = new FallbackGraphRepository();
    }
    return this.repository;
  }
  
  public clear(): void {
    this.repository = null;
  }
}
