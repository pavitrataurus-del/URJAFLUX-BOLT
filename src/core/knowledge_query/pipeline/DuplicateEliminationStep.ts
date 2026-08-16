// ============================================================================
// URJAFLUX AI OS - KQE DUPLICATE ELIMINATION STEP
// Pipeline Step 6: Deduplicates retrieved assets while preserving structural integrity
// ============================================================================

import { IVaultKnowledgeRecord, VaultKnowledgeCategory, IVaultCitation, IVaultEvidence, KnowledgeDomain } from "../../knowledge_vault/types/vaultRecord.types";

export interface IDeduplicatedResultSet {
  recordIds: string[];
  categories: VaultKnowledgeCategory[];
  conditions: string[];
  exceptions: string[];
  positiveFindings: string[];
  doshas: string[];
  remedies: string[];
  alternativeRemedies: string[];
  contraindications: string[];
  citations: IVaultCitation[];
  evidence: IVaultEvidence[];
  evidenceHashes: string[];
  crossReferences: string[];
  relatedDomains: KnowledgeDomain[];
}

export class DuplicateEliminationStep {

  public eliminateDuplicates(records: IVaultKnowledgeRecord[]): IDeduplicatedResultSet {
    const recordIdsSet = new Set<string>();
    const categoriesSet = new Set<VaultKnowledgeCategory>();
    const conditionsSet = new Set<string>();
    const exceptionsSet = new Set<string>();
    const positiveFindingsSet = new Set<string>();
    const doshasSet = new Set<string>();
    const remediesSet = new Set<string>();
    const altRemediesSet = new Set<string>();
    const contraindicationsSet = new Set<string>();
    const citationMap = new Map<string, IVaultCitation>();
    const evidenceMap = new Map<string, IVaultEvidence>();
    const evidenceHashesSet = new Set<string>();
    const crossReferencesSet = new Set<string>();
    const relatedDomainsSet = new Set<KnowledgeDomain>();

    records.forEach(rec => {
      recordIdsSet.add(rec.recordId);
      categoriesSet.add(rec.category);

      const p = rec.knowledgePayload;
      p.conditions.forEach(c => c && conditionsSet.add(c.trim()));
      p.exceptions.forEach(e => e && exceptionsSet.add(e.trim()));
      p.remedies.forEach(r => r && remediesSet.add(r.trim()));
      p.alternativeRemedies.forEach(ar => ar && altRemediesSet.add(ar.trim()));
      p.contraindications.forEach(ci => ci && contraindicationsSet.add(ci.trim()));

      if (p.dosha) doshasSet.add(p.dosha.trim());
      if (p.cause) doshasSet.add(p.cause.trim());
      if (p.effect) positiveFindingsSet.add(p.effect.trim());
      if (p.positiveFinding) positiveFindingsSet.add(p.positiveFinding.trim());

      // Citation deduplication
      if (rec.citation && rec.citation.citationId) {
        citationMap.set(rec.citation.citationId, rec.citation);
      }

      // Evidence deduplication
      if (rec.immutableHash) {
        evidenceHashesSet.add(rec.immutableHash);
        if (rec.evidence) {
          evidenceMap.set(rec.immutableHash, rec.evidence);
        }
      }

      // Cross References & Domains
      rec.crossReferences.forEach(cr => cr && crossReferencesSet.add(cr));
      rec.relatedDomains.forEach(rd => rd && relatedDomainsSet.add(rd));
    });

    return {
      recordIds: Array.from(recordIdsSet),
      categories: Array.from(categoriesSet),
      conditions: Array.from(conditionsSet),
      exceptions: Array.from(exceptionsSet),
      positiveFindings: Array.from(positiveFindingsSet),
      doshas: Array.from(doshasSet),
      remedies: Array.from(remediesSet),
      alternativeRemedies: Array.from(altRemediesSet),
      contraindications: Array.from(contraindicationsSet),
      citations: Array.from(citationMap.values()),
      evidence: Array.from(evidenceMap.values()),
      evidenceHashes: Array.from(evidenceHashesSet),
      crossReferences: Array.from(crossReferencesSet),
      relatedDomains: Array.from(relatedDomainsSet)
    };
  }
}
