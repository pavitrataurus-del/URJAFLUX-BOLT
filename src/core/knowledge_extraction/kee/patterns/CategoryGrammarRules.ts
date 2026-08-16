// ============================================================================
// URJAFLUX AI OS - KEE CATEGORY GRAMMAR RULES
// Deterministic Multi-Domain Pattern Detection for 29 Knowledge Categories
// ============================================================================

import { KeeKnowledgeCategory } from "../types/kee.types";

export interface ICategoryMatchRule {
  category: KeeKnowledgeCategory;
  patterns: RegExp[];
  priority: number;
}

export class CategoryGrammarRules {
  private static rules: ICategoryMatchRule[] = [
    {
      category: 'DEFINITION',
      patterns: [
        /\b(is defined as|means|refers to|denotes|iti uchyate|kaha jata hai|arthat|samajhna chahiye)\b/i,
        /^[A-Z][a-zA-B0-9\s]+:\s+/
      ],
      priority: 10
    },
    {
      category: 'PRINCIPLE',
      patterns: [
        /\b(fundamental law|universal principle|siddhanta|shasvat|mula siddhanta|governing principle)\b/i
      ],
      priority: 9
    },
    {
      category: 'RULE',
      patterns: [
        /\b(shall|must|should always|niyama|vidhi|sthapan karein|karna chahiye|kartavya)\b/i,
        /\b(placed in|located at|positioned in|oriented towards)\b/i
      ],
      priority: 8
    },
    {
      category: 'CONDITION',
      patterns: [
        /\b(if|when|provided that|in case of|yadi|agar|jab|sthiti mein)\b/i
      ],
      priority: 7
    },
    {
      category: 'EXCEPTION',
      patterns: [
        /\b(however|except|unless|provided|apavad|parantu|kintu|isake vyatirek|varjit hai)\b/i
      ],
      priority: 7
    },
    {
      category: 'DOSHA',
      patterns: [
        /\b(defect|dosha|afflicted|malefic|vitiated|ashubha|pida|ashubha phala|nuksan|bad effect)\b/i
      ],
      priority: 8
    },
    {
      category: 'CAUSE',
      patterns: [
        /\b(due to|caused by|result of|karana|hetu|karanas|utpatti)\b/i
      ],
      priority: 6
    },
    {
      category: 'EFFECT',
      patterns: [
        /\b(leads to|results in|causes|brings|phala|prabhava|parinama|prapti)\b/i
      ],
      priority: 6
    },
    {
      category: 'POSITIVE_FINDING',
      patterns: [
        /\b(auspicious|beneficial|brings wealth|prosperity|shubha|vriddhi|labha|kalyana|sukha)\b/i
      ],
      priority: 8
    },
    {
      category: 'REMEDY',
      patterns: [
        /\b(remedy|upaya|correction|nullify|pacify|shanti|nivaran|shodhana|cure)\b/i
      ],
      priority: 8
    },
    {
      category: 'ALTERNATIVE_REMEDY',
      patterns: [
        /\b(alternative|vikalpa|other remedy|anyaya upaya|yadi prathama na ho)\b/i
      ],
      priority: 7
    },
    {
      category: 'CONTRAINDICATION',
      patterns: [
        /\b(never|prohibited|strictly forbidden|nishedha|varjan|varjit|kabhi na karein)\b/i
      ],
      priority: 8
    },
    {
      category: 'CAUTION',
      patterns: [
        /\b(caution|warning|take care|savadhani|shetavani|dhyana rakhein)\b/i
      ],
      priority: 7
    },
    {
      category: 'LIMITATION',
      patterns: [
        /\b(limited to|only applies to|seema|maryada|baddha)\b/i
      ],
      priority: 6
    },
    {
      category: 'EXAMPLE',
      patterns: [
        /\b(for example|such as|for instance|udaharan|yatha|jaise ki)\b/i
      ],
      priority: 5
    },
    {
      category: 'ILLUSTRATION_REFERENCE',
      patterns: [
        /\b(see figure|refer diagram|chitra|rekha chitra|diagram|map ref)\b/i
      ],
      priority: 5
    },
    {
      category: 'FORMULA',
      patterns: [
        /\b(formula|mathematical relation|sutra|ganita|aaya calculation|multiplied by)\b/i,
        /(\=|\+|\/|\*|√)/
      ],
      priority: 7
    },
    {
      category: 'MEASUREMENT',
      patterns: [
        /\b(cubit|hasta|angula|feet|meters|inches|yards|gaja|hasta pramana)\b/i,
        /\b\d+\s*(hasta|angula|ft|inches|cm|m)\b/i
      ],
      priority: 6
    },
    {
      category: 'DIRECTION',
      patterns: [
        /\b(north|south|east|west|northeast|northwest|southeast|southwest|ishan|agney|nairutya|vayavya|dishah)\b/i
      ],
      priority: 6
    },
    {
      category: 'ELEMENT',
      patterns: [
        /\b(earth|water|fire|air|space|ether|panchabhuta|prithvi|jala|agni|vayu|akasha)\b/i
      ],
      priority: 6
    },
    {
      category: 'PLANET',
      patterns: [
        /\b(sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu|surya|chandra|mangala|budha|guru|shukra|shani)\b/i
      ],
      priority: 6
    },
    {
      category: 'CHAKRA',
      patterns: [
        /\b(muladhara|svadhisthana|manipura|anahata|visuddha|ajna|sahasrara|energy center)\b/i
      ],
      priority: 6
    },
    {
      category: 'OBJECT',
      patterns: [
        /\b(mirror|idol|fountain|heavy item|bed|stove|water tank|staircase|clock|locker)\b/i
      ],
      priority: 5
    },
    {
      category: 'ROOM',
      patterns: [
        /\b(kitchen|bedroom|master bedroom|toilet|bathroom|pooja room|living room|entrance|store room)\b/i
      ],
      priority: 5
    },
    {
      category: 'ACTIVITY',
      patterns: [
        /\b(sleeping|cooking|studying|praying|dining|working|storing|meditating)\b/i
      ],
      priority: 5
    },
    {
      category: 'REFERENCE',
      patterns: [
        /\b(according to|stated in|vide|refer to|sandarbha|pramana)\b/i
      ],
      priority: 5
    },
    {
      category: 'CROSS_REFERENCE',
      patterns: [
        /\b(see chapter|refer section|see book|tulana karein|purnokta)\b/i
      ],
      priority: 5
    },
    {
      category: 'FUTURE_RESEARCH_MARKER',
      patterns: [
        /\b(further research required|to be investigated|anusamdhana|future inquiry|unresolved)\b/i
      ],
      priority: 6
    }
  ];

  /**
   * Detects all categories matched within a text segment
   */
  public static matchCategories(text: string): KeeKnowledgeCategory[] {
    const matchedCategories: Set<KeeKnowledgeCategory> = new Set();

    for (const rule of this.rules) {
      for (const pattern of rule.patterns) {
        if (pattern.test(text)) {
          matchedCategories.add(rule.category);
          break; // move to next rule once category matches
        }
      }
    }

    // Default to RULE if no explicit match found
    if (matchedCategories.size === 0) {
      matchedCategories.add('RULE');
    }

    return Array.from(matchedCategories);
  }
}
