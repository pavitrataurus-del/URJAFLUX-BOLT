import { BaseDocumentParser } from './baseParser';
import { ParserCapabilities } from '../types/parser.types';
import { DefaultEpubParserBackend } from '../backends/epubBackend';

export class EpubDocumentParser extends BaseDocumentParser {
  readonly parserId = 'EPUB_PARSER_ENTERPRISE';
  readonly parserVersion = '1.0.0-build017b.1';
  protected readonly backend = new DefaultEpubParserBackend();

  readonly capabilities: ParserCapabilities = this.backend.capabilities;

  public async validate(file: File | Uint8Array): Promise<boolean> {
    try {
      let header: Uint8Array;
      if (file instanceof File) {
        const slice = file.slice(0, 4);
        const buffer = await slice.arrayBuffer();
        header = new Uint8Array(buffer);
      } else {
        header = file.subarray(0, 4);
      }

      // EPUB is a ZIP container; check PK magic bytes
      return (
        header[0] === 0x50 &&
        header[1] === 0x4b &&
        header[2] === 0x03 &&
        header[3] === 0x04
      );
    } catch {
      return false;
    }
  }
}
