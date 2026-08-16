/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 4 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Professional Response Generation
 * 
 * ProfessionalResponseEngine.ts: Main Entry Point for Professional Response Generation.
 * Orchestrates structured response objects into role-aware, consultant-grade responses.
 */

import {
  UKAStructuredResponseObject,
  UKAUserRole,
  UKALanguage,
  ProfessionalConsultationResult,
  UKARoutingResult,
  UKAUnifiedEvidencePackage
} from "./UKATypes";
import { ResponseAssemblyEngine } from "./ResponseAssemblyEngine";
import { ConsultationFormatter } from "./ConsultationFormatter";

export class ProfessionalResponseEngine {
  /**
   * Primary Entry Point 1: Generate professional consultation response from a pre-assembled UKAStructuredResponseObject
   */
  public static generateResponse(
    structuredResponse: UKAStructuredResponseObject,
    role: UKAUserRole = "PAID_CUSTOMER",
    lang: UKALanguage = "EN",
    sessionConsultationCount: number = 1,
    isExplainabilityRequested: boolean = false
  ): ProfessionalConsultationResult {
    return ConsultationFormatter.formatConsultation(
      structuredResponse,
      role,
      lang,
      sessionConsultationCount,
      isExplainabilityRequested
    );
  }

  /**
   * Primary Entry Point 2: Full Pipeline Helper — Assemble & Format in one call from routing result + evidence package
   */
  public static processAndGenerate(
    routingResult: UKARoutingResult,
    evidencePackage: UKAUnifiedEvidencePackage | null,
    lang: UKALanguage = "EN",
    sessionConsultationCount: number = 1,
    isExplainabilityRequested: boolean = false
  ): ProfessionalConsultationResult {
    // 1. Assemble structured response object (Deterministic logic, Prompt 3)
    const structuredResponse = ResponseAssemblyEngine.assembleResponse(routingResult, evidencePackage);

    // 2. Format into professional consultation response (Prompt 4)
    return this.generateResponse(
      structuredResponse,
      routingResult.userRole,
      lang,
      sessionConsultationCount,
      isExplainabilityRequested
    );
  }
}
