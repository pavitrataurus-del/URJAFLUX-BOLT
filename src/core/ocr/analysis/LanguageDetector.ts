import { Logger } from '../../utils/logger';

export interface ILanguageDetectionResultData {
  readonly primaryLanguage: string;
  readonly confidence: number;
  readonly languageScores: Record<string, number>;
  readonly isMixed: boolean;
}

export class LanguageDetector {
  public static detectLanguage(text: string): ILanguageDetectionResultData {
    Logger.info(`[LanguageDetector] Detecting language for text length: ${text.length}`);

    if (!text || text.trim().length === 0) {
      return Object.freeze({
        primaryLanguage: 'en',
        confidence: 1.0,
        languageScores: Object.freeze({ en: 1.0 }),
        isMixed: false
      });
    }

    let devanagariCount = 0;
    let latinCount = 0;
    let totalAlpha = 0;

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // Devanagari block: U+0900 to U+097F
      if (code >= 0x0900 && code <= 0x097f) {
        devanagariCount++;
        totalAlpha++;
      }
      // Latin script
      else if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
        latinCount++;
        totalAlpha++;
      }
    }

    if (totalAlpha === 0) {
      return Object.freeze({
        primaryLanguage: 'en',
        confidence: 0.5,
        languageScores: Object.freeze({ en: 0.5, hi: 0.0 }),
        isMixed: false
      });
    }

    const hiRatio = devanagariCount / totalAlpha;
    const enRatio = latinCount / totalAlpha;

    let primaryLanguage = 'en';
    let confidence = enRatio;
    let isMixed = false;

    // Sanskrit vs Hindi heuristic check: presence of visarga (ः), avagraha (ऽ), or common Vedic/Sanskrit endings
    const containsSanskritMarker = text.includes('ः') || text.includes('ऽ') || text.includes('॥');

    if (hiRatio > 0.6) {
      primaryLanguage = containsSanskritMarker ? 'sa' : 'hi';
      confidence = hiRatio;
    } else if (enRatio > 0.6) {
      primaryLanguage = 'en';
      confidence = enRatio;
    } else if (hiRatio > 0.2 && enRatio > 0.2) {
      primaryLanguage = 'mixed';
      confidence = Math.max(hiRatio, enRatio);
      isMixed = true;
    }

    const languageScores: Record<string, number> = {
      en: Math.round(enRatio * 100) / 100,
      hi: containsSanskritMarker ? 0 : Math.round(hiRatio * 100) / 100,
      sa: containsSanskritMarker ? Math.round(hiRatio * 100) / 100 : 0
    };

    return Object.freeze({
      primaryLanguage,
      confidence: Math.round(confidence * 100) / 100,
      languageScores: Object.freeze(languageScores),
      isMixed
    });
  }
}
