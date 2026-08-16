// ============================================================================
// URJAFLUX AI OS - REPORT SECTION REGISTRY & UNLIMITED REPORT TYPES
// Corrections 1 & 4: Registered Pluggable Sections & Dynamic Report Definitions
// ============================================================================

import { 
  ISectionDefinition, 
  IReportTypeDefinition, 
  ReportTypeId, 
  IRomSection, 
  ISectionBuilderParams 
} from "../types/rpe.types";
import { ReportObjectModelFactory } from "../rom/ReportObjectModel";

export class ReportSectionRegistry {
  private static instance: ReportSectionRegistry;
  private sectionMap: Map<string, ISectionDefinition> = new Map();
  private reportTypeMap: Map<string, IReportTypeDefinition> = new Map();

  private constructor() {
    this.registerBuiltInSections();
    this.registerBuiltInReportTypes();
  }

  public static getInstance(): ReportSectionRegistry {
    if (!ReportSectionRegistry.instance) {
      ReportSectionRegistry.instance = new ReportSectionRegistry();
    }
    return ReportSectionRegistry.instance;
  }

  public registerSection(definition: ISectionDefinition): void {
    this.sectionMap.set(definition.sectionCode, definition);
  }

  public getSection(sectionCode: string): ISectionDefinition | undefined {
    return this.sectionMap.get(sectionCode);
  }

  public getAllRegisteredSections(): ISectionDefinition[] {
    return Array.from(this.sectionMap.values());
  }

  public registerReportType(definition: IReportTypeDefinition): void {
    this.reportTypeMap.set(definition.typeId, definition);
  }

  public getReportType(typeId: ReportTypeId): IReportTypeDefinition | undefined {
    return this.reportTypeMap.get(typeId);
  }

  public getAllReportTypes(): IReportTypeDefinition[] {
    return Array.from(this.reportTypeMap.values());
  }

  private registerBuiltInSections(): void {
    // 1. Executive Summary
    this.registerSection({
      sectionCode: 'SEC_EXEC_SUMMARY',
      displayName: 'Executive Consultation Summary',
      description: 'High level greeting, consultation scope, and energy score overview',
      defaultOrder: 1,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const text = params.deliveryOptions.clientGreetingName 
          ? `Respected ${params.deliveryOptions.clientGreetingName}, welcome to your customized spatial consultation.`
          : 'Welcome to your spatial consultation.';
        const block = ReportObjectModelFactory.createBlock('CALLOUT', 'Overview', [
          ReportObjectModelFactory.createTextElement(text)
        ]);
        const component = ReportObjectModelFactory.createComponent('Executive Overview Component', [block]);
        return {
          sectionId: `SEC_EXEC_${Date.now()}`,
          sectionCode: 'SEC_EXEC_SUMMARY',
          title: 'Executive Consultation Summary',
          order: 1,
          components: [component],
          isVisible: true
        };
      }
    });

