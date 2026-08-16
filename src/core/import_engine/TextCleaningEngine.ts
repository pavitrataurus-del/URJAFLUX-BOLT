export class TextCleaningEngine {
  public static normalize(rawText: string): string {
    if (!rawText) return "";
    let cleanText = rawText;
    
    // 1. Remove control characters & OCR noise
    cleanText = cleanText.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "");
    
    // 2. Fix hyphenated line breaks (e.g., "knowl-\nedge" -> "knowledge")
    cleanText = cleanText.replace(/(\w+)-\s*\n\s*(\w+)/g, "$1$2");
    
    // 3. Normalize multiple spaces and line breaks
    cleanText = cleanText.replace(/ +/g, " ");
    cleanText = cleanText.replace(/\n{3,}/g, "\n\n");
    
    // 4. Trim edges
    return cleanText.trim();
  }
}
