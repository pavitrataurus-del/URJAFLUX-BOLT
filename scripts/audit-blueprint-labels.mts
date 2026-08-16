/**
 * Browser-based blueprint label audit (run: npx tsx scripts/audit-blueprint-labels.mts <image-path>)
 */
import puppeteer from "puppeteer";
import { readFileSync, existsSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const imageArg = process.argv[2];
const candidates = [
  imageArg,
  path.join(process.cwd(), "public", "test-blueprint.png"),
  path.join(
    process.cwd(),
    "..",
    ".cursor",
    "projects",
    "c-Users-DELL-Downloads-URJAFLOX-BOLT",
    "assets",
    "c__Users_DELL_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Home_1-2726dd20-682b-4963-ae84-974827f240b0.png"
  ),
].filter(Boolean) as string[];

const imagePath = candidates.find((p) => existsSync(p));
if (!imagePath) {
  console.error("No blueprint image found. Pass path as argument.");
  process.exit(1);
}

const fileUrl = pathToFileURL(path.resolve(imagePath)).href;
const buf = readFileSync(imagePath);
let w = 1000;
let h = 800;
if (buf[0] === 0x89) {
  w = buf.readUInt32BE(16);
  h = buf.readUInt32BE(20);
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.goto("about:blank");
await page.addScriptTag({
  path: path.join(process.cwd(), "node_modules/tesseract.js/dist/tesseract.min.js"),
});

const result = await page.evaluate(async (url: string, naturalWidth: number, naturalHeight: number) => {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || naturalWidth;
  canvas.height = img.naturalHeight || naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const worker = await (window as any).Tesseract.createWorker("eng");
  await worker.setParameters({ tessedit_pageseg_mode: "11" });
  const { data } = await worker.recognize(canvas);
  await worker.terminate();

  const lines: string[] = [];
  const blocks = data.blocks || [];
  for (const block of blocks) {
    for (const para of block.paragraphs || []) {
      for (const line of para.lines || []) {
        const t = (line.text || "").trim();
        if (t) lines.push(t);
      }
    }
  }
  return { lines, width: canvas.width, height: canvas.height };
}, fileUrl, w, h);

console.log("Image:", imagePath);
console.log("Size:", result.width, "x", result.height);
console.log("OCR lines:", result.lines.length);
result.lines.forEach((line) => console.log(" -", line));
console.log("Entity-like labels (filtered):", result.lines.filter((l) => l.length > 2 && /[A-Za-z]{3}/.test(l)).length);

await browser.close();
