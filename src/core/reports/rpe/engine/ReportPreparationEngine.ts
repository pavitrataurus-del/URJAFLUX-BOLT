// ============================================================================
// URJAFLUX AI OS - REPORT PREPARATION ENGINE (RPE) MASTER ENGINE
// Primary Orchestrator - Transforms IIntegratedConsultationPackage to IReportPackage
// ============================================================================

import { IIntegratedConsultationPackage } from "../../../integrated_intelligence/types/iie.types";
import { 
  IReportPackage, 
  IDeliveryOptions, 
  IWhiteLabelConfig, 
  IReportDocument, 
  ReportType,
  ReportTypeId,
  IReportObjectModel,
  IConsultantEditInstruction,
  ISectionBuilderParams,
} from "../types/rpe.types";

import { BrandEngine, WhiteLabelEngine, QrEngine } from "../modules/BrandAndThemeModules";
import { SectionBuilder, TableBuilder, SummaryBuilder, TranslationLayer } from "../modules/ContentAndFormattingModules";
import { DiagramEngine, DigitalShareEngine } from "../modules/ExportAndDiagramModules";

import { reportSnapshotEngine } from "../snapshot/ReportSnapshotEngine";
import { brandProfileManager } from "../brand/BrandProfileManager";
import { reportCompositionEngine } from "../composition/ReportCompositionEngine";
import { ConsultantEditingLayer } from "../editing/ConsultantEditingLayer";

export class ReportPreparationEngine {
  private static instance: ReportPreparationEngine;

  private constructor() {}

  public static getInstance(): ReportPreparationEngine {
    if (!ReportPreparationEngine.instance) {
      ReportPreparationEngine.instance = new ReportPreparationEngine();
    }
    return ReportPreparationEngine.instance;
  }

  /**
   * Enterprise Method: Freezes Snapshot, Composes ROM via RCE, applies Consultant Edits, and returns ROM
   */
  public composeRom(
    consultation: IIntegratedConsultationPackage,
    reportTypeId: ReportTypeId = 'CONSULTANT_REPORT',
    deliveryOptions?: Partial<IDeliveryOptions>,
    whiteLabelConfig?: Partial<IWhiteLabelConfig>,
    editInstructions?: IConsultantEditInstruction[],
    moduleInsights?: ISectionBuilderParams["moduleInsights"]
  ): { rom: IReportObjectModel; snapshotId: string } {
    // 1. Freeze Snapshot (Correction 7)
    const snapshot = reportSnapshotEngine.createSnapshot(consultation);

    // 2. Resolve Brand Profile (Correction 8)
    const brandProfile = brandProfileManager.createProfile('Active Session Brand', 'CONSULTANT_CURRENT', whiteLabelConfig);

    // 3. Resolve Delivery Options
    const resolvedDeliveryOptions: IDeliveryOptions = {
      deliveryStrategy: deliveryOptions?.deliveryStrategy || 'INTEGRATED_REPORT',
      targetLanguage: deliveryOptions?.targetLanguage || 'ENGLISH',
      consultantCustomNotes: deliveryOptions?.consultantCustomNotes || '',
      clientGreetingName: deliveryOptions?.clientGreetingName || '',
      customReportTitle: deliveryOptions?.customReportTitle,
      includeProductSpecs: deliveryOptions?.includeProductSpecs ?? true,
      include3DDiagrams: deliveryOptions?.include3DDiagrams ?? true,
      includeAlternativePathsInHomeowner: deliveryOptions?.includeAlternativePathsInHomeowner ?? false,
      separateDomainSelection: deliveryOptions?.separateDomainSelection,
      accessTier: deliveryOptions?.accessTier,
    };

    // 4. Compose ROM via RCE (Correction 2 & 3)
    let rom = reportCompositionEngine.composeReport(
      snapshot.frozenConsultationPackage,
      reportTypeId,
      resolvedDeliveryOptions,
      brandProfile.whiteLabelConfig,
      snapshot.snapshotId,
      brandProfile.profileId,
      undefined,
      moduleInsights
    );

    // 5. Apply Consultant Editing Layer if present (Correction 5)
    if (editInstructions && editInstructions.length > 0) {
      rom = ConsultantEditingLayer.applyEditInstructions(rom, editInstructions);
    }

    return { rom, snapshotId: snapshot.snapshotId };
  }

