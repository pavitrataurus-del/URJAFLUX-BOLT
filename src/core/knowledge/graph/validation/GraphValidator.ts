import { IKnowledgeGraph, IGraphNode, IGraphEdge } from "../models/GraphModels";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class GraphValidator {
  private static instance: GraphValidator;

  private constructor() {}

  public static getInstance(): GraphValidator {
    if (!GraphValidator.instance) {
      GraphValidator.instance = new GraphValidator();
    }
    return GraphValidator.instance;
  }

  public validateGraph(graph: IKnowledgeGraph): boolean {
    if (!graph.id) {
      throw new EnterpriseError("Graph ID is missing", { category: ErrorCategory.VALIDATION });
    }

    const nodeIds = new Set<string>();

    for (const node of graph.nodes) {
      if (nodeIds.has(node.id)) {
        throw new EnterpriseError(`Duplicate node detected: ${node.id}`, { category: ErrorCategory.VALIDATION });
      }
      nodeIds.add(node.id);

      if (!node.namespace) {
        throw new EnterpriseError(`Node ${node.id} has invalid namespace`, { category: ErrorCategory.VALIDATION });
      }
    }

    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.sourceId)) {
        throw new EnterpriseError(`Broken graph edge: source node ${edge.sourceId} not found`, { category: ErrorCategory.VALIDATION });
      }
      if (!nodeIds.has(edge.targetId)) {
        throw new EnterpriseError(`Broken graph edge: target node ${edge.targetId} not found`, { category: ErrorCategory.VALIDATION });
      }
      if (edge.sourceId === edge.targetId) {
        throw new EnterpriseError(`Circular reference detected on edge ${edge.id}: source and target are the same node`, { category: ErrorCategory.VALIDATION });
      }
    }

    for (const link of graph.evidenceLinks) {
      if (!link.knowledgeSource || !link.documentId || !link.checksum) {
        throw new EnterpriseError(`Evidence link ${link.id} is missing required provenance`, { category: ErrorCategory.VALIDATION });
      }
      const matchingEdge = graph.edges.find(e => e.id === link.edgeId);
      if (!matchingEdge) {
        throw new EnterpriseError(`Evidence link ${link.id} points to non-existent edge ${link.edgeId}`, { category: ErrorCategory.VALIDATION });
      }
    }

    return true;
  }
}
