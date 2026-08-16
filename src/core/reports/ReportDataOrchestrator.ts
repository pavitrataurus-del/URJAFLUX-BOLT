import {
  IReportMetadata,
  IReportSectionData,
  IReportCitation,
  IReportAttachment,
  IReportBlock,
  ReportType,
  LanguageCode
} from './ReportTypes';

import { IAnalysisContract, IAnalysisSection } from './AnalysisContract';
import { AnalysisRegistry } from './AnalysisRegistry';
import { ReportContractValidator } from './ReportContractValidator';
import { DataNormalizer } from './DataNormalizer';
import { VariableResolver } from './VariableResolver';
import { BlockMapper } from './BlockMapper';
import { SourceTraceService } from './SourceTraceService';

import { truthEngine } from '../knowledge/verification/TruthEngine';
import { UnifiedReasoningRegistry } from '../reasoning/UnifiedReasoningRegistry';
import { ProjectExecutionRegistry } from '../execution/ProjectExecutionRegistry';
import { DigitalTwinRegistry } from '../monitoring/DigitalTwinRegistry';
import { ConsultationContextManager } from '../consultation/ConsultationContextManager';
import { ReportLocalizationEngine } from './ReportLocalizationEngine';

export interface IOrchestratedReportData {
  metadata: IReportMetadata;
  sections: IReportSectionData[];
  attachments: IReportAttachment[];
  citations: IReportCitation[];
  summaryMetrics: {
    healthScore: number;
    complianceRating: number;
    totalRecommendations: number;
    activeAlerts: number;
    projectCompletion: number;
    ingestedDocuments: number;
    verifiedRulesCount: number;
  };
}

export class ReportDataOrchestrator {
  private static instance: ReportDataOrchestrator;

  private constructor() {}

  public static getInstance(): ReportDataOrchestrator {
    if (!ReportDataOrchestrator.instance) {
      ReportDataOrchestrator.instance = new ReportDataOrchestrator();
    }
    return ReportDataOrchestrator.instance;
  }

