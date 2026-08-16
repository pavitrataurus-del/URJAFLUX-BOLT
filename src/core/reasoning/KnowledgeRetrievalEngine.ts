import { KnowledgeDomain } from './ReasoningTypes';

import {
  VastuMasterKnowledgeRegistry,
  ChakraMasterKnowledgeRegistry,
  LalKitabMasterKnowledgeRegistry,
  NumerologyMasterKnowledgeRegistry,
  AstrologyMasterKnowledgeRegistry
} from '../knowledge_sources';

export interface IUnifiedRetrievedEntity {
  id: string;
  domain: KnowledgeDomain;
  canonicalName: string;
  sanskritName?: string;
  entityType: string;
  description: string;
  sourceBook: string;
  chapterOrVerse?: string;
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  verificationStatus: string;
  attributes: Record<string, any>;
  tags: string[];
}

export class KnowledgeRetrievalEngine {
  private static instance: KnowledgeRetrievalEngine;

  private vastuRegistry: VastuMasterKnowledgeRegistry;
  private chakraRegistry: ChakraMasterKnowledgeRegistry;
  private lalkitabRegistry: LalKitabMasterKnowledgeRegistry;
  private numerologyRegistry: NumerologyMasterKnowledgeRegistry;
  private astrologyRegistry: AstrologyMasterKnowledgeRegistry;

  private constructor() {
    this.vastuRegistry = VastuMasterKnowledgeRegistry.getInstance();
    this.chakraRegistry = ChakraMasterKnowledgeRegistry.getInstance();
    this.lalkitabRegistry = LalKitabMasterKnowledgeRegistry.getInstance();
    this.numerologyRegistry = NumerologyMasterKnowledgeRegistry.getInstance();
    this.astrologyRegistry = AstrologyMasterKnowledgeRegistry.getInstance();
  }

  public static getInstance(): KnowledgeRetrievalEngine {
    if (!KnowledgeRetrievalEngine.instance) {
      KnowledgeRetrievalEngine.instance = new KnowledgeRetrievalEngine();
    }
    return KnowledgeRetrievalEngine.instance;
  }

  // ----------------------------------------------------
  // RETRIEVE VASTU ENTITIES
  // ----------------------------------------------------
  public getVastuEntities(query?: string): IUnifiedRetrievedEntity[] {
    const docs = this.vastuRegistry.getAllDocuments();
    return docs.map(doc => ({
      id: doc.id,
      domain: 'Vastu',
      canonicalName: doc.title,
      entityType: doc.documentType || 'VastuText',
      description: `${doc.subject} (Author: ${doc.author})`,
      sourceBook: doc.title,
      chapterOrVerse: doc.edition,
      confidenceScore: doc.qualityScore || 95,
      confidenceGrade: (doc.qualityScore || 95) >= 95 ? 'A+' : 'A',
      verificationStatus: doc.approvalStatus === 'Approved' ? 'CANONICAL' : 'VERIFIED',
      attributes: {
        author: doc.author,
        publisher: doc.publisher,
        keywords: doc.keywords,
        category: doc.category
      },
      tags: doc.keywords || ['Vastu', 'Architecture']
    }));
  }

  // ----------------------------------------------------
  // RETRIEVE CHAKRA ENTITIES
  // ----------------------------------------------------
  public getChakraEntities(query?: string): IUnifiedRetrievedEntity[] {
    const entities = this.chakraRegistry.getAdminEntities();
    return entities.map(e => ({
      id: e.id,
      domain: 'Chakra',
      canonicalName: e.sanskritName || e.englishName || e.commonName,
      sanskritName: e.sanskritName,
      entityType: 'Chakra',
      description: `${e.englishName || e.sanskritName} (${e.commonName || ''}) - ${e.balancedState || ''}`,
      sourceBook: e.primarySource || 'Sat Chakra Nirupana',
      chapterOrVerse: 'Shloka 1',
      confidenceScore: e.confidenceScore || 98,
      confidenceGrade: (e.confidenceScore || 98) >= 95 ? 'A+' : 'A',
      verificationStatus: e.approvalStatus === 'Approved' ? 'CANONICAL' : 'VERIFIED',
      attributes: {
        associatedElement: e.element,
        associatedColor: e.color,
        associatedPlanet: e.seedMantra,
        associatedSound: e.seedMantra,
        associatedBodyPart: e.bodyRegion
      },
      tags: [e.sanskritName, e.element, 'Chakra', 'Energy'].filter(Boolean)
    }));
  }

