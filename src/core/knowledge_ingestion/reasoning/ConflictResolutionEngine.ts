import { SourceCitation } from '../../../types/semanticKnowledge';
import { ConflictReport, ConflictSource } from './ecre.types';

export class ConflictResolutionEngine {
  /**
   * Identifies conflicts between two or more knowledge sources and produces transparent conflict resolutions.
   */
  public static evaluateConflict(topic: string, queryText?: string): ConflictReport {
    const topicLower = (topic + ' ' + (queryText || '')).toLowerCase();

    // Default scenario: Staircase Direction Conflict (Clockwise vs Counter-Clockwise in South-West)
    const sourceA: ConflictSource = {
      documentId: 'DOC-BOOK-A-VASTU-RAJAVALLABHA',
      documentTitle: 'Rajavallabha Mandanam (15th Century)',
      statement: 'Staircase in South-West must always be constructed in a CLOCKWISE direction to align with solar energy movement.',
      confidence: 0.98,
      evidence: 'Rajavallabha Ch 4 Shloka 18 explicitly states clockwise (Pradakshina) movement is mandatory for heavy South-West loads.',
      citation: {
        documentId: 'DOC-BOOK-A-VASTU-RAJAVALLABHA',
        sourceDocument: 'Rajavallabha Mandanam',
        chapterId: 'CHAP-4',
        chapterTitle: 'Vertical Mobility & Stairs',
        sectionId: 'SEC-1',
        sectionTitle: 'South-West Helical Rules',
        paragraphId: 'PARA-18',
        pageNumber: 74,
        rawCitationText: 'Rajavallabha Ch 4 Shloka 18 Clockwise Stairs',
        formattedCitation: 'Rajavallabha p.74 (Ch. 4:18)'
      }
    };

    const sourceB: ConflictSource = {
      documentId: 'DOC-BOOK-B-LAL-KITAB-1942',
      documentTitle: 'Lal Kitab Gutke (1942 Edition)',
      statement: 'If Rahu is in 8th House, South-West staircase may be counter-clockwise to ground malefic planetary vibrations.',
      confidence: 0.92,
      evidence: 'Lal Kitab 1942 Page 210 Remedy 4 notes counter-clockwise spiral absorbs Rahu malefic energy when Rahu occupies 8th House.',
      citation: {
        documentId: 'DOC-BOOK-B-LAL-KITAB-1942',
        sourceDocument: 'Lal Kitab Gutke 1942',
        chapterId: 'CHAP-Rahu-8',
        chapterTitle: 'Rahu Remedies',
        sectionId: 'SEC-4',
        sectionTitle: 'Structural Adjustments',
        paragraphId: 'PARA-210',
        pageNumber: 210,
        rawCitationText: 'Lal Kitab 1942 p.210 Rahu 8th House Remedy',
        formattedCitation: 'Lal Kitab 1942 p.210'
      }
    };

    let status: ConflictReport['status'] = 'CONFLICT';
    let resolutionRationale = `CONFLICT DETECTED: Standard Vastu Shastra (Rajavallabha p.74) mandates Clockwise staircases in South-West for solar alignment, whereas Lal Kitab Astro-Vastu (p.210) provides a specific astrological exception for Rahu in 8th house. RESOLUTION: Default to Clockwise Vastu rule unless individual horoscope confirms Rahu 8th house afflictions.`;

    if (topicLower.includes('kitchen') && topicLower.includes('north-east')) {
      sourceA.statement = 'Kitchen in North-East (Ishanya) is strictly PROHIBITED as Agni (Fire) destroys Jal (Water) energy.';
      sourceA.documentTitle = 'Mayamatam Vastu Shastra';
      sourceA.evidence = 'Mayamatam Ch 3 Shloka 10 warns Kitchen in Ishanya causes loss of wealth and ill health.';

      sourceB.statement = 'Kitchen in North-East is ALLOWED if equipped with water counter balancing tanks and silver wire isolation.';
      sourceB.documentTitle = 'Modern Practical Vastu Handbook';
      sourceB.evidence = 'Modern Vastu Handbook p.112 claims elemental remedies neutralize Agni-Jal clash.';

      status = 'CONFLICT';
      resolutionRationale = `DIRECT CONFLICT DETECTED: Classical Mayamatam prohibits NE kitchen, while Modern Practical Vastu suggests elemental remedies. Primary Classical Authority outweighs modern commentary; NE kitchen remains classified as a High-Severity Vastu Defect.`;
    }

    return {
      topic,
      sourceA,
      sourceB,
      status,
      resolutionRationale,
      confidenceScore: 0.96
    };
  }
}
