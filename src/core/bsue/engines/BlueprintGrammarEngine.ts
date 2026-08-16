// ============================================================================
// URJAFLUX AI OS - BSUE STEP 2: BLUEPRINT GRAMMAR ENGINE
// Architectural terminology normalization, synonym dictionary matching,
// multilingual support (English, Hindi, Hinglish, Architectural Abbreviations)
// ============================================================================

import { 
  BmueCanonicalTerm, 
  IGrammarMapping, 
  IGrammarDictionary 
} from "../types/bsue.types";

export class BlueprintGrammarEngine {
  private static instance: BlueprintGrammarEngine;

  // Canonical Synonym Dictionary
  private synonymMap: Map<string, { term: BmueCanonicalTerm; lang: IGrammarMapping['languageDetected'] }> = new Map();

  private constructor() {
    this.initializeDictionary();
  }

  public static getInstance(): BlueprintGrammarEngine {
    if (!BlueprintGrammarEngine.instance) {
      BlueprintGrammarEngine.instance = new BlueprintGrammarEngine();
    }
    return BlueprintGrammarEngine.instance;
  }

  private initializeDictionary(): void {
    // KITCHEN Synonyms
    const kitchenTerms = [
      { raw: 'KITCHEN', lang: 'ENGLISH' },
      { raw: 'KIT', lang: 'ABBREVIATION' },
      { raw: 'KIT.', lang: 'ABBREVIATION' },
      { raw: 'K', lang: 'ABBREVIATION' },
      { raw: 'KITCH', lang: 'ABBREVIATION' },
      { raw: 'KITCHENETTE', lang: 'ENGLISH' },
      { raw: 'COOKING', lang: 'ENGLISH' },
      { raw: 'RASOI', lang: 'HINDI' },
      { raw: 'RASOI GHAR', lang: 'HINGLISH' },
      { raw: 'PAANTA', lang: 'HINDI' }
    ];
    kitchenTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'KITCHEN', lang: t.lang as any }));

    // BEDROOM Synonyms
    const bedroomTerms = [
      { raw: 'BEDROOM', lang: 'ENGLISH' },
      { raw: 'BED ROOM', lang: 'ENGLISH' },
      { raw: 'BR', lang: 'ABBREVIATION' },
      { raw: 'B.R.', lang: 'ABBREVIATION' },
      { raw: 'MBR', lang: 'ABBREVIATION' },
      { raw: 'MASTER', lang: 'ENGLISH' },
      { raw: 'MASTER BEDROOM', lang: 'ENGLISH' },
      { raw: 'GUEST', lang: 'ENGLISH' },
      { raw: 'GUEST ROOM', lang: 'ENGLISH' },
      { raw: 'CHILDREN', lang: 'ENGLISH' },
      { raw: 'KIDS ROOM', lang: 'ENGLISH' },
      { raw: 'KAMRA', lang: 'HINDI' },
      { raw: 'SOYA KAMRA', lang: 'HINGLISH' }
    ];
    bedroomTerms.forEach(t => {
      let term: BmueCanonicalTerm = 'BEDROOM';
      if (t.raw.includes('MASTER') || t.raw === 'MBR') term = 'MASTER_BEDROOM';
      else if (t.raw.includes('GUEST')) term = 'GUEST_BEDROOM';
      else if (t.raw.includes('CHILDREN') || t.raw.includes('KIDS')) term = 'CHILDREN_BEDROOM';
      this.synonymMap.set(t.raw, { term, lang: t.lang as any });
    });

    // TOILET / BATHROOM Synonyms
    const toiletTerms = [
      { raw: 'TOILET', lang: 'ENGLISH' },
      { raw: 'TOI', lang: 'ABBREVIATION' },
      { raw: 'T', lang: 'ABBREVIATION' },
      { raw: 'WC', lang: 'ABBREVIATION' },
      { raw: 'BATH', lang: 'ENGLISH' },
      { raw: 'BATHROOM', lang: 'ENGLISH' },
      { raw: 'WASH', lang: 'ENGLISH' },
      { raw: 'WASHROOM', lang: 'ENGLISH' },
      { raw: 'LAVATORY', lang: 'ENGLISH' },
      { raw: 'LATRINE', lang: 'ENGLISH' },
      { raw: 'SHAUCHALAY', lang: 'HINDI' },
      { raw: 'SNAN GHAR', lang: 'HINGLISH' }
    ];
    toiletTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'TOILET', lang: t.lang as any }));

    // LIVING ROOM Synonyms
    const livingTerms = [
      { raw: 'LIVING', lang: 'ENGLISH' },
      { raw: 'LIVING ROOM', lang: 'ENGLISH' },
      { raw: 'LIV', lang: 'ABBREVIATION' },
      { raw: 'HALL', lang: 'ENGLISH' },
      { raw: 'DRAWING', lang: 'ENGLISH' },
      { raw: 'DRAWING ROOM', lang: 'ENGLISH' },
      { raw: 'PARLOR', lang: 'ENGLISH' },
      { raw: 'BAITHAK', lang: 'HINDI' }
    ];
    livingTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'LIVING_ROOM', lang: t.lang as any }));

    // DINING ROOM Synonyms
    const diningTerms = [
      { raw: 'DINING', lang: 'ENGLISH' },
      { raw: 'DINING ROOM', lang: 'ENGLISH' },
      { raw: 'DIN', lang: 'ABBREVIATION' },
      { raw: 'D.R.', lang: 'ABBREVIATION' },
      { raw: ' भोजन कक्ष', lang: 'HINDI' },
      { raw: 'KHANA ROOM', lang: 'HINGLISH' }
    ];
    diningTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'DINING_ROOM', lang: t.lang as any }));

    // STORE ROOM Synonyms
    const storeTerms = [
      { raw: 'STORE', lang: 'ENGLISH' },
      { raw: 'STORE ROOM', lang: 'ENGLISH' },
      { raw: 'STORAGE', lang: 'ENGLISH' },
      { raw: 'ST', lang: 'ABBREVIATION' },
      { raw: 'GODOWN', lang: 'ENGLISH' },
      { raw: 'BHANDAR GHAR', lang: 'HINGLISH' }
    ];
    storeTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'STORE_ROOM', lang: t.lang as any }));

    // TEMPLE Synonyms
    const templeTerms = [
      { raw: 'TEMPLE', lang: 'ENGLISH' },
      { raw: 'PUJA', lang: 'HINGLISH' },
      { raw: 'POOJA', lang: 'HINGLISH' },
      { raw: 'PUJA ROOM', lang: 'HINGLISH' },
      { raw: 'MANDIR', lang: 'HINDI' },
      { raw: 'PRAYER', lang: 'ENGLISH' },
      { raw: 'DEVOTIONAL', lang: 'ENGLISH' }
    ];
    templeTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'TEMPLE', lang: t.lang as any }));

    // OFFICE Synonyms
    const officeTerms = [
      { raw: 'OFFICE', lang: 'ENGLISH' },
      { raw: 'STUDY', lang: 'ENGLISH' },
      { raw: 'STUDY ROOM', lang: 'ENGLISH' },
      { raw: 'WORK', lang: 'ENGLISH' },
      { raw: 'DEN', lang: 'ENGLISH' }
    ];
    officeTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'OFFICE', lang: t.lang as any }));

    // UTILITY Synonyms
    const utilityTerms = [
      { raw: 'UTILITY', lang: 'ENGLISH' },
      { raw: 'UTIL', lang: 'ABBREVIATION' },
      { raw: 'WASH AREA', lang: 'ENGLISH' },
      { raw: 'LAUNDRY', lang: 'ENGLISH' },
      { raw: 'SERVICE', lang: 'ENGLISH' }
    ];
    utilityTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'UTILITY', lang: t.lang as any }));

    // BALCONY Synonyms
    const balconyTerms = [
      { raw: 'BALCONY', lang: 'ENGLISH' },
      { raw: 'BALC', lang: 'ABBREVIATION' },
      { raw: 'VERANDAH', lang: 'ENGLISH' },
      { raw: 'PATIO', lang: 'ENGLISH' },
      { raw: 'TERRACE', lang: 'ENGLISH' },
      { raw: 'DECK', lang: 'ENGLISH' },
      { raw: 'CHHAT', lang: 'HINDI' }
    ];
    balconyTerms.forEach(t => this.synonymMap.set(t.raw, { term: 'BALCONY', lang: t.lang as any }));
  }

  public normalizeTerm(rawText?: string): IGrammarMapping {
    if (!rawText) {
      return {
        rawTerm: 'UNKNOWN',
        normalizedTerm: 'UNKNOWN_SEMANTIC',
        languageDetected: 'ENGLISH',
        confidence: 0.1
      };
    }

    const cleaned = rawText.trim().toUpperCase().replace(/[^A-Z0-9\s.]/g, '');

    if (this.synonymMap.has(cleaned)) {
      const match = this.synonymMap.get(cleaned)!;
      return {
        rawTerm: rawText,
        normalizedTerm: match.term,
        languageDetected: match.lang,
        confidence: 0.98
      };
    }

    // Partial fuzzy keyword search
    for (const [key, value] of this.synonymMap.entries()) {
      if (key.length >= 3 && cleaned.includes(key)) {
        return {
          rawTerm: rawText,
          normalizedTerm: value.term,
          languageDetected: value.lang,
          confidence: 0.85
        };
      }
    }

    return {
      rawTerm: rawText,
      normalizedTerm: 'UNKNOWN_SEMANTIC',
      languageDetected: 'ENGLISH',
      confidence: 0.30
    };
  }

  public getGrammarDictionary(): IGrammarDictionary {
    const mappings: IGrammarMapping[] = [];
    this.synonymMap.forEach((val, key) => {
      mappings.push({
        rawTerm: key,
        normalizedTerm: val.term,
        languageDetected: val.lang,
        confidence: 0.98
      });
    });

    return {
      mappings,
      supportedLanguages: ['ENGLISH', 'HINDI', 'HINGLISH', 'ARCHITECT_ABBREVIATIONS']
    };
  }
}

export const blueprintGrammarEngine = BlueprintGrammarEngine.getInstance();
