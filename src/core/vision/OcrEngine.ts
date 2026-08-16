import { OCRText, ImageAsset } from './VisionTypes';
import Tesseract from 'tesseract.js';
import { isBlueprintNoiseText } from '../../recognition/ocrLabelPolicy';

export class OcrEngine {
  private static instance: OcrEngine;

  private constructor() {}

  public static getInstance(): OcrEngine {
    if (!OcrEngine.instance) {
      OcrEngine.instance = new OcrEngine();
    }
    return OcrEngine.instance;
  }

  /**
   * Run OCR extraction on ingested drawing or site photo asset using Tesseract
   */
  public async extractTextFromAsset(asset: ImageAsset): Promise<OCRText[]> {
    const imageUrl = asset.sourceUrl;
    if (!imageUrl) return [];

    try {
      const result = await Tesseract.recognize(imageUrl, 'eng');
      const data = result.data as any;
      const lines = data.lines || [];

      return lines.map((line: any, idx: number) => {
        const rawText = (line.text || '').trim();
        const bbox = line.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 };
        const confidence = line.confidence || 90;

        let category: OCRText['category'] = 'NOTE';
        if (!isBlueprintNoiseText(rawText) && /[a-zA-Z]/.test(rawText)) {
          category = 'ROOM_NAME';
        } else if (rawText.toLowerCase().includes('scale')) {
          category = 'SCALE_INFO';
        } else if (/^\d+(\.\d+)?\s*(m|mm|cm|ft|in|')/i.test(rawText)) {
          category = 'DIMENSION';
        }

        const imgW = asset.widthPx || 1000;
        const imgH = asset.heightPx || 800;

        return {
          id: `OCR_${idx}_${Date.now()}`,
          text: rawText,
          confidencePercent: confidence,
          category,
          boundingBox: {
            x: bbox.x0 / imgW,
            y: bbox.y0 / imgH,
            width: (bbox.x1 - bbox.x0) / imgW,
            height: (bbox.y1 - bbox.y0) / imgH
          }
        };
      });
    } catch (err) {
      console.warn('[OcrEngine] Asset OCR processing note:', err);
      return [];
    }
  }
}
