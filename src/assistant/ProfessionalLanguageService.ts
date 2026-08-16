/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 4 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Professional Response Generation
 * 
 * ProfessionalLanguageService.ts: Language Standardization & Customer Sanitize Engine.
 * Replaces internal/technical jargon with consultant-grade language based on user role and language preference.
 */

import { UKAUserRole, UKALanguage } from "./UKATypes";

export class ProfessionalLanguageService {
  /**
   * Term Replacement Map (Technical Jargon -> Consultant-Grade Terminology)
   */
  private static readonly TERM_MAP: Record<string, string> = {
    "Rule Engine": "Spatial Evaluation Framework",
    "rule engine": "spatial evaluation framework",
    "Triggered Rule": "Evaluated Principle",
    "triggered rule": "evaluated principle",
    "Plugin": "Knowledge Module",
    "plugin": "knowledge module",
    "Decision Chain": "Evaluation Journey",
    "decision chain": "evaluation journey",
    "Confidence Score": "Evaluation Confidence",
    "confidence score": "evaluation confidence",
    "Pipeline": "Spatial Assessment Workflow",
    "pipeline": "spatial assessment workflow",
    "OCR": "Spatial Vector Recognition",
    "ocr": "spatial vector recognition",
    "Backend": "Intelligence Platform",
    "backend": "intelligence platform",
    "Gemini": "URJAFLUX Spatial Knowledge Engine",
    "gemini": "URJAFLUX Spatial Knowledge Engine",
    "ChatGPT": "URJAFLUX Spatial Knowledge Engine",
    "LLM": "URJAFLUX Intelligence Engine"
  };

  /**
   * Banned Artificial/AI Phrases (Strictly Prohibited per Prompt Rules)
   */
  private static readonly BANNED_PATTERNS: RegExp[] = [
    /as an ai\b/gi,
    /i generated\b/gi,
    /the model thinks\b/gi,
    /according to the prompt\b/gi,
    /as a language model\b/gi,
    /my training data\b/gi
  ];

  /**
   * Standard Professional Openings for Response Synthesis
   */
  public static readonly APPROVED_OPENINGS = [
    "The current property evaluation indicates",
    "The evaluated spatial layout shows",
    "Based on the approved URJAFLUX Knowledge Framework",
    "The evaluated placement suggests",
    "The current assessment identified"
  ];

  /**
   * Sanitize and professionalize raw text based on User Role and Target Language
   */
  public static sanitize(text: string, role: UKAUserRole, lang: UKALanguage = "EN"): string {
    if (!text) return "";

    let processed = text;

    // 1. Scrub Banned Phrases across all roles
    for (const pattern of this.BANNED_PATTERNS) {
      processed = processed.replace(pattern, "The spatial analysis indicates");
    }

    // 2. In VISITOR and PAID_CUSTOMER modes, replace technical terms with client-friendly terms
    if (role === "VISITOR" || role === "PAID_CUSTOMER") {
      // Replace known terms
      for (const [rawTerm, replacement] of Object.entries(this.TERM_MAP)) {
        const regex = new RegExp(`\\b${rawTerm}\\b`, "g");
        processed = processed.replace(regex, replacement);
      }

      // Hide technical IDs like GUIDs or internal finding keys e.g. FINDING-1234
      processed = processed.replace(/\bFINDING-[A-Z0-9-]+\b/g, "Spatial Finding");
      processed = processed.replace(/\bRULE-[A-Z0-9-]+\b/g, "Evaluated Principle");
      processed = processed.replace(/\bRESP-[A-Z0-9-]+\b/g, "");
      processed = processed.replace(/\bEVD-[A-Z0-9-]+\b/g, "");
    }

    // 3. Apply Language Transformations if non-English
    if (lang === "HI") {
      processed = this.translateToHindi(processed);
    } else if (lang === "HINGLISH") {
      processed = this.translateToHinglish(processed);
    }

    return processed.trim();
  }

  /**
   * Multilingual translation helper for Hindi (Deterministic mapping of core terms)
   */
  private static translateToHindi(text: string): string {
    const hindiMap: Record<string, string> = {
      "Observation": "अवलोकन (Observation)",
      "Explanation": "व्याख्या (Explanation)",
      "Supporting Evidence": "प्रमाणित साक्ष्य (Evidence)",
      "Professional Recommendation": "परामर्श अनुशंसा (Recommendation)",
      "Expected Benefit": "अपेक्षित लाभ (Expected Benefit)",
      "Suggested Next Step": "अनुशंसित अगला कदम (Next Step)",
      "Professional Review Status": "समीक्षा स्थिति (Review Status)",
      "Based on the approved URJAFLUX Knowledge Framework": "स्वीकृत URJAFLUX ज्ञान ढांचे के आधार पर",
      "The current property evaluation indicates": "वर्तमान संपत्ति मूल्यांकन दर्शाता है",
      "The evaluated spatial layout shows": "मूल्यांकन किया गया स्थानिक लेआउट दिखाता है",
      "The evaluated placement suggests": "मूल्यांकन किया गया स्थान सुझाव देता है",
      "The current assessment identified": "वर्तमान मूल्यांकन ने पहचान की"
    };

    let result = text;
    for (const [en, hi] of Object.entries(hindiMap)) {
      result = result.replace(new RegExp(en, "g"), hi);
    }
    return result;
  }

  /**
   * Multilingual translation helper for Hinglish (Deterministic mapping of core terms)
   */
  private static translateToHinglish(text: string): string {
    const hinglishMap: Record<string, string> = {
      "Observation": "Observation (Dekha Gaya Spatial Point)",
      "Explanation": "Explanation (Spatial Vastu Vivran)",
      "Supporting Evidence": "Supporting Evidence (Pramaan)",
      "Professional Recommendation": "Professional Recommendation (Sujhav)",
      "Expected Benefit": "Expected Benefit (Prapth Hone Vala Labh)",
      "Suggested Next Step": "Suggested Next Step (Agle Kadam)",
      "Based on the approved URJAFLUX Knowledge Framework": "Approved URJAFLUX Knowledge Framework ke anusar",
      "The current property evaluation indicates": "Property ka vartaman evaluation yeh darshata hai",
      "The evaluated spatial layout shows": "Spatial layout evaluation dikhata hai",
      "The current assessment identified": "Vartaman assessment ne yeh identify kiya hai"
    };

    let result = text;
    for (const [en, hgl] of Object.entries(hinglishMap)) {
      result = result.replace(new RegExp(en, "g"), hgl);
    }
    return result;
  }
}
