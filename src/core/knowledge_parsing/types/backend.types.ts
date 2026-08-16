import { DocumentMetadata, DocumentStructure } from './document.types';
import { ParserConfig, ParserCapabilities } from './parser.types';

export interface IParserBackend {
  readonly backendId: string;
  readonly backendVersion: string;
  readonly isAvailable: boolean;
  readonly capabilities: ParserCapabilities;

  initialize?(): Promise<void>;
  extractMetadata(file: File | Uint8Array, fileName: string): Promise<DocumentMetadata>;
  extractStructure(file: File | Uint8Array, config: ParserConfig): Promise<DocumentStructure>;
  dispose?(): Promise<void>;
}

export interface IPdfParserBackend extends IParserBackend {
  readonly pdfEngineName: string;
}

export interface IDocxParserBackend extends IParserBackend {
  readonly docxEngineName: string;
}

export interface IEpubParserBackend extends IParserBackend {
  readonly epubEngineName: string;
}

export interface IMarkdownParserBackend extends IParserBackend {
  readonly mdEngineName: string;
}

export interface ITxtParserBackend extends IParserBackend {
  readonly txtEngineName: string;
}
