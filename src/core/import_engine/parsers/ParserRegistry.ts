// URJAFLUX Enterprise Streaming Import Engine - Parser Registry & Factory

import { IDocumentParser } from "./IDocumentParser";
import { PdfDocumentParser } from "./PdfDocumentParser";
import { ImageDocumentParser } from "./ImageDocumentParser";
import { TextMarkdownParser } from "./TextMarkdownParser";
import { DocxDocumentParser, CsvXlsxDocumentParser, CadDxfDwgDocumentParser } from "./FutureParserStubs";

export class ParserRegistry {
  private static instance: ParserRegistry;
  private parsers: IDocumentParser[] = [];

  private constructor() {
    this.registerParser(new PdfDocumentParser());
    this.registerParser(new ImageDocumentParser());
    this.registerParser(new TextMarkdownParser());
    this.registerParser(new DocxDocumentParser());
    this.registerParser(new CsvXlsxDocumentParser());
    this.registerParser(new CadDxfDwgDocumentParser());
  }

  public static getInstance(): ParserRegistry {
    if (!ParserRegistry.instance) {
      ParserRegistry.instance = new ParserRegistry();
    }
    return ParserRegistry.instance;
  }

  public registerParser(parser: IDocumentParser): void {
    this.parsers.push(parser);
  }

  public resolveParser(fileName: string, mimeType?: string): IDocumentParser {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    // Search by extension first
    const byExt = this.parsers.find(p => p.supportedExtensions.includes(ext));
    if (byExt) return byExt;

    // Search by MIME type second
    if (mimeType) {
      const byMime = this.parsers.find(p => p.supportedMimeTypes.includes(mimeType));
      if (byMime) return byMime;
    }

    // Default fallback to PDF parser or Image parser depending on extension hint
    if (ext.includes("png") || ext.includes("jpg") || ext.includes("jpeg") || ext.includes("webp")) {
      return new ImageDocumentParser();
    }

    return new PdfDocumentParser();
  }
}
