import { KnowledgeEvidence, SourceRef, ExpertRef, HistoricalRef, EvidenceQuality } from "./VerificationTypes";

export class KnowledgeEvidenceEngine {
  private evidenceStore: Map<string, KnowledgeEvidence> = new Map();

  constructor() {
    this.seedDefaultEvidence();
  }

  private seedDefaultEvidence(): void {
    const sampleRules: KnowledgeEvidence[] = [
      {
        ruleId: "rule-kitchen-se",
        primarySources: [
          { id: "src-samarangana", title: "Samarangana Sutradhara Ch. 55", author: "King Bhoja", type: "PRIMARY", reliabilityScore: 96 }
        ],
        supportingSources: [
          { id: "src-mayamatam", title: "Mayamatam Ch. 12 Verse 4", author: "Maya Danava", type: "SUPPORTING", reliabilityScore: 94 },
          { id: "src-mansara", title: "Manasara Vastu Shastra Ch. 18", author: "Sage Manasara", type: "SUPPORTING", reliabilityScore: 91 }
        ],
        contradictingSources: [],
        researchSources: [
          { id: "src-modern-architectural-vastu", title: "Thermal Efficiency and Solar Orientation in Vastu Homes", author: "Dr. R. K. Sharma", type: "RESEARCH", reliabilityScore: 85 }
        ],
        expertReferences: [
          { id: "exp-01", name: "Acharya V. K. Shastri", title: "Vastu Master", rating: 95, vote: "APPROVE", comment: "SE is Agni Kona, optimal for cooking fire." },
          { id: "exp-02", name: "Dr. A. N. Varma", title: "Vedic Architect", rating: 92, vote: "APPROVE", comment: "Supported by ancient texts and modern ventilation." }
        ],
        historicalReferences: [
          { id: "hist-01", era: "11th Century CE", textName: "Samarangana Sutradhara", verseOrChapter: "Chapter 55, Verse 12" }
        ],
        evidenceCount: 6,
        evidenceStrength: 95,
        evidenceQuality: "HIGH",
        evidenceFreshness: 92
      },
      {
        ruleId: "rule-sw-master-bedroom",
        primarySources: [
          { id: "src-mayamatam", title: "Mayamatam Ch. 19", author: "Maya Danava", type: "PRIMARY", reliabilityScore: 94 }
        ],
        supportingSources: [
          { id: "src-samarangana", title: "Samarangana Sutradhara Ch. 56", author: "King Bhoja", type: "SUPPORTING", reliabilityScore: 96 }
        ],
        contradictingSources: [],
        researchSources: [],
        expertReferences: [
          { id: "exp-01", name: "Acharya V. K. Shastri", title: "Vastu Master", rating: 95, vote: "APPROVE", comment: "SW represents stability and Earth element." }
        ],
        historicalReferences: [
          { id: "hist-02", era: "10th Century CE", textName: "Mayamatam", verseOrChapter: "Chapter 19, Verse 8" }
        ],
        evidenceCount: 4,
        evidenceStrength: 92,
        evidenceQuality: "HIGH",
        evidenceFreshness: 90
      },
      {
        ruleId: "rule-manipura-fire-se",
        primarySources: [
          { id: "src-sat-chakra", title: "Sat-Chakra-Nirupana Verse 19", author: "Swami Purnananda", type: "PRIMARY", reliabilityScore: 96 }
        ],
        supportingSources: [],
        contradictingSources: [],
        researchSources: [
          { id: "src-modern-chakra-bioenergetics", title: "Bio-electromagnetic Mapping of Manipura Chakra", author: "Institute of Bio-energetics", type: "RESEARCH", reliabilityScore: 88 }
        ],
        expertReferences: [
          { id: "exp-03", name: "Yogacharya B. M. Das", title: "Chakra Scholar", rating: 96, vote: "APPROVE", comment: "Agni element directly correlates with Manipura digestional energy." }
        ],
        historicalReferences: [
          { id: "hist-03", era: "16th Century CE", textName: "Sat-Chakra-Nirupana", verseOrChapter: "Verse 19-21" }
        ],
        evidenceCount: 3,
        evidenceStrength: 90,
        evidenceQuality: "HIGH",
        evidenceFreshness: 94
      }
    ];

    for (const item of sampleRules) {
      this.evidenceStore.set(item.ruleId, item);
    }
  }

  public getEvidence(ruleId: string): KnowledgeEvidence | undefined {
    return this.evidenceStore.get(ruleId);
  }

  public addOrUpdateEvidence(
    ruleId: string,
    partial: Partial<KnowledgeEvidence>
  ): KnowledgeEvidence {
    const existing = this.evidenceStore.get(ruleId) || {
      ruleId,
      primarySources: [],
      supportingSources: [],
      contradictingSources: [],
      researchSources: [],
      expertReferences: [],
      historicalReferences: [],
      evidenceCount: 0,
      evidenceStrength: 50,
      evidenceQuality: "MEDIUM",
      evidenceFreshness: 50
    };

    const updated: KnowledgeEvidence = {
      ...existing,
      ...partial,
      ruleId
    };

    // Calculate count & strength
    updated.evidenceCount = 
      updated.primarySources.length +
      updated.supportingSources.length +
      updated.contradictingSources.length +
      updated.researchSources.length +
      updated.expertReferences.length +
      updated.historicalReferences.length;

    let baseStrength = 50;
    if (updated.primarySources.length > 0) baseStrength += 25;
    if (updated.supportingSources.length > 0) baseStrength += 15;
    if (updated.researchSources.length > 0) baseStrength += 10;
    if (updated.expertReferences.length > 0) baseStrength += 10;
    if (updated.contradictingSources.length > 0) baseStrength -= 20;

    updated.evidenceStrength = Math.min(100, Math.max(0, baseStrength));
    
    if (updated.evidenceStrength >= 80) updated.evidenceQuality = "HIGH";
    else if (updated.evidenceStrength >= 50) updated.evidenceQuality = "MEDIUM";
    else updated.evidenceQuality = "LOW";

    this.evidenceStore.set(ruleId, updated);
    return updated;
  }

  public getAllEvidence(): KnowledgeEvidence[] {
    return Array.from(this.evidenceStore.values());
  }
}
