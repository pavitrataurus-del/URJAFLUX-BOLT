import { describe, expect, it, beforeEach } from "vitest";
import { GraphNodeManager } from "../GraphNodeManager";
import { GraphStorageManager } from "../GraphStorageManager";
import { deleteDocumentGraph, deleteAllGraphs } from "../graphDocumentDeletion";

describe("graphDocumentDeletion", () => {
  beforeEach(async () => {
    await deleteAllGraphs();
  });

  it("deletes nodes and edges for a single document", async () => {
    await GraphNodeManager.createNode({
      label: "Kitchen Rule",
      nodeType: "CONCEPT",
      semanticObjectId: "SEM-1",
      documentId: "DOC-1",
      citation: { sourceBook: "Test", pageNumber: 1 },
      provenance: {
        documentId: "DOC-1",
        documentVersion: 1,
        author: "Test",
        uploadDate: new Date().toISOString(),
        administrator: "Admin",
        knowledgeDomain: "Vastu",
      },
    });

    await GraphNodeManager.createNode({
      label: "Bedroom Rule",
      nodeType: "CONCEPT",
      semanticObjectId: "SEM-2",
      documentId: "DOC-2",
      citation: { sourceBook: "Test", pageNumber: 2 },
      provenance: {
        documentId: "DOC-2",
        documentVersion: 1,
        author: "Test",
        uploadDate: new Date().toISOString(),
        administrator: "Admin",
        knowledgeDomain: "Vastu",
      },
    });

    const result = await deleteDocumentGraph("DOC-1");
    expect(result.nodesDeleted).toBe(1);

    const remaining = await GraphStorageManager.getActiveBackend().getAllNodes();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].documentId).toBe("DOC-2");
  });
});
