import fs from "fs";
import path from "path";

/** Minimal valid 1x1 PNG - for blueprint render test */
const minimalPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const outDir = path.resolve(process.cwd(), "test-data");
fs.mkdirSync(outDir, { recursive: true });

const pngPath = path.join(outDir, "floor_plan_test.png");
fs.writeFileSync(pngPath, Buffer.from(minimalPngBase64, "base64"));
console.log("Written:", pngPath);
