import { describe, it, expect } from "vitest";
import { ChunkingFramework } from "../ChunkingFramework";

describe("Chunking Framework", () => {
  it("should split content into correct number of chunks", () => {
    const framework = ChunkingFramework.getInstance();
    const content = "a".repeat(2500);
    
    const chunks = framework.chunkDocument("doc_1", content, {
      type: "CUSTOM",
      maxSize: 1000,
      overlap: 0
    });

    expect(chunks.length).toBe(3);
    expect(chunks[0].content.length).toBe(1000);
    expect(chunks[1].content.length).toBe(1000);
    expect(chunks[2].content.length).toBe(500);
  });

  it("should handle overlap correctly", () => {
    const framework = ChunkingFramework.getInstance();
    const content = "abcdefghij"; // 10 chars
    
    const chunks = framework.chunkDocument("doc_2", content, {
      type: "CUSTOM",
      maxSize: 4,
      overlap: 2
    });

    expect(chunks.length).toBe(5);
    expect(chunks[0].content).toBe("abcd");
    expect(chunks[1].content).toBe("cdef");
    expect(chunks[2].content).toBe("efgh");
    expect(chunks[3].content).toBe("ghij");
    expect(chunks[4].content).toBe("ij");
  });
});
