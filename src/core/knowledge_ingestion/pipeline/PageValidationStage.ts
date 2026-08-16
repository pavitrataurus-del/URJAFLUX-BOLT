import { 
  IPageValidationReport, 
  IPageDetail, 
  ILineDetail 
} from "../types/knowledgePipeline.types";

export class PageValidationStage {
  public static readonly STAGE_NAME = "PAGE_VALIDATION";

  public execute(sourceId: string, lines: ILineDetail[]): IPageValidationReport {
    const pageMap = new Map<number, ILineDetail[]>();

    lines.forEach(line => {
      const p = line.pageNumber || 1;
      if (!pageMap.has(p)) {
        pageMap.set(p, []);
      }
      pageMap.get(p)!.push(line);
    });

    const pageNumbers = Array.from(pageMap.keys()).sort((a, b) => a - b);
    const pages: IPageDetail[] = [];
    const missingPagesDetected: number[] = [];

    // Check page sequence continuity
    if (pageNumbers.length > 0) {
      const minPage = pageNumbers[0];
      const maxPage = pageNumbers[pageNumbers.length - 1];

      for (let p = minPage; p <= maxPage; p++) {
        if (!pageMap.has(p)) {
          missingPagesDetected.push(p);
        }
      }
    }

    let validPagesCount = 0;

    pageNumbers.forEach(pNum => {
      const pageLines = pageMap.get(pNum) || [];
      const charCount = pageLines.reduce((acc, l) => acc + l.cleanText.length, 0);

      // Detect header/footer repetitive tokens on page top/bottom
      const hasHeadersFooters = pageLines.some((l, idx) => {
        const isHeaderFooterPos = idx < 2 || idx > pageLines.length - 3;
        return isHeaderFooterPos && (/page \d+/i.test(l.cleanText) || /chapter \d+/i.test(l.cleanText));
      });

      // Density score (average characters per line)
      const densityScore = pageLines.length > 0 ? charCount / pageLines.length : 0;
      const isValid = charCount > 50 && pageLines.length > 2;

      if (isValid) {
        validPagesCount++;
      }

      pages.push({
        pageNumber: pNum,
        lineCount: pageLines.length,
        characterCount: charCount,
        hasHeadersFooters,
        densityScore: parseFloat(densityScore.toFixed(1)),
        isValid
      });
    });

    return {
      sourceId,
      totalPages: pageNumbers.length,
      validPagesCount,
      missingPagesDetected,
      pages
    };
  }
}
