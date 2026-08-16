/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 2 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Conversation Intelligence & Intent Resolution
 * 
 * ConversationIntentEngine.ts: Deterministic Intent Classification Engine with Multi-Lingual Synonym Support.
 */

import { UKAUserIntent, UKAIntentResult, UKALanguage } from "./UKATypes";

export interface IntentKeywordPattern {
  keywords: string[];
  language?: UKALanguage;
  weight?: number; // Default weight 1
}

export interface IntentRuleConfig {
  intent: UKAUserIntent;
  patterns: IntentKeywordPattern[];
}

export class ConversationIntentEngine {
  /**
   * Extensible Pattern Dictionary supporting English, Hindi, and Hinglish.
   * Can be dynamically extended without modifying matching logic.
   */
  private static intentRules: IntentRuleConfig[] = [
    {
      intent: "DIAGNOSTIC_QUERY",
      patterns: [
        { keywords: ["why only", "findings count", "runtime logs", "execution time", "system state", "rule trace", "founder audit", "engine timing", "debug", "covariance", "total executed"], language: "EN", weight: 3 },
        { keywords: ["kitne dosha", "kitne findings", "system logs", "rule kitne execute huye", "system status kya hai"], language: "HINGLISH", weight: 3 }
      ]
    },
    {
      intent: "DECISION_QUERY",
      patterns: [
        { keywords: ["why is", "why critical", "why catastrophic", "decision chain", "why penalty", "evidence for", "6 questions", "reason for", "how severe", "why deduction"], language: "EN", weight: 2.5 },
        { keywords: ["kyun", "kyu", "karan", "kyun critical hai", "saboot", "chain kya hai", "penalty kyun hai"], language: "HINGLISH", weight: 2.5 }
      ]
    },
    {
      intent: "REPORT_QUERY",
      patterns: [
        { keywords: ["download report", "current report", "export dossier", "pdf report", "client report", "dossier summary", "generate pdf", "print report"], language: "EN", weight: 2.5 },
        { keywords: ["report download", "pdf chahiye", "report export", "dossier banao", "report dikhao"], language: "HINGLISH", weight: 2.5 }
      ]
    },
    {
      intent: "CONSULTANT_QUERY",
      patterns: [
        { keywords: ["compare ground floor", "compare floor", "override remedy", "custom recommendation", "client review", "consultant notes", "override zone", "client assessment"], language: "EN", weight: 2.5 },
        { keywords: ["floors compare karo", "remedy change karo", "custom remedy", "client notes"], language: "HINGLISH", weight: 2.5 }
      ]
    },
    {
      intent: "MEMBERSHIP_QUERY",
      patterns: [
        { keywords: ["upgrade membership", "pricing", "subscribe", "pro plan", "paid plan", "consultant license", "cost", "billing", "tier"], language: "EN", weight: 2.5 },
        { keywords: ["membership upgrade", "plan change", "kitna paise", "pro leni hai", "subscription"], language: "HINGLISH", weight: 2.5 }
      ]
    },
    {
      intent: "KNOWLEDGE_QUERY",
      patterns: [
        { keywords: ["explain", "what is", "meaning of", "vishwakarma prakash", "mayamatam", "samarangana", "agni corner", "ishanya", "brahmasthan", "vastu rule for", "canon", "verse"], language: "EN", weight: 2 },
        { keywords: ["samjhaao", "samjhao", "kya hai", "kya hota hai", "shastra", "vishwakarma", "shloka", "arth kya hai"], language: "HINGLISH", weight: 2 },
        { keywords: ["क्या है", "अर्थ", "शास्त्र", "विवरण"], language: "HI", weight: 2 }
      ]
    },
    {
      intent: "PROPERTY_QUERY",
      patterns: [
        { keywords: ["my kitchen", "bedroom", "bathroom", "toilet", "entrance", "staircase", "water tank", "puja room", "facing", "north angle", "score", "health index", "ground floor", "first floor", "zone"], language: "EN", weight: 1.5 },
        { keywords: ["rasoi", "shauchalay", "pravesh dwar", "dwar", "pooja ghar", "mandir", "ishaan", "aagney", "nairitya", "vayavya", "seena", "chhat", "makaan"], language: "HINGLISH", weight: 1.5 }
      ]
    },
    {
      intent: "GENERAL_QUERY",
      patterns: [
        { keywords: ["hello", "hi", "hey", "help", "what can you do", "who are you", "uka", "capabilities", "guide"], language: "EN", weight: 1 },
        { keywords: ["namaste", "kaise ho", "help chahiye", "tum kaun ho"], language: "HINGLISH", weight: 1 },
        { keywords: ["नमस्ते", "प्रणाम"], language: "HI", weight: 1 }
      ]
    }
  ];

