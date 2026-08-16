import { IVastuDocumentMetadata, IVastuQualityScoreBreakdown } from "./VastuKnowledgeTypes";

export class VastuQualityEngine {
  private static instance: VastuQualityEngine;

  private constructor() {}

  public static getInstance(): VastuQualityEngine {
    if (!VastuQualityEngine.instance) {
      VastuQualityEngine.instance = new VastuQualityEngine();
    }
    return VastuQualityEngine.instance;
  }

  public calculateQualityScore(doc: IVastuDocumentMetadata, entityCount: number = 10, relationshipCount: number = 8): IVastuQualityScoreBreakdown {
    // 1. OCR Quality Score
    const ocrQualityScore = Math.min(100, Math.max(0, doc.ocrConfidence * 100));

    // 2. Metadata Completeness Score
    let metaFieldsPresent = 0;
    const totalFields = 10;
    if (doc.title) metaFieldsPresent++;
    if (doc.author) metaFieldsPresent++;
    if (doc.publisher) metaFieldsPresent++;
    if (doc.publicationYear) metaFieldsPresent++;
    if (doc.language) metaFieldsPresent++;
    if (doc.category) metaFieldsPresent++;
    if (doc.subject) metaFieldsPresent++;
    if (doc.keywords && doc.keywords.length > 0) metaFieldsPresent++;
    if (doc.pageCount && doc.pageCount > 0) metaFieldsPresent++;
    if (doc.uploadedBy) metaFieldsPresent++;

    const metadataCompletenessScore = Math.round((metaFieldsPresent / totalFields) * 100);

    // 3. Ontology Completeness
    const ontologyCompletenessScore = Math.min(100, Math.round((entityCount / 12) * 100));

    // 4. Relationship Density
    const relationshipDensityScore = Math.min(100, Math.round((relationshipCount / 10) * 100));

    // 5. Embedding Quality Score
    const embeddingQualityScore = 95;

    // 6. Expert Approval Score
    let expertApprovalScore = 50;
    if (doc.approvalStatus === 'Approved') expertApprovalScore = 100;
    else if (doc.approvalStatus === 'Reviewed') expertApprovalScore = 75;
    else if (doc.approvalStatus === 'Needs Revision') expertApprovalScore = 40;
    else if (doc.approvalStatus === 'Rejected') expertApprovalScore = 0;

    // Weighted Overall Score Calculation
    const overallScore = Math.round(
      ocrQualityScore * 0.20 +
      metadataCompletenessScore * 0.15 +
      ontologyCompletenessScore * 0.20 +
      relationshipDensityScore * 0.15 +
      embeddingQualityScore * 0.10 +
      expertApprovalScore * 0.20
    );

    let qualityGrade: 'A+' | 'A' | 'B' | 'C' | 'F' = 'F';
    if (overallScore >= 92) qualityGrade = 'A+';
    else if (overallScore >= 80) qualityGrade = 'A';
    else if (overallScore >= 70) qualityGrade = 'B';
    else if (overallScore >= 60) qualityGrade = 'C';

    const recommendations: string[] = [];
    if (ocrQualityScore < 85) recommendations.push("Re-run high-resolution OCR preprocessing.");
    if (metadataCompletenessScore < 90) recommendations.push("Complete publisher and edition metadata fields.");
    if (ontologyCompletenessScore < 80) recommendations.push("Extract additional Vastu entities (deities, zones, objects).");
    if (doc.approvalStatus !== 'Approved') recommendations.push("Submit document to Expert Review Queue for final sign-off.");

    return {
      overallScore,
      ocrQualityScore: Math.round(ocrQualityScore),
      metadataCompletenessScore,
      ontologyCompletenessScore,
      relationshipDensityScore,
      embeddingQualityScore,
      expertApprovalScore,
      qualityGrade,
      recommendations
    };
  }
}
