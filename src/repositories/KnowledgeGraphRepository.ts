// URJAFLUX Enterprise Knowledge Base V2 - Knowledge Graph Repository

import { BaseRepository } from "./BaseRepository";
import { GraphNodeStoreItem, GraphEdgeStoreItem, KBStoreName } from "../core/storage/schema";

export class KnowledgeGraphNodesRepository extends BaseRepository<GraphNodeStoreItem> {
  constructor() {
    super(KBStoreName.GRAPH_NODES);
  }

  public async findByBookId(bookId: string): Promise<GraphNodeStoreItem[]> {
    return this.getByIndex("bookId", bookId);
  }

  public async findByType(type: string): Promise<GraphNodeStoreItem[]> {
    return this.getByIndex("type", type);
  }
}

export class KnowledgeGraphEdgesRepository extends BaseRepository<GraphEdgeStoreItem> {
  constructor() {
    super(KBStoreName.GRAPH_EDGES);
  }

  public async findBySourceId(sourceId: string): Promise<GraphEdgeStoreItem[]> {
    return this.getByIndex("sourceId", sourceId);
  }

  public async findByTargetId(targetId: string): Promise<GraphEdgeStoreItem[]> {
    return this.getByIndex("targetId", targetId);
  }

  public async findByRelationshipType(relationshipType: string): Promise<GraphEdgeStoreItem[]> {
    return this.getByIndex("relationshipType", relationshipType);
  }
}

export class KnowledgeGraphRepository {
  public nodes: KnowledgeGraphNodesRepository;
  public edges: KnowledgeGraphEdgesRepository;

  constructor() {
    this.nodes = new KnowledgeGraphNodesRepository();
    this.edges = new KnowledgeGraphEdgesRepository();
  }

  public async getGraphForBook(bookId: string): Promise<{ nodes: GraphNodeStoreItem[]; edges: GraphEdgeStoreItem[] }> {
    const bookNodes = await this.nodes.findByBookId(bookId);
    const nodeIds = new Set(bookNodes.map(n => n.id));
    
    const allEdges = await this.edges.getAll();
    const relevantEdges = allEdges.filter(e => nodeIds.has(e.sourceId) || nodeIds.has(e.targetId));

    return { nodes: bookNodes, edges: relevantEdges };
  }

  public async clearGraph(): Promise<void> {
    await this.nodes.clear();
    await this.edges.clear();
  }
}
