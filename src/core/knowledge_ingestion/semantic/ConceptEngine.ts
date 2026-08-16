// ============================================================================
// CONCEPT ENGINE (PHASE 2B)
// Concept extraction for Brahmasthan, Ayadi, Zones, Elements, Planets, Remedies, Rules & Exceptions
// ============================================================================

import { 
  SemanticConcept, 
  SemanticRule, 
  SemanticFormula, 
  SemanticTable, 
  ConceptCategory 
} from "../../../types/semanticKnowledge";
import { StructuredDocumentModel, DocumentParagraph } from "../../../types/documentStructure";
import { SynonymEngine } from "./SynonymEngine";
import { CitationEngine } from "./CitationEngine";
import { RelationshipEngine } from "./RelationshipEngine";
import { CrossDomainEngine } from "./CrossDomainEngine";

export class ConceptEngine {
  /**
   * Processes a StructuredDocumentModel from Phase 2A and extracts semantic entities, concepts, rules, formulas, and tables.
   */
  public static extractSemanticConcepts(structuredModel: StructuredDocumentModel): {
    concepts: SemanticConcept[];
    rules: SemanticRule[];
    formulae: SemanticFormula[];
    tables: SemanticTable[];
  } {
    const concepts: SemanticConcept[] = [];
    const rules: SemanticRule[] = [];
    const formulae: SemanticFormula[] = [];
    const tables: SemanticTable[] = [];

    const docTitle = structuredModel.title || structuredModel.originalName;
    const author = structuredModel.metadata.author || "Uploaded Treatise";
    const ocrConf = structuredModel.metadata.ocrConfidence || 100.0;

    // Process chapters & sections
    for (const chapter of structuredModel.chapters) {
      for (const section of chapter.sections) {
        // 1. Process Formulae (Atomic - Never Split - LOCK 30)
        for (const form of section.formulae) {
          const mockPara: DocumentParagraph = {
            id: form.id,
            documentId: structuredModel.documentId,
            chapterId: chapter.id,
            sectionId: section.id,
            paragraphId: form.id,
            pageNumber: form.pageNumber,
            sourceDocument: structuredModel.originalName,
            rawText: form.expression,
            cleanText: form.expression
          };
          const cit = CitationEngine.createCitation(mockPara, chapter.title, section.title, docTitle, author);
          const prov = CitationEngine.createProvenance(cit, author, ocrConf);

          formulae.push({
            id: form.id,
            formulaName: form.formulaName || "Ayadi Formula",
            expression: form.expression,
            variables: { "Perimeter": "Length + Width x 2", "Remainder": "Modulo 8 or 9" },
            explanation: form.explanation || "Mathematical calculation for architectural perimeter harmony.",
            provenance: prov,
            citation: cit
          });
        }

        // 2. Process Tables (Atomic - Never Split - LOCK 30)
        for (const tbl of section.tables) {
          const mockPara: DocumentParagraph = {
            id: tbl.id,
            documentId: structuredModel.documentId,
            chapterId: chapter.id,
            sectionId: section.id,
            paragraphId: tbl.id,
            pageNumber: tbl.pageNumber,
            sourceDocument: structuredModel.originalName,
            rawText: tbl.rawMarkdown || "Table Content",
            cleanText: tbl.rawMarkdown || "Table Content"
          };
          const cit = CitationEngine.createCitation(mockPara, chapter.title, section.title, docTitle, author);
          const prov = CitationEngine.createProvenance(cit, author, ocrConf);

          tables.push({
            id: tbl.id,
            caption: tbl.caption || "Vastu Directional & Measurement Grid",
            headers: tbl.headers,
            rows: tbl.rows,
            rawMarkdown: tbl.rawMarkdown,
            provenance: prov,
            citation: cit
          });
        }

        // 3. Process Paragraphs for Concept & Rule Extraction
        for (const paragraph of section.paragraphs) {
          const cit = CitationEngine.createCitation(paragraph, chapter.title, section.title, docTitle, author);
          const prov = CitationEngine.createProvenance(cit, author, ocrConf);

          const text = paragraph.cleanText;
          const lower = text.toLowerCase();

          // Rule / Principle / Exception Extraction
          const isException = lower.includes("exception") || lower.includes("however") || lower.includes("unless") || lower.includes("if not possible");
          const isRule = isException || lower.includes("must") || lower.includes("should") || lower.includes("prohibited") || lower.includes("auspicious") || lower.includes("inauspicious");

          if (isRule) {
            const rels = RelationshipEngine.extractRelationshipsFromText(text, prov, cit);

            let severity: SemanticRule["severity"] = "MEDIUM";
            if (lower.includes("prohibited") || lower.includes("severe") || lower.includes("never") || lower.includes("brahmasthan")) {
              severity = "CRITICAL";
            } else if (lower.includes("must") || lower.includes("essential")) {
              severity = "HIGH";
            }

            rules.push({
              id: `RULE-${paragraph.id}`,
              ruleText: text,
              category: structuredModel.metadata.category || "Vastu Shastra",
              severity,
              isException,
              exceptionsNote: isException ? "Contains classical situational exception override." : undefined,
              provenance: prov,
              citation: cit,
              relationships: rels
            });
          }

          // Concept Keying
          const conceptKeywords: { key: string; cat: ConceptCategory }[] = [
            { key: "AGNEYA", cat: "ZONE" },
            { key: "ISHANYA", cat: "ZONE" },
            { key: "BRAHMASTHAN", cat: "ENERGY_GRID" },
            { key: "NAIRUTYA", cat: "ZONE" },
            { key: "VAYAVYA", cat: "ZONE" },
            { key: "KITCHEN", cat: "ROOM" },
            { key: "ENTRANCE", cat: "ROOM" },
            { key: "BEDROOM", cat: "ROOM" },
            { key: "TOILET", cat: "ROOM" },
            { key: "WATER_TANK", cat: "ROOM" },
            { key: "AYADI", cat: "FORMULA" }
          ];

          for (const item of conceptKeywords) {
            if (lower.includes(item.key.toLowerCase().replace(/_/g, " ")) || lower.includes(item.key.toLowerCase())) {
              const canonical = SynonymEngine.resolveCanonicalName(item.key);
              const synonyms = SynonymEngine.getSynonyms(item.key);
              const crossLinks = CrossDomainEngine.generateCrossDomainLinks(item.key, canonical);

              concepts.push({
                id: `CNC-${canonical}-${paragraph.id}`,
                name: item.key,
                canonicalName: canonical,
                synonyms,
                domain: "VASTU_SHASTRA",
                category: item.cat,
                definition: text,
                provenance: prov,
                citation: cit,
                crossDomainLinks: crossLinks
              });
            }
          }
        }
      }
    }

    return { concepts, rules, formulae, tables };
  }
}