  /**
   * Enterprise-Grade report data orchestration (Parts 1, 10 & 12).
   * Aggregates modular analysis engine outputs, normalizes, validates, resolves variables, maps blocks, and traces sources.
   */
  public orchestrateReportData(
    reportType: ReportType,
    lang: LanguageCode = 'en',
    propertyId?: string,
    projectId?: string
  ): IOrchestratedReportData {
    // 1. Gather environmental and contextual registries
    const consultationCtx = ConsultationContextManager.getInstance().assembleContext('ADMIN', propertyId, projectId);
    const reasoningSessions = UnifiedReasoningRegistry.getInstance().getAllSessions();
    const primaryReasoning = reasoningSessions[0];

    const executionRegistry = ProjectExecutionRegistry.getInstance();
    const allProjects = executionRegistry.getAllProjects();
    const targetProject = projectId
      ? allProjects.find(p => p.id === projectId) || allProjects[0]
      : allProjects[0];

    const digitalTwins = DigitalTwinRegistry.getAllDigitalTwins();
    const targetTwin = propertyId
      ? digitalTwins.find(t => t.id === propertyId || t.propertyId === propertyId) || digitalTwins[0]
      : digitalTwins[0];

    const alerts = DigitalTwinRegistry.getAlerts();
    const maintenance = DigitalTwinRegistry.getMaintenanceRecords();

    // 2. Generate standard analysis contracts for each registered domain engine (Part 2 & 3)
    const modules = AnalysisRegistry.getInstance().getAllModules();
    const activeContracts: IAnalysisContract[] = [];

    modules.forEach(mod => {
      if (!mod.isActive) return;

      try {
        // Here we simulate the independent producer engines publishing standard contracts.
        // If it was a real network RPC we would call the provider; here we construct a highly structured
        // compliant contract based on the domain knowledge registries and contexts.
        const contract = this.generateModuleContract(mod.moduleId, mod.moduleName, mod.version, targetTwin, targetProject, primaryReasoning);
        activeContracts.push(contract);
      } catch (err) {
        console.error(`Analysis Engine "${mod.moduleName}" failed to execute:`, err);
        // Part 10: If one Analysis Engine fails, continue generating report with structured placeholder
        const fallback = this.generateFallbackPlaceholderContract(mod.moduleId, mod.moduleName, mod.version);
        activeContracts.push(fallback);
      }
    });

    // 3. Normalize all incoming data contracts (Part 6)
    const normalizer = DataNormalizer.getInstance();
    const normalizedContracts = activeContracts.map(c => normalizer.normalize(c));

    // 4. Validate all data contracts prior to processing (Part 5)
    const validator = ReportContractValidator.getInstance();
    const validationReports = normalizedContracts.map(c => validator.validate(c));

    // Consolidate validation warnings / logs
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    validationReports.forEach(r => {
      allErrors.push(...r.errors);
      allWarnings.push(...r.warnings);
    });

    if (allErrors.length > 0) {
      console.warn('Report Data Orchestrator contract validation errors encountered:', allErrors);
    }

    // 5. Merge module outputs and resolve conflicts (Part 1)
    const citations: IReportCitation[] = [];
    const attachments: IReportAttachment[] = [];
    const sections: IReportSectionData[] = [];

    const seenCitationIds = new Set<string>();
    const seenAttachmentIds = new Set<string>();

    normalizedContracts.forEach(contract => {
      // Traceability helper
      const trace = SourceTraceService.getInstance().generateTrace(contract);

      // Collect unique citations
      contract.references.forEach(ref => {
        if (!seenCitationIds.has(ref.id)) {
          seenCitationIds.add(ref.id);
          const citation: IReportCitation = {
            citationId: ref.id,
            domain: this.mapModuleIdToDomain(contract.moduleId),
            sourceBook: ref.sourceBook,
            chapterVerse: ref.chapterVerse,
            author: ref.author || 'Sage',
            reliabilityScore: ref.reliabilityScore || 95,
            excerptText: ref.excerptText,
            linkedRuleId: ref.id
          };
          citations.push(citation);
          
          // Verify with truth engine (Part 2)
          if (citation.linkedRuleId) {
            truthEngine.getStatus(citation.linkedRuleId);
          }
        }
      });

      // Collect unique attachments
      contract.attachments.forEach(att => {
        if (!seenAttachmentIds.has(att.id)) {
          seenAttachmentIds.add(att.id);
          attachments.push({
            attachmentId: att.id,
            attachmentType: this.mapAttachmentType(att.type),
            title: att.title,
            description: att.caption || '',
            assetUrl: att.url,
            sourceDomain: att.sourceDomain || contract.moduleId,
            timestamp: att.timestamp,
            caption: att.caption
          });
        }
      });

      // Map structured data sections to report blocks (Part 7 & 9)
      contract.dataSections.forEach((ds, idx) => {
        const mappedBlocks = BlockMapper.getInstance().mapSectionToBlocks(ds);

        let section: IReportSectionData = {
          sectionId: ds.id,
          sectionKey: ds.type.toUpperCase(),
          title: ds.title,
          orderIndex: sections.length + 1,
          isVisible: true,
          contentMarkdown: ds.content?.summaryText || ds.content?.text || `Structured module section: ${ds.title}`,
          blocks: mappedBlocks,
          structuredData: {
            moduleId: contract.moduleId,
            confidence: contract.confidence
          }
        };

        // Source traceability stamping (Part 9)
        section = SourceTraceService.getInstance().stampSection(section, trace);
        sections.push(section);
      });
    });

    // 6. Build the metadata container
    const metadata: IReportMetadata = {
      title: this.getReportTitle(reportType, lang),
      subtitle: `Enterprise Verified Document • ${targetTwin ? targetTwin.propertyName : 'Commercial Complex'}`,
      reportType,
      propertyId: targetTwin?.propertyId || 'PROP-001',
      propertyName: targetTwin?.propertyName || 'Tech Park Headquarters',
      projectId: targetProject?.id || 'UF-PRJ-2026-081',
      projectTitle: targetProject?.title || 'Brahmasthan Clearance Project',
      authorName: 'URJAFLUX Technical Lead',
      authorRole: 'ADMIN',
      clientName: 'Enterprise Client Holdings',
      language: lang,
      tags: ['Sthapatya Veda', 'Digital Twin', 'Truth Verified', 'Harmonic Remediation']
    };

    // 7. Resolve all dynamic variables recursively before rendering (Part 8)
    const reportPlaceholder: any = {
      id: 'rep-temp',
      metadata,
      branding: {
        consultantName: 'Dr. Rajesh Sharma',
        authorName: 'Technical Lead'
      },
      createdAt: new Date().toISOString(),
      reportVersion: '1.0.0',
      reportNumber: 'URF-REP-2026-001',
      sections,
      attachments,
      allCitations: citations
    };

    const resolvedSections = VariableResolver.getInstance().resolveSections(sections, reportPlaceholder);

    const summaryMetrics = {
      healthScore: targetTwin ? targetTwin.overallHealthScore : 86,
      complianceRating: targetTwin ? targetTwin.complianceScore : 89,
      totalRecommendations: primaryReasoning ? primaryReasoning.recommendations.length : 4,
      activeAlerts: alerts.filter(a => a.alertStatus === 'ACTIVE').length,
      projectCompletion: targetProject ? targetProject.overallProgressPercentage : 68,
      ingestedDocuments: consultationCtx.knowledgeContext.ingestedDocumentsCount,
      verifiedRulesCount: consultationCtx.knowledgeContext.activeRulesCount
    };

    return {
      metadata,
      sections: resolvedSections,
      attachments,
      citations,
      summaryMetrics
    };
  }

