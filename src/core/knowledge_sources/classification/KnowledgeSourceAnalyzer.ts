import { KnowledgeSourceType } from '../models/KnowledgeSourceType';
import { KnowledgeSourceMetadata } from '../models/KnowledgeSourceMetadata';
import { DocumentClassification, DocumentClassificationType } from './DocumentClassification';
import { OCRRequirement, OCRRequirementLevel } from './OCRRequirement';
import { OCRMetadata } from '../models/OCRMetadata';

export interface IAnalysisResultData {
  readonly classification: DocumentClassification;
  readonly ocrRequirement: OCRRequirement;
  readonly initialOcrMetadata: OCRMetadata;
}

export class KnowledgeSourceAnalyzer {
  public static analyzeSource(
    sourceType: KnowledgeSourceType,
    metadata: KnowledgeSourceMetadata,
    rawContent?: string | Uint8Array
  ): IAnalysisResultData {
    let classificationType: DocumentClassificationType = 'UNKNOWN';
    let hasVectorText = false;
    let hasEmbeddedImages = false;
    let textDensity = 0.8;
    let imageDensity = 0.1;
    let confidence = 0.95;

    // Rule-based classification heuristics
    if (sourceType === 'SCANNED_PDF') {
      classificationType = 'SCANNED_PDF';
      hasVectorText = false;
      hasEmbeddedImages = true;
      textDensity = 0.05;
      imageDensity = 0.95;
    } else if (sourceType === 'DIGITAL_PDF' || sourceType === 'PDF') {
      if (rawContent) {
        const strContent = typeof rawContent === 'string'
          ? rawContent
          : String.fromCharCode.apply(null, Array.from(rawContent.slice(0, 2048)));

        const containsFontStream = strContent.includes('/Font') || strContent.includes('/Type /Page');
        const containsImageStream = strContent.includes('/XObject') || strContent.includes('/Image');

        if (containsFontStream && containsImageStream) {
          classificationType = 'MIXED_PDF';
          hasVectorText = true;
          hasEmbeddedImages = true;
          textDensity = 0.5;
          imageDensity = 0.5;
        } else if (containsFontStream) {
          classificationType = 'DIGITAL_PDF';
          hasVectorText = true;
          hasEmbeddedImages = false;
          textDensity = 0.9;
          imageDensity = 0.1;
        } else if (containsImageStream) {
          classificationType = 'SCANNED_PDF';
          hasVectorText = false;
          hasEmbeddedImages = true;
          textDensity = 0.1;
          imageDensity = 0.9;
        } else {
          classificationType = 'DIGITAL_PDF';
          hasVectorText = true;
        }
      } else {
        classificationType = 'DIGITAL_PDF';
        hasVectorText = true;
      }
    } else if (sourceType === 'IMAGE') {
      classificationType = 'IMAGE_DOCUMENT';
      hasVectorText = false;
      hasEmbeddedImages = true;
      textDensity = 0.0;
      imageDensity = 1.0;
    } else if (['EPUB', 'DOCX', 'TXT', 'MARKDOWN', 'HTML'].includes(sourceType)) {
      classificationType = 'TEXT_DOCUMENT';
      hasVectorText = true;
      hasEmbeddedImages = false;
      textDensity = 0.95;
      imageDensity = 0.05;
    }

    const classification = new DocumentClassification({
      classification: classificationType,
      confidence,
      textDensity,
      imageDensity,
      hasVectorText,
      hasEmbeddedImages,
      pageCount: metadata.pageCount,
      analyzedAt: Date.now()
    });

    // Assess OCR Requirement based on classification
    let reqLevel: OCRRequirementLevel = 'NOT_REQUIRED';
    let reason = 'Text is natively extractable in vector format.';
    let estimatedPagesToOcr = 0;

    switch (classificationType) {
      case 'SCANNED_PDF':
        reqLevel = 'MANDATORY';
        reason = 'Document is a scanned image container with no vector font embedded.';
        estimatedPagesToOcr = metadata.pageCount;
        break;
      case 'IMAGE_DOCUMENT':
        reqLevel = 'MANDATORY';
        reason = 'Source is a standalone image asset requiring optical character recognition.';
        estimatedPagesToOcr = 1;
        break;
      case 'MIXED_PDF':
        reqLevel = 'RECOMMENDED';
        reason = 'Document contains both vector text and embedded scan artifacts.';
        estimatedPagesToOcr = Math.ceil(metadata.pageCount * 0.4);
        break;
      case 'DIGITAL_PDF':
      case 'TEXT_DOCUMENT':
        reqLevel = 'NOT_REQUIRED';
        reason = 'Direct text parsing available with full unicode layer.';
        estimatedPagesToOcr = 0;
        break;
      default:
        reqLevel = 'OPTIONAL';
        reason = 'Unknown classification; optional OCR pass fallback.';
        estimatedPagesToOcr = metadata.pageCount;
        break;
    }

    const ocrRequirement = new OCRRequirement({
      requirementLevel: reqLevel,
      reason,
      estimatedPagesToOcr,
      suggestedEngine: 'Tesseract-OCR-v5'
    });

    const isOcrRequired = reqLevel === 'MANDATORY' || reqLevel === 'RECOMMENDED';
    const initialOcrMetadata = new OCRMetadata({
      ocrRequired: isOcrRequired,
      ocrStatus: isOcrRequired ? 'PENDING' : 'NOT_REQUIRED',
      ocrLanguage: metadata.language !== 'UNKNOWN' ? metadata.language : 'en',
      ocrEngine: 'Tesseract-OCR-v5'
    });

    return Object.freeze({
      classification,
      ocrRequirement,
      initialOcrMetadata
    });
  }
}
