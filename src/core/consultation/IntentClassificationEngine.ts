import { IUserIntent, IntentCategory } from './ConsultationTypes';
import { KnowledgeDomain } from '../reasoning/ReasoningTypes';

export class IntentClassificationEngine {
  private static readonly INTENT_RULES: Array<{
    category: IntentCategory;
    keywords: string[];
    domain?: KnowledgeDomain;
  }> = [
    {
      category: 'RECOMMENDATION_EXPLANATION',
      keywords: ['why', 'explain', 'recommendation', 'reason', 'suggested', 'justification', 'rejected', 'alternative', 'why was'],
    },
    {
      category: 'MONITORING_STATUS',
      keywords: ['digital twin', 'snapshot', 'alert', 'health score', 'diff', 'live reading', 'telemetry', 'sensor', 'microtesla', 'lux', 'hertz'],
    },
    {
      category: 'PROJECT_STATUS',
      keywords: ['project', 'task', 'phase', 'workflow', 'checklist', 'inspector', 'field engineer', 'progress', 'status', 'sla'],
    },
    {
      category: 'COMPLIANCE_QUERY',
      keywords: ['compliance', 'score', 'audit', 'pancha tattva', 'freshness', 'vector', 'rating', 'shastric score'],
    },
    {
      category: 'MAINTENANCE_QUERY',
      keywords: ['maintenance', 'schedule', 'preventive', 'corrective', 'routine', 'calibration', 'engineer'],
    },
    {
      category: 'KNOWLEDGE_QUERY',
      keywords: ['vastu', 'mayamatam', 'shastra', 'chakra', '528hz', 'bija', 'lal kitab', '1952 gutke', 'chaldean', 'astrology', 'shloka', 'verse'],
    },
    {
      category: 'PROPERTY_ANALYSIS',
      keywords: ['property', 'room', 'layout', 'brahmasthan', 'ishan', 'agneya', 'nairrutya', 'facing', 'sqft'],
    },
    {
      category: 'REPORT_REQUEST',
      keywords: ['report', 'export', 'pdf', 'certificate', 'summary', 'audit log', 'download'],
    },
    {
      category: 'FOLLOW_UP',
      keywords: ['what about', 'also', 'and', 'how to fix', 'next step', 'continue', 'tell me more'],
    }
  ];

  public static classifyIntent(userInput: string, previousIntent?: IntentCategory): IUserIntent {
    const textLower = userInput.toLowerCase();
    const matchedKeywords: string[] = [];

    let bestCategory: IntentCategory = 'GENERAL_CONSULTATION';
    let highestMatchCount = 0;
    let targetDomain: KnowledgeDomain | undefined = undefined;

    // Detect domain preference
    if (textLower.includes('vastu') || textLower.includes('mayamatam') || textLower.includes('brahmasthan')) {
      targetDomain = 'Vastu';
    } else if (textLower.includes('chakra') || textLower.includes('anahata') || textLower.includes('528hz') || textLower.includes('bija')) {
      targetDomain = 'Chakra';
    } else if (textLower.includes('lal kitab') || textLower.includes('gutke') || textLower.includes('house')) {
      targetDomain = 'LalKitab';
    } else if (textLower.includes('chaldean') || textLower.includes('numerology') || textLower.includes('vibration')) {
      targetDomain = 'Numerology';
    } else if (textLower.includes('astrology') || textLower.includes('horo') || textLower.includes('planet')) {
      targetDomain = 'Astrology';
    }

    for (const rule of this.INTENT_RULES) {
      const matches = rule.keywords.filter(kw => textLower.includes(kw));
      if (matches.length > highestMatchCount) {
        highestMatchCount = matches.length;
        bestCategory = rule.category;
        matchedKeywords.length = 0;
        matchedKeywords.push(...matches);
      }
    }

    // Contextual fallback for short follow-up questions
    if (highestMatchCount === 0 && previousIntent) {
      bestCategory = 'FOLLOW_UP';
    }

    const confidenceScore = Math.min(100, Math.max(70, 75 + highestMatchCount * 8));

    return {
      intentCategory: bestCategory,
      detectedKeywords: matchedKeywords,
      targetDomain,
      confidenceScore
    };
  }
}
