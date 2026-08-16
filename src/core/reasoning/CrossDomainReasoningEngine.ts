import {
  IReasoningInput,
  IReasoningSession,
  IRecommendation,
  IReasoningChain,
  IReasoningConflict,
  IUnifiedReasoningContext,
  UserRole,
  IEndUserRecommendation
} from './ReasoningTypes';

import { ContextBuilder } from './ContextBuilder';

import { EvidenceAggregator } from './EvidenceAggregator';
import { ConflictResolver } from './ConflictResolver';
import { RecommendationBuilder } from './RecommendationBuilder';
import { ExplanationGenerator } from './ExplanationGenerator';
import { RecommendationRankingEngine } from './RecommendationRankingEngine';

export class CrossDomainReasoningEngine {
  private static instance: CrossDomainReasoningEngine;
  private contextBuilder: ContextBuilder;
  private conflictResolver: ConflictResolver;

  private constructor() {
    this.contextBuilder = new ContextBuilder();
    this.conflictResolver = ConflictResolver.getInstance();
  }

  public static getInstance(): CrossDomainReasoningEngine {
    if (!CrossDomainReasoningEngine.instance) {
      CrossDomainReasoningEngine.instance = new CrossDomainReasoningEngine();
    }
    return CrossDomainReasoningEngine.instance;
  }

