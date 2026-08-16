import { IKnowledgeGraph } from "../models/GraphModels";

export interface IGraphRepository {
  createGraph(graph: IKnowledgeGraph): Promise<IKnowledgeGraph>;
  updateGraph(graph: IKnowledgeGraph): Promise<IKnowledgeGraph>;
  deleteGraph(graphId: string): Promise<void>;
  getGraph(graphId: string): Promise<IKnowledgeGraph | null>;
  listGraphs(): Promise<IKnowledgeGraph[]>;
}
