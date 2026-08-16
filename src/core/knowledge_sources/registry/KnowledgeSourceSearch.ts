import { KnowledgeSource } from '../models/KnowledgeSource';
import { KnowledgeSourceType } from '../models/KnowledgeSourceType';
import { KnowledgeSourceStatus } from '../models/KnowledgeSourceStatus';
import { KnowledgeSourceLanguage } from '../models/KnowledgeSourceLanguage';
import { TrustLevel } from '../approval/TrustLevel';

export interface ISearchQueryOptions {
  readonly query?: string;
  readonly category?: string;
  readonly language?: KnowledgeSourceLanguage;
  readonly status?: KnowledgeSourceStatus;
  readonly trustLevel?: TrustLevel;
  readonly sourceType?: KnowledgeSourceType;
  readonly author?: string;
  readonly tag?: string;
  readonly minPageCount?: number;
  readonly maxPageCount?: number;
  readonly limit?: number;
  readonly offset?: number;
}

export interface ISearchResultData {
  readonly items: readonly KnowledgeSource[];
  readonly totalCount: number;
  readonly limit: number;
  readonly offset: number;
}

export class KnowledgeSourceSearch {
  public static search(
    sources: readonly KnowledgeSource[],
    options?: ISearchQueryOptions
  ): ISearchResultData {
    if (!options) {
      return Object.freeze({
        items: sources,
        totalCount: sources.length,
        limit: sources.length,
        offset: 0
      });
    }

    let filtered = [...sources];

    if (options.query && options.query.trim().length > 0) {
      const q = options.query.trim().toLowerCase();
      filtered = filtered.filter((s) => {
        const titleMatch = s.title.toLowerCase().includes(q);
        const authorMatch = s.author.toLowerCase().includes(q);
        const descMatch = s.description ? s.description.toLowerCase().includes(q) : false;
        const tagMatch = s.tags.some((t) => t.toLowerCase().includes(q));
        const isbnMatch = s.isbn ? s.isbn.toLowerCase().includes(q) : false;
        return titleMatch || authorMatch || descMatch || tagMatch || isbnMatch;
      });
    }

    if (options.category) {
      const cat = options.category.toLowerCase();
      filtered = filtered.filter((s) => s.category.toLowerCase() === cat);
    }

    if (options.language) {
      filtered = filtered.filter((s) => s.language === options.language);
    }

    if (options.status) {
      filtered = filtered.filter((s) => s.status === options.status);
    }

    if (options.trustLevel) {
      filtered = filtered.filter((s) => s.trustLevel === options.trustLevel);
    }

    if (options.sourceType) {
      filtered = filtered.filter((s) => s.sourceType === options.sourceType);
    }

    if (options.author) {
      const a = options.author.toLowerCase();
      filtered = filtered.filter((s) => s.author.toLowerCase().includes(a));
    }

    if (options.tag) {
      const t = options.tag.toLowerCase();
      filtered = filtered.filter((s) => s.tags.some((tag) => tag.toLowerCase() === t));
    }

    if (options.minPageCount !== undefined) {
      filtered = filtered.filter((s) => s.pageCount >= options.minPageCount!);
    }

    if (options.maxPageCount !== undefined) {
      filtered = filtered.filter((s) => s.pageCount <= options.maxPageCount!);
    }

    const totalCount = filtered.length;
    const offset = options.offset ?? 0;
    const limit = options.limit ?? totalCount;

    const paged = filtered.slice(offset, offset + limit);

    return Object.freeze({
      items: Object.freeze(paged),
      totalCount,
      limit,
      offset
    });
  }
}
