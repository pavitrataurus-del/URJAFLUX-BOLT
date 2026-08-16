import {
  IChakraDuplicateMatch,
  IChakraOntologyEntity
} from "./ChakraKnowledgeTypes";

export class ChakraDuplicateEngine {
  private static instance: ChakraDuplicateEngine;
  private duplicateMatches: IChakraDuplicateMatch[] = [];

  private constructor() {
    this.seedCanonicalDuplicateScans();
  }

  public static getInstance(): ChakraDuplicateEngine {
    if (!ChakraDuplicateEngine.instance) {
      ChakraDuplicateEngine.instance = new ChakraDuplicateEngine();
    }
    return ChakraDuplicateEngine.instance;
  }

  private seedCanonicalDuplicateScans(): void {
    this.duplicateMatches = [
      {
        sourceId: "node-dup-001",
        sourceTitle: "Root Energy Center (Base Chakra)",
        matchedId: "chk-001",
        matchedTitle: "Muladhara (Root Chakra)",
        similarityScore: 0.94,
        matchType: "Duplicate Chakra Entity",
        recommendation: "Reject & Merge"
      },
      {
        sourceId: "node-dup-002",
        sourceTitle: "Terracotta Earth Vessel Remedy",
        matchedId: "rem-earth-001",
        matchedTitle: "Terracotta Earth Clay Pot (Muladhara Remedy)",
        similarityScore: 0.88,
        matchType: "Duplicate Remedy",
        recommendation: "Flag for Expert Review"
      },
      {
        sourceId: "node-dup-003",
        sourceTitle: "LAM Seed Acoustics",
        matchedId: "mantra-lam-001",
        matchedTitle: "LAM Bija Mantra",
        similarityScore: 0.96,
        matchType: "Duplicate Mantra",
        recommendation: "Reject & Merge"
      },
      {
        sourceId: "node-dup-004",
        sourceTitle: "Yellow Prithvi Square Symbol",
        matchedId: "symbol-sq-001",
        matchedTitle: "Prithvi Earth Square Geometry",
        similarityScore: 0.91,
        matchType: "Duplicate Symbol",
        recommendation: "Flag for Expert Review"
      }
    ];
  }

  public getDuplicateMatches(): IChakraDuplicateMatch[] {
    return this.duplicateMatches;
  }

  public scanForDuplicates(entities: IChakraOntologyEntity[]): IChakraDuplicateMatch[] {
    const results: IChakraDuplicateMatch[] = [...this.duplicateMatches];
    // Compare titles, mantras, symbols
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const e1 = entities[i];
        const e2 = entities[j];
        if (e1.seedMantra === e2.seedMantra && e1.id !== e2.id) {
          results.push({
            sourceId: e1.id,
            sourceTitle: `${e1.sanskritName} (${e1.englishName})`,
            matchedId: e2.id,
            matchedTitle: `${e2.sanskritName} (${e2.englishName})`,
            similarityScore: 0.89,
            matchType: "Duplicate Mantra",
            recommendation: "Flag for Expert Review"
          });
        }
      }
    }
    return results;
  }

  public removeDuplicateMatch(sourceId: string, matchedId: string): void {
    this.duplicateMatches = this.duplicateMatches.filter(
      m => !(m.sourceId === sourceId && m.matchedId === matchedId)
    );
  }
}
