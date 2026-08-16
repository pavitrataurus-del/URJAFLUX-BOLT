import { IPdfParserBackend } from '../types/backend.types';
import { DocumentMetadata, DocumentStructure, PageNode, NodeType, ParagraphNode } from '../types/document.types';
import { ParserConfig, ParserCapabilities } from '../types/parser.types';
import { SupportedFileExtension } from '../../knowledge_ingestion/types/ingestion.types';

export class DefaultPdfParserBackend implements IPdfParserBackend {
  readonly backendId = 'PDF_GEMINI_VISION_BACKEND';
  readonly backendVersion = '2.0.0';
  readonly pdfEngineName = 'Gemini Unified Vision Pipeline';
  readonly isAvailable = true;
  readonly capabilities: ParserCapabilities = {
    supportedExtensions: ['pdf'],
    hasTextExtraction: true,
    hasMetadataExtraction: true,
    hasTableExtraction: false,
    hasImageExtraction: false,
    hasBookmarkExtraction: false,
    hasFootnoteExtraction: false,
    hasCrossReferenceExtraction: false,
    hasLanguageDetection: true,
    hasEncryptedDocumentHandling: false
  };
  
  private convertToBase64(file: File | Uint8Array): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
         // Assuming Uint8Array
         let binary = '';
         for (let i = 0; i < file.length; i++) {
            binary += String.fromCharCode(file[i]);
         }
         resolve(btoa(binary));
      }
    });
  }

  public async extractMetadata(file: File | Uint8Array, fileName: string): Promise<DocumentMetadata> {
    const size = file instanceof File ? file.size : file.byteLength;
    
    return {
      title: fileName.replace(/\.[^/.]+$/, ""),
      fileSize: size,
      extension: 'pdf' as SupportedFileExtension,
      creationDate: Date.now()
    };
  }

  public async extractStructure(file: File | Uint8Array, config: ParserConfig): Promise<DocumentStructure> {
    const base64Data = await this.convertToBase64(file);
    const fileName = (file instanceof File) ? file.name : "document.pdf";
    const mimeType = "application/pdf";
    
    // Call our unified text pipeline endpoint
    const response = await fetch("/api/gemini/parse-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Data, mimeType, isScanned: true })
    });
    
    if (!response.ok) {
       throw new Error("Failed to parse document via AI OCR Pipeline.");
    }
    const data = await response.json();
    const text = data.text || "";
    
    const pagesRaw = text.split('[PAGE_BREAK]');
    const pages: PageNode[] = pagesRaw.map((pText: string, i: number) => {
      const pNode: ParagraphNode = {
        id: `P-${i}`,
        type: NodeType.PARAGRAPH,
        orderIndex: 0,
        text: pText.trim()
      };
      return {
        id: `PAGE-${i+1}`,
        type: NodeType.PAGE,
        orderIndex: i,
        pageNumber: i + 1,
        nodes: [pNode]
      };
    });

    return {
      chapters: [],
      unassignedSections: [],
      pages
    };
  }
}