  // ----------------------------------------------------
  // RETRIEVE LAL KITAB ENTITIES
  // ----------------------------------------------------
  public getLalKitabEntities(query?: string): IUnifiedRetrievedEntity[] {
    const entities = this.lalkitabRegistry.getAdminEntities();
    return entities.map(e => ({
      id: e.id,
      domain: 'LalKitab',
      canonicalName: e.canonicalName,
      sanskritName: e.hindiName,
      entityType: e.entityType,
      description: e.description,
      sourceBook: e.sourceTraceability?.sourceBook || 'Lal Kitab 1952 Gutke',
      chapterOrVerse: e.sourceTraceability?.chapter || 'Chapter 1',
      confidenceScore: e.truthEngineMetrics?.confidenceScore || 97,
      confidenceGrade: e.truthEngineMetrics?.confidenceGrade || 'A+',
      verificationStatus: e.status || 'CANONICAL',
      attributes: {
        associatedDirection: e.associatedDirection,
        associatedRoom: e.associatedRoom,
        associatedMetal: e.associatedMetal,
        associatedColor: e.associatedColor
      },
      tags: e.tags || ['LalKitab', 'Remedy']
    }));
  }

  // ----------------------------------------------------
  // RETRIEVE NUMEROLOGY ENTITIES
  // ----------------------------------------------------
  public getNumerologyEntities(query?: string): IUnifiedRetrievedEntity[] {
    const entities = this.numerologyRegistry.getAdminEntities();
    return entities.map(e => ({
      id: e.id,
      domain: 'Numerology',
      canonicalName: e.canonicalName,
      sanskritName: e.canonicalName,
      entityType: e.entityType,
      description: e.description,
      sourceBook: e.sourceTraceability?.sourceBook || 'Chaldean Numerology System',
      chapterOrVerse: e.sourceTraceability?.chapter || 'Vibration Key',
      confidenceScore: e.truthEngineMetrics?.confidenceScore || 98,
      confidenceGrade: e.truthEngineMetrics?.confidenceGrade || 'A+',
      verificationStatus: e.status || 'CANONICAL',
      attributes: {
        numberValue: e.numberValue,
        associatedPlanet: e.associatedPlanet,
        associatedElement: e.associatedElement,
        associatedColor: e.associatedColor,
        associatedGemstone: e.associatedGemstone
      },
      tags: e.tags || ['Numerology', 'Chaldean']
    }));
  }

  // ----------------------------------------------------
  // RETRIEVE ASTROLOGY ENTITIES
  // ----------------------------------------------------
  public getAstrologyEntities(query?: string): IUnifiedRetrievedEntity[] {
    const entities = this.astrologyRegistry.getAdminEntities();
    return entities.map(e => ({
      id: e.id,
      domain: 'Astrology',
      canonicalName: e.canonicalName,
      sanskritName: e.sanskritName,
      entityType: e.entityType,
      description: e.description,
      sourceBook: e.sourceTraceability?.sourceBook || 'Brihat Parashara Hora Shastra',
      chapterOrVerse: e.sourceTraceability?.verseOrShloka || 'Shloka 1',
      confidenceScore: e.truthEngineMetrics?.confidenceScore || 99,
      confidenceGrade: e.truthEngineMetrics?.confidenceGrade || 'A+',
      verificationStatus: e.status || 'CANONICAL',
      attributes: {
        associatedRashi: e.associatedRashi,
        associatedBhava: e.associatedBhava,
        associatedNakshatra: e.associatedNakshatra,
        associatedPlanet: e.associatedPlanet,
        associatedElement: e.associatedElement
      },
      tags: e.tags || ['Astrology', 'Graha', 'Vedic']
    }));
  }

  // ----------------------------------------------------
  // UNIFIED MULTI-DOMAIN RETRIEVAL
  // ----------------------------------------------------
  public retrieveAllEntities(domains?: KnowledgeDomain[]): IUnifiedRetrievedEntity[] {
    const activeDomains = domains && domains.length > 0
      ? domains
      : (['Vastu', 'Chakra', 'LalKitab', 'Numerology', 'Astrology'] as KnowledgeDomain[]);

    let results: IUnifiedRetrievedEntity[] = [];

    if (activeDomains.includes('Vastu')) results.push(...this.getVastuEntities());
    if (activeDomains.includes('Chakra')) results.push(...this.getChakraEntities());
    if (activeDomains.includes('LalKitab')) results.push(...this.getLalKitabEntities());
    if (activeDomains.includes('Numerology')) results.push(...this.getNumerologyEntities());
    if (activeDomains.includes('Astrology')) results.push(...this.getAstrologyEntities());

    return results;
  }
}
