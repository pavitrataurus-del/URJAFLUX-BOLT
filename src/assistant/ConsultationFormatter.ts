/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 4 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Professional Response Generation
 * 
 * ConsultationFormatter.ts: Role-Aware Consultation Formatter & Founder Dual Response Engine.
 * Formats response objects into structured sections, handles membership gating, and builds Founder Audit Packages.
 */

import {
  UKAStructuredResponseObject,
  UKAUserRole,
  UKALanguage,
  UKAFormattedSections,
  UKAFollowUpAction,
  UKAFounderAuditPackage,
  ProfessionalConsultationResult
} from "./UKATypes";
import { ResponseTemplateRegistry } from "./ResponseTemplateRegistry";
import { ProfessionalLanguageService } from "./ProfessionalLanguageService";

export class ConsultationFormatter {
  /**
   * Main Entry Point: Format structured response into professional consultation result
   */
  public static formatConsultation(
    structuredResponse: UKAStructuredResponseObject,
    role: UKAUserRole,
    lang: UKALanguage = "EN",
    sessionConsultationCount: number = 1,
    isExplainabilityRequested: boolean = false
  ): ProfessionalConsultationResult {
    const { responseId, responseType, status, evidencePackage, metadata } = structuredResponse;

    // 1. Check Visitor Membership Gating Policy (After 2 consultations or if response status is ACCESS_DENIED)
    const isGatedVisitor = (role === "VISITOR" && sessionConsultationCount > 2) || status === "ACCESS_DENIED";
    if (isGatedVisitor) {
      return this.buildGatedResult(responseId, lang);
    }

    // 2. Fetch Configurable Response Template
    const template = ResponseTemplateRegistry.getTemplate(responseType);

    // 3. Assemble Core Structured Sections using Template & Data
    const rawSections = this.populateTemplateSections(template, structuredResponse, isExplainabilityRequested);

    // 4. Sanitize Language per Role & Language Preference
    const structuredSections: UKAFormattedSections = {
      observation: ProfessionalLanguageService.sanitize(rawSections.observation, role, lang),
      explanation: ProfessionalLanguageService.sanitize(rawSections.explanation, role, lang),
      supportingEvidence: ProfessionalLanguageService.sanitize(rawSections.supportingEvidence, role, lang),
      professionalRecommendation: ProfessionalLanguageService.sanitize(rawSections.professionalRecommendation, role, lang),
      expectedBenefit: ProfessionalLanguageService.sanitize(rawSections.expectedBenefit, role, lang),
      suggestedNextSteps: rawSections.suggestedNextSteps.map(step =>
        ProfessionalLanguageService.sanitize(step, role, lang)
      ),
      professionalReviewStatus: ProfessionalLanguageService.sanitize(rawSections.professionalReviewStatus, role, lang)
    };

    // 5. Generate Contextual Follow-up Actions
    const followUpActions = this.generateFollowUpActions(structuredResponse, role);

    // 6. Build Human-Readable Public Response Text (Markdown-free, consultant presentation format)
    const publicResponseText = this.buildPublicResponseText(structuredSections, role);

    // 7. Founder Enhancement: Build Founder Audit Package (Dual Response Mode)
    let founderAuditPackage: UKAFounderAuditPackage | undefined;
    if (role === "FOUNDER") {
      founderAuditPackage = this.buildFounderAuditPackage(structuredResponse, evidencePackage);
    }

    return {
      responseId,
      publicResponseText,
      structuredSections,
      followUpActions,
      isMembershipGated: false,
      founderAuditPackage
    };
  }

