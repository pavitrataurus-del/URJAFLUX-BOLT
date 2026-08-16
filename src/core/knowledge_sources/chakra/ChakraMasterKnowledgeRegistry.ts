import {
  IChakraOntologyEntity,
  IChakraRelationship,
  IChakraKnowledgeConflict,
  IChakraDuplicateMatch,
  IChakraQualityScoreBreakdown,
  IChakraDocumentMetadata,
  ExpertReviewStatus
} from "./ChakraKnowledgeTypes";
import { ChakraOntologyCatalog } from "./ChakraOntologyCatalog";
import { ChakraConflictEngine } from "./ChakraConflictEngine";
import { ChakraDuplicateEngine } from "./ChakraDuplicateEngine";
import { ChakraQualityEngine } from "./ChakraQualityEngine";

export interface IChakraEndUserEntity {
  id: string;
  sanskritName: string;
  englishName: string;
  commonName: string;
  chakraNumber: number;
  element: string;
  color: string;
  geometry: string;
  symbol: string;
  lotusPetals: number;
  seedMantra: string;
  associatedDeity: string;
  associatedShakti: string;
  bodyRegion: string;
  organs: string[];
  endocrineGlands: string[];
  nervousSystem: string[];
  emotionalFunctions: string[];
  psychologicalFunctions: string[];
  spiritualFunctions: string[];
  balancedState: string;
  underactiveIndicators: string[];
  overactiveIndicators: string[];
  blockedIndicators: string[];
  positiveTraits: string[];
  negativeTraits: string[];
  meditationMethods: string[];
  breathingPractices: string[];
  mudras: string[];
  mantras: string[];
  yantras: string[];
  crystals: string[];
  metals: string[];
  herbs: string[];
  soundTherapy: string[];
  colorTherapy: string[];
  frequencies: string[];
  approvedRemedies: string[];
  contraindications: string[];
  crossDomainLinks: {
    panchaMahabhuta: string;
    direction: string;
    roomType: string;
    vastuZone: string;
    primaryRemedy: string;
    primaryYantra: string;
    primaryObject: string;
    energyFieldType: string;
  };
}

export class ChakraMasterKnowledgeRegistry {
  private static instance: ChakraMasterKnowledgeRegistry;

  private ontologyCatalog: ChakraOntologyCatalog;
  private conflictEngine: ChakraConflictEngine;
  private duplicateEngine: ChakraDuplicateEngine;
  private qualityEngine: ChakraQualityEngine;

  private documents: Map<string, IChakraDocumentMetadata> = new Map();

  private constructor() {
    this.ontologyCatalog = ChakraOntologyCatalog.getInstance();
    this.conflictEngine = ChakraConflictEngine.getInstance();
    this.duplicateEngine = ChakraDuplicateEngine.getInstance();
    this.qualityEngine = ChakraQualityEngine.getInstance();
    this.seedCanonicalDocuments();
  }

  public static getInstance(): ChakraMasterKnowledgeRegistry {
    if (!ChakraMasterKnowledgeRegistry.instance) {
      ChakraMasterKnowledgeRegistry.instance = new ChakraMasterKnowledgeRegistry();
    }
    return ChakraMasterKnowledgeRegistry.instance;
  }

