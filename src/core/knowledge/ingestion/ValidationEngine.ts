import { IRegisteredDocument, DocumentFormat, ImportStatus } from "./IngestionTypes";
import { KnowledgeNamespaceEngine } from "../namespace/KnowledgeNamespaceEngine";
import { EnterpriseError } from "../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../infrastructure/error/ErrorTypes";

export class ValidationEngine {
  private static instance: ValidationEngine;

  private constructor() {}

  public static getInstance(): ValidationEngine {
    if (!ValidationEngine.instance) {
      ValidationEngine.instance = new ValidationEngine();
    }
    return ValidationEngine.instance;
  }

  public validateDocument(doc: IRegisteredDocument): boolean {
    if (doc.format === DocumentFormat.UNKNOWN) {
      throw new EnterpriseError(`Unsupported format for document ${doc.id}`, { category: ErrorCategory.VALIDATION });
    }

    const nsEngine = KnowledgeNamespaceEngine.getInstance();
    const ns = nsEngine.getNamespace(doc.metadata.namespaceId);
    
    if (!ns) {
      throw new EnterpriseError(`Invalid namespace ${doc.metadata.namespaceId} for document ${doc.id}`, { category: ErrorCategory.VALIDATION });
    }

    if (!doc.metadata.checksum) {
      throw new EnterpriseError(`Missing checksum for document ${doc.id}`, { category: ErrorCategory.VALIDATION });
    }

    // Checking duplicates could be done here if we had access to all documents globally
    
    return true;
  }
}
