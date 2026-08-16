/**
 * Production OCR normalization + architectural entity classification engine.
 *
 * Pipeline:
 * 1. Character-level OCR cleanup (I↔L, O↔0, S↔5, B↔8, RN↔M, etc.)
 * 2. Alias map for known blueprint misreads
 * 3. Dictionary exact + fuzzy matching
 * 4. Taxonomy fallback — never UNKNOWN when a high-probability match exists
 *
 * Raw OCR text is preserved internally; corrected display + canonical types drive the app.
 */

import { isBlueprintNoiseText } from "./ocrLabelPolicy";
import {
  ARCHITECTURAL_DICTIONARY,
  type ArchitecturalDictionaryEntry,
  type ArchitecturalEntityCategory,
} from "./architecturalEntityDictionary";
import { normalizeLabelForMatch, roomTaxonomyService } from "./RoomTaxonomyService";

export interface OcrNormalizationResult {
  rawOcrText: string;
  normalizedLabel: string;
  canonicalType: string;
  entityCategory: ArchitecturalEntityCategory;
  ruleElementType: string;
  ocrConfidence: number;
  normalizationConfidence: number;
  isUnknown: boolean;
  isStructural: boolean;
  classificationFailureStage?: string;
  classificationFailureDetail?: string;
}

/** Full-string fuzzy match threshold. */
const FUZZY_HIGH_THRESHOLD = 0.85;
/** Relaxed threshold for short abbreviations (STI, WC, etc.). */
const FUZZY_SHORT_THRESHOLD = 0.72;
/** Minimum confidence to accept any dictionary / taxonomy match. */
const MIN_ACCEPT_THRESHOLD = 0.75;
/** Below this OCR confidence: no fuzzy/taxonomy upgrades — exact + safe alias only. */
const LOW_OCR_CONFIDENCE_FUZZY_BLOCK = 0.88;
/** Token typo tolerance when checking specificity (bedrom → bedroom). */
const TOKEN_TYPO_SIMILARITY = 0.8;

const SHORT_LABEL_MAX_LEN = 6;

/** Known OCR misreads — map to same specificity as blueprint intent (no OPEN KITCHEN upgrade). */
const OCR_ALIAS_MAP: Record<string, string> = {
  "uff kitchen": "KITCHEN",
  "uff kichen": "KITCHEN",
  "open kichen": "KITCHEN",
  "powder room": "POWDER ROOM",
  "powdr room": "POWDER ROOM",
  "powder rm": "POWDER ROOM",
  "open kitchen": "KITCHEN",
  "opcn kitchen": "KITCHEN",
  "sti": "STAIRS",
  "str": "STAIRS",
  "strs": "STAIRS",
  "staircse": "STAIRCASE",
  "staircsae": "STAIRCASE",
  "winoow": "WINDOW",
  "windo w": "WINDOW",
  "windcw": "WINDOW",
  "wind0w": "WINDOW",
  "w1ndow": "WINDOW",
  "intran": "ENTRANCE",
  "intrance": "ENTRANCE",
  "entran": "ENTRANCE",
  "entrance door": "ENTRANCE",
  "entrance": "ENTRANCE",
  "bedrom": "BEDROOM",
  "bedrm": "BEDROOM",
  "bedroon": "BEDROOM",
  "bedr00m": "BEDROOM",
  "mastr bedroom": "MASTER BEDROOM",
  "master bedrom": "MASTER BEDROOM",
  "washr00m": "WASHROOM",
  "washrom": "WASHROOM",
  "washrm": "WASHROOM",
  "bathrom": "BATHROOM",
  "bathr00m": "BATHROOM",
  "kitcken": "KITCHEN",
  "kichen": "KITCHEN",
  "k1tchen": "KITCHEN",
  "livng room": "LIVING ROOM",
  "living rom": "LIVING ROOM",
  "liv1ng room": "LIVING ROOM",
  "dinng": "DINING",
  "d1ning": "DINING",
  "dining table": "DINING TABLE",
  "changinroom": "CHANGING ROOM",
  "changingroom": "CHANGING ROOM",
  "chang in room": "CHANGING ROOM",
  "wash room": "WASHROOM",
  "wash rm": "WASHROOM",
  "changing rm": "CHANGING ROOM",
  "washing area": "WASHING AREA",
  "washing arca": "WASHING AREA",
  "lobby": "LOBBY",
  "lift": "LIFT",
  "entry gates": "ENTRANCE",
  "tolet": "TOILET",
  "to1let": "TOILET",
  "pooia room": "POOJA ROOM",
  "puja room": "PUJA ROOM",
  "temple": "TEMPLE",
  "mandir": "MANDIR",
  "garagc": "GARAGE",
  "garage": "GARAGE",
  "ut1lity": "UTILITY",
  "utilty": "UTILITY",
  "store room": "STORE ROOM",
  "balcony": "BALCONY",
  "baleony": "BALCONY",
};

