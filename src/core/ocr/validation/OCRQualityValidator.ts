import { OCRDocument } from '../models/OCRDocument';
import { OCRIssue } from './OCRIssue';
import { OCRQualityReport } from './OCRQualityReport';
import { Logger } from '../../utils/logger';

export class OCRQualityValidator {
  public static validateDocument(ocrDoc: OCRDocument): OCRQualityReport {
    Logger.info(`[OCRQualityValidator] Validating OCR documentId: ${ocrDoc.documentId}`);

    const issues: OCRIssue[] = [];
    let unreadablePages = 0;
    let lowConfidencePages = 0;

    const avgConf = ocrDoc.overallConfidence.score;

    if (ocrDoc.pages.length === 0) {
      issues.push(new OCRIssue({
        type: 'MISSING_TEXT',
        severity: 'CRITICAL',
        description: 'OCR document contains no extracted pages.',
        recommendation: 'Check source document integrity and resubmit.'
      }));
    }

    for (const page of ocrDoc.pages) {
      const pageScore = page.averageConfidence.score;

      // Unreadable page check
      if (pageScore < 0.35 || (page.blocks.length === 0 && page.words.length === 0)) {
        unreadablePages++;
        issues.push(new OCRIssue({
          type: 'UNREADABLE_PAGE',
          severity: 'CRITICAL',
          pageNumber: page.pageNumber,
          description: `Page ${page.pageNumber} is unreadable with extremely low confidence (${Math.round(pageScore * 100)}%).`,
          confidenceScore: pageScore,
          recommendation: 'Re-scan page at higher resolution or with better contrast.'
        }));
      }
      // Low confidence page check
      else if (pageScore < 0.65) {
        lowConfidencePages++;
        issues.push(new OCRIssue({
          type: 'LOW_CONFIDENCE_PAGE',
          severity: 'WARNING',
          pageNumber: page.pageNumber,
          description: `Page ${page.pageNumber} has low OCR confidence score (${Math.round(pageScore * 100)}%).`,
          confidenceScore: pageScore,
          recommendation: 'Review page manually or apply image enhancement preprocessing.'
        }));
      }

      // Check for broken tables
      for (const table of page.tables) {
        if (table.cells.length === 0 || table.confidence.score < 0.60) {
          issues.push(new OCRIssue({
            type: 'BROKEN_TABLE',
            severity: 'WARNING',
            pageNumber: page.pageNumber,
            description: `Table ${table.tableId} on Page ${page.pageNumber} has broken structure or low extraction confidence.`,
            confidenceScore: table.confidence.score,
            recommendation: 'Re-extract table using explicit line detection.'
          }));
        }
      }

      // Check for broken paragraphs / low confidence words
      for (const block of page.blocks) {
        if (block.blockType === 'PARAGRAPH') {
          if (block.confidence.score < 0.50) {
            issues.push(new OCRIssue({
              type: 'BROKEN_PARAGRAPH',
              severity: 'WARNING',
              pageNumber: page.pageNumber,
              blockId: block.blockId,
              description: `Paragraph block ${block.blockId} has fragmented text or corrupted characters.`,
              confidenceScore: block.confidence.score,
              recommendation: 'Check font/script compatibility or re-run layout reconstruction.'
            }));
          }
        }
      }
    }

    return new OCRQualityReport({
      documentId: ocrDoc.documentId,
      averageConfidence: Math.round(avgConf * 100) / 100,
      totalPages: ocrDoc.totalPages,
      unreadablePagesCount: unreadablePages,
      lowConfidencePageCount: lowConfidencePages,
      issues
    });
  }
}
