import { ILalKitabDuplicateMatch, ILalKitabOntologyEntity } from './LalKitabKnowledgeTypes';
import { INITIAL_LALKITAB_DUPLICATES } from './LalKitabOntologyCatalog';

export class LalKitabDuplicateEngine {
  private duplicates: Map<string, ILalKitabDuplicateMatch> = new Map();

  constructor() {
    INITIAL_LALKITAB_DUPLICATES.forEach(d => this.duplicates.set(d.matchId, d));
  }

  public getAllDuplicates(): ILalKitabDuplicateMatch[] {
    return Array.from(this.duplicates.values());
  }

  public findPotentialDuplicates(entity: ILalKitabOntologyEntity, allEntities: ILalKitabOntologyEntity[]): ILalKitabDuplicateMatch[] {
    const matches: ILalKitabDuplicateMatch[] = [];

    for (const other of allEntities) {
      if (other.id === entity.id) continue;

      let score = 0;
      const matchingAttrs: string[] = [];

      // Name similarity
      if (other.canonicalName.toLowerCase().includes(entity.canonicalName.toLowerCase()) ||
          entity.canonicalName.toLowerCase().includes(other.canonicalName.toLowerCase())) {
        score += 40;
        matchingAttrs.push('canonicalName');
      }

      // Hindi name similarity
      if (other.hindiName && entity.hindiName && other.hindiName === entity.hindiName) {
        score += 30;
        matchingAttrs.push('hindiName');
      }

      // Entity type
      if (other.entityType === entity.entityType) {
        score += 15;
        matchingAttrs.push('entityType');
      }

      // Associated metal / planet
      if (other.associatedMetal && entity.associatedMetal && other.associatedMetal === entity.associatedMetal) {
        score += 15;
        matchingAttrs.push('associatedMetal');
      }

      if (score >= 60) {
        matches.push({
          matchId: `dup-${entity.id}-${other.id}`,
          primaryEntityId: entity.id,
          candidateEntityId: other.id,
          similarityScore: Math.min(100, score),
          matchingAttributes: matchingAttrs,
          status: 'PENDING_REVIEW'
        });
      }
    }

    return matches;
  }

  public updateDuplicateStatus(matchId: string, status: 'MERGED' | 'DISMISSED'): boolean {
    const match = this.duplicates.get(matchId);
    if (!match) return false;
    match.status = status;
    return true;
  }
}
