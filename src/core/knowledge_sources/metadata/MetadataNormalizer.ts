import { KnowledgeSourceMetadata } from '../models/KnowledgeSourceMetadata';
import { KnowledgeSourceLanguage } from '../models/KnowledgeSourceLanguage';

export class MetadataNormalizer {
  public static normalize(metadata: KnowledgeSourceMetadata): KnowledgeSourceMetadata {
    const cleanTitle = metadata.title.trim().replace(/\s+/g, ' ');
    const cleanAuthor = metadata.author.trim().replace(/\s+/g, ' ');
    const cleanPublisher = metadata.publisher ? metadata.publisher.trim().replace(/\s+/g, ' ') : undefined;
    const cleanEdition = metadata.edition ? metadata.edition.trim() : undefined;
    const cleanDescription = metadata.description ? metadata.description.trim() : undefined;

    // ISBN Normalization
    const cleanIsbn = metadata.isbn ? metadata.isbn.replace(/[\s-]/g, '').toUpperCase() : undefined;
    const cleanDoi = metadata.doi ? metadata.doi.trim().toLowerCase() : undefined;

    // Normalizing Keywords & Tags
    const normalizedKeywords = Array.from(
      new Set(metadata.keywords.map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0))
    );

    const normalizedTags = Array.from(
      new Set(metadata.tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0))
    );

    // Language Normalization
    const lang = this.normalizeLanguageCode(metadata.language);

    return new KnowledgeSourceMetadata({
      ...metadata.toJSON(),
      title: cleanTitle,
      author: cleanAuthor,
      publisher: cleanPublisher,
      edition: cleanEdition,
      description: cleanDescription,
      isbn: cleanIsbn,
      doi: cleanDoi,
      language: lang,
      keywords: normalizedKeywords,
      tags: normalizedTags
    });
  }

  private static normalizeLanguageCode(lang: string): KnowledgeSourceLanguage {
    const code = lang.trim().toLowerCase();
    switch (code) {
      case 'en':
      case 'eng':
      case 'english':
        return 'en';
      case 'sa':
      case 'san':
      case 'sanskrit':
        return 'sa';
      case 'hi':
      case 'hin':
      case 'hindi':
        return 'hi';
      case 'ta':
      case 'tam':
      case 'tamil':
        return 'ta';
      case 'te':
      case 'tel':
      case 'telugu':
        return 'te';
      case 'kn':
      case 'kan':
      case 'kannada':
        return 'kn';
      case 'ml':
      case 'mal':
      case 'malayalam':
        return 'ml';
      case 'mr':
      case 'mar':
      case 'marathi':
        return 'mr';
      case 'gu':
      case 'guj':
      case 'gujarati':
        return 'gu';
      case 'bn':
      case 'ben':
      case 'bengali':
        return 'bn';
      case 'fr':
      case 'fre':
      case 'french':
        return 'fr';
      case 'de':
      case 'ger':
      case 'german':
        return 'de';
      case 'es':
      case 'spa':
      case 'spanish':
        return 'es';
      case 'zh':
      case 'zho':
      case 'chi':
      case 'chinese':
        return 'zh';
      case 'ja':
      case 'jpn':
      case 'japanese':
        return 'ja';
      default:
        return 'UNKNOWN';
    }
  }
}
