/**
 * Shloka / classical passage refinement — converts Vedic treatise OCR into
 * homeowner-actionable Hindi + English remedies grounded in passage signals.
 * Works offline (heuristic) with optional Gemini upgrade later.
 */

import { buildObjectMatchTerms, buildZoneMatchTerms } from "../core/knowledge_ingestion/semantic/MultilingualVastuTermResolver";
import { isPresentableVaultRemedy, isReligiousOrNarrativeProse } from "./vaultRemedyTextQuality";

const VASTU_KNOWLEDGE_RE =
  /(?:vastu|shastra|direction|north|south|east|west|north-east|northeast|ishanya|agneya|nairutya|vayavya|kitchen|toilet|bedroom|entrance|door|stair|brahmasthan|zone|element|fire|water|air|space|plot|house|room|building|mandir|temple|sleep|cooking|borewell|sump|main\s+door|रसोई|सोपान|शयन|द्वार|प्रवेश)/i;

function alphaRatio(text: string): number {
  const letters = (text.match(/[a-zA-Z\u0900-\u097F\u0966-\u096F]/g) || []).length;
  return letters / Math.max(text.length, 1);
}

function countMeaningfulWords(text: string): number {
  const latin = text.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z0-9]/g, "").length > 2);
  const devanagari = (text.match(/[\u0900-\u097F]+/g) || []).filter((w) => w.length > 1);
  return latin.length + devanagari.length;
}

