import { ILalKitabOntologyEntity, ILalKitabQualityScoreBreakdown } from './LalKitabKnowledgeTypes';

export class LalKitabQualityEngine {
  public computeQualityScore(entity: ILalKitabOntologyEntity): ILalKitabQualityScoreBreakdown {
    const ocrAccuracy = entity.sourceTraceability?.ocrConfidence ? Math.round(entity.sourceTraceability.ocrConfidence * 100) : 90;
    const sourceAuthority = entity.truthEngineMetrics?.sourceReliability || 95;
    const evidenceStrength = entity.truthEngineMetrics?.evidenceStrength || 90;
    const smeConsensus = entity.truthEngineMetrics?.expertConsensusStatus === 'Approved' ? 98 : 75;

    // Ontological completeness checks
    let completenessScore = 0;
    if (entity.canonicalName) completenessScore += 20;
    if (entity.hindiName) completenessScore += 20;
    if (entity.description && entity.description.length > 20) completenessScore += 20;
    if (entity.sourceTraceability?.sourceBook) completenessScore += 20;
    if (entity.tags && entity.tags.length > 0) completenessScore += 20;

    const overallScore = Math.round(
      ocrAccuracy * 0.2 +
      sourceAuthority * 0.25 +
      evidenceStrength * 0.25 +
      smeConsensus * 0.15 +
      completenessScore * 0.15
    );

    let grade: 'A+' | 'A' | 'B' | 'C' | 'F' = 'B';
    if (overallScore >= 95) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 70) grade = 'B';
    else if (overallScore >= 55) grade = 'C';
    else grade = 'F';

    return {
      ocrAccuracy,
      sourceAuthority,
      evidenceStrength,
      smeConsensus,
      ontologicalCompleteness: completenessScore,
      overallScore,
      grade
    };
  }
}
