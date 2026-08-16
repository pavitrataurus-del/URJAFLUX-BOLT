import { KnowledgeSourceMetadata } from '../models/KnowledgeSourceMetadata';

export class MetadataResolver {
  public static resolve(
    primary: KnowledgeSourceMetadata,
    secondary?: Partial<KnowledgeSourceMetadata>
  ): KnowledgeSourceMetadata {
    if (!secondary) {
      return primary;
    }

    const resolvedTitle = primary.title || secondary.title || 'Untitled Knowledge Source';
    const resolvedAuthor = primary.author || secondary.author || 'Unknown Author';
    const resolvedPublisher = primary.publisher || secondary.publisher;
    const resolvedEdition = primary.edition || secondary.edition;
    const resolvedYear = primary.publicationYear || secondary.publicationYear;
    const resolvedLanguage = primary.language !== 'UNKNOWN' ? primary.language : secondary.language || 'en';
    const resolvedIsbn = primary.isbn || secondary.isbn;
    const resolvedDoi = primary.doi || secondary.doi;
    const resolvedDescription = primary.description || secondary.description;

    const mergedKeywords = Array.from(
      new Set([...primary.keywords, ...(secondary.keywords || [])])
    );

    const mergedTags = Array.from(
      new Set([...primary.tags, ...(secondary.tags || [])])
    );

    const resolvedCategory = primary.category !== 'General' ? primary.category : secondary.category || 'General';
    const resolvedFileSize = primary.fileSize > 0 ? primary.fileSize : secondary.fileSize || 0;
    const resolvedPageCount = primary.pageCount > 0 ? primary.pageCount : secondary.pageCount || 1;
    const resolvedLicense = primary.license !== 'All Rights Reserved' ? primary.license : secondary.license || 'All Rights Reserved';

    return new KnowledgeSourceMetadata({
      title: resolvedTitle,
      subtitle: primary.subtitle || secondary.subtitle,
      author: resolvedAuthor,
      publisher: resolvedPublisher,
      edition: resolvedEdition,
      publicationYear: resolvedYear,
      language: resolvedLanguage,
      isbn: resolvedIsbn,
      doi: resolvedDoi,
      description: resolvedDescription,
      keywords: mergedKeywords,
      tags: mergedTags,
      category: resolvedCategory,
      fileSize: resolvedFileSize,
      pageCount: resolvedPageCount,
      license: resolvedLicense,
      customAttributes: {
        ...(secondary.customAttributes || {}),
        ...(primary.customAttributes || {})
      }
    });
  }
}
