import { IChunk, IChunkingStrategy } from "./IngestionTypes";
import { EventBus } from "../../../infrastructure/events/EventBus";
import { IngestionEventType, createIngestionEvent } from "../events/IngestionEvents";

export class ChunkingFramework {
  private static instance: ChunkingFramework;

  private constructor() {}

  public static getInstance(): ChunkingFramework {
    if (!ChunkingFramework.instance) {
      ChunkingFramework.instance = new ChunkingFramework();
    }
    return ChunkingFramework.instance;
  }

  public chunkDocument(documentId: string, content: string, strategy: IChunkingStrategy): IChunk[] {
    const chunks: IChunk[] = [];
    let currentIndex = 0;
    
    // Simplistic chunking based on size for demonstration
    // Real implementation would parse by paragraph, section, page, etc.
    const chunkSize = strategy.maxSize || 1000;
    const overlap = strategy.overlap || 0;

    let start = 0;
    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunkText = content.substring(start, end);
      
      const chunk: IChunk = {
        id: `${documentId}_chunk_${currentIndex}`,
        documentId,
        index: currentIndex,
        content: chunkText,
        startChar: start,
        endChar: end,
        metadata: {
          strategy: strategy.type
        }
      };

      chunks.push(chunk);
      EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.CHUNK_CREATED, { chunkId: chunk.id, documentId }));

      currentIndex++;
      start += (chunkSize - overlap);
      
      // Ensure we don't infinitely loop if overlap >= chunkSize
      if (chunkSize - overlap <= 0) {
        break;
      }
    }

    return chunks;
  }
}
