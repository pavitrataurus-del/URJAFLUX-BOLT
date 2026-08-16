// ============================================================================
// CITATION ENGINE (PHASE 2B)
// Traces every semantic element back to exact location in classical treatise
// ============================================================================

import { SourceCitation, KnowledgeProvenance } from "../../../types/semanticKnowledge";
import { DocumentParagraph } from "../../../types/documentStructure";

export class CitationEngine {
  /**
   * Generates a complete SourceCitation object for a given paragraph and metadata context.
   */
  public static createCitation(
    paragraph: DocumentParagraph,
    chapterTitle: string,
    sectionTitle: string,
    documentTitle: string,
    author: string
  ): SourceCitation {
    const docId = paragraph.documentId;
    const pId = paragraph.paragraphId || paragraph.id;
    const pageNum = paragraph.pageNumber || 1;

    const rawCitationText = `${documentTitle}, Chapter "${chapterTitle}", Section "${sectionTitle}", Para ${pId} (p. ${pageNum})`;
    const formattedCitation = `[${author}, ${documentTitle} - Ch. ${paragraph.chapterId}, Sec. ${paragraph.sectionId}, p. ${pageNum}]`;

    const citation: SourceCitation = {
      documentId: docId,
      sourceDocument: documentTitle,
      chapterId: paragraph.chapterId,
      chapterTitle,
      sectionId: paragraph.sectionId,
      sectionTitle,
      paragraphId: pId,
      pageNumber: pageNum,
      rawCitationText,
      formattedCitation
    };

    if (paragraph.subSectionId) {
      citation.subSectionId = paragraph.subSectionId;
    }

    return citation;
  }

  /**
   * Generates complete KnowledgeProvenance object for LOCK 31 compliance.
   */
  public static createProvenance(
    citation: SourceCitation,
    author: string,
    ocrConfidence: number = 100.0,
    administrator: string = "System Ingestion Engine"
  ): KnowledgeProvenance {
    const prov: KnowledgeProvenance = {
      documentId: citation.documentId,
      documentVersion: 1,
      edition: "Canonical Treatise Edition",
      author: author || "Vastu Rishi",
      publisher: "Knowledge Brain Vault",
      uploadDate: new Date().toISOString(),
      administrator,
      knowledgeDomain: "VASTU_SHASTRA",
      language: "en/sa",
      chapterId: citation.chapterId,
      chapterTitle: citation.chapterTitle,
      sectionId: citation.sectionId,
      sectionTitle: citation.sectionTitle,
      paragraphId: citation.paragraphId,
      pageNumber: citation.pageNumber,
      citation: citation.formattedCitation,
      ocrConfidence,
      sourceConfidence: 99.5
    };

    if (citation.subSectionId) {
      prov.subSectionId = citation.subSectionId;
    }

    return prov;
  }
}
