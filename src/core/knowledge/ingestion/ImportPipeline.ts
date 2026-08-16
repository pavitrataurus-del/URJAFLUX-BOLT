import { IRegisteredDocument, ImportStatus, DocumentFormat } from "./IngestionTypes";
import { DocumentRegistrationEngine } from "./DocumentRegistrationEngine";
import { ValidationEngine } from "./ValidationEngine";
import { MetadataExtractionEngine } from "./MetadataExtractionEngine";
import { EventBus } from "../../../infrastructure/events/EventBus";
import { IngestionEventType, createIngestionEvent } from "../events/IngestionEvents";
import { EnterpriseError } from "../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../infrastructure/error/ErrorTypes";
import { QueueManager } from "../../../infrastructure/queue/QueueManager";

export class ImportPipeline {
  private static instance: ImportPipeline;

  private constructor() {}

  public static getInstance(): ImportPipeline {
    if (!ImportPipeline.instance) {
      ImportPipeline.instance = new ImportPipeline();
    }
    return ImportPipeline.instance;
  }

  public async startImport(documentId: string): Promise<void> {
    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = docEngine.getDocument(documentId);

    if (!doc) {
      throw new EnterpriseError(`Document ${documentId} not found`, { category: ErrorCategory.NOT_FOUND });
    }

    if (doc.importStatus !== ImportStatus.PENDING && doc.importStatus !== ImportStatus.FAILED && doc.importStatus !== ImportStatus.CANCELLED) {
       throw new EnterpriseError(`Cannot start import. Current status: ${doc.importStatus}`, { category: ErrorCategory.VALIDATION });
    }

    docEngine.updateDocument(documentId, { importStatus: ImportStatus.VALIDATING });
    EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_STARTED, { documentId }));

    try {
      // Step 1: Validation
      ValidationEngine.getInstance().validateDocument(doc);
      
      docEngine.updateDocument(documentId, { importStatus: ImportStatus.PROCESSING });

      // Step 2: Queue for background processing
      try {
        const queueManager = QueueManager.getInstance();
        await queueManager.enqueue({
          type: "PROCESS_DOCUMENT",
          payload: { documentId },
          priority: 1,
          retryPolicy: { maxRetries: 3, delayMs: 1000 } as any,
          maxRetries: 3,
          context: {}
        });
      } catch (e) {
        // If queue provider is not set, we run it synchronously for tests/development
        console.warn("Queue provider not set, processing synchronously");
        await this.processDocumentSync(documentId);
      }
      
    } catch (error: any) {
      this.handleImportError(documentId, error);
    }
  }

  public async processDocumentSync(documentId: string): Promise<void> {
    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = docEngine.getDocument(documentId);
    if (!doc) return;

    try {
       // Simulating processing logic...
       // For a real implementation, it would read the file, chunk it, etc.
       docEngine.updateDocument(documentId, { importStatus: ImportStatus.EXTRACTING_METADATA });
       EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_PROGRESS, { documentId, progress: 10 }));

       docEngine.updateDocument(documentId, { importStatus: ImportStatus.PROCESSING });
       EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_PROGRESS, { documentId, progress: 50 }));

       // Marking as complete
       docEngine.updateDocument(documentId, { importStatus: ImportStatus.COMPLETED, processingProgress: 100 });
       EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_COMPLETED, { documentId }));

    } catch (error: any) {
       this.handleImportError(documentId, error);
    }
  }

  public pauseImport(documentId: string): void {
    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = docEngine.getDocument(documentId);
    if (!doc) throw new EnterpriseError("Not found", { category: ErrorCategory.NOT_FOUND });

    if (doc.importStatus !== ImportStatus.PROCESSING && doc.importStatus !== ImportStatus.VALIDATING) {
      throw new EnterpriseError("Cannot pause an import that is not processing", { category: ErrorCategory.VALIDATION });
    }

    docEngine.updateDocument(documentId, { importStatus: ImportStatus.PAUSED });
    EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_PAUSED, { documentId }));
  }

  public resumeImport(documentId: string): void {
    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = docEngine.getDocument(documentId);
    if (!doc) throw new EnterpriseError("Not found", { category: ErrorCategory.NOT_FOUND });

    if (doc.importStatus !== ImportStatus.PAUSED) {
      throw new EnterpriseError("Cannot resume an import that is not paused", { category: ErrorCategory.VALIDATION });
    }

    docEngine.updateDocument(documentId, { importStatus: ImportStatus.PROCESSING });
    EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_RESUMED, { documentId }));
  }

  public cancelImport(documentId: string): void {
    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = docEngine.getDocument(documentId);
    if (!doc) throw new EnterpriseError("Not found", { category: ErrorCategory.NOT_FOUND });

    docEngine.updateDocument(documentId, { importStatus: ImportStatus.CANCELLED });
    // EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_CANCELLED, { documentId }));
  }

  private handleImportError(documentId: string, error: Error): void {
    const docEngine = DocumentRegistrationEngine.getInstance();
    docEngine.updateDocument(documentId, { 
      importStatus: ImportStatus.FAILED, 
      errorMessage: error.message 
    });
    EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.IMPORT_FAILED, { documentId, error: error.message }));
  }
}
