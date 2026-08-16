/** Unwrap Gemini JSON OCR blobs and strip junk page-marker fragments. */
export function normalizeVisionOcrText(raw: string): string {
  let text = (raw || "").trim();
  if (!text) return "";

  text = text.replace(/^---\s*---\s*/g, "").trim();

  const extractTextField = (input: string): string | null => {
    const match = input.match(/"text"\s*:\s*"([\s\S]*?)"\s*(?:\}|$)/);
    if (!match) return null;
    try {
      return JSON.parse(`"${match[1]}"`).trim();
    } catch {
      return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, "\t").trim();
    }
  };

  if (text.startsWith("{") || text.startsWith("[") || text.includes('"text"')) {
    try {
      const parsed = JSON.parse(text) as { text?: string; content?: string; ocrText?: string };
      text = (parsed.text || parsed.content || parsed.ocrText || "").trim();
    } catch {
      const extracted = extractTextField(text);
      if (extracted) text = extracted;
    }
  }

  return text
    .replace(/---\s*---/g, "")
    .replace(/^\{\s*"text"\s*:\s*"/, "")
    .replace(/"\s*\}\s*$/, "")
    .replace(/\r\n/g, "\n")
    .trim();
}
