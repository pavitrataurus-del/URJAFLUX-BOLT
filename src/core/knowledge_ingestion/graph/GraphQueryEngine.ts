// ============================================================================
// GRAPH QUERY ENGINE (PHASE 4)
// High-Level Domain Graph Queries
// ============================================================================

import { 
  GraphEdge, 
  GraphNode, 
  GraphQueryResult 
} from "../types/graphKnowledge";
import { GraphStorageManager } from "./GraphStorageManager";
import { GraphTraversalEngine } from "./GraphTraversalEngine";

export class GraphQueryEngine {
  /**
   * FIND NODE BY ID, LABEL OR SEMANTIC OBJECT ID
   */
  public static async findNode(query: string): Promise<GraphQueryResult> {
    const storage = GraphStorageManager.getActiveBackend();
    const allNodes = await storage.getAllNodes();

    const cleanQuery = query.toLowerCase().trim();
    const matchingNodes = allNodes.filter(n => 
      n.id.toLowerCase().includes(cleanQuery) ||
      n.label.toLowerCase().includes(cleanQuery) ||
      n.semanticObjectId.toLowerCase().includes(cleanQuery) ||
      n.documentId.toLowerCase().includes(cleanQuery)
    );

    return {
      queryType: "FIND_NODE",
      nodes: matchingNodes,
      edges: [],
      metadata: { matchCount: matchingNodes.length, query }
    };
  }

  /**
   * FIND RELATED CONCEPTS
   */
  public static async findRelatedConcepts(nodeId: string, maxDepth: number = 2): Promise<GraphQueryResult> {
    const traversal = await GraphTraversalEngine.bfs({
      startNodeId: nodeId,
      maxDepth,
      allowedNodeTypes: ["CONCEPT", "DYNAMIC_CONCEPT", "DIRECTION", "ROOM", "ELEMENT", "SYMBOL", "NUMBER", "PLANET"],
      direction: "BOTH"
    });

    return {
      queryType: "FIND_RELATED_CONCEPTS",
      nodes: traversal.nodes,
      edges: traversal.edges,
      metadata: { totalFound: traversal.nodes.length, startNodeId: nodeId }
    };
  }

  /**
   * FIND SUPPORTING RULES
   */
  public static async findSupportingRules(nodeId: string): Promise<GraphQueryResult> {
    const storage = GraphStorageManager.getActiveBackend();
    const outgoing = await storage.getOutgoingEdges(nodeId);
    const incoming = await storage.getIncomingEdges(nodeId);

    const supportingEdges = [...outgoing, ...incoming].filter(e => e.edgeType === "SUPPORTS");
    const ruleNodes: GraphNode[] = [];

    for (const edge of supportingEdges) {
      const targetId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
      const node = await storage.getNode(targetId);
      if (node && (node.nodeType === "RULE" || node.nodeType === "EXCEPTION")) {
        ruleNodes.push(node);
      }
    }

    return {
      queryType: "FIND_SUPPORTING_RULES",
      nodes: ruleNodes,
      edges: supportingEdges,
      metadata: { supportingRuleCount: ruleNodes.length, startNodeId: nodeId }
    };
  }

  /**
   * FIND CONTRADICTING / CONFLICTION RULES
   */
  public static async findContradictingRules(nodeId: string): Promise<GraphQueryResult> {
    const storage = GraphStorageManager.getActiveBackend();
    const outgoing = await storage.getOutgoingEdges(nodeId);
    const incoming = await storage.getIncomingEdges(nodeId);

    const conflictEdges = [...outgoing, ...incoming].filter(e => e.edgeType === "CONFLICTS_WITH");
    const conflictingNodes: GraphNode[] = [];

    for (const edge of conflictEdges) {
      const targetId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
      const node = await storage.getNode(targetId);
      if (node) {
        conflictingNodes.push(node);
      }
    }

    return {
      queryType: "FIND_CONTRADICTING_RULES",
      nodes: conflictingNodes,
      edges: conflictEdges,
      metadata: { conflictingCount: conflictingNodes.length, startNodeId: nodeId }
    };
  }

