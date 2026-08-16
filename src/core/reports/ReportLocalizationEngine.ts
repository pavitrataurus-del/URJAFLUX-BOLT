import { LanguageCode } from './ReportTypes';

export interface ITranslationDictionary {
  executiveSummaryTitle: string;
  propertyDetailsTitle: string;
  projectDetailsTitle: string;
  knowledgeFindingsTitle: string;
  reasoningSummaryTitle: string;
  recommendationsTitle: string;
  executionStatusTitle: string;
  monitoringStatusTitle: string;
  complianceSummaryTitle: string;
  evidenceTitle: string;
  citationsTitle: string;
  approvedByLabel: string;
  confidenceScoreLabel: string;
  domainLabel: string;
  statusLabel: string;
  generatedDateLabel: string;
  tableOfContentsTitle: string;
  pageLabel: string;
}

export class ReportLocalizationEngine {
  private static instance: ReportLocalizationEngine;

  private dictionary: Record<LanguageCode, ITranslationDictionary> = {
    en: {
      executiveSummaryTitle: 'Executive Summary',
      propertyDetailsTitle: 'Property & Spatial Specifications',
      projectDetailsTitle: 'Project Execution & Engineering Scope',
      knowledgeFindingsTitle: 'Verified Vedic Knowledge & Shloka References',
      reasoningSummaryTitle: 'Multi-Domain Synthesis & Energy Diagnostics',
      recommendationsTitle: 'Prioritized Remedial Recommendations',
      executionStatusTitle: 'Site Remediation Execution Status',
      monitoringStatusTitle: 'IoT Telemetry & Spatial Health Monitoring',
      complianceSummaryTitle: 'Sthapatya Veda Compliance Rating',
      evidenceTitle: 'Verified Site Evidence & Photographic Logs',
      citationsTitle: 'Canonical Manuscript Citations',
      approvedByLabel: 'Approved By',
      confidenceScoreLabel: 'Truth Engine Confidence Score',
      domainLabel: 'Knowledge Domain',
      statusLabel: 'Verification Status',
      generatedDateLabel: 'Generated Date',
      tableOfContentsTitle: 'Table of Contents',
      pageLabel: 'Page'
    },
    hi: {
      executiveSummaryTitle: 'कार्यकारी सारांश (Executive Summary)',
      propertyDetailsTitle: 'भवन एवं स्थानिय विवरण (Property Specifications)',
      projectDetailsTitle: 'परियोजना क्रियान्वयन एवं अभियांत्रिकी कार्य (Project Scope)',
      knowledgeFindingsTitle: 'प्रमाणित वैदिक शास्त्र एवं श्लोक संदर्भ (Knowledge Findings)',
      reasoningSummaryTitle: 'बहु-क्षेत्रीय विश्लेषण एवं ऊर्जा निदान (Energy Diagnostics)',
      recommendationsTitle: 'प्राथमिकता आधारित निवारण उपाय (Remedial Recommendations)',
      executionStatusTitle: 'स्थल सुधार कार्य निष्पादन स्थिति (Execution Status)',
      monitoringStatusTitle: 'डिजिटल ट्विन एवं ऊर्जा निगरानी (Monitoring Status)',
      complianceSummaryTitle: 'स्थापत्य वेद अनुपालन रेटिंग (Compliance Rating)',
      evidenceTitle: 'प्रमाणित स्थल साक्ष्य एवं चित्र (Evidence Logs)',
      citationsTitle: 'प्रामाणिक ग्रंथ संदर्भ (Canonical Citations)',
      approvedByLabel: 'स्वीकृतकर्ता',
      confidenceScoreLabel: 'सत्यता इंजन विश्वसनीयता अंक',
      domainLabel: 'ज्ञान क्षेत्र',
      statusLabel: 'सत्यापन स्थिति',
      generatedDateLabel: 'जनरेट तिथि',
      tableOfContentsTitle: 'विषय सूची (Table of Contents)',
      pageLabel: 'पृष्ठ'
    }
  };

  private constructor() {}

  public static getInstance(): ReportLocalizationEngine {
    if (!ReportLocalizationEngine.instance) {
      ReportLocalizationEngine.instance = new ReportLocalizationEngine();
    }
    return ReportLocalizationEngine.instance;
  }

  public getTranslations(lang: LanguageCode): ITranslationDictionary {
    return this.dictionary[lang] || this.dictionary.en;
  }

  public translateText(textKey: keyof ITranslationDictionary, lang: LanguageCode): string {
    const dict = this.getTranslations(lang);
    return dict[textKey] || textKey;
  }
}
