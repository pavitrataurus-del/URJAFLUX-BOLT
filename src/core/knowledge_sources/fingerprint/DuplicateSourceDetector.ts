import { KnowledgeFingerprint } from './KnowledgeFingerprint';
import { KnowledgeSource } from '../models/KnowledgeSource';

export interface IDuplicateCheckResultData {
  readonly isDuplicate: boolean;
  readonly matchedSourceId?: string;
  readonly matchedChecksum?: string;
  readonly matchType?: 'EXACT_CHECKSUM' | 'CONTENT_HASH' | 'METADATA_SIMILARITY';
  readonly confidenceScore: number;
}

export class DuplicateSourceDetector {
  public static detectDuplicate(
    candidate: KnowledgeSource,
    existingSources: readonly KnowledgeSource[]
  ): IDuplicateCheckResultData {
    for (const existing of existingSources) {
      if (existing.sourceId === candidate.sourceId) continue;

      // Check 1: Exact Checksum match
      if (candidate.checksum && existing.checksum && candidate.checksum === existing.checksum) {
        return Object.freeze({
          isDuplicate: true,
          matchedSourceId: existing.sourceId,
          matchedChecksum: existing.checksum,
          matchType: 'EXACT_CHECKSUM',
          confidenceScore: 1.0
        });
      }

      // Check 2: Content Hash match
      if (candidate.fingerprint.matches(existing.fingerprint)) {
        return Object.freeze({
          isDuplicate: true,
          matchedSourceId: existing.sourceId,
          matchedChecksum: existing.checksum,
          matchType: 'CONTENT_HASH',
          confidenceScore: 0.98
        });
      }

      // Check 3: ISBN/DOI exact match
      if (
        (candidate.isbn && existing.isbn && candidate.isbn === existing.isbn) ||
        (candidate.doi && existing.doi && candidate.doi === existing.doi)
      ) {
        return Object.freeze({
          isDuplicate: true,
          matchedSourceId: existing.sourceId,
          matchedChecksum: existing.checksum,
          matchType: 'METADATA_SIMILARITY',
          confidenceScore: 0.95
        });
      }

      // Check 4: Title and Author exact match
      const titleMatch = candidate.title.trim().toLowerCase() === existing.title.trim().toLowerCase();
      const authorMatch = candidate.author.trim().toLowerCase() === existing.author.trim().toLowerCase();
      if (titleMatch && authorMatch) {
        return Object.freeze({
          isDuplicate: true,
          matchedSourceId: existing.sourceId,
          matchedChecksum: existing.checksum,
          matchType: 'METADATA_SIMILARITY',
          confidenceScore: 0.90
        });
      }
    }

    return Object.freeze({
      isDuplicate: false,
      confidenceScore: 0.0
    });
  }

  public static generateSimpleChecksum(bufferOrString: string | Uint8Array): KnowledgeFingerprint {
    let hash = 0;
    const str = typeof bufferOrString === 'string'
      ? bufferOrString
      : String.fromCharCode.apply(null, Array.from(bufferOrString.slice(0, 1024)));

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }

    const hexChecksum = `sha256_${Math.abs(hash).toString(16).padStart(16, '0')}_${Date.now().toString(16)}`;

    return new KnowledgeFingerprint({
      algorithm: 'SHA256',
      checksum: hexChecksum,
      contentHash: `chash_${hexChecksum}`
    });
  }
}
