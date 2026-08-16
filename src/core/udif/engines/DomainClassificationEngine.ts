// ============================================================================
// URJAFLUX AI OS - UDIF Engine 2: Domain Classification Engine
// Classifies Candidate Content into Single Domain, Multi Domain, or Unknown Domain
// ============================================================================

import { ExtendedSupportedDomain } from '../types/udif.types';

export interface IDomainClassificationResult {
  routingType: 'SINGLE_DOMAIN' | 'MULTI_DOMAIN' | 'UNKNOWN_DOMAIN';
  primaryDomain?: ExtendedSupportedDomain;
  detectedDomains: Array<{
    domainCode: ExtendedSupportedDomain;
    confidence: number;
    evidence: string[];
  }>;
  overallConfidence: number;
  evaluatedAt: string;
}

export class DomainClassificationEngine {
  private domainKeywords: Record<string, string[]> = {
    VASTU: ['vastu', 'ishan', 'agneya', 'nairrutya', 'vayavya', 'zone', 'pada', 'brahmasthan', 'direction', 'devta', 'kitchen', 'entrance'],
    LAL_KITAB: ['lal kitab', 'totka', 'copper coin', 'flowing water', 'house 1', 'house 6', 'blind planet', 'pucca house'],
    NUMEROLOGY: ['numerology', 'driver number', 'destiny number', 'chaldean', 'pythagorean', 'lo shu', 'compound number', 'missing number', 'name sum', 'lucky number'],
    AYURVEDA: ['ayurveda', 'vata', 'pitta', 'kapha', 'dosha', 'prakriti', 'vikriti', 'panchakarma', 'herb'],
    FENG_SHUI: ['feng shui', 'bagua', 'chi', 'yin', 'yang', 'wind water'],
    PYRAMID_SCIENCE: ['pyramid', 'pyramidal energy', 'bio energy'],
    GEOPATHIC_STRESS: ['geopathic', 'hartmann grid', 'curry grid', 'earth radiation'],
    REIKI: ['reiki', 'chakra', 'cho ku rei', 'sei he ki'],
    AURA: ['aura', 'biofield', 'kirlian'],
    SACRED_GEOMETRY: ['sacred geometry', 'flower of life', 'sri yantra', 'platonic solids'],
  };

  public classifyCandidatePackage(candidatePackage: Record<string, any>): IDomainClassificationResult {
    const textContent = (
      (candidatePackage.title || '') +
      ' ' +
      (candidatePackage.description || '') +
      ' ' +
      JSON.stringify(candidatePackage.entities || [])
    ).toLowerCase();

    const detected: Array<{
      domainCode: ExtendedSupportedDomain;
      confidence: number;
      evidence: string[];
    }> = [];

    Object.entries(this.domainKeywords).forEach(([domain, keywords]) => {
      const matches = keywords.filter((kw) => textContent.includes(kw));
      if (matches.length > 0) {
        const confidence = Math.min(1.0, 0.4 + matches.length * 0.2);
        detected.push({
          domainCode: domain as ExtendedSupportedDomain,
          confidence,
          evidence: matches.map((m) => `Keyword match: '${m}'`),
        });
      }
    });

    detected.sort((a, b) => b.confidence - a.confidence);

    if (detected.length === 0) {
      return {
        routingType: 'UNKNOWN_DOMAIN',
        detectedDomains: [],
        overallConfidence: 0.0,
        evaluatedAt: new Date().toISOString(),
      };
    } else if (detected.length === 1 || (detected[0].confidence >= 0.8 && (detected[1]?.confidence || 0) < 0.5)) {
      return {
        routingType: 'SINGLE_DOMAIN',
        primaryDomain: detected[0].domainCode,
        detectedDomains: detected,
        overallConfidence: detected[0].confidence,
        evaluatedAt: new Date().toISOString(),
      };
    } else {
      return {
        routingType: 'MULTI_DOMAIN',
        primaryDomain: detected[0].domainCode,
        detectedDomains: detected,
        overallConfidence: detected[0].confidence,
        evaluatedAt: new Date().toISOString(),
      };
    }
  }
}
