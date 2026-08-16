import { INumerologyDuplicateMatch, INumerologyOntologyEntity } from './NumerologyKnowledgeTypes';
import { INITIAL_NUMEROLOGY_DUPLICATES } from './NumerologyOntologyCatalog';

export class NumerologyDuplicateEngine {
  private duplicates: Map<string, INumerologyDuplicateMatch> = new Map();

  constructor() {
    INITIAL_NUMEROLOGY_DUPLICATES.forEach(d => this.duplicates.set(d.matchId, d));
  }

  public getAllDuplicates(): INumerologyDuplicateMatch[] {
    return Array.from(this.duplicates.values());
  }

  public findPotentialDuplicates(entity: INumerologyOntologyEntity, allEntities: INumerologyOntologyEntity[]): INumerologyDuplicateMatch[] {
    const matches: INumerologyDuplicateMatch[] = [];

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

      // Number Value matching
      if (other.numberValue !== undefined && entity.numberValue !== undefined && other.numberValue === entity.numberValue) {
        score += 30;
        matchingAttrs.push('numberValue');
      }

      // System matching
      if (other.system && entity.system && other.system === entity.system) {
        score += 15;
        matchingAttrs.push('system');
      }

      // Associated planet matching
      if (other.associatedPlanet && entity.associatedPlanet && other.associatedPlanet === entity.associatedPlanet) {
        score += 15;
        matchingAttrs.push('associatedPlanet');
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