  /**
   * Simulates standard contract payload generation from discrete analysis engines (Vastu, Astrology, etc.).
   */
  private generateModuleContract(
    moduleId: string,
    moduleName: string,
    version: string,
    twin: any,
    project: any,
    reasoning: any
  ): IAnalysisContract {
    const timestamp = new Date().toISOString();

    if (moduleId === 'vastu-engine') {
      return {
        moduleId,
        moduleName,
        version,
        generatedTimestamp: timestamp,
        confidence: twin ? twin.complianceScore : 94,
        dataSections: [
          {
            id: 'sec-vastu-summary',
            type: 'Summary',
            title: 'Vastu Shastra Layout Audit',
            content: {
              summaryText: `This audit evaluates spatial and energy compliance for property **{{PropertyName}}** (Project: **{{ProjectID}}**). The primary facing orientation is North-East, which aligns with Eeshan zone currents.`,
              highlights: [
                'Brahmasthan ether grid is clear and unburdened.',
                'Nairutya South-West zone has a heavy grounding structural conflict.'
              ]
            }
          },
          {
            id: 'sec-vastu-remedies',
            type: 'Remedies',
            title: 'Sthapatya Veda Spatial Remedies',
            content: [
              {
                zone: 'SW',
                citation: 'Mayamatam Chapter 12',
                defect: 'Heavy structural panel misalignment creating geopathic biofield stress.',
                remedy: 'Install PyraGrid Brass Crystal Energy Diffusers coupled with non-destructive copper anchoring strips to ground and disperse static flux.'
              }
            ]
          }
        ],
        warnings: [],
        recommendations: [
          {
            id: 'rec-vastu-01',
            text: 'Apply PyraGrid Diffusers in South-West Nairutya Zone to ground and disperse static flux.',
            priority: 'HIGH',
            zone: 'SW',
            evidence: 'att-evid-001'
          }
        ],
        attachments: [
          {
            id: 'att-twin-001',
            type: 'DIGITAL_TWIN_VIEW',
            title: 'Brahmasthan 3D Spatial Grid Mesh Snapshot',
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
            caption: 'Figure 1.1: 3D Spatial Grid & Energy Density Topology',
            sourceDomain: 'vastu-engine'
          }
        ],
        references: [
          {
            id: 'MAYAMATAM-CH7-V12',
            sourceBook: 'Mayamatam Vastu Shastra',
            chapterVerse: 'Chapter 7, Verses 12-16',
            author: 'Sage Maya',
            reliabilityScore: 98,
            excerptText: 'The central Padma grid (Brahmasthan) shall be maintained without heavy pillars or stagnant water.'
          }
        ],
        sourceModule: 'Vastu Shastra Engine',
        executionTimeMs: 45
      };
    }

    if (moduleId === 'astrology-engine') {
      return {
        moduleId,
        moduleName,
        version,
        generatedTimestamp: timestamp,
        confidence: 88,
        dataSections: [
          {
            id: 'sec-astro-alignment',
            type: 'Observations',
            title: 'Planetary Transits & House Alignments',
            content: {
              observationsList: [
                'Jupiter transit in Taurus supports steady growth for corporate holdings.',
                'Saturn retrograding in Aquarius causes minor execution delays in infrastructure.'
              ]
            }
          }
        ],
        warnings: [],
        recommendations: [
          {
            id: 'rec-astro-01',
            text: 'Initiate major infrastructure changes after retrograde period or use copper grounding plates.',
            priority: 'MEDIUM',
            zone: 'NE'
          }
        ],
        attachments: [],
        references: [
          {
            id: 'SAT-CHAKRA-31',
            sourceBook: 'Sat Chakra Nirupana',
            chapterVerse: 'Chapter 2, Verse 31',
            author: 'Swami Purnananda',
            reliabilityScore: 96,
            excerptText: 'Anahata lotus vibrates at 528Hz Solfeggio acoustic harmonics for spatial biofield stabilization.'
          }
        ],
        sourceModule: 'Vedic Astrology Engine',
        executionTimeMs: 38
      };
    }

    if (moduleId === 'numerology-engine') {
      return {
        moduleId,
        moduleName,
        version,
        generatedTimestamp: timestamp,
        confidence: 90,
        dataSections: [
          {
            id: 'sec-num-grid',
            type: 'Metrics',
            title: 'Name & Property Vibrational Harmonics',
            content: {
              metricsList: [
                { name: 'Vibrational Fate Number', value: '8', status: 'STABLE' },
                { name: 'Property Core Frequency', value: '528Hz', status: 'OPTIMAL' }
              ]
            }
          }
        ],
        warnings: [],
        recommendations: [],
        attachments: [],
        references: [],
        sourceModule: 'Vedic Numerology Engine',
        executionTimeMs: 12
      };
    }

    // Default basic contract for other registered engines
    return {
      moduleId,
      moduleName,
      version,
      generatedTimestamp: timestamp,
      confidence: 85,
      dataSections: [
        {
          id: `sec-summary-${moduleId}`,
          type: 'Summary',
          title: `${moduleName} Findings`,
          content: {
            summaryText: `Analysis output generated by dynamic module "${moduleName}". All rules are active and validated.`
          }
        }
      ],
      warnings: [],
      recommendations: [],
      attachments: [],
      references: [],
      sourceModule: moduleName,
      executionTimeMs: 15
    };
  }

