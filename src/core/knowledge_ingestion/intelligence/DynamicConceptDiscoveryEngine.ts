// ============================================================================
// DYNAMIC CONCEPT DISCOVERY ENGINE (PHASE 2C — LOCK 33)
// Dynamically discovers concepts, definitions, terms, and synonyms from uploaded books
// ============================================================================

import { StructuredDocumentModel } from "../../../types/documentStructure";
import { 
  SemanticDocumentModel, 
  DynamicLearnedConcept, 
  ConceptCategory, 
  KnowledgeProvenance, 
  SourceCitation 
} from "../../../types/semanticKnowledge";
import { CitationEngine } from "../semantic/CitationEngine";
import { SynonymEngine } from "../semantic/SynonymEngine";

export class DynamicConceptDiscoveryEngine {
  /**
   * Dynamically discovers concepts and definitions from a Structured and Semantic Document Model.
   */
  public static discoverConceptsFromDocument(
    structuredModel: StructuredDocumentModel,
    semanticModel: SemanticDocumentModel
  ): DynamicLearnedConcept[] {
    const discoveredMap = new Map<string, DynamicLearnedConcept>();
    const docTitle = structuredModel.title || structuredModel.originalName;
    const author = structuredModel.metadata.author || "Uploaded Treatise";
    const ocrConf = structuredModel.metadata.ocrConfidence || 100.0;

    // 1. Discover concepts from Heading/Chapter Structure
    for (const chapter of structuredModel.chapters) {
      for (const section of chapter.sections) {
        for (const paragraph of section.paragraphs) {
          const text = paragraph.cleanText;
          const lower = text.toLowerCase();

          const citation: SourceCitation = CitationEngine.createCitation(
            paragraph,
            chapter.title,
            section.title,
            docTitle,
            author
          );
          const provenance: KnowledgeProvenance = CitationEngine.createProvenance(
            citation,
            author,
            ocrConf
          );

          // Detect Definition Patterns: "X is defined as...", "X refers to...", "X denotes...", "The term X means..."
          const defMatch = text.match(/\b([A-Z][a-zA-Z\s-]{2,30})\b\s+(?:is defined as|refers to|denotes|means|is the zone of|is the deity of|governs)\s+(.+)/i);

          if (defMatch) {
            const rawTerm = defMatch[1].trim();
            const defText = defMatch[2].trim();
            const canonicalName = SynonymEngine.resolveCanonicalName(rawTerm);

            this.addOrMergeDiscoveredConcept(discoveredMap, {
              id: `DYN-CNC-${canonicalName}`,
              canonicalName,
              primaryCategory: this.inferCategoryFromText(rawTerm, text),
              discoveredSynonyms: [rawTerm, ...SynonymEngine.getSynonyms(rawTerm)],
              definitions: [{ text: `${rawTerm}: ${defText}`, provenance, citation }],
              provenances: [provenance],
              consensus: {
                conceptId: `DYN-CNC-${canonicalName}`,
                canonicalName,
                frequency: 1,
                agreementScore: 100.0,
                confidence: 95.0,
                evidenceCount: 1,
                supportingDocuments: [{
                  documentId: structuredModel.documentId,
                  documentTitle: docTitle,
                  statement: text,
                  citation,
                  provenance
                }],
                contradictingDocuments: [],
                isConflicted: false
              },
              sourcePriority: "DYNAMIC_KNOWLEDGE_BRAIN"
            });
          }

          // Also merge existing Phase 2B extracted concepts with dynamic discovery
          for (const concept of semanticModel.concepts) {
            this.addOrMergeDiscoveredConcept(discoveredMap, {
              id: `DYN-CNC-${concept.canonicalName}`,
              canonicalName: concept.canonicalName,
              primaryCategory: concept.category,
              discoveredSynonyms: concept.synonyms,
              definitions: [{ text: concept.definition, provenance: concept.provenance, citation: concept.citation }],
              provenances: [concept.provenance],
              consensus: {
                conceptId: `DYN-CNC-${concept.canonicalName}`,
                canonicalName: concept.canonicalName,
                frequency: 1,
                agreementScore: 100.0,
                confidence: 90.0,
                evidenceCount: 1,
                supportingDocuments: [{
                  documentId: structuredModel.documentId,
                  documentTitle: docTitle,
                  statement: concept.definition,
                  citation: concept.citation,
                  provenance: concept.provenance
                }],
                contradictingDocuments: [],
                isConflicted: false
              },
              sourcePriority: "DYNAMIC_KNOWLEDGE_BRAIN"
            });
          }
        }
      }
    }

    return Array.from(discoveredMap.values());
  }

  private static addOrMergeDiscoveredConcept(
    map: Map<string, DynamicLearnedConcept>,
    newConcept: DynamicLearnedConcept
  ): void {
    const key = newConcept.canonicalName;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, newConcept);
    } else {
      existing.consensus.frequency += 1;
      existing.consensus.evidenceCount += 1;

      // Deduplicate synonyms
      const synSet = new Set([...existing.discoveredSynonyms, ...newConcept.discoveredSynonyms]);
      existing.discoveredSynonyms = Array.from(synSet);

      // Append definitions & provenances
      existing.definitions.push(...newConcept.definitions);
      existing.provenances.push(...newConcept.provenances);
      existing.consensus.supportingDocuments.push(...newConcept.consensus.supportingDocuments);
    }
  }

  private static inferCategoryFromText(term: string, text: string): ConceptCategory {
    const lower = (term + " " + text).toLowerCase();
    if (lower.includes("zone") || lower.includes("corner") || lower.includes("direction")) return "ZONE";
    if (lower.includes("room") || lower.includes("kitchen") || lower.includes("bedroom") || lower.includes("toilet")) return "ROOM";
    if (lower.includes("element") || lower.includes("fire") || lower.includes("water") || lower.includes("earth") || lower.includes("air")) return "ELEMENT";
    if (lower.includes("planet") || lower.includes("venus") || lower.includes("jupiter") || lower.includes("sun")) return "PLANET";
    if (lower.includes("number") || lower.includes("ayadi")) return "NUMBER";
    if (lower.includes("remedy") || lower.includes("pyramid") || lower.includes("helix")) return "REMEDY";
    return "RULE";
  }
}
