import { BlueprintIntelligenceEngine } from "../src/services/blueprintIntelligenceEngine";
import path from "path";

const imgPath = path.resolve(process.cwd(), "test-data/floor_plan_rooms.png");
const fileUrl = `file:///${imgPath.replace(/\\/g, "/")}`;
const bp = { naturalWidth: 800, naturalHeight: 600, width: 20, height: 15, url: fileUrl };

console.log("Running Tesseract OCR on", imgPath);
const items = await BlueprintIntelligenceEngine.extractOcrFromImage(fileUrl, bp);
console.log("Detected", items.length, "items:", items.map((i) => i.text));
