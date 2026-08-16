import { IKnowledgeGraph, IExpertModule, IEvidenceLink } from "../models/GraphModels";
import { GraphRepositoryFactory } from "../repository/GraphRepositoryFactory";
import { GraphValidator } from "../validation/GraphValidator";
import { ExpertRegistry } from "../registry/ExpertRegistry";
import { EvidenceManager } from "../evidence/EvidenceManager";
import { MultiExpertOrchestrator } from "../orchestrator/MultiExpertOrchestrator";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { GraphEventType, createGraphEvent } from "../events/GraphEvents";

export class GraphApi {
  private static instance: GraphApi;

  private constructor() {}

  public static getInstance(): GraphApi {
    if (!GraphApi.instance) {
      GraphApi.instance = new GraphApi();
    }
    return GraphApi.instance;
  }

  public async createGraph(graph: IKnowledgeGraph): Promise<IKnowledgeGraph> {
    GraphValidator.getInstance().validateGraph(graph);
    
    // Store evidence links
    graph.evidenceLinks.forEach(link => {
      EvidenceManager.getInstance().storeEvidenceLink(link);
    });

    const repo = GraphRepositoryFactory.getInstance().getRepository();
    const created = await repo.createGraph(graph);
    EventBus.getInstance().publish(createGraphEvent(GraphEventType.GRAPH_CREATED, { graphId: created.id }));
    return created;
  }

  public async loadGraph(graphId: string): Promise<IKnowledgeGraph | null> {
    const repo = GraphRepositoryFactory.getInstance().getRepository();
    return repo.getGraph(graphId);
  }

  public queryGraph(graph: IKnowledgeGraph, queryFn: (graph: IKnowledgeGraph) => any): any {
    return queryFn(graph);
  }

  public registerExpert(expert: IExpertModule): void {
    ExpertRegistry.getInstance().registerExpert(expert);
  }

  public listExperts(): IExpertModule[] {
    return ExpertRegistry.getInstance().listExperts();
  }

  public async getGraphStatus(graphId: string): Promise<string> {
    const graph = await this.loadGraph(graphId);
    if (!graph) return "NOT_FOUND";
    try {
      GraphValidator.getInstance().validateGraph(graph);
      return "VALID";
    } catch (e) {
      return "INVALID";
    }
  }

  public getEvidenceLookup(edgeId: string): IEvidenceLink[] {
    return EvidenceManager.getInstance().getEvidenceForEdge(edgeId);
  }

  public prepareExpertRouting(namespace: string): IExpertModule[] {
    return MultiExpertOrchestrator.getInstance().prepareRouting(namespace);
  }
}
