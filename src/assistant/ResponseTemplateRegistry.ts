/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 4 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Professional Response Generation
 * 
 * ResponseTemplateRegistry.ts: Configurable Consultation Template Registry.
 * Centralized repository for consultant-grade response templates per response type and role.
 */

import { UKAResponseType, UKAUserRole, UKALanguage } from "./UKATypes";

export interface UKAResponseTemplate {
  templateId: string;
  responseType: UKAResponseType;
  observationTemplate: string;
  explanationTemplate: string;
  evidenceTemplate: string;
  recommendationTemplate: string;
  expectedBenefitTemplate: string;
  nextStepTemplate: string;
  reviewStatusTemplate: string;
}

export class ResponseTemplateRegistry {
  private static templates: Map<UKAResponseType, UKAResponseTemplate> = new Map();

  static {
    this.registerDefaultTemplates();
  }

  /**
   * Register default templates for all response types
   */
  private static registerDefaultTemplates(): void {
    // 1. PROPERTY_RESPONSE
    this.templates.set("PROPERTY_RESPONSE", {
      templateId: "TMPL-PROPERTY-01",
      responseType: "PROPERTY_RESPONSE",
      observationTemplate: "The current property evaluation indicates an overall Property Health Index of {{score}}% (Rating Tier: {{ratingTier}}). Total spatial entities assessed: {{elementCount}}.",
      explanationTemplate: "Spatial orientation analysis evaluated under the {{canonName}} highlights core structural alignment across active floor zones.",
      evidenceTemplate: "Property Context: {{propertySummary}}. Verified against {{evidenceCount}} evaluated spatial vectors.",
      recommendationTemplate: "Prioritize non-demolition spatial harmonizers for identified negative directional vectors, focusing on primary living and work zones.",
      expectedBenefitTemplate: "Restores energy balance, improves directional flux stability, and optimizes overall property rating tier towards Prime alignment.",
      nextStepTemplate: "Review element-by-element findings in the Spatial Analysis report or select a specific room for deep diagnostic evaluation.",
      reviewStatusTemplate: "Professional Verification Status: {{reviewStatus}}"
    });

    // 2. KNOWLEDGE_RESPONSE
    this.templates.set("KNOWLEDGE_RESPONSE", {
      templateId: "TMPL-KNOWLEDGE-01",
      responseType: "KNOWLEDGE_RESPONSE",
      observationTemplate: "Based on the approved {{canonName}}, the classical principles for {{topic}} mandate precise spatial vector positioning.",
      explanationTemplate: "{{explanation}} Shloka Reference: {{verseReference}}.",
      evidenceTemplate: "Attributable Source: {{canonName}} (Coverage Score: {{coverageScore}}%).",
      recommendationTemplate: "Align spatial functions strictly with classical directional padas to ensure constructive elemental harmony.",
      expectedBenefitTemplate: "Establishes classical structural compliance without structural demolition or physical alteration.",
      nextStepTemplate: "Query specific spatial padas or request a non-demolition remedy for non-compliant elements.",
      reviewStatusTemplate: "Professional Verification Status: {{reviewStatus}}"
    });

    // 3. DECISION_RESPONSE
    this.templates.set("DECISION_RESPONSE", {
      templateId: "TMPL-DECISION-01",
      responseType: "DECISION_RESPONSE",
      observationTemplate: "The current assessment identified an evaluated spatial principle affecting {{elementName}} in zone {{zone}}.",
      explanationTemplate: "Evaluated Principle: {{appliedRuleTitle}}. {{ruleExplanation}} Severity Level: {{severity}} (Score Deduction: {{scoreDeduction}} pts).",
      evidenceTemplate: "Evaluated Spatial Journey: {{pipelineStagesCount}} assessment stages passed. Recognition Confidence: {{confidence}}%.",
      recommendationTemplate: "Remedy Recommendation: {{remedyAction}}. Priority: {{priority}}.",
      expectedBenefitTemplate: "Expected Benefit: {{expectedImpact}}. Restores positive directional flux in zone {{zone}}.",
      nextStepTemplate: "Apply recommended non-demolition remedy or compare with ideal spatial placement.",
      reviewStatusTemplate: "Professional Verification Status: {{reviewStatus}}"
    });

    // 4. REPORT_RESPONSE
    this.templates.set("REPORT_RESPONSE", {
      templateId: "TMPL-REPORT-01",
      responseType: "REPORT_RESPONSE",
      observationTemplate: "The comprehensive Spatial Dossier summary reflects an overall health score of {{score}}%.",
      explanationTemplate: "The spatial assessment workflow processed all zones in {{propertySummary}}.",
      evidenceTemplate: "Compiled from {{elementCount}} spatial entity findings backed by the {{canonName}}.",
      recommendationTemplate: "Generate and export the complete PDF Property Health Dossier for formal client presentation.",
      expectedBenefitTemplate: "Provides structured, transparent, evidence-backed documentation for property stakeholders.",
      nextStepTemplate: "Export dossier PDF or schedule consultant audit verification.",
      reviewStatusTemplate: "Professional Verification Status: {{reviewStatus}}"
    });

    // 5. CONSULTANT_RESPONSE
    this.templates.set("CONSULTANT_RESPONSE", {
      templateId: "TMPL-CONSULTANT-01",
      responseType: "CONSULTANT_RESPONSE",
      observationTemplate: "Consultant Audit View: Assessment completed for {{propertySummary}} with {{elementCount}} flagged spatial findings.",
      explanationTemplate: "Evaluation logic applied rule '{{appliedRuleTitle}}' in zone {{zone}}. Audit notes: {{consultantNotes}}.",
      evidenceTemplate: "Multi-engine trace: Recognition Confidence {{confidence}}%, Knowledge Coverage {{coverageScore}}%.",
      recommendationTemplate: "Formulate custom non-demolition remedy override or approve standard URJAFLUX recommendation.",
      expectedBenefitTemplate: "Enables tailored client presentation with complete explainability and audit trail.",
      nextStepTemplate: "Finalize consultant notes or update client dossier status to Professionally Verified.",
      reviewStatusTemplate: "Professional Verification Status: {{reviewStatus}}"
    });

    // 6. DIAGNOSTIC_RESPONSE
    this.templates.set("DIAGNOSTIC_RESPONSE", {
      templateId: "TMPL-DIAGNOSTIC-01",
      responseType: "DIAGNOSTIC_RESPONSE",
      observationTemplate: "Spatial Intelligence Diagnostic: Engine trace completed in {{assemblyTimeMs}} ms across {{elementCount}} spatial entities.",
      explanationTemplate: "Diagnostic Status: {{status}}. Overall Evaluation Confidence: {{overallConfidence}}%.",
      evidenceTemplate: "Evidence Completeness: {{completeness}}%. Sources Attributed: {{sourcesCount}} engines.",
      recommendationTemplate: "Verify spatial layer geometry mapping and rule engine execution traces.",
      expectedBenefitTemplate: "Ensures 100% deterministic, audit-ready accuracy for technical and compliance teams.",
      nextStepTemplate: "Review Founder Audit Package or run deep vector validation.",
      reviewStatusTemplate: "Professional Verification Status: {{reviewStatus}}"
    });

    // 7. MEMBERSHIP_RESPONSE
    this.templates.set("MEMBERSHIP_RESPONSE", {
      templateId: "TMPL-MEMBERSHIP-01",
      responseType: "MEMBERSHIP_RESPONSE",
      observationTemplate: "The requested capability requires elevated URJAFLUX AI OS access tier.",
      explanationTemplate: "{{explanation}}",
      evidenceTemplate: "Framework Protection: Access to deep decision chains and consultant audit tools is reserved for active members.",
      recommendationTemplate: "Continue with a URJAFLUX Membership to access complete property consultation, unlimited questions, and detailed professional guidance.",
      expectedBenefitTemplate: "Unlocks full multi-floor analysis, unlimited spatial queries, custom remedy overrides, and PDF dossier exports.",
      nextStepTemplate: "Upgrade subscription tier in the Workspace menu.",
      reviewStatusTemplate: "Professional Verification Status: Membership Action Required"
    });
  }

  /**
   * Retrieve template for a given response type
   */
  public static getTemplate(responseType: UKAResponseType): UKAResponseTemplate {
    const tmpl = this.templates.get(responseType);
    if (tmpl) return tmpl;
    return this.templates.get("KNOWLEDGE_RESPONSE")!;
  }

  /**
   * Register or override a custom template dynamically
   */
  public static registerTemplate(template: UKAResponseTemplate): void {
    this.templates.set(template.responseType, template);
  }
}
