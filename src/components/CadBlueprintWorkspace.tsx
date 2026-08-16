import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { 
  Maximize2, Eye, EyeOff, Lock, Unlock, Layers as LayersIcon, 
  Settings, MousePointer, Compass, Sliders, RotateCw, 
  Grid, Keyboard, Terminal, Undo2, Redo2, Search, ArrowRight, CornerDownRight,
  Sparkles, Check, CheckCircle2, ChevronRight,
  Download, FileText, Printer, Sun, Moon,
  FolderOpen, Save, FilePlus, Trash2, Plus, Minus,
  X, Move, Copy, Image as ImageIcon, Scale, Ruler, 
  Zap, Award, Cpu, ShieldCheck, Box, Boxes,
  Columns, Frame,   PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  Layout, Wrench, Upload, RefreshCw, Crosshair, SlidersHorizontal,
  ArrowLeft, Home, Scissors, Clipboard, Square, Type,
  PieChart, Activity, HelpCircle, Info, Pin, PinOff, User,
  Grid3X3, FileUp, FileDown, Layers, Split, HelpCircle as GuideIcon,
  ListChecks
} from "lucide-react";

import VastuChakraVectorOverlay from "./VastuChakraVectorOverlay";
import RightInspectorPanel from "./RightInspectorPanel";
import VastuWorkflowWizard from "./vastu/VastuWorkflowWizard";
import VastuClientToolbar from "./vastu/VastuClientToolbar";
import WorkflowProgressChip from "./vastu/WorkflowProgressChip";
import WorkspaceUploadPopup from "./vastu/WorkspaceUploadPopup";
import FloatingWorkflowPanel from "./vastu/FloatingWorkflowPanel";
import ArchitectFloorPlanToolbar from "./vastu/ArchitectFloorPlanToolbar";
import ArchitectEntityLayer from "./vastu/ArchitectEntityLayer";
import ArchitectDrawPreview from "./vastu/ArchitectDrawPreview";
import ArchitectSelectionBar from "./vastu/ArchitectSelectionBar";
import {
  type ArchitectDrawTool,
  type DrawDraft,
  type WorldPoint,
  type WallEndpoint,
  screenToWorldMeters,
  snapWorldPoint,
  entityFromRectDrag,
  entityFromWallDrag,
  entityFromClickPlacement,
  rotateEntityByDegrees,
  rotationFromWorldPoint,
  isClickPlaceTool,
  isDragDrawTool,
  toolToEntityType,
  adjustEntityDimension,
  flipEntityHorizontal,
  resizeEntityFromHandle,
  isEraserTool,
  type ResizeHandle,
  getWallEndpoints,
  wallFromEndpoints,
} from "./vastu/architectDrawUtils";
import { deriveVastuWorkflow, CALIBRATION_BLOCK_MESSAGE, VastuProjectMode } from "../types/vastuWorkflow";
import { RuntimeEvaluationSessionStore } from "../core/session/RuntimeEvaluationSession";
import { executeVastuAnalysisPipeline, VastuAnalysisResult } from "../services/vastuAnalysisOrchestrator";
import { buildingElementRegistry } from "../services/spatial/BuildingElementRegistry";
import { blueprintEngine } from "../spatial/BlueprintEngine/BlueprintEngine";
import { getActiveTransportMode } from "../spatial/VisionRuntime";
import { VastuAnalysisResultsPanel } from "./VastuAnalysisResultsPanel";
import { MultimodalObjectDetector } from "../core/knowledge_ingestion/multimodal/MultimodalObjectDetector";
import { SpatialFloorPlanEngine } from "../core/knowledge_ingestion/multimodal/SpatialFloorPlanEngine";
import { BlueprintUnderstandingEngine } from "../services/blueprintUnderstandingEngine";
import { ClientDiscoveryModal } from "./discovery/ClientDiscoveryModal";
import { clientDiscoveryService } from "../services/clientDiscoveryService";

export type { CadEntity, EntityCategory, EntitySource } from "../types/cadEntity";
import type { CadEntity } from "../types/cadEntity";
import { resolveEntityWorldCenter } from "../core/spatial/blueprintAnchoredCoordinates";

export interface BlueprintData {
  id: string;
  name: string;
  url: string;
  fileType: "image" | "pdf";
  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
  x: number; // center x offset in canvas world meters
  y: number; // center y offset in canvas world meters
  width: number; // display width in meters
  height: number; // display height in meters
  rotation: number; // 0, 90, 180, 270
  opacity: number; // 0.0 - 1.0 (default 0.8)
  locked: boolean; // default false
  visible: boolean; // default true
  calibrated: boolean;
  pixelsPerMeter: number; // default 40 px/m
  scaleText: string;
}

export interface HistoryAction {
  id: string;
  description: string;
  timestamp: string;
  type: "modify" | "select" | "layer" | "tool" | "document" | "system";
}

export type WorkspaceMode = "drawing" | "analysis" | "presentation" | "review" | "developer";
export type CanvasGridMode = "plain" | "light" | "blueprint";

export interface CadBlueprintWorkspaceProps {
  onNavigate?: (view: string) => void;
}

