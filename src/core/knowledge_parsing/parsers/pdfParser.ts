import { BaseDocumentParser } from './baseParser';
import { ParserCapabilities } from '../types/parser.types';
import { DefaultPdfParserBackend } from '../backends/pdfBackend';

export class PdfDocumentParser extends BaseDocumentParser {
  readonly parserId = 'PDF_PARSER_ENTERPRISE';
  readonly parserVersion = '1.0.0-build017b.1';
  protected readonly backend = new DefaultPdfParserBackend();

  readonly capabilities: ParserCapabilities = this.backend.capabilities;

  public async validate(file: File | Uint8Array): Promise<boolean> {
    try {
      let header: Uint8Array;
      if (file instanceof File) {
        const slice = file.slice(0, 8);
        const buffer = await slice.arrayBuffer();
        header = new Uint8Array(buffer);
      } else {
        header = file.subarray(0, 8);
      }

      // Check %PDF- magic bytes
      const headerString = String.fromCharCode.apply(null, Array.from(header.subarray(0, 5)));
      return headerString === '%PDF-';
    } catch {
      return false;
    }
  }
}