  /**
   * Fill template variables with structured response data
   */
  private static populateTemplateSections(
    template: any,
    res: UKAStructuredResponseObject,
    isExplainabilityRequested: boolean
  ) {
    const evd = res.evidencePackage;
    const finding = res.decisionChain || evd?.matchedFinding;

    const score = evd?.evaluationSummary?.overallScore ?? 82;
    const ratingTier = evd?.evaluationSummary?.ratingTier ?? "Standard Balance";
    const elementCount = evd?.evaluationSummary?.elementCount ?? (evd?.matchedFinding ? 1 : 0);
    const canonName = res.metadata.attributableCanonName || "Approved URJAFLUX Knowledge Framework";
    const propertySummary = evd?.propertyContextSummary || "Active Property Workspace";
    const evidenceCount = evd?.sourceAttributions?.length || 1;
    const elementName = finding?.elementName || "Spatial Element";
    const zone = finding?.zone || "Central Zone";
    const appliedRuleTitle = finding?.appliedRule?.title || "Spatial Vector Harmony";
    const ruleExplanation = finding?.appliedRule?.conditionEvaluated || res.explanation;
    const severity = finding?.severityCalculation?.severity || "MODERATE";
    const scoreDeduction = finding?.severityCalculation?.scoreDeduction || 5;
    const pipelineStagesCount = evd?.decisionEvidence?.pipelineStagesCount || 15;
    const confidence = Math.round((res.confidence.recognitionConfidence || 0.95) * 100);
    const remedyAction = finding?.recommendation?.remedyAction || res.recommendations[0]?.remedy || "Position spatial energizers along non-conflicting padas.";
    const priority = finding?.recommendation?.priority || "HIGH";
    const expectedImpact = finding?.recommendation?.expectedImpact || "Restores positive directional flux.";
    const verseReference = evd?.knowledgeEvidence?.verseReference || "Classical Vastu Canon";
    const coverageScore = Math.round((evd?.knowledgeEvidence?.coverageScore || 0.96) * 100);
    const consultantNotesStr = evd?.consultantNotes?.join("; ") || "Verified compliant with non-demolition standards.";

    let obs = template.observationTemplate
      .replace("{{score}}", score.toString())
      .replace("{{ratingTier}}", ratingTier)
      .replace("{{elementCount}}", elementCount.toString())
      .replace("{{canonName}}", canonName)
      .replace("{{topic}}", elementName)
      .replace("{{elementName}}", elementName)
      .replace("{{zone}}", zone)
      .replace("{{propertySummary}}", propertySummary)
      .replace("{{assemblyTimeMs}}", res.metadata.assemblyTimeMs.toString());

    let exp = template.explanationTemplate
      .replace("{{canonName}}", canonName)
      .replace("{{verseReference}}", verseReference)
      .replace("{{explanation}}", res.explanation)
      .replace("{{appliedRuleTitle}}", appliedRuleTitle)
      .replace("{{ruleExplanation}}", ruleExplanation)
      .replace("{{severity}}", severity)
      .replace("{{scoreDeduction}}", scoreDeduction.toString())
      .replace("{{propertySummary}}", propertySummary)
      .replace("{{zone}}", zone)
      .replace("{{consultantNotes}}", consultantNotesStr)
      .replace("{{status}}", res.status)
      .replace("{{overallConfidence}}", Math.round((res.confidence.overallConfidence || 0.92) * 100).toString());

    // If Explainability Mode ("Why?"), expand explanation section with complete trace
    if (isExplainabilityRequested) {
      exp += `\n\n[Explainability Analysis Trace]\n- Finding: ${elementName} in ${zone}\n- Supporting Evidence: Recognized with ${confidence}% spatial accuracy.\n- Evaluation Logic: Evaluated under ${appliedRuleTitle}.\n- Recommendation Logic: Non-demolition remedy chosen to avoid physical alteration.\n- Expected Outcome: ${expectedImpact}`;
    }

    let evdText = template.evidenceTemplate
      .replace("{{propertySummary}}", propertySummary)
      .replace("{{evidenceCount}}", evidenceCount.toString())
      .replace("{{canonName}}", canonName)
      .replace("{{coverageScore}}", coverageScore.toString())
      .replace("{{pipelineStagesCount}}", pipelineStagesCount.toString())
      .replace("{{confidence}}", confidence.toString())
      .replace("{{elementCount}}", elementCount.toString())
      .replace("{{completeness}}", (evd?.evidenceCompletenessPercent || 85).toString())
      .replace("{{sourcesCount}}", evidenceCount.toString());

    let rec = template.recommendationTemplate
      .replace("{{remedyAction}}", remedyAction)
      .replace("{{priority}}", priority);

    let ben = template.expectedBenefitTemplate
      .replace("{{expectedImpact}}", expectedImpact)
      .replace("{{zone}}", zone);

    let nextStep = template.nextStepTemplate;

    let reviewStatus = template.reviewStatusTemplate
      .replace("{{reviewStatus}}", res.professionalReviewStatus);

    return {
      observation: obs,
      explanation: exp,
      supportingEvidence: evdText,
      professionalRecommendation: rec,
      expectedBenefit: ben,
      suggestedNextSteps: res.suggestedNextSteps.length > 0 ? res.suggestedNextSteps : [nextStep],
      professionalReviewStatus: reviewStatus
    };
  }

  /**
   * Format the final public consultation text combining all sections
   */
  private static buildPublicResponseText(sections: UKAFormattedSections, role: UKAUserRole): string {
    const lines: string[] = [
      sections.observation,
      "",
      sections.explanation,
      "",
      `Supporting Evidence: ${sections.supportingEvidence}`,
      "",
      `Professional Recommendation: ${sections.professionalRecommendation}`,
      "",
      `Expected Benefit: ${sections.expectedBenefit}`,
      "",
      "Suggested Next Steps:",
      ...sections.suggestedNextSteps.map(step => `- ${step}`),
      "",
      sections.professionalReviewStatus
    ];

    return lines.join("\n");
  }