    // 2. Client Profile
    this.registerSection({
      sectionCode: 'SEC_CLIENT_PROFILE',
      displayName: 'Client & Astrological Profile',
      description: 'Client details, Kundli, Numerology grid, and birth data',
      defaultOrder: 2,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const block = ReportObjectModelFactory.createBlock('METRIC', 'Client Energetic Matrix', [
          ReportObjectModelFactory.createTextElement(`Primary Domain Focus: ${params.consultation.crossDomainSummary.involvedDomains.join(', ')}`)
        ]);
        return {
          sectionId: `SEC_CLIENT_${Date.now()}`,
          sectionCode: 'SEC_CLIENT_PROFILE',
          title: 'Client & Energetic Profile',
          order: 2,
          components: [ReportObjectModelFactory.createComponent('Client Profile Component', [block])],
          isVisible: true
        };
      }
    });

    // 3. Property Overview & Blueprint
    this.registerSection({
      sectionCode: 'SEC_PROPERTY_BLUEPRINT',
      displayName: 'Property Geometry & Architectural Blueprint',
      description: 'Property boundaries, north angle orientation, and CAD overlay',
      defaultOrder: 3,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const block = ReportObjectModelFactory.createBlock('TEXT', 'Property CAD Alignment', [
          ReportObjectModelFactory.createTextElement('Blueprint verified with accurate North orientation and closed room polygons.')
        ]);
        return {
          sectionId: `SEC_PROP_${Date.now()}`,
          sectionCode: 'SEC_PROPERTY_BLUEPRINT',
          title: 'Property & Architectural Blueprint Analysis',
          order: 3,
          components: [ReportObjectModelFactory.createComponent('Blueprint Component', [block])],
          isVisible: true
        };
      }
    });

    // 4. Overlay Chakra
    this.registerSection({
      sectionCode: 'SEC_OVERLAY_CHAKRA',
      displayName: '16-Zone Vastu Chakra Overlay',
      description: '16 Devta and direction zones mapped on layout',
      defaultOrder: 4,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const block = ReportObjectModelFactory.createBlock('DIAGRAM', '16-Zone Wheel Alignment', [
          ReportObjectModelFactory.createTextElement('16-Zone Vastu Chakra accurately aligned with property centroid.')
        ]);
        return {
          sectionId: `SEC_CHAKRA_${Date.now()}`,
          sectionCode: 'SEC_OVERLAY_CHAKRA',
          title: '16-Zone Spatial Vastu Overlay',
          order: 4,
          components: [ReportObjectModelFactory.createComponent('Chakra Overlay Component', [block])],
          isVisible: true
        };
      }
    });

    // 5. Positive Findings
    this.registerSection({
      sectionCode: 'SEC_POSITIVE_FINDINGS',
      displayName: 'Harmonious Zones & Positive Energy Features',
      description: 'Zones aligned with natural and energetic principles',
      defaultOrder: 5,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const positiveFindings = params.consultation.integratedFindings.filter(f => f.severity === 'MINOR' || f.severity === 'MODERATE');
        const contentText = positiveFindings.length > 0 
          ? positiveFindings.map(f => `${f.spatialZone}: ${f.title}`).join(' | ')
          : 'High energetic alignment observed in core zone centroids.';
        const block = ReportObjectModelFactory.createBlock('CALLOUT', 'Positive Energy Pillars', [
          ReportObjectModelFactory.createTextElement(contentText)
        ]);
        return {
          sectionId: `SEC_POS_${Date.now()}`,
          sectionCode: 'SEC_POSITIVE_FINDINGS',
          title: 'Harmonious Zones & Strengths',
          order: 5,
          components: [ReportObjectModelFactory.createComponent('Positive Findings Component', [block])],
          isVisible: true
        };
      }
    });

    // 6. Doshas & Severe Issues
    this.registerSection({
      sectionCode: 'SEC_DOSHAS',
      displayName: 'Spatial Doshas & Energetic Vulnerabilities',
      description: 'Critical & High severity imbalances detected',
      defaultOrder: 6,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const severeFindings = params.consultation.integratedFindings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
        const contentText = severeFindings.length > 0 
          ? severeFindings.map(f => `[${f.domain}] Zone ${f.spatialZone}: ${f.title} - ${f.description}`).join(' \n ')
          : 'No critical structural doshas detected.';
        const block = ReportObjectModelFactory.createBlock('TEXT', 'Critical Imbalances Identified', [
          ReportObjectModelFactory.createTextElement(contentText)
        ]);
        return {
          sectionId: `SEC_DOSHA_${Date.now()}`,
          sectionCode: 'SEC_DOSHAS',
          title: 'Spatial Doshas & Energetic Clashes',
          order: 6,
          components: [ReportObjectModelFactory.createComponent('Dosha Analysis Component', [block])],
          isVisible: true
        };
      }
    });

    // 7. Non-Structural Remedies
    this.registerSection({
      sectionCode: 'SEC_REMEDIES',
      displayName: 'Zero-Demolition Remedial Roadmap',
      description: 'Non-structural remedies prioritized by execution phase',
      defaultOrder: 7,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const remedyRows = params.consultation.bestRemedyCandidates.map(r => ({
          domain: r.targetDomain,
          zone: r.targetZoneOrDirection,
          action: r.primaryRemedyText,
          priority: r.priority
        }));
        const block = ReportObjectModelFactory.createBlock('TABLE', 'Recommended Remedial Actions', [
          ReportObjectModelFactory.createTableElement('Best Non-Structural Remedies', [
            { key: 'domain', label: 'Domain' },
            { key: 'zone', label: 'Zone' },
            { key: 'action', label: 'Recommended Action' },
            { key: 'priority', label: 'Priority' }
          ], remedyRows)
        ]);
        return {
          sectionId: `SEC_REM_${Date.now()}`,
          sectionCode: 'SEC_REMEDIES',
          title: 'Zero-Demolition Remedial Roadmap',
          order: 7,
          components: [ReportObjectModelFactory.createComponent('Remedy Component', [block])],
          isVisible: true
        };
      }
    });

    // 8. Products & Materials
    this.registerSection({
      sectionCode: 'SEC_PRODUCTS',
      displayName: 'Product & Material Specifications',
      description: 'Exact materials, dimensions, and installation guides',
      defaultOrder: 8,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const prodItems = params.consultation.productPreparationPackage.items.map(p => ({
          category: p.requiredProductCategory,
          materials: p.materialList.join(', '),
          installation: p.installationType
        }));
        const block = ReportObjectModelFactory.createBlock('TABLE', 'Required Harmonization Materials', [
          ReportObjectModelFactory.createTableElement('Product Specifications', [
            { key: 'category', label: 'Category' },
            { key: 'materials', label: 'Materials' },
            { key: 'installation', label: 'Installation Type' }
          ], prodItems)
        ]);
        return {
          sectionId: `SEC_PROD_${Date.now()}`,
          sectionCode: 'SEC_PRODUCTS',
          title: 'Product & Material Specifications',
          order: 8,
          components: [ReportObjectModelFactory.createComponent('Products Component', [block])],
          isVisible: true
        };
      }
    });

    // 9. Technical Evidence & Rule Ledger (Consultant Only)
    this.registerSection({
      sectionCode: 'SEC_EVIDENCE_LEDGER',
      displayName: 'Technical Evidence & Rule Traceability Ledger',
      description: 'Rule IDs, confidence vectors, OCR citations, and conflict logs',
      defaultOrder: 9,
      isConsultantOnly: true,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const block = ReportObjectModelFactory.createBlock('TEXT', 'Audit Trail', [
          ReportObjectModelFactory.createTextElement(`Verified against ${params.consultation.executionMetadata.totalRulesProcessed} rules with total pipeline duration ${params.consultation.executionMetadata.pipelineDurationMs}ms.`)
        ]);
        return {
          sectionId: `SEC_EVID_${Date.now()}`,
          sectionCode: 'SEC_EVIDENCE_LEDGER',
          title: 'Technical Evidence & Audit Ledger',
          order: 9,
          isConsultantOnly: true,
          components: [ReportObjectModelFactory.createComponent('Evidence Ledger Component', [block])],
          isVisible: true
        };
      }
    });

    // Integrated Score Dashboard (all tiers — free shows score for interest)
    this.registerSection({
      sectionCode: "SEC_INTEGRATED_SCORE",
      displayName: "Integrated Harmony Score",
      description: "Cross-module energetic score for Vastu, Lal Kitab, and Numerology",
      defaultOrder: 1,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const score = params.moduleInsights?.integratedScore ?? 72;
        const note = params.moduleInsights?.dataCompletenessNote || "";
        const block = ReportObjectModelFactory.createBlock("METRIC", "Integrated Score", [
          ReportObjectModelFactory.createTextElement(
            `Overall Integrated Harmony Score: ${score}/100${note ? ` — ${note}` : ""}`
          ),
        ]);
        return {
          sectionId: `SEC_SCORE_${Date.now()}`,
          sectionCode: "SEC_INTEGRATED_SCORE",
          title: "Integrated Harmony Score",
          order: 1,
          components: [ReportObjectModelFactory.createComponent("Score Component", [block])],
          isVisible: true,
        };
      },
    });

    // Lal Kitab Module Section
    this.registerSection({
      sectionCode: "SEC_LAL_KITAB_MODULE",
      displayName: "Lal Kitab Analysis",
      description: "Planetary-spatial Lal Kitab findings and upay",
      defaultOrder: 11,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const locked = params.moduleInsights?.lockedModules?.includes("LAL_KITAB");
        const lkFindings = params.consultation.integratedFindings.filter(
          (f) => f.domain === "LAL_KITAB"
        );
        const body = locked
          ? `${params.moduleInsights?.upsellMessage || "Upgrade to unlock full Lal Kitab report."}`
          : lkFindings.map((f) => `${f.title}: ${f.description}`).join("\n") ||
            params.moduleInsights?.lalKitabSummary ||
            "Lal Kitab analysis pending birth data.";
        const block = ReportObjectModelFactory.createBlock("TEXT", "Lal Kitab", [
          ReportObjectModelFactory.createTextElement(body),
        ]);
        return {
          sectionId: `SEC_LK_${Date.now()}`,
          sectionCode: "SEC_LAL_KITAB_MODULE",
          title: locked ? "Lal Kitab Analysis (Locked)" : "Lal Kitab Analysis",
          order: 11,
          isLocked: locked,
          components: [ReportObjectModelFactory.createComponent("Lal Kitab Component", [block])],
          isVisible: true,
        };
      },
    });

    // Numerology Module Section
    this.registerSection({
      sectionCode: "SEC_NUMEROLOGY_MODULE",
      displayName: "Numerology Analysis",
      description: "Name and DOB numerology insights",
      defaultOrder: 12,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const locked = params.moduleInsights?.lockedModules?.includes("NUMEROLOGY");
        const body = locked
          ? `${params.moduleInsights?.upsellMessage || "Upgrade to unlock full Numerology report."}`
          : params.moduleInsights?.numerologySummary || "Numerology analysis pending client name.";
        const block = ReportObjectModelFactory.createBlock("TEXT", "Numerology", [
          ReportObjectModelFactory.createTextElement(body),
        ]);
        return {
          sectionId: `SEC_NUM_${Date.now()}`,
          sectionCode: "SEC_NUMEROLOGY_MODULE",
          title: locked ? "Numerology Analysis (Locked)" : "Numerology Analysis",
          order: 12,
          isLocked: locked,
          components: [ReportObjectModelFactory.createComponent("Numerology Component", [block])],
          isVisible: true,
        };
      },
    });

    // 10. Verification QR & Legal Disclaimer
    this.registerSection({
      sectionCode: 'SEC_DISCLAIMER_QR',
      displayName: 'Verification QR & Legal Disclaimer',
      description: 'Digital signature, QR verification, and legal terms',
      defaultOrder: 10,
      buildSection: (params: ISectionBuilderParams): IRomSection => {
        const block = ReportObjectModelFactory.createBlock('PROMPT_CARD', 'Verification & Compliance', [
          ReportObjectModelFactory.createTextElement('URJAFLUX Verified Report. Do not substitute structural architectural permits.')
        ]);
        return {
          sectionId: `SEC_DISC_${Date.now()}`,
          sectionCode: 'SEC_DISCLAIMER_QR',
          title: 'Verification & Disclaimer',
          order: 10,
          components: [ReportObjectModelFactory.createComponent('Disclaimer Component', [block])],
          isVisible: true
        };
      }
    });
  }

  private registerBuiltInReportTypes(): void {
    // 1. Standard Consultant Report
    this.registerReportType({
      typeId: 'CONSULTANT_REPORT',
      displayName: 'Master Consultant Report',
      description: 'Full audit ledger including rules, evidence, overrides, and raw IDs',
      targetAudience: 'Consultants & Technical Auditors',
      allowedDomains: ['ALL'],
      requiredSectionCodes: ['SEC_EXEC_SUMMARY', 'SEC_CLIENT_PROFILE', 'SEC_PROPERTY_BLUEPRINT', 'SEC_OVERLAY_CHAKRA', 'SEC_DOSHAS', 'SEC_REMEDIES', 'SEC_PRODUCTS', 'SEC_EVIDENCE_LEDGER', 'SEC_DISCLAIMER_QR'],
      optionalSectionCodes: ['SEC_POSITIVE_FINDINGS'],
      defaultLayoutColumns: 1,
      defaultExportFormats: ['PDF', 'DOCX', 'HTML', 'PRINT']
    });

    // 2. Standard Homeowner Report
    this.registerReportType({
      typeId: 'HOMEOWNER_REPORT',
      displayName: 'Homeowner Harmonization Guide',
      description: 'Clean, elegant, positive, consultant-approved layout for home clients',
      targetAudience: 'Homeowners & Residents',
      allowedDomains: ['ALL'],
      requiredSectionCodes: ['SEC_EXEC_SUMMARY', 'SEC_PROPERTY_BLUEPRINT', 'SEC_OVERLAY_CHAKRA', 'SEC_POSITIVE_FINDINGS', 'SEC_DOSHAS', 'SEC_REMEDIES', 'SEC_PRODUCTS', 'SEC_DISCLAIMER_QR'],
      optionalSectionCodes: [],
      defaultLayoutColumns: 2,
      defaultExportFormats: ['PDF', 'PRINT', 'DIGITAL_SHARE']
    });

    // 3. Standard Visitor / Freemium Report
    this.registerReportType({
      typeId: 'VISITOR_REPORT',
      displayName: 'Visitor Teaser Report',
      description: 'Freemium overview: integrated score, 2 doshas, 1 remedy, Vastu only',
      targetAudience: 'Prospects & Web Visitors',
      allowedDomains: ['VASTU'],
      requiredSectionCodes: ['SEC_INTEGRATED_SCORE', 'SEC_EXEC_SUMMARY', 'SEC_OVERLAY_CHAKRA', 'SEC_DOSHAS', 'SEC_REMEDIES', 'SEC_LAL_KITAB_MODULE', 'SEC_NUMEROLOGY_MODULE', 'SEC_DISCLAIMER_QR'],
      optionalSectionCodes: [],
      defaultLayoutColumns: 1,
      defaultExportFormats: ['DIGITAL_SHARE', 'PDF']
    });

    // 3b. Comprehensive Integrated Report (Vastu + Lal Kitab + Numerology)
    this.registerReportType({
      typeId: 'COMPREHENSIVE_INTEGRATED',
      displayName: 'Integrated Intelligence Report',
      description: 'Unified Vastu, Lal Kitab, and Numerology consultation report for client delivery',
      targetAudience: 'Consultants, Paid Clients, End Clients',
      allowedDomains: ['ALL'],
      requiredSectionCodes: [
        'SEC_INTEGRATED_SCORE',
        'SEC_EXEC_SUMMARY',
        'SEC_CLIENT_PROFILE',
        'SEC_PROPERTY_BLUEPRINT',
        'SEC_OVERLAY_CHAKRA',
        'SEC_DOSHAS',
        'SEC_REMEDIES',
        'SEC_LAL_KITAB_MODULE',
        'SEC_NUMEROLOGY_MODULE',
        'SEC_PRODUCTS',
        'SEC_DISCLAIMER_QR',
      ],
      optionalSectionCodes: ['SEC_POSITIVE_FINDINGS', 'SEC_EVIDENCE_LEDGER'],
      defaultLayoutColumns: 1,
      defaultExportFormats: ['PDF', 'DOCX', 'DIGITAL_SHARE', 'HTML'],
    });

    // 4. Domain Specific: Vastu Only
    this.registerReportType({
      typeId: 'VASTU_REPORT',
      displayName: '16-Zone Vastu Shastra Report',
      description: 'Exclusively Vastu findings, 16-zone chakra overlays, and directional remedies',
      targetAudience: 'Vastu Clients & Practitioners',
      allowedDomains: ['VASTU'],
      requiredSectionCodes: ['SEC_EXEC_SUMMARY', 'SEC_PROPERTY_BLUEPRINT', 'SEC_OVERLAY_CHAKRA', 'SEC_DOSHAS', 'SEC_REMEDIES', 'SEC_DISCLAIMER_QR'],
      optionalSectionCodes: ['SEC_PRODUCTS'],
      defaultLayoutColumns: 2,
      defaultExportFormats: ['PDF', 'DOCX', 'DIGITAL_SHARE']
    });

    // 5. Domain Specific: Lal Kitab Only
    this.registerReportType({
      typeId: 'LAL_KITAB_REPORT',
      displayName: 'Lal Kitab Remedial Horoscope & Spatial Alignment',
      description: 'Horoscope planetary placement mapped to spatial zones and zero-cost remedies',
      targetAudience: 'Lal Kitab Practitioners',
      allowedDomains: ['LAL_KITAB'],
      requiredSectionCodes: ['SEC_EXEC_SUMMARY', 'SEC_CLIENT_PROFILE', 'SEC_DOSHAS', 'SEC_REMEDIES', 'SEC_DISCLAIMER_QR'],
      optionalSectionCodes: [],
      defaultLayoutColumns: 1,
      defaultExportFormats: ['PDF', 'PRINT']
    });

    // 6. Domain Specific: Numerology Only
    this.registerReportType({
      typeId: 'NUMEROLOGY_REPORT',
      displayName: 'Spatial Numerology Grid & Name Correction Report',
      description: 'Lo Shu grid, house number vibrations, and elemental number remedies',
      targetAudience: 'Numerology Clients',
      allowedDomains: ['NUMEROLOGY'],
      requiredSectionCodes: ['SEC_EXEC_SUMMARY', 'SEC_CLIENT_PROFILE', 'SEC_REMEDIES', 'SEC_DISCLAIMER_QR'],
      optionalSectionCodes: [],
      defaultLayoutColumns: 1,
      defaultExportFormats: ['PDF', 'DIGITAL_SHARE']
    });

    // 7. Executive Summary
    this.registerReportType({
      typeId: 'EXECUTIVE_SUMMARY',
      displayName: 'Executive 2-Page Snapshot',
      description: 'Ultra-concise overview for busy executives and decision makers',
      targetAudience: 'Executives & Investors',
      allowedDomains: ['ALL'],
      requiredSectionCodes: ['SEC_EXEC_SUMMARY', 'SEC_REMEDIES', 'SEC_DISCLAIMER_QR'],
      optionalSectionCodes: [],
      defaultLayoutColumns: 2,
      defaultExportFormats: ['PDF', 'PRESENTATION']
    });

    // 8. Architect / Builder Blueprint
    this.registerReportType({
      typeId: 'ARCHITECT_REPORT',
      displayName: 'Architectural & Interior Technical Spec',
      description: 'Zone coordinates, material lists, and zero-demolition structural guidelines',
      targetAudience: 'Architects, Builders & Interior Designers',
      allowedDomains: ['ALL'],
      requiredSectionCodes: ['SEC_PROPERTY_BLUEPRINT', 'SEC_OVERLAY_CHAKRA', 'SEC_DOSHAS', 'SEC_REMEDIES', 'SEC_PRODUCTS'],
      optionalSectionCodes: [],
      defaultLayoutColumns: 1,
      defaultExportFormats: ['PDF', 'DOCX']
    });
  }
}

export const reportSectionRegistry = ReportSectionRegistry.getInstance();
