/**
 * Lightweight graph cleanup for document deletion.
 * Avoids importing the full GraphBuilder module (build pipeline deps) during vault delete.
 */

import { GraphNodeManager } from "./GraphNodeManager";
import { GraphEdgeManager } from "./GraphEdgeManager";
import { GraphStorageManager } from "./GraphStorageManager";

export async function deleteDocumentGraph(
  documentId: string
): Promise<{ nodesDeleted: number; edgesDeleted: number }> {
  const nodes = await GraphNodeManager.getNodesByDocument(documentId);
  const storage = GraphStorageManager.getActiveBackend();

  let nodesDeleted = 0;
  let edgesDeleted = 0;

  for (const node of nodes) {
    const outgoing = await storage.getOutgoingEdges(node.id);
    const incoming = await storage.getIncomingEdges(node.id);
    const edges = [...outgoing, ...incoming];

    for (const edge of edges) {
      if (typeof (storage as { deleteEdge?: (id: string) => Promise<void> }).deleteEdge === "function") {
        await (storage as { deleteEdge: (id: string) => Promise<void> }).deleteEdge(edge.id);
      }
      edgesDeleted += 1;
    }

    if (typeof (storage as { deleteNode?: (id: string) => Promise<void> }).deleteNode === "function") {
      await (storage as { deleteNode: (id: string) => Promise<void> }).deleteNode(node.id);
    }
    nodesDeleted += 1;
  }

  GraphNodeManager.removeDocumentFromIndex(documentId);

  return { nodesDeleted, edgesDeleted };
}

export async function deleteAllGraphs(): Promise<{ nodesDeleted: number; edgesDeleted: number }> {
  const storage = GraphStorageManager.getActiveBackend();
  const allNodes = await storage.getAllNodes();
  const allEdges = await storage.getAllEdges();
  const nodesDeleted = allNodes.length;
  const edgesDeleted = allEdges.length;

  await storage.clear();
  GraphNodeManager.clearIndexes();
  GraphEdgeManager.clearIndexes();

  return { nodesDeleted, edgesDeleted };
}
