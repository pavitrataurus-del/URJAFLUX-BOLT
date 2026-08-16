/**
 * OCR label policy — rooms exist only when blueprint text provides a label.
 * No predefined architectural room list may create or rename room entities.
 */

export const STRUCTURAL_LABEL_KEYWORDS = [
  "main door",
  "main entrance",
  "entrance",
  "entry",
  "door",
  "window",
  "staircase",
  "stair",
  "stove",
  "burner",
  "wash basin",
  "basin",
  "toilet seat",
  "dining table",
  "wc",
] as const;

const NOISE_PREFIXES = ["uploaded", "blueprint", "architectural", "floor plan", "layout with"];

/** Vastu Chakra / margin labels — orientation reference, never room entities. */
const CARDINAL_DIRECTION_MARKERS = new Set([
  "north",
  "east",
  "south",
  "west",
  "n",
  "e",
  "s",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
  "nne",
  "ene",
  "ese",
  "sse",
  "ssw",
  "wsw",
  "wnw",
  "nnw",
]);

const ALLOWED_SHORT_LABELS = new Set(["wc", "st", "br", "lr", "dr", "kt"]);

export function isCardinalDirectionMarker(text: string): boolean {
  const normalized = text.trim().toLowerCase().replace(/\./g, "");
  if (CARDINAL_DIRECTION_MARKERS.has(normalized)) return true;
  if (/^(north|east|south|west)\s*(arrow)?$/i.test(text.trim())) return true;
  return false;
}

/**
 * Reject OCR segmentation fragments (e.g. "7S", "m]", "loo|") before they become entities.
 */
export function isOcrFragmentGarbage(text: string): boolean {
  const t = text.trim();
  if (!t) return true;

  const lower = t.toLowerCase();
  if (ALLOWED_SHORT_LABELS.has(lower)) return false;

  const tokens = t.split(/\s+/).filter(Boolean);
  const letters = (t.match(/[a-zA-Z]/g) || []).length;
  const digits = (t.match(/\d/g) || []).length;
  const specials = (t.match(/[^a-zA-Z0-9\s]/g) || []).length;

  if (t.length <= 2 && letters < 2) return true;
  if (letters === 0 && digits > 0) return true;
  if (letters <= 1 && specials >= 1) return true;
  if (specials > 0 && specials / t.length > 0.28) return true;
  if (/^[\d\W]{1,4}$/.test(t)) return true;
  if (/^[a-z]{1,3}[\]|}\{<>]+$/i.test(t)) return true;
  if (/^loo/i.test(t) && t.length < 10 && !/lobby/i.test(t)) return true;
  if (/^m\]/i.test(t)) return true;
  if (/\b[a-z]\s+[a-z0-9]\s+[a-z0-9]/i.test(t) && t.length < 12) return true;
  if (/^[a-z]\s+[a-z]{4,}/i.test(t) && tokens.length <= 2) return true;

  return false;
}

const ENTITY_NOISE_WORDS = new Set([
  "window",
  "door",
  "scale",
  "entry",
  "gates",
  "stove",
  "basin",
  "stairs",
  "table",
]);

/**
 * Strict gate before a blueprint label becomes a workspace entity.
 * Rejects OCR garbage like "H z 8 H" and "L WOOUNIONVHD".
 */
export function isValidBlueprintEntityLabel(text: string): boolean {
  const t = preserveOcrLabel(text);
  if (!t) return false;
  if (isBlueprintNoiseText(t)) return false;
  if (isCardinalDirectionMarker(t)) return false;
  if (isOcrFragmentGarbage(t)) return false;

  const alpha = t.replace(/[^a-zA-Z]/g, "");
  const letters = alpha.length;
  if (letters < 3) return false;

  const compact = t.replace(/\s+/g, "");
  const letterRatio = letters / compact.length;
  if (letterRatio < 0.62) return false;

  const tokens = t.split(/\s+/).filter(Boolean);
  const singleCharTokens = tokens.filter((tok) => tok.length === 1);
  if (singleCharTokens.length >= 2) return false;
  if (tokens.some((tok) => tok.length === 1 && !ALLOWED_SHORT_LABELS.has(tok.toLowerCase()))) {
    return false;
  }

  if (letters > 4) {
    const vowels = (alpha.match(/[aeiouAEIOU]/gi) || []).length;
    if (vowels / letters < 0.18) return false;
    if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(alpha)) return false;
  }

  const lower = t.toLowerCase();
  if (tokens.length === 1 && letters > 8 && !ENTITY_NOISE_WORDS.has(lower)) {
    const vowels = (alpha.match(/[aeiouAEIOU]/gi) || []).length;
    if (vowels / letters < 0.22) return false;
  }

  return true;
}

export function isBlueprintNoiseText(text: string): boolean {
  const t = text.trim();
  if (!t || t.length < 2) return true;

  const lower = t.toLowerCase();
  if (NOISE_PREFIXES.some((p) => lower.startsWith(p))) return true;
  if (lower.includes("uncalibrated")) return true;
  if (/^scale\s*[:=]/i.test(t)) return true;
  if (/^\d+[\.'"]?\s*(x|×|\*)\s*\d+/i.test(t)) return true;
  if (/^\d+(\.\d+)?\s*(m|mm|cm|ft|in|')$/i.test(t)) return true;
  if (!/[a-zA-Z]/.test(t)) return true;

  return false;
}

export function isStructuralBlueprintLabel(text: string): boolean {
  const lower = text.toLowerCase();
  return STRUCTURAL_LABEL_KEYWORDS.some((sk) => {
    if (sk === "door") {
      return (
        lower.includes("main door") ||
        lower.includes("entrance door") ||
        lower === "door" ||
        lower.endsWith(" door")
      );
    }
    return lower.includes(sk);
  });
}

export function isLikelyRoomLabel(text: string): boolean {
  return !isBlueprintNoiseText(text) && !isStructuralBlueprintLabel(text);
}

/** Preserve OCR casing; only trim whitespace. */
export function preserveOcrLabel(text: string): string {
  return text.trim();
}
