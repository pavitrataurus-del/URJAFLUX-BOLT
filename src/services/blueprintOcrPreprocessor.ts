/**
 * Blueprint image preprocessing for Tesseract OCR.
 * Upscales small CAD exports, boosts contrast, and normalizes to grayscale
 * so small / faint room labels survive segmentation.
 */

export function preprocessBlueprintForOcr(source: HTMLCanvasElement): HTMLCanvasElement {
  const minDim = Math.min(source.width, source.height);
  const targetMin = 1400;
  const scale = minDim < targetMin ? Math.min(2.5, targetMin / minDim) : 1;

  const out = document.createElement("canvas");
  out.width = Math.round(source.width * scale);
  out.height = Math.round(source.height * scale);

  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable for OCR preprocessing");

  ctx.filter = "contrast(1.2) brightness(1.04)";
  ctx.drawImage(source, 0, 0, out.width, out.height);
  ctx.filter = "none";

  const imageData = ctx.getImageData(0, 0, out.width, out.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const boosted = gray < 128 ? Math.max(0, gray * 0.85) : Math.min(255, gray * 1.08);
    data[i] = boosted;
    data[i + 1] = boosted;
    data[i + 2] = boosted;
  }

  ctx.putImageData(imageData, 0, 0);
  return out;
}

export function createRotatedCanvas(source: HTMLCanvasElement, angleDeg: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable for OCR rotation");

  const w = source.width;
  const h = source.height;
  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const newW = Math.ceil(w * cos + h * sin);
  const newH = Math.ceil(w * sin + h * cos);

  out.width = newW;
  out.height = newH;
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -w / 2, -h / 2);

  return out;
}

export function mapBboxFromRotatedToOriginal(
  bbox: { x0: number; y0: number; x1: number; y1: number },
  rotationDeg: number,
  imageWidth: number,
  imageHeight: number,
  rotatedCanvasWidth?: number,
  rotatedCanvasHeight?: number
): { x0: number; y0: number; x1: number; y1: number } {
  const rotW = rotatedCanvasWidth ?? imageWidth;
  const rotH = rotatedCanvasHeight ?? imageHeight;
  const rad = (-rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rcx = rotW / 2;
  const rcy = rotH / 2;
  const srcCx = imageWidth / 2;
  const srcCy = imageHeight / 2;

  const mapPoint = (x: number, y: number): { x: number; y: number } => {
    const dx = x - rcx;
    const dy = y - rcy;
    return {
      x: dx * cos - dy * sin + srcCx,
      y: dx * sin + dy * cos + srcCy,
    };
  };

  const corners = [
    mapPoint(bbox.x0, bbox.y0),
    mapPoint(bbox.x1, bbox.y0),
    mapPoint(bbox.x1, bbox.y1),
    mapPoint(bbox.x0, bbox.y1),
  ];
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);

  return {
    x0: Math.max(0, Math.min(...xs)),
    y0: Math.max(0, Math.min(...ys)),
    x1: Math.min(imageWidth, Math.max(...xs)),
    y1: Math.min(imageHeight, Math.max(...ys)),
  };
}
