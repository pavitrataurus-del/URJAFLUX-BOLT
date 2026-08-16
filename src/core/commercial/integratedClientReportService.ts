/**
 * Orchestrates integrated client report generation through frozen RPE (extension entry point).
 */

import { applyReportAccessGate } from "./freeTierReportGate";
import {
  buildIntegratedConsultationPackage,
  type ClientReportInput,
} from "./integratedClientReportBuilder";
import {
  isWhiteLabelEnabled,
  resolveReportTypeForTier,
  type ReportAccessMetadata,
} from "./reportAccessPolicy";
import { ReportPreparationEngine } from "../reports/rpe/engine/ReportPreparationEngine";
import type { IReportObjectModel } from "../reports/rpe/types/rpe.types";

export interface IntegratedClientReportResult {
  rom: IReportObjectModel;
  snapshotId: string;
  reportTypeId: string;
  accessMetadata: ReportAccessMetadata;
  moduleInsights: ReturnType<typeof buildIntegratedConsultationPackage>["moduleInsights"] & {
    lockedModules?: string[];
    upsellMessage?: string;
  };
}

export function generateIntegratedClientReport(input: ClientReportInput): IntegratedClientReportResult {
  const { consultation: rawConsultation, moduleInsights } = buildIntegratedConsultationPackage(input);
  const { consultation, metadata } = applyReportAccessGate(rawConsultation, input.accessTier);
  const reportTypeId = resolveReportTypeForTier(input.accessTier);

  const enrichedInsights = {
    ...moduleInsights,
    accessTier: input.accessTier,
    lockedModules: metadata.lockedModules,
    upsellMessage: metadata.upsellMessage,
  };

  const whiteLabel = isWhiteLabelEnabled(input.accessTier)
    ? {
        companyName: input.consultantCompanyName || "URJAFLUX Consultant",
        consultantName: input.consultantCompanyName || "Consultant",
        hideUrjafluxWatermark: input.accessTier === "CONSULTANT" || input.accessTier === "FOUNDER",
      }
    : { companyName: "URJAFLUX AI OS", hideUrjafluxWatermark: false };

  const rpe = ReportPreparationEngine.getInstance();
  const { rom, snapshotId } = rpe.composeRom(
    consultation,
    reportTypeId,
    {
      deliveryStrategy: "INTEGRATED_REPORT",
      targetLanguage: "ENGLISH",
      clientGreetingName: input.clientName,
      customReportTitle:
        input.accessTier === "FREE"
          ? "Vastu Preview & Integrated Score"
          : "Integrated Intelligence Consultation Report",
      includeProductSpecs: input.accessTier !== "FREE",
      include3DDiagrams: input.accessTier !== "FREE",
      includeAlternativePathsInHomeowner: false,
      accessTier: input.accessTier,
    },
    whiteLabel as any,
    undefined,
    enrichedInsights
  );

  return {
    rom,
    snapshotId,
    reportTypeId,
    accessMetadata: metadata,
    moduleInsights: enrichedInsights,
  };
}
