import { Logger } from '../../utils/logger';

export interface IScriptDetectionResultData {
  readonly primaryScript: string;
  readonly confidence: number;
  readonly scriptDistribution: Record<string, number>;
}

export class ScriptDetector {
  public static detectScript(text: string): IScriptDetectionResultData {
    Logger.info(`[ScriptDetector] Detecting script for text length: ${text.length}`);

    if (!text || text.trim().length === 0) {
      return Object.freeze({
        primaryScript: 'Latin',
        confidence: 1.0,
        scriptDistribution: Object.freeze({ Latin: 1.0 })
      });
    }

    let devanagariCount = 0;
    let latinCount = 0;
    let otherCount = 0;
    let totalAlpha = 0;

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);

      if (code >= 0x0900 && code <= 0x097f) {
        devanagariCount++;
        totalAlpha++;
      } else if (
        (code >= 0x0041 && code <= 0x005a) ||
        (code >= 0x0061 && code <= 0x007a) ||
        (code >= 0x00c0 && code <= 0x024f)
      ) {
        latinCount++;
        totalAlpha++;
      } else if (code > 0x0020 && !/\s|\d|[.,!?;:()"'`\-]/.test(text[i])) {
        otherCount++;
        totalAlpha++;
      }
    }

    if (totalAlpha === 0) {
      return Object.freeze({
        primaryScript: 'Latin',
        confidence: 0.5,
        scriptDistribution: Object.freeze({ Latin: 1.0 })
      });
    }

    const devRatio = devanagariCount / totalAlpha;
    const latRatio = latinCount / totalAlpha;
    const othRatio = otherCount / totalAlpha;

    let primaryScript = 'Latin';
    let confidence = latRatio;

    if (devRatio > 0.6) {
      primaryScript = 'Devanagari';
      confidence = devRatio;
    } else if (latRatio > 0.6) {
      primaryScript = 'Latin';
      confidence = latRatio;
    } else if (devRatio > 0.2 && latRatio > 0.2) {
      primaryScript = 'Mixed';
      confidence = Math.max(devRatio, latRatio);
    } else if (othRatio > 0.5) {
      primaryScript = 'Unknown';
      confidence = othRatio;
    }

    const scriptDistribution: Record<string, number> = {
      Latin: Math.round(latRatio * 100) / 100,
      Devanagari: Math.round(devRatio * 100) / 100,
      Other: Math.round(othRatio * 100) / 100
    };

    return Object.freeze({
      primaryScript,
      confidence: Math.round(confidence * 100) / 100,
      scriptDistribution: Object.freeze(scriptDistribution)
    });
  }
}
