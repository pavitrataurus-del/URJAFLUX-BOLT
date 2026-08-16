import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

function ensurePdfWorker() {
  if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "4.10.38"}/legacy/build/pdf.worker.min.mjs`;
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://unpkg.com/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs";
    }
  }
}

export async function rasterizePdfFirstPageToDataUrl(
  file: File,
  scale = 2
): Promise<{ dataUrl: string; width: number; height: number }> {
  ensurePdfWorker();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable for PDF rasterization.");

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const pdfDoc = pdf as unknown as { destroy?: () => Promise<void> };
  if (typeof pdfDoc.destroy === "function") {
    await pdfDoc.destroy();
  }

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
  };
}

export function isPdfFile(file: File): boolean {
  return file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
}
