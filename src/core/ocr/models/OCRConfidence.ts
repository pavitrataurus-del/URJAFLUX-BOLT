export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRELIABLE';

export interface IOCRConfidenceData {
  readonly score: number; // 0.0 to 1.0
  readonly level: ConfidenceLevel;
  readonly wordCount: number;
  readonly lowConfidenceCount: number;
}

export class OCRConfidence implements IOCRConfidenceData {
  public readonly score: number;
  public readonly level: ConfidenceLevel;
  public readonly wordCount: number;
  public readonly lowConfidenceCount: number;

  constructor(data?: Partial<IOCRConfidenceData>) {
    const rawScore = data?.score ?? 1.0;
    // Normalize score to 0.0 - 1.0
    this.score = Math.max(0, Math.min(1, rawScore > 1 ? rawScore / 100 : rawScore));
    this.wordCount = data?.wordCount ?? 0;
    this.lowConfidenceCount = data?.lowConfidenceCount ?? 0;

    if (data?.level) {
      this.level = data.level;
    } else {
      if (this.score >= 0.85) {
        this.level = 'HIGH';
      } else if (this.score >= 0.65) {
        this.level = 'MEDIUM';
      } else if (this.score >= 0.40) {
        this.level = 'LOW';
      } else {
        this.level = 'UNRELIABLE';
      }
    }

    Object.freeze(this);
  }

  public static fromScore(score: number, wordCount = 1, lowConfidenceCount = 0): OCRConfidence {
    return new OCRConfidence({ score, wordCount, lowConfidenceCount });
  }

  public static combine(confidences: readonly OCRConfidence[]): OCRConfidence {
    if (confidences.length === 0) {
      return new OCRConfidence({ score: 1.0, wordCount: 0, lowConfidenceCount: 0 });
    }

    let totalScore = 0;
    let totalWords = 0;
    let totalLow = 0;

    for (const conf of confidences) {
      totalScore += conf.score * Math.max(1, conf.wordCount);
      totalWords += Math.max(1, conf.wordCount);
      totalLow += conf.lowConfidenceCount;
    }

    const avgScore = totalWords > 0 ? totalScore / totalWords : 1.0;
    return new OCRConfidence({
      score: avgScore,
      wordCount: totalWords,
      lowConfidenceCount: totalLow
    });
  }

  public toJSON(): IOCRConfidenceData {
    return {
      score: this.score,
      level: this.level,
      wordCount: this.wordCount,
      lowConfidenceCount: this.lowConfidenceCount
    };
  }
}
