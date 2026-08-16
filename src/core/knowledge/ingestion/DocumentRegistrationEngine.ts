import { IRegisteredDocument, ImportStatus, DocumentFormat } from "./IngestionTypes";
import { ApprovalStatus } from "../namespace/NamespaceTypes";
import { EventBus } from "../../../infrastructure/events/EventBus";
import { IngestionEventType, createIngestionEvent } from "../events/IngestionEvents";
import { EnterpriseError } from "../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../infrastructure/error/ErrorTypes";

export class DocumentRegistrationEngine {
  private static instance: DocumentRegistrationEngine;
  private documents: Map<string, IRegisteredDocument> = new Map();

  private constructor() {}

  public static getInstance(): DocumentRegistrationEngine {
    if (!DocumentRegistrationEngine.instance) {
      DocumentRegistrationEngine.instance = new DocumentRegistrationEngine();
    }
    return DocumentRegistrationEngine.instance;
  }

  public registerDocument(doc: IRegisteredDocument): void {
    this.validateRegistration(doc);

    if (this.documents.has(doc.id)) {
      throw new EnterpriseError(`Document ${doc.id} already registered.`, { category: ErrorCategory.CONFLICT });
    }

    this.documents.set(doc.id, doc);
    EventBus.getInstance().publish(createIngestionEvent(IngestionEventType.DOCUMENT_REGISTERED, { documentId: doc.id }));
  }

  public getDocument(id: string): IRegisteredDocument | undefined {
    return this.documents.get(id);
  }

  public updateDocument(id: string, updates: Partial<IRegisteredDocument>): void {
    const doc = this.documents.get(id);
    if (!doc) {
      throw new EnterpriseError(`Document ${id} not found.`, { category: ErrorCategory.NOT_FOUND });
    }

    Object.assign(doc, updates);
    // Validation is omitted for updates for simplicity, but could be added
  }

  public listDocuments(): IRegisteredDocument[] {
    return Array.from(this.documents.values());
  }

  private validateRegistration(doc: IRegisteredDocument): void {
    if (!doc.id || !doc.fileId || !doc.version || !doc.format || !doc.metadata) {
      throw new EnterpriseError("Missing required document metadata.", { category: ErrorCategory.VALIDATION });
    }
    if (!doc.metadata.namespaceId) {
      throw new EnterpriseError("Namespace ID is required in metadata.", { category: ErrorCategory.VALIDATION });
    }
  }

  public clear(): void {
    this.documents.clear();
  }
}
