import { ITxtParserBackend } from '../types/backend.types';
import {
  DocumentMetadata,
  DocumentStructure,
  NodeType,
  SectionNode,
  PageNode,
  HeadingNode,
  ParagraphNode
} from '../types/document.types';
import { ParserConfig, ParserCapabilities } from '../types/parser.types';

export class DefaultTxtParserBackend implements ITxtParserBackend {
  readonly backendId = 'TXT_NATIVE_BACKEND';
  readonly backendVersion = '1.0.0';
  readonly txtEngineName = 'Native Text Stream Parser';
  readonly isAvailable = true;

  readonly capabilities: ParserCapabilities = {
    supportedExtensions: ['txt'],
    hasTextExtraction: true,
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
    const rawText = await this.readAsText(file);
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const size = file instanceof File ? file.size : file.byteLength;
    const title = lines.length > 0 && lines[0].length < 100 ? lines[0] : fileName;

    return {
      title,
      fileSize: size,
      extension: 'txt',
      creationDate: Date.now()
    };
  }

  public async extractStructure(file: File | Uint8Array, _config: ParserConfig): Promise<DocumentStructure> {
    const rawText = await this.readAsText(file);
    const lines = rawText.split(/\r?\n/);

    const nodes: (HeadingNode | ParagraphNode)[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const lineIndex = idx + 1;
      const isHeading =
        trimmed.length < 80 &&
        ((trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) ||
          /^(CHAPTER|SECTION|CHAPTER\s+\d+|SECTION\s+\d+)/i.test(trimmed));

      if (isHeading) {
        nodes.push({
          id: `line-${lineIndex}`,
          type: NodeType.HEADING,
          level: 2,
          text: trimmed,
          orderIndex: lineIndex,
          sourceLocation: {
            lineIndex,
            characterOffset: idx * 80
          }
        });
      } else {
        nodes.push({
          id: `line-${lineIndex}`,
          type: NodeType.PARAGRAPH,
          text: trimmed,
          orderIndex: lineIndex,
          sourceLocation: {
            lineIndex,
            characterOffset: idx * 80
          }
        });
      }
    });

    const section: SectionNode = {
      id: 'txt-sec-main',
      type: NodeType.SECTION,
      title: 'Main Text Content',
      level: 1,
      orderIndex: 1,
      nodes
    };

    const pages: PageNode[] = [
      {
        id: 'page-1',
        type: NodeType.PAGE,
        pageNumber: 1,
        orderIndex: 1,
        nodes
      }
    ];

    return {
      chapters: [],
      unassignedSections: [section],
      pages
    };
  }

  private async readAsText(file: File | Uint8Array): Promise<string> {
    if (file instanceof File) {
      return await file.text();
    }
    return new TextDecoder('utf-8').decode(file);
  }
}
