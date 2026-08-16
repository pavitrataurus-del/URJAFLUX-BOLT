import { ISIGTraversalEngine, ISIGRepository, ExtendedTraversalOptions, ShortestPathResult } from "./types";
import { 
  SIGNode, 
  SIGBaseEdge, 
  EntityID, 
  SIGTraversalOptions, 
  SIGGraphQueryResult 
} from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * Concrete Traversal Engine for multi-hop property graph lookups.
 * Supports Breadth-First Search (BFS), Depth-First Search (DFS), 
 * Shortest Path (Weighted Dijkstra & Unweighted), and Custom Multi-Hop Traversals.
 */
export class GraphTraversalEngine implements ISIGTraversalEngine {
  
  /**
   * Performs graph traversal starting from a pivot node.
   * Delegates to BFS or DFS depending on strategy configuration.
   */
  public async traverse(
    pivotId: EntityID,
    tenantId: TenantID,
    options: ExtendedTraversalOptions,
    repository: ISIGRepository
  ): Promise<SIGGraphQueryResult> {
    if (options.strategy === "DFS") {
      return this.traverseDFS(pivotId, tenantId, options, repository);
    }
    return this.traverseBFS(pivotId, tenantId, options, repository);
  }

  /**
   * Performs an iterative, high-performance Breadth-First Search (BFS) starting from a pivot node.
   */
  private async traverseBFS(
    pivotId: EntityID,
    tenantId: TenantID,
    options: SIGTraversalOptions,
    repository: ISIGRepository
  ): Promise<SIGGraphQueryResult> {
    const startTime = Date.now();

    const maxDepth = options.maxDepth !== undefined ? Math.min(options.maxDepth, 10) : 5;
    const direction = options.direction || "BOTH";

    // Set collections to track discovered nodes and edges to avoid cyclic infinite loops
    const visitedNodes: Map<EntityID, SIGNode> = new Map();
    const traversedEdges: Map<string, SIGBaseEdge> = new Map();

    // BFS Queue holds { nodeID, currentDepth }
    const queue: Array<{ id: EntityID; depth: number }> = [];

    // Initialize with pivot node
    const pivotNode = await repository.findNodeById(pivotId, tenantId);
    if (pivotNode) {
      visitedNodes.set(pivotId, pivotNode);
      queue.push({ id: pivotId, depth: 0 });
    }

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;

      // Conform to depth bound constraint
      if (depth >= maxDepth) {
        continue;
      }

      const nextEdges: SIGBaseEdge[] = [];

      // Look up outgoing edges
      if (direction === "OUTGOING" || direction === "BOTH") {
        const outEdges = await repository.findEdgesBySource(id, tenantId);
        nextEdges.push(...outEdges);
      }

      // Look up incoming edges
      if (direction === "INCOMING" || direction === "BOTH") {
        const inEdges = await repository.findEdgesByTarget(id, tenantId);
        nextEdges.push(...inEdges);
      }

      for (const edge of nextEdges) {
        // Apply edge-type filters if specified
        if (options.edgeTypes && options.edgeTypes.length > 0) {
          if (!options.edgeTypes.includes(edge.type)) {
            continue;
          }
        }

        const neighborId = edge.sourceId === id ? edge.targetId : edge.sourceId;

        // Fetch neighbor node
        const neighborNode = await repository.findNodeById(neighborId, tenantId);
        if (!neighborNode) {
          continue;
        }

        // Apply target-node-type filters if specified
        if (options.targetNodeTypes && options.targetNodeTypes.length > 0) {
          if (!options.targetNodeTypes.includes(neighborNode.type)) {
            continue;
          }
        }

        // Record the edge
        traversedEdges.set(edge.id, edge);

        // Queue neighbor if not already visited
        if (!visitedNodes.has(neighborId)) {
          visitedNodes.set(neighborId, neighborNode);
          queue.push({ id: neighborId, depth: depth + 1 });
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      nodes: Array.from(visitedNodes.values()),
      edges: Array.from(traversedEdges.values()),
      executionTimeMs,
    };
  }

  /**
   * Performs an iterative, high-performance Depth-First Search (DFS) starting from a pivot node.
   * Explores pathways as deep as possible before backtracking.
   */
  public async traverseDFS(
    pivotId: EntityID,
    tenantId: TenantID,
    options: SIGTraversalOptions,
    repository: ISIGRepository
  ): Promise<SIGGraphQueryResult> {
    const startTime = Date.now();

    const maxDepth = options.maxDepth !== undefined ? Math.min(options.maxDepth, 10) : 5;
    const direction = options.direction || "BOTH";

    const visitedNodes: Map<EntityID, SIGNode> = new Map();
    const traversedEdges: Map<string, SIGBaseEdge> = new Map();

    // DFS Stack holds { nodeID, currentDepth }
    const stack: Array<{ id: EntityID; depth: number }> = [];

    // Initialize with pivot node
    const pivotNode = await repository.findNodeById(pivotId, tenantId);
    if (pivotNode) {
      stack.push({ id: pivotId, depth: 0 });
    }

    while (stack.length > 0) {
      const { id, depth } = stack.pop()!;

      // Fetch node to ensure it is valid/active
      const node = await repository.findNodeById(id, tenantId);
      if (!node) continue;

      visitedNodes.set(id, node);

      // Conform to depth bound constraint
      if (depth >= maxDepth) {
        continue;
      }

      const nextEdges: SIGBaseEdge[] = [];

      // Look up outgoing edges
      if (direction === "OUTGOING" || direction === "BOTH") {
        const outEdges = await repository.findEdgesBySource(id, tenantId);
        nextEdges.push(...outEdges);
      }

      // Look up incoming edges
      if (direction === "INCOMING" || direction === "BOTH") {
        const inEdges = await repository.findEdgesByTarget(id, tenantId);
        nextEdges.push(...inEdges);
      }

      // Process in reverse to match traditional DFS order if pushed to stack
      for (let i = nextEdges.length - 1; i >= 0; i--) {
        const edge = nextEdges[i];

        // Apply edge-type filters if specified
        if (options.edgeTypes && options.edgeTypes.length > 0) {
          if (!options.edgeTypes.includes(edge.type)) {
            continue;
          }
        }

        const neighborId = edge.sourceId === id ? edge.targetId : edge.sourceId;

        // Fetch neighbor node to check its node type
        const neighborNode = await repository.findNodeById(neighborId, tenantId);
        if (!neighborNode) {
          continue;
        }

        // Apply target-node-type filters if specified
        if (options.targetNodeTypes && options.targetNodeTypes.length > 0) {
          if (!options.targetNodeTypes.includes(neighborNode.type)) {
            continue;
          }
        }

        traversedEdges.set(edge.id, edge);

        // Push to stack if not already visited (or visited at larger depth)
        if (!visitedNodes.has(neighborId)) {
          stack.push({ id: neighborId, depth: depth + 1 });
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      nodes: Array.from(visitedNodes.values()),
      edges: Array.from(traversedEdges.values()),
      executionTimeMs,
    };
  }

  /**
   * Finds the shortest path between a starting node and an ending node.
   * Supports both Weighted Dijkstra's Algorithm and Unweighted BFS-based search.
   */
  public async findShortestPath(
    startId: EntityID,
    endId: EntityID,
    tenantId: TenantID,
    weighted: boolean,
    repository: ISIGRepository
  ): Promise<ShortestPathResult> {
    const startTime = Date.now();

    // Verify existence of start and end nodes
    const startNode = await repository.findNodeById(startId, tenantId);
    const endNode = await repository.findNodeById(endId, tenantId);

    if (!startNode || !endNode) {
      return {
        pathExists: false,
        nodes: [],
        edges: [],
        totalWeight: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    if (startId === endId) {
      return {
        pathExists: true,
        nodes: [startNode],
        edges: [],
        totalWeight: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    if (weighted) {
      // -------------------------------------------------------------
      // WEIGHTED SHORTEST PATH (Dijkstra's Algorithm)
      // -------------------------------------------------------------
      const distances: Map<EntityID, number> = new Map();
      const previous: Map<EntityID, { nodeId: EntityID; edge: SIGBaseEdge }> = new Map();
      const unvisited: Set<EntityID> = new Set();

      distances.set(startId, 0);
      unvisited.add(startId);

      // Track discovered nodes in BFS/Dijkstra context to minimize map scans
      const discoveredNodes: Map<EntityID, SIGNode> = new Map();
      discoveredNodes.set(startId, startNode);

      while (unvisited.size > 0) {
        // Find unvisited node with smallest distance
        let currentId: EntityID | null = null;
        let minDistance = Infinity;

        for (const id of unvisited) {
          const d = distances.get(id) ?? Infinity;
          if (d < minDistance) {
            minDistance = d;
            currentId = id;
          }
        }

        if (currentId === null || currentId === endId) {
          break;
        }

        unvisited.delete(currentId);

        // Fetch adjacent relationships
        const outEdges = await repository.findEdgesBySource(currentId, tenantId);
        const inEdges = await repository.findEdgesByTarget(currentId, tenantId);
        const adjacent = [...outEdges, ...inEdges];

        for (const edge of adjacent) {
          const neighborId = edge.sourceId === currentId ? edge.targetId : edge.sourceId;
          const neighborNode = await repository.findNodeById(neighborId, tenantId);
          if (!neighborNode) continue;

          discoveredNodes.set(neighborId, neighborNode);

          // Weight serves as a distance factor. Defaults to 1.0 if not specified or invalid.
          const edgeCost = typeof edge.weight === "number" ? edge.weight : 1.0;
          const currentDist = distances.get(currentId) ?? Infinity;
          const alt = currentDist + edgeCost;

          const neighborDist = distances.get(neighborId) ?? Infinity;
          if (alt < neighborDist) {
            distances.set(neighborId, alt);
            previous.set(neighborId, { nodeId: currentId, edge });
            unvisited.add(neighborId);
          }
        }
      }

      const totalWeight = distances.get(endId) ?? Infinity;
      if (totalWeight === Infinity) {
        return {
          pathExists: false,
          nodes: [],
          edges: [],
          totalWeight: 0,
          executionTimeMs: Date.now() - startTime,
        };
      }

      // Reconstruct Path
      const pathNodes: SIGNode[] = [];
      const pathEdges: SIGBaseEdge[] = [];
      let stepId = endId;

      while (previous.has(stepId)) {
        const prev = previous.get(stepId)!;
        const node = discoveredNodes.get(stepId);
        if (node) pathNodes.unshift(node);
        pathEdges.unshift(prev.edge);
        stepId = prev.nodeId;
      }
      
      const firstNode = discoveredNodes.get(startId);
      if (firstNode) pathNodes.unshift(firstNode);

      return {
        pathExists: true,
        nodes: pathNodes,
        edges: pathEdges,
        totalWeight,
        executionTimeMs: Date.now() - startTime,
      };

    } else {
      // -------------------------------------------------------------
      // UNWEIGHTED SHORTEST PATH (BFS-Based Search)
      // -------------------------------------------------------------
      const queue: Array<{ id: EntityID; pathNodes: SIGNode[]; pathEdges: SIGBaseEdge[] }> = [];
      const visited: Set<EntityID> = new Set();

      queue.push({ id: startId, pathNodes: [startNode], pathEdges: [] });
      visited.add(startId);

      while (queue.length > 0) {
        const { id, pathNodes, pathEdges } = queue.shift()!;

        if (id === endId) {
          return {
            pathExists: true,
            nodes: pathNodes,
            edges: pathEdges,
            totalWeight: pathEdges.length, // Direct edge count as unweighted distance
            executionTimeMs: Date.now() - startTime,
          };
        }

        const outEdges = await repository.findEdgesBySource(id, tenantId);
        const inEdges = await repository.findEdgesByTarget(id, tenantId);
        const adjacent = [...outEdges, ...inEdges];

        for (const edge of adjacent) {
          const neighborId = edge.sourceId === id ? edge.targetId : edge.sourceId;
          if (!visited.has(neighborId)) {
            const neighborNode = await repository.findNodeById(neighborId, tenantId);
            if (!neighborNode) continue;

            visited.add(neighborId);
            queue.push({
              id: neighborId,
              pathNodes: [...pathNodes, neighborNode],
              pathEdges: [...pathEdges, edge],
            });
          }
        }
      }

      return {
        pathExists: false,
        nodes: [],
        edges: [],
        totalWeight: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Traverses exactly N hops outward from a central pivot node to extract connected structures.
   */
  public async traverseMultiHop(
    pivotId: EntityID,
    tenantId: TenantID,
    hops: number,
    repository: ISIGRepository
  ): Promise<SIGGraphQueryResult> {
    const options: SIGTraversalOptions = {
      direction: "BOTH",
      maxDepth: hops,
    };
    return this.traverseBFS(pivotId, tenantId, options, repository);
  }
}
