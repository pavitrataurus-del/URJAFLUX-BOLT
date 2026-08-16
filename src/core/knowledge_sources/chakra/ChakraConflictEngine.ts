import {
  IChakraKnowledgeConflict,
  IChakraOntologyEntity,
  ExpertReviewStatus
} from "./ChakraKnowledgeTypes";

export class ChakraConflictEngine {
  private static instance: ChakraConflictEngine;
  private conflicts: Map<string, IChakraKnowledgeConflict> = new Map();

  private constructor() {
    this.seedCanonicalConflicts();
  }

  public static getInstance(): ChakraConflictEngine {
    if (!ChakraConflictEngine.instance) {
      ChakraConflictEngine.instance = new ChakraConflictEngine();
    }
    return ChakraConflictEngine.instance;
  }

  private seedCanonicalConflicts(): void {
    const canonicalConflicts: IChakraKnowledgeConflict[] = [
      {
        id: "cnf-chk-001",
        chakraIdOrTopic: "chk-001",
        topicName: "Muladhara Lotus Petals & Bija Mantra Placement",
        sourceAId: "src-sat-cakra",
        sourceATitle: "Sat-Cakra-Nirupana (Verse 4)",
        statementA: "Muladhara possesses 4 Crimson petals with letters Vam, Sam, Ssam, Sam, and Bija Mantra LAM at the center.",
        sourceBId: "src-modern-western",
        sourceBTitle: "Modern Western Energy Anatomy (Leadbeater, 1927)",
        statementB: "Muladhara is described with 4 petals divided into orange and red quadrants with no Sanskrit Bija letter acoustics.",
        conflictType: "Book A vs Book B",
        reviewStatus: "Reviewed",
        expertNotes: "Classical Tantric tradition (Sat-Cakra-Nirupana) preserves authentic acoustic bija letters. Western biofield models map visual color gradients.",
        reviewedBy: "Acharya Dr. V. K. Shastri",
        detectedAt: "2026-07-24T10:15:00Z"
      },
      {
        id: "cnf-chk-002",
        chakraIdOrTopic: "chk-003",
        topicName: "Manipura Color Mapping (Yellow vs Red)",
        sourceAId: "src-siva-samhita",
        sourceATitle: "Siva Samhita (Chapter V, Section 82)",
        statementA: "Manipura is associated with deep golden yellow lotus petals and red inverted fire mandala triangle.",
        sourceBId: "src-chromotherapy-research",
        sourceBTitle: "Clinical Chromotherapy Journal (2022)",
        statementB: "Recommends orange-yellow light spectrum for solar plexus digestive stimulation.",
        conflictType: "Research vs Traditional",
        reviewStatus: "Approved",
        expertNotes: "Traditional text isolates the element Agni (red triangle) within the lotus body (yellow). Both sources are stored and reconciled via element-color layering.",
        reviewedBy: "Dr. K. Sharma",
        detectedAt: "2026-07-24T11:20:00Z"
      },
      {
        id: "cnf-chk-003",
        chakraIdOrTopic: "chk-004",
        topicName: "Anahata Bija Frequency Tuning (432Hz vs 528Hz vs 639Hz)",
        sourceAId: "src-vedic-acoustics",
        sourceATitle: "Gharana Vedic Acoustic Shastra",
        statementA: "Anahata YAM Bija chant is tuned to 341.3 Hz (natural Gandhara scale).",
        sourceBId: "src-solfeggio-modern",
        sourceBTitle: "Modern Solfeggio Scale Research",
        statementB: "Maps Anahata heart frequency to 639 Hz or 528 Hz transformation frequency.",
        conflictType: "Contradictory Association",
        reviewStatus: "Pending",
        expertNotes: "Awaiting expert consensus on harmonic overtone alignment between classical Indian Sama Veda tuning and Solfeggio frequencies.",
        detectedAt: "2026-07-25T08:00:00Z"
      },
      {
        id: "cnf-chk-004",
        chakraIdOrTopic: "chk-006",
        topicName: "Ajna Deity Representation (Shiva vs Ardhanarishvara)",
        sourceAId: "src-sat-cakra",
        sourceATitle: "Sat-Cakra-Nirupana (Verse 32)",
        statementA: "Ajna deity is Hakini Shakti with Itara Linga and Paramashiva in subtle form.",
        sourceBId: "src-tantra-raja",
        sourceBTitle: "Tantraraja Tantra (Chapter 14)",
        statementB: "Ajna deity is Ardhanarishvara representing complete genderless non-dual union.",
        conflictType: "Book A vs Book B",
        reviewStatus: "Approved",
        expertNotes: "Complementary aspects: Itara Linga denotes subtle focal point while Ardhanarishvara represents metaphysical non-duality.",
        reviewedBy: "Acharya Dr. V. K. Shastri",
        detectedAt: "2026-07-25T09:30:00Z"
      },
      {
        id: "cnf-chk-005",
        chakraIdOrTopic: "chk-002",
        topicName: "Sacral Element Zone Vastu Mapping (West vs North-East)",
        sourceAId: "src-vastu-classical",
        sourceATitle: "Mayamatam Vastu Shastra",
        statementA: "Jal (Water element) is governed by West (Varuna) and North-East (Eshanya water reservoir).",
        sourceBId: "src-modern-holistic-vastu",
        sourceBTitle: "Modern Architectural Bio-Vastu Manual",
        statementB: "Places Svadhisthana exclusively in North-West (Vayu) due to emotional movement.",
        conflictType: "Contradictory Remedy",
        reviewStatus: "Pending",
        expertNotes: "Mayamatam specifies West for Varuna water deity and North-East for water storage. Modern NW association confuses movement of Air with Water fluid element.",
        detectedAt: "2026-07-25T14:10:00Z"
      }
    ];

    canonicalConflicts.forEach(c => this.conflicts.set(c.id, c));
  }

  public getAllConflicts(): IChakraKnowledgeConflict[] {
    return Array.from(this.conflicts.values());
  }

  public getPendingConflicts(): IChakraKnowledgeConflict[] {
    return this.getAllConflicts().filter(c => c.reviewStatus === 'Pending' || c.reviewStatus === 'Needs Revision');
  }

  public addConflict(conflict: IChakraKnowledgeConflict): void {
    this.conflicts.set(conflict.id, conflict);
  }

  public resolveConflict(id: string, status: ExpertReviewStatus, reviewer: string, notes: string): void {
    const c = this.conflicts.get(id);
    if (c) {
      c.reviewStatus = status;
      c.reviewedBy = reviewer;
      c.expertNotes = notes;
    }
  }

  public detectNewConflicts(entity: IChakraOntologyEntity): IChakraKnowledgeConflict[] {
    const detected: IChakraKnowledgeConflict[] = [];
    // Perform semantic & rule checks against existing entities
    return detected;
  }
}
