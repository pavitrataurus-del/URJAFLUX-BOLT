import { IRegisteredDocument } from "./IngestionTypes";
import { DocumentRegistrationEngine } from "./DocumentRegistrationEngine";
import { EventBus } from "../../../infrastructure/events/EventBus";
import { IngestionEventType, createIngestionEvent } from "../events/IngestionEvents";
import { EnterpriseError } from "../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../infrastructure/error/ErrorTypes";

export interface IProcessingContext {
  documentId: string;
  checkpoint: number;
  totalSize: number;
}

export class LargeFileProcessor {
  private static instance: LargeFileProcessor;
  
  private constructor() {}
  
  public static getInstance(): LargeFileProcessor {
    if (!LargeFileProcessor.instance) {
      LargeFileProcessor.instance = new LargeFileProcessor();
    }
    return LargeFileProcessor.instance;
  }
  
  public async processStream(context: IProcessingContext, chunkHandler: (chunk: Buffer) => Promise<void>): Promise<void> {
    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = docEngine.getDocument(context.documentId);
    
    if (!doc) {
      throw new EnterpriseError(`Document ${context.documentId} not found`, { category: ErrorCategory.NOT_FOUND });
    }
    
    let processedSize = context.checkpoint;
    
    // Simulating a streaming process
    const simulatedChunkSize = 1024 * 1024; // 1MB chunks
    
    while (processedSize < context.totalSize) {
      // Check if paused or cancelled
      const currentDoc = docEngine.getDocument(context.documentId);
      if (currentDoc?.importStatus === "PAUSED") {
         docEngine.updateDocument(context.documentId, { checkpoint: processedSize.toString() });
         return; // Suspend processing
      }
      if (currentDoc?.importStatus === "CANCELLED" || currentDoc?.importStatus === "FAILED") {
         return; // Abort
      }
      
      const chunkSize = Math.min(simulatedChunkSize, context.totalSize - processedSize);
      const mockBuffer = Buffer.alloc(chunkSize);
      
      await chunkHandler(mockBuffer);
      processedSize += chunkSize;
      
      const progress = Math.floor((processedSize / context.totalSize) * 100);
      docEngine.updateDocument(context.documentId, { processingProgress: progress, checkpoint: processedSize.toString() });
      
      EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_PROGRESS, { 
         documentId: context.documentId, 
         progress 
      }));
    }
  }
}