  /**
   * Transforms an immutable IIntegratedConsultationPackage into a complete IReportPackage
   * STRICT DIRECTIVE: Never modifies findings, remedies, confidences, conflicts, or priorities.
   */
  public generateReportPackage(
    consultation: IIntegratedConsultationPackage,
    deliveryOptions?: Partial<IDeliveryOptions>,
    whiteLabelConfig?: Partial<IWhiteLabelConfig>
  ): IReportPackage {
    const timestamp = new Date().toISOString();
    const packageId = `RPE-PKG-${Date.now().toString(36).toUpperCase()}`;

    // 1. Resolve Delivery Options & Brand Configuration
    const resolvedDeliveryOptions: IDeliveryOptions = {
      deliveryStrategy: deliveryOptions?.deliveryStrategy || 'INTEGRATED_REPORT',
      targetLanguage: deliveryOptions?.targetLanguage || 'ENGLISH',
      consultantCustomNotes: deliveryOptions?.consultantCustomNotes || '',
      clientGreetingName: deliveryOptions?.clientGreetingName || '',
      customReportTitle: deliveryOptions?.customReportTitle || 'Spatial Harmonization & Vastu Report',
      includeProductSpecs: deliveryOptions?.includeProductSpecs ?? true,
      include3DDiagrams: deliveryOptions?.include3DDiagrams ?? true,
      includeAlternativePathsInHomeowner: deliveryOptions?.includeAlternativePathsInHomeowner ?? false,
      separateDomainSelection: deliveryOptions?.separateDomainSelection
    };

    const resolvedBrand = BrandEngine.resolveBrandConfig(whiteLabelConfig);

    // 2. Build 3 Primary Report Versions
    const consultantReport = this.buildSingleReportDocument(
      consultation,
      'CONSULTANT_REPORT',
      resolvedDeliveryOptions,
      resolvedBrand
    );

    const homeownerReport = this.buildSingleReportDocument(
      consultation,
      'HOMEOWNER_REPORT',
      resolvedDeliveryOptions,
      resolvedBrand
    );

    const visitorReport = this.buildSingleReportDocument(
      consultation,
      'VISITOR_REPORT',
      resolvedDeliveryOptions,
      resolvedBrand
    );

    // 3. Generate QR Code Payload & Digital Share Tokens
    const qrData = QrEngine.generateQrPayload(packageId, resolvedBrand);
    const shareToken = DigitalShareEngine.generateShareToken(packageId);

    // 4. Assemble Final Output Contract: IReportPackage
    const reportPackage: IReportPackage = {
      packageId,
      consultationPackageId: consultation.packageId,
      generatedTimestamp: timestamp,
      rpeVersion: '2.0.0-PROD',

      consultantReport,
      homeownerReport,
      visitorReport,

      deliveryMetadata: {
        strategy: resolvedDeliveryOptions.deliveryStrategy,
        language: resolvedDeliveryOptions.targetLanguage,
        totalSectionsGenerated: consultantReport.sections.length,
        isLockedForClient: consultation.consultantDecisionLayer.isLockedForClient
      },

      brandMetadata: {
        whiteLabelConfig: resolvedBrand,
        activeThemeName: resolvedBrand.companyName
      },

      exportMetadata: {
        availableFormats: ['PDF', 'DOCX', 'HTML', 'PRINT', 'DIGITAL_SHARE'],
        digitalShareToken: shareToken,
        qrCodePayload: qrData.payload,
        pdfPageEstimate: Math.ceil(consultantReport.sections.length * 1.5)
      }
    };

    return reportPackage;
  }

  private buildSingleReportDocument(
    consultation: IIntegratedConsultationPackage,
    reportType: ReportType,
    deliveryOptions: IDeliveryOptions,
    brandConfig: IWhiteLabelConfig
  ): IReportDocument {
    const documentId = `DOC-${reportType}-${Date.now().toString(36).toUpperCase()}`;
    const rawTitle = deliveryOptions.customReportTitle || 'Spatial Harmonization Report';
    const title = TranslationLayer.translateText(rawTitle, deliveryOptions.targetLanguage);

    const subtitleMap: Record<string, string> = {
      'CONSULTANT_REPORT': 'Comprehensive Professional Audit & Technical Evidence Ledger',
      'HOMEOWNER_REPORT': 'Personalized Spatial Alignment & Remedial Execution Guide',
      'VISITOR_REPORT': 'Freemium Spatial Energetic Preview & Summary'
    };

    // Build components
    const rawSections = SectionBuilder.buildSections(consultation, reportType, deliveryOptions);
    const tables = TableBuilder.buildTables(consultation, reportType);
    const diagrams = DiagramEngine.buildDiagrams(consultation);
    const summaries = SummaryBuilder.buildSummaries(consultation, reportType);

    const document: IReportDocument = {
      documentId,
      reportType,
      title,
      subtitle: subtitleMap[reportType] || 'Customized Spatial Consultation Report',
      targetAudience: reportType,
      language: deliveryOptions.targetLanguage,
      createdAt: new Date().toISOString(),
      sections: rawSections,
      tables,
      diagrams,
      summaries
    };

    // Apply White Labeling
    return WhiteLabelEngine.applyWhiteLabel(document, brandConfig);
  }
}

export const reportPreparationEngine = ReportPreparationEngine.getInstance();
