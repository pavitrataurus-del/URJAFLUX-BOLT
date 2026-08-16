const fs = require('fs');

let extractedText = ""; // simulated scanned PDF page
let fullExtractedText = "";
let totalPages = 3;

for(let i=1; i<=totalPages; i++) {
  fullExtractedText += `\n--- PAGE ${i} OF ${totalPages} ---\n${extractedText}\n`;
}

console.log("1. After PdfDocumentParser assembly:");
console.log(fullExtractedText);

// Stage 5 overwrites dataUrlOrText
let dataUrlOrText = fullExtractedText.trim();

// OcrAndExtractionStage
let data = dataUrlOrText;
let ocrText = "";
if (data.startsWith("data:image") || data.startsWith("data:application/pdf")) {
    ocrText = "REAL OCR TEXT";
} else {
    ocrText = data;
}

console.log("2. After OcrAndExtractionStage:");
console.log(ocrText);

// DocumentCleaningStage
let clean = ocrText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\t/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

clean = clean.replace(/Page \d+ of \d+/gi, "");

console.log("3. After DocumentCleaningStage:");
console.log(clean);

