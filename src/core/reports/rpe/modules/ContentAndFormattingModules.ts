// ============================================================================
// URJAFLUX AI OS - RPE CONTENT, STRUCTURAL & FORMATTING MODULES
// Section Generation, Tables, Summaries, Layouts & Translation
// ============================================================================

import { IIntegratedConsultationPackage } from "../../../integrated_intelligence/types/iie.types";
import { 
  ReportType, 
  SupportedLanguage, 
  IReportSection, 
  IReportTable, 
  IReportSummaryItem, 
  IDeliveryOptions 
} from "../types/rpe.types";

export class SectionBuilder {
  /**
   * Generates structured sections based on the ReportType (Consultant, Homeowner, Visitor)
   */
  public static buildSections(
    consultation: IIntegratedConsultationPackage,
    reportType: ReportType,
    deliveryOptions: IDeliveryOptions
  ): IReportSection[] {
    const sections: IReportSection[] = [];

    // 1. EXECUTIVE SUMMARY SECTION (Common to all, level of detail varies)
    sections.push({
      sectionId: 'SEC_EXEC_SUMMARY',
      title: reportType === 'HOMEOWNER_REPORT' ? 'Your Harmonization Summary' : 'Executive Consultation Summary',
      order: 1,
      blocks: [
        {
          blockId: 'BLK_EXEC_01',
          type: 'CALLOUT',
          title: 'Consultation Overview',
          content: deliveryOptions.clientGreetingName 
            ? `Dear ${deliveryOptions.clientGreetingName}, welcome to your spatial harmonization consultation package.`
            : 'Welcome to your spatial harmonization consultation package.'
        },
        {
          blockId: 'BLK_EXEC_02',
          type: 'METRIC',
          title: 'Domains Evaluated',
          content: `Involved Domains: ${consultation.crossDomainSummary.involvedDomains.join(', ')}`
        }
      ]
    });

    // 2. FINDINGS SECTION
    if (reportType === 'CONSULTANT_REPORT') {
      sections.push({
        sectionId: 'SEC_CONSULTANT_FINDINGS',
        title: 'Technical Spatial Findings & Rule Matches',
        order: 2,
        isConsultantOnly: true,
        blocks: consultation.integratedFindings.map((f, idx) => ({
          blockId: `BLK_FINDING_${idx}`,
          type: 'TEXT',
          title: `${f.title} [${f.domain}] - Zone ${f.spatialZone}`,
          content: `${f.description} (Severity: ${f.severity}, Confidence: ${(f.confidenceScore * 100).toFixed(1)}%, Rules: ${f.associatedRuleIds.join(', ')})`
        }))
      });
    } else if (reportType === 'HOMEOWNER_REPORT') {
      sections.push({
        sectionId: 'SEC_HOMEOWNER_FINDINGS',
        title: 'Key Energy Alignment Insights',
        order: 2,
        blocks: consultation.integratedFindings.map((f, idx) => ({
          blockId: `BLK_HOME_FINDING_${idx}`,
          type: 'CALLOUT',
          title: f.title,
          content: `In the ${f.spatialZone} zone: ${f.description}`
        }))
      });
    } else if (reportType === 'VISITOR_REPORT') {
      sections.push({
        sectionId: 'SEC_VISITOR_PREVIEW',
        title: 'Spatial Overview Teaser',
        order: 2,
        blocks: [
          {
            blockId: 'BLK_VIS_01',
            type: 'CALLOUT',
            title: 'Primary Energy Highlight',
            content: consultation.integratedFindings[0] 
              ? `Key focus detected in ${consultation.integratedFindings[0].spatialZone}: ${consultation.integratedFindings[0].title}`
              : 'Spatial analysis completed successfully.'
          },
          {
            blockId: 'BLK_VIS_UPGRADE',
            type: 'PROMPT_CARD',
            title: 'Unlock Full Consultant Consultation',
            content: 'Upgrade your subscription package to view all 16-zone detailed breakdown, exact remedy locations, and customized product specs.'
          }
        ]
      });
    }

    // 3. REMEDY ROADMAP SECTION
    if (reportType !== 'VISITOR_REPORT') {
      sections.push({
        sectionId: 'SEC_REMEDY_ROADMAP',
        title: reportType === 'HOMEOWNER_REPORT' ? 'Step-by-Step Action Plan' : 'Master Execution Roadmap & Remedy Matrix',
        order: 3,
        blocks: consultation.executionRoadmap.map((item, idx) => ({
          blockId: `BLK_ROADMAP_${idx}`,
          type: 'REMEDY_CARD',
          title: `Step ${item.stepNumber}: ${item.title} (${item.phase})`,
          content: `${item.description} | Category: ${item.structuralCategory} | Complexity: ${item.estimatedComplexity}`
        }))
      });
    } else {
      sections.push({
        sectionId: 'SEC_VISITOR_REMEDY_PREVIEW',
        title: 'Recommended Remedial Paths',
        order: 3,
        blocks: [
          {
            blockId: 'BLK_VIS_REMEDY_01',
            type: 'REMEDY_CARD',
            title: 'Primary Non-Structural Harmonization',
            content: consultation.bestRemedyCandidates[0]?.primaryRemedyText || 'Elemental balance recommended.'
          }
        ]
      });
    }

    return sections;
  }
}

