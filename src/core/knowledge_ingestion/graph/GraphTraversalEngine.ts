// ============================================================================
// GRAPH TRAVERSAL ENGINE (PHASE 4)
// Traversal Algorithms: DFS, BFS, Shortest Path, Multi-hop, Neighbour Search, Subgraph Extraction
// ============================================================================

import { 
  GraphEdge, 
  GraphEdgeType, 
  GraphNode, 
  GraphNodeType, 
  GraphPath, 
  GraphTraversalOptions, 
  GraphTraversalResult 
} from "../types/graphKnowledge";
import { GraphStorageManager } from "./GraphStorageManager";

export class GraphTraversalEngine {
  /**
   * BREADTH FIRST SEARCH (BFS)
   */
  public static async bfs(options: GraphTraversalOptions): Promise<GraphTraversalResult> {
    const storage = GraphStorageManager.getActiveBackend();
    const maxDepth = options.maxDepth ?? 3;
    const direction = options.direction || "OUTGOING";

    const visitedNodeIds = new Set<string>();
    const visitedNodes: GraphNode[] = [];
    const visitedEdges: GraphEdge[] = [];
    const paths: GraphPath[] = [];

    const queue: { nodeId: string; currentDepth: number; pathNodeIds: string[]; pathEdgeIds: string[] }[] = [
      { nodeId: options.startNodeId, currentDepth: 0, pathNodeIds: [options.startNodeId], pathEdgeIds: [] }
    ];

    while (queue.length > 0) {
      const { nodeId, currentDepth, pathNodeIds, pathEdgeIds } = queue.shift()!;
      if (visitedNodeIds.has(nodeId)) continue;

      const node = await storage.getNode(nodeId);
      if (!node) continue;

      // Filter by node type if specified
      if (options.allowedNodeTypes && !options.allowedNodeTypes.includes(node.nodeType) && nodeId !== options.startNodeId) {
        continue;
      }

      visitedNodeIds.add(nodeId);
      visitedNodes.push(node);

      if (pathEdgeIds.length > 0) {
        paths.push({
          nodeIds: pathNodeIds,
          edgeIds: pathEdgeIds,
          length: pathEdgeIds.length
        });
      }

      if (currentDepth >= maxDepth) continue;

      // Fetch relevant connected edges
      const edgesToExplore = await this.getAdjacentEdges(nodeId, direction, options.allowedEdgeTypes);

      for (const edge of edgesToExplore) {
        const nextNodeId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
        if (!visitedNodeIds.has(nextNodeId)) {
          if (!visitedEdges.some(e => e.id === edge.id)) {
            visitedEdges.push(edge);
          }
          queue.push({
            nodeId: nextNodeId,
            currentDepth: currentDepth + 1,
            pathNodeIds: [...pathNodeIds, nextNodeId],
            pathEdgeIds: [...pathEdgeIds, edge.id]
          });
        }
      }
    }

    return {
      visitedNodeIds: Array.from(visitedNodeIds),
      nodes: visitedNodes,
      edges: visitedEdges,
      paths
    };
  }

  /**
   * DEPTH FIRST SEARCH (DFS)
   */
  public static async dfs(options: GraphTraversalOptions): Promise<GraphTraversalResult> {
    const storage = GraphStorageManager.getActiveBackend();
    const maxDepth = options.maxDepth ?? 3;
    const direction = options.direction || "OUTGOING";

    const visitedNodeIds = new Set<string>();
    const visitedNodes: GraphNode[] = [];
    const visitedEdges: GraphEdge[] = [];
    const paths: GraphPath[] = [];

    const stack: { nodeId: string; currentDepth: number; pathNodeIds: string[]; pathEdgeIds: string[] }[] = [
      { nodeId: options.startNodeId, currentDepth: 0, pathNodeIds: [options.startNodeId], pathEdgeIds: [] }
    ];

    while (stack.length > 0) {
      const { nodeId, currentDepth, pathNodeIds, pathEdgeIds } = stack.pop()!;
      if (visitedNodeIds.has(nodeId)) continue;

      const node = await storage.getNode(nodeId);
      if (!node) continue;

      if (options.allowedNodeTypes && !options.allowedNodeTypes.includes(node.nodeType) && nodeId !== options.startNodeId) {
        continue;
      }

      visitedNodeIds.add(nodeId);
      visitedNodes.push(node);

      if (pathEdgeIds.length > 0) {
        paths.push({
          nodeIds: pathNodeIds,
          edgeIds: pathEdgeIds,
          length: pathEdgeIds.length
        });
      }

      if (currentDepth >= maxDepth) continue;

      const edgesToExplore = await this.getAdjacentEdges(nodeId, direction, options.allowedEdgeTypes);

      for (const edge of edgesToExplore) {
        const nextNodeId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
        if (!visitedNodeIds.has(nextNodeId)) {
          if (!visitedEdges.some(e => e.id === edge.id)) {
            visitedEdges.push(edge);
          }
          stack.push({
            nodeId: nextNodeId,
            currentDepth: currentDepth + 1,
            pathNodeIds: [...pathNodeIds, nextNodeId],
            pathEdgeIds: [...pathEdgeIds, edge.id]
          });
        }
      }
    }

    return {
      visitedNodeIds: Array.from(visitedNodeIds),
      nodes: visitedNodes,
      edges: visitedEdges,
      paths
    };
  }