  /**
   * Generate contextual follow-up suggestions tailored to the response context
   */
  private static generateFollowUpActions(res: UKAStructuredResponseObject, role: UKAUserRole): UKAFollowUpAction[] {
    const actions: UKAFollowUpAction[] = [];
    const finding = res.decisionChain || res.evidencePackage?.matchedFinding;

    if (finding && finding.elementName) {
      const elem = (finding.elementName || "").toLowerCase();
      actions.push({
        label: `Show alternative remedies for ${finding.elementName}`,
        actionQuery: `What are the non-demolition remedies for ${finding.elementName} in ${finding.zone}?`,
        category: "REMEDY"
      });
      actions.push({
        label: `Compare with ideal ${finding.elementName} placement`,
        actionQuery: `Compare current ${finding.elementName} placement with ideal Vastu padas.`,
        category: "COMPARISON"
      });
    }

    actions.push({
      label: "Explain spatial evaluation logic in detail",
      actionQuery: "Why was this spatial score calculated?",
      category: "EVALUATION"
    });

    actions.push({
      label: "Show classical canon citation",
      actionQuery: "What is the classical Vastu Shloka citation for this zone?",
      category: "CANON"
    });

    if (role === "FOUNDER" || role === "CONSULTANT") {
      actions.push({
        label: "View Founder Diagnostic Trace",
        actionQuery: "Show diagnostic engine execution trace.",
        category: "DIAGNOSTIC"
      });
    }

    return actions;
  }

  /**
   * Build Founder Audit Package (Dual Response Mode for Founders)
   */
  private static buildFounderAuditPackage(
    res: UKAStructuredResponseObject,
    evd: any
  ): UKAFounderAuditPackage {
    const modulesConsulted = [
      "ConversationIntentEngine",
      "ConversationRouter",
      "KnowledgePlanner",
      "KnowledgeRetrievalCoordinator",
      "EvidenceAggregator",
      "ResponseAssemblyEngine",
      "ProfessionalLanguageService"
    ];

    const retrievalSequence = evd?.sourceAttributions?.map((s: any) => s.engineId) || ["WORKSPACE", "DECISION_ENGINE", "PROCEDURAL_RULE_ENGINE"];
    const evidenceSourcesUsed = evd?.sourceAttributions?.map((s: any) => s.sourceName) || ["Approved URJAFLUX Knowledge Framework"];

    const missingEvidence: string[] = [];
    if (!evd?.matchedFinding) missingEvidence.push("Specific Decision Chain Target");
    if (!evd?.recognitionEvidence) missingEvidence.push("CAD Layer Geometry Vector");

    return {
      modulesConsulted,
      retrievalSequence,
      evidenceSourcesUsed,
      missingEvidence,
      confidenceBreakdown: res.confidence,
      permissionChecks: {
        role: res.metadata.userRole,
        allowed: res.status !== "ACCESS_DENIED",
        reason: res.status === "ACCESS_DENIED" ? res.explanation : undefined
      },
      processingDurationMs: res.metadata.assemblyTimeMs
    };
  }

  /**
   * Helper to construct a gated result for Visitors
   */
  private static buildGatedResult(responseId: string, lang: UKALanguage): ProfessionalConsultationResult {
    const notice = "Continue with a URJAFLUX Membership to access complete property consultation, unlimited questions, and detailed professional guidance.";
    const sanitizedNotice = ProfessionalLanguageService.sanitize(notice, "VISITOR", lang);

    return {
      responseId,
      publicResponseText: sanitizedNotice,
      structuredSections: {
        observation: "Detailed property consultation requires active URJAFLUX Membership.",
        explanation: "Guest access is limited to basic spatial overview queries.",
        supportingEvidence: "Approved URJAFLUX Knowledge Framework Membership Gateway.",
        professionalRecommendation: sanitizedNotice,
        expectedBenefit: "Unlocks unlimited consultation questions, multi-floor analysis, and non-demolition remedy blueprints.",
        suggestedNextSteps: ["Select a URJAFLUX Membership plan to continue."],
        professionalReviewStatus: "Membership Action Required"
      },
      followUpActions: [
        {
          label: "View URJAFLUX Membership Plans",
          actionQuery: "What features are included in URJAFLUX Membership?",
          category: "REMEDY"
        }
      ],
      isMembershipGated: true,
      membershipGatingNotice: sanitizedNotice
    };
  }
}
