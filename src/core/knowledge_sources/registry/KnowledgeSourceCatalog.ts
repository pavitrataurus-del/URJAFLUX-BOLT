import { KnowledgeSource } from '../models/KnowledgeSource';
import { knowledgeSourceRegistry, KnowledgeSourceRegistry } from './KnowledgeSourceRegistry';

export interface ICatalogSummaryData {
  readonly totalSourcesCount: number;
  readonly approvedCount: number;
  readonly rejectedCount: number;
  readonly draftCount: number;
  readonly underReviewCount: number;
  readonly archivedCount: number;
  readonly suspendedCount: number;
  readonly categoryCounts: Record<string, number>;
  readonly languageCounts: Record<string, number>;
}

export class KnowledgeSourceCatalog {
  private readonly registry: KnowledgeSourceRegistry;

  constructor(registry?: KnowledgeSourceRegistry) {
    this.registry = registry || knowledgeSourceRegistry;
  }

  public getApprovedSources(): readonly KnowledgeSource[] {
    return Object.freeze(this.registry.getAllSources().filter((s) => s.status === 'APPROVED'));
  }

  public getRejectedSources(): readonly KnowledgeSource[] {
    return Object.freeze(this.registry.getAllSources().filter((s) => s.status === 'REJECTED'));
  }

  public getDraftSources(): readonly KnowledgeSource[] {
    return Object.freeze(this.registry.getAllSources().filter((s) => s.status === 'DRAFT'));
  }

  public getUnderReviewSources(): readonly KnowledgeSource[] {
    return Object.freeze(
      this.registry.getAllSources().filter((s) => s.status === 'UNDER_REVIEW' || s.status === 'PENDING_REVIEW')
    );
  }

  public getArchivedSources(): readonly KnowledgeSource[] {
    return Object.freeze(this.registry.getAllSources().filter((s) => s.status === 'ARCHIVED'));
  }

  public getSuspendedSources(): readonly KnowledgeSource[] {
    return Object.freeze(this.registry.getAllSources().filter((s) => s.status === 'SUSPENDED'));
  }

  public getSummary(): ICatalogSummaryData {
    const all = this.registry.getAllSources();
    const categoryCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};

    let approved = 0;
    let rejected = 0;
    let draft = 0;
    let underReview = 0;
    let archived = 0;
    let suspended = 0;

    for (const s of all) {
      if (s.status === 'APPROVED') approved++;
      else if (s.status === 'REJECTED') rejected++;
      else if (s.status === 'DRAFT') draft++;
      else if (s.status === 'UNDER_REVIEW' || s.status === 'PENDING_REVIEW') underReview++;
      else if (s.status === 'ARCHIVED') archived++;
      else if (s.status === 'SUSPENDED') suspended++;

      const cat = s.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      const lang = s.language || 'UNKNOWN';
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    }

    return Object.freeze({
      totalSourcesCount: all.length,
      approvedCount: approved,
      rejectedCount: rejected,
      draftCount: draft,
      underReviewCount: underReview,
      archivedCount: archived,
      suspendedCount: suspended,
      categoryCounts: Object.freeze(categoryCounts),
      languageCounts: Object.freeze(languageCounts)
    });
  }
}