  /**
   * FIND CROSS-DOMAIN CONNECTIONS
   */
  public static async findCrossDomainConnections(domainOrNodeId?: string): Promise<GraphQueryResult> {
    const storage = GraphStorageManager.getActiveBackend();
    const allEdges = await storage.getAllEdges();

    const crossDomainEdges = allEdges.filter(e => e.edgeType === "CROSS_DOMAIN_LINK");
    const matchedNodeIds = new Set<string>();
    const matchedEdges: GraphEdge[] = [];

    for (const edge of crossDomainEdges) {
      if (!domainOrNodeId || edge.sourceNodeId.includes(domainOrNodeId) || edge.targetNodeId.includes(domainOrNodeId)) {
        matchedEdges.push(edge);
        matchedNodeIds.add(edge.sourceNodeId);
        matchedNodeIds.add(edge.targetNodeId);
      }
    }

    const matchedNodes: GraphNode[] = [];
    for (const id of matchedNodeIds) {
      const node = await storage.getNode(id);
      if (node) matchedNodes.push(node);
    }

    return {
      queryType: "FIND_CROSS_DOMAIN_CONNECTIONS",
      nodes: matchedNodes,
      edges: matchedEdges,
      metadata: { edgeCount: matchedEdges.length, filter: domainOrNodeId || "ALL" }
    };
  }

  /**
   * FIND REMEDIES
   */
  public static async findRemedies(afflictedNodeIdOrDirection: string): Promise<GraphQueryResult> {
    const storage = GraphStorageManager.getActiveBackend();
    const allNodes = await storage.getAllNodes();
    const allEdges = await storage.getAllEdges();

    const cleanQuery = afflictedNodeIdOrDirection.toLowerCase().trim();

    // Find remedy nodes directly or via REMEDIED_BY edge
    const remedyEdges = allEdges.filter(e => e.edgeType === "REMEDIED_BY");
    const matchedRemedyNodes: GraphNode[] = [];
    const matchedEdges: GraphEdge[] = [];

    for (const edge of remedyEdges) {
      if (edge.sourceNodeId.toLowerCase().includes(cleanQuery) || edge.targetNodeId.toLowerCase().includes(cleanQuery)) {
        matchedEdges.push(edge);
        const node = await storage.getNode(edge.targetNodeId);
        if (node) matchedRemedyNodes.push(node);
      }
    }

    // Also look up nodes of type "REMEDY" directly matching the query
    const directRemedies = allNodes.filter(n => n.nodeType === "REMEDY" && (
      n.label.toLowerCase().includes(cleanQuery) ||
      n.id.toLowerCase().includes(cleanQuery)
    ));

    for (const direct of directRemedies) {
      if (!matchedRemedyNodes.some(m => m.id === direct.id)) {
        matchedRemedyNodes.push(direct);
      }
    }

    return {
      queryType: "FIND_REMEDIES",
      nodes: matchedRemedyNodes,
      edges: matchedEdges,
      metadata: { remedyCount: matchedRemedyNodes.length, query: afflictedNodeIdOrDirection }
    };
  }

  /**
   * FIND FORMULA DEPENDENCIES
   */
  public static async findFormulaDependencies(formulaNodeId: string): Promise<GraphQueryResult> {
    const storage = GraphStorageManager.getActiveBackend();
    const outgoing = await storage.getOutgoingEdges(formulaNodeId);
    const incoming = await storage.getIncomingEdges(formulaNodeId);

    const depEdges = [...outgoing, ...incoming].filter(e => 
      e.edgeType === "DEPENDS_ON" || e.edgeType === "REQUIRES" || e.edgeType === "DERIVED_FROM"
    );

    const depNodes: GraphNode[] = [];

    for (const edge of depEdges) {
      const targetId = edge.sourceNodeId === formulaNodeId ? edge.targetNodeId : edge.sourceNodeId;
      const node = await storage.getNode(targetId);
      if (node) depNodes.push(node);
    }

    return {
      queryType: "FIND_FORMULA_DEPENDENCIES",
      nodes: depNodes,
      edges: depEdges,
      metadata: { dependencyCount: depNodes.length, formulaNodeId }
    };
  }
}
