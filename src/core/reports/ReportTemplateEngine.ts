import { IReportTemplate, ReportType } from './ReportTypes';
import { ReportBrandingEngine } from './ReportBrandingEngine';

export class ReportTemplateEngine {
  private static instance: ReportTemplateEngine;
  private templates: Map<string, IReportTemplate> = new Map();

  private constructor() {
    this.seedDefaultTemplates();
  }

  public static getInstance(): ReportTemplateEngine {
    if (!ReportTemplateEngine.instance) {
      ReportTemplateEngine.instance = new ReportTemplateEngine();
    }
    return ReportTemplateEngine.instance;
  }

  private seedDefaultTemplates(): void {
    const branding = ReportBrandingEngine.getInstance().getDefaultBranding();

    const templateList: IReportTemplate[] = [
      {
        templateId: 'tpl-exec-summary',
        templateName: 'Executive Strategic Summary',
        description: 'High-level synthesis for board members, property owners, and key decision makers.',
        recommendedReportType: 'EXECUTIVE_SUMMARY',
        defaultSectionsKeys: ['EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'RECOMMENDATIONS', 'COMPLIANCE_SUMMARY'],
        defaultBranding: {
          ...branding,
          primaryColor: '#0f766e',
          fontFamily: 'Plus Jakarta Sans'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-technical-analysis',
        templateName: 'Deep Technical & Bio-Resonant Audit',
        description: 'Complete multi-domain breakdown with full shloka citations, harmonic frequency graphs, and truth status.',
        recommendedReportType: 'TECHNICAL_ANALYSIS',
        defaultSectionsKeys: [
          'EXECUTIVE_SUMMARY',
          'PROPERTY_DETAILS',
          'KNOWLEDGE_FINDINGS',
          'REASONING_SUMMARY',
          'RECOMMENDATIONS',
          'EXECUTION_STATUS',
          'MONITORING_STATUS'
        ],
        defaultBranding: {
          ...branding,
          primaryColor: '#0284c7',
          fontFamily: 'Inter'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-site-inspection',
        templateName: 'On-Site Field Verification & Evidence Log',
        description: 'Focused on field engineer photographic evidence, material verification, and task checklists.',
        recommendedReportType: 'SITE_INSPECTION',
        defaultSectionsKeys: ['PROPERTY_DETAILS', 'PROJECT_DETAILS', 'EXECUTION_STATUS', 'EVIDENCE'],
        defaultBranding: {
          ...branding,
          primaryColor: '#b45309',
          fontFamily: 'Inter'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-digital-twin-telemetry',
        templateName: 'Digital Twin & IoT Sensor Telemetry',
        description: 'Real-time telemetry, 3D spatial grid mesh readings, electromagnetic flux, and maintenance alerts.',
        recommendedReportType: 'DIGITAL_TWIN',
        defaultSectionsKeys: ['PROPERTY_DETAILS', 'MONITORING_STATUS', 'MAINTENANCE_SUMMARY'],
        defaultBranding: {
          ...branding,
          primaryColor: '#0369a1',
          fontFamily: 'Roboto Mono'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-compliance-cert',
        templateName: 'Sthapatya Veda Enterprise Compliance Certificate',
        description: 'Formal verification seal certifying non-destructive Sthapatya Veda alignment and truth status.',
        recommendedReportType: 'COMPLIANCE_CERTIFICATE',
        defaultSectionsKeys: ['EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'KNOWLEDGE_FINDINGS', 'COMPLIANCE_SUMMARY'],
        defaultBranding: {
          ...branding,
          primaryColor: '#059669',
          fontFamily: 'Playfair Display'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-client-presentation',
        templateName: 'Client Visual Presentation Package',
        description: 'Elegantly formatted deck layout with rich imagery, clear graphics, and client-friendly takeaways.',
        recommendedReportType: 'CLIENT_PRESENTATION',
        defaultSectionsKeys: ['EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'RECOMMENDATIONS', 'EVIDENCE'],
        defaultBranding: {
          ...branding,
          primaryColor: '#18181b',
          fontFamily: 'Plus Jakarta Sans'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-residential-vastu',
        templateName: 'Residential Vastu Audit',
        description: 'Customized layout for apartments, villas, and personal homes, focusing on health, family energy, and room alignments.',
        recommendedReportType: 'RESIDENTIAL_VASTU',
        defaultSectionsKeys: ['COVER_PAGE', 'TABLE_OF_CONTENTS', 'EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'IDENTITY_DETAILS', 'OBSERVATIONS', 'RECOMMENDATIONS', 'REMEDIES', 'APPLIED_CHAKRAS', 'IMAGES', 'FLOOR_PLANS', 'CHARTS', 'SIGNATURE', 'DISCLAIMER'],
        defaultBranding: {
          ...branding,
          primaryColor: '#059669',
          fontFamily: 'Plus Jakarta Sans'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-commercial-vastu',
        templateName: 'Commercial Vastu Blueprint',
        description: 'Optimized report layout for retail hubs, offices, and commercial establishments focused on wealth flow and work dynamics.',
        recommendedReportType: 'COMMERCIAL_VASTU',
        defaultSectionsKeys: ['COVER_PAGE', 'TABLE_OF_CONTENTS', 'EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'OBSERVATIONS', 'ANALYSIS', 'RECOMMENDATIONS', 'REMEDIES', 'IMAGES', 'CHARTS', 'SIGNATURE', 'DISCLAIMER'],
        defaultBranding: {
          ...branding,
          primaryColor: '#0284c7',
          fontFamily: 'Inter'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-industrial-vastu',
        templateName: 'Industrial Vastu Master Plan',
        description: 'Heavy duty architectural report for industrial plants, factories, and warehouses focusing on machine grids.',
        recommendedReportType: 'INDUSTRIAL_VASTU',
        defaultSectionsKeys: ['COVER_PAGE', 'TABLE_OF_CONTENTS', 'EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'OBSERVATIONS', 'ANALYSIS', 'RECOMMENDATIONS', 'REMEDIES', 'IMAGES', 'FLOOR_PLANS', 'CHARTS', 'SIGNATURE', 'DISCLAIMER'],
        defaultBranding: {
          ...branding,
          primaryColor: '#b45309',
          fontFamily: 'Roboto Mono'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-temple-compliance',
        templateName: 'Sacred Temple Geometry Alignments',
        description: 'Strict shastric compliance report evaluating temple alignments, prana-pratishtha directions, and energy vortices.',
        recommendedReportType: 'TEMPLE_COMPLIANCE',
        defaultSectionsKeys: ['COVER_PAGE', 'TABLE_OF_CONTENTS', 'EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'OBSERVATIONS', 'ANALYSIS', 'APPLIED_CHAKRAS', 'IMAGES', 'FLOOR_PLANS', 'CHARTS', 'SIGNATURE', 'DISCLAIMER'],
        defaultBranding: {
          ...branding,
          primaryColor: '#dc2626',
          fontFamily: 'Playfair Display'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-school-report',
        templateName: 'Educational Institute Spatial Study',
        description: 'Focused layout for schools and universities optimizing learning spaces, libraries, and student wellness directions.',
        recommendedReportType: 'SCHOOL_REPORT',
        defaultSectionsKeys: ['COVER_PAGE', 'TABLE_OF_CONTENTS', 'EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'OBSERVATIONS', 'RECOMMENDATIONS', 'APPLIED_CHAKRAS', 'IMAGES', 'FLOOR_PLANS', 'CHARTS', 'SIGNATURE', 'DISCLAIMER'],
        defaultBranding: {
          ...branding,
          primaryColor: '#4f46e5',
          fontFamily: 'Inter'
        },
        isCustom: false
      },
      {
        templateId: 'tpl-hospital-report',
        templateName: 'Hospital Healing Grid Audit',
        description: 'Enterprise healthcare report optimizing operation theaters, healing wards, and cosmic wave flows for patients.',
        recommendedReportType: 'HOSPITAL_REPORT',
        defaultSectionsKeys: ['COVER_PAGE', 'TABLE_OF_CONTENTS', 'EXECUTIVE_SUMMARY', 'PROPERTY_DETAILS', 'OBSERVATIONS', 'ANALYSIS', 'RECOMMENDATIONS', 'REMEDIES', 'APPLIED_CHAKRAS', 'IMAGES', 'FLOOR_PLANS', 'CHARTS', 'SIGNATURE', 'DISCLAIMER'],
        defaultBranding: {
          ...branding,
          primaryColor: '#0891b2',
          fontFamily: 'Plus Jakarta Sans'
        },
        isCustom: false
      }
    ];

    templateList.forEach(t => this.templates.set(t.templateId, t));
  }

  public getAllTemplates(): IReportTemplate[] {
    return Array.from(this.templates.values());
  }

  public getTemplate(templateId: string): IReportTemplate | undefined {
    return this.templates.get(templateId);
  }

  public createCustomTemplate(template: Omit<IReportTemplate, 'templateId' | 'isCustom'>): IReportTemplate {
    const newId = `tpl-custom-${Date.now()}`;
    const newTemplate: IReportTemplate = {
      ...template,
      templateId: newId,
      isCustom: true
    };
    this.templates.set(newId, newTemplate);
    return newTemplate;
  }
}