const DICTIONARY_LOOKUP = new Map<string, ArchitecturalDictionaryEntry>(
  ARCHITECTURAL_DICTIONARY.map((entry) => [normalizeLabelForMatch(entry.displayLabel), entry])
);

interface MatchCandidate {
  entry: ArchitecturalDictionaryEntry;
  confidence: number;
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function fuzzySimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  return 1 - levenshteinDistance(a, b) / maxLen;
}

/**
 * Reject matches that add words/concepts not present in raw OCR
 * (e.g. KITCHEN → OPEN KITCHEN, CHANGING ROOM → POWDER ROOM).
 */
export function isSpecificityUpgrade(rawOcrText: string, targetDisplayLabel: string): boolean {
  const rawNorm = preprocessOcrForMatch(rawOcrText);
  const targetNorm = normalizeLabelForMatch(targetDisplayLabel);
  if (!rawNorm || !targetNorm) return true;
  if (rawNorm === targetNorm) return false;

  const rawTokens = rawNorm.split(/\s+/).filter(Boolean);
  const targetTokens = targetNorm.split(/\s+/).filter(Boolean);

  for (const targetToken of targetTokens) {
    const supported = rawTokens.some((rawToken) => {
      if (rawToken === targetToken) return true;
      return fuzzySimilarity(rawToken, targetToken) >= TOKEN_TYPO_SIMILARITY;
    });
    if (!supported) return true;
  }

  return false;
}

function isSafeNormalizationMatch(
  rawOcrText: string,
  match: MatchCandidate,
  matchMode: "exact" | "alias" | "fuzzy" | "taxonomy",
  ocrConfidence: number
): boolean {
  // Curated alias map = intentional safe expansions (STI→STAIRS), not algorithmic upgrades.
  if (matchMode !== "alias" && isSpecificityUpgrade(rawOcrText, match.entry.displayLabel)) {
    return false;
  }
  if (ocrConfidence < LOW_OCR_CONFIDENCE_FUZZY_BLOCK) {
    return matchMode === "exact" || matchMode === "alias";
  }
  return match.confidence >= MIN_ACCEPT_THRESHOLD;
}

function applyCharSwap(text: string, from: string | RegExp, to: string): string {
  return text.replace(from, to);
}

/**
 * Build OCR normalization variants for common character confusions.
 */
export function buildOcrMatchVariants(text: string): string[] {
  const base = text.trim().replace(/\s+/g, " ").toLowerCase();
  const variants = new Set<string>();

  const add = (s: string) => {
    const v = s.replace(/\s+/g, " ").trim();
    if (v) variants.add(v);
  };

  add(base);
  add(applyCharSwap(base, /0/g, "o"));
  add(applyCharSwap(base, /1/g, "i"));
  add(applyCharSwap(base, /\bl\b/g, "i"));
  add(applyCharSwap(base, /5/g, "s"));
  add(applyCharSwap(base, /8/g, "b"));
  add(applyCharSwap(base, /rn/g, "m"));
  add(applyCharSwap(base, /\bm\b/g, "rn"));
  add(applyCharSwap(base, /vv/g, "w"));
  add(applyCharSwap(base, /vv/g, "w").replace(/0/g, "o"));

  return [...variants];
}

/**
 * Normalize OCR text for matching: lowercase, strip punctuation, apply primary digit swaps.
 */