  /**
   * Executes a complete cross-domain unified reasoning workflow
   */
  public executeReasoning(
    input: IReasoningInput,
    sessionTitle?: string
  ): IReasoningSession {
    const auditLog: string[] = [];

    const startTime = new Date().toISOString();
    auditLog.push(`[${startTime}] Initiated Cross-Domain Unified Reasoning Engine Session.`);

    // 1. Build Unified Context & Graph
    const unifiedContext: IUnifiedReasoningContext = this.contextBuilder.buildUnifiedContext(input);
    auditLog.push(`[${new Date().toISOString()}] Context Builder initialized. Graph loaded with ${unifiedContext.nodes.length} nodes and ${unifiedContext.edges.length} edges.`);

    // 2. Detect Cross-Domain Conflicts
    const conflicts: IReasoningConflict[] = this.conflictResolver.detectConflicts(unifiedContext.nodes);
    auditLog.push(`[${new Date().toISOString()}] Conflict Resolver completed scan. Detected ${conflicts.length} conflict(s).`);

    // 3. Synthesize Candidate Recommendations across Categories
    const rawRecommendations: IRecommendation[] = [];
    const reasoningChains: IReasoningChain[] = [];

    // Category 1: Vastu Spatial Alignment
    const vastuNodes = unifiedContext.nodes.filter(n => n.domain === 'Vastu');
    if (vastuNodes.length > 0) {
      const evidence = EvidenceAggregator.aggregateEvidence(
        vastuNodes,
        ['Vastu Spatial Orientation Rule', 'Mayamatam Padavinyasa Mandate']
      );
      const rec = RecommendationBuilder.buildRecommendation(
        'Vastu Spatial Alignment',
        `Optimize ${input.roomOrZone || 'Spatial Direction'} via Mayamatam Architecture`,
        `Align spatial usage of ${input.cardinalDirection || 'Northeast'} according to Mayamatam & Samarangana Sutradhara shlokas. Ensure Brahmasthan remains unencumbered.`,
        evidence,
        conflicts.filter(c => c.domainA === 'Vastu' || c.domainB === 'Vastu'),
        ['Verify structural cardinal axis', 'Clear central Brahmasthan clearance'],
        'CRITICAL',
        'Balanced elemental energy flow and enhanced architectural harmony.'
      );
      rawRecommendations.push(rec);

      const chain = ExplanationGenerator.generateReasoningChain(
        rec.id,
        rec.title,
        evidence,
        rec.conflicts,
        rec.confidenceScore
      );
      reasoningChains.push(chain);
    }

    // Category 2: Unified Cross-Domain Synergy (Vastu + Lal Kitab + Chakra + Numerology + Astrology)
    const allDomainNodes = unifiedContext.nodes.filter(n => n.domain !== 'UserContext');
    if (allDomainNodes.length > 0) {
      const evidence = EvidenceAggregator.aggregateEvidence(
        allDomainNodes,
        [
          'Cross-Domain Pancha Tattva Resonant Alignment',
          'Graha-Rashi-Chakra-Vastu Convergence Matrix'
        ]
      );
      const rec = RecommendationBuilder.buildRecommendation(
        'Unified Cross-Domain Synergy',
        `Pancha Tattva & Graha Harmonization Strategy for ${input.primaryElement || 'Agni & Water Axis'}`,
        `Synthesize Vastu room layout with Lal Kitab planetary remedy, Chakra vocalization (${input.chakraZone || 'Anahata'}), Chaldean number vibration, and classical Astrological Graha strength.`,
        evidence,
        conflicts,
        ['Establish physical direction', 'Assess birth chart ascendant', 'Check name vibration'],
        'HIGH',
        'Multi-dimensional alignment resolving physical, karmic, energetic, and numeric friction.'
      );
      rawRecommendations.push(rec);

      const chain = ExplanationGenerator.generateReasoningChain(
        rec.id,
        rec.title,
        evidence,
        rec.conflicts,
        rec.confidenceScore
      );
      reasoningChains.push(chain);
    }

    // Category 3: Karmic Remedial Strategy (Lal Kitab)
    const lalkitabNodes = unifiedContext.nodes.filter(n => n.domain === 'LalKitab');
    if (lalkitabNodes.length > 0) {
      const evidence = EvidenceAggregator.aggregateEvidence(
        lalkitabNodes,
        ['Lal Kitab 1952 House Remedial Rule']
      );
      const rec = RecommendationBuilder.buildRecommendation(
        'Karmic Remedial Strategy',
        `Non-Invasive Lal Kitab Remedy for House Placement`,
        `Apply specific non-invasive remedy (e.g. copper container with rainwater or silver square item) to stabilize planetary transit effect in accordance with Lal Kitab 1952 edition.`,
        evidence,
        conflicts.filter(c => c.domainA === 'LalKitab' || c.domainB === 'LalKitab'),
        ['Confirm non-destructive practice', 'Observe 43-day continuity guideline'],
        'HIGH',
        'Neutralization of adverse planetary transit effects without structural changes.'
      );
      rawRecommendations.push(rec);

      const chain = ExplanationGenerator.generateReasoningChain(
        rec.id,
        rec.title,
        evidence,
        rec.conflicts,
        rec.confidenceScore
      );
      reasoningChains.push(chain);
    }

    // Category 4: Chakra Energetic Harmony
    const chakraNodes = unifiedContext.nodes.filter(n => n.domain === 'Chakra');
    if (chakraNodes.length > 0) {
      const evidence = EvidenceAggregator.aggregateEvidence(
        chakraNodes,
        ['Sat Chakra Nirupana Beeja Mantra Rule']
      );
      const rec = RecommendationBuilder.buildRecommendation(
        'Chakra Energetic Harmony',
        `Energetic Activation of ${input.chakraZone || 'Heart/Anahata'} Center`,
        `Utilize specific vocalization mantra, color focus, and elemental meditation matching the spatial zone element.`,
        evidence,
        conflicts.filter(c => c.domainA === 'Chakra' || c.domainB === 'Chakra'),
        ['Daily 15-minute practice', 'Quiet meditation space in designated zone'],
        'MEDIUM',
        'Heightened pranic vitality and emotional equilibrium.'
      );
      rawRecommendations.push(rec);

      const chain = ExplanationGenerator.generateReasoningChain(
        rec.id,
        rec.title,
        evidence,
        rec.conflicts,
        rec.confidenceScore
      );
      reasoningChains.push(chain);
    }

    // Category 5: Numeric Name Vibration
    const numerologyNodes = unifiedContext.nodes.filter(n => n.domain === 'Numerology');
    if (numerologyNodes.length > 0) {
      const evidence = EvidenceAggregator.aggregateEvidence(
        numerologyNodes,
        ['Chaldean Numeric Frequency Harmonization Rule']
      );
      const rec = RecommendationBuilder.buildRecommendation(
        'Numeric Name Vibration',
        `Chaldean Compound Number Calibration`,
        `Calibrate total name number or house number vibration to align with Life Path and planetary ruler frequencies.`,
        evidence,
        conflicts.filter(c => c.domainA === 'Numerology' || c.domainB === 'Numerology'),
        ['Calculate primary Chaldean grid', 'Evaluate secondary name compound'],
        'MEDIUM',
        'Harmonious subtle vibrational resonance in personal branding and address numbers.'
      );
      rawRecommendations.push(rec);

      const chain = ExplanationGenerator.generateReasoningChain(
        rec.id,
        rec.title,
        evidence,
        rec.conflicts,
        rec.confidenceScore
      );
      reasoningChains.push(chain);
    }

    // 4. Rank and Sort Recommendations
    const rankedRecommendations = RecommendationRankingEngine.rankRecommendations(rawRecommendations);
    auditLog.push(`[${new Date().toISOString()}] Recommendation Ranking Engine completed. Ranked ${rankedRecommendations.length} recommendations.`);

    const sessionId = `ses-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      sessionId,
      sessionTitle: sessionTitle || `Reasoning Session: ${input.roomOrZone || 'Spatial Architecture'} (${input.propertyType || 'General'})`,
      timestamp: new Date().toISOString(),
      inputParams: input,
      unifiedContext,
      recommendations: rankedRecommendations,
      reasoningChains,
      conflicts,
      auditLog
    };
  }

  /**
   * Sanitizes recommendations for END_USER role according to RBAC rules
   */
  public sanitizeForEndUser(recommendations: IRecommendation[]): IEndUserRecommendation[] {
    return recommendations
      .filter(r => r.status === 'APPROVED') // Only approved recommendations
      .map(r => ({
        id: r.id,
        category: r.category,
        title: r.title,
        description: r.description,
        priority: r.priority,
        confidenceScore: r.confidenceScore,
        confidenceGrade: r.confidenceGrade,
        expectedOutcome: r.expectedOutcome,
        preconditions: r.preconditions,
        supportingDomains: r.supportingDomains
      }));
  }
}
