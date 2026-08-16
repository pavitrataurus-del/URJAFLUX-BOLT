import { VastuAnalysisResult } from "../services/vastuAnalysisOrchestrator";

export type VastuProjectMode = "blueprint" | "blank";

export type VastuWorkflowStepId =
  | "upload"
  | "ocr"
  | "add_chakra"
  | "adjust_chakra"
  | "mark_north"
  | "run_analysis"
  | "results";

export type VastuStepStatus = "pending" | "current" | "completed";

export interface VastuWorkflowStep {
  id: VastuWorkflowStepId;
  label: string;
  status: VastuStepStatus;
}

/**
 * Every field must reflect verified runtime state — never mark complete without the real condition.
 */
export interface VastuWorkflowSnapshot {
  /** Blueprint import vs lightweight blank canvas (Workflow B). */
  projectMode?: VastuProjectMode;
  /** Blank canvas started — user chose New Blank Drawing */
  blankCanvasReady?: boolean;
  /** Blueprint file loaded, visible, and image rendered on canvas */
  blueprintRendered: boolean;
  /** OCR finished and at least one room label was detected */
  ocrSucceeded: boolean;
  ocrRunning: boolean;
  /** User added chakra and it is shown on canvas */
  chakraOnCanvas: boolean;
  /** User moved, rotated, or resized the chakra after placing it */
  chakraAdjusted: boolean;
  /** User confirmed north calibration */
  northConfirmed: boolean;
  analysisComplete: boolean;
  roomCount: number;
}

export interface VastuWorkflowDerived {
  steps: VastuWorkflowStep[];
  currentStepId: VastuWorkflowStepId;
  canRunAnalysis: boolean;
  canAddChakra: boolean;
  canMarkNorth: boolean;
  showResults: boolean;
  runButtonLabel: string;
}

export const CALIBRATION_BLOCK_MESSAGE =
  "Please complete Vastu Chakra calibration first.";

export function deriveVastuWorkflow(snapshot: VastuWorkflowSnapshot): VastuWorkflowDerived {
  const projectMode: VastuProjectMode = snapshot.projectMode ?? "blueprint";
  const isBlank = projectMode === "blank";

  const uploadComplete = isBlank
    ? Boolean(snapshot.blankCanvasReady)
    : snapshot.blueprintRendered;

  const roomsReady = isBlank ? snapshot.roomCount > 0 : snapshot.ocrSucceeded;

  const completed = {
    upload: uploadComplete,
    ocr: roomsReady,
    add_chakra: snapshot.chakraOnCanvas,
    adjust_chakra: snapshot.chakraAdjusted,
    mark_north: snapshot.northConfirmed,
    run_analysis: snapshot.analysisComplete,
    results: snapshot.analysisComplete,
  };

  const order: VastuWorkflowStepId[] = [
    "upload",
    "ocr",
    "add_chakra",
    "adjust_chakra",
    "mark_north",
    "run_analysis",
    "results",
  ];

  const labels: Record<VastuWorkflowStepId, string> = isBlank
    ? {
        upload: "Start Blank Canvas",
        ocr: "Draw Rooms & Walls",
        add_chakra: "Add Vastu Chakra",
        adjust_chakra: "Adjust Chakra",
        mark_north: "Mark North",
        run_analysis: "Run Analysis",
        results: "Analysis Complete",
      }
    : {
        upload: "Upload Blueprint",
        ocr: "OCR Detect Rooms",
        add_chakra: "Add Vastu Chakra",
        adjust_chakra: "Adjust Chakra",
        mark_north: "Mark North",
        run_analysis: "Run Analysis",
        results: "Analysis Complete",
      };

  let currentStepId: VastuWorkflowStepId = "upload";
  for (const id of order) {
    if (!completed[id]) {
      currentStepId = id;
      break;
    }
    currentStepId = id;
  }

  if (snapshot.analysisComplete) {
    currentStepId = "results";
  }

  const steps: VastuWorkflowStep[] = order.map((id) => {
    let status: VastuStepStatus = "pending";
    if (completed[id]) {
      status = "completed";
    } else if (id === currentStepId) {
      status = "current";
    }
    return { id, label: labels[id], status };
  });

  const allCalibrationDone =
    uploadComplete &&
    roomsReady &&
    snapshot.chakraOnCanvas &&
    snapshot.chakraAdjusted &&
    snapshot.northConfirmed;

  const canRunAnalysis = allCalibrationDone && snapshot.roomCount > 0 && !snapshot.ocrRunning;

  const runButtonLabel = canRunAnalysis ? "Run Vastu Analysis" : "Complete Previous Steps";

  return {
    steps,
    currentStepId,
    canRunAnalysis,
    canAddChakra: roomsReady && !snapshot.chakraOnCanvas && !snapshot.ocrRunning,
    canMarkNorth: snapshot.chakraOnCanvas && snapshot.chakraAdjusted && !snapshot.northConfirmed,
    showResults: snapshot.analysisComplete,
    runButtonLabel,
  };
}
