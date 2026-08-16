import { ISIGValidator, SIGValidationResult } from "./types";
import { SIGNode, SIGBaseEdge, SIGEntityType, SIGRelationshipType } from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * Concrete Validator for SIG (Spatial Intelligence Graph).
 * Enforces topological invariants, property schemas, and tenant boundaries.
 */
export class GraphValidator implements ISIGValidator {
  private allowedNodeTypes = new Set(Object.values(SIGEntityType));
  private allowedEdgeTypes = new Set(Object.values(SIGRelationshipType));

  /**
   * Validates a vertex (Node) structure.
   */
  public validateNode(node: SIGNode): SIGValidationResult {
    const errors: string[] = [];

    if (!node.id || typeof node.id !== "string" || node.id.trim() === "") {
      errors.push("Invalid Entity ID: must be a non-empty string.");
    }

    if (!node.type || !this.allowedNodeTypes.has(node.type)) {
      errors.push(`Invalid Entity Type: '${node.type}'.`);
    }

    if (!node.tenantId || typeof node.tenantId !== "string" || node.tenantId.trim() === "") {
      errors.push("Invalid Tenant ID: must be a non-empty string.");
    }

    if (typeof node.version !== "number" || node.version < 1) {
      errors.push("Invalid Version: must be a positive integer.");
    }

    if (!node.properties || typeof node.properties !== "object") {
      errors.push("Missing properties structure.");
    }

    if (!node.audit) {
      errors.push("Missing Audit Trail.");
    } else {
      const audit = node.audit;
      if (!audit.createdTimestamp || isNaN(Date.parse(audit.createdTimestamp))) {
        errors.push("Invalid createdTimestamp in audit trail.");
      }
      if (!audit.modifiedTimestamp || isNaN(Date.parse(audit.modifiedTimestamp))) {
        errors.push("Invalid modifiedTimestamp in audit trail.");
      }
      if (!audit.createdByUser) {
        errors.push("createdByUser is required in audit trail.");
      }
      if (!audit.modifiedByUser) {
        errors.push("modifiedByUser is required in audit trail.");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a directed Edge structure.
   */
  public validateEdge(edge: SIGBaseEdge, sourceNode: SIGNode, targetNode: SIGNode): SIGValidationResult {
    const errors: string[] = [];

    if (!edge.id || typeof edge.id !== "string" || edge.id.trim() === "") {
      errors.push("Invalid Edge ID: must be a non-empty string.");
    }

    if (!edge.type || !this.allowedEdgeTypes.has(edge.type)) {
      errors.push(`Invalid Edge Relationship Type: '${edge.type}'.`);
    }

    if (!edge.tenantId || typeof edge.tenantId !== "string" || edge.tenantId.trim() === "") {
      errors.push("Invalid Edge Tenant ID: must be a non-empty string.");
    }

    if (edge.tenantId !== sourceNode.tenantId || edge.tenantId !== targetNode.tenantId) {
      errors.push("Multi-tenant Violation: Edge tenantId must match source and target Node tenantIds.");
    }

    if (edge.sourceId !== sourceNode.id) {
      errors.push(`Edge sourceId mismatch: expected '${sourceNode.id}', found '${edge.sourceId}'.`);
    }

    if (edge.targetId !== targetNode.id) {
      errors.push(`Edge targetId mismatch: expected '${targetNode.id}', found '${edge.targetId}'.`);
    }

    if (typeof edge.weight !== "number" || edge.weight < 0.0 || edge.weight > 1.0) {
      errors.push(`Invalid Edge Weight: '${edge.weight}'. Must be a floating number between 0.0 and 1.0 inclusive.`);
    }

    if (!edge.properties || typeof edge.properties !== "object") {
      errors.push("Missing edge properties structure.");
    }

    if (!edge.audit) {
      errors.push("Missing edge Audit Trail.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Verifies that all given nodes and edges belong to the specified Tenant ID context.
   */
  public verifyMultiTenantConstraint(tenantId: TenantID, nodes: SIGNode[], edges: SIGBaseEdge[]): boolean {
    for (const node of nodes) {
      if (node.tenantId !== tenantId) {
        return false;
      }
    }
    for (const edge of edges) {
      if (edge.tenantId !== tenantId) {
        return false;
      }
    }
    return true;
  }

  /**
   * Detects if there is any directed cycle in the graph defined by nodes and edges using DFS.
   */
  public hasDirectedCycle(nodes: SIGNode[], edges: SIGBaseEdge[]): boolean {
    const adj = new Map<string, string[]>();
    for (const node of nodes) {
      adj.set(node.id, []);
    }
    for (const edge of edges) {
      if (adj.has(edge.sourceId)) {
        adj.get(edge.sourceId)!.push(edge.targetId);
      }
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  /**
   * Identifies any orphan nodes (nodes with 0 degrees - neither incoming nor outgoing edges)
   * in a graph containing more than one node.
   */
  public findOrphanNodes(nodes: SIGNode[], edges: SIGBaseEdge[]): SIGNode[] {
    if (nodes.length <= 1) return [];

    const activeNodeIds = new Set(nodes.map(n => n.id));
    const connectedNodeIds = new Set<string>();

    for (const edge of edges) {
      if (activeNodeIds.has(edge.sourceId) && activeNodeIds.has(edge.targetId)) {
        connectedNodeIds.add(edge.sourceId);
        connectedNodeIds.add(edge.targetId);
      }
    }

    return nodes.filter(node => !connectedNodeIds.has(node.id));
  }

  /**
   * Verifies that all Node IDs and Edge IDs are globally unique within the given arrays.
   */
  public verifyUniqueIds(nodes: SIGNode[], edges: SIGBaseEdge[]): boolean {
    const ids = new Set<string>();
    for (const node of nodes) {
      if (ids.has(node.id)) return false;
      ids.add(node.id);
    }
    for (const edge of edges) {
      if (ids.has(edge.id)) return false;
      ids.add(edge.id);
    }
    return true;
  }

  /**
   * Validates if a semantic relationship between two node types is logically permitted.
   */
  public isValidRelationship(type: SIGRelationshipType, sourceClass: SIGEntityType, targetClass: SIGEntityType): boolean {
    switch (type) {
      case SIGRelationshipType.CONTAINS:
        return sourceClass === SIGEntityType.FLOOR && targetClass === SIGEntityType.SPATIAL_KNOWLEDGE_OBJECT;

      case SIGRelationshipType.REFERENCES:
        return (sourceClass === SIGEntityType.SPATIAL_KNOWLEDGE_OBJECT && targetClass === SIGEntityType.RULE) ||
               (sourceClass === SIGEntityType.OBSERVATION && targetClass === SIGEntityType.SPATIAL_KNOWLEDGE_OBJECT);

      case SIGRelationshipType.HAS_EVIDENCE:
        return sourceClass === SIGEntityType.RULE && targetClass === SIGEntityType.EVIDENCE;

      case SIGRelationshipType.APPROVED:
        return sourceClass === SIGEntityType.CONSULTANT_DECISION && targetClass === SIGEntityType.OBSERVATION;

      case SIGRelationshipType.GENERATED:
        return sourceClass === SIGEntityType.CONSULTANT_DECISION && targetClass === SIGEntityType.RECOMMENDATION_CANDIDATE;

      default:
        return false;
    }
  }
}
