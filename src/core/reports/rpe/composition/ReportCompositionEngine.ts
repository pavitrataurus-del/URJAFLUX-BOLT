// ============================================================================
// URJAFLUX AI OS - REPORT COMPOSITION ENGINE (RCE) & DOMAIN FILTER ENGINE
// Corrections 2 & 3: Presentation Brain & Dynamic Domain Filtering
// ============================================================================

import { IIntegratedConsultationPackage } from "../../../integrated_intelligence/types/iie.types";
import { 
  IReportObjectModel, 
  ReportTypeId, 
  IDeliveryOptions, 
  IWhiteLabelConfig, 
  IMediaAsset,
  ISectionBuilderParams
} from "../types/rpe.types";

import { ReportObjectModelFactory } from "../rom/ReportObjectModel";
import { reportSectionRegistry } from "../registry/ReportSectionRegistry";

export class DomainFilterEngine {
  /**
   * Non-destructively filters an IIntegratedConsultationPackage by specified domain list
   */
  public static filterPackageByDomains(
    consultation: IIntegratedConsultationPackage,
    selectedDomains: string[]
  ): IIntegratedConsultationPackage {
    // If 'ALL' or empty, return original package unchanged
    if (!selectedDomains || selectedDomains.length === 0 || selectedDomains.includes('ALL')) {
      return consultation;
    }

    const domainSet = new Set(selectedDomains.map(d => d.toUpperCase()));

    const filteredFindings = consultation.integratedFindings.filter(f => domainSet.has(f.domain.toUpperCase()));
    const filteredRemedies = consultation.bestRemedyCandidates.filter(r => domainSet.has(r.targetDomain.toUpperCase()));
    const filteredRoadmap = consultation.executionRoadmap.filter(step => {
      // Keep roadmap step if any associated remedy is in filtered set
      return step.associatedRemedyIds.some(remId => 
        filteredRemedies.some(fr => fr.remedyId === remId)
      );
    });

    return {
      ...consultation,
      integratedFindings: filteredFindings,
      bestRemedyCandidates: filteredRemedies,
      executionRoadmap: filteredRoadmap,
      crossDomainSummary: {
        ...consultation.crossDomainSummary,
        involvedDomains: Array.from(domainSet) as any[]
      }
    };
  }
}

export class ReportCompositionEngine {
  private static instance: ReportCompositionEngine;

  private constructor() {}

  public static getInstance(): ReportCompositionEngine {
    if (!ReportCompositionEngine.instance) {
      ReportCompositionEngine.instance = new ReportCompositionEngine();
    }
    return ReportCompositionEngine.instance;
  }

  /**
   * Primary Brain Method: Composes a complete Report Object Model (ROM)
   */
  public composeReport(
    consultation: IIntegratedConsultationPackage,
    reportTypeId: ReportTypeId,
    deliveryOptions: IDeliveryOptions,
    whiteLabelConfig: IWhiteLabelConfig,
    snapshotId: string,
    brandProfileId: string,
    mediaAssets?: IMediaAsset[],
    moduleInsights?: ISectionBuilderParams["moduleInsights"]
  ): IReportObjectModel {
    // 1. Apply Domain Filter Engine
    const domainsToFilter = deliveryOptions.separateDomainSelection || ['ALL'];
    const filteredConsultation = DomainFilterEngine.filterPackageByDomains(consultation, domainsToFilter);

    // 2. Fetch Report Type Definition from Registry
    const typeDef = reportSectionRegistry.getReportType(reportTypeId) || reportSectionRegistry.getReportType('CONSULTANT_REPORT')!;

    // 3. Initialize ROM Container
    const reportTitle = deliveryOptions.customReportTitle || typeDef.displayName;
    const subtitle = `Tailored for ${typeDef.targetAudience} | ${whiteLabelConfig.companyName}`;
    const rom = ReportObjectModelFactory.createEmptyRom(
      reportTypeId,
      reportTitle,
      subtitle,
      snapshotId,
      brandProfileId
    );

    // 4. Build Sections dynamically from Registry
    const sectionCodesToBuild = [...typeDef.requiredSectionCodes, ...(typeDef.optionalSectionCodes || [])];
    const sectionBuilderParams: ISectionBuilderParams = {
      consultation: filteredConsultation,
      deliveryOptions,
      mediaAssets: mediaAssets || [],
      selectedDomains: domainsToFilter,
      moduleInsights,
    };

    const romSections = sectionCodesToBuild.map((code, idx) => {
      const sectionDef = reportSectionRegistry.getSection(code);
      if (!sectionDef) return null;
      const section = sectionDef.buildSection(sectionBuilderParams);
      section.order = idx + 1;
      return section;
    }).filter(s => s !== null);

    rom.sections = romSections as any[];
    rom.mediaReferences = mediaAssets || [];

    return rom;
  }
}

export const reportCompositionEngine = ReportCompositionEngine.getInstance();