function hasDevanagariScript(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

function isVastuKnowledgePassage(text: string): boolean {
  return VASTU_KNOWLEDGE_RE.test(text);
}

export type BookTradition = "VEDIC" | "MODERN" | "HYBRID";

export interface ShlokaRefinementResult {
  originalCitation: string;
  conditionSummary: string;
  remedyEnglish: string;
  remedyHindi: string;
  confidence: number;
  inferredObjects: string[];
  inferredZones: string[];
  refinedFromShloka: boolean;
  bookTradition: BookTradition;
}

export interface VaultRuleEvidenceExtended {
  sourceBook?: string;
  chapter?: string;
  verse?: string;
  pageNumber?: number;
  confidence: number;
  originalCitation?: string;
  remedyEnglish?: string;
  remedyHindi?: string;
  refinedFromShloka?: boolean;
  bookTradition?: BookTradition;
}

const UNFAVORABLE_RE =
  /(?:avoid|not\s+(?:good|auspicious|recommended)|inauspicious|prohibited|harm|defect|wrong|do\s+not|never|should\s+not|undesirable|not\s+place|बच|न\s*रख|अशुभ|वर्ज|त्याग)/i;

const FAVORABLE_RE =
  /(?:auspicious|favorable|ideal|recommended|proper|suitable|good\s+for|शुभ|उत्तम|योग्य)/i;

const PURE_WORSHIP_PROSE_RE =
  /(?:enjoying\s+your\s+beloved|hidden\s+offerings?\s+of\s+ghee|praying\s+to\s+the\s+two\s+deities|gems\s+and\s+wealth|king\s+should\s+provide|architects?\s+who\s+are\s+skilled|formatting\s*:|plain\s+text\s+only)/i;

interface RemedyTemplate {
  objects: string[];
  zones: string[];
  requiresUnfavorable?: boolean;
  remedyEnglish: string;
  remedyHindi: string;
}

const REMEDY_TEMPLATES: RemedyTemplate[] = [
  {
    objects: ["kitchen"],
    zones: ["ne", "nne", "ene"],
    requiresUnfavorable: true,
    remedyEnglish:
      "Avoid kitchen in North-East. Place the cooktop in South-East, keep North-East open and light, and install a natural yellow marble slab beneath the stove.",
    remedyHindi:
      "उत्तर-पूर्व में रसोई न रखें। चूल्हा दक्षिण-पूर्व में स्थापित करें, उत्तर-पूर्व को हल्का और खुला रखें, और चूल्हे के नीचे प्राकृतिक पीले संगमरमर का स्लैब लगाएं।",
  },
  {
    objects: ["kitchen"],
    zones: ["sw", "ssw", "wsw"],
    requiresUnfavorable: true,
    remedyEnglish:
      "Avoid kitchen in South-West. Shift cooking to South-East if possible; otherwise place a warm yellow base under the stove and keep South-West storage minimal.",
    remedyHindi:
      "दक्षिण-पश्चिम में रसोई न रखें। संभव हो तो रसोई दक्षिण-पूर्व में स्थानांतरित करें; अन्यथा चूल्हे के नीचे गर्म पीली आधार स्लैब रखें और दक्षिण-पश्चिम में भारी भंडारण न रखें।",
  },
  {
    objects: ["staircase"],
    zones: ["n", "nnw", "nne"],
    requiresUnfavorable: true,
    remedyEnglish:
      "Avoid staircase in North. Relocate stairs to South or West if structurally possible; otherwise keep North light and avoid heavy structure in the North zone.",
    remedyHindi:
      "उत्तर दिशा में सीढ़ी न रखें। संभव हो तो सीढ़ी दक्षिण या पश्चिम में स्थानांतरित करें; अन्यथा उत्तर को हल्का रखें और वहाँ भारी निर्माण से बचें।",
  },
  {
    objects: ["toilet"],
    zones: ["ne", "nne", "ene", "brahmasthan"],
    requiresUnfavorable: true,
    remedyEnglish:
      "Avoid toilet in North-East or center. Shift wet zones to North-West or West and keep North-East pure, light, and clutter-free.",
    remedyHindi:
      "उत्तर-पूर्व या केंद्र में शौचालय न रखें। गीले क्षेत्र उत्तर-पश्चिम या पश्चिम में स्थानांतरित करें और उत्तर-पूर्व को शुद्ध, हल्का और व्यवस्थित रखें।",
  },
  {
    objects: ["bedroom"],
    zones: ["ne", "nne", "ene"],
    requiresUnfavorable: true,
    remedyEnglish:
      "Avoid master bedroom in North-East. Prefer South-West for stability; keep North-East open for prayer or light use only.",
    remedyHindi:
      "उत्तर-पूर्व में मास्टर बेडरूम न रखें। स्थिरता के लिए दक्षिण-पश्चिम पसंद करें; उत्तर-पूर्व को प्रार्थना या हल्के उपयोग के लिए खुला रखें।",
  },
  {
    objects: ["living_room", "living"],
    zones: ["se", "ese", "sse"],
    remedyEnglish:
      "Living room in South-East is acceptable when well ventilated. Keep warm tones, good lighting, and avoid water storage in this fire zone.",
    remedyHindi:
      "दक्षिण-पूर्व में लिविंग रूम ventilated हो तो स्वीकार्य है। गर्म रंग, अच्छी रोशनी रखें और इस अग्नि क्षेत्र में पानी का भंडारण न रखें।",
  },
  {
    objects: ["window", "door"],
    zones: ["n", "nne", "ne"],
    remedyEnglish:
      "Keep North and North-East windows open and clean for positive flow. Avoid heavy grills or dark blocking treatments in these zones.",
    remedyHindi:
      "उत्तर और उत्तर-पूर्व की खिड़कियाँ खुली और साफ रखें। इन क्षेत्रों में भारी ग्रिल या अंधकारकारी अवरोध न लगाएं।",
  },
  {
    objects: ["pooja", "pooja_room"],
    zones: ["ne", "nne", "ene"],
    remedyEnglish:
      "Place the puja space in North-East. Keep idols facing East or West, use white or light yellow tones, and maintain daily cleanliness.",
    remedyHindi:
      "पूजा स्थान उत्तर-पूर्व में रखें। मूर्तियाँ पूर्व या पश्चिम की ओर रखें, सफेद या हल्के पीले रंग रखें, और दैनिक स्वच्छता बनाए रखें।",
  },
  {
    objects: ["main_entrance", "entrance", "door"],
    zones: ["e", "ne", "n"],
    remedyEnglish:
      "Keep the main entrance well lit and obstruction-free. Use an auspicious threshold and avoid shoes or clutter directly facing the entry.",
    remedyHindi:
      "मुख्य प्रवेश को अच्छी रोशनी और बिना रुकावट के रखें। शुभ दहलीज रखें और प्रवेश के सामने जूते या अव्यवस्था न रखें।",
  },
];

const OBJECT_KEYS = [
  "kitchen",
  "toilet",
  "bedroom",
  "staircase",
  "living_room",
  "living",
  "window",
  "door",
  "pooja",
  "pooja_room",
  "main_entrance",
  "entrance",
  "store",
  "dining",
] as const;

const ZONE_CODES = [
  "ne",
  "se",
  "sw",
  "nw",
  "n",
  "e",
  "s",
  "w",
  "nne",
  "ene",
  "ese",
  "sse",
  "ssw",
  "wsw",
  "wnw",
  "nnw",
  "brahmasthan",
] as const;

export function inferBookTradition(
  doc: Pick<{ title?: string; category?: string; originalName?: string }, "title" | "category" | "originalName">
): BookTradition {
  const haystack = `${doc.title || ""} ${doc.category || ""} ${doc.originalName || ""}`.toLowerCase();
  if (/modern|contemporary|21st|apartment|\bcondo\b/i.test(haystack)) return "MODERN";
  if (/vedic|shastra|mayamat|samhita|viswakarm|purana|classical|treatise|sanskrit|shilpa/i.test(haystack)) {
    return "VEDIC";
  }
  return "HYBRID";
}

function detectObjectsInText(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();

  if (/prayer\s+room|mandir|puja|pooja/i.test(text)) found.add("pooja");
  if (/kitchen|cooking|rasoi|agni/i.test(text)) found.add("kitchen");
  if (/stair|sopan|steps/i.test(text)) found.add("staircase");
  if (/toilet|bathroom|lavatory|shauch/i.test(text)) found.add("toilet");
  if (/bedroom|sleep|master\s+bed/i.test(text)) found.add("bedroom");
  if (/living\s+room|drawing|lounge|hall/i.test(text)) found.add("living");
  if (/window|khidki|खिड़की/i.test(text)) found.add("window");
  if (/main\s+door|entrance|entry|pravesh|प्रवेश/i.test(text)) found.add("entrance");
  if (/\bdoor\b/i.test(lower)) found.add("door");

  for (const key of OBJECT_KEYS) {
    const terms = buildObjectMatchTerms({ objectType: key, canonicalType: key.toUpperCase() });
    if (terms.some((term) => text.includes(term) || lower.includes(term.toLowerCase()))) {
      found.add(key.replace("living_room", "living").replace("pooja_room", "pooja"));
    }
  }
  return [...found];
}

function detectZonesInText(text: string): string[] {
  const found = new Set<string>();
  for (const code of ZONE_CODES) {
    const terms = buildZoneMatchTerms(code, code);
    if (terms.some((term) => text.includes(term) || text.toLowerCase().includes(term.toLowerCase()))) {
      found.add(code);
    }
  }
  return [...found];
}

function matchTemplate(objects: string[], zones: string[], passage: string): RemedyTemplate | null {
  const unfavorable = UNFAVORABLE_RE.test(passage);
  const favorable = FAVORABLE_RE.test(passage);

  for (const template of REMEDY_TEMPLATES) {
    const objectHit = template.objects.some((o) => objects.includes(o));
    const zoneHit = template.zones.some((z) => zones.includes(z));
    if (!objectHit || !zoneHit) continue;
    if (template.requiresUnfavorable && !unfavorable && favorable) continue;
    return template;
  }
  return null;
}

function buildGenericRefinement(
  passage: string,
  objects: string[],
  zones: string[]
): ShlokaRefinementResult | null {
  if (zones.length === 0 && objects.length === 0) return null;

  const zoneLabel = zones[0]?.toUpperCase() || "this zone";
  const objectLabel = objects[0]?.replace(/_/g, " ") || "this element";
  const unfavorable = UNFAVORABLE_RE.test(passage);

  const remedyEnglish = unfavorable
    ? `Avoid unfavorable placement of ${objectLabel} in ${zoneLabel}. Realign this element to its suitable directional zone and keep ${zoneLabel} clean, light, and elementally balanced.`
    : `Place ${objectLabel} in ${zoneLabel} according to classical directional harmony. Keep the zone clean, well lit, and free from clutter.`;

  const remedyHindi = unfavorable
    ? `${zoneLabel} में ${objectLabel} का अनुपयुक्त स्थान न रखें। इस तत्व को उपयुक्त दिशा में संरेखित करें और ${zoneLabel} को स्वच्छ, हल्का और तत्व संतुलित रखें।`
    : `${zoneLabel} में ${objectLabel} को शास्त्रीय दिशा अनुसार रखें। क्षेत्र को स्वच्छ, रोशन और व्यवस्थित रखें।`;

  if (!isPresentableVaultRemedy(remedyEnglish)) return null;

  return {
    originalCitation: passage.slice(0, 220),
    conditionSummary: passage.slice(0, 280),
    remedyEnglish,
    remedyHindi,
    confidence: 0.62,
    inferredObjects: objects,
    inferredZones: zones,
    refinedFromShloka: true,
    bookTradition: "VEDIC",
  };
}

export function isRefinableShlokaPassage(passage: string, pageText: string): boolean {
  const combined = `${passage} ${pageText}`.trim();
  if (combined.length < 25) return false;
  if (PURE_WORSHIP_PROSE_RE.test(combined)) return false;
  if (!isVastuKnowledgePassage(combined) && !hasDevanagariScript(combined)) return false;
  if (alphaRatio(combined) < 0.1) return false;
  if (countMeaningfulWords(combined) < 2) return false;

  const objects = detectObjectsInText(combined);
  const zones = detectZonesInText(combined);
  if (objects.length > 0 && zones.length > 0) return true;

  return (
    isReligiousOrNarrativeProse(combined) ||
    hasDevanagariScript(combined) ||
    UNFAVORABLE_RE.test(combined) ||
    FAVORABLE_RE.test(combined)
  );
}

export function refinePassageToActionableRemedy(
  passage: string,
  pageText: string,
  bookTradition: BookTradition = "VEDIC"
): ShlokaRefinementResult | null {
  const combined = `${passage} ${pageText}`.trim();
  if (!isRefinableShlokaPassage(passage, pageText)) return null;

  const objects = detectObjectsInText(combined);
  const zones = detectZonesInText(combined);
  const template = matchTemplate(objects, zones, combined);

  if (template) {
    return {
      originalCitation: passage.slice(0, 220),
      conditionSummary: passage.slice(0, 280),
      remedyEnglish: template.remedyEnglish,
      remedyHindi: template.remedyHindi,
      confidence: 0.88,
      inferredObjects: objects.length > 0 ? objects : template.objects,
      inferredZones: zones.length > 0 ? zones : template.zones,
      refinedFromShloka: true,
      bookTradition,
    };
  }

  const generic = buildGenericRefinement(combined, objects, zones);
  if (generic) generic.bookTradition = bookTradition;
  return generic;
}

export async function refinePassageWithGemini(
  passage: string,
  context: { bookTitle: string; pageNumber: number; bookTradition: BookTradition }
): Promise<ShlokaRefinementResult | null> {
  if (typeof fetch === "undefined") return null;

  try {
    const response = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a Vastu knowledge refinement engine. Ground answers ONLY in this OCR passage from "${context.bookTitle}" page ${context.pageNumber}. Do not invent facts.

Passage:
${passage.slice(0, 1800)}

Return JSON only:
{
  "originalCitation": "short excerpt",
  "conditionSummary": "what the passage says about placement in plain English/Hindi mix",
  "remedyEnglish": "actionable homeowner remedy with place/avoid/install/keep language",
  "remedyHindi": "same remedy in Hindi Devanagari",
  "inferredObjects": ["kitchen|bedroom|staircase|toilet|window|door|living|entrance|pooja"],
  "inferredZones": ["ne|se|sw|nw|n|e|s|w"]
}`,
              },
            ],
          },
        ],
        config: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as { text?: string };
    if (!payload.text) return null;

    const parsed = JSON.parse(payload.text) as Partial<ShlokaRefinementResult>;
    if (!isPresentableVaultRemedy(parsed.remedyEnglish)) return null;

    return {
      originalCitation: parsed.originalCitation || passage.slice(0, 220),
      conditionSummary: parsed.conditionSummary || passage.slice(0, 280),
      remedyEnglish: parsed.remedyEnglish!,
      remedyHindi: parsed.remedyHindi || parsed.remedyEnglish!,
      confidence: 0.9,
      inferredObjects: parsed.inferredObjects || detectObjectsInText(passage),
      inferredZones: parsed.inferredZones || detectZonesInText(passage),
      refinedFromShloka: true,
      bookTradition: context.bookTradition,
    };
  } catch {
    return null;
  }
}