export function preprocessOcrForMatch(text: string): string {
  let normalized = text.trim().replace(/\s+/g, " ").toLowerCase();
  normalized = normalized.replace(/[()[\]{}.,;:'"!?/\\|_+=*#@&^~`<>]/g, " ");
  normalized = normalized.replace(/\s+/g, " ").trim();
  normalized = normalized.replace(/0/g, "o");
  normalized = normalized.replace(/1/g, "i");
  normalized = normalized.replace(/\bl\b/g, "i");
  return normalized;
}

function resolveAlias(normalized: string, rawOcrText: string, ocrConfidence: number): MatchCandidate | null {
  const direct = OCR_ALIAS_MAP[normalized];
  if (direct) {
    const entry = DICTIONARY_LOOKUP.get(normalizeLabelForMatch(direct));
    if (entry) {
      const candidate = { entry, confidence: 0.96 };
      if (isSafeNormalizationMatch(rawOcrText, candidate, "alias", ocrConfidence)) {
        return candidate;
      }
    }
  }

  const compact = normalized.replace(/\s+/g, "");
  for (const [aliasKey, aliasValue] of Object.entries(OCR_ALIAS_MAP)) {
    if (aliasKey.replace(/\s+/g, "") === compact) {
      const entry = DICTIONARY_LOOKUP.get(normalizeLabelForMatch(aliasValue));
      if (entry) {
        const candidate = { entry, confidence: 0.94 };
        if (isSafeNormalizationMatch(rawOcrText, candidate, "alias", ocrConfidence)) {
          return candidate;
        }
      }
    }
  }

  return null;
}

function findDictionaryMatch(
  normalized: string,
  rawOcrText: string,
  ocrConfidence: number
): MatchCandidate | null {
  const exact = DICTIONARY_LOOKUP.get(normalized);
  if (exact) {
    const candidate = { entry: exact, confidence: 1 };
    if (isSafeNormalizationMatch(rawOcrText, candidate, "exact", ocrConfidence)) {
      return candidate;
    }
    return null;
  }

  if (ocrConfidence < LOW_OCR_CONFIDENCE_FUZZY_BLOCK) {
    return null;
  }

  const threshold =
    normalized.length <= SHORT_LABEL_MAX_LEN ? FUZZY_SHORT_THRESHOLD : FUZZY_HIGH_THRESHOLD;

  let best: MatchCandidate | null = null;

  for (const [canonicalKey, entry] of DICTIONARY_LOOKUP.entries()) {
    const score = fuzzySimilarity(normalized, canonicalKey);
    if (score < threshold || score <= (best?.confidence ?? 0)) continue;
    const candidate = { entry, confidence: score };
    if (!isSafeNormalizationMatch(rawOcrText, candidate, "fuzzy", ocrConfidence)) continue;
    best = candidate;
  }

  if (best) return best;

  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length >= 2) {
    const suffix = tokens[tokens.length - 1];
    const prefix = tokens.slice(0, -1).join(" ");
    let suffixBest: MatchCandidate | null = null;

    for (const [canonicalKey, entry] of DICTIONARY_LOOKUP.entries()) {
      const canonicalTokens = canonicalKey.split(" ");
      const canonicalSuffix = canonicalTokens[canonicalTokens.length - 1];
      const suffixScore = fuzzySimilarity(suffix, canonicalSuffix);
      if (suffixScore < 0.9) continue;

      const canonicalPrefix = canonicalTokens.slice(0, -1).join(" ");
      if (!canonicalPrefix) continue;

      const prefixScore = fuzzySimilarity(prefix, canonicalPrefix);
      const combined = suffixScore * 0.55 + prefixScore * 0.45;
      const combinedThreshold = Math.max(MIN_ACCEPT_THRESHOLD, threshold - 0.05);
      if (combined < combinedThreshold || combined <= (suffixBest?.confidence ?? 0)) continue;

      const candidate = { entry, confidence: combined };
      if (!isSafeNormalizationMatch(rawOcrText, candidate, "fuzzy", ocrConfidence)) continue;
      suffixBest = candidate;
    }

    if (suffixBest) return suffixBest;
  }

  return null;
}

function findBestMatchAcrossVariants(
  variants: string[],
  rawOcrText: string,
  ocrConfidence: number
): MatchCandidate | null {
  let best: MatchCandidate | null = null;

  for (const variant of variants) {
    const alias = resolveAlias(variant, rawOcrText, ocrConfidence);
    if (alias && alias.confidence > (best?.confidence ?? 0)) {
      best = alias;
    }

    const dict = findDictionaryMatch(variant, rawOcrText, ocrConfidence);
    if (dict && dict.confidence > (best?.confidence ?? 0)) {
      best = dict;
    }
  }

  return best;
}

function taxonomyFallback(
  variants: string[],
  rawOcrText: string,
  ocrConfidence: number
): MatchCandidate | null {
  if (ocrConfidence < LOW_OCR_CONFIDENCE_FUZZY_BLOCK) {
    return null;
  }

  let best: MatchCandidate | null = null;

  for (const variant of variants) {
    const taxonomy = roomTaxonomyService.resolveFromDisplayName(variant);
    if (taxonomy.canonicalType === "UNKNOWN_ROOM" || taxonomy.canonicalType === "UNKNOWN") {
      continue;
    }

    const entry =
      ARCHITECTURAL_DICTIONARY.find((e) => e.canonicalType === taxonomy.canonicalType) ??
      ARCHITECTURAL_DICTIONARY.find(
        (e) =>
          e.canonicalType === taxonomy.canonicalType &&
          fuzzySimilarity(variant, normalizeLabelForMatch(e.displayLabel)) >= 0.6
      );

    if (!entry) continue;

    const variantScore = fuzzySimilarity(
      variant,
      normalizeLabelForMatch(entry.displayLabel)
    );
    const confidence = Math.max(taxonomy.confidence, variantScore, MIN_ACCEPT_THRESHOLD);
    const candidate = { entry, confidence };
    if (!isSafeNormalizationMatch(rawOcrText, candidate, "taxonomy", ocrConfidence)) continue;

    if (confidence > (best?.confidence ?? 0)) {
      best = candidate;
    }
  }

  return best;
}

function buildResultFromMatch(
  rawOcrText: string,
  ocrConfidence: number,
  match: MatchCandidate
): OcrNormalizationResult {
  const { entry, confidence } = match;
  return {
    rawOcrText,
    normalizedLabel: entry.displayLabel,
    canonicalType: entry.canonicalType,
    entityCategory: entry.category,
    ruleElementType: entry.ruleElementType,
    ocrConfidence,
    normalizationConfidence: confidence,
    isUnknown: false,
    isStructural: entry.category === "STRUCTURE",
  };
}

function buildUnknownResult(
  rawOcrText: string,
  ocrConfidence: number,
  failureStage: string,
  failureDetail: string
): OcrNormalizationResult {
  return {
    rawOcrText,
    normalizedLabel: "UNKNOWN ROOM",
    canonicalType: "UNKNOWN_ROOM",
    entityCategory: "ROOM",
    ruleElementType: "unknown",
    ocrConfidence,
    normalizationConfidence: 0,
    isUnknown: true,
    isStructural: false,
    classificationFailureStage: failureStage,
    classificationFailureDetail: failureDetail,
  };
}

/**
 * Classify a single OCR label into a standardized architectural entity.
 * Never returns UNKNOWN when a high-probability dictionary or taxonomy match exists.
 */
export function classifyArchitecturalEntity(
  rawText: string,
  ocrConfidence: number
): OcrNormalizationResult {
  const rawOcrText = rawText.trim();

  if (!rawOcrText || isBlueprintNoiseText(rawOcrText)) {
    return buildUnknownResult(
      rawOcrText,
      ocrConfidence,
      "OCR_NOISE_OR_EMPTY",
      "Label empty or filtered as blueprint noise"
    );
  }

  const preprocessed = preprocessOcrForMatch(rawOcrText);
  const variants = buildOcrMatchVariants(preprocessed);

  const dictionaryMatch = findBestMatchAcrossVariants(variants, rawOcrText, ocrConfidence);
  if (dictionaryMatch) {
    return buildResultFromMatch(rawOcrText, ocrConfidence, dictionaryMatch);
  }

  const taxonomyMatch = taxonomyFallback(variants, rawOcrText, ocrConfidence);
  if (taxonomyMatch) {
    return buildResultFromMatch(rawOcrText, ocrConfidence, taxonomyMatch);
  }

  const bestScore = dictionaryMatch?.confidence ?? taxonomyMatch?.confidence ?? 0;
  return buildUnknownResult(
    rawOcrText,
    ocrConfidence,
    "NORMALIZER_NO_MATCH",
    `No dictionary/taxonomy match above threshold (${MIN_ACCEPT_THRESHOLD}); best score ${bestScore.toFixed(2)}`
  );
}

/** @deprecated Use classifyArchitecturalEntity — kept for existing imports/tests. */
export function normalizeOcrEntity(rawText: string, ocrConfidence: number): OcrNormalizationResult {
  return classifyArchitecturalEntity(rawText, ocrConfidence);
}
