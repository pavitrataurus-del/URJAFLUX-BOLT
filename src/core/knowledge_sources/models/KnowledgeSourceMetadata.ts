import { KnowledgeSourceLanguage } from './KnowledgeSourceLanguage';

export interface IKnowledgeSourceMetadataData {
  readonly title: string;
  readonly subtitle?: string;
  readonly author: string;
  readonly publisher?: string;
  readonly edition?: string;
  readonly publicationYear?: number;
  readonly language: KnowledgeSourceLanguage;
  readonly isbn?: string;
  readonly doi?: string;
  readonly description?: string;
  readonly keywords: readonly string[];
  readonly tags: readonly string[];
  readonly category: string;
  readonly fileSize: number;
  readonly pageCount: number;
  readonly license: string;
  readonly customAttributes: Record<string, unknown>;
}

export class KnowledgeSourceMetadata implements IKnowledgeSourceMetadataData {
  public readonly title: string;
  public readonly subtitle?: string;
  public readonly author: string;
  public readonly publisher?: string;
  public readonly edition?: string;
  public readonly publicationYear?: number;
  public readonly language: KnowledgeSourceLanguage;
  public readonly isbn?: string;
  public readonly doi?: string;
  public readonly description?: string;
  public readonly keywords: readonly string[];
  public readonly tags: readonly string[];
  public readonly category: string;
  public readonly fileSize: number;
  public readonly pageCount: number;
  public readonly license: string;
  public readonly customAttributes: Record<string, unknown>;

  constructor(data: Partial<IKnowledgeSourceMetadataData> & { title: string; author: string }) {
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.author = data.author;
    this.publisher = data.publisher;
    this.edition = data.edition;
    this.publicationYear = data.publicationYear;
    this.language = data.language || 'en';
    this.isbn = data.isbn;
    this.doi = data.doi;
    this.description = data.description;
    this.keywords = Object.freeze([...(data.keywords || [])]);
    this.tags = Object.freeze([...(data.tags || [])]);
    this.category = data.category || 'General';
    this.fileSize = data.fileSize ?? 0;
    this.pageCount = data.pageCount ?? 1;
    this.license = data.license || 'All Rights Reserved';
    this.customAttributes = Object.freeze({ ...(data.customAttributes || {}) });

    Object.freeze(this);
  }

  public update(patch: Partial<IKnowledgeSourceMetadataData>): KnowledgeSourceMetadata {
    return new KnowledgeSourceMetadata({
      ...this.toJSON(),
      ...patch,
      title: patch.title !== undefined ? patch.title : this.title,
      author: patch.author !== undefined ? patch.author : this.author
    });
  }

  public toJSON(): IKnowledgeSourceMetadataData {
    return {
      title: this.title,
      subtitle: this.subtitle,
      author: this.author,
      publisher: this.publisher,
      edition: this.edition,
      publicationYear: this.publicationYear,
      language: this.language,
      isbn: this.isbn,
      doi: this.doi,
      description: this.description,
      keywords: this.keywords,
      tags: this.tags,
      category: this.category,
      fileSize: this.fileSize,
      pageCount: this.pageCount,
      license: this.license,
      customAttributes: this.customAttributes
    };
  }
}
