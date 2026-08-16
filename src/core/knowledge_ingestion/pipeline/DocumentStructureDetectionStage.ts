import { IngestionStage, PipelineStageContext } from "./stageTypes";
import { DocumentCleaningOutput } from "./DocumentCleaningStage";
import { 
  StructuredDocumentModel, 
  DocumentChapter, 
  DocumentSection, 
  DocumentSubSection, 
  DocumentParagraph, 
  DocumentTable, 
  DocumentFormula, 
  DocumentImageRef, 
  DocumentFootnote 
} from "../../../types/documentStructure";

export interface StructureDetectionResult {
  structuredModel: StructuredDocumentModel;
  detectedChaptersCount: number;
  detectedSectionsCount: number;
  detectedParagraphsCount: number;
  detectedTablesCount: number;
  detectedFormulaeCount: number;
  detectedImagesCount: number;
}

export class DocumentStructureDetectionStage implements IngestionStage<DocumentCleaningOutput, StructureDetectionResult> {
  readonly stageName = "DOCUMENT_STRUCTURE_DETECTION";

  async execute(input: DocumentCleaningOutput, context: PipelineStageContext): Promise<StructureDetectionResult> {
    const docId = context.documentId;
    const cleanText = input.cleanText;
    const lines = cleanText.split("\n");

    const chapters: DocumentChapter[] = [];
    const footnotes: DocumentFootnote[] = [];
    const headers: string[] = [];

    let currentChapter: DocumentChapter = {
      id: `${docId}-CH-01`,
      title: "Chapter I: General Principles",
      chapterNumber: 1,
      sections: []
    };

    let currentSection: DocumentSection = {
      id: `${docId}-SEC-01-01`,
      title: "1. Overview & Fundamentals",
      subSections: [],
      paragraphs: [],
      tables: [],
      formulae: [],
      images: []
    };

    let currentSubSection: DocumentSubSection = {
      id: `${docId}-SUB-01-01-01`,
      title: "1.1 Introduction",
      level: 2,
      paragraphs: [],
      tables: [],
      formulae: [],
      images: []
    };

    let currentPage = 1;
    let paragraphCounter = 0;
    let tableCounter = 0;
    let formulaCounter = 0;
    let imageCounter = 0;
    let chapterCounter = 1;
    let sectionCounter = 1;

    let paraBuffer: string[] = [];

    const flushParagraph = () => {
      if (paraBuffer.length === 0) return;
      const text = paraBuffer.join(" ").trim();
      paraBuffer = [];
      if (!text) return;

      paragraphCounter++;
      const pId = `${docId}-P-${paragraphCounter.toString().padStart(4, "0")}`;

      // Check if text is a formula
      const isFormula = /(=|Ayadi|Formula|Perimeter|Area|Brahmasthan|Degree|Width\*Length|Remainder|Modulo|\+|\*|\/)/i.test(text) && text.length < 300;
      if (isFormula && (text.includes("=") || text.includes("Ayadi") || text.includes("Formula"))) {
        formulaCounter++;
        currentSection.formulae.push({
          id: `${docId}-FORM-${formulaCounter}`,
          chapterId: currentChapter.id,
          sectionId: currentSection.id,
          pageNumber: currentPage,
          expression: text,
          formulaName: `Formula ${formulaCounter}`
        });
      }

      // Check if table row markdown
      if (text.startsWith("|") && text.endsWith("|")) {
        tableCounter++;
        currentSection.tables.push({
          id: `${docId}-TBL-${tableCounter}`,
          chapterId: currentChapter.id,
          sectionId: currentSection.id,
          pageNumber: currentPage,
          headers: ["Column 1", "Column 2"],
          rows: [[text]],
          rawMarkdown: text
        });
      }

      const paragraphObj: DocumentParagraph = {
        id: pId,
        documentId: docId,
        chapterId: currentChapter.id,
        sectionId: currentSection.id,
        paragraphId: `P-${paragraphCounter}`,
        pageNumber: currentPage,
        sourceDocument: context.fileName,
        rawText: text,
        cleanText: text
      };

      if (currentSubSection && currentSubSection.id) {
        paragraphObj.subSectionId = currentSubSection.id;
      }

      currentSubSection.paragraphs.push(paragraphObj);
      currentSection.paragraphs.push(paragraphObj);
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Page marker anchor check
      const pageMatch = line.match(/(?:---|\b)(?:PAGE|Page|\bP\.)\s*(\d+)(?:---|\b)/i);
      if (pageMatch) {
        flushParagraph();
        currentPage = parseInt(pageMatch[1], 10) || (currentPage + 1);
        continue;
      }

      // Footnote marker check
      const fnMatch = line.match(/^\[\*|\d+\]\s+(.*)/);
      if (fnMatch) {
        flushParagraph();
        footnotes.push({
          id: `${docId}-FN-${footnotes.length + 1}`,
          pageNumber: currentPage,
          marker: fnMatch[0].slice(0, 3),
          text: fnMatch[1] || line
        });
        continue;
      }

      // Chapter heading detection
      const isChapterLine = /^(CHAPTER|Chapter|ADHYAYA|Adhyaya|BOOK|Book)\s+([IVXLCDM\d]+)?/i.test(line);
      if (isChapterLine) {
        flushParagraph();

        if (currentSubSection.paragraphs.length > 0 || currentSection.paragraphs.length > 0) {
          currentSection.subSections.push(currentSubSection);
          currentChapter.sections.push(currentSection);
          chapters.push(currentChapter);
        }

        chapterCounter++;
        sectionCounter = 1;

        currentChapter = {
          id: `${docId}-CH-${chapterCounter.toString().padStart(2, "0")}`,
          title: line,
          chapterNumber: chapterCounter,
          sections: []
        };

        currentSection = {
          id: `${docId}-SEC-${chapterCounter.toString().padStart(2, "0")}-01`,
          title: `1. Overview`,
          subSections: [],
          paragraphs: [],
          tables: [],
          formulae: [],
          images: []
        };

        currentSubSection = {
          id: `${docId}-SUB-${chapterCounter.toString().padStart(2, "0")}-01-01`,
          title: "1.1 Section Content",
          level: 2,
          paragraphs: [],
          tables: [],
          formulae: [],
          images: []
        };
        headers.push(line);
        continue;
      }

      // Section heading detection
      const isSectionLine = /^(Section|\d+\.\d+|\b[A-Z\s]{4,30}\b:)/.test(line) && line.length < 80;
      if (isSectionLine) {
        flushParagraph();

        if (currentSubSection.paragraphs.length > 0) {
          currentSection.subSections.push(currentSubSection);
        }

        sectionCounter++;
        currentSection = {
          id: `${docId}-SEC-${chapterCounter.toString().padStart(2, "0")}-${sectionCounter.toString().padStart(2, "0")}`,
          title: line,
          subSections: [],
          paragraphs: [],
          tables: [],
          formulae: [],
          images: []
        };

        currentSubSection = {
          id: `${docId}-SUB-${chapterCounter.toString().padStart(2, "0")}-${sectionCounter.toString().padStart(2, "0")}-01`,
          title: line,
          level: 2,
          paragraphs: [],
          tables: [],
          formulae: [],
          images: []
        };
        continue;
      }

      // Empty line -> paragraph break
      if (line === "") {
        flushParagraph();
        // Increment page every 15 paragraphs if page markers aren't explicit
        if (paragraphCounter > 0 && paragraphCounter % 15 === 0) {
          currentPage++;
        }
      } else {
        paraBuffer.push(line);
      }
    }

    flushParagraph();

    if (currentSubSection.paragraphs.length > 0) {
      currentSection.subSections.push(currentSubSection);
    }
    if (currentSection.paragraphs.length > 0 || currentSection.subSections.length > 0) {
      currentChapter.sections.push(currentSection);
    }
    if (currentChapter.sections.length > 0) {
      chapters.push(currentChapter);
    }

    const structuredModel: StructuredDocumentModel = {
      documentId: docId,
      title: context.fileName.replace(/\.[^/.]+$/, ""),
      originalName: context.fileName,
      fileType: context.fileType,
      sizeBytes: context.fileSize,
      originalText: input.originalText,
      ocrText: input.ocrText,
      correctedOcrText: input.correctedOcrText,
      cleanText: input.cleanText,
      metadata: {
        category: context.category,
        language: "en/sa",
        ingestedAt: new Date().toISOString()
      },
      chapters,
      appendices: [],
      footnotes,
      headers
    };

    return {
      structuredModel,
      detectedChaptersCount: chapters.length,
      detectedSectionsCount: chapters.reduce((acc, c) => acc + c.sections.length, 0),
      detectedParagraphsCount: paragraphCounter,
      detectedTablesCount: tableCounter,
      detectedFormulaeCount: formulaCounter,
      detectedImagesCount: imageCounter
    };
  }
}
