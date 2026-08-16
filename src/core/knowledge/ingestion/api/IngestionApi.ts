import { DocumentRegistrationEngine } from "../DocumentRegistrationEngine";
import { ImportPipeline } from "../ImportPipeline";
import { ValidationEngine } from "../ValidationEngine";
import { MetadataExtractionEngine } from "../MetadataExtractionEngine";
import { IRegisteredDocument, DocumentFormat, IDocumentMetadata } from "../IngestionTypes";

export class IngestionApi {
  private static instance: IngestionApi;

  private constructor() {}

  public static getInstance(): IngestionApi {
    if (!IngestionApi.instance) {
      IngestionApi.instance = new IngestionApi();
    }
    return IngestionApi.instance;
  }

  public registerDocument(doc: IRegisteredDocument): void {
    DocumentRegistrationEngine.getInstance().registerDocument(doc);
  }

  public getDocumentDetails(id: string): IRegisteredDocument | undefined {
    return DocumentRegistrationEngine.getInstance().getDocument(id);
  }

  public listDocuments(): IRegisteredDocument[] {
    return DocumentRegistrationEngine.getInstance().listDocuments();
  }

  public async startImport(documentId: string): Promise<void> {
    await ImportPipeline.getInstance().startImport(documentId);
  }

  public pauseImport(documentId: string): void {
    ImportPipeline.getInstance().pauseImport(documentId);
  }

  public resumeImport(documentId: string): void {
    ImportPipeline.getInstance().resumeImport(documentId);
  }

  public cancelImport(documentId: string): void {
    ImportPipeline.getInstance().cancelImport(documentId);
  }

  public getImportStatus(documentId: string): string | undefined {
    return DocumentRegistrationEngine.getInstance().getDocument(documentId)?.importStatus;
  }
  
  public extractMetadata(file: Buffer, format: DocumentFormat, namespaceId: string, sourceType: string): IDocumentMetadata {
    return MetadataExtractionEngine.getInstance().extractMetadata(file, format, namespaceId, sourceType);
  }
}