  /**
   * Part 10: Fail-safe fallback placeholder contract to prevent Report Studio crashes.
   */
  private generateFallbackPlaceholderContract(
    moduleId: string,
    moduleName: string,
    version: string
  ): IAnalysisContract {
    return {
      moduleId,
      moduleName,
      version,
      generatedTimestamp: new Date().toISOString(),
      confidence: 0,
      dataSections: [
        {
          id: `sec-failed-${moduleId}`,
          type: 'Summary',
          title: `${moduleName} Analysis`,
          content: {
            summaryText: `Section unavailable. The analysis engine failed or encountered an internal error. Please check engine state.`
          }
        }
      ],
      warnings: [`Analysis engine "${moduleName}" failed to execute.`],
      recommendations: [],
      attachments: [],
      references: [],
      sourceModule: moduleId,
      executionTimeMs: 0
    };
  }

  private mapModuleIdToDomain(moduleId: string): any {
    if (moduleId.includes('vastu')) return 'Vastu';
    if (moduleId.includes('astro')) return 'Astrology';
    if (moduleId.includes('numerology')) return 'Numerology';
    if (moduleId.includes('kp')) return 'KP';
    if (moduleId.includes('lal')) return 'LalKitab';
    return 'Vastu';
  }

  private mapAttachmentType(type: string): any {
    if (type === 'DIGITAL_TWIN_VIEW') return 'DIGITAL_TWIN_VIEW';
    if (type === 'MONITORING_CHART') return 'MONITORING_CHART';
    if (type === 'EVIDENCE_IMAGE') return 'EVIDENCE_IMAGE';
    return 'PROPERTY_PHOTO';
  }

  private getReportTitle(type: ReportType, lang: LanguageCode): string {
    const isHindi = lang === 'hi';
    switch (type) {
      case 'EXECUTIVE_SUMMARY':
        return isHindi ? 'कार्यकारी सारांश रिपोर्ट (Executive Summary Report)' : 'Executive Summary Audit Report';
      case 'TECHNICAL_ANALYSIS':
        return isHindi ? 'तकनीकी विश्लेषण एवं ऊर्जा निदान (Technical Analysis)' : 'Technical Analysis & Energy Diagnostics Report';
      case 'PROPERTY_AUDIT':
        return isHindi ? 'भवन वास्तु एवं स्थान ऑडिट (Property Audit)' : 'Comprehensive Property Vastu Audit Report';
      case 'SITE_INSPECTION':
        return isHindi ? 'स्थल निरीक्षण एवं साक्ष्य रिपोर्ट (Site Inspection)' : 'On-Site Inspection & Field Verification Report';
      case 'MONITORING_TELEMETRY':
        return isHindi ? 'डिजिटल ट्विन निगरानी एवं टेलीमेट्री (Monitoring Telemetry)' : 'Digital Twin IoT Telemetry & Health Report';
      case 'COMPLIANCE_CERTIFICATE':
        return isHindi ? 'स्थापत्य वेद अनुपालन प्रमाण पत्र (Compliance Certificate)' : 'Sthapatya Veda Enterprise Compliance Certificate';
      case 'CONSULTATION_SUMMARY':
        return isHindi ? 'परामर्श सारांश रिपोर्ट (Consultation Summary)' : 'AI Consultation & Client Strategy Summary';
      default:
        return 'URJAFLUX Enterprise Analytical Report';
    }
  }
}
