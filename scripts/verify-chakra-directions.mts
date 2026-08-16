/**
 * Verifies OCR entity detection + Vastu Chakra direction assignment on test blueprint.
 */
import { readFileSync } from "fs";
import { BlueprintIntelligenceEngine } from "../src/services/blueprintIntelligenceEngine.ts";
import { PropertyRecognitionEngine } from "../src/recognition/PropertyRecognitionEngine.ts";
import { EnterpriseCognitiveReasoningService } from "../src/core/knowledge_ingestion/reasoning/EnterpriseCognitiveReasoningService.ts";

const imagePath = "C:\\Users\\DELL\\Downloads\\URJAFLOX BOLT\\test-blueprint-home.png";

function imageDimensions(path: string): { width: number; height: number } {
  const buf = readFileSync(path);
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc2) {
      return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    }
    i += 2 + len;
  }
  throw new Error("Could not read image dimensions");
}

const { width: naturalWidth, height: naturalHeight } = imageDimensions(imagePath);
const blueprint = {
  naturalWidth,
  naturalHeight,
  width: 12,
  height: 10,
  x: 0,
  y: 0,
  pixelsPerMeter: 40,
};

console.log(`Image: ${naturalWidth}x${naturalHeight}`);

const ocrItems = await BlueprintIntelligenceEngine.extractOcrFromImage(imagePath, blueprint);
console.log(`\nOCR lines (${ocrItems.length}):`);
ocrItems.forEach((item) =>
  console.log(`  [${item.confidence.toFixed(2)}] "${item.text}" @ (${item.bbox.x.toFixed(2)}, ${item.bbox.y.toFixed(2)})`)
);

const rawEntities = BlueprintIntelligenceEngine.mapOcrItemsToRawEntities(ocrItems);
const recognitionSummary = PropertyRecognitionEngine.recognizeProperty(rawEntities, 0, true);

console.log(`\nRecognized entities (${recognitionSummary.entities.length}):`);
recognitionSummary.entities.forEach((e) => {
  console.log(`  ${e.displayName} | canonical=${e.canonicalType} | category=${e.category}`);
});

const chakraCenter = { x: blueprint.x, y: blueprint.y };
const vastuNorthCalibration = 0;
const chakraRotation = 0;

console.log(`\nChakra center: (${chakraCenter.x}, ${chakraCenter.y}), North cal=${vastuNorthCalibration}°, rotation=${chakraRotation}°`);

const roomEntities = recognitionSummary.entities.filter(
  (e) => e.category === "ROOM" || e.category === "STRUCTURE"
);

console.log(`\nDirection assignment (16-zone):`);
for (const rec of roomEntities) {
  const center = {
    x: rec.coordinates.x + rec.coordinates.width / 2,
    y: rec.coordinates.y + rec.coordinates.height / 2,
  };
  const sync = EnterpriseCognitiveReasoningService.verifyChakraAngleVectorSync(
    center,
    chakraCenter,
    vastuNorthCalibration,
    chakraRotation
  );
  console.log(
    `  ${rec.displayName.padEnd(18)} → ${sync.subZone.padEnd(28)} (${sync.degreeVector.toFixed(1)}°)`
  );
}