  /**
   * SHORTEST PATH (BFS-based for unweighted/weighted graph)
   */
  public static async findShortestPath(
    startNodeId: string,
    targetNodeId: string,
    allowedEdgeTypes?: GraphEdgeType[]
  ): Promise<GraphPath | null> {
    const storage = GraphStorageManager.getActiveBackend();
    const queue: { nodeId: string; pathNodeIds: string[]; pathEdgeIds: string[] }[] = [
      { nodeId: startNodeId, pathNodeIds: [startNodeId], pathEdgeIds: [] }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, pathNodeIds, pathEdgeIds } = queue.shift()!;
      if (nodeId === targetNodeId) {
        return {
          nodeIds: pathNodeIds,
          edgeIds: pathEdgeIds,
          length: pathEdgeIds.length
        };
      }

      visited.add(nodeId);

      const edges = await this.getAdjacentEdges(nodeId, "OUTGOING", allowedEdgeTypes);
      for (const edge of edges) {
        const nextNodeId = edge.targetNodeId;
        if (!visited.has(nextNodeId)) {
          queue.push({
            nodeId: nextNodeId,
            pathNodeIds: [...pathNodeIds, nextNodeId],
            pathEdgeIds: [...pathEdgeIds, edge.id]
          });
        }
      }
    }

    return null;
  }

  /**
   * MULTI-HOP TRAVERSAL
   */
  public static async multiHop(startNodeId: string, hops: number): Promise<GraphTraversalResult> {
    return this.bfs({
      startNodeId,
      maxDepth: hops,
      direction: "BOTH"
    });
  }

  /**
   * NEIGHBOUR SEARCH (Direct 1-hop neighbours)
   */
  public static async getNeighbours(
    nodeId: string,
    allowedNodeTypes?: GraphNodeType[]
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const storage = GraphStorageManager.getActiveBackend();
    const outgoing = await storage.getOutgoingEdges(nodeId);
    const incoming = await storage.getIncomingEdges(nodeId);
    const allEdges = [...outgoing, ...incoming];

    const neighbourNodes: GraphNode[] = [];
    const neighbourEdges: GraphEdge[] = [];
    const seenNodeIds = new Set<string>([nodeId]);

    for (const edge of allEdges) {
      const targetId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
      if (!seenNodeIds.has(targetId)) {
        seenNodeIds.add(targetId);
        const node = await storage.getNode(targetId);
        if (node) {
          if (!allowedNodeTypes || allowedNodeTypes.includes(node.nodeType)) {
            neighbourNodes.push(node);
            neighbourEdges.push(edge);
          }
        }
      }
    }

    return { nodes: neighbourNodes, edges: neighbourEdges };
  }

  /**
   * SUBGRAPH EXTRACTION around a node set or query
   */
  public static async extractSubgraph(
    seedNodeIds: string[],
    depth: number = 2
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const storage = GraphStorageManager.getActiveBackend();
    const collectedNodes: Map<string, GraphNode> = new Map();
    const collectedEdges: Map<string, GraphEdge> = new Map();

    for (const seedId of seedNodeIds) {
      const res = await this.bfs({ startNodeId: seedId, maxDepth: depth, direction: "BOTH" });
      for (const node of res.nodes) collectedNodes.set(node.id, node);
      for (const edge of res.edges) collectedEdges.set(edge.id, edge);
    }

    return {
      nodes: Array.from(collectedNodes.values()),
      edges: Array.from(collectedEdges.values())
    };
  }

  private static async getAdjacentEdges(
    nodeId: string,
    direction: "OUTGOING" | "INCOMING" | "BOTH",
    allowedEdgeTypes?: GraphEdgeType[]
  ): Promise<GraphEdge[]> {
    const storage = GraphStorageManager.getActiveBackend();
    let edges: GraphEdge[] = [];

    if (direction === "OUTGOING" || direction === "BOTH") {
      const out = await storage.getOutgoingEdges(nodeId);
      edges.push(...out);
    }

    if (direction === "INCOMING" || direction === "BOTH") {
      const inc = await storage.getIncomingEdges(nodeId);
      edges.push(...inc);
    }

    if (allowedEdgeTypes && allowedEdgeTypes.length > 0) {
      edges = edges.filter(e => allowedEdgeTypes.includes(e.edgeType));
    }

    return edges;
  }
}