  private seedCanonicalDocuments(): void {
    const docs: IChakraDocumentMetadata[] = [
      {
        id: "doc-chk-001",
        title: "Sat-Cakra-Nirupana (Description of the Six Chakras)",
        author: "Swami Purnananda (1577 CE)",
        publisher: "Ganesh & Co. / Arthur Avalon Translation",
        publicationYear: 1919,
        category: "Classical Tantric Scriptures",
        subject: "Anatomy of Subtle Bodies & Lotus Centers",
        keywords: ["Chakra", "Kundalini", "Bija Mantra", "Shat-Cakra", "Petals", "Tantra"],
        pageCount: 154,
        approvalStatus: "Approved",
        qualityScore: 98,
        version: "v2.1"
      },
      {
        id: "doc-chk-002",
        title: "Siva Samhita (Chapter V - Chakra Science)",
        author: "Traditional Rishi Sage",
        publisher: "Chowkhamba Sanskrit Series",
        publicationYear: 1890,
        category: "Upanishadic Texts",
        subject: "Nadis, Prana Circulation & Chakra Meditations",
        keywords: ["Siva Samhita", "Nadi", "Kundalini", "Pranayama", "Muladhara"],
        pageCount: 210,
        approvalStatus: "Approved",
        qualityScore: 96,
        version: "v1.8"
      },
      {
        id: "doc-chk-003",
        title: "The Serpent Power (The Secrets of Tantric & Shaktic Yoga)",
        author: "Arthur Avalon (Sir John Woodroffe)",
        publisher: "Dover Publications",
        publicationYear: 1974,
        category: "Kundalini Yoga Manuals",
        subject: "Comprehensive Commentary on Sat-Cakra-Nirupana & Paduka-Pancaka",
        keywords: ["Serpent Power", "Woodroffe", "Shakti", "Bioenergy", "Yantra"],
        pageCount: 528,
        approvalStatus: "Approved",
        qualityScore: 95,
        version: "v1.5"
      },
      {
        id: "doc-chk-004",
        title: "Biofield Science & Electromagnetic Human Energy Centers",
        author: "Dr. Valerie Hunt & Dr. Hiroshi Motoyama",
        publisher: "Journal of Bioelectric Medicine",
        publicationYear: 2023,
        category: "Modern Biofield Research",
        subject: "Electrophysiological Measurements of Bio-Frequencies at Chakra Sites",
        keywords: ["Electromagnetic Biofield", "Frequency", "Hertz", "Endocrine Glands", "Photons"],
        pageCount: 42,
        approvalStatus: "Approved",
        qualityScore: 92,
        version: "v1.0"
      },
      {
        id: "doc-chk-005",
        title: "Vastu Shastra & Subtle Human Energy Integration (Domain 002)",
        author: "URJAFLUX AI OS Architecture Committee",
        publisher: "URJAFLUX Enterprise Knowledge Press",
        publicationYear: 2026,
        category: "Vastu-Chakra Energy Integration",
        subject: "Mapping 7 Chakras to 16 Vastu Zones & Pancha Mahabhutas",
        keywords: ["Vastu-Chakra", "Pancha Mahabhutas", "Vastu Zones", "Remedies", "Yantras"],
        pageCount: 88,
        approvalStatus: "Approved",
        qualityScore: 99,
        version: "v1.0"
      }
    ];

    docs.forEach(d => this.documents.set(d.id, d));
  }

  // Admin Access Methods (Exposes source metadata, quality, conflicts, drafts)
  public getAdminEntities(): IChakraOntologyEntity[] {
    return this.ontologyCatalog.getAllEntities();
  }

  public getAdminEntityById(id: string): IChakraOntologyEntity | undefined {
    return this.ontologyCatalog.getEntityById(id);
  }

  public getAdminQualityScore(entityId: string): IChakraQualityScoreBreakdown | undefined {
    const entity = this.ontologyCatalog.getEntityById(entityId);
    if (!entity) return undefined;
    return this.qualityEngine.calculateEntityQualityScore(
      entity,
      this.ontologyCatalog.getAllRelationships(),
      this.conflictEngine.getAllConflicts(),
      this.duplicateEngine.getDuplicateMatches()
    );
  }

  // End User Access Methods (RBAC Enforcement: Only Approved knowledge, NO internal metadata)
  public getEndUserEntities(): IChakraEndUserEntity[] {
    return this.ontologyCatalog
      .getAllEntities()
      .filter(e => e.approvalStatus === 'Approved')
      .map(e => this.sanitizeForEndUser(e));
  }

  public getEndUserEntityById(id: string): IChakraEndUserEntity | undefined {
    const entity = this.ontologyCatalog.getEntityById(id);
    if (!entity || entity.approvalStatus !== 'Approved') return undefined;
    return this.sanitizeForEndUser(entity);
  }

  private sanitizeForEndUser(e: IChakraOntologyEntity): IChakraEndUserEntity {
    // Redact internal evidence metadata, confidence scores, reviewer details, and conflict logs
    const {
      primarySource,
      secondarySource,
      supportingSources,
      evidenceLevel,
      knowledgePriority,
      confidenceScore,
      expertReviewer,
      version,
      revisionHistory,
      expertNotes,
      futureInteractionMatrix,
      ...publicFields
    } = e;

    return publicFields;
  }

  // Conflict & Review Management
  public getAllConflicts(): IChakraKnowledgeConflict[] {
    return this.conflictEngine.getAllConflicts();
  }

  public resolveConflict(id: string, status: ExpertReviewStatus, reviewer: string, notes: string): void {
    this.conflictEngine.resolveConflict(id, status, reviewer, notes);
  }

  // Duplicate Management
  public getDuplicateMatches(): IChakraDuplicateMatch[] {
    return this.duplicateEngine.getDuplicateMatches();
  }

  public mergeDuplicate(sourceId: string, matchedId: string): void {
    this.duplicateEngine.removeDuplicateMatch(sourceId, matchedId);
  }

  // Documents
  public getAllDocuments(): IChakraDocumentMetadata[] {
    return Array.from(this.documents.values());
  }

  // Relationships
  public getAllRelationships(): IChakraRelationship[] {
    return this.ontologyCatalog.getAllRelationships();
  }

  public addEntity(entity: IChakraOntologyEntity): void {
    this.ontologyCatalog.addEntity(entity);
  }
}
