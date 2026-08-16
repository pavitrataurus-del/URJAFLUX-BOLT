const nativeText = "\n--- PAGE 1 OF 1 ---\n";
const ocrText = "This is the real text from OCR.";
const isDataUrl = false;
const textWithoutMarkers = nativeText.replace(/--- PAGE \d+ OF \d+ ---/gi, "");
const meaningfulText = textWithoutMarkers.replace(/[\s\n\r\t]+/g, "");
const hasSelectableText = !isDataUrl && meaningfulText.length >= 50;

let rawTextContent;
if (hasSelectableText) {
  rawTextContent = nativeText;
} else {
  // the current code does:
  rawTextContent = nativeText.length > 0 ? nativeText : ocrText;
}

console.log("Meaningful text length:", meaningfulText.length);
console.log("hasSelectableText:", hasSelectableText);
console.log("rawTextContent:", rawTextContent);