  /**
   * Common room/entity keyword mapping for target entity hint extraction
   */
  private static entityKeywords: Record<string, string> = {
    kitchen: "Kitchen",
    rasoi: "Kitchen",
    cookhouse: "Kitchen",
    pachanalayam: "Kitchen",
    toilet: "Toilet",
    bathroom: "Toilet",
    shauchalay: "Toilet",
    wc: "Toilet",
    bedroom: "Bedroom",
    "master bedroom": "Master Bedroom",
    shayan: "Bedroom",
    entrance: "Entrance Door",
    door: "Entrance Door",
    pravesh: "Entrance Door",
    dwar: "Entrance Door",
    brahmasthan: "Brahmasthan",
    center: "Brahmasthan",
    staircase: "Staircase",
    jeena: "Staircase",
    seena: "Staircase",
    "water tank": "Overhead Water Tank",
    tank: "Water Tank",
    "puja room": "Puja Room",
    mandir: "Puja Room",
    pooja: "Puja Room",
    devatalayam: "Puja Room",
    living: "Living Room",
    hall: "Living Room"
  };

  /**
   * Main Intent Resolution Entry Point
   */
  public static classifyIntent(input: string): UKAIntentResult {
    const rawInput = input || "";
    const cleanText = rawInput.toLowerCase().trim();

    if (!cleanText) {
      return {
        intent: "UNKNOWN",
        confidence: 0,
        matchedKeywords: [],
        targetEntityHint: null,
        languageDetected: "EN",
        rawInput
      };
    }

    // 1. Detect Language
    const languageDetected = this.detectLanguage(cleanText);

    // 2. Extract Entity Hint
    const targetEntityHint = this.extractEntityHint(cleanText);

    // 3. Score Intents
    let bestIntent: UKAUserIntent = "UNKNOWN";
    let maxScore = 0;
    let bestMatchedKeywords: string[] = [];

    for (const rule of this.intentRules) {
      let currentScore = 0;
      const currentMatchedKeywords: string[] = [];

      for (const patternGroup of rule.patterns) {
        const weight = patternGroup.weight || 1;
        for (const kw of patternGroup.keywords) {
          if (cleanText.includes(kw.toLowerCase())) {
            currentScore += weight * 10;
            currentMatchedKeywords.push(kw);
          }
        }
      }

      if (currentScore > maxScore) {
        maxScore = currentScore;
        bestIntent = rule.intent;
        bestMatchedKeywords = currentMatchedKeywords;
      }
    }

    // Fallback: If no keyword matches, but an entity was detected, treat as PROPERTY_QUERY
    if (bestIntent === "UNKNOWN" && targetEntityHint) {
      bestIntent = "PROPERTY_QUERY";
      maxScore = 5;
    }

    // Compute normalized confidence (0.0 to 1.0)
    const confidence = maxScore > 0 ? Math.min(1.0, Math.round((maxScore / 25) * 100) / 100) : 0;

    return {
      intent: bestIntent,
      confidence: Math.max(confidence, bestIntent !== "UNKNOWN" ? 0.6 : 0),
      matchedKeywords: bestMatchedKeywords,
      targetEntityHint,
      languageDetected,
      rawInput
    };
  }

  /**
   * Detect language (Hindi, Hinglish, English, or Other)
   */
  private static detectLanguage(text: string): UKALanguage {
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) {
      return "HI";
    }

    const hinglishKeywords = [
      "rasoi", "shauchalay", "pravesh", "dwar", "kaise", "kya", "kyun", "kyu",
      "chahiye", "samjhao", "batao", "karan", "dosha", "makaan", "bana"
    ];

    const words = text.split(/\s+/);
    const hasHinglish = words.some((w) => hinglishKeywords.includes(w));
    if (hasHinglish) {
      return "HINGLISH";
    }

    return "EN";
  }

  /**
   * Extract entity hint from input text
   */
  private static extractEntityHint(text: string): string | null {
    for (const [kw, normalized] of Object.entries(this.entityKeywords)) {
      if (text.includes(kw)) {
        return normalized;
      }
    }
    return null;
  }
}
