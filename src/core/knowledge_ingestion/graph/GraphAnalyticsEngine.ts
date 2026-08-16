// ============================================================================
// GRAPH ANALYTICS ENGINE (PHASE 4)
// Administrator metrics: Total Nodes, Edges, Connected Components, Orphan Nodes, Graph Density, Average Degree
// ============================================================================

import { AdminGraphAnalytics } from "../types/graphKnowledge";
import { GraphStorageManager } from "./GraphStorageManager";

export class GraphAnalyticsEngine {
  /**
   * Generates complete Admin Graph Analytics Report.
   */
  public static async getAnalytics(): Promise<AdminGraphAnalytics> {
    const storage = GraphStorageManager.getActiveBackend();
    const nodes = await storage.getAllNodes();
    const edges = await storage.getAllEdges();

    const totalNodes = nodes.length;
    const totalEdges = edges.length;

    // Node Type Distribution
    const nodeTypeDistribution: Record<string, number> = {};
    for (const node of nodes) {
      nodeTypeDistribution[node.nodeType] = (nodeTypeDistribution[node.nodeType] || 0) + 1;
    }

    // Relationship Distribution
    const relationshipDistribution: Record<string, number> = {};
    for (const edge of edges) {
      relationshipDistribution[edge.edgeType] = (relationshipDistribution[edge.edgeType] || 0) + 1;
    }

    // Degree calculation & Orphan nodes
    const nodeDegrees = new Map<string, number>();
    for (const node of nodes) nodeDegrees.set(node.id, 0);

    let brokenReferences = 0;
    const nodeIdsSet = new Set(nodes.map(n => n.id));

    for (const edge of edges) {
      let isBroken = false;
      if (nodeIdsSet.has(edge.sourceNodeId)) {
        nodeDegrees.set(edge.sourceNodeId, (nodeDegrees.get(edge.sourceNodeId) || 0) + 1);
      } else {
        isBroken = true;
      }

      if (nodeIdsSet.has(edge.targetNodeId)) {
        nodeDegrees.set(edge.targetNodeId, (nodeDegrees.get(edge.targetNodeId) || 0) + 1);
      } else {
        isBroken = true;
      }

      if (isBroken) brokenReferences++;
    }

    let orphanNodes = 0;
    for (const degree of nodeDegrees.values()) {
      if (degree === 0) orphanNodes++;
    }

    // Connected Components calculation (Undirected BFS)
    let connectedComponents = 0;
    const visited = new Set<string>();

    const adjacency = new Map<string, Set<string>>();
    for (const node of nodes) adjacency.set(node.id, new Set());
    for (const edge of edges) {
      if (adjacency.has(edge.sourceNodeId) && adjacency.has(edge.targetNodeId)) {
        adjacency.get(edge.sourceNodeId)!.add(edge.targetNodeId);
        adjacency.get(edge.targetNodeId)!.add(edge.sourceNodeId);
      }
    }

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        connectedComponents++;
        const queue = [node.id];
        while (queue.length > 0) {
          const curr = queue.shift()!;
          if (visited.has(curr)) continue;
          visited.add(curr);
          const neighbors = adjacency.get(curr);
          if (neighbors) {
            for (const neighbor of neighbors) {
              if (!visited.has(neighbor)) queue.push(neighbor);
            }
          }
        }
      }
    }

    // Graph Density: 2 * |E| / (|V| * (|V| - 1))
    const graphDensity = totalNodes > 1
      ? Math.round(((2 * totalEdges) / (totalNodes * (totalNodes - 1))) * 10000) / 10000
      : 0;

    // Average Degree: 2 * |E| / |V|
    const averageDegree = totalNodes > 0
      ? Math.round(((2 * totalEdges) / totalNodes) * 100) / 100
      : 0;

    return {
      totalNodes,
      totalEdges,
      connectedComponents,
      orphanNodes,
      brokenReferences,
      graphDensity,
      averageDegree,
      nodeTypeDistribution,
      relationshipDistribution,
      timestamp: new Date().toISOString()
    };
  }
}
