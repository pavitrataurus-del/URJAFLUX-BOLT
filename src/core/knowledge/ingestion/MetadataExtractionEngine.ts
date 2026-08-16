import { IDocumentMetadata, DocumentFormat } from "./IngestionTypes";
import { EventBus } from "../../../infrastructure/events/EventBus";
import { IngestionEventType, createIngestionEvent } from "../events/IngestionEvents";

export class MetadataExtractionEngine {
  private static instance: MetadataExtractionEngine;

  private constructor() {}

  public static getInstance(): MetadataExtractionEngine {
    if (!MetadataExtractionEngine.instance) {
      MetadataExtractionEngine.instance = new MetadataExtractionEngine();
    }
    return MetadataExtractionEngine.instance;
  }

  public extractMetadata(file: Buffer, format: DocumentFormat, namespaceId: string, sourceType: string): IDocumentMetadata {
    // In a real implementation, this would parse the file to extract metadata
    // For this engine, we mock the extraction logic based on the format and size

    const documentSize = file.length;
    let title = "Unknown Title";
    let author = "Unknown Author";

    if (format === DocumentFormat.PDF) {
      title = "Extracted PDF Title";
    }

    const metadata: IDocumentMetadata = {
      title,
      author,
      edition: "1.0",
      publisher: "System Extracted",
      language: "en",
      creationDate: new Date().toISOString(),
      modificationDate: new Date().toISOString(),
      namespaceId,
      sourceType,
      checksum: this.calculateChecksum(file),
      pageCount: Math.ceil(documentSize / 1024), // Mock calculation
      documentSize
    };

    EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.METADATA_EXTRACTED, { metadata }));
    
    return metadata;
  }

  private calculateChecksum(file: Buffer): string {
    // Mock checksum calculation
    return "chk_" + Math.random().toString(36).substring(2, 9);
  }
}
