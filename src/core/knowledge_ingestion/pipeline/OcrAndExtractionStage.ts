import { IngestionStage, PipelineStageContext } from "./stageTypes";

export interface OcrAndExtractionOutput {
  rawText: string;
  ocrText?: string;
  correctedOcrText?: string;
  isScanned: boolean;
  usedOcr: boolean;
  ocrConfidence: number;
}

export class OcrAndExtractionStage implements IngestionStage<PipelineStageContext, OcrAndExtractionOutput> {
  readonly stageName = "OCR_AND_EXTRACTION";

  async execute(input: PipelineStageContext, context: PipelineStageContext): Promise<OcrAndExtractionOutput> {
    const data = context.dataUrlOrText || "";
    const nativeText = (context.extractedNativeText || "").trim();

    const pageMarkerRe = /--- PAGE \d+ OF \d+ ---/gi;
    const textWithoutMarkers = nativeText.replace(pageMarkerRe, "");
    const meaningfulText = textWithoutMarkers.replace(/[\s\n\r\t]+/g, "");
    const pageMarkers = nativeText.match(/--- PAGE \d+ OF \d+ ---/gi);
    const estimatedPages = pageMarkers ? pageMarkers.length : 1;
    const density = meaningfulText.length / Math.max(estimatedPages, 1);
    const hasPageInventory = Boolean(pageMarkers && pageMarkers.length > 0);

    // Upload pipeline Stage 4 already merged per-page Vision OCR into extractedNativeText — preserve it.
    if (hasPageInventory && density >= 15) {
      return {
        rawText: nativeText,
        ocrText: nativeText,
        correctedOcrText: nativeText.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " "),
        isScanned: true,
        usedOcr: true,
        ocrConfidence: 92.0,
      };
    }

    const isDataUrl = data.startsWith("data:") || (data.length > 500 && !data.includes(" "));

    // Native PDF text layer with real content — skip redundant OCR.
    if (!isDataUrl && density >= 50) {
      return {
        rawText: textWithoutMarkers,
        isScanned: false,
        usedOcr: false,
        ocrConfidence: 100.0,
      };
    }

    // Scanned PDF with page inventory but OCR not merged yet — keep markers; never inject template junk.
    if (hasPageInventory) {
      context.warnings.push(
        "Page inventory present but Vision OCR text is sparse — Stage 4 OCR may have failed (check GEMINI_API_KEY)."
      );
      return {
        rawText: nativeText,
        ocrText: nativeText,
        correctedOcrText: nativeText,
        isScanned: true,
        usedOcr: false,
        ocrConfidence: 0,
      };
    }

    context.warnings.push("Document requires Vision API OCR processing.");

    let ocrText = "";
    let confidence = 95.0;

    if (data.startsWith("data:image")) {
      try {
        const resp = await fetch("/api/vision/recognize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageDataUrl: data,
            promptText:
              "Extract all text from this classical treatise page including chapter headings, verse numbers, Sanskrit transliteration, and formulas.",
          }),
        });

        if (resp.ok) {
          const json = await resp.json();
          ocrText = json.rawJsonText || json.text || "";
          confidence = 98.2;
        }
      } catch (err: any) {
        context.warnings.push(`OCR Vision API call failed: ${err.message}.`);
      }
    }

    if (!ocrText && meaningfulText.length > 0) {
      ocrText = textWithoutMarkers;
    }

    const correctedOcrText = (ocrText || "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");

    return {
      rawText: ocrText || textWithoutMarkers,
      ocrText: ocrText || undefined,
      correctedOcrText: correctedOcrText || undefined,
      isScanned: true,
      usedOcr: Boolean(ocrText),
      ocrConfidence: ocrText ? confidence : 0,
    };
  }
}
