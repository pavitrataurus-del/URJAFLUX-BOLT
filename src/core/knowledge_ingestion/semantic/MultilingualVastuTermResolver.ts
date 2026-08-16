/**
 * Multilingual Vastu term resolver — SSOT for vault rule matching across
 * English, Hindi (Devanagari), Sanskrit transliteration, and OCR variants.
 * All analysis/remedy retrieval must use this instead of English-only keyword lists.
 */

import { SynonymEngine } from "./SynonymEngine";

const ZONE_CODE_SYNONYM_SEEDS: Record<string, string[]> = {
  n: ["North", "Kuber", "उत्तर"],
  s: ["South", "Yama", "दक्षिण"],
  e: ["East", "पूर्व"],
  w: ["West", "Varun", "पश्चिम"],
  ne: ["Ishanya", "North-East", "ईशान"],
  se: ["Agneya", "South-East", "अग्नेय"],
  sw: ["Nairutya", "South-West", "नैऋत्य"],
  nw: ["Vayavya", "North-West", "वायव्य"],
  nne: ["North-North-East", "NNE"],
  ene: ["East-North-East", "ENE"],
  ese: ["East-South-East", "ESE"],
  sse: ["South-South-East", "SSE"],
  ssw: ["South-South-West", "SSW"],
  wsw: ["West-South-West", "WSW"],
  wnw: ["West-North-West", "WNW"],
  nnw: ["North-North-West", "NNW"],
  brahmasthan: ["Brahmasthan", "Center", "ब्रह्मस्थान"],
};

const OBJECT_SYNONYM_SEEDS: Record<string, string[]> = {
  bedroom: ["Bedroom", "Master Bedroom", "Sayanagriha", "शयन", "शयनकक्ष"],
  kitchen: ["Kitchen", "Rasoi", "Pakashala", "रसोई"],
  toilet: ["Toilet", "Washroom", "Shouchalaya", "शौचालय"],
  staircase: ["Staircase", "Stairs", "Sopan", "सोपान"],
  living: ["Living Room", "Drawing Room", "Hall", "बैठक"],
  living_room: ["Living Room", "Drawing Room", "Hall", "बैठक"],
  main_entrance: ["Entrance", "Main Door", "Maha Dwara", "द्वार"],
  entrance: ["Entrance", "Main Door", "प्रवेश"],
  door: ["Door", "Gate", "Dwara", "द्वार"],
  window: ["Window", "Khidki", "खिड़की"],
  pooja: ["Pooja", "Puja", "Mandir", "मंदिर"],
  pooja_room: ["Pooja", "Puja", "Mandir", "मंदिर"],
  dining: ["Dining", "Dining Table"],
  store: ["Store", "Storage", "Utility"],
  balcony: ["Balcony", "Verandah", "Terrace"],
  study: ["Study", "Study Room"],
};

function tokenizeMultilingualText(text: string): string[] {
  return text
    .split(/[^a-zA-Z0-9\u0900-\u097F]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

/** Expand any seed label through SynonymEngine + preserve raw script tokens. */
export function collectMultilingualTerms(...seedLabels: Array<string | undefined | null>): string[] {
  const terms = new Set<string>();

  for (const label of seedLabels) {
    if (!label?.trim()) continue;
    const trimmed = label.trim();
    terms.add(trimmed);

    for (const token of tokenizeMultilingualText(trimmed)) {
      terms.add(token);
    }

    for (const synonym of SynonymEngine.getSynonyms(trimmed)) {
      if (!synonym?.trim()) continue;
      terms.add(synonym.trim());
      tokenizeMultilingualText(synonym).forEach((token) => terms.add(token));
    }

    const canonical = SynonymEngine.resolveCanonicalName(trimmed);
    if (canonical && canonical !== trimmed.toUpperCase().replace(/\s+/g, "_")) {
      for (const synonym of SynonymEngine.getSynonyms(canonical)) {
        if (!synonym?.trim()) continue;
        terms.add(synonym.trim());
        tokenizeMultilingualText(synonym).forEach((token) => terms.add(token));
      }
    }
  }

  return [...terms].filter((term) => term.length >= 2);
}

export function buildObjectMatchTerms(input: {
  objectType?: string;
  canonicalType?: string;
  entityDisplayName?: string;
  pdfTopic?: string;
}): string[] {
  const objectKey = (input.objectType || "").toLowerCase().replace(/[\s\-]+/g, "_");
  const canonicalKey = (input.canonicalType || "").toLowerCase().replace(/[\s\-]+/g, "_");
  const seeds = new Set<string>();

  if (input.entityDisplayName?.trim()) seeds.add(input.entityDisplayName.trim());
  if (objectKey && objectKey !== "unknown") seeds.add(objectKey);
  if (canonicalKey && canonicalKey !== "unknown") seeds.add(canonicalKey.replace(/_/g, " "));

  for (const [key, labels] of Object.entries(OBJECT_SYNONYM_SEEDS)) {
    if (objectKey.includes(key) || canonicalKey.includes(key) || key.includes(objectKey)) {
      labels.forEach((label) => seeds.add(label));
    }
  }

  if (input.pdfTopic) {
    seeds.add(input.pdfTopic);
    const topicLabels = OBJECT_SYNONYM_SEEDS[input.pdfTopic.replace(/-/g, "_")] || [];
    topicLabels.forEach((label) => seeds.add(label));
  }

  return collectMultilingualTerms(...seeds);
}

export function buildZoneMatchTerms(zoneCode?: string, zoneDisplay?: string): string[] {
  const code = (zoneCode || "").toLowerCase();
  const seeds = new Set<string>();

  if (zoneDisplay?.trim()) seeds.add(zoneDisplay.trim());
  if (code) seeds.add(code);

  const codeSeeds = ZONE_CODE_SYNONYM_SEEDS[code] || [];
  codeSeeds.forEach((label) => seeds.add(label));

  return collectMultilingualTerms(...seeds);
}

export function buildTopicCategoryTerms(pdfTopic?: string): string[] {
  if (!pdfTopic) return [];
  const key = pdfTopic.toLowerCase().replace(/[\s\-]+/g, "_");
  const seeds = [pdfTopic, ...(OBJECT_SYNONYM_SEEDS[key] || [])];
  return collectMultilingualTerms(...seeds);
}
