import { 
  ILineValidationReport, 
  ILineDetail 
} from "../types/knowledgePipeline.types";

export class LineValidationStage {
  public static readonly STAGE_NAME = "LINE_BY_LINE_VALIDATION";

  public execute(sourceId: string, rawText: string): ILineValidationReport {
    const linesRaw = rawText.split(/\r?\n/);
    const lineDetails: ILineDetail[] = [];
    let validLinesCount = 0;
    let corruptedLinesCount = 0;
    let totalNoise = 0;

    let currentPage = 1;

    linesRaw.forEach((lineText, index) => {
      // Check for page markers
      const pageMatch = lineText.match(/--- PAGE (\d+) OF \d+ ---/i) || lineText.match(/\[Page (\d+)\]/i);
      if (pageMatch) {
        currentPage = parseInt(pageMatch[1], 10) || currentPage;
      }

      const trimmed = lineText.trim();
      if (!trimmed) {
        return; // Skip empty line records
      }

      // Calculate noise score (ratio of unusual non-alphanumeric / non-Devanagari characters)
      const cleanChars = trimmed.replace(/[^\w\s\u0900-\u097F\u0A80-\u0AFF,.!?-]/g, "");
      const noiseCharsCount = trimmed.length - cleanChars.length;
      const noiseScore = trimmed.length > 0 ? noiseCharsCount / trimmed.length : 0;

      // Detect heading patterns
      const isHeading = /^#+ |^Chapter \d+|^Sutra \d+|^Topic \d+|^[0-9]+\.\s+[A-Z\u0900-\u097F]/i.test(trimmed);

      // Detect verse / shloka markers
      const isVerseMarker = /\|\||\/\//.test(trimmed) || /shloka|verse|mantra/i.test(trimmed);

      const isValid = noiseScore < 0.35 && trimmed.length > 2;

      if (isValid) {
        validLinesCount++;
      } else {
        corruptedLinesCount++;
      }

      totalNoise += noiseScore;

      lineDetails.push({
        lineIndex: index + 1,
        pageNumber: currentPage,
        rawText: lineText,
        cleanText: trimmed,
        isValid,
        confidence: Math.max(0, Math.min(100, Math.round((1 - noiseScore) * 100))),
        noiseScore: parseFloat(noiseScore.toFixed(3)),
        isHeading,
        isVerseMarker
      });
    });

    const totalLines = lineDetails.length;
    const overallNoiseRatio = totalLines > 0 ? parseFloat((totalNoise / totalLines).toFixed(3)) : 0;

    return {
      sourceId,
      totalLines,
      validLinesCount,
      corruptedLinesCount,
      overallNoiseRatio,
      lines: lineDetails
    };
  }
}
