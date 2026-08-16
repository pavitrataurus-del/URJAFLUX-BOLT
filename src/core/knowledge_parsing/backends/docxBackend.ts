import { IDocxParserBackend } from '../types/backend.types';
import { DocumentMetadata, DocumentStructure } from '../types/document.types';
import { ParserConfig, ParserCapabilities } from '../types/parser.types';

export class DefaultDocxParserBackend implements IDocxParserBackend {
  readonly backendId = 'DOCX_ZIP_INSPECTION_BACKEND';
  readonly backendVersion = '1.0.0';
  readonly docxEngineName = 'Docx ZIP Container Inspector';
  readonly isAvailable = true;

  readonly capabilities: ParserCapabilities = {
    supportedExtensions: ['docx'],
    hasTextExtraction: false,
    hasMetadataExtraction: true,
    hasTableExtraction: false,
    hasImageExtraction: false,
    hasBookmarkExtraction: false,
    hasFootnoteExtraction: false,
    hasCrossReferenceExtraction: false,
    hasLanguageDetection: false,
    hasEncryptedDocumentHandling: false
  };

  public async extractMetadata(file: File | Uint8Array, fileName: string): Promise<DocumentMetadata> {
    const size = file instanceof File ? file.size : file.byteLength;

    return {
      title: fileName.replace(/\.docx$/i, ''),
      fileSize: size,
      extension: 'docx',
      creationDate: Date.now()
    };
  }

  public async extractStructure(_file: File | Uint8Array, _config: ParserConfig): Promise<DocumentStructure> {
    // Return clean structure without synthetic placeholder strings
    return {
      chapters: [],
      unassignedSections: [],
      pages: []
    };
  }
}
