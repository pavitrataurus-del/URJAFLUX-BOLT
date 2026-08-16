import { IMarkdownParserBackend } from '../types/backend.types';
import {
  DocumentMetadata,
  DocumentStructure,
  NodeType,
  SectionNode,
  ChapterNode,
  ParagraphNode,
  HeadingNode,
  TableNode,
  ImageReferenceNode,
  FootnoteNode,
  TableCell,
  PageNode
} from '../types/document.types';
import { ParserConfig, ParserCapabilities } from '../types/parser.types';

export class DefaultMarkdownParserBackend implements IMarkdownParserBackend {
  readonly backendId = 'MARKDOWN_NATIVE_BACKEND';
  readonly backendVersion = '1.0.0';
  readonly mdEngineName = 'Native Markdown AST Parser';
  readonly isAvailable = true;

  readonly capabilities: ParserCapabilities = {
    supportedExtensions: ['md'],
    hasTextExtraction: true,
    hasMetadataExtraction: true,
    hasTableExtraction: true,
    hasImageExtraction: true,
    hasBookmarkExtraction: false,
    hasFootnoteExtraction: true,
    hasCrossReferenceExtraction: true,
    hasLanguageDetection: false,
    hasEncryptedDocumentHandling: false
  };

  public async extractMetadata(file: File | Uint8Array, fileName: string): Promise<DocumentMetadata> {
    const text = await this.readAsText(file);
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const size = file instanceof File ? file.size : file.byteLength;

    const firstH1 = lines.find((l) => l.startsWith('# '));
    const title = firstH1 ? firstH1.replace(/^#\s+/, '') : fileName;
    const chapterCount = lines.filter((l) => /^#\s+/i.test(l)).length;

    return {
      title,
      chapterCount: chapterCount > 0 ? chapterCount : undefined,
      fileSize: size,
      extension: 'md',
      creationDate: Date.now()
    };
  }

  public async extractStructure(file: File | Uint8Array, _config: ParserConfig): Promise<DocumentStructure> {
    const rawText = await this.readAsText(file);
    const lines = rawText.split(/\r?\n/);

    const chapters: ChapterNode[] = [];
    const unassignedSections: SectionNode[] = [];

    let currentChapter: ChapterNode | null = null;
    let currentSection: SectionNode | null = null;
    let currentSectionNodes: (
      | ParagraphNode
      | HeadingNode
      | TableNode
      | ImageReferenceNode
      | FootnoteNode
    )[] = [];

    let chapterIndex = 0;
    let sectionIndex = 0;

    const commitCurrentSection = () => {
      if (!currentSection && currentSectionNodes.length === 0) return;

      const secTitle = currentSection ? currentSection.title : 'Overview';
      const level = currentSection ? currentSection.level : 1;

      const secNode: SectionNode = {
        id: `sec-${++sectionIndex}`,
        type: NodeType.SECTION,
        title: secTitle,
        level,
        orderIndex: sectionIndex,
        nodes: [...currentSectionNodes]
      };

      if (currentChapter) {
        currentChapter = {
          ...currentChapter,
          sections: [...currentChapter.sections, secNode]
        };
      } else {
        unassignedSections.push(secNode);
      }

      currentSection = null;
      currentSectionNodes = [];
    };

    const commitCurrentChapter = () => {
      commitCurrentSection();
      if (currentChapter) {
        chapters.push(currentChapter);
        currentChapter = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineIndex = i + 1;

      if (!line) continue;

      if (line.startsWith('# ')) {
        commitCurrentChapter();
        currentChapter = {
          id: `chap-${++chapterIndex}`,
          type: NodeType.CHAPTER,
          chapterNumber: chapterIndex,
          title: line.replace(/^#\s+/, ''),
          orderIndex: chapterIndex,
          sections: []
        };
        continue;
      }

      if (line.startsWith('## ') || line.startsWith('### ')) {
        commitCurrentSection();
        const level = line.startsWith('### ') ? 3 : 2;
        currentSection = {
          id: `sec-pending-${lineIndex}`,
          type: NodeType.SECTION,
          title: line.replace(/^#{2,3}\s+/, ''),
          level,
          orderIndex: lineIndex,
          nodes: []
        };
        continue;
      }

      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        currentSectionNodes.push({
          id: `img-${lineIndex}`,
          type: NodeType.IMAGE_REF,
          imageId: imgMatch[2],
          altText: imgMatch[1],
          orderIndex: lineIndex,
          sourceLocation: { lineIndex }
        });
        continue;
      }

      const footnoteMatch = line.match(/^\[\^([^\]]+)\]:\s*(.*)/);
      if (footnoteMatch) {
        currentSectionNodes.push({
          id: `fn-${lineIndex}`,
          type: NodeType.FOOTNOTE,
          symbol: footnoteMatch[1],
          text: footnoteMatch[2],
          orderIndex: lineIndex,
          sourceLocation: { lineIndex }
        });
        continue;
      }

      if (line.startsWith('|') && line.endsWith('|')) {
        const tableLines: string[] = [];
        let j = i;
        while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
          tableLines.push(lines[j].trim());
          j++;
        }
        i = j - 1;

        const cells: TableCell[] = [];
        let rowCount = 0;
        let colCount = 0;

        tableLines.forEach((tline) => {
          if (/^\|[\s-:]+\|/.test(tline)) return;

          const rawCols = tline.split('|').slice(1, -1).map((c) => c.trim());
          colCount = Math.max(colCount, rawCols.length);
          rawCols.forEach((cellText, cIdx) => {
            cells.push({
              rowIndex: rowCount,
              colIndex: cIdx,
              content: cellText,
              isHeader: rowCount === 0
            });
          });
          rowCount++;
        });

        currentSectionNodes.push({
          id: `table-${lineIndex}`,
          type: NodeType.TABLE,
          rowCount,
          colCount,
          cells,
          orderIndex: lineIndex,
          sourceLocation: { lineIndex }
        });
        continue;
      }

      currentSectionNodes.push({
        id: `p-${lineIndex}`,
        type: NodeType.PARAGRAPH,
        text: line,
        orderIndex: lineIndex,
        sourceLocation: { lineIndex }
      });
    }

    commitCurrentChapter();

    const pages: PageNode[] = [
      {
        id: 'page-1',
        type: NodeType.PAGE,
        pageNumber: 1,
        orderIndex: 1,
        nodes: []
      }
    ];

    return {
      chapters,
      unassignedSections,
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
