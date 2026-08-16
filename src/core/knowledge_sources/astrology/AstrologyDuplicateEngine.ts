import { IAstrologyDuplicateMatch, IAstrologyOntologyEntity } from './AstrologyKnowledgeTypes';
import { INITIAL_ASTROLOGY_DUPLICATES } from './AstrologyOntologyCatalog';

export class AstrologyDuplicateEngine {
  private duplicates: Map<string, IAstrologyDuplicateMatch> = new Map();

  constructor() {
    INITIAL_ASTROLOGY_DUPLICATES.forEach(d => this.duplicates.set(d.matchId, d));
  }

  public getAllDuplicates(): IAstrologyDuplicateMatch[] {
    return Array.from(this.duplicates.values());
  }

  public findPotentialDuplicates(entity: IAstrologyOntologyEntity, allEntities: IAstrologyOntologyEntity[]): IAstrologyDuplicateMatch[] {
    const matches: IAstrologyDuplicateMatch[] = [];

    for (const other of allEntities) {
      if (other.id === entity.id) continue;

      let score = 0;
      const matchingAttrs: string[] = [];

      if (other.canonicalName.toLowerCase().includes(entity.canonicalName.toLowerCase()) ||
          entity.canonicalName.toLowerCase().includes(other.canonicalName.toLowerCase())) {
        score += 40;
        matchingAttrs.push('canonicalName');
      }

      if (other.sanskritName && entity.sanskritName && other.sanskritName === entity.sanskritName) {
        score += 30;
        matchingAttrs.push('sanskritName');
      }

      if (other.associatedRashi && entity.associatedRashi && other.associatedRashi === entity.associatedRashi) {
        score += 15;
        matchingAttrs.push('associatedRashi');
      }

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
