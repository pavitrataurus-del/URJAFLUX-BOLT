// ============================================================================
// URJAFLUX AI OS - MULTI-CATEGORY EXTRACTOR (KEE)
// Atomically extracts independent Knowledge Items from verbatim text paragraphs
// ============================================================================

import { 
  IKeeInputContent, 
  IKeeExtractedItem, 
  KeeKnowledgeCategory 
} from "../types/kee.types";
import { CategoryGrammarRules } from "../patterns/CategoryGrammarRules";

export class MultiCategoryExtractor {
  private static KEE_VERSION = "2.0.0-CANONICAL";

  /**
   * Processes an approved input paragraph/passage and extracts independent, un-summarized Knowledge Items
   */
  public extractFromContent(input: IKeeInputContent): IKeeExtractedItem[] {
    const rawText = input.rawVerbatimText.trim();
    if (!rawText) return [];

    const extractedItems: IKeeExtractedItem[] = [];
    const timestamp = new Date().toISOString();

    // Split text into coherent literal sentence clauses without modifying text
    const sentences = this.segmentSentencesVerbatim(rawText);

    sentences.forEach((sentence, idx) => {
      const categories = CategoryGrammarRules.matchCategories(sentence);

      categories.forEach(category => {
        const itemId = `KEE-${input.contentId}-${idx}-${category}`;
        const domainAttributes = this.extractDomainAttributesLiteral(sentence);

        const item: IKeeExtractedItem = {
          itemId,
          category,
          verbatimSnippet: sentence,
          originalFullContext: rawText,
          sourceReference: { ...input.sourceReference },
          domainAttributes,
          relationships: [],
          extractionTimestamp: timestamp,
          extractionVersion: MultiCategoryExtractor.KEE_VERSION,
          isLiteralUnmodified: true
        };

        extractedItems.push(item);
      });
    });

    return extractedItems;
  }

  /**
   * Segments text into sentence clauses strictly preserving exact verbatim punctuation and characters
   */
  private segmentSentencesVerbatim(text: string): string[] {
    // Splits on sentence boundaries (. | ? | ! | danda | double danda) preserving original exact characters
    const parts = text.split(/(?<=[.!?।॥])\s+/);
    return parts.filter(p => p.trim().length > 0);
  }

  /**
   * Deterministically extracts recognized literal domain keywords without altering text
   */
  private extractDomainAttributesLiteral(sentence: string) {
    const directionsMatch = sentence.match(/\b(North|South|East|West|Northeast|Northwest|Southeast|Southwest|Ishan|Agney|Nairutya|Vayavya)\b/gi) || [];
    const elementsMatch = sentence.match(/\b(Earth|Water|Fire|Air|Space|Ether|Prithvi|Jala|Agni|Vayu|Akasha)\b/gi) || [];
    const planetsMatch = sentence.match(/\b(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Surya|Chandra|Mangala|Budha|Guru|Shukra|Shani)\b/gi) || [];
    const chakrasMatch = sentence.match(/\b(Muladhara|Svadhisthana|Manipura|Anahata|Visuddha|Ajna|Sahasrara)\b/gi) || [];
    const objectsMatch = sentence.match(/\b(Mirror|Idol|Fountain|Bed|Stove|Water Tank|Staircase|Clock|Locker|Heavy Item)\b/gi) || [];
    const roomsMatch = sentence.match(/\b(Kitchen|Bedroom|Toilet|Bathroom|Pooja Room|Living Room|Entrance|Store Room)\b/gi) || [];
    const activitiesMatch = sentence.match(/\b(Sleeping|Cooking|Studying|Praying|Dining|Working|Storing|Meditating)\b/gi) || [];

    return {
      directions: Array.from(new Set(directionsMatch)),
      elements: Array.from(new Set(elementsMatch)),
      planets: Array.from(new Set(planetsMatch)),
      chakras: Array.from(new Set(chakrasMatch)),
      objects: Array.from(new Set(objectsMatch)),
      rooms: Array.from(new Set(roomsMatch)),
      activities: Array.from(new Set(activitiesMatch))
    };
  }
}
