import { BaseDocumentParser } from './baseParser';
import { ParserCapabilities } from '../types/parser.types';
import { DefaultMarkdownParserBackend } from '../backends/markdownBackend';

export class MarkdownDocumentParser extends BaseDocumentParser {
  readonly parserId = 'MARKDOWN_PARSER_ENTERPRISE';
  readonly parserVersion = '1.0.0-build017b.1';
  protected readonly backend = new DefaultMarkdownParserBackend();

  readonly capabilities: ParserCapabilities = this.backend.capabilities;

  public async validate(file: File | Uint8Array): Promise<boolean> {
    try {
      const text = await this.readAsText(file);
      return typeof text === 'string';
    } catch {
      return false;
    }
  }
}