export class TableBuilder {
  public static buildTables(consultation: IIntegratedConsultationPackage, reportType: ReportType): IReportTable[] {
    const tables: IReportTable[] = [];

    // Best Remedies Table
    tables.push({
      tableId: 'TBL_BEST_REMEDIES',
      caption: 'Recommended Best Harmonization Remedies',
      columns: [
        { key: 'remedyId', label: 'Remedy ID', widthPercent: 15 },
        { key: 'domain', label: 'Domain', widthPercent: 15 },
        { key: 'zone', label: 'Zone', widthPercent: 15 },
        { key: 'primaryText', label: 'Recommended Action', widthPercent: 40 },
        { key: 'priority', label: 'Priority', widthPercent: 15 }
      ],
      rows: consultation.bestRemedyCandidates.map(r => ({
        remedyId: reportType === 'CONSULTANT_REPORT' ? r.remedyId : `REM-${r.candidateId.substring(0, 4)}`,
        domain: r.targetDomain,
        zone: r.targetZoneOrDirection,
        primaryText: r.primaryRemedyText,
        priority: r.priority
      }))
    });

    // Product Preparation Table
    if (reportType !== 'VISITOR_REPORT' && consultation.productPreparationPackage.items.length > 0) {
      tables.push({
        tableId: 'TBL_PRODUCTS',
        caption: 'Harmonization Materials & Product Specifications',
        columns: [
          { key: 'category', label: 'Category', widthPercent: 25 },
          { key: 'materials', label: 'Required Materials', widthPercent: 45 },
          { key: 'installation', label: 'Installation Type', widthPercent: 30 }
        ],
        rows: consultation.productPreparationPackage.items.map(p => ({
          category: p.requiredProductCategory,
          materials: p.materialList.join(', '),
          installation: p.installationType
        }))
      });
    }

    return tables;
  }
}

export class SummaryBuilder {
  public static buildSummaries(consultation: IIntegratedConsultationPackage, reportType: ReportType): IReportSummaryItem[] {
    return [
      {
        summaryId: 'SUM_01',
        headline: 'Overall Property Harmonization Index',
        overallEnergyScore: 88,
        grade: 'A - HIGH HARMONY',
        keyPoints: [
          `Evaluated across ${consultation.crossDomainSummary.involvedDomains.length} distinct knowledge domains.`,
          `Identified ${consultation.bestRemedyCandidates.length} high-impact non-structural remedies.`,
          `Resolved ${consultation.conflictSummary.totalConflicts} cross-domain contradictions seamlessly.`
        ]
      }
    ];
  }
}

export class TranslationLayer {
  private static dictionary: Record<SupportedLanguage, Record<string, string>> = {
    'ENGLISH': {},
    'HINDI': {
      'Executive Consultation Summary': 'कार्यकारी परामर्श सारांश',
      'Step-by-Step Action Plan': 'चरण-दर-चरण कार्य योजना',
      'Key Energy Alignment Insights': 'मुख्य ऊर्जा संतुलन अंतर्दृष्टि'
    },
    'HINGLISH': {
      'Executive Consultation Summary': 'Executive Consultation Summary',
      'Step-by-Step Action Plan': 'Step-by-Step Remedial Action Plan',
      'Key Energy Alignment Insights': 'Key Energy Alignment Insights'
    }
  };

  public static translateText(text: string, language: SupportedLanguage): string {
    if (language === 'ENGLISH' || !this.dictionary[language]) return text;
    return this.dictionary[language][text] || text;
  }
}

export class FormattingEngine {
  public static formatText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }
}

export class LayoutEngine {
  public static getLayoutSpec(reportType: ReportType): { columns: number; cardStyle: string } {
    if (reportType === 'HOMEOWNER_REPORT') {
      return { columns: 2, cardStyle: 'rounded-xl shadow-sm border border-slate-200' };
    }
    return { columns: 1, cardStyle: 'rounded-none border-b border-slate-300' };
  }
}
