import { describe, expect, it } from "vitest";
import { deriveVastuWorkflow } from "../vastuWorkflow";

const baseSnapshot = {
  projectMode: "blueprint" as const,
  blankCanvasReady: false,
  blueprintRendered: false,
  ocrSucceeded: false,
  ocrRunning: false,
  chakraOnCanvas: false,
  chakraAdjusted: false,
  northConfirmed: false,
  analysisComplete: false,
  roomCount: 0,
};

describe("deriveVastuWorkflow", () => {
  it("fresh workspace: only upload is current, nothing completed", () => {
    const result = deriveVastuWorkflow({ ...baseSnapshot });
    expect(result.currentStepId).toBe("upload");
    expect(result.steps.find((s) => s.id === "upload")?.status).toBe("current");
    expect(result.steps.filter((s) => s.status === "completed").length).toBe(0);
    expect(result.canRunAnalysis).toBe(false);
    expect(result.runButtonLabel).toBe("Complete Previous Steps");
  });

  it("does not complete upload without rendered blueprint", () => {
    const result = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: false,
      ocrSucceeded: true,
      chakraOnCanvas: true,
    });
    expect(result.steps.find((s) => s.id === "upload")?.status).not.toBe("completed");
    expect(result.canRunAnalysis).toBe(false);
  });

  it("completes upload only when blueprint is rendered", () => {
    const result = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
    });
    expect(result.steps.find((s) => s.id === "upload")?.status).toBe("completed");
    expect(result.currentStepId).toBe("ocr");
  });

  it("does not complete OCR when running or failed", () => {
    const running = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrRunning: true,
      ocrSucceeded: false,
    });
    expect(running.steps.find((s) => s.id === "ocr")?.status).toBe("current");
    expect(running.steps.find((s) => s.id === "ocr")?.status).not.toBe("completed");

    const failed = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: false,
      ocrRunning: false,
    });
    expect(failed.steps.find((s) => s.id === "ocr")?.status).toBe("current");
    expect(failed.canAddChakra).toBe(false);
  });

  it("completes OCR only after successful detection", () => {
    const result = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: true,
      roomCount: 2,
    });
    expect(result.steps.find((s) => s.id === "ocr")?.status).toBe("completed");
    expect(result.currentStepId).toBe("add_chakra");
    expect(result.canAddChakra).toBe(true);
  });

  it("completes add chakra only when visible on canvas", () => {
    const notVisible = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: true,
      roomCount: 1,
      chakraOnCanvas: false,
    });
    expect(notVisible.steps.find((s) => s.id === "add_chakra")?.status).toBe("current");

    const visible = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: true,
      roomCount: 1,
      chakraOnCanvas: true,
    });
    expect(visible.steps.find((s) => s.id === "add_chakra")?.status).toBe("completed");
    expect(visible.currentStepId).toBe("adjust_chakra");
  });

  it("does not complete adjust without user interaction", () => {
    const result = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: true,
      roomCount: 2,
      chakraOnCanvas: true,
      chakraAdjusted: false,
    });
    expect(result.steps.find((s) => s.id === "adjust_chakra")?.status).toBe("current");
    expect(result.canMarkNorth).toBe(false);
    expect(result.canRunAnalysis).toBe(false);
  });

  it("completes adjust only after move/rotate/resize", () => {
    const result = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: true,
      roomCount: 2,
      chakraOnCanvas: true,
      chakraAdjusted: true,
    });
    expect(result.steps.find((s) => s.id === "adjust_chakra")?.status).toBe("completed");
    expect(result.currentStepId).toBe("mark_north");
    expect(result.canMarkNorth).toBe(true);
  });

  it("enables run analysis only when all calibration steps are done", () => {
    const ready = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: true,
      roomCount: 3,
      chakraOnCanvas: true,
      chakraAdjusted: true,
      northConfirmed: true,
    });
    expect(ready.canRunAnalysis).toBe(true);
    expect(ready.runButtonLabel).toBe("Run Vastu Analysis");

    const missingNorth = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: true,
      roomCount: 3,
      chakraOnCanvas: true,
      chakraAdjusted: true,
      northConfirmed: false,
    });
    expect(missingNorth.canRunAnalysis).toBe(false);
  });

  it("shows results only after analysis completes", () => {
    const result = deriveVastuWorkflow({
      ...baseSnapshot,
      blueprintRendered: true,
      ocrSucceeded: true,
      roomCount: 2,
      chakraOnCanvas: true,
      chakraAdjusted: true,
      northConfirmed: true,
      analysisComplete: true,
    });
    expect(result.showResults).toBe(true);
    expect(result.currentStepId).toBe("results");
    expect(result.steps.find((s) => s.id === "run_analysis")?.status).toBe("completed");
  });

  it("blank canvas: step 1 completes when blank canvas ready, step 2 when rooms drawn", () => {
    const started = deriveVastuWorkflow({
      ...baseSnapshot,
      projectMode: "blank",
      blankCanvasReady: true,
      roomCount: 0,
    });
    expect(started.steps.find((s) => s.id === "upload")?.label).toBe("Start Blank Canvas");
    expect(started.steps.find((s) => s.id === "upload")?.status).toBe("completed");
    expect(started.currentStepId).toBe("ocr");
    expect(started.steps.find((s) => s.id === "ocr")?.label).toBe("Draw Rooms & Walls");

    const withRooms = deriveVastuWorkflow({
      ...baseSnapshot,
      projectMode: "blank",
      blankCanvasReady: true,
      roomCount: 2,
    });
    expect(withRooms.steps.find((s) => s.id === "ocr")?.status).toBe("completed");
    expect(withRooms.currentStepId).toBe("add_chakra");
    expect(withRooms.canAddChakra).toBe(true);
  });
});
