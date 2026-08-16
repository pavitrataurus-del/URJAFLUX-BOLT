import { KnowledgeSourceMetadata } from '../models/KnowledgeSourceMetadata';

export interface IMetadataValidationResultData {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export class MetadataValidator {
  public static validate(metadata: KnowledgeSourceMetadata): IMetadataValidationResultData {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!metadata.title || metadata.title.trim().length === 0) {
      errors.push('Title is required and cannot be empty.');
    } else if (metadata.title.length < 2) {
      warnings.push('Title is unusually short.');
    }

    if (!metadata.author || metadata.author.trim().length === 0) {
      errors.push('Author is required and cannot be empty.');
    }

    if (metadata.fileSize < 0) {
      errors.push('File size cannot be negative.');
    }

    if (metadata.pageCount <= 0) {
      warnings.push('Page count should be greater than 0.');
    }

    if (metadata.isbn) {
      const cleanIsbn = metadata.isbn.replace(/[\s-]/g, '');
      if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
        warnings.push(`ISBN '${metadata.isbn}' does not conform to standard 10 or 13 digit lengths.`);
      }
    }

    if (metadata.publicationYear) {
      const currentYear = new Date().getFullYear();
      if (metadata.publicationYear < 1000 || metadata.publicationYear > currentYear + 1) {
        warnings.push(`Publication year ${metadata.publicationYear} appears out of standard range.`);
      }
    }

    return Object.freeze({
      isValid: errors.length === 0,
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings)
    });
  }
}