export default function CadBlueprintWorkspace({ onNavigate }: CadBlueprintWorkspaceProps = {}) {
  // 1. Core Canvas Theme (Light / Dark)
  const [canvasTheme, setCanvasTheme] = useState<"light" | "dark">("light");
  
  // 2. Canvas Appearance Grid Mode
  const [gridMode, setGridMode] = useState<CanvasGridMode>("light");

  // 3. Workspace Mode
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("drawing");

  // 4. Focus / Fullscreen Mode
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // 5. Ribbon Tab
  const [activeRibbonTab, setActiveRibbonTab] = useState<string>("FILE");

  // 6. Canvas Transformation State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Active Approved Tools
  const [activeTool, setActiveTool] = useState<string>("select");

  // Left Toolbar Collapse & Pin State
  const [leftToolbarCollapsed, setLeftToolbarCollapsed] = useState<boolean>(true);
  const [showAdvancedRibbon, setShowAdvancedRibbon] = useState<boolean>(false);
  const [ocrSucceeded, setOcrSucceeded] = useState<boolean>(false);
  const [chakraUserAdjusted, setChakraUserAdjusted] = useState<boolean>(false);
  const [blueprintImageLoaded, setBlueprintImageLoaded] = useState<boolean>(false);
  const [leftToolbarPinned, setLeftToolbarPinned] = useState<boolean>(true);
  
  // Right Inspector Collapse, Pin, & Undock State
  const [rightInspectorOpen, setRightInspectorOpen] = useState<boolean>(false);
  const [rightInspectorPinned, setRightInspectorPinned] = useState<boolean>(true);
  const [rightInspectorUndocked, setRightInspectorUndocked] = useState<boolean>(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"blueprint" | "layers" | "properties" | "vastu" | "context" | "selection">("blueprint");

  // Top Menu Open Dropdown
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [cmdSearchQuery, setCmdSearchQuery] = useState<string>("");

  // Modals & Panels
  const [showRecentProjectsModal, setShowRecentProjectsModal] = useState<boolean>(false);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);

  // Vastu Overlays & Chakra State
  const [vastuNorthCalibration, setVastuNorthCalibration] = useState<number>(0); // deg
  const [showVastuChakra, setShowVastuChakra] = useState<boolean>(false);
  const [chakraDeployed, setChakraDeployed] = useState<boolean>(false);
  const [show16Zones, setShow16Zones] = useState<boolean>(true);
  const [showBrahmasthan, setShowBrahmasthan] = useState<boolean>(true);
  const [showEnergyOverlay, setShowEnergyOverlay] = useState<boolean>(false);
  const [showCompass, setShowCompass] = useState<boolean>(true);

  // Chakra Specific Geometry Controls
  const [chakraX, setChakraX] = useState<number>(0);
  const [chakraY, setChakraY] = useState<number>(0);
  const [chakraRotation, setChakraRotation] = useState<number>(0);
  const [chakraScale, setChakraScale] = useState<number>(1.0);
  const [chakraAspect, setChakraAspect] = useState<number>(1.0);
  const [chakraOpacity, setChakraOpacity] = useState<number>(0.85);
  const [chakraLocked, setChakraLocked] = useState<boolean>(false);

  // Canvas Mouse Tracking
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currX: number; currY: number; active: boolean } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; active: boolean; entityId?: string } | null>(null);

  // Snap & Grid Settings
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [unitSystem, setUnitSystem] = useState<"mm" | "m" | "ft">("m");

  // Canvas Objects (Entities)
  const [entities, setEntities] = useState<CadEntity[]>([]);

  // Synchronize CAD Workspace entities into central BuildingElementRegistry
  useEffect(() => {
    buildingElementRegistry.syncCadEntities(entities);
  }, [entities]);

  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const selectedEntity = entities.find(e => e.id === selectedEntityId) || null;

  // Selected Object Type State for Proper Selection Isolation
  const [selectedObjectType, setSelectedObjectType] = useState<"blueprint" | "chakra" | "grid" | "entity" | "none">("none");

  // Blueprint Mouse Drag Handler
  const handleBlueprintMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedObjectType("blueprint");
    setActiveInspectorTab("blueprint");

    if (!blueprint || blueprint.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = blueprint.x || 0;
    const initialY = blueprint.y || 0;
    const ppm = blueprint.pixelsPerMeter || 40;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.stopPropagation();
      const dx = (moveEvent.clientX - startX) / (ppm * zoom);
      const dy = -(moveEvent.clientY - startY) / (ppm * zoom);
      setBlueprint(prev => prev ? { ...prev, x: Math.round((initialX + dx) * 100) / 100, y: Math.round((initialY + dy) * 100) / 100 } : null);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.stopPropagation();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Upload floating popup (replaces full-screen welcome overlay)
  const [uploadPopupOpen, setUploadPopupOpen] = useState<boolean>(false);
  const [projectMode, setProjectMode] = useState<VastuProjectMode>("blueprint");
  const [blankCanvasReady, setBlankCanvasReady] = useState<boolean>(false);
  const [architectTool, setArchitectTool] = useState<ArchitectDrawTool>("plot");
  const [drawDraft, setDrawDraft] = useState<DrawDraft | null>(null);
  const drawDraftRef = useRef<DrawDraft | null>(null);
  drawDraftRef.current = drawDraft;
  const entityMoveRef = useRef<{
    id: string;
    startWorld: WorldPoint;
    origX: number;
    origY: number;
    origPoints: { x: number; y: number; label: string }[];
  } | null>(null);
  const wallEndpointDragRef = useRef<{
    id: string;
    endpoint: WallEndpoint;
    fixedPoint: WorldPoint;
  } | null>(null);
  const entityRotationDragRef = useRef<{ id: string } | null>(null);
  const entityResizeRef = useRef<{ id: string; handle: ResizeHandle } | null>(null);

  // Dedicated Blueprint Layer State
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);

  // Trace Mode State
  const [traceMode, setTraceMode] = useState<boolean>(false);

  // Show Origin Marker State (Default: false / OFF per requirement)
  const [showOrigin, setShowOrigin] = useState<boolean>(false);

  // Scale Calibration Engine State
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationPoints, setCalibrationPoints] = useState<{ x: number; y: number }[]>([]);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [realDistanceInput, setRealDistanceInput] = useState<string>("3000");
  const [distanceUnit, setDistanceUnit] = useState<"mm" | "m" | "ft">("mm");

  // Vastu Analysis Pipeline State & Handlers
  const [analysisResult, setAnalysisResult] = useState<VastuAnalysisResult | null>(null);
  const [isAnalysisPanelOpen, setIsAnalysisPanelOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // KIE Sprint-2 Module 1: Client Discovery State
  const [isClientDiscoveryModalOpen, setIsClientDiscoveryModalOpen] = useState<boolean>(false);
  const [chakraOrientationCalibrated, setChakraOrientationCalibrated] = useState<boolean>(false);


  const logAction = (msg: string) => {
    console.log(`[CAD Log]: ${msg}`);
  };

  const invalidateChakraCalibration = () => {
    setChakraOrientationCalibrated(false);
  };

  const markChakraAdjusted = () => {
    if (chakraDeployed) {
      setChakraUserAdjusted(true);
    }
  };

  const confirmNorthCalibration = () => {
    if (!chakraDeployed) {
      alert("Add and position the Vastu Chakra on the blueprint before marking North.");
      return;
    }
    setChakraOrientationCalibrated(true);
    logAction(
      `Vastu Chakra calibrated — True North = 0°, Blueprint rotation offset +${vastuNorthCalibration}°, Chakra rotation ${chakraRotation}°`
    );
  };

  const addVastuChakra = () => {
    if (projectMode === "blueprint" && !blueprint) {
      alert("Upload a blueprint first, then add the Vastu Chakra.");
      return;
    }
    setChakraDeployed(true);
    setShowVastuChakra(true);
    setChakraUserAdjusted(false);
    if (blueprint) {
      setChakraX(blueprint.x);
      setChakraY(blueprint.y);
    } else {
      setChakraX(0);
      setChakraY(0);
    }
    setSelectedObjectType("chakra");
    setChakraOrientationCalibrated(false);
    setAnalysisResult(null);
    setIsAnalysisPanelOpen(false);
    logAction(
      projectMode === "blank"
        ? "Vastu Chakra added to blank canvas — position, rotate, resize, then Mark North."
        : "Vastu Chakra added to blueprint — position, rotate, resize, then Mark North."
    );
  };

  const handleAutoDetectEntities = async () => {
    setIsAnalyzing(true);
    setOcrSucceeded(false);
    try {
      logAction("Reading blueprint labels and mapping to entities...");

      if (!blueprint?.url) {
        logAction("Blueprint understanding aborted: no blueprint image available.");
        return;
      }

      const UNDERSTAND_TIMEOUT_MS = 180000;
      const understanding = await Promise.race([
        BlueprintUnderstandingEngine.understandBlueprint(blueprint.url, blueprint),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Blueprint understanding timed out after 180 seconds")), UNDERSTAND_TIMEOUT_MS)
        ),
      ]);

      if (!understanding || understanding.entityCount === 0) {
        logAction(
          understanding?.detectedLabels.length
            ? `Labels read (${understanding.detectedLabels.length}) but no entities mapped: ${understanding.detectedLabels.join(", ")}`
            : "No readable labels on blueprint — check image quality or upload again."
        );
        setEntities([]);
        buildingElementRegistry.syncCadEntities([]);
        setAnalysisResult(null);
        setIsAnalysisPanelOpen(false);
        RuntimeEvaluationSessionStore.clearSession();
        return;
      }

      const extractedEntities = understanding.entities;
      const detectedRooms = extractedEntities.filter((e) => e.type === "Room").length;

      logAction(
        `Blueprint labels read (${understanding.detectedLabels.length}): ${understanding.detectedLabels.join(", ")}`
      );
      logAction(
        `Entities created: ${understanding.entityCount} total (${detectedRooms} rooms, ${understanding.structuralLabelCount} structural)`
      );

      if (understanding.orientation.markers.length > 0) {
        const labels = understanding.orientation.markers.map((m) => m.label).join(", ");
        logAction(`Orientation markers (not entities): ${labels}`);
        if (understanding.orientation.suggestedBlueprintRotationOffsetDeg !== undefined) {
          logAction(
            `Hint: rotate Chakra offset to about +${understanding.orientation.suggestedBlueprintRotationOffsetDeg}° so True North stays 0°`
          );
        }
      }

      setEntities(extractedEntities);
      buildingElementRegistry.syncCadEntities(extractedEntities);
      pushHistory("Extracted Building Model Geometry", "modify");

      if (detectedRooms > 0 || understanding.entityCount > 0) {
        setOcrSucceeded(true);
        logAction(
          `Ready for Vastu analysis — align Chakra North, Mark North, then Run Analysis (zones from Chakra directions).`
        );
      } else {
        setOcrSucceeded(false);
      }

      setAnalysisResult(null);
      setIsAnalysisPanelOpen(false);
      RuntimeEvaluationSessionStore.clearSession();
    } catch (err) {
      console.error("Spatial recognition pipeline execution failed:", err);
      setOcrSucceeded(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunVastuAnalysis = async () => {
    logAction("Run Vastu Analysis button clicked.");

    try {
      // KIE Sprint-2 Architecture Rule: Client Discovery Engine is MANDATORY
      if (!clientDiscoveryService.isCompleted()) {
        logAction("MANDATORY CHECK FAILED: Client Discovery Engine is incomplete. Opening Discovery form...");
        setIsClientDiscoveryModalOpen(true);
        alert("CLIENT DISCOVERY MANDATORY: Please complete the Client Discovery Engine form before running Vastu Analysis.");
        return;
      }

      if (projectMode === "blueprint" && !blueprint) {
        logAction("Analysis blocked: blueprint not uploaded.");
        alert(CALIBRATION_BLOCK_MESSAGE);
        return;
      }

      if (projectMode === "blueprint" && !ocrSucceeded) {
        logAction("Analysis blocked: OCR not complete.");
        alert("Please wait for room detection (OCR) to finish successfully before running analysis.");
        return;
      }

      if (projectMode === "blank" && entities.filter((e) => e.type === "Room").length === 0) {
        logAction("Analysis blocked: no rooms drawn on blank canvas.");
        alert("Draw at least one room on the blank canvas before running Vastu Analysis.");
        return;
      }

      if (!chakraUserAdjusted) {
        logAction("Analysis blocked: Chakra not adjusted.");
        alert(CALIBRATION_BLOCK_MESSAGE);
        return;
      }

      if (!chakraDeployed) {
        logAction("Analysis blocked: Vastu Chakra not added.");
        alert(CALIBRATION_BLOCK_MESSAGE);
        return;
      }

      if (!chakraOrientationCalibrated) {
        logAction(CALIBRATION_BLOCK_MESSAGE);
        alert(CALIBRATION_BLOCK_MESSAGE);
        return;
      }

      const activeEntities = entities;
      if (!activeEntities || activeEntities.length === 0) {
        logAction(
          projectMode === "blank"
            ? "No rooms on blank canvas — draw rooms before analysis."
            : "No OCR room labels in workspace. Upload blueprint and wait for OCR before running analysis."
        );
        alert(
          projectMode === "blank"
            ? "No rooms on the canvas. Use the Draw floor plan toolbar to add at least one Room."
            : "No rooms detected from blueprint OCR. Please upload a blueprint and ensure room labels are readable before running Vastu Analysis."
        );
        return;
      }

      setIsAnalyzing(true);

      // Freeze Geometry Snapshot at moment of user RUN ANALYSIS
      const frozenEntities = [...activeEntities];
      const frozenChakraCenter = { x: chakraX, y: chakraY };
      const frozenNorth = vastuNorthCalibration;
      const frozenChakraRotation = chakraRotation;

      logAction(
        `Executing Vastu Analysis — True North = 0°, offset +${frozenNorth}°, Chakra rotation ${frozenChakraRotation}°, center [${frozenChakraCenter.x}, ${frozenChakraCenter.y}]`
      );

      const result = await executeVastuAnalysisPipeline(
        frozenEntities,
        projectMode === "blank" ? null : blueprint,
        frozenNorth,
        frozenChakraRotation,
        frozenChakraCenter,
        undefined,
        undefined,
        chakraOrientationCalibrated
      );
      setAnalysisResult(result);
      setIsAnalysisPanelOpen(true);
      logAction(`Vastu Analysis Completed: Score ${result.overallScore}%, ${result.doshas.length} Doshas`);
    } catch (err) {
      console.error("Vastu Analysis pipeline execution error:", err);
      const message = err instanceof Error ? err.message : String(err);
      logAction(`Vastu Analysis failed: ${message}`);
      alert(`Vastu Analysis could not complete: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    const regEntities = buildingElementRegistry.getCadEntities();
    if (!regEntities || regEntities.length === 0) {
      alert("Report cannot be generated because no CAD entities are available in the workspace. Please draw objects or import a recognized floor plan first.");
      return;
    }
    if (!analysisResult) {
      alert("No Vastu analysis report is available. Please position the Vastu Chakra and click 'RUN ANALYSIS' first.");
      return;
    }
    setIsAnalysisPanelOpen(true);
  };

  // Clipboard State
  const [clipboardEntity, setClipboardEntity] = useState<CadEntity | null>(null);

  // Navigation History (Back / Forward / Home)
  const [navHistory, setNavHistory] = useState<string[]>(["home"]);
  const [navIndex, setNavIndex] = useState<number>(0);

  // Layers State
  const [layersList, setLayersList] = useState([
    { name: "Blueprint", color: "#3b82f6", visible: true, locked: false, count: blueprint ? 1 : 0 },
    { name: "Site Plot", color: "#64748b", visible: true, locked: false, count: 0 },
    { name: "Architecture", color: "#1e293b", visible: true, locked: false, count: 0 },
    { name: "Rooms", color: "#3b82f6", visible: true, locked: false, count: 0 },
    { name: "Openings", color: "#0284c7", visible: true, locked: false, count: 0 },
    { name: "Columns", color: "#f59e0b", visible: true, locked: false, count: 0 },
    { name: "Circulation", color: "#10b981", visible: true, locked: false, count: 0 },
    { name: "Annotations", color: "#e11d48", visible: true, locked: false, count: 0 }
  ]);

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // History Stack
  const [history, setHistory] = useState<HistoryAction[]>([
    { id: "h1", description: "Initialize Clean CAD Workspace", timestamp: new Date().toLocaleTimeString(), type: "system" }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Floor Tabs
  const [activeDoc, setActiveDoc] = useState<string>("doc_01");

  // Mouse Drag / Pan Tracking
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [viewOrigin, setViewOrigin] = useState({ x: 500, y: 325 });
  const fitBlueprintToViewRef = useRef<() => void>(() => {});

  const fitBlueprintToView = useCallback(() => {
    if (!blueprint || !canvasRef.current) return;
    const ppmVal = blueprint.pixelsPerMeter || 40;
    const canvasW = canvasRef.current.clientWidth;
    const canvasH = canvasRef.current.clientHeight;
    if (canvasW <= 0 || canvasH <= 0) return;

    const originX = canvasW / 2;
    const originY = canvasH / 2;
    const bpPxW = blueprint.width * ppmVal;
    const bpPxH = blueprint.height * ppmVal;
    const fitZoom = Math.min((canvasW * 0.88) / bpPxW, (canvasH * 0.88) / bpPxH, 4);
    const nextZoom = Math.max(0.25, Math.min(4, fitZoom));
    const bx = blueprint.x || 0;
    const by = blueprint.y || 0;

    setZoom(nextZoom);
    // viewOrigin is already canvas center — pan offsets world (0,0) to screen center
    setPan({
      x: originX - viewOrigin.x - bx * ppmVal * nextZoom,
      y: originY - viewOrigin.y + by * ppmVal * nextZoom,
    });
  }, [blueprint, viewOrigin]);

  fitBlueprintToViewRef.current = fitBlueprintToView;

  useEffect(() => {
    if (!blueprint?.url) {
      setBlueprintImageLoaded(false);
      return;
    }
    setBlueprintImageLoaded(false);
    const img = new Image();
    const src = blueprint.url;
    if (!src.startsWith("blob:") && !src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      setBlueprintImageLoaded(true);
      requestAnimationFrame(() => fitBlueprintToViewRef.current());
    };
    img.onerror = () => {
      setBlueprintImageLoaded(false);
      logAction("Blueprint image failed to load.");
    };
    img.src = src;
  }, [blueprint?.id, blueprint?.url]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const syncLayout = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        setViewOrigin({ x: w / 2, y: h / 2 });
      }
      if (blueprintImageLoaded) {
        fitBlueprintToViewRef.current();
      }
    };

    syncLayout();
    const ro = new ResizeObserver(syncLayout);
    ro.observe(el);
    return () => ro.disconnect();
  }, [blueprint?.url, blueprintImageLoaded]);

  // Auto-run OCR once blueprint image is rendered on canvas
  useEffect(() => {
    if (!blueprint?.url || !blueprintImageLoaded) return;
    void handleAutoDetectEntities();
  }, [blueprint?.id, blueprintImageLoaded]);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Vastu Chakra Helpers
  const centerChakraOnBlueprint = () => {
    setChakraX(blueprint ? blueprint.x : 0);
    setChakraY(blueprint ? blueprint.y : 0);
    logAction("Centered Chakra on Blueprint");
  };

  const snapChakraToBlueprint = () => {
    setChakraX(blueprint ? blueprint.x : 0);
    setChakraY(blueprint ? blueprint.y : 0);
    logAction("Snapped Chakra to Blueprint");
  };

  const fitChakraToBlueprint = () => {
    if (blueprint) {
      const maxDim = Math.max(blueprint.width, blueprint.height);
      setChakraScale(maxDim / 15);
    } else {
      setChakraScale(1.0);
    }
    logAction("Fit Chakra to Blueprint");
  };

  const resetChakra = () => {
    setChakraX(0);
    setChakraY(0);
    setChakraRotation(0);
    setChakraScale(1.0);
    setChakraAspect(1.0);
    setChakraOpacity(0.85);
    setChakraLocked(false);
    setVastuNorthCalibration(0);
    setChakraOrientationCalibrated(false);
    setChakraUserAdjusted(false);
    setChakraDeployed(false);
    setShowVastuChakra(false);
    setAnalysisResult(null);
    setIsAnalysisPanelOpen(false);
    logAction("Reset Vastu Chakra");
  };

  // Undo / Redo Snapshot Engine State
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const currentSnapshot = {
      entities: JSON.parse(JSON.stringify(entities)),
      blueprint: blueprint ? JSON.parse(JSON.stringify(blueprint)) : null,
      vastuNorthCalibration,
      showVastuChakra,
      show16Zones,
      showBrahmasthan,
      showEnergyOverlay,
      showCompass,
      chakraX,
      chakraY,
      chakraRotation,
      chakraScale,
      chakraAspect,
      chakraOpacity,
      chakraLocked
    };
    setRedoStack(prev => [...prev, currentSnapshot]);
    setUndoStack(prev => prev.slice(0, prev.length - 1));

    setEntities(previous.entities);
    setBlueprint(previous.blueprint);
    setVastuNorthCalibration(previous.vastuNorthCalibration);
    setShowVastuChakra(previous.showVastuChakra);
    setShow16Zones(previous.show16Zones);
    setShowBrahmasthan(previous.showBrahmasthan);
    setShowEnergyOverlay(previous.showEnergyOverlay);
    setShowCompass(previous.showCompass);
    setChakraX(previous.chakraX);
    setChakraY(previous.chakraY);
    setChakraRotation(previous.chakraRotation);
    setChakraScale(previous.chakraScale);
    setChakraAspect(previous.chakraAspect);
    setChakraOpacity(previous.chakraOpacity);
    setChakraLocked(previous.chakraLocked);
    logAction("Executed Undo action");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const currentSnapshot = {
      entities: JSON.parse(JSON.stringify(entities)),
      blueprint: blueprint ? JSON.parse(JSON.stringify(blueprint)) : null,
      vastuNorthCalibration,
      showVastuChakra,
      show16Zones,
      showBrahmasthan,
      showEnergyOverlay,
      showCompass,
      chakraX,
      chakraY,
      chakraRotation,
      chakraScale,
      chakraAspect,
      chakraOpacity,
      chakraLocked
    };
    setUndoStack(prev => [...prev, currentSnapshot]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));

    setEntities(next.entities);
    setBlueprint(next.blueprint);
    setVastuNorthCalibration(next.vastuNorthCalibration);
    setShowVastuChakra(next.showVastuChakra);
    setShow16Zones(next.show16Zones);
    setShowBrahmasthan(next.showBrahmasthan);
    setShowEnergyOverlay(next.showEnergyOverlay);
    setShowCompass(next.showCompass);
    setChakraX(next.chakraX);
    setChakraY(next.chakraY);
    setChakraRotation(next.chakraRotation);
    setChakraScale(next.chakraScale);
    setChakraAspect(next.chakraAspect);
    setChakraOpacity(next.chakraOpacity);
    setChakraLocked(next.chakraLocked);
    logAction("Executed Redo action");
  };

  // Push History & Save Snapshot
  const pushHistory = (desc: string, type: HistoryAction["type"]) => {
    const currentSnapshot = {
      entities: JSON.parse(JSON.stringify(entities)),
      blueprint: blueprint ? JSON.parse(JSON.stringify(blueprint)) : null,
      vastuNorthCalibration,
      showVastuChakra,
      show16Zones,
      showBrahmasthan,
      showEnergyOverlay,
      showCompass,
      chakraX,
      chakraY,
      chakraRotation,
      chakraScale,
      chakraAspect,
      chakraOpacity,
      chakraLocked
    };
    setUndoStack(prev => [...prev, currentSnapshot]);
    setRedoStack([]);

    const time = new Date().toLocaleTimeString();
    const actionId = `h_${Date.now()}`;
    const newAction: HistoryAction = { id: actionId, description: desc, timestamp: time, type };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newAction]);
    setHistoryIndex(prev => prev + 1);
  };

  // Click Outside Listener for Menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Escape closes menus, modals, or cancels active calibration
      if (e.key === "Escape") {
        setOpenMenu(null);
        setIsCommandPaletteOpen(false);
        setShowRecentProjectsModal(false);
        setShowKeyboardShortcutsModal(false);
        setShowAboutModal(false);
        setShowPreferencesModal(false);
        if (isCalibrating) cancelCalibration();
        return;
      }

      // F11 Fullscreen Focus Mode
      if (e.key === "F11") {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
        return;
      }

      // Ctrl + Shortcuts
      if (isCtrl) {
        if (key === "n") {
          e.preventDefault();
          handleNewProject();
        } else if (key === "o") {
          e.preventDefault();
          fileInputRef.current?.click();
        } else if (key === "s") {
          e.preventDefault();
          handleSaveProject();
        } else if (key === "z") {
          e.preventDefault();
          handleUndo();
        } else if (key === "y") {
          e.preventDefault();
          handleRedo();
        } else if (key === "c") {
          e.preventDefault();
          handleCopy();
        } else if (key === "v") {
          e.preventDefault();
          handlePaste();
        } else if (key === "a") {
          e.preventDefault();
          if (entities.length > 0) setSelectedEntityId(entities[0].id);
        } else if (key === "0") {
          e.preventDefault();
          handleZoomFit();
        } else if (key === "k") {
          e.preventDefault();
          setIsCommandPaletteOpen(prev => !prev);
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedEntityId && !isCommandPaletteOpen && !showCalibrationModal) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [selectedEntityId, historyIndex, history, isFocusMode, isCalibrating, entities, clipboardEntity]);

  // Project Actions
  const handleNewProject = () => {
    setProjectMode("blank");
    setBlankCanvasReady(true);
    setArchitectTool("plot");
    setDrawDraft(null);
    entityMoveRef.current = null;
    setEntities([]);
    setBlueprint(null);
    setSelectedEntityId("");
    setUploadPopupOpen(false);
    setRightInspectorOpen(true);
    setOcrSucceeded(false);
    setChakraUserAdjusted(false);
    setBlueprintImageLoaded(false);
    setChakraDeployed(false);
    setShowVastuChakra(false);
    setChakraOrientationCalibrated(false);
    setAnalysisResult(null);
    setIsAnalysisPanelOpen(false);
    setGridMode("light");
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    buildingElementRegistry.syncCadEntities([]);
    RuntimeEvaluationSessionStore.clearSession();
    pushHistory("Started Blank Floor Plan Drawing", "document");
    setOpenMenu(null);
    logAction("Blank canvas ready — draw plot, walls, and rooms using the toolbar.");
  };

  const handleSaveProject = () => {
    logAction("Project saved successfully.");
    pushHistory("Saved Project", "document");
    setOpenMenu(null);
  };

  const handleCopy = () => {
    if (selectedEntity) {
      setClipboardEntity(selectedEntity);
      logAction(`Copied entity: ${selectedEntity.name}`);
    }
  };

  const handlePaste = () => {
    if (clipboardEntity) {
      const pasted: CadEntity = {
        ...clipboardEntity,
        id: `ent_${Date.now()}`,
        x: clipboardEntity.x + 1,
        y: clipboardEntity.y + 1
      };
      setEntities(prev => [...prev, pasted]);
      setSelectedEntityId(pasted.id);
      pushHistory(`Pasted ${pasted.type}`, "modify");
    }
  };

  const handleDuplicate = () => {
    if (selectedEntity) {
      const dup: CadEntity = {
        ...selectedEntity,
        id: `ent_${Date.now()}`,
        x: selectedEntity.x + 1.5,
        y: selectedEntity.y + 1.5
      };
      setEntities(prev => [...prev, dup]);
      setSelectedEntityId(dup.id);
      pushHistory(`Duplicated ${dup.type}`, "modify");
    }
  };

  const handleDeleteSelected = () => {
    if (selectedEntityId) {
      setEntities(prev => prev.filter(e => e.id !== selectedEntityId));
      setSelectedEntityId("");
      pushHistory("Deleted entity", "modify");
    }
  };

  const handleArchitectEntitySelect = (id: string) => {
    if (isEraserTool(architectTool)) {
      const ent = entities.find((e) => e.id === id);
      if (!ent) return;
      pushHistory(`Erase ${ent.name}`, "modify");
      setEntities((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntityId === id) {
        setSelectedEntityId("");
        setSelectedObjectType("grid");
      }
      return;
    }
    setSelectedEntityId(id);
    setSelectedObjectType("entity");
    setArchitectTool("select");
  };

  const handleAdjustSelectedDimension = (
    dimension: "width" | "height" | "length",
    delta: number
  ) => {
    const ent = entities.find((e) => e.id === selectedEntityId);
    if (!ent) return;
    pushHistory(`Resize ${ent.name}`, "modify");
    setEntities((prev) =>
      prev.map((item) => (item.id === ent.id ? adjustEntityDimension(item, dimension, delta) : item))
    );
  };

  const handleFlipSelectedEntity = () => {
    const ent = entities.find((e) => e.id === selectedEntityId);
    if (!ent) return;
    pushHistory(`Flip ${ent.name}`, "modify");
    setEntities((prev) =>
      prev.map((item) => (item.id === ent.id ? flipEntityHorizontal(item) : item))
    );
  };

  const handleDuplicateSelectedEntity = () => {
    if (!selectedEntity) return;
    pushHistory(`Duplicate ${selectedEntity.name}`, "modify");
    const dup: CadEntity = {
      ...selectedEntity,
      id: `ent_${Date.now()}`,
      x: selectedEntity.x + 0.8,
      y: selectedEntity.y + 0.8,
      points: selectedEntity.points.map((p) => ({ ...p })),
    };
    setEntities((prev) => [...prev, dup]);
    setSelectedEntityId(dup.id);
    setSelectedObjectType("entity");
  };

  const handleRotateSelectedEntity = (deltaDeg: number) => {
    const ent = entities.find((e) => e.id === selectedEntityId);
    if (!ent) return;
    pushHistory(`Rotate ${ent.name}`, "modify");
    setEntities((prev) =>
      prev.map((item) => (item.id === ent.id ? rotateEntityByDegrees(item, deltaDeg) : item))
    );
  };

  const handleDeleteSelectedEntity = () => {
    if (!selectedEntityId) return;
    const ent = entities.find((e) => e.id === selectedEntityId);
    if (!ent) return;
    pushHistory(`Delete ${ent.name}`, "modify");
    setEntities((prev) => prev.filter((e) => e.id !== selectedEntityId));
    setSelectedEntityId("");
    setSelectedObjectType("grid");
  };

  const handleZoomFit = () => {
    if (blueprint) {
      fitBlueprintToView();
      logAction("Zoom: Fit blueprint to viewport.");
    } else if (projectMode === "blank" && entities.length > 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      const canvasPpm = blueprint?.pixelsPerMeter || 40;
      if (rect) {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        entities.forEach((ent) => {
          if (ent.type === "Wall" && ent.points.length >= 2) {
            ent.points.forEach((p) => {
              minX = Math.min(minX, p.x);
              maxX = Math.max(maxX, p.x);
              minY = Math.min(minY, p.y);
              maxY = Math.max(maxY, p.y);
            });
          } else {
            minX = Math.min(minX, ent.x - ent.width / 2);
            maxX = Math.max(maxX, ent.x + ent.width / 2);
            minY = Math.min(minY, ent.y - ent.height / 2);
            maxY = Math.max(maxY, ent.y + ent.height / 2);
          }
        });
        const pad = 2;
        const worldW = maxX - minX + pad * 2;
        const worldH = maxY - minY + pad * 2;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const fitZoom = Math.min(6, Math.max(0.3, Math.min(rect.width / (worldW * canvasPpm), rect.height / (worldH * canvasPpm)) * 0.88));
        setZoom(fitZoom);
        setPan({
          x: rect.width / 2 - viewOrigin.x - centerX * canvasPpm * fitZoom,
          y: rect.height / 2 - viewOrigin.y + centerY * canvasPpm * fitZoom,
        });
      }
      logAction("Zoom: Fit floor plan to viewport.");
    } else {
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
      logAction("Zoom: Reset to Fit Viewport.");
    }
  };

  // Insert Entity Helper
  const handleInsertEntity = (type: CadEntity["type"]) => {
    setUploadPopupOpen(false);
    const slot = entities.length;
    const newEnt: CadEntity = {
      id: `ent_${Date.now()}`,
      name: `${type} #${entities.length + 1}`,
      layer: type === "Wall" ? "Architecture" : type === "Room" ? "Rooms" : "Architecture",
      type,
      x: (slot % 4) * 5,
      y: Math.floor(slot / 4) * 5,
      z: 0,
      width: type === "Wall" ? 5 : type === "Room" ? 4 : type === "Plot" ? 12 : 1.2,
      height: type === "Wall" ? 0.3 : type === "Room" ? 4 : type === "Plot" ? 10 : 1.2,
      material: "Concrete",
      vastu: "Neutral",
      energy: "Balanced",
      status: "Proposed",
      points: [],
      source: projectMode === "blank" ? "USER" : undefined,
    };
    setEntities(prev => [...prev, newEnt]);
    setSelectedEntityId(newEnt.id);
    pushHistory(`Inserted ${type}`, "modify");
    setOpenMenu(null);
  };

  // Blueprint Upload Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newBp = await blueprintEngine.loadFromFile(file);
      setProjectMode("blueprint");
      setBlankCanvasReady(false);
      setBlueprint({ ...newBp, x: 0, y: 0 });
      setBlueprintImageLoaded(false);
      setPan({ x: 0, y: 0 });
      setZoom(1.0);
      setUploadPopupOpen(false);
      setOcrSucceeded(false);
      setChakraUserAdjusted(false);
      setChakraDeployed(false);
      setShowVastuChakra(false);
      setChakraOrientationCalibrated(false);
      setVastuNorthCalibration(0);
      setChakraRotation(0);
      setChakraScale(1.0);
      setChakraAspect(1.0);
      setChakraX(0);
      setChakraY(0);
      setSelectedObjectType("none");
      setEntities([]);
      setAnalysisResult(null);
      setIsAnalysisPanelOpen(false);
      RuntimeEvaluationSessionStore.clearSession();
      buildingElementRegistry.syncCadEntities([]);
      pushHistory(`Imported Blueprint: ${file.name}`, "document");

      logAction(`Blueprint '${file.name}' loaded. Auto-triggering spatial object detection...`);
    } catch (err) {
      console.error("Failed to process blueprint image:", err);
      setBlueprintImageLoaded(false);
      setUploadPopupOpen(true);
    }

    e.target.value = "";
  };

  // Scale Calibration Controls
  const startCalibration = () => {
    if (!blueprint) return;
    setIsCalibrating(true);
    setCalibrationPoints([]);
    setOpenMenu(null);
  };

  const cancelCalibration = () => {
    setIsCalibrating(false);
    setCalibrationPoints([]);
    setShowCalibrationModal(false);
  };

  const submitCalibration = () => {
    if (!blueprint || calibrationPoints.length < 2) return;
    
    const [p1, p2] = calibrationPoints;
    const pxDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const realVal = parseFloat(realDistanceInput) || 3000;
    let realMeters = realVal;
    if (distanceUnit === "mm") realMeters = realVal / 1000;
    if (distanceUnit === "ft") realMeters = realVal * 0.3048;

    const calcPpm = pxDist / realMeters;
    setBlueprint(prev => prev ? {
      ...prev,
      calibrated: true,
      pixelsPerMeter: calcPpm,
      scaleText: `1 px = ${(1 / calcPpm).toFixed(3)}m (${realVal}${distanceUnit})`
    } : null);

    cancelCalibration();
    pushHistory("Calibrated Blueprint Scale", "document");
  };

  // Export & Print Handlers
  const handlePrintPDF = () => {
    window.print();
    setOpenMenu(null);
  };

  const handleExportPNG = () => {
    alert("Exporting high-resolution PNG blueprint...");
    setOpenMenu(null);
  };

  // Top Menu Items Structure
  const menuList = [
    { id: "FILE", label: "File" },
    { id: "EDIT", label: "Edit" },
    { id: "VIEW", label: "View" },
    { id: "INSERT", label: "Insert" },
    { id: "TOOLS", label: "Tools" },
    { id: "VASTU", label: "Vastu" },
    { id: "REPORTS", label: "Reports" },
    { id: "HELP", label: "Help" }
  ];

  // Menu Click & Hover Switching Handlers
  const handleMenuClick = (menuId: string) => {
    if (openMenu === menuId) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menuId);
      setActiveRibbonTab(menuId);
    }
  };

  const handleMenuMouseEnter = (menuId: string) => {
    if (openMenu && openMenu !== menuId) {
      setOpenMenu(menuId);
      setActiveRibbonTab(menuId);
    }
  };

  // Mouse Canvas Actions
  const getWorldFromClient = useCallback(
    (clientX: number, clientY: number): WorldPoint | null => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const canvasPpm = blueprint?.pixelsPerMeter || 40;
      return screenToWorldMeters(
        clientX - rect.left,
        clientY - rect.top,
        viewOrigin.x,
        viewOrigin.y,
        pan.x,
        pan.y,
        canvasPpm,
        zoom
      );
    },
    [blueprint?.pixelsPerMeter, viewOrigin.x, viewOrigin.y, pan.x, pan.y, zoom]
  );

  const finalizeDrawDraft = useCallback(
    (draft: DrawDraft) => {
      const end = snapWorldPoint(draft.current, snapToGrid);
      const start = draft.start;
      let newEnt: CadEntity | null = null;

      if (draft.tool === "plot") {
        newEnt = entityFromRectDrag("Plot", start, end, entities);
      } else if (draft.tool === "room") {
        newEnt = entityFromRectDrag("Room", start, end, entities);
      } else if (draft.tool === "wall") {
        newEnt = entityFromWallDrag(start, end, entities);
      }

      if (newEnt) {
        setEntities((prev) => [...prev, newEnt!]);
        setSelectedEntityId(newEnt.id);
        setSelectedObjectType("entity");
        if (newEnt.type === "Wall") {
          setArchitectTool("select");
        }
        pushHistory(`Drew ${newEnt.type}`, "modify");
      }
    },
    [entities, snapToGrid]
  );

  const handleEntityDragStart = (id: string, e: React.MouseEvent) => {
    if (projectMode !== "blank" || architectTool !== "select") return;
    e.stopPropagation();
    const world = getWorldFromClient(e.clientX, e.clientY);
    const ent = entities.find((item) => item.id === id);
    if (!world || !ent) return;

    setSelectedEntityId(id);
    setSelectedObjectType("entity");
    pushHistory(`Move ${ent.name}`, "modify");
    wallEndpointDragRef.current = null;
    entityRotationDragRef.current = null;
    entityResizeRef.current = null;
    entityMoveRef.current = {
      id,
      startWorld: world,
      origX: ent.x,
      origY: ent.y,
      origPoints: ent.points.map((p) => ({ ...p })),
    };
    isDragging.current = false;
  };

  const handleWallEndpointDragStart = (id: string, endpoint: WallEndpoint, e: React.MouseEvent) => {
    if (projectMode !== "blank" || architectTool !== "select") return;
    e.stopPropagation();
    const ent = entities.find((item) => item.id === id && item.type === "Wall");
    if (!ent) return;

    const [start, end] = getWallEndpoints(ent);
    setSelectedEntityId(id);
    setSelectedObjectType("entity");
    pushHistory(`Adjust ${ent.name}`, "modify");
    entityMoveRef.current = null;
    entityRotationDragRef.current = null;
    entityResizeRef.current = null;
    wallEndpointDragRef.current = {
      id,
      endpoint,
      fixedPoint: endpoint === "start" ? end : start,
    };
    isDragging.current = false;
  };

  const handleRotationHandleDragStart = (id: string, e: React.MouseEvent) => {
    if (projectMode !== "blank" || architectTool !== "select") return;
    e.stopPropagation();
    const ent = entities.find((item) => item.id === id);
    if (!ent || ent.type === "Wall") return;

    setSelectedEntityId(id);
    setSelectedObjectType("entity");
    pushHistory(`Rotate ${ent.name}`, "modify");
    entityMoveRef.current = null;
    wallEndpointDragRef.current = null;
    entityResizeRef.current = null;
    entityRotationDragRef.current = { id };
    isDragging.current = false;
  };

  const handleResizeHandleDragStart = (id: string, handle: ResizeHandle, e: React.MouseEvent) => {
    if (projectMode !== "blank" || architectTool !== "select") return;
    e.stopPropagation();
    const ent = entities.find((item) => item.id === id);
    if (!ent || ent.type === "Wall") return;

    setSelectedEntityId(id);
    setSelectedObjectType("entity");
    pushHistory(`Resize ${ent.name}`, "modify");
    entityMoveRef.current = null;
    wallEndpointDragRef.current = null;
    entityRotationDragRef.current = null;
    entityResizeRef.current = { id, handle };
    isDragging.current = false;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (contextMenu?.active) setContextMenu(null);

    const target = e.target as Element;
    if (target.closest?.("#vastu-chakra-cad-overlay")) {
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isCalibrating) {
      setSelectedObjectType("grid");
      if (calibrationPoints.length === 0) {
        setCalibrationPoints([{ x: clientX, y: clientY }]);
      } else if (calibrationPoints.length === 1) {
        setCalibrationPoints(prev => [...prev, { x: clientX, y: clientY }]);
        setShowCalibrationModal(true);
      }
      return;
    }

    if (projectMode === "blank" && blankCanvasReady) {
      const world = getWorldFromClient(e.clientX, e.clientY);
      if (!world) return;
      const snapped = snapWorldPoint(world, snapToGrid);

      if (isClickPlaceTool(architectTool)) {
        const entityType = toolToEntityType(architectTool);
        if (!entityType) return;
        const newEnt = entityFromClickPlacement(entityType, snapped, entities);
        setEntities((prev) => [...prev, newEnt]);
        setSelectedEntityId(newEnt.id);
        setSelectedObjectType("entity");
        setArchitectTool("select");
        pushHistory(`Placed ${newEnt.name}`, "modify");
        return;
      }

      if (isDragDrawTool(architectTool)) {
        setDrawDraft({
          tool: architectTool,
          start: snapped,
          current: snapped,
          active: true,
        });
        isDragging.current = false;
        return;
      }

      if (architectTool === "select") {
        setSelectedEntityId("");
        setSelectedObjectType("grid");
      }

      if (architectTool === "pan" || architectTool === "select") {
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        return;
      }
    }

    setSelectedObjectType("grid");
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    if (activeTool === "select" && e.shiftKey) {
      setSelectionBox({
        startX: clientX,
        startY: clientY,
        currX: clientX,
        currY: clientY,
        active: true
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const world = getWorldFromClient(e.clientX, e.clientY);
    if (world) setCursorCoords(world);

    if (drawDraft?.active && world) {
      setDrawDraft((prev) =>
        prev ? { ...prev, current: snapWorldPoint(world, snapToGrid) } : null
      );
      return;
    }

    if (wallEndpointDragRef.current && world) {
      const { id, endpoint, fixedPoint } = wallEndpointDragRef.current;
      const dragged = snapWorldPoint(world, snapToGrid);
      const start = endpoint === "start" ? dragged : fixedPoint;
      const end = endpoint === "end" ? dragged : fixedPoint;
      setEntities((prev) =>
        prev.map((ent) => (ent.id === id && ent.type === "Wall" ? wallFromEndpoints(start, end, ent) : ent))
      );
      return;
    }

    if (entityRotationDragRef.current && world) {
      const { id } = entityRotationDragRef.current;
      setEntities((prev) =>
        prev.map((ent) =>
          ent.id === id && ent.type !== "Wall"
            ? { ...ent, rotation: rotationFromWorldPoint(ent, snapWorldPoint(world, snapToGrid)) }
            : ent
        )
      );
      return;
    }

    if (entityResizeRef.current && world) {
      const { id, handle } = entityResizeRef.current;
      setEntities((prev) =>
        prev.map((ent) =>
          ent.id === id && ent.type !== "Wall"
            ? resizeEntityFromHandle(ent, handle, snapWorldPoint(world, snapToGrid))
            : ent
        )
      );
      return;
    }

    if (entityMoveRef.current && world) {
      const { id, startWorld, origX, origY, origPoints } = entityMoveRef.current;
      const dx = world.x - startWorld.x;
      const dy = world.y - startWorld.y;
      setEntities((prev) =>
        prev.map((ent) =>
          ent.id === id
            ? {
                ...ent,
                x: origX + dx,
                y: origY + dy,
                points: origPoints.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })),
              }
            : ent
        )
      );
      return;
    }

    if (isDragging.current) {
      if (selectionBox?.active) {
        setSelectionBox(prev => prev ? { ...prev, currX: clientX, currY: clientY } : null);
      } else {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    }
  };

  const handleCanvasMouseUp = useCallback(() => {
    const draft = drawDraftRef.current;
    if (draft?.active) {
      finalizeDrawDraft(draft);
      drawDraftRef.current = null;
      setDrawDraft(null);
    }
    entityMoveRef.current = null;
    wallEndpointDragRef.current = null;
    entityRotationDragRef.current = null;
    entityResizeRef.current = null;
    isDragging.current = false;
    setSelectionBox((prev) => (prev?.active ? null : prev));
  }, [finalizeDrawDraft]);

  useEffect(() => {
    window.addEventListener("mouseup", handleCanvasMouseUp);
    return () => window.removeEventListener("mouseup", handleCanvasMouseUp);
  }, [handleCanvasMouseUp]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.12;
    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(6.0, zoom * zoomFactor);
    } else {
      newZoom = Math.max(0.3, zoom / zoomFactor);
    }
    setZoom(newZoom);
  };

  const ppm = blueprint?.pixelsPerMeter || 40;
  const viewOriginX = viewOrigin.x;
  const viewOriginY = viewOrigin.y;

  const roomCount = entities.filter((e) => e.type === "Room").length;
  const wallCount = entities.filter((e) => e.type === "Wall").length;
  const plotDrawn = entities.some((e) => e.type === "Plot");
  const isArchitectDrawMode = projectMode === "blank" && blankCanvasReady;
  const blueprintRendered = Boolean(blueprint?.url && blueprint.visible && blueprintImageLoaded);
  const chakraOnCanvas = chakraDeployed && showVastuChakra;

  const workflowDerived = useMemo(
    () =>
      deriveVastuWorkflow({
        projectMode,
        blankCanvasReady,
        blueprintRendered,
        ocrSucceeded,
        ocrRunning: isAnalyzing && blueprintRendered && !ocrSucceeded && projectMode === "blueprint",
        chakraOnCanvas,
        chakraAdjusted: chakraUserAdjusted,
        northConfirmed: chakraOrientationCalibrated,
        analysisComplete: Boolean(analysisResult),
        roomCount,
      }),
    [
      projectMode,
      blankCanvasReady,
      blueprintRendered,
      ocrSucceeded,
      isAnalyzing,
      chakraOnCanvas,
      chakraUserAdjusted,
      chakraOrientationCalibrated,
      analysisResult,
      roomCount,
    ]
  );

  const handleToolbarVastuChakra = () => {
    if (workflowDerived.canAddChakra) {
      addVastuChakra();
    } else if (chakraDeployed) {
      setShowVastuChakra(true);
      setSelectedObjectType("chakra");
    }
  };

  const handleNorthCalibrationChange = (value: number) => {
    invalidateChakraCalibration();
    setVastuNorthCalibration(value);
  };

  const isOcrPhase = isAnalyzing && workflowDerived.currentStepId === "ocr";

  useEffect(() => {
    if (!blueprint && projectMode !== "blank") {
      setUploadPopupOpen(true);
    }
  }, []);
  const clientCanvasMode = !isFocusMode && !showAdvancedRibbon;
  const currentStepLabel =
    workflowDerived.steps.find((s) => s.status === "current")?.label ?? undefined;

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden font-sans select-none relative ${
      canvasTheme === "light" ? "bg-slate-100 text-slate-800" : "bg-[#04060a] text-slate-200"
    }`}>
      {/* Hidden File Input for Blueprint Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, application/pdf" 
        className="hidden" 
      />

      {/* CLIENT MODE — floating overlays (canvas stays full-bleed) */}
      {clientCanvasMode && (
        <>
          <VastuClientToolbar
            canvasTheme={canvasTheme}
            canRunAnalysis={workflowDerived.canRunAnalysis}
            runButtonLabel={workflowDerived.runButtonLabel}
            canGenerateReport={Boolean(analysisResult)}
            canAddChakra={workflowDerived.canAddChakra}
            chakraDeployed={chakraDeployed}
            isAnalyzing={isAnalyzing}
            currentStepLabel={currentStepLabel}
            onOpenWorkspace={() => setUploadPopupOpen(true)}
            onVastuChakra={handleToolbarVastuChakra}
            onRunAnalysis={handleRunVastuAnalysis}
            onGenerateReport={handleGenerateReport}
            onUploadBlueprint={() => fileInputRef.current?.click()}
            onShowAdvancedRibbon={() => setShowAdvancedRibbon(true)}
            onNavigateDashboard={() => onNavigate?.("dashboard")}
            onOpenLanguageSettings={() => onNavigate?.("settings")}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
          <WorkflowProgressChip
            canvasTheme={canvasTheme}
            steps={workflowDerived.steps}
            workflow={workflowDerived}
            ocrRunning={isOcrPhase}
          />
          {isArchitectDrawMode && clientCanvasMode && (
            <>
              {selectedEntity && !isEraserTool(architectTool) && (
                <div className="fixed left-3 right-3 bottom-[10.5rem] z-40 flex justify-center pointer-events-none">
                  <ArchitectSelectionBar
                    canvasTheme={canvasTheme}
                    entity={selectedEntity}
                    onMove={() => setArchitectTool("select")}
                    onRotateLeft={() => handleRotateSelectedEntity(-15)}
                    onRotateRight={() => handleRotateSelectedEntity(15)}
                    onDuplicate={handleDuplicateSelectedEntity}
                    onFlip={handleFlipSelectedEntity}
                    onAdjustWidth={(d) => handleAdjustSelectedDimension("width", d)}
                    onAdjustHeight={(d) => handleAdjustSelectedDimension("height", d)}
                    onAdjustLength={
                      selectedEntity.type === "Wall"
                        ? (d) => handleAdjustSelectedDimension("length", d)
                        : undefined
                    }
                    onDelete={handleDeleteSelectedEntity}
                    onDeselect={() => {
                      setSelectedEntityId("");
                      setSelectedObjectType("grid");
                    }}
                  />
                </div>
              )}
            <ArchitectFloorPlanToolbar
              canvasTheme={canvasTheme}
              activeTool={architectTool}
              snapEnabled={snapToGrid}
              roomCount={roomCount}
              wallCount={wallCount}
              plotDrawn={plotDrawn}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
              onToolChange={setArchitectTool}
              onToggleSnap={() => setSnapToGrid((prev) => !prev)}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
            </>
          )}
          {!rightInspectorOpen && (
            <button
              type="button"
              onClick={() => setRightInspectorOpen(true)}
              className={`fixed right-3 top-[4.5rem] z-40 flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl border shadow-lg transition-all hover:scale-105 active:scale-95 ${
                canvasTheme === "light"
                  ? "bg-white/85 border-slate-200/80 text-slate-600 hover:text-emerald-600"
                  : "bg-[#0a0e16]/85 border-white/10 text-slate-400 hover:text-emerald-400"
              }`}
              style={{ backdropFilter: "blur(16px)" }}
              title="Open step-by-step guide"
            >
              <ListChecks className="w-5 h-5" />
              <span className="text-[9px] font-semibold uppercase tracking-wide">Guide</span>
            </button>
          )}
          <FloatingWorkflowPanel
            open={rightInspectorOpen}
            canvasTheme={canvasTheme}
            onClose={() => setRightInspectorOpen(false)}
          >
            <VastuWorkflowWizard
              variant="floating"
              canvasTheme={canvasTheme}
              projectMode={projectMode}
              workflow={workflowDerived}
              steps={workflowDerived.steps}
              ocrRunning={isOcrPhase}
              roomCount={roomCount}
              blueprintName={blueprint?.name}
              vastuNorthCalibration={vastuNorthCalibration}
              setVastuNorthCalibration={handleNorthCalibrationChange}
              chakraDeployed={chakraDeployed}
              chakraOrientationCalibrated={chakraOrientationCalibrated}
              isAnalyzing={isAnalyzing}
              analysisResult={analysisResult}
              onClose={() => setRightInspectorOpen(false)}
              onUploadBlueprint={() => fileInputRef.current?.click()}
              onInsertEntity={(type) => handleInsertEntity(type as CadEntity["type"])}
              onAddVastuChakra={addVastuChakra}
              onConfirmNorthCalibration={confirmNorthCalibration}
              onRunVastuAnalysis={handleRunVastuAnalysis}
              onGenerateReport={handleGenerateReport}
              onOpenAnalysisPanel={() => setIsAnalysisPanelOpen(true)}
            />
          </FloatingWorkflowPanel>
        </>
      )}

      {/* ADVANCED MODE — desktop menu bar */}
      {!isFocusMode && showAdvancedRibbon && (
        <header 
          ref={menuContainerRef}
          className={`h-8 border-b px-3 flex items-center justify-between shrink-0 z-50 text-[11px] font-medium font-mono ${
            canvasTheme === "light" 
              ? "bg-white border-slate-200 text-slate-700 shadow-xs" 
              : "bg-[#090e1a] border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-1">
            {/* Navigation History Controls */}
            <div className="flex items-center gap-1 mr-2 border-r border-slate-200 dark:border-slate-800 pr-2">
              <button 
                onClick={() => { if (onNavigate) onNavigate("dashboard"); }}
                className="px-1.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded flex items-center gap-1 text-[10px] cursor-pointer"
                title="Exit CAD Mode & Open Sidebar / Dashboard"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dashboard & Sidebar</span>
              </button>
              <button 
                onClick={() => { if (onNavigate) onNavigate("knowledge"); }}
                className="px-1.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded flex items-center gap-1 text-[10px] cursor-pointer"
                title="Go directly to Knowledge & Book Upload"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Upload Books</span>
              </button>
              <button 
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 font-bold mr-3 text-emerald-600 dark:text-emerald-400">
              <Box className="w-4 h-4" />
              <span className="tracking-wider hidden sm:inline">URJAFLUX CAD</span>
            </div>

            {/* KIE Sprint-2 Module 1: Client Discovery Action Button */}
            <button
              onClick={() => setIsClientDiscoveryModalOpen(true)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer mr-2 ${
                clientDiscoveryService.isCompleted()
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse"
              }`}
              title="Client Discovery Engine (KIE Sprint-2)"
            >
              <User className="w-3.5 h-3.5" />
              <span>Client Discovery</span>
              <span className={`w-2 h-2 rounded-full ${clientDiscoveryService.isCompleted() ? "bg-emerald-500" : "bg-amber-500"}`} />
            </button>

            {/* Top Menu Dropdowns */}
            {menuList.map(menu => (
              <div key={menu.id} className="relative">
                <button
                  onClick={() => handleMenuClick(menu.id)}
                  onMouseEnter={() => handleMenuMouseEnter(menu.id)}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                    activeRibbonTab === menu.id || openMenu === menu.id
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-500" 
                      : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {menu.label}
                </button>

                {/* Dropdown Overlay */}
                {openMenu === menu.id && (
                  <div className={`absolute top-full left-0 mt-1 w-60 rounded-md border shadow-2xl py-1 z-50 text-[11px] font-sans ${
                    canvasTheme === "light"
                      ? "bg-white border-slate-200 text-slate-800"
                      : "bg-[#0b1220] border-slate-800 text-slate-200"
                  }`}>
                    
                    {menu.id === "FILE" && (
                      <>
                        <button onClick={handleNewProject} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>New Project</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+N</span>
                        </button>
                        <button onClick={() => { fileInputRef.current?.click(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                          <span>Open...</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+O</span>
                        </button>
                        <button onClick={() => { setShowRecentProjectsModal(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Open Recent</span>
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={handleSaveProject} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Save</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+S</span>
                        </button>
                        <button onClick={handleSaveProject} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Save As...</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+Shift+S</span>
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={() => { fileInputRef.current?.click(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Import Blueprint (PDF)
                        </button>
                        <button onClick={() => { fileInputRef.current?.click(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Import Image (PNG/JPG)
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={handlePrintPDF} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Export PDF</span>
                        </button>
                        <button onClick={handleExportPNG} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Export PNG</span>
                        </button>
                        <button onClick={handlePrintPDF} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Print...</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+P</span>
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={() => { setShowPreferencesModal(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Preferences...
                        </button>
                        <button onClick={() => { if (onNavigate) onNavigate("dashboard"); }} className="w-full text-left px-3 py-1.5 hover:bg-rose-500/10 hover:text-rose-600">
                          Exit to Dashboard
                        </button>
                      </>
                    )}

                    {menu.id === "EDIT" && (
                      <>
                        <button onClick={() => { handleUndo(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Undo</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+Z</span>
                        </button>
                        <button onClick={() => { handleRedo(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Redo</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+Y</span>
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={() => { handleCopy(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Cut</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+X</span>
                        </button>
                        <button onClick={() => { handleCopy(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Copy</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+C</span>
                        </button>
                        <button onClick={() => { handlePaste(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Paste</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+V</span>
                        </button>
                        <button onClick={() => { handleDuplicate(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Duplicate</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+D</span>
                        </button>
                        <button onClick={() => { handleDeleteSelected(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-rose-500/10 hover:text-rose-600 flex justify-between">
                          <span>Delete</span><span className="text-[9px] text-slate-400 font-mono">Del</span>
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={() => { if (entities.length > 0) setSelectedEntityId(entities[0].id); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Select All</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+A</span>
                        </button>
                        <button onClick={() => { setShowPreferencesModal(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Preferences
                        </button>
                      </>
                    )}

                    {menu.id === "VIEW" && (
                      <>
                        <button onClick={() => { setZoom(prev => Math.min(6.0, prev * 1.2)); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Zoom In</span><span className="text-[9px] text-slate-400 font-mono">Ctrl++</span>
                        </button>
                        <button onClick={() => { setZoom(prev => Math.max(0.3, prev / 1.2)); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Zoom Out</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+-</span>
                        </button>
                        <button onClick={() => { handleZoomFit(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Zoom To Fit</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+0</span>
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={() => { setGridMode(gridMode === "plain" ? "light" : "plain"); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>{gridMode === "plain" ? "Show Grid" : "Hide Grid"}</span>
                        </button>
                        <button onClick={() => { setShowOrigin(prev => !prev); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>{showOrigin ? "Hide Origin" : "Show Origin"}</span><span className="text-[9px] text-slate-400">{showOrigin ? "ON" : "OFF"}</span>
                        </button>
                        <button onClick={() => { setCanvasTheme(canvasTheme === "light" ? "dark" : "light"); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Theme ({canvasTheme === "light" ? "Light" : "Dark"})</span>
                        </button>
                        <button onClick={() => { setIsFocusMode(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Full Screen</span><span className="text-[9px] text-slate-400 font-mono">F11</span>
                        </button>
                        <button onClick={() => { handleZoomFit(); setGridMode("light"); setShowOrigin(false); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Reset Layout
                        </button>
                      </>
                    )}

                    {menu.id === "INSERT" && (
                      <>
                        {["Wall", "Room", "Door", "Window", "Column", "Stair", "North", "Dimension", "Text"].map(item => (
                          <button key={item} onClick={() => handleInsertEntity(item as CadEntity["type"])} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                            Insert {item}
                          </button>
                        ))}
                        <button onClick={() => { fileInputRef.current?.click(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Insert Image
                        </button>
                      </>
                    )}

                    {menu.id === "TOOLS" && (
                      <>
                        <button onClick={() => { setActiveTool("measure"); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Measure Ruler
                        </button>
                        <button onClick={() => { setSnapToGrid(prev => !prev); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Snap Settings</span><span className="text-[9px] text-emerald-500 font-bold">{snapToGrid ? "GRID ON" : "OFF"}</span>
                        </button>
                        <button onClick={() => { setUnitSystem(prev => prev === "m" ? "ft" : prev === "ft" ? "mm" : "m"); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Units</span><span className="text-[9px] font-mono text-slate-400">{unitSystem.toUpperCase()}</span>
                        </button>
                        <button onClick={() => { setActiveInspectorTab("layers"); setRightInspectorOpen(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Layer Manager
                        </button>
                        <button onClick={() => { startCalibration(); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Calibration
                        </button>
                        <button onClick={() => { setShowPreferencesModal(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Project Settings
                        </button>
                      </>
                    )}

                    {menu.id === "VASTU" && (
                      <>
                        <button onClick={() => { handleRunVastuAnalysis(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                          <span>Run Vastu Analysis</span><Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={() => { setVastuNorthCalibration(prev => (prev + 15) % 360); invalidateChakraCalibration(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>North Calibration</span><span className="text-[9px] font-mono text-emerald-500">{vastuNorthCalibration}°</span>
                        </button>
                        <button onClick={() => { addVastuChakra(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Add Vastu Chakra
                        </button>
                        <button onClick={() => { setShowVastuChakra(prev => !prev); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Show Chakra</span><span className="text-[9px] text-slate-400">{showVastuChakra ? "ON" : "OFF"}</span>
                        </button>
                        <button onClick={() => { setShow16Zones(prev => !prev); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Show 16 Zones</span><span className="text-[9px] text-slate-400">{show16Zones ? "ON" : "OFF"}</span>
                        </button>
                        <button onClick={() => { setShowBrahmasthan(prev => !prev); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Show Brahmasthan</span><span className="text-[9px] text-slate-400">{showBrahmasthan ? "ON" : "OFF"}</span>
                        </button>
                        <button onClick={() => { setShowEnergyOverlay(prev => !prev); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Energy Overlay</span><span className="text-[9px] text-slate-400">{showEnergyOverlay ? "ON" : "OFF"}</span>
                        </button>
                        <button onClick={() => { setShowCompass(prev => !prev); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>Compass</span><span className="text-[9px] text-slate-400">{showCompass ? "ON" : "OFF"}</span>
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={() => { centerChakraOnBlueprint(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Center On Blueprint
                        </button>
                        <button onClick={() => { snapChakraToBlueprint(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Snap To Blueprint
                        </button>
                        <button onClick={() => { fitChakraToBlueprint(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Fit To Blueprint
                        </button>
                        <button onClick={() => { resetChakra(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-rose-500/10 hover:text-rose-600">
                          Reset Vastu Chakra
                        </button>
                      </>
                    )}

                    {menu.id === "REPORTS" && (
                      <>
                        <button onClick={() => { handleGenerateReport(); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-emerald-600">
                          Generate Report
                        </button>
                        <button onClick={handlePrintPDF} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          PDF Report
                        </button>
                        <button onClick={handlePrintPDF} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Print Report
                        </button>
                        <button onClick={handleExportPNG} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Export Data
                        </button>
                      </>
                    )}

                    {menu.id === "HELP" && (
                      <>
                        <button onClick={() => { setIsCommandPaletteOpen(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex justify-between">
                          <span>User Guide</span><span className="text-[9px] text-slate-400 font-mono">Ctrl+K</span>
                        </button>
                        <button onClick={() => { setShowKeyboardShortcutsModal(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          Keyboard Shortcuts
                        </button>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <button onClick={() => { setShowAboutModal(true); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                          About URJAFLUX CAD
                        </button>
                      </>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Header Options */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
              ACTIVE TRANSPORT = {getActiveTransportMode()}
            </span>
            <button
              onClick={() => setCanvasTheme(canvasTheme === "light" ? "dark" : "light")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
              title="Toggle Theme"
            >
              {canvasTheme === "light" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            <button
              onClick={() => setIsFocusMode(true)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-500"
              title="Full Screen Focus Mode (F11)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAdvancedRibbon(false)}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
            >
              Simple Mode
            </button>
          </div>
        </header>
      )}

      {/* 2. DYNAMIC RIBBON BAR FOR ACTIVE MENU TAB (Advanced mode) */}
      {!isFocusMode && showAdvancedRibbon && (
        <div className={`h-14 border-b px-3 flex items-center gap-3 overflow-x-auto select-none font-sans shrink-0 text-xs ${
          canvasTheme === "light"
            ? "bg-slate-50/90 border-slate-200 text-slate-800 shadow-inner"
            : "bg-[#080d1a] border-slate-800 text-slate-200"
        }`}>
          
          {/* FILE RIBBON */}
          {activeRibbonTab === "FILE" && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex flex-col items-center justify-center px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-500 rounded text-[10px] font-bold shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4 mb-0.5" />
                <span>Import Blueprint</span>
              </button>

              <button 
                onClick={handleNewProject} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <FilePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-0.5" />
                <span>New Project</span>
              </button>

              <button 
                onClick={handleSaveProject} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Save className="w-4 h-4 text-blue-500 mb-0.5" />
                <span>Save</span>
              </button>

              <button 
                onClick={handlePrintPDF} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                <span>Export PDF</span>
              </button>

              <button 
                onClick={handleExportPNG} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-500 mb-0.5" />
                <span>Export PNG</span>
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              <button 
                onClick={() => setShowPreferencesModal(true)} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500 mb-0.5" />
                <span>Preferences</span>
              </button>
            </div>
          )}

          {/* EDIT RIBBON */}
          {activeRibbonTab === "EDIT" && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleUndo} 
                disabled={historyIndex <= 0}
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] disabled:opacity-40 cursor-pointer"
              >
                <Undo2 className="w-4 h-4 text-blue-500 mb-0.5" />
                <span>Undo</span>
              </button>

              <button 
                onClick={handleRedo} 
                disabled={historyIndex >= history.length - 1}
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] disabled:opacity-40 cursor-pointer"
              >
                <Redo2 className="w-4 h-4 text-blue-500 mb-0.5" />
                <span>Redo</span>
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              <button 
                onClick={handleCopy} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                <span>Copy</span>
              </button>

              <button 
                onClick={handlePaste} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Clipboard className="w-4 h-4 text-emerald-600 mb-0.5" />
                <span>Paste</span>
              </button>

              <button 
                onClick={handleDuplicate} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Boxes className="w-4 h-4 text-amber-500 mb-0.5" />
                <span>Duplicate</span>
              </button>

              <button 
                onClick={handleDeleteSelected} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-rose-500/10 text-rose-600 rounded text-[10px] cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mb-0.5" />
                <span>Delete</span>
              </button>
            </div>
          )}

          {/* VIEW RIBBON */}
          {activeRibbonTab === "VIEW" && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setZoom(prev => Math.min(6.0, prev * 1.2))} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-500 mb-0.5" />
                <span>Zoom In</span>
              </button>

              <button 
                onClick={() => setZoom(prev => Math.max(0.3, prev / 1.2))} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Minus className="w-4 h-4 text-amber-500 mb-0.5" />
                <span>Zoom Out</span>
              </button>

              <button 
                onClick={handleZoomFit} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Scale className="w-4 h-4 text-cyan-500 mb-0.5" />
                <span>Zoom To Fit</span>
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Canvas Appearance Grid Modes */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-lg">
                <span className="text-[9px] font-mono font-bold text-slate-500 px-1">CANVAS GRID:</span>
                <button 
                  onClick={() => setGridMode("plain")}
                  className={`px-2 py-1 rounded text-[10px] font-semibold ${gridMode === "plain" ? "bg-white dark:bg-slate-900 text-emerald-600 font-bold shadow-xs" : "text-slate-500"}`}
                >
                  Plain White
                </button>
                <button 
                  onClick={() => setGridMode("light")}
                  className={`px-2 py-1 rounded text-[10px] font-semibold ${gridMode === "light" ? "bg-white dark:bg-slate-900 text-emerald-600 font-bold shadow-xs" : "text-slate-500"}`}
                >
                  Light Grid
                </button>
                <button 
                  onClick={() => setGridMode("blueprint")}
                  className={`px-2 py-1 rounded text-[10px] font-semibold ${gridMode === "blueprint" ? "bg-blue-600 text-white font-bold shadow-xs" : "text-slate-500"}`}
                >
                  Blueprint Grid
                </button>
              </div>

              <button 
                onClick={() => setShowOrigin(prev => !prev)} 
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded text-[10px] cursor-pointer ${showOrigin ? "bg-emerald-500/20 text-emerald-600 font-bold" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <Crosshair className="w-4 h-4 mb-0.5" />
                <span>Origin ({showOrigin ? "ON" : "OFF"})</span>
              </button>
            </div>
          )}

          {/* INSERT RIBBON */}
          {activeRibbonTab === "INSERT" && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { type: "Wall", icon: Square, label: "Wall" },
                { type: "Room", icon: Layout, label: "Room" },
                { type: "Door", icon: Frame, label: "Door" },
                { type: "Window", icon: Columns, label: "Window" },
                { type: "Column", icon: Box, label: "Column" },
                { type: "Stair", icon: Layers, label: "Stair" },
                { type: "North", icon: Compass, label: "North Arrow" },
                { type: "Dimension", icon: Ruler, label: "Dimension" },
                { type: "Text", icon: Type, label: "Text" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.type}
                    onClick={() => handleInsertEntity(item.type as CadEntity["type"])} 
                    className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-0.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TOOLS RIBBON */}
          {activeRibbonTab === "TOOLS" && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTool("measure")} 
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded text-[10px] cursor-pointer ${activeTool === "measure" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <Ruler className="w-4 h-4 mb-0.5" />
                <span>Measure</span>
              </button>

              <button 
                onClick={() => setSnapToGrid(prev => !prev)} 
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded text-[10px] cursor-pointer ${snapToGrid ? "bg-blue-500/20 text-blue-600 font-bold" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <Grid3X3 className="w-4 h-4 mb-0.5" />
                <span>Snap ({snapToGrid ? "ON" : "OFF"})</span>
              </button>

              <button 
                onClick={() => startCalibration()} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Scale className="w-4 h-4 text-amber-500 mb-0.5" />
                <span>Calibration</span>
              </button>

              <button 
                onClick={() => { setActiveInspectorTab("layers"); setRightInspectorOpen(true); }} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <LayersIcon className="w-4 h-4 text-indigo-500 mb-0.5" />
                <span>Layer Manager</span>
              </button>
            </div>
          )}

          {/* VASTU RIBBON */}
          {activeRibbonTab === "VASTU" && (
            <div className="flex items-center gap-2 overflow-x-auto">
              <button 
                onClick={() => setIsClientDiscoveryModalOpen(true)}
                className={`flex flex-col items-center justify-center px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-all border ${
                  clientDiscoveryService.isCompleted()
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/20 border-amber-500/60 text-amber-700 dark:text-amber-300 font-bold animate-pulse"
                }`}
                title="Mandatory KIE Sprint-2 Module 1: Client Discovery Engine"
              >
                <User className="w-4 h-4 mb-0.5" />
                <span>1. Client Discovery</span>
              </button>

              <button 
                type="button"
                onClick={() => handleRunVastuAnalysis()} 
                className="flex flex-col items-center justify-center px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded text-[10px] font-bold shadow-md cursor-pointer transition-all"
                title="Run Vastu Analysis"
              >
                <Sparkles className="w-4 h-4 text-white mb-0.5" />
                <span>2. Run Vastu Analysis</span>
              </button>

              <button 
                onClick={() => setVastuNorthCalibration(prev => (prev + 15) % 360)} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-500 mb-0.5" />
                <span>Offset (+{vastuNorthCalibration}°)</span>
              </button>

              <button 
                onClick={() => setShowVastuChakra(prev => !prev)} 
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded text-[10px] cursor-pointer ${showVastuChakra ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <PieChart className="w-4 h-4 mb-0.5" />
                <span>Chakra Overlay</span>
              </button>

              <button 
                onClick={() => setShow16Zones(prev => !prev)} 
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded text-[10px] cursor-pointer ${show16Zones ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <Grid className="w-4 h-4 mb-0.5" />
                <span>16 Zone Grid</span>
              </button>

              <button 
                onClick={() => setShowBrahmasthan(prev => !prev)} 
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded text-[10px] cursor-pointer ${showBrahmasthan ? "bg-amber-500 text-white font-bold" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <Square className="w-4 h-4 mb-0.5" />
                <span>Brahmasthan</span>
              </button>

              <button 
                onClick={() => setShowEnergyOverlay(prev => !prev)} 
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded text-[10px] cursor-pointer ${showEnergyOverlay ? "bg-purple-600 text-white font-bold" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <Zap className="w-4 h-4 mb-0.5" />
                <span>Energy Heatmap</span>
              </button>

              <button 
                onClick={() => setShowCompass(prev => !prev)} 
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded text-[10px] cursor-pointer ${showCompass ? "bg-cyan-600 text-white font-bold" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <Compass className="w-4 h-4 mb-0.5" />
                <span>Compass</span>
              </button>
            </div>
          )}

          {/* REPORTS RIBBON */}
          {activeRibbonTab === "REPORTS" && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleGenerateReport} 
                className="flex flex-col items-center justify-center px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer shadow-md transition-all"
              >
                <FileText className="w-4 h-4 mb-0.5" />
                <span>Generate Report</span>
              </button>

              <button 
                onClick={handlePrintPDF} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Printer className="w-4 h-4 text-blue-500 mb-0.5" />
                <span>Print PDF</span>
              </button>

              <button 
                onClick={handleExportPNG} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-500 mb-0.5" />
                <span>Export Data</span>
              </button>
            </div>
          )}

          {/* HELP RIBBON */}
          {activeRibbonTab === "HELP" && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsCommandPaletteOpen(true)} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <GuideIcon className="w-4 h-4 text-emerald-500 mb-0.5" />
                <span>User Guide</span>
              </button>

              <button 
                onClick={() => setShowKeyboardShortcutsModal(true)} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Keyboard className="w-4 h-4 text-blue-500 mb-0.5" />
                <span>Shortcuts</span>
              </button>

              <button 
                onClick={() => setShowAboutModal(true)} 
                className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-[10px] cursor-pointer"
              >
                <Info className="w-4 h-4 text-slate-500 mb-0.5" />
                <span>About</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* MAIN WORKSPACE — canvas-first in client mode */}
      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        
        {/* LEFT TOOLBAR (Advanced mode) */}
        {!isFocusMode && showAdvancedRibbon && (
          <div className={`border-r flex flex-col shrink-0 transition-all duration-200 z-20 ${
            canvasTheme === "light" 
              ? "bg-white border-slate-200" 
              : "bg-[#070b13] border-slate-800"
          } ${leftToolbarCollapsed ? "w-12" : "w-14"}`}>
            
            <div className="p-1.5 border-b border-slate-200 dark:border-slate-800 flex justify-center items-center gap-1">
              <button 
                onClick={() => setLeftToolbarCollapsed(prev => !prev)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                title={leftToolbarCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
              >
                {leftToolbarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex-1 p-1 space-y-1 overflow-y-auto custom-scrollbar">
              {[
                { id: "select", label: "Select", icon: MousePointer, key: "V" },
                { id: "pan", label: "Hand Pan", icon: Move, key: "H" },
                { id: "measure", label: "Measure", icon: Ruler, key: "M" },
              ].map(t => {
                const IconComp = t.icon;
                const isActive = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id)}
                    className={`w-full p-2 rounded flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      isActive 
                        ? "bg-emerald-600 text-white font-bold shadow-md" 
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                    title={`${t.label} (${t.key})`}
                  >
                    <IconComp className="w-4 h-4" />
                    {!leftToolbarCollapsed && <span className="text-[8px] font-mono leading-none tracking-tighter truncate">{t.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CENTRAL CANVAS VIEWPORT */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          
          {/* Active Calibration Notification Bar */}
          {isCalibrating && (
            <div className="h-9 bg-amber-500 text-slate-900 font-mono text-[11px] font-bold px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 animate-spin" />
                <span>
                  {calibrationPoints.length === 0 
                    ? "SCALE CALIBRATION: Click Point A on a known blueprint dimension" 
                    : "SCALE CALIBRATION: Click Point B on the other end of the dimension"}
                </span>
              </div>
              <button 
                onClick={cancelCalibration} 
                className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] hover:bg-slate-800 cursor-pointer"
              >
                Cancel (Esc)
              </button>
            </div>
          )}

          {/* SVG INFINITE VECTOR CANVAS */}
          <div 
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onWheel={handleWheel}
            className={`flex-1 min-h-0 relative overflow-hidden select-none ${
              isArchitectDrawMode
                ? isEraserTool(architectTool)
                  ? "cursor-crosshair"
                  : architectTool === "pan"
                  ? "cursor-grab active:cursor-grabbing"
                  : architectTool === "select"
                    ? "cursor-default"
                    : "cursor-crosshair"
                : "cursor-crosshair"
            } ${
              gridMode === "blueprint"
                ? "bg-[#0c2340]"
                : canvasTheme === "light" 
                ? "bg-white" 
                : "bg-[#04060b]"
            }`}
          >
            {/* Floating upload popup — canvas stays visible behind */}
            {clientCanvasMode && uploadPopupOpen && (
              <WorkspaceUploadPopup
                canvasTheme={canvasTheme}
                hasBlueprint={Boolean(blueprint)}
                onClose={() => setUploadPopupOpen(false)}
                onUpload={() => fileInputRef.current?.click()}
                onNewProject={handleNewProject}
              />
            )}

            {/* SVG Engineering Canvas */}
            <svg className="w-full h-full absolute inset-0 z-[1]">
              <defs>
                {/* Dynamic Calibrated Grid Patterns */}
                <pattern 
                  id="grid-major" 
                  width={(ppm) * zoom} 
                  height={(ppm) * zoom} 
                  patternUnits="userSpaceOnUse"
                  x={viewOriginX + pan.x}
                  y={viewOriginY + pan.y}
                >
                  <path 
                    d={`M ${(ppm) * zoom} 0 L 0 0 0 ${(ppm) * zoom}`} 
                    fill="none" 
                    stroke={gridMode === "blueprint" ? "#3b82f6" : gridMode === "plain" ? "none" : canvasTheme === "light" ? "#cbd5e1" : "#1e293b"} 
                    strokeWidth="1" 
                  />
                </pattern>
                <pattern 
                  id="grid-minor" 
                  width={(ppm / 5) * zoom} 
                  height={(ppm / 5) * zoom} 
                  patternUnits="userSpaceOnUse"
                  x={viewOriginX + pan.x}
                  y={viewOriginY + pan.y}
                >
                  <path 
                    d={`M ${(ppm / 5) * zoom} 0 L 0 0 0 ${(ppm / 5) * zoom}`} 
                    fill="none" 
                    stroke={gridMode === "blueprint" ? "#1d4ed8" : gridMode === "plain" ? "none" : canvasTheme === "light" ? "#f1f5f9" : "#0f172a"} 
                    strokeWidth="0.5" 
                  />
                </pattern>
              </defs>

              {/* Grid Background */}
              {gridMode !== "plain" && (
                <>
                  <rect width="100%" height="100%" fill="url(#grid-minor)" />
                  <rect width="100%" height="100%" fill="url(#grid-major)" />
                </>
              )}

              {/* SVG CAD TRANSFORM MATRIX GROUP */}
              <g style={{ transform: `translate(${viewOriginX + pan.x}px, ${viewOriginY + pan.y}px) scale(${zoom})`, transformOrigin: "0px 0px" }}>
                
                {/* 1. Optional Origin (0,0) Marker (Default OFF per requirement) */}
                {showOrigin && (
                  <g className="pointer-events-none">
                    <line x1="-30" y1="0" x2="30" y2="0" stroke="#e11d48" strokeWidth="2" />
                    <line x1="0" y1="-30" x2="0" y2="30" stroke="#0284c7" strokeWidth="2" />
                    <circle cx="0" cy="0" r="5" fill="#e11d48" />
                    <text x="8" y="-8" fill="#e11d48" className="text-[10px] font-mono font-bold">ORIGIN (0,0)</text>
                  </g>
                )}

                {/* 2. DEDICATED BLUEPRINT IMAGE LAYER */}
                {blueprint && blueprint.visible && (
                  <g 
                    id="blueprint-layer"
                    style={{ opacity: traceMode ? (blueprint.opacity * 0.45) : blueprint.opacity, cursor: blueprint.locked ? "not-allowed" : "move" }}
                    transform={`translate(${(blueprint.x || 0) * ppm}, ${-(blueprint.y || 0) * ppm}) rotate(${blueprint.rotation})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedObjectType("blueprint");
                      setActiveInspectorTab("blueprint");
                    }}
                    onMouseDown={handleBlueprintMouseDown}
                  >
                    <image
                      id="blueprint-canvas-image"
                      href={blueprint.url}
                      x={- (blueprint.width * ppm) / 2}
                      y={- (blueprint.height * ppm) / 2}
                      width={blueprint.width * ppm}
                      height={blueprint.height * ppm}
                      preserveAspectRatio="xMidYMid meet"
                      onLoad={() => {
                        setBlueprintImageLoaded(true);
                        requestAnimationFrame(() => fitBlueprintToViewRef.current());
                      }}
                      onError={() => {
                        setBlueprintImageLoaded(false);
                        logAction("Blueprint image failed to render on canvas.");
                      }}
                    />
                  </g>
                )}

                {/* Professional Vastu Chakra CAD Overlay */}
                {showVastuChakra && (
                  <VastuChakraVectorOverlay
                    cx={chakraX}
                    cy={chakraY}
                    pixelsPerMeter={ppm}
                    rotation={chakraRotation + vastuNorthCalibration}
                    scale={chakraScale}
                    aspect={chakraAspect}
                    opacity={chakraOpacity}
                    zoom={zoom}
                    show16Zones={show16Zones}
                    showBrahmasthan={showBrahmasthan}
                    showCompass={showCompass}
                    locked={chakraLocked}
                    isSelected={selectedObjectType === "chakra"}
                    onSelect={() => {
                      setSelectedObjectType("chakra");
                      setActiveInspectorTab("vastu");
                    }}
                    onChangeRotation={(newRot) => {
                      setChakraRotation((newRot - vastuNorthCalibration + 360) % 360);
                      invalidateChakraCalibration();
                      markChakraAdjusted();
                    }}
                    onChangeScale={(newScale) => {
                      setChakraScale(Math.max(0.5, Math.min(3.0, Math.round(newScale * 100) / 100)));
                      invalidateChakraCalibration();
                      markChakraAdjusted();
                    }}
                    onChangePosition={(newX, newY) => {
                      setChakraX(newX);
                      setChakraY(newY);
                      invalidateChakraCalibration();
                      markChakraAdjusted();
                    }}
                    onRotate={() => {
                      setChakraRotation(prev => (prev + 15) % 360);
                      invalidateChakraCalibration();
                      markChakraAdjusted();
                    }}
                    onExpand={() => {
                      setChakraScale(prev => Math.min(3.0, Math.round((prev + 0.15) * 100) / 100));
                      invalidateChakraCalibration();
                      markChakraAdjusted();
                    }}
                    onShrink={() => {
                      setChakraScale(prev => Math.max(0.5, Math.round((prev - 0.15) * 100) / 100));
                      invalidateChakraCalibration();
                      markChakraAdjusted();
                    }}
                  />
                )}

                {/* Drawn floor-plan entities (blank canvas architect layer + blueprint OCR) */}
                {isArchitectDrawMode ? (
                  <>
                    <ArchitectEntityLayer
                      entities={entities}
                      ppm={ppm}
                      selectedEntityId={selectedEntityId}
                      canvasTheme={canvasTheme}
                      eraserActive={isEraserTool(architectTool)}
                      onSelect={handleArchitectEntitySelect}
                      onEntityMouseDown={handleEntityDragStart}
                      onWallEndpointDragStart={handleWallEndpointDragStart}
                      onRotationHandleDragStart={handleRotationHandleDragStart}
                      onResizeHandleDragStart={handleResizeHandleDragStart}
                    />
                    <ArchitectDrawPreview draft={drawDraft} ppm={ppm} />
                  </>
                ) : (
                  entities.map((ent) => {
                  const w = ent.width * ppm;
                  const h = ent.height * ppm;
                  const worldCenter = resolveEntityWorldCenter(ent, blueprint);
                  const cx = worldCenter.x * ppm;
                  const cy = -worldCenter.y * ppm;
                  const isSelected = selectedEntityId === ent.id;
                  const styles: Record<string, { fill: string; stroke: string }> = {
                    Room: { fill: "rgba(59,130,246,0.22)", stroke: "#2563eb" },
                    Wall: { fill: "rgba(100,116,139,0.5)", stroke: "#475569" },
                    Plot: { fill: "rgba(245,158,11,0.12)", stroke: "#d97706" },
                    Door: { fill: "rgba(16,185,129,0.35)", stroke: "#059669" },
                    Window: { fill: "rgba(56,189,248,0.35)", stroke: "#0284c7" },
                  };
                  const style = styles[ent.type] ?? { fill: "rgba(148,163,184,0.3)", stroke: "#64748b" };
                  return (
                    <g
                      key={ent.id}
                      transform={`translate(${cx}, ${cy})`}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntityId(ent.id);
                        setSelectedObjectType("entity");
                      }}
                    >
                      <rect
                        x={-w / 2}
                        y={-h / 2}
                        width={w}
                        height={h}
                        fill={style.fill}
                        stroke={isSelected ? "#10b981" : style.stroke}
                        strokeWidth={isSelected ? 3 : 1.5}
                        rx={ent.type === "Room" ? 2 : 0}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        className="text-[10px] font-semibold pointer-events-none select-none"
                        fill={canvasTheme === "light" ? "#1e293b" : "#e2e8f0"}
                      >
                        {ent.name}
                      </text>
                    </g>
                  );
                })
                )}

                {/* 5. Active Calibration Vector Line overlay */}
                {calibrationPoints.length > 0 && (
                  <g className="pointer-events-none">
                    <circle cx={(calibrationPoints[0].x - viewOriginX - pan.x) / zoom} cy={(calibrationPoints[0].y - viewOriginY - pan.y) / zoom} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    {calibrationPoints.length === 2 && (
                      <line 
                        x1={(calibrationPoints[0].x - viewOriginX - pan.x) / zoom} 
                        y1={(calibrationPoints[0].y - viewOriginY - pan.y) / zoom} 
                        x2={(calibrationPoints[1].x - viewOriginX - pan.x) / zoom} 
                        y2={(calibrationPoints[1].y - viewOriginY - pan.y) / zoom} 
                        stroke="#f59e0b" 
                        strokeWidth="3" 
                        strokeDasharray="6 3" 
                      />
                    )}
                  </g>
                )}

              </g>
            </svg>

          </div>

          {/* BOTTOM STATUS BAR (advanced mode only) */}
          {showAdvancedRibbon && (
          <div className={`h-7 border-t px-4 flex items-center justify-between text-[10px] font-mono shrink-0 select-none ${
            canvasTheme === "light" 
              ? "bg-slate-50 border-slate-200 text-slate-600" 
              : "bg-[#060911] border-slate-800 text-slate-400"
          }`}>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold">
                    <span className={`w-2 h-2 rounded-full ${blueprint ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {blueprint ? `Blueprint: ${blueprint.name}` : "No Blueprint"}
                  </span>
                  <span>|</span>
                  <span>SCALE: {blueprint?.scaleText || "Uncalibrated"}</span>
                  <span>|</span>
                  <span>ZOOM: {(zoom * 100).toFixed(0)}%</span>
                  <span>|</span>
                  <span>GRID: {gridMode.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span>UNITS: {unitSystem.toUpperCase()}</span>
                  <span>|</span>
                  <span>SNAP: <span className={snapToGrid ? "text-emerald-600 font-bold" : "text-slate-400"}>{snapToGrid ? "ON" : "OFF"}</span></span>
                  <span>|</span>
                  <span>SELECTION: {selectedEntity ? 1 : 0}</span>
                  <span>|</span>
                  <span>CURSOR: X: {cursorCoords.x.toFixed(2)}m, Y: {cursorCoords.y.toFixed(2)}m</span>
                </div>
          </div>
          )}

        </div>

        {/* RIGHT PANEL — Advanced inspector only */}
        {!isFocusMode && rightInspectorOpen && showAdvancedRibbon && (
          <RightInspectorPanel
            canvasTheme={canvasTheme}
            activeInspectorTab={activeInspectorTab}
            setActiveInspectorTab={setActiveInspectorTab}
            onClose={() => setRightInspectorOpen(false)}
            blueprint={blueprint}
            setBlueprint={setBlueprint}
            onStartCalibration={startCalibration}
            onReplaceBlueprint={() => fileInputRef.current?.click()}
            layersList={layersList.map(l => ({ ...l, opacity: 1.0 }))}
            setLayersList={setLayersList as any}
            selectedEntity={selectedEntity}
            onUpdateEntity={(id, updates) => setEntities(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))}
            vastuNorthCalibration={vastuNorthCalibration}
            setVastuNorthCalibration={(value) => {
              setVastuNorthCalibration((prev) => {
                const next = typeof value === "function" ? value(prev) : value;
                invalidateChakraCalibration();
                return next;
              });
            }}
            chakraDeployed={chakraDeployed}
            chakraOrientationCalibrated={chakraOrientationCalibrated}
            calibrationMessage={CALIBRATION_BLOCK_MESSAGE}
            onAddVastuChakra={addVastuChakra}
            onConfirmNorthCalibration={confirmNorthCalibration}
            showVastuChakra={showVastuChakra}
            setShowVastuChakra={setShowVastuChakra}
            show16Zones={show16Zones}
            setShow16Zones={setShow16Zones}
            showBrahmasthan={showBrahmasthan}
            setShowBrahmasthan={setShowBrahmasthan}
            showEnergyOverlay={showEnergyOverlay}
            setShowEnergyOverlay={setShowEnergyOverlay}
            showCompass={showCompass}
            setShowCompass={setShowCompass}
            chakraRotation={chakraRotation}
            setChakraRotation={setChakraRotation}
            chakraScale={chakraScale}
            setChakraScale={setChakraScale}
            chakraAspect={chakraAspect}
            setChakraAspect={setChakraAspect}
            chakraOpacity={chakraOpacity}
            setChakraOpacity={setChakraOpacity}
            chakraLocked={chakraLocked}
            setChakraLocked={setChakraLocked}
            onCenterChakra={centerChakraOnBlueprint}
            onSnapChakra={snapChakraToBlueprint}
            onFitChakra={fitChakraToBlueprint}
            onResetChakra={resetChakra}
            onRunVastuAnalysis={handleRunVastuAnalysis}
            analysisResult={analysisResult}
            onOpenAnalysisPanel={() => setIsAnalysisPanelOpen(true)}
            onAutoDetectEntities={handleAutoDetectEntities}
          />
        )}

      </div>

      {/* ANALYSIS IN PROGRESS OVERLAY */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-[60] bg-black/40 flex items-center justify-center pointer-events-none">
          <div className={`px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-2 text-sm font-bold ${
            canvasTheme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-[#070b13] border-slate-700 text-slate-100"
          }`}>
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>{isOcrPhase ? "Detecting rooms from blueprint…" : "Running Vastu Analysis…"}</span>
          </div>
        </div>
      )}

      {/* SCALE CALIBRATION MODAL */}
      {showCalibrationModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 font-sans">
          <div className={`w-full max-w-sm border rounded-xl overflow-hidden shadow-2xl p-5 ${
            canvasTheme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-[#070b13] border-slate-800 text-slate-200"
          }`}>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Ruler className="w-4 h-4" />
              <span>Calibrate Blueprint Scale</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Enter the known real-world distance between Point A and Point B.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">Real-World Distance</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={realDistanceInput}
                    onChange={(e) => setRealDistanceInput(e.target.value)}
                    placeholder="e.g. 3000"
                    className={`flex-1 px-3 py-1.5 border rounded-lg text-xs font-mono ${
                      canvasTheme === "light" ? "bg-slate-50 border-slate-300" : "bg-slate-900 border-slate-800 text-white"
                    }`}
                    autoFocus
                  />
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value as "mm" | "m" | "ft")}
                    className={`px-3 py-1.5 border rounded-lg text-xs font-mono ${
                      canvasTheme === "light" ? "bg-slate-50 border-slate-300" : "bg-slate-900 border-slate-800 text-white"
                    }`}
                  >
                    <option value="mm">mm</option>
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold">
              <button 
                onClick={cancelCalibration} 
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={submitCalibration} 
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-xs cursor-pointer"
              >
                Apply Calibration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMAND PALETTE Ctrl+K OVERLAY MODAL */}
      {isCommandPaletteOpen && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 font-mono">
          <div className={`w-full max-w-md border rounded-md overflow-hidden shadow-2xl ${
            canvasTheme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-[#070b13] border-slate-800 text-slate-200"
          }`}>
            <div className="p-3 border-b flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-500" />
              <input 
                type="text" 
                value={cmdSearchQuery}
                onChange={(e) => setCmdSearchQuery(e.target.value)}
                placeholder="Type a CAD command or shortcut..." 
                className="flex-1 bg-transparent border-none outline-none text-[11px]"
                autoFocus
              />
              <button onClick={() => setIsCommandPaletteOpen(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
              {[
                { label: "Import Blueprint (PDF / PNG / JPG)", action: () => fileInputRef.current?.click() },
                { label: "Calibrate Blueprint Scale", action: () => startCalibration() },
                { label: "Zoom Extents (Fit All)", action: handleZoomFit },
                { label: "Switch to Plain White Canvas", action: () => setGridMode("plain") },
                { label: "Switch to Light Engineering Grid", action: () => setGridMode("light") },
                { label: "Switch to Blueprint Grid", action: () => setGridMode("blueprint") },
                { label: "Toggle Focus Mode (F11)", action: () => setIsFocusMode(prev => !prev) },
                { label: "Export Blueprint as PNG", action: handleExportPNG },
                { label: "Export Blueprint as PDF", action: handlePrintPDF },
              ]
                .filter(cmd => cmd.label.toLowerCase().includes(cmdSearchQuery.toLowerCase()))
                .map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => { cmd.action(); setIsCommandPaletteOpen(false); }}
                    className="w-full text-left p-2 hover:bg-emerald-600 hover:text-white rounded text-[10px] flex justify-between cursor-pointer"
                  >
                    <span>{cmd.label}</span>
                    <CornerDownRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* RECENT PROJECTS MODAL */}
      {showRecentProjectsModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 font-sans">
          <div className={`w-full max-w-md border rounded-xl overflow-hidden shadow-2xl p-5 ${
            canvasTheme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-[#070b13] border-slate-800 text-slate-200"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-500" />
                <span>Recent Projects</span>
              </h3>
              <button onClick={() => setShowRecentProjectsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {["Villa Blueprint Residence - Floor 1", "Commercial Mall Site Plan", "Duplex Apartment Vastu Blueprint"].map((proj, idx) => (
                <div key={idx} onClick={() => setShowRecentProjectsModal(false)} className="p-2.5 rounded-lg border hover:bg-emerald-500/10 cursor-pointer flex justify-between items-center">
                  <span className="font-semibold">{proj}</span>
                  <span className="text-[9px] text-slate-400">Modified 2h ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showKeyboardShortcutsModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 font-sans">
          <div className={`w-full max-w-md border rounded-xl overflow-hidden shadow-2xl p-5 ${
            canvasTheme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-[#070b13] border-slate-800 text-slate-200"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-500" />
                <span>Keyboard Shortcuts</span>
              </h3>
              <button onClick={() => setShowKeyboardShortcutsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              {[
                { key: "Ctrl + N", desc: "New Project" },
                { key: "Ctrl + O", desc: "Open / Import Blueprint" },
                { key: "Ctrl + S", desc: "Save Project" },
                { key: "Ctrl + Z", desc: "Undo" },
                { key: "Ctrl + Y", desc: "Redo" },
                { key: "Ctrl + C / V", desc: "Copy / Paste" },
                { key: "Delete", desc: "Delete Selected Object" },
                { key: "Ctrl + 0", desc: "Zoom To Fit" },
                { key: "F11", desc: "Toggle Full Screen Focus" },
                { key: "ESC", desc: "Close Menus & Cancel Active Tool" },
              ].map((s, idx) => (
                <div key={idx} className="flex justify-between p-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.key}</span>
                  <span className="text-slate-500">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {showAboutModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 font-sans">
          <div className={`w-full max-w-sm border rounded-xl overflow-hidden shadow-2xl p-5 text-center ${
            canvasTheme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-[#070b13] border-slate-800 text-slate-200"
          }`}>
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">URJAFLUX CAD</h3>
            <p className="text-xs text-slate-500 mb-4">Enterprise Blueprint & Spatial Analysis Engine v3.2</p>
            <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
              Designed for professional architects, civil engineers, and Vastu consultants.
            </p>
            <button onClick={() => setShowAboutModal(false)} className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}

      {/* PREFERENCES MODAL */}
      {showPreferencesModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 font-sans">
          <div className={`w-full max-w-md border rounded-xl overflow-hidden shadow-2xl p-5 ${
            canvasTheme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-[#070b13] border-slate-800 text-slate-200"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Preferences</span>
              </h3>
              <button onClick={() => setShowPreferencesModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span>Default Measurement Unit</span>
                <select 
                  value={unitSystem} 
                  onChange={(e) => setUnitSystem(e.target.value as "mm" | "m" | "ft")}
                  className="p-1 border rounded bg-transparent font-mono"
                >
                  <option value="m">Meters (m)</option>
                  <option value="mm">Millimeters (mm)</option>
                  <option value="ft">Feet (ft)</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span>Default Grid Appearance</span>
                <select 
                  value={gridMode} 
                  onChange={(e) => setGridMode(e.target.value as CanvasGridMode)}
                  className="p-1 border rounded bg-transparent font-mono"
                >
                  <option value="plain">Plain White</option>
                  <option value="light">Light Engineering Grid</option>
                  <option value="blueprint">Blueprint Grid</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span>Snap To Grid</span>
                <input 
                  type="checkbox" 
                  checked={snapToGrid} 
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowPreferencesModal(false)} className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VASTU ANALYSIS RESULTS AUDIT PANEL */}
      <VastuAnalysisResultsPanel
        isOpen={isAnalysisPanelOpen}
        onClose={() => setIsAnalysisPanelOpen(false)}
        result={analysisResult}
        onReRun={handleRunVastuAnalysis}
        onGenerateReport={handleGenerateReport}
        onAutoDetectEntities={handleAutoDetectEntities}
        canvasTheme={canvasTheme}
      />

      {/* KIE SPRINT-2 MODULE 1: CLIENT DISCOVERY MODAL */}
      <ClientDiscoveryModal
        isOpen={isClientDiscoveryModalOpen}
        onClose={() => setIsClientDiscoveryModalOpen(false)}
        onSuccess={() => {
          logAction("Client Discovery Engine completed successfully! Executing Vastu Analysis...");
          handleRunVastuAnalysis();
        }}
      />

    </div>
  );
}
