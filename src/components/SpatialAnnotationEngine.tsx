import { engineAdapter } from "../core/adapters/EngineAdapter";
import { MasterChakraObject } from "../core/usom/MasterChakraObject";
import { HandleCalculator, HandleType } from "../core/usom/HandleCalculator";
import { ChakraLibraryModal } from "./ChakraLibraryModal";
import { MasterChakraInspectorPanel } from "./MasterChakraInspectorPanel";
import { LibraryItem } from "../core/library/ObjectLibrary";

import { CompassHUD } from "../spatial/HUD/CompassHUD/CompassHUD";
import { AnnotationItem, SpatialAnnotationEngineProps, SymbolTemplate, SYMBOL_TEMPLATES } from "../spatial/SpatialTypes";
import React, { useState, useRef, useEffect } from "react";
import { defaultZoneEngine } from "../core/spatial/zoneEngine";
import {
  MousePointer,
  Hand,
  Search,
  Ruler,
  MessageSquare,
  Square,
  Box,
  Trash2,
  Lock,
  Unlock,
  RotateCcw,
  RotateCw,
  Plus,
  Minus,
  X,
  Info,
  Flame,
  Bed,
  DoorOpen,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Save,
  Grid3X3,
  Move,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Maximize,
  Compass,
  FileText,
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  Settings,
  ShieldCheck,
  UploadCloud,
  Upload,
  Pin,
  LogOut,
  Sparkles,
  Briefcase,
  CheckCircle,
  Sliders
} from "lucide-react";
import { Property, Client } from "../types/app";
import UrjaFluxReportModal from "./vastu/UrjaFluxReportModal";

export default function SpatialAnnotationEngine({
  properties,
  clients,
  activeProperty,
  onSetActiveProperty,
  onUpdatePropertyOffset,
  pixelScaleRatio = 25, // Default 1px = 25mm
  scaleUnit = "Meters",
  compassRotation = 15, // Default cached rotation
  annotations: propAnnotations,
  onAnnotationsChange,
  layers: propLayers,
  onLayersChange,
  zoom: propZoom,
  onZoomChange,
  pan: propPan,
  onPanChange,
  measurePoints: propMeasurePoints,
  onMeasurePointsChange,
  onNavigate
}: SpatialAnnotationEngineProps) {

  // --- ANNOTATIONS INITIAL DEFAULTS SEEDS ---
  const [localAnnotations, setLocalAnnotations] = useState<AnnotationItem[]>([]);

  const annotations = propAnnotations !== undefined ? propAnnotations : localAnnotations;
  const setAnnotations = (val: AnnotationItem[] | ((prev: AnnotationItem[]) => AnnotationItem[])) => {

    let next: AnnotationItem[];
    if (typeof val === "function") {
      next = val(annotations);
    } else {
      next = val;
    }

    if (onAnnotationsChange) {

      onAnnotationsChange(next);
    } else {
      setLocalAnnotations(next);
    }
  };

  // --- NAVIGATION STATE ENGINE ---
  const [localZoom, setLocalZoom] = useState<number>(1.1);
  const zoom = propZoom !== undefined ? propZoom : localZoom;
  const setZoom = (val: number | ((prev: number) => number)) => {
    if (typeof val === "function") {
      const next = val(zoom);
      if (onZoomChange) {
        onZoomChange(next);
      } else {
        setLocalZoom(next);
      }
    } else {
      if (onZoomChange) {
        onZoomChange(val);
      } else {
        setLocalZoom(val);
      }
    }
  };

  const [localPan, setLocalPan] = useState<{ x: number; y: number }>({ x: 120, y: 60 });
  const pan = propPan !== undefined ? propPan : localPan;
  const setPan = (val: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    if (typeof val === "function") {
      const next = val(pan);
      if (onPanChange) {
        onPanChange(next);
      } else {
        setLocalPan(next);
      }
    } else {
      if (onPanChange) {
        onPanChange(val);
      } else {
        setLocalPan(val);
      }
    }
  };

  const [activeTool, setActiveTool] = useState<"select" | "pan" | "zoom" | "room" | "symbol" | "measure" | "note" | "chakra">("select");
  const [selectedSymbolType, setSelectedSymbolType] = useState<"bed" | "stove" | "door" | "toilet" | "safe" | "watertank" | "plants" | "heavy" | "puja">("bed");

  const userEmail = localStorage.getItem("urjaflux_user_email") || "default";

  // Sidebar states
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(() => {
    const saved = localStorage.getItem(`vastu_left_panel_${userEmail}`);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(() => {
    const saved = localStorage.getItem(`vastu_right_panel_${userEmail}`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // SPRINT 18 STATE ENGINE FOR THE REDESIGNED CAD STUDIO
  const [wizardStep, setWizardStep] = useState<string>("project");
  
  // SPRINT 19 MASTER VASTU MODULE WORKFLOW
  const [vastuProjectMode, setVastuProjectMode] = useState<"analyze" | "design" | null>(null);
  const [plotWidth, setPlotWidth] = useState<number>(40);
  const [plotLength, setPlotLength] = useState<number>(60);
  const [plotFacing, setPlotFacing] = useState<string>("North");
  const [boundarySetback, setBoundarySetback] = useState<number>(4);
  const [activeFloorType, setActiveFloorType] = useState<string>("Ground Floor");

  const [uploadedDrawings, setUploadedDrawings] = useState<Array<{ name: string; url: string; floor: string }>>([
    { name: "Ground Floorplan.png", url: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?auto=format&fit=crop&q=80&w=1200", floor: "Ground Floor" }
  ]);
  const [activeDrawingIndex, setActiveDrawingIndex] = useState<number>(0);

  // Helper to get active step list dynamically based on mode
  const getStepsForMode = () => {
    if (vastuProjectMode === "design") {
      return [
        { step: "project", label: "Plot Details", icon: Briefcase },
        { step: "plot_size", label: "Plot & Setbacks", icon: Square },
        { step: "design_north", label: "North Orientation", icon: Compass },
        { step: "design_chakra", label: "Vastu Chakra Place", icon: Layers },
        { step: "assisted_layout", label: "AI Assisted Layout", icon: Sparkles },
        { step: "design_report", label: "Final Plan Report", icon: FileText }
      ];
    } else {
      return [
        { step: "project", label: "New Project Info", icon: Briefcase },
        { step: "blueprint", label: "Upload Blueprint", icon: UploadCloud },
        { step: "ai_recognition", label: "AI Recognition", icon: Search },
        { step: "north_detection", label: "North Detection", icon: Compass },
        { step: "calibration", label: "Calibration Studio", icon: Maximize },
        { step: "ai_analysis", label: "AI Analysis", icon: Activity },
        { step: "evidence", label: "Evidence Finder", icon: CheckCircle },
        { step: "remedies", label: "Vastu Remedies", icon: Sliders },
        { step: "report", label: "Professional Report", icon: FileText }
      ];
    }
  };

  // Helper to map angles to 8 principal zones
  const getZoneFromAngle = (angle: number): "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" => {
    const normAngle = (angle + 360) % 360;
    if (normAngle >= 337.5 || normAngle < 22.5) return "N";
    if (normAngle >= 22.5 && normAngle < 67.5) return "NE";
    if (normAngle >= 67.5 && normAngle < 112.5) return "E";
    if (normAngle >= 112.5 && normAngle < 157.5) return "SE";
    if (normAngle >= 157.5 && normAngle < 202.5) return "S";
    if (normAngle >= 202.5 && normAngle < 247.5) return "SW";
    if (normAngle >= 247.5 && normAngle < 292.5) return "W";
    return "NW";
  };

  // Helper for Mode B live Vastu room placement warning or validation
  const getRoomValidation = (room: any) => {
    const rx = room.x + (room.width || 120) / 2;
    const ry = room.y + (room.height || 90) / 2;
    const cx = chakraState.x;
    const cy = chakraState.y;
    
    const dx = rx - cx;
    const dy = ry - cy;
    const distToCenter = Math.sqrt(dx * dx + dy * dy);
    const isBrahmasthan = distToCenter < 55;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    angle = (angle - chakraState.rotation + 360) % 360;
    const zone: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "Center" = isBrahmasthan ? "Center" : getZoneFromAngle(angle);

    let status: "success" | "warning" | "error" = "success";
    let message = "";
    const nameLower = room.name.toLowerCase();

    if (nameLower.includes("kitchen") || room.symbolType === "stove") {
      if (zone === "SE") {
        status = "success";
        message = "Kitchen in South-East (Agni Zone) is optimal. Ignites radiant prosperity & culinary balance.";
      } else if (zone === "NE" || zone === "SW") {
        status = "error";
        message = `Kitchen in ${zone} clashes Fire-Water. Creates severe mental/financial constraints. Relocate immediately.`;
      } else {
        status = "warning";
        message = `Kitchen in ${zone} is sub-optimal. South-East or North-West are more traditional.`;
      }
    } else if (nameLower.includes("bedroom") || nameLower.includes("master") || room.symbolType === "bed") {
      if (zone === "SW") {
        status = "success";
        message = "Master Bedroom in South-West (Nairutya) provides ground stability, strong leadership, and peace.";
      } else if (zone === "NE") {
        status = "error";
        message = "Master Bedroom in North-East (Water element) is highly defective. Disrupts health and marital harmony.";
      } else {
        status = "warning";
        message = `Bedroom in ${zone} is acceptable, but South-West is preferred for family heads.`;
      }
    } else if (nameLower.includes("puja") || nameLower.includes("pooja") || room.symbolType === "puja") {
      if (zone === "NE" || zone === "N" || zone === "E") {
        status = "success";
        message = `Pooja Room in ${zone} (Ishanya) is extremely holy! Receives celestial cosmic vibes. High peace & wisdom.`;
      } else if (zone === "SW" || zone === "SE") {
        status = "error";
        message = `Pooja Room in ${zone} is prohibited. Heavy energetic conflicts, restricts material/spiritual growth.`;
      } else {
        status = "warning";
        message = `Pooja Room in ${zone} is non-ideal. Relocate to North-East sector if possible.`;
      }
    } else if (nameLower.includes("toilet") || room.symbolType === "toilet") {
      if (zone === "NW" || zone === "W") {
        status = "success";
        message = `Toilet in ${zone} is fully compliant. Directs waste discharge smoothly out of the property's energy grid.`;
      } else if (zone === "NE" || zone === "SW" || zone === "Center") {
        status = "error";
        message = `Toilet in ${zone} is dangerous! Drains financial stability and spiritual flow. High energetic threat.`;
      } else {
        status = "warning";
        message = `Toilet in ${zone} drains positive chi. Keep closed, install brass wire strip or select North-West.`;
      }
    } else if (nameLower.includes("borewell") || room.symbolType === "watertank") {
      if (zone === "NE" || zone === "N") {
        status = "success";
        message = `Water source in ${zone} is excellent. Attracts pure flowing positive streams of finance & wellness.`;
      } else if (zone === "SW" || zone === "SE") {
        status = "error";
        message = `Borewell in ${zone} drains earth/fire stability. Leads to business loss or heavy fire clashes.`;
      } else {
        status = "warning";
        message = `Borewell in ${zone} is non-auspicious. North or North-East are ideal.`;
      }
    } else {
      status = "success";
      message = `Room is placed in ${zone} zone. Harmoniously aligned.`;
    }

    return { zone, status, message };
  };

  const handlePlaceRoomTemplate = (name: string, symbolType: string, w = 110, h = 80) => {
    const randomId = `ann_${Date.now()}`;
    const cx = chakraState.x;
    const cy = chakraState.y;

    let subType = "generic";
    let widthFt = 10;
    let lengthFt = 12;
    let heightFt = 10;
    let thicknessInches = 9;

    if (symbolType === "bed") {
      subType = "master_bedroom";
      widthFt = 12;
      lengthFt = 14;
      heightFt = 10;
    } else if (symbolType === "stove") {
      subType = "kitchen";
      widthFt = 10;
      lengthFt = 10;
      heightFt = 10;
    } else if (symbolType === "puja") {
      subType = "puja";
      widthFt = 6;
      lengthFt = 8;
      heightFt = 10;
      thicknessInches = 4.5;
    } else if (symbolType === "toilet") {
      subType = "toilet";
      widthFt = 6;
      lengthFt = 7;
      heightFt = 10;
      thicknessInches = 4.5;
    } else if (symbolType === "watertank") {
      subType = "borewell";
      widthFt = 8;
      lengthFt = 8;
      heightFt = 8;
    } else if (symbolType === "door" || name.toLowerCase().includes("gate") || name.toLowerCase().includes("door")) {
      subType = "mahadwara";
      widthFt = 4;
      lengthFt = 1;
      heightFt = 8;
    } else if (name.toLowerCase().includes("wall")) {
      subType = "load_bearing_wall";
      widthFt = 1;
      lengthFt = 15;
      heightFt = 10;
    } else if (name.toLowerCase().includes("window")) {
      subType = "bay_window";
      widthFt = 5;
      lengthFt = 1;
      heightFt = 4;
    }

    const newItem: AnnotationItem = {
      id: randomId,
      type: "room",
      name: name,
      symbolType: symbolType as any,
      subType,
      widthFt,
      lengthFt,
      heightFt,
      thicknessInches,
      remediesApplied: [],
      x: Math.round(cx - w / 2 + (Math.random() * 40 - 20)),
      y: Math.round(cy - h / 2 + (Math.random() * 40 - 20)),
      width: w,
      height: h,
      color: symbolType === "stove" ? "text-rose-400" : symbolType === "bed" ? "text-emerald-400" : symbolType === "puja" ? "text-amber-400" : "text-sky-400",
      bg: symbolType === "stove" ? "bg-rose-950/20" : symbolType === "bed" ? "bg-emerald-950/20" : symbolType === "puja" ? "bg-amber-950/20" : "bg-sky-950/20",
      border: symbolType === "stove" ? "border-rose-500/40" : symbolType === "bed" ? "border-emerald-500/40" : symbolType === "puja" ? "border-amber-500/40" : "border-sky-500/40",
      rotation: 0,
      notes: `${name} placed in custom layout planning.`,
      element: symbolType === "stove" ? "Fire" : symbolType === "bed" ? "Earth" : symbolType === "puja" ? "Water" : "None",
      vastuZone: calculateVastuZone(cx, cy),
      customRating: 90
    };

    const next = [...annotations, newItem];
    setAnnotations(next);
    setSelectedId(newItem.id);
    commitToHistory(next);
    showToast(`Placed ${name} template onto empty plot`);
  };

  const [leftPanelPinned, setLeftPanelPinned] = useState(false);
  const [rightPanelPinned, setRightPanelPinned] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showUrjaFluxModal, setShowUrjaFluxModal] = useState(false);

  const [isUserInactive, setIsUserInactive] = useState(false);
  useEffect(() => {
    let timeoutId: any;
    const handleActivity = () => {
      setIsUserInactive(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsUserInactive(true);
      }, 5000); // 5 seconds of inactivity
    };
    
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    handleActivity();
    
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(`vastu_left_panel_${userEmail}`, JSON.stringify(isLeftPanelOpen));
  }, [isLeftPanelOpen, userEmail]);

  useEffect(() => {
    localStorage.setItem(`vastu_right_panel_${userEmail}`, JSON.stringify(isRightPanelOpen));
  }, [isRightPanelOpen, userEmail]);
  
  // Layer controls
  const [localLayers, setLocalLayers] = useState({
    blueprint: true,
    grid: true,
    rooms: true,
    symbols: true,
    compass: true,               // SPRINT 16B Interactive Compass widget overlay
    directionChakra: true,       // SPRINT 16B Vastu Direction Chakra
    zones16: true,               // SPRINT 16B 16 Zones
    entrances32: true,           // SPRINT 16B 32 Entrances
    devta45: true,               // SPRINT 16B 45 Devta
    panchatattva: true,          // SPRINT 16B Panchatattva Element Layer
    brahmasthan: false,
    measurements: true
  });
  const layers = propLayers !== undefined ? propLayers : localLayers;
  const setLayers = (val: any | ((prev: any) => any)) => {
    if (typeof val === "function") {
      const next = val(layers);
      if (onLayersChange) {
        onLayersChange(next);
      } else {
        setLocalLayers(next);
      }
    } else {
      if (onLayersChange) {
        onLayersChange(val);
      } else {
        setLocalLayers(val);
      }
    }
  };

  // Selected item ID
  const [selectedId, setSelectedId] = useState<string | null>("ann_1");
  const [chakraSelectionMode, setChakraSelectionMode] = useState<"move" | "rotate">("move");

  // History Undo/Redo Engine Stack
  const [history, setHistory] = useState<AnnotationItem[][]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);

  // Measure Tape Coordinates
  const [localMeasurePoints, setLocalMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const measurePoints = propMeasurePoints !== undefined ? propMeasurePoints : localMeasurePoints;
  const setMeasurePoints = (val: { x: number; y: number }[] | ((prev: { x: number; y: number }[]) => { x: number; y: number }[])) => {
    if (typeof val === "function") {
      const next = val(measurePoints);
      if (onMeasurePointsChange) {
        onMeasurePointsChange(next);
      } else {
        setLocalMeasurePoints(next);
      }
    } else {
      if (onMeasurePointsChange) {
        onMeasurePointsChange(val);
      } else {
        setLocalMeasurePoints(val);
      }
    }
  };
  const [tempPoint, setTempPoint] = useState<{ x: number; y: number } | null>(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Hover indicator
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverCoords, setHoverCoords] = useState({ x: 0, y: 0 });
  
  // Zone Inspector
  const [inspectedZone, setInspectedZone] = useState<any>(null);

  // Dragging states
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [elementDragStartOffset, setElementDragStartOffset] = useState({ x: 0, y: 0 });
  const [isResizingRoom, setIsResizingRoom] = useState<boolean>(false);
  const [roomResizeDirection, setRoomResizeDirection] = useState<"br" | null>(null); // bottom-right resize

  // --- SPRINT 15 CHAKRA INTERACTIVE STATE ---
  const [chakraState, setChakraState] = useState({
    x: 300,
    y: 230,
    rotation: compassRotation || 0,
    isLocked: false,
    snapEnabled: true,
    scale: 0.8,
    opacity: 1,
  });

  const [isVastuChakraActive, setIsVastuChakraActive] = useState(false);
  const [customChakraUrl, setCustomChakraUrl] = useState<string | null>(null);
  const [chakraLibrary, setChakraLibrary] = useState<Array<{id: string, name: string, url: string}>>([]);
  const [showChakraLibrary, setShowChakraLibrary] = useState(false);
  // --- M3A Engine Bridge ---
  const [engineChakra, setEngineChakra] = useState<any>(null);

  useEffect(() => {
    const engine = engineAdapter.getEngine();
    if (!engine) {
      const t = setTimeout(() => setChakraState(c => ({...c})), 100);
      return () => clearTimeout(t);
    }
    
    const newChakra = new MasterChakraObject("master-chakra", "Master Chakra", {
      position: { x: chakraState.x, y: chakraState.y },
      rotation: chakraState.rotation,
      scale: { x: chakraState.scale, y: chakraState.scale }
    }, 420);
    newChakra.isLocked = chakraState.isLocked;

    let engineObj = engineAdapter.getObject("master-chakra");
    if (!engineObj) {
      engine.objects._add(newChakra);
      engineObj = engineAdapter.getObject("master-chakra")!;
    } else {
      engine.objects._update("master-chakra", newChakra);
      engineObj = engineAdapter.getObject("master-chakra")!;
    }
    
    // Rehydrate into a class instance so getters work
    const hydratedChakra = new MasterChakraObject(
      engineObj.id, 
      engineObj.name, 
      engineObj.transform, 
      420
    );
    hydratedChakra.isLocked = engineObj.isLocked;
    
    setEngineChakra(hydratedChakra);
  }, [chakraState]);

  const handleSelectLibraryObject = (item: LibraryItem) => {
    const engine = engineAdapter.getEngine();
    const centerPos = { x: bgImageSize.width / 2 || 300, y: bgImageSize.height / 2 || 225 };
    
    if (engine?.objects) {
      const createdObj = engine.objects.createFromLibrary(item, centerPos);
      console.log("[ObjectEngine] Created object from library:", createdObj);
    }

    if (item.category === 'chakras' || item.metadata?.type === 'CHAKRA') {
      setIsVastuChakraActive(true);
      setChakraState(prev => ({
        ...prev,
        scale: item.defaultScale || prev.scale,
      }));

      if (item.metadata?.layers && Array.isArray(item.metadata.layers)) {
        setLayers(prev => {
          const next = { ...prev };
          item.metadata.layers.forEach((lyr: string) => {
            if (lyr in next) {
              (next as any)[lyr] = true;
            }
          });
          return next;
        });
      }
    }

    showToast(`Instantiated ${item.name} (v${item.version}) via ObjectEngine`);
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  useEffect(() => {
    if (activeProperty) {
      const offset = activeProperty.directionsOffset !== undefined ? activeProperty.directionsOffset : (compassRotation || 0);
      setChakraState(prev => ({ ...prev, rotation: offset }));
    }
  }, [activeProperty, compassRotation]);

  useEffect(() => {
    defaultZoneEngine.setNorth(chakraState.rotation);
  }, [chakraState.rotation]);

  const [isDraggingChakra, setIsDraggingChakra] = useState(false);
  const [isRotatingChakra, setIsRotatingChakra] = useState(false);
  const [isResizingChakra, setIsResizingChakra] = useState(false);
  const [chakraResizeStart, setChakraResizeStart] = useState({ scale: 1, dist: 0 });

  const [chakraInteractionStart, setChakraInteractionStart] = useState({ angle: 0, rotation: 0, x: 0, y: 0, scale: 1 });
  const [chakraDragOffset, setChakraDragOffset] = useState({ x: 0, y: 0 });

  const [layerConfigs, setLayerConfigs] = useState({
    blueprint: { locked: false, opacity: 0.8 },
    directionChakra: { locked: false, opacity: 1.0 },
    zones16: { locked: true, opacity: 1.0 },
    entrances32: { locked: true, opacity: 1.0 },
    devta45: { locked: true, opacity: 1.0 },
    panchatattva: { locked: true, opacity: 1.0 }
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- DYNAMIC BACKGROUND BLUEPRINT CORRESPONDENCE ---
  const [bgImage, setBgImage] = useState({
    name: "",
    url: ""
  });

  const [bgImageSize, setBgImageSize] = useState({ width: 600, height: 450 });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const blueprintImgRef = useRef<HTMLImageElement>(null);

  // Global window pointer listener for smooth Chakra drag, rotate, and scale
  useEffect(() => {
    if (!isDraggingChakra && !isRotatingChakra && !isResizingChakra) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const mainEl = document.querySelector("main");
      if (!mainEl) return;
      const rect = mainEl.getBoundingClientRect();
      const coords = {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      };

      if (isDraggingChakra) {
        let nextX = coords.x - chakraDragOffset.x;
        let nextY = coords.y - chakraDragOffset.y;
        
        if (chakraState.snapEnabled) {
          const centerX = bgImageSize.width / 2;
          const centerY = bgImageSize.height / 2;
          if (Math.abs(nextX - centerX) < 15) nextX = centerX;
          if (Math.abs(nextY - centerY) < 15) nextY = centerY;
        }
        
        setChakraState(prev => ({ ...prev, x: nextX, y: nextY }));
      } else if (isRotatingChakra) {
        const dx = coords.x - chakraState.x;
        const dy = coords.y - chakraState.y;
        const currentAngleRad = Math.atan2(dy, dx);
        let currentAngleDeg = (currentAngleRad * 180) / Math.PI;
        
        let deltaAngle = currentAngleDeg - chakraInteractionStart.angle;
        while (deltaAngle < -180) deltaAngle += 360;
        while (deltaAngle > 180) deltaAngle -= 360;
        
        let newRotation = (chakraInteractionStart.rotation + deltaAngle) % 360;
        if (newRotation < 0) newRotation += 360;
        
        const roundedRotation = Math.round(newRotation);
        setChakraState(prev => ({ ...prev, rotation: prev.isLocked ? prev.rotation : roundedRotation }));
        if (activeProperty && onUpdatePropertyOffset && !chakraState.isLocked) {
          onUpdatePropertyOffset(activeProperty.id, roundedRotation);
        }
      } else if (isResizingChakra) {
        const dx = coords.x - chakraState.x;
        const dy = coords.y - chakraState.y;
        const currentDist = Math.sqrt(dx * dx + dy * dy);
        if (chakraResizeStart.dist > 0) {
          const ratio = currentDist / chakraResizeStart.dist;
          const newScale = Math.max(0.1, Math.min(5.0, chakraResizeStart.scale * ratio));
          setChakraState(prev => ({ ...prev, scale: prev.isLocked ? prev.scale : newScale }));
        }
      }
    };

    const handleGlobalPointerUp = () => {
      setIsDraggingChakra(false);
      setIsRotatingChakra(false);
      setIsResizingChakra(false);
    };

    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [isDraggingChakra, isRotatingChakra, isResizingChakra, chakraDragOffset, chakraInteractionStart, chakraResizeStart, chakraState.x, chakraState.y, chakraState.snapEnabled, pan, zoom, bgImageSize, activeProperty, onUpdatePropertyOffset]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const width = img.naturalWidth || img.clientWidth || 600;
    const height = img.naturalHeight || img.clientHeight || 450;
    setBgImageSize({ width, height });
    
    // Lock the chakra directly to the geometric center of the blueprint image by default
    setChakraState(prev => ({
      ...prev,
      x: width / 2,
      y: height / 2
    }));

    // Auto-center the blueprint in the canvas
    const mainEl = document.querySelector('main');
    if (mainEl) {
      const rect = mainEl.getBoundingClientRect();
      const canvasW = rect.width;
      const canvasH = rect.height;
      
      const zoomFitX = (canvasW * 0.8) / width;
      const zoomFitY = (canvasH * 0.8) / height;
      const initialZoom = Math.min(Math.min(zoomFitX, zoomFitY), 1.5);
      
      setZoom(initialZoom);
      setPan({
        x: (canvasW - width * initialZoom) / 2,
        y: (canvasH - height * initialZoom) / 2
      });
    }
  };

  const [prevPropertyId, setPrevPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (activeProperty) {
      if (activeProperty.id !== prevPropertyId) {
        setPrevPropertyId(activeProperty.id);
        setIsVastuChakraActive(false);
      }
      setBgImage({
        name: `${activeProperty.name.replace(/\s+/g, "_")}_Blueprint.jpg`,
        url: activeProperty.floorplanUrl
      });
      showToast(`Loaded blueprint for ${activeProperty.name}`);
    } else {
      setBgImage({
        name: "",
        url: ""
      });
      setPrevPropertyId(null);
      setIsVastuChakraActive(false);
    }
  }, [activeProperty, prevPropertyId]);

  useEffect(() => {
    if (!bgImage.url && ["north", "analysis", "ai_audit", "report"].includes(wizardStep)) {
      setWizardStep("blueprint");
    }
  }, [bgImage.url, wizardStep]);

  // Toast dispatch helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };


  // --- SPRINT 5 ANNOTATION HISTORY MANAGER ---
  const commitToHistory = (nextAnnotations: AnnotationItem[]) => {
    const nextHistory = history.slice(0, historyPointer + 1);
    nextHistory.push(JSON.parse(JSON.stringify(nextAnnotations)));
    setHistory(nextHistory);
    setHistoryPointer(nextHistory.length - 1);
  };

  useEffect(() => {
    // Register initial state as history point zero
    if (history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(annotations))]);
      setHistoryPointer(0);
    }
  }, []);

  const triggerUndo = () => {
    if (historyPointer > 0) {
      const nextPointer = historyPointer - 1;
      setHistoryPointer(nextPointer);
      setAnnotations(JSON.parse(JSON.stringify(history[nextPointer])));
      setSelectedId(null);
      showToast("Undone last annotation modification");
    } else {
      showToast("Annotation history: at beginning of stack");
    }
  };

  const triggerRedo = () => {
    if (historyPointer < history.length - 1) {
      const nextPointer = historyPointer + 1;
      setHistoryPointer(nextPointer);
      setAnnotations(JSON.parse(JSON.stringify(history[nextPointer])));
      setSelectedId(null);
      showToast("Redone annotations modification");
    } else {
      showToast("Annotation history: at end of stack");
    }
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const getSectorPath = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    let s = (startAngle % 360 + 360) % 360;
    let e = (endAngle % 360 + 360) % 360;
    if (s === e) return "";
    
    const isLargeArc = (e - s + 360) % 360 > 180 ? 1 : 0;
    const startPt = polarToCartesian(x, y, radius, s);
    const endPt = polarToCartesian(x, y, radius, e);
    
    return [
      "M", x, y,
      "L", startPt.x, startPt.y,
      "A", radius, radius, 0, isLargeArc, 1, endPt.x, endPt.y,
      "Z"
    ].join(" ");
  };

  // --- METRIC MATH CONVERSION HELPERS ---
  const convertPxToMetric = (px: number) => {
    const mm = px * pixelScaleRatio;
    if (scaleUnit === "Millimeters") {
      return `${mm.toFixed(0)} mm`;
    } else if (scaleUnit === "Feet") {
      const ft = mm * 0.00328084;
      return `${ft.toFixed(2)} ft`;
    } else {
      const m = mm / 1000;
      return `${m.toFixed(2)} m`;
    }
  };

  const calculateArea = (w: number, h: number) => {
    const areaSqMm = (w * pixelScaleRatio) * (h * pixelScaleRatio);
    if (scaleUnit === "Millimeters") {
      return `${areaSqMm.toLocaleString(undefined, { maximumFractionDigits: 0 })} mm²`;
    } else if (scaleUnit === "Feet") {
      const areaSqFt = areaSqMm * 0.0000107639;
      return `${areaSqFt.toFixed(1)} sq ft`;
    } else {
      const areaSqM = areaSqMm / 1000000;
      return `${areaSqM.toFixed(2)} m²`;
    }
  };

  // --- SPRINT 5: AUTOMATED REAL-TIME VASTU COMPLIANCE ENGINE ---
  // Calculates the Vastu sector (NE, E, SE, S, SW, W, NW, N, Center) based on the center of the element.
  // Assumes coordinate center (250, 250) is the Brahmasthan center.
  const calculateVastuZone = (x: number, y: number): "NE" | "SE" | "SW" | "NW" | "N" | "E" | "S" | "W" | "Center" => {
    defaultZoneEngine.setNorth(chakraState.rotation);
    defaultZoneEngine.setOrigin({ x: chakraState.x, y: chakraState.y });
    return defaultZoneEngine.getZone({ x, y }, 55).id as any;
  };

  interface VastuRule {
    id: string;
    name: string;
    description: string;
    isCompliant: boolean;
    isRemedied: boolean;
    impact: number;
  }

  interface EvidenceLink {
    scripture: string;
    verse: string;
    text: string;
  }

  interface VastuRemedy {
    id: string;
    name: string;
    description: string;
    active: boolean;
    costRating: number;
    priority: "High" | "Medium" | "Low";
    positiveScoreEffect: number;
  }

  interface SemanticEvaluation {
    compliance: "Excellent" | "Good" | "Defective" | "Dangerous" | "Neutral" | "Remedied";
    scoreEffect: number;
    element: "Water" | "Fire" | "Earth" | "Air" | "Space" | "None";
    advice: string;
    zone: string;
    rules: VastuRule[];
    evidenceLinks: EvidenceLink[];
    remedies: VastuRemedy[];
  }

  const evaluateSemanticEntity = (
    type: string,
    subType: string,
    zone: string,
    remediesApplied: string[] = []
  ): SemanticEvaluation => {
    let element: "Water" | "Fire" | "Earth" | "Air" | "Space" | "None" = "None";
    let compliance: "Excellent" | "Good" | "Defective" | "Dangerous" | "Neutral" | "Remedied" = "Neutral";
    let scoreEffect = 0;
    let advice = "Standard architectural entity positioned within normal energy parameters.";
    let rules: VastuRule[] = [];
    let evidenceLinks: EvidenceLink[] = [];
    let remedies: VastuRemedy[] = [];

    if (subType === "master_bedroom") {
      element = "Earth";
      if (zone === "SW") {
        compliance = "Excellent";
        scoreEffect = 25;
        advice = "Highly Auspicious. SW is the Nairutya sector ruled by Earth, which provides stability, power, and high-quality rest.";
        rules.push({ id: "bedroom_sw", name: "Nairutya Sleeping Axis", description: "Positioning the master sleeping chambers in Southwest.", isCompliant: true, isRemedied: false, impact: 25 });
        evidenceLinks.push({ scripture: "Mayamatam", verse: "Chapter 26, Verse 4", text: "The lord of the household must sleep in the Nairutya (Southwest) quadrant to protect the home's prosperity and keep steady control over his actions." });
      } else if (zone === "NE") {
        const remedyId = "lead_helix";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -5 : -30;
        advice = isRemedied 
          ? "Cured via South-West Lead Helix placement. Heavy energy weight artificially simulated in SW corner to balance the NE overload."
          : "CRITICAL DEFECT. Sleeping in Northeast (Ishanya) burdens the sacred head of Vastu Purusha, triggering mental tension, high anxiety, and severe career blockages.";
        rules.push({ id: "bedroom_ne", name: "Ishanya Burdening Error", description: "Heavy bed and occupant load placed in NE water/sacred zone.", isCompliant: false, isRemedied, impact: -30 });
        evidenceLinks.push({ scripture: "Vishvakarma Prakash", verse: "Chapter 4, Verse 12", text: "Heaviness in the head of Vastu (Northeast) sinks the luck of the family, bringing distress and persistent bodily pain." });
        remedies.push({ id: "lead_helix", name: "Lead Metal Helix Installation", description: "Install 3 Lead Helix in South-West floor to counteract weight deficit.", active: isRemedied, costRating: 3, priority: "High", positiveScoreEffect: 25 });
      } else if (zone === "SE") {
        const remedyId = "camphor_diffuser";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Defective";
        scoreEffect = isRemedied ? -2 : -15;
        advice = isRemedied
          ? "Remedied via continuous Camphor Crystal Diffuser in SE. Fire-element restlessness neutralized."
          : "MINOR DEFECT. Sleeping in Southeast (Agni) zone induces extreme restlessness, fiery temperaments, high blood pressure, and marital friction.";
        rules.push({ id: "bedroom_se", name: "Agni Sector Restlessness", description: "Sleeping in SE fire zone.", isCompliant: false, isRemedied, impact: -15 });
        evidenceLinks.push({ scripture: "Samarangana Sutradhara", verse: "Chapter 35, Verse 14", text: "A bedroom in Agneyi (Southeast) brings constant fiery conflicts and digests the peace of the dweller." });
        remedies.push({ id: "camphor_diffuser", name: "Camphor Crystal Diffuser", description: "Deploy an active camphor diffuser in the room to cleanse fiery elements.", active: isRemedied, costRating: 1, priority: "Medium", positiveScoreEffect: 13 });
      } else {
        compliance = "Good";
        scoreEffect = 10;
        advice = "Favorable bedroom zone. Keep sleeping orientation with head pointing towards South or East.";
        rules.push({ id: "bedroom_other", name: "Standard Sleeping Quadrant", description: "Bedroom placed in standard neutral/good zone.", isCompliant: true, isRemedied: false, impact: 10 });
      }
    }
    else if (subType === "kitchen") {
      element = "Fire";
      if (zone === "SE") {
        compliance = "Excellent";
        scoreEffect = 25;
        advice = "Highly Auspicious. South-East (Agni) quadrant is ruled by Fire. Harmonizes bio-energy, promoting wealth, metabolic health, and mental vigor.";
        rules.push({ id: "kitchen_se", name: "Agni Fire-Element Alignment", description: "Cooking stove positioned exactly in the SE Fire zone.", isCompliant: true, isRemedied: false, impact: 25 });
        evidenceLinks.push({ scripture: "Vishvakarma Prakash", verse: "Chapter 2, Verse 32", text: "The kitchen must be established in the Agneyi (Southeast) corner. Eating cooked food from here ensures pure digestion, robust health, and steady wealth." });
      } else if (zone === "NE") {
        const remedyId = "copper_pyramids";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -6 : -35;
        advice = isRemedied
          ? "Remedied via Copper Energy Pyramids installed over the cooktop stove. Fire-Water conflict virtually compartmentalized."
          : "CRITICAL DEFECT. Fire in Northeast (Ishanya Water) douses the celestial water flow, creating immediate cash drains, continuous business blockages, and metabolic issues.";
        rules.push({ id: "kitchen_ne", name: "Ishanya Fire-Water Clash", description: "Placing a fire source in the sacred water quadrant (NE).", isCompliant: false, isRemedied, impact: -35 });
        evidenceLinks.push({ scripture: "Samarangana Sutradhara", verse: "Chapter 35, Verse 8", text: "Cooking fire placed in the Northeast douses the divine currents, ensuring decline of property and sudden loss of savings." });
        remedies.push({ id: "copper_pyramids", name: "Copper Energy Pyramids", description: "Mount three copper pyramids above the stove to absorb fire flare-ups.", active: isRemedied, costRating: 2, priority: "High", positiveScoreEffect: 29 });
      } else if (zone === "SW") {
        const remedyId = "yellow_stone";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -5 : -25;
        advice = isRemedied
          ? "Remedied via Yellow Jaisalmer stone platform under the stove. Fire energy grounded into Earth."
          : "DEFECT. Fire in Southwest (Nairutya Earth) burns structural grounding, provoking serious professional instability and high friction with business partners.";
        rules.push({ id: "kitchen_sw", name: "Nairutya Fire Burnout", description: "Fire positioned in SW earth grounding quadrant.", isCompliant: false, isRemedied, impact: -25 });
        remedies.push({ id: "yellow_stone", name: "Yellow Jaisalmer Slab", description: "Place a 30mm Yellow Jaisalmer stone slab under the cooking stove.", active: isRemedied, costRating: 2, priority: "High", positiveScoreEffect: 20 });
      } else if (zone === "NW") {
        compliance = "Good";
        scoreEffect = 15;
        advice = "Auspicious Alternative. North-West is Vayu (Air), which naturally supports Fire. Well-ventilated placement.";
        rules.push({ id: "kitchen_nw", name: "Vayu Alternative Cooking", description: "Cooking stove in NW air sector supporting combustion.", isCompliant: true, isRemedied: false, impact: 15 });
      } else {
        compliance = "Neutral";
        scoreEffect = 5;
        advice = "Standard kitchen placement. Ensure cook faces East while operating culinary counter.";
        rules.push({ id: "kitchen_other", name: "Standard Kitchen Axis", description: "Kitchen placed in standard alternate zone.", isCompliant: true, isRemedied: false, impact: 5 });
      }
    }
    else if (subType === "toilet") {
      element = "Air";
      if (zone === "NW" || zone === "W") {
        compliance = "Excellent";
        scoreEffect = 15;
        advice = "Excellent Placement. North-West (Vayu) or West (Varuna) are prime quarters for waste discharge, ensuring emotional clearance.";
        rules.push({ id: "toilet_nw", name: "Vayu Waste Clearance", description: "Waste toilet situated in NW air/disposal sector.", isCompliant: true, isRemedied: false, impact: 15 });
        evidenceLinks.push({ scripture: "Samarangana Sutradhara", verse: "Chapter 35, Verse 45", text: "The outlet for waste, impurities and drains must reside in the Vayavya (North-West) zone, keeping structural grids clean and bright." });
      } else if (zone === "NE") {
        const remedyId = "brass_strip";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -8 : -35;
        advice = isRemedied
          ? "Remedied via Brass Wire Floor Strip around toilet base. Blocks toilet drainage from draining NE prana."
          : "CRITICAL DEFECT. Toilet in Northeast (Ishanya) pollutes the prime celestial energy source, causing severe health decay and persistent financial blockages.";
        rules.push({ id: "toilet_ne", name: "Ishanya Sacred Pollution", description: "Toilet drain in the Northeast celestial source sector.", isCompliant: false, isRemedied, impact: -35 });
        evidenceLinks.push({ scripture: "Vishvakarma Prakash", verse: "Chapter 4, Verse 18", text: "A water outlet for waste in Ishanya brings persistent family illnesses, mental depression, and eventual bankruptcy." });
        remedies.push({ id: "brass_strip", name: "Brass Wire Floor Strip", description: "Insert a 4mm thick brass strip into the floor tiles surrounding the toilet base.", active: isRemedied, costRating: 1, priority: "High", positiveScoreEffect: 27 });
      } else if (zone === "Center") {
        const remedyId = "brass_strip";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -10 : -35;
        advice = isRemedied
          ? "Remedied via Brass boundaries. Note: Removing toilet entirely is highly recommended."
          : "CRITICAL DIRECT ERROR. Toilet in Brahmasthan completely suffocates core cosmic energies, producing stagnant cycles and structural ruin.";
        rules.push({ id: "toilet_center", name: "Brahmasthan Suffocation", description: "Waste drain directly in the cosmic center of the plot.", isCompliant: false, isRemedied, impact: -35 });
        remedies.push({ id: "brass_strip", name: "Brass Boundary Isolation", description: "Isolate toilet base with brass wire inserts on floor boundaries.", active: isRemedied, costRating: 2, priority: "High", positiveScoreEffect: 25 });
      } else {
        const remedyId = "elemental_tape";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Defective";
        scoreEffect = isRemedied ? -3 : -15;
        advice = isRemedied
          ? "Remedied via colored elemental floor tape blocking drainage pull."
          : "DEFECT. Toilet in active quadrant drains local energy. Keep door closed and place raw sea-salt bowls.";
        rules.push({ id: "toilet_other", name: "Improper Disposal Quadrant", description: "Toilet located in general residential quadrant.", isCompliant: false, isRemedied, impact: -15 });
        remedies.push({ id: "elemental_tape", name: "Elemental Floor Tape", description: "Install 3-inch wide colored element tape on the floor around the toilet bowl.", active: isRemedied, costRating: 1, priority: "Medium", positiveScoreEffect: 12 });
      }
    }
    else if (subType === "puja") {
      element = "Space";
      if (zone === "NE") {
        compliance = "Excellent";
        scoreEffect = 25;
        advice = "Highly Auspicious. Prayer altar in Ishanya (NE) matches perfectly with pristine celestial prana, boosting spiritual clarity.";
        rules.push({ id: "puja_ne", name: "Ishanya Devotion Axis", description: "Sacred altar placed in Northeast water/space sector.", isCompliant: true, isRemedied: false, impact: 25 });
        evidenceLinks.push({ scripture: "Manasara Silpasastra", verse: "Chapter 18", text: "The prayer space and house deities belong in Ishanya (Northeast). It radiates satvic rays, ensuring prosperity, health, and family wisdom." });
      } else if (zone === "SW") {
        const remedyId = "brass_hanuman";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -4 : -20;
        advice = isRemedied
          ? "Remedied via Brass Hanuman Protection Shield in SW. Ancestor energy balanced with devotional symbols."
          : "DEFECT. Altar in Southwest (Nairutya Earth/Ancestors) triggers constant mental clashes, family disputes, and unstable prayer disciplines.";
        rules.push({ id: "puja_sw", name: "Nairutya Altar Clash", description: "A sacred altar placed in the heavy ancestor SW zone.", isCompliant: false, isRemedied, impact: -20 });
        remedies.push({ id: "brass_hanuman", name: "Brass Hanuman Shield", description: "Install a heavy brass Hanuman energy shield on the Southwest bedroom wall.", active: isRemedied, costRating: 2, priority: "High", positiveScoreEffect: 16 });
      } else {
        compliance = "Good";
        scoreEffect = 10;
        advice = "Favorable prayer area. Keep prayer posture facing East or North.";
        rules.push({ id: "puja_other", name: "Alternate Devotional Area", description: "Prayer space placed in East or North quadrant.", isCompliant: true, isRemedied: false, impact: 10 });
      }
    }
    else if (subType === "mahadwara") {
      element = "Space";
      if (zone === "NE" || zone === "E" || zone === "N") {
        compliance = "Excellent";
        scoreEffect = 25;
        advice = "Superb Main Entrance! Opens to positive solar dawn prana and Kubera's magnetic streams. Increases opportunities and growth.";
        rules.push({ id: "entrance_auspicious", name: "Auspicious Solar Entrance", description: "Mahadwara (Main Door) placed in Northeast, East, or North.", isCompliant: true, isRemedied: false, impact: 25 });
        evidenceLinks.push({ scripture: "Mayamatam", verse: "Chapter 12, Verse 5", text: "The grand entrance door built in the Northeast, East or North quadrants welcomes divine spirits and positive cosmic fields, assuring joy and abundance." });
      } else if (zone === "SW") {
        const remedyId = "copper_threshold";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -7 : -30;
        advice = isRemedied
          ? "Remedied via Copper Threshold Strip under main door entry point, plus twin Brass Hanuman protection shields."
          : "CRITICAL DEFECT. Main entrance in Southwest Nairutya is the 'gateway of darkness', leading to severe financial litigation, sudden accidents, and bad luck.";
        rules.push({ id: "entrance_sw", name: "Nairutya Gateway Defect", description: "Main door situated in Southwest Nairutya.", isCompliant: false, isRemedied, impact: -30 });
        evidenceLinks.push({ scripture: "Vishvakarma Prakash", verse: "Chapter 4, Verse 22", text: "The South-West entrance door invites demons, persistent litigation, continuous disputes, and rapid drainage of hard-earned wealth." });
        remedies.push({ id: "copper_threshold", name: "Copper Threshold Strip", description: "Install a solid 5mm copper plate strip directly across the floor threshold of the entrance door.", active: isRemedied, costRating: 2, priority: "High", positiveScoreEffect: 23 });
      } else {
        compliance = "Good";
        scoreEffect = 10;
        advice = "Permissible standard entry portal. Adorn entrance with auspicious Vastu symbols.";
        rules.push({ id: "entrance_standard", name: "Standard Entry Portal", description: "Main door located in standard neutral corridor.", isCompliant: true, isRemedied: false, impact: 10 });
      }
    }
    else if (subType === "load_bearing_wall") {
      element = "Earth";
      if (zone === "S" || zone === "W" || zone === "SW") {
        compliance = "Excellent";
        scoreEffect = 15;
        advice = "Excellent Wall Position. High thickness and loading in South and West grounds the structure against cosmic stresses.";
        rules.push({ id: "wall_heavy", name: "Preserving Earth Grounding", description: "Dense structural loading placed on South/West axes.", isCompliant: true, isRemedied: false, impact: 15 });
        evidenceLinks.push({ scripture: "Mayamatam", verse: "Chapter 12", text: "The Southern and Western walls of the structure must be made thick, elevated and heavy to retain positive incoming fields from the North and East." });
      } else if (zone === "NE" || zone === "N" || zone === "E") {
        const remedyId = "green_aventurine";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Defective";
        scoreEffect = isRemedied ? -2 : -10;
        advice = isRemedied
          ? "Remedied via Green Aventurine gemstone wire grid. Grounding pressure lightened virtually."
          : "MINOR DEFECT. Thick load wall in Northeast blocks early solar dawn prana and soft cosmic magnetic waves.";
        rules.push({ id: "wall_light_block", name: "Blocking Solar Dawn streams", description: "Thick load-bearing wall placed on East/NE quadrants.", isCompliant: false, isRemedied, impact: -10 });
        remedies.push({ id: "green_aventurine", name: "Aventurine Gemstone Grid", description: "Imbed Green Aventurine gemstones in wall plaster to cleanse blocking vectors.", active: isRemedied, costRating: 2, priority: "Low", positiveScoreEffect: 8 });
      } else {
        compliance = "Neutral";
        scoreEffect = 0;
        advice = "Standard partition structure. Standard load profile.";
        rules.push({ id: "wall_neutral", name: "Standard Structural Wall", description: "Internal wall located in neutral zone.", isCompliant: true, isRemedied: false, impact: 0 });
      }
    }
    else if (subType === "bay_window") {
      element = "Air";
      if (zone === "N" || zone === "E" || zone === "NE") {
        compliance = "Excellent";
        scoreEffect = 15;
        advice = "Auspicious Window placement. Facing North or East welcomes dawn prana, supporting health and intellectual vigor.";
        rules.push({ id: "window_intake", name: "Dawn Prana Ventilation", description: "Window apertures placed in auspicious East/North quadrants.", isCompliant: true, isRemedied: false, impact: 15 });
        evidenceLinks.push({ scripture: "Mayamatam", verse: "Chapter 14", text: "Windows and apertures facing North or East capture early dawn fields, drenching the home in sattva and curing body elements." });
      } else if (zone === "SW" || zone === "S") {
        const remedyId = "yellow_filter";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Defective";
        scoreEffect = isRemedied ? -2 : -8;
        advice = isRemedied
          ? "Remedied via Yellow Solar Filtering Tint on the window panes. Filters harmful infrared waves."
          : "MINOR DEFECT. Large window aperture in South-West welcomes harsh afternoon infrared thermal waves, destabilizing family tranquility.";
        rules.push({ id: "window_thermal", name: "Destabilizing Solar Heat", description: "Large apertures facing Southwest or South.", isCompliant: false, isRemedied, impact: -8 });
        remedies.push({ id: "yellow_filter", name: "Yellow Solar Filtering Tint", description: "Apply an amber/yellow solar-filtering window film to block harsh infrared afternoon waves.", active: isRemedied, costRating: 1, priority: "Medium", positiveScoreEffect: 6 });
      } else {
        compliance = "Neutral";
        scoreEffect = 0;
        advice = "Standard ventilation node. Keep glass clean for clear energy flow.";
        rules.push({ id: "window_standard", name: "Standard Ventilation", description: "Ventilation window in neutral zone.", isCompliant: true, isRemedied: false, impact: 0 });
      }
    }
    else if (subType === "borewell") {
      element = "Water";
      if (zone === "NE" || zone === "N") {
        compliance = "Excellent";
        scoreEffect = 25;
        advice = "Superb Water Node! Borewell in Northeast water zone aligns with bio-magnetic forces, assuring expansion of wealth, health, and wisdom.";
        rules.push({ id: "borewell_ne", name: "Celestial Water Source Alignment", description: "Underground water reservoir or borewell dug in Northeast.", isCompliant: true, isRemedied: false, impact: 25 });
        evidenceLinks.push({ scripture: "Manasara Silpasastra", verse: "Chapter 18", text: "Digging a fresh well or water source in the Northeast (Ishanya) quarter maximizes dynamic cosmic energies, assuring endless joy and wealth." });
      } else if (zone === "SE") {
        const remedyId = "copper_pyramid_water";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -5 : -30;
        advice = isRemedied
          ? "Remedied via Copper Energy Pyramids installed surrounding the borewell casing. Damps water-fire friction."
          : "CRITICAL DEFECT. Water source in South-East (Agni Fire sector) triggers severe fire-water elemental clash, ruining physical wealth and vital spark.";
        rules.push({ id: "borewell_se", name: "SE Water-Fire Clash", description: "Water pit located in SE Fire sector.", isCompliant: false, isRemedied, impact: -30 });
        remedies.push({ id: "copper_pyramid_water", name: "Copper Water Ring", description: "Deploy a ring of copper energy pyramids around the borewell structure.", active: isRemedied, costRating: 2, priority: "High", positiveScoreEffect: 25 });
      } else if (zone === "SW") {
        const remedyId = "lead_helix_water";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -6 : -30;
        advice = isRemedied
          ? "Remedied via heavy Lead Metal Helix installation in the Southwest corner of the yard to counteract water weight deficit."
          : "CRITICAL DEFECT. Underground water tank in Southwest decreases essential building grounding weight, inviting heavy debt and health crisis.";
        rules.push({ id: "borewell_sw", name: "SW Weight Deficit Pit", description: "Deep water tank dug in Southwest Nairutya.", isCompliant: false, isRemedied, impact: -30 });
        remedies.push({ id: "lead_helix_water", name: "Lead Grounding Helix", description: "Install 3 heavy Lead Helix in SW corner floor to restore earth weight parameter.", active: isRemedied, costRating: 3, priority: "High", positiveScoreEffect: 24 });
      } else {
        compliance = "Neutral";
        scoreEffect = 5;
        advice = "Standard underground water element. Safe standard alignment.";
        rules.push({ id: "borewell_neutral", name: "Standard Water Pit", description: "Water pit in standard neutral sector.", isCompliant: true, isRemedied: false, impact: 5 });
      }
    }
    else if (subType === "septic_tank") {
      element = "Air";
      if (zone === "NW" || zone === "W") {
        compliance = "Excellent";
        scoreEffect = 15;
        advice = "Excellent Septic Location. Drains toxins safely from the structural core without accumulation issues.";
        rules.push({ id: "septic_nw", name: "Auspicious Waste Discharge", description: "Septic drain tank located in the Northwest Vayu zone.", isCompliant: true, isRemedied: false, impact: 15 });
      } else if (zone === "NE" || zone === "SW") {
        const remedyId = "brass_strip_septic";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -7 : -30;
        advice = isRemedied
          ? "Remedied via thick Brass Wire strip embedded around the septic tank boundary to block toxic outflow."
          : "CRITICAL DEFECT. Septic tank in Northeast or Southwest pollutes the vital sacred head or stability sectors, triggering chronic legal issues and business downfall.";
        rules.push({ id: "septic_clash", name: "Septic Pollution Clash", description: "Septic accumulation pit placed in NE or SW sector.", isCompliant: false, isRemedied, impact: -30 });
        remedies.push({ id: "brass_strip_septic", name: "Brass Septic Isolation", description: "Insert a thick brass wire strip into the floor/ground surrounding the septic tank boundary.", active: isRemedied, costRating: 2, priority: "High", positiveScoreEffect: 23 });
      } else {
        compliance = "Neutral";
        scoreEffect = 5;
        advice = "Permissible septic location. Adorn with green foliage plants surrounding the lid boundary.";
        rules.push({ id: "septic_neutral", name: "Standard Septic Alignment", description: "Septic tank situated in neutral boundary.", isCompliant: true, isRemedied: false, impact: 5 });
      }
    }
    else if (subType === "overhead_tank") {
      element = "Earth";
      if (zone === "SW" || zone === "W") {
        compliance = "Excellent";
        scoreEffect = 15;
        advice = "Excellent Overhead Location. High water weight on roofs in Southwest grounds the building safely.";
        rules.push({ id: "overhead_sw", name: "SW High Structural Loading", description: "Heavy overhead tank located on Southwest roof.", isCompliant: true, isRemedied: false, impact: 15 });
      } else if (zone === "NE") {
        const remedyId = "lead_helix_overhead";
        const isRemedied = remediesApplied.includes(remedyId);
        compliance = isRemedied ? "Remedied" : "Dangerous";
        scoreEffect = isRemedied ? -6 : -25;
        advice = isRemedied
          ? "Remedied via South-West Lead Helix placement to ground the building balance virtually."
          : "CRITICAL DEFECT. Heavy weight in Northeast (Ishanya) sinks wealth flow, douses divine light entry, and triggers heavy distress.";
        rules.push({ id: "overhead_ne", name: "Heavy Load NE Defect", description: "Overhead tank installed above Northeast roof.", isCompliant: false, isRemedied, impact: -25 });
        remedies.push({ id: "lead_helix_overhead", name: "Lead Helix (SW Roof)", description: "Install 3 Lead Helix in the SW corner of the roof terrace to shift gravity balance.", active: isRemedied, costRating: 3, priority: "High", positiveScoreEffect: 19 });
      } else {
        compliance = "Neutral";
        scoreEffect = 5;
        advice = "Standard overhead reservoir. Ensure no active water leaks occur.";
        rules.push({ id: "overhead_neutral", name: "Standard Overhead Tank", description: "Overhead tank in standard alternate sector.", isCompliant: true, isRemedied: false, impact: 5 });
      }
    }
    else {
      compliance = "Neutral";
      scoreEffect = 0;
      advice = "Standard spatial entity. High safety profile. Ensure pathways remain clear.";
      rules.push({ id: "generic_entity", name: "Standard Spatial Grid Layout", description: "Structural elements placed within calibrated spatial quadrants.", isCompliant: true, isRemedied: false, impact: 0 });
    }

    return { compliance, scoreEffect, element, advice, zone, rules, evidenceLinks, remedies };
  };

  const getVastuAnalysis = (item: AnnotationItem) => {
    const zone = item.vastuZone || calculateVastuZone(item.x + (item.width ? item.width / 2 : 0), item.y + (item.height ? item.height / 2 : 0));
    
    // Auto-detect subType if not directly set
    let subType = item.subType;
    if (!subType) {
      const typeKey = item.symbolType || (item.name.toLowerCase().includes("bed") ? "bed" : item.name.toLowerCase().includes("kitchen") ? "stove" : item.name.toLowerCase().includes("toilet") ? "toilet" : "none");
      if (typeKey === "bed") subType = "master_bedroom";
      else if (typeKey === "stove") subType = "kitchen";
      else if (typeKey === "toilet") subType = "toilet";
      else if (typeKey === "puja") subType = "puja";
      else if (typeKey === "door") subType = "mahadwara";
      else if (typeKey === "watertank") subType = "borewell";
      else if (item.type === "wall") subType = "load_bearing_wall";
      else if (item.type === "door") subType = "mahadwara";
      else if (item.type === "window") subType = "bay_window";
      else subType = "generic";
    }

    const evaluation = evaluateSemanticEntity(item.type, subType, zone, item.remediesApplied || []);
    
    return {
      compliance: evaluation.compliance,
      scoreEffect: evaluation.scoreEffect,
      element: evaluation.element,
      advice: evaluation.advice,
      zone: evaluation.zone,
      rules: evaluation.rules,
      evidenceLinks: evaluation.evidenceLinks,
      remedies: evaluation.remedies,
      subType
    };
  };

  // --- COMPUTE OVERALL COMPLIANCE SCORE ---
  const calculateTotalVastuScore = () => {
    let baseScore = 72; // default neutral starting score
    annotations.forEach((item) => {
      const { scoreEffect } = getVastuAnalysis(item);
      baseScore += scoreEffect;
    });
    return Math.max(10, Math.min(100, baseScore));
  };

  const totalVastuScore = calculateTotalVastuScore();

  // --- SPRINT 5 ANNOTATION CRUD ACTION HANDLERS ---
  
  // Create New Annotation (Room, Symbol, Note)
  const handleCreateAnnotation = (
    type: "room" | "symbol" | "note", 
    canvasX: number, 
    canvasY: number
  ) => {
    let newItem: AnnotationItem;
    const randomId = `ann_${Date.now()}`;

    if (type === "room") {
      newItem = {
        id: randomId,
        type: "room",
        name: `Room Zone ${annotations.filter(a => a.type === "room").length + 1}`,
        x: Math.round(canvasX - 70),
        y: Math.round(canvasY - 50),
        width: 140,
        height: 100,
        color: "text-emerald-400",
        bg: "bg-emerald-950/20",
        border: "border-emerald-500/40",
        rotation: 0,
        notes: "Newly traced space zone.",
        element: "None",
        vastuZone: calculateVastuZone(canvasX, canvasY),
        customRating: 80
      };
    } else if (type === "symbol") {
      const template = SYMBOL_TEMPLATES.find(t => t.type === selectedSymbolType) || SYMBOL_TEMPLATES[0];
      newItem = {
        id: randomId,
        type: "symbol",
        name: template.name,
        symbolType: template.type,
        x: Math.round(canvasX),
        y: Math.round(canvasY),
        color: template.defaultColor,
        bg: template.defaultBg,
        border: template.defaultBorder,
        rotation: 0,
        notes: template.description,
        element: template.element,
        vastuZone: calculateVastuZone(canvasX, canvasY)
      };
    } else {
      newItem = {
        id: randomId,
        type: "note",
        name: `Pin Memo ${annotations.filter(a => a.type === "note").length + 1}`,
        x: Math.round(canvasX),
        y: Math.round(canvasY),
        notes: "Tap here to add on-site feedback or notes.",
        color: "text-amber-400",
        bg: "bg-white/90",
        border: "border-amber-500/50"
      };
    }

    const nextAnnotations = [...annotations, newItem];
    setAnnotations(nextAnnotations);
    setSelectedId(newItem.id);
    commitToHistory(nextAnnotations);
    showToast(`Created new ${type}: ${newItem.name}`);
  };

  // Update Existing Annotation Properties
  const handleUpdateAnnotation = (id: string, updates: Partial<AnnotationItem>) => {
    const nextAnnotations = annotations.map((a) => {
      if (a.id === id) {
        const updated = { ...a, ...updates };
        // Recalculate Vastu Zone if position moved
        if (updates.x !== undefined || updates.y !== undefined) {
          const cx = updated.x + (updated.width ? updated.width / 2 : 0);
          const cy = updated.y + (updated.height ? updated.height / 2 : 0);
          updated.vastuZone = calculateVastuZone(cx, cy);
        }
        return updated;
      }
      return a;
    });
    setAnnotations(nextAnnotations);
    commitToHistory(nextAnnotations);
  };

  // Delete Annotation
  const handleDeleteAnnotation = (id: string) => {
    const item = annotations.find(a => a.id === id);
    if (!item) return;

    const nextAnnotations = annotations.filter((a) => a.id !== id);
    setAnnotations(nextAnnotations);
    setSelectedId(null);
    commitToHistory(nextAnnotations);
    showToast(`Deleted ${item.type}: ${item.name}`);
  };

  // Clear All Annotations
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all placed annotations, symbols, and rooms?")) {
      setAnnotations([]);
      setSelectedId(null);
      commitToHistory([]);
      showToast("Cleared all annotations");
    }
  };

  // --- CANVAS INTERACTION HANDLERS ---
  const getCanvasCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return { x: 0, y: 0 };
    const rect = mainEl.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  
  // ... (existing handleCanvasMouseDown)

  const handleCanvasMouseDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const coords = getCanvasCoords(e);

    // If Chakra mode is active
    if (activeTool === "chakra") {
      setSelectedId(null);
      setActiveTool("select");
      return;
    }

    // If Measure mode is active
    if (activeTool === "measure") {
      if (measurePoints.length >= 2) {
        setMeasurePoints([coords]);
        setTempPoint(null);
      } else {
        const nextPoints = [...measurePoints, coords];
        setMeasurePoints(nextPoints);
        if (nextPoints.length === 2) {
          showToast(`Measured distance: ${convertPxToMetric(Math.sqrt(Math.pow(nextPoints[1].x - nextPoints[0].x, 2) + Math.pow(nextPoints[1].y - nextPoints[0].y, 2)))}`);
        }
      }
      return;
    }

    // If Annotation Creator Tools are active
    if (activeTool === "room") {
      handleCreateAnnotation("room", coords.x, coords.y);
      setActiveTool("select"); // switch back to selection
      return;
    }
    if (activeTool === "symbol") {
      handleCreateAnnotation("symbol", coords.x, coords.y);
      setActiveTool("select");
      return;
    }
    if (activeTool === "note") {
      handleCreateAnnotation("note", coords.x, coords.y);
      setActiveTool("select");
      return;
    }

    // Hand/Pan Tool dragging starts
    if (activeTool === "pan") {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Selection Mode - check if clicked on any item
    if (activeTool === "select") {
      // Prioritize symbols over rooms because they are smaller
      const clickedSymbol = [...annotations]
        .reverse()
        .find((a) => {
          if (a.type !== "room") {
            const dist = Math.sqrt(Math.pow(coords.x - a.x, 2) + Math.pow(coords.y - a.y, 2));
            return dist < 18; // 18px touch radius
          }
          return false;
        });

      if (clickedSymbol) {
        setSelectedId(clickedSymbol.id);
        setDraggedElementId(clickedSymbol.id);
        setElementDragStartOffset({ x: coords.x - clickedSymbol.x, y: coords.y - clickedSymbol.y });
        return;
      }

      // Check if clicked inside a room rectangle
      const clickedRoom = [...annotations]
        .reverse()
        .find((a) => {
          if (a.type === "room" && a.width && a.height) {
            return (
              coords.x >= a.x &&
              coords.x <= a.x + a.width &&
              coords.y >= a.y &&
              coords.y <= a.y + a.height
            );
          }
          return false;
        });

      if (clickedRoom) {
        setSelectedId(clickedRoom.id);
        
        // Check if clicked on the bottom-right resize corner
        const brCornerX = clickedRoom.x + clickedRoom.width!;
        const brCornerY = clickedRoom.y + clickedRoom.height!;
        const distToCorner = Math.sqrt(Math.pow(coords.x - brCornerX, 2) + Math.pow(coords.y - brCornerY, 2));
        
        if (distToCorner < 12) {
          setIsResizingRoom(true);
          setRoomResizeDirection("br");
          setDraggedElementId(clickedRoom.id);
        } else {
          setDraggedElementId(clickedRoom.id);
          setElementDragStartOffset({ x: coords.x - clickedRoom.x, y: coords.y - clickedRoom.y });
        }
        return;
      }

      // Clicked empty space
      setSelectedId(null);
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const coords = getCanvasCoords(e);
    setHoverCoords({ x: Math.round(coords.x), y: Math.round(coords.y) });

    // Measure tool tracking line
    if (activeTool === "measure" && measurePoints.length === 1) {
      setTempPoint(coords);
    }

    if (isDraggingChakra) {
      let nextX = coords.x - chakraDragOffset.x;
      let nextY = coords.y - chakraDragOffset.y;
      
      // Center Snap Guides
      if (chakraState.snapEnabled) {
        const centerX = bgImageSize.width / 2;
        const centerY = bgImageSize.height / 2;
        if (Math.abs(nextX - centerX) < 15) nextX = centerX;
        if (Math.abs(nextY - centerY) < 15) nextY = centerY;
      }
      
      setChakraState(prev => ({ ...prev, x: nextX, y: nextY }));
      return;
    }
    
    if (isRotatingChakra) {
      const dx = coords.x - chakraState.x;
      const dy = coords.y - chakraState.y;
      const currentAngleRad = Math.atan2(dy, dx);
      let currentAngleDeg = (currentAngleRad * 180) / Math.PI;
      
      let deltaAngle = currentAngleDeg - chakraInteractionStart.angle;
      // Normalize angle difference to prevent sudden 360-degree wrapping jumps
      while (deltaAngle < -180) deltaAngle += 360;
      while (deltaAngle > 180) deltaAngle -= 360;
      
      let newRotation = (chakraInteractionStart.rotation + deltaAngle) % 360;
      if (newRotation < 0) newRotation += 360;
      
      const roundedRotation = newRotation;
      setChakraState(prev => ({ ...prev, rotation: prev.isLocked ? prev.rotation : roundedRotation }));
      if (activeProperty && onUpdatePropertyOffset && !chakraState.isLocked) {
        onUpdatePropertyOffset(activeProperty.id, roundedRotation);
      }
      return;
    }

    // Dragging canvas

    if (isResizingChakra) {
      const dx = coords.x - chakraState.x;
      const dy = coords.y - chakraState.y;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      if (chakraResizeStart.dist > 0) {
        const ratio = currentDist / chakraResizeStart.dist;
        const newScale = Math.max(0.1, chakraResizeStart.scale * ratio);
        setChakraState(prev => ({ ...prev, scale: newScale }));
      }
      return;
    }
    if (isDraggingCanvas) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Dragging / Resizing elements
    if (draggedElementId) {
      const target = annotations.find((a) => a.id === draggedElementId);
      if (!target) return;

      if (isResizingRoom && roomResizeDirection === "br") {
        const nextW = Math.max(40, Math.round(coords.x - target.x));
        const nextH = Math.max(40, Math.round(coords.y - target.y));
        
        // Fast UI update (don't commit to history on every frame mouse moves, just state update)
        setAnnotations((prev) =>
          prev.map((a) => (a.id === draggedElementId ? { ...a, width: nextW, height: nextH } : a))
        );
      } else {
        const nextX = Math.round(coords.x - elementDragStartOffset.x);
        const nextY = Math.round(coords.y - elementDragStartOffset.y);
        
        setAnnotations((prev) =>
          prev.map((a) => (a.id === draggedElementId ? { ...a, x: nextX, y: nextY } : a))
        );
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingChakra || isRotatingChakra || isResizingChakra) {
      setIsDraggingChakra(false);
      setIsRotatingChakra(false);
      setIsResizingChakra(false);
      return;
    }
    if (draggedElementId) {
      // Drag action finalized, commit final state to undo/redo history stack
      commitToHistory(annotations);
      setDraggedElementId(null);
      setIsResizingRoom(false);
      setRoomResizeDirection(null);
    }
    setIsDraggingCanvas(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(3.0, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z - 0.15));
  const handleZoomReset = () => { 
    const mainEl = document.querySelector('main');
    if (mainEl && bgImageSize.width > 0) {
      const rect = mainEl.getBoundingClientRect();
      const canvasW = rect.width;
      const canvasH = rect.height;
      const zoomFitX = (canvasW * 0.8) / bgImageSize.width;
      const zoomFitY = (canvasH * 0.8) / bgImageSize.height;
      const initialZoom = Math.min(Math.min(zoomFitX, zoomFitY), 1.5);
      
      setZoom(initialZoom);
      setPan({
        x: (canvasW - bgImageSize.width * initialZoom) / 2,
        y: (canvasH - bgImageSize.height * initialZoom) / 2
      });
    } else {
      setZoom(1.0); 
      setPan({ x: 0, y: 0 }); 
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomIntensity = 0.08;
    setZoom((prev) => {
      if (e.deltaY < 0) {
        return Math.min(3.0, prev + zoomIntensity);
      } else {
        return Math.max(0.4, prev - zoomIntensity);
      }
    });
  };

  const handleSaveAnnotations = () => {
    showToast("Manual Annotation Draft successfully synchronized with Cloud Server!");
  };

  // Keyboard Delete shortcut & Layout toggles

  const handlePointerMoveRef = useRef<any>(null);
  const handlePointerUpRef = useRef<any>(null);
  handlePointerMoveRef.current = handleCanvasMouseMove;
  handlePointerUpRef.current = handleCanvasMouseUp;

  useEffect(() => {
    const onMove = (e: PointerEvent) => handlePointerMoveRef.current(e as any);
    const onUp = (e: PointerEvent) => handlePointerUpRef.current(e as any);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || (e.target as HTMLElement).isContentEditable) {
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        handleDeleteAnnotation(selectedId);
      }
      if (e.key.toLowerCase() === "l") {
        setIsLeftPanelOpen(prev => !prev);
      }
      if (e.key.toLowerCase() === "i") {
        setIsRightPanelOpen(prev => !prev);
      }
      if (e.key.toLowerCase() === "f") {
        setIsPresentationMode(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, annotations, isLeftPanelOpen, isRightPanelOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        let base64Url = reader.result as string;
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          base64Url = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80";
        }
        setBgImage({
          name: file.name,
          url: base64Url
        });
        if (activeProperty) {
          activeProperty.floorplanUrl = base64Url;
        }
        setIsLeftPanelOpen(true);
        setIsRightPanelOpen(true);
        setIsVastuChakraActive(true);
        setWizardStep("north");
        showToast(`Blueprint "${file.name}" loaded as base layer`);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedItem = annotations.find((a) => a.id === selectedId);

          const VastuChakraSVGOverlay = ({ className }: { className?: string }) => {
    return (
      <div 
        className={`${className} absolute flex items-center justify-center`}
        style={{ width: "0px", height: "0px" }}
      >
        {(layers.directionChakra || layers.zones16 || layers.entrances32 || layers.devta45 || layers.panchatattva) && (
          <>
            {/* 1. PANCHATATTVA ELEMENT LAYER */}
            {layers.panchatattva && (
              <svg className="absolute pointer-events-none" width="1200" height="1200" viewBox="0 0 1200 1200" style={{ transform: "translate(-600px, -600px)", opacity: layerConfigs.panchatattva.opacity }}>
                {/* Water Element (NNW to NE: 337.5 to 67.5) */}
                <path d={getSectorPath(600, 600, 360, 326.25, 56.25)} fill="rgba(14, 165, 233, 0.18)" stroke="rgba(14, 165, 233, 0.85)" strokeWidth="2.5" />
                {/* Air Element (ENE to E: 67.5 to 112.5) */}
                <path d={getSectorPath(600, 600, 360, 56.25, 101.25)} fill="rgba(34, 197, 94, 0.18)" stroke="rgba(34, 197, 94, 0.85)" strokeWidth="2.5" />
                {/* Fire Element (ESE to SSE: 112.5 to 180) */}
                <path d={getSectorPath(600, 600, 360, 101.25, 168.75)} fill="rgba(239, 68, 68, 0.18)" stroke="rgba(239, 68, 68, 0.85)" strokeWidth="2.5" />
                {/* Earth Element (S to SW: 180 to 247.5) */}
                <path d={getSectorPath(600, 600, 360, 168.75, 236.25)} fill="rgba(234, 179, 8, 0.18)" stroke="rgba(234, 179, 8, 0.85)" strokeWidth="2.5" />
                {/* Space Element (WSW to NW: 247.5 to 337.5) */}
                <path d={getSectorPath(600, 600, 360, 236.25, 326.25)} fill="rgba(168, 85, 247, 0.18)" stroke="rgba(168, 85, 247, 0.85)" strokeWidth="2.5" />
                
                {/* Element labels centered in each quadrant */}
                {(() => {
                  const labels = [
                    { text: "WATER", angle: 11.25, fill: "#38bdf8" },
                    { text: "AIR", angle: 78.75, fill: "#4ade80" },
                    { text: "FIRE", angle: 135, fill: "#f87171" },
                    { text: "EARTH", angle: 202.5, fill: "#facc15" },
                    { text: "SPACE", angle: 281.25, fill: "#c084fc" }
                  ];
                  return labels.map(lbl => {
                    const pt = polarToCartesian(600, 600, 210, lbl.angle);
                    return (
                      <g key={lbl.text}>
                        <rect x={pt.x - 32} y={pt.y - 11} width="64" height="22" rx="4" fill="#020617" stroke={lbl.fill} strokeWidth="1.8" opacity="1.0" />
                        <text x={pt.x} y={pt.y + 4.5} fill={lbl.fill} fontSize="10px" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="1px">{lbl.text}</text>
                      </g>
                    );
                  });
                })()}
              </svg>
            )}

            {/* 2. 16 ZONES GRID */}
            {layers.zones16 && (
              <svg className="absolute pointer-events-none" width="1200" height="1200" viewBox="0 0 1200 1200" style={{ transform: "translate(-600px, -600px)", opacity: layerConfigs.zones16.opacity }}>
                {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle) => {
                  const pt = polarToCartesian(600, 600, 420, angle);
                  return (
                    <line
                      key={angle}
                      x1="600"
                      y1="600"
                      x2={pt.x}
                      y2={pt.y}
                      stroke="rgba(16, 185, 129, 0.85)"
                      strokeWidth="2.0"
                    />
                  );
                })}

                <circle cx="600" cy="600" r="360" fill="none" stroke="rgba(16, 185, 129, 0.75)" strokeWidth="1.5" />
                <circle cx="600" cy="600" r="210" fill="none" stroke="rgba(16, 185, 129, 0.65)" strokeWidth="1.5" />
                <circle cx="600" cy="600" r="420" fill="none" stroke="rgba(16, 185, 129, 0.85)" strokeWidth="2.0" />

                {defaultZoneEngine.getZones().filter(z => z.id !== "Center" && !layers.directionChakra).map((zone) => {
                  let angle = (zone.startAngle + zone.endAngle) / 2;
                  if (zone.startAngle > zone.endAngle) {
                    angle = (zone.startAngle + zone.endAngle + 360) / 2;
                    if (angle >= 360) angle -= 360;
                  }
                  const pt = polarToCartesian(600, 600, 260, angle);
                  return (
                    <g key={zone.id}>
                      <rect x={pt.x - 22} y={pt.y - 9} width="44" height="18" rx="4" fill="#020617" stroke="rgba(16, 185, 129, 0.9)" strokeWidth="1.5" />
                      <text
                        x={pt.x}
                        y={pt.y + 4}
                        fill="#f1f5f9"
                        fontSize="10px"
                        fontFamily="monospace"
                        fontWeight="900"
                        textAnchor="middle"
                        letterSpacing="0.5px"
                      >
                        {zone.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* 3. VASTU DIRECTION CHAKRA */}
            {layers.directionChakra && (
              <svg className="absolute pointer-events-none" width="1200" height="1200" viewBox="0 0 1200 1200" style={{ transform: "translate(-600px, -600px)", opacity: layerConfigs.directionChakra.opacity }}>
                <circle cx="600" cy="600" r="420" fill="none" stroke="#ffffff" strokeWidth="4.0" />
                <circle cx="600" cy="600" r="411" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1.5" />
                <circle cx="600" cy="600" r="395" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.0" />
                <circle cx="600" cy="600" r="150" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />
                
                {/* 360 Degree Dial */}
                {(() => {
                  const ticks = [];
                  for(let i=0; i<360; i+=1) {
                    const isTen = i % 10 === 0;
                    const isFive = i % 5 === 0;
                    const length = isTen ? 16 : (isFive ? 12 : 8);
                    const ptStart = polarToCartesian(600, 600, 411, i);
                    const ptEnd = polarToCartesian(600, 600, 411 - length, i);
                    ticks.push(<line key={`tick-${i}`} x1={ptStart.x} y1={ptStart.y} x2={ptEnd.x} y2={ptEnd.y} stroke="#ffffff" strokeWidth={isTen ? 3.0 : (isFive ? 2.0 : 1.2)} />);
                    
                    if (isTen) {
                      const textPt = polarToCartesian(600, 600, 434, i);
                      ticks.push(
                        <text key={`text-${i}`} x={textPt.x} y={textPt.y} fill="#ffffff" fontSize="11px" fontFamily="monospace" fontWeight="900" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i}, ${textPt.x}, ${textPt.y})`}>
                          {i}°
                        </text>
                      );
                    }
                  }
                  return ticks;
                })()}

                {/* Compass Directions */}
                {(() => {
                  const compassDirs = [
                    { label: "N", angle: 0, fill: "#60a5fa", fontSize: "17px", bold: true },
                    { label: "NNE", angle: 22.5, fill: "#93c5fd", fontSize: "14px", bold: true },
                    { label: "NE", angle: 45, fill: "#38bdf8", fontSize: "15px", bold: true },
                    { label: "ENE", angle: 67.5, fill: "#4ade80", fontSize: "14px", bold: true },
                    { label: "E", angle: 90, fill: "#22c55e", fontSize: "17px", bold: true },
                    { label: "ESE", angle: 112.5, fill: "#f87171", fontSize: "14px", bold: true },
                    { label: "SE", angle: 135, fill: "#ef4444", fontSize: "15px", bold: true },
                    { label: "SSE", angle: 157.5, fill: "#fb923c", fontSize: "14px", bold: true },
                    { label: "S", angle: 180, fill: "#f97316", fontSize: "17px", bold: true },
                    { label: "SSW", angle: 202.5, fill: "#facc15", fontSize: "14px", bold: true },
                    { label: "SW", angle: 225, fill: "#eab308", fontSize: "14px", bold: true },
                    { label: "WSW", angle: 247.5, fill: "#94a3b8", fontSize: "14px", bold: true },
                    { label: "W", angle: 270, fill: "#cbd5e1", fontSize: "17px", bold: true },
                    { label: "WNW", angle: 292.5, fill: "#e2e8f0", fontSize: "14px", bold: true },
                    { label: "NW", angle: 315, fill: "#f1f5f9", fontSize: "15px", bold: true },
                    { label: "NNW", angle: 337.5, fill: "#f8fafc", fontSize: "14px", bold: true }
                  ];
                  return compassDirs.map(dir => {
                    const pt = polarToCartesian(600, 600, 365, dir.angle);
                    
                    return (
                      <g key={dir.label}>
                        {/* Line and Arrow rotated to point in the correct direction */}
                        <g transform={`rotate(${dir.angle}, 600, 600)`}>
                          <line x1="600" y1="600" x2="600" y2="180" stroke={dir.fill} strokeWidth="3.5" strokeOpacity="1.0" />
                          <polygon points="600,120 584,180 600,165 616,180" fill={dir.fill} fillOpacity="1.0" stroke="#ffffff" strokeWidth="2" />
                        </g>

                        {/* Label Circle and Text */}
                        <circle cx={pt.x} cy={pt.y} r={dir.bold ? "18" : "15"} fill="#020617" stroke={dir.fill} strokeWidth="2.5" />
                        <text
                          x={pt.x}
                          y={pt.y + (dir.bold ? 5 : 4)}
                          fill={dir.fill}
                          fontSize={dir.fontSize}
                          fontFamily="monospace"
                          fontWeight="900"
                          textAnchor="middle"
                        >
                          {dir.label}
                        </text>
                        {/* Degree Text inside the dial instead of small */}
                        <text
                          x={pt.x}
                          y={pt.y - (dir.bold ? 24 : 21)}
                          fill={dir.fill}
                          fontSize="10px"
                          fontFamily="monospace"
                          fontWeight="900"
                          textAnchor="middle"
                        >
                          {dir.angle}°
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            )}
            {/* 4. 32 ENTRANCES GRID */}
            {layers.entrances32 && (
              <svg className="absolute pointer-events-none" width="1200" height="1200" viewBox="0 0 1200 1200" style={{ transform: "translate(-600px, -600px)", opacity: layerConfigs.entrances32.opacity }}>
                <circle cx="600" cy="600" r="352" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="2.0" />
                <circle cx="600" cy="600" r="322" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="2.0" />
                
                {Array.from({ length: 32 }).map((_, i) => {
                  const startAngle = 315 + i * 11.25;
                  const dividerPtStart = polarToCartesian(600, 600, 322, startAngle);
                  const dividerPtEnd = polarToCartesian(600, 600, 352, startAngle);
                  return (
                    <line
                      key={`ent-div-${i}`}
                      x1={dividerPtStart.x}
                      y1={dividerPtStart.y}
                      x2={dividerPtEnd.x}
                      y2={dividerPtEnd.y}
                      stroke="rgba(255, 255, 255, 0.65)"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {(() => {
                  const ENTRANCES_32 = [
                    { code: "N1", angle: 320.625, positive: false },
                    { code: "N2", angle: 331.875, positive: false },
                    { code: "N3", angle: 343.125, positive: true },
                    { code: "N4", angle: 354.375, positive: true },
                    { code: "N5", angle: 5.625, positive: false },
                    { code: "N6", angle: 16.875, positive: true },
                    { code: "N7", angle: 28.125, positive: true },
                    { code: "N8", angle: 39.375, positive: false },
                    { code: "E1", angle: 50.625, positive: false },
                    { code: "E2", angle: 61.875, positive: false },
                    { code: "E3", angle: 73.125, positive: true },
                    { code: "E4", angle: 84.375, positive: true },
                    { code: "E5", angle: 95.625, positive: false },
                    { code: "E6", angle: 106.875, positive: false },
                    { code: "E7", angle: 118.125, positive: false },
                    { code: "E8", angle: 129.375, positive: false },
                    { code: "S1", angle: 140.625, positive: false },
                    { code: "S2", angle: 151.875, positive: false },
                    { code: "S3", angle: 163.125, positive: true },
                    { code: "S4", angle: 174.375, positive: true },
                    { code: "S5", angle: 185.625, positive: false },
                    { code: "S6", angle: 196.875, positive: false },
                    { code: "S7", angle: 208.125, positive: false },
                    { code: "S8", angle: 219.375, positive: false },
                    { code: "W1", angle: 230.625, positive: false },
                    { code: "W2", angle: 241.875, positive: false },
                    { code: "W3", angle: 253.125, positive: true },
                    { code: "W4", angle: 264.375, positive: true },
                    { code: "W5", angle: 275.625, positive: false },
                    { code: "W6", angle: 286.875, positive: false },
                    { code: "W7", angle: 298.125, positive: false },
                    { code: "W8", angle: 309.375, positive: false },
                  ];
                  return ENTRANCES_32.map(ent => {
                    const pt = polarToCartesian(600, 600, 337, ent.angle);
                    const color = ent.positive ? "#10b981" : "#f1f5f9";
                    return (
                      <g key={ent.code}>
                        <text
                          x={pt.x}
                          y={pt.y + 3}
                          fill={color}
                          fontSize="9px"
                          fontFamily="monospace"
                          fontWeight="900"
                          textAnchor="middle"
                        >
                          {ent.code}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            )}

            {/* 5. 45 DEVTA GRID */}
            {layers.devta45 && (
              <svg className="absolute pointer-events-none" width="1200" height="1200" viewBox="0 0 1200 1200" style={{ transform: "translate(-600px, -600px)", opacity: layerConfigs.devta45.opacity }}>
                <circle cx="600" cy="600" r="195" fill="none" stroke="rgba(234, 179, 8, 0.5)" strokeWidth="1.2" />
                <circle cx="600" cy="600" r="292" fill="none" stroke="rgba(234, 179, 8, 0.5)" strokeWidth="1.2" />
                <circle cx="600" cy="600" r="90" fill="none" stroke="rgba(234, 179, 8, 0.7)" strokeWidth="1.5" />

                <text x="600" y="603" fill="rgba(234, 179, 8, 1.0)" fontSize="10px" fontFamily="monospace" fontWeight="950" textAnchor="middle" letterSpacing="0.5px">BRAHMA</text>
                
                {(() => {
                  const INNER_DEITIES = [
                    { name: "Aryama", angle: 90, radius: 142 },
                    { name: "Vivasvan", angle: 180, radius: 142 },
                    { name: "Mitra", angle: 270, radius: 142 },
                    { name: "Bhudhar", angle: 0, radius: 142 },
                    { name: "Aap", angle: 30, radius: 240 },
                    { name: "Savitra", angle: 120, radius: 240 },
                    { name: "Indra", angle: 210, radius: 240 },
                    { name: "Rudra", angle: 300, radius: 240 }
                  ];
                  return INNER_DEITIES.map(d => {
                    const pt = polarToCartesian(600, 600, d.radius, d.angle);
                    return (
                      <text
                        key={d.name}
                        x={pt.x}
                        y={pt.y + 2.5}
                        fill="rgba(234, 179, 8, 0.9)"
                        fontSize="9px"
                        fontFamily="monospace"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {d.name.toUpperCase()}
                      </text>
                    );
                  });
                })()}

                {(() => {
                  const OUTER_DEITIES = [
                    { name: "Shikhi", angle: 315 },
                    { name: "Surya", angle: 78.75 },
                    { name: "Yama", angle: 168.75 },
                    { name: "Varuna", angle: 258.75 },
                    { name: "Jayanta", angle: 56.25 },
                    { name: "Soma", angle: 11.25 },
                    { name: "Bhallat", angle: 0 },
                    { name: "Aditi", angle: 326.25 },
                    { name: "Indra", angle: 67.5 },
                    { name: "Vitatha", angle: 146.25 },
                    { name: "Grihaksh", angle: 157.5 },
                    { name: "Sugriva", angle: 236.25 },
                    { name: "Pushpad", angle: 247.5 },
                    { name: "Asura", angle: 270 }
                  ];
                  return OUTER_DEITIES.map(d => {
                    const pt = polarToCartesian(600, 600, 327, d.angle);
                    return (
                      <text
                        key={d.name}
                        x={pt.x}
                        y={pt.y + 2.5}
                        fill="rgba(234, 179, 8, 0.9)"
                        fontSize="8px"
                        fontFamily="monospace"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {d.name.toUpperCase()}
                      </text>
                    );
                  });
                })()}
              </svg>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b13] relative overflow-hidden h-screen w-full select-none">
      
      {/* SPRINT 18 NOTIFICATION TOAST OVERLAY */}
      {toastMsg && (
        <div className="fixed bottom-14 right-6 z-50 p-3 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] flex items-center gap-2 shadow-2xl animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg.toUpperCase()}</span>
        </div>
      )}

      {/* ===================================================
          1. FLOATING ENTERPRISE CAD TOOLBAR
         =================================================== */}
      {!isPresentationMode && (
        <div 
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-slate-950/95 border border-slate-800/80 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 ${
            isUserInactive && !leftPanelPinned && !rightPanelPinned ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* Active Tool Selectors */}
          {[
            { id: "select", label: "Selector (S)", icon: MousePointer },
            { id: "pan", label: "Hand Pan (H)", icon: Hand },
            { id: "room", label: "Draw Room Zone (R)", icon: Square },
            { id: "symbol", label: "Vastu Symbols (V)", icon: Box },
            { id: "note", label: "Pin Sticky Note (N)", icon: MessageSquare },
            { id: "measure", label: "Tape Measure (M)", icon: Ruler },
            { id: "chakra", label: "📿 Vastu Chakra", icon: Maximize2 }
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  if (tool.id === "chakra") {
                    if (!isVastuChakraActive) {
                      setIsVastuChakraActive(true);
                      setChakraState(prev => ({ ...prev, x: bgImageSize.width ? bgImageSize.width / 2 : 600, y: bgImageSize.height ? bgImageSize.height / 2 : 600 }));
                      setLocalLayers(prev => ({ ...prev, compass: true, directionChakra: true, zones16: true }));
                    }
                    setSelectedId("chakra");
                    setActiveTool("chakra");
                    showToast("Switched to Master Chakra");
                    return;
                  }
                  setActiveTool(tool.id as any);
                  if (tool.id === "measure") {
                    setMeasurePoints([]);
                    setTempPoint(null);
                  }
                  showToast(`Switched to tool: ${tool.label.split("(")[0].trim()}`);
                }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center relative group transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 scale-105"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
                {/* Tooltip */}
                <span className="absolute top-12 bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-1 rounded text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                  {tool.label}
                </span>
              </button>
            );
          })}
          
          <div className="w-[1px] h-6 bg-slate-800" />
          
          {/* Lock / Unlock Compass */}
          <button
            onClick={() => {
              setChakraState(prev => ({ ...prev, isLocked: !prev.isLocked }));
              showToast(chakraState.isLocked ? "Compass Rose Unlocked" : "Compass Rose Locked");
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center relative group transition-all cursor-pointer ${
              chakraState.isLocked
                ? "bg-amber-950/30 text-amber-500 border border-amber-500/30 shadow-lg shadow-amber-500/5"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`}
          >
            {chakraState.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span className="absolute top-12 bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-1 rounded text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              {chakraState.isLocked ? "Unlock Chakra Calibration" : "Lock Chakra Calibration"}
            </span>
          </button>
          
          <div className="w-[1px] h-6 bg-slate-800" />

          {/* General Actions (Undo, Redo, Clear, Sync) */}
          <button
            onClick={triggerUndo}
            className="w-9 h-9 rounded-lg flex items-center justify-center relative group text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="absolute top-12 bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-1 rounded text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Undo Action
            </span>
          </button>
          
          <button
            onClick={triggerRedo}
            className="w-9 h-9 rounded-lg flex items-center justify-center relative group text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
            <span className="absolute top-12 bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-1 rounded text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Redo Action
            </span>
          </button>

          <button
            onClick={handleClearAll}
            className="w-9 h-9 rounded-lg flex items-center justify-center relative group text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
            title="Clear All Vectors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="absolute top-12 bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-1 rounded text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Clear Canvas
            </span>
          </button>

          <div className="w-[1px] h-6 bg-slate-800" />

          <button
            onClick={handleSaveAnnotations}
            className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center relative group transition-all cursor-pointer shadow-lg shadow-emerald-500/20 scale-105"
            title="Sync and Save Calibration"
          >
            <Save className="w-4 h-4" />
            <span className="absolute top-12 bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-1 rounded text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Sync Plots
            </span>
          </button>

          {bgImage.url && (
            <>
              <div className="w-[1px] h-6 bg-slate-800" />
              <button
                onClick={() => {
                  setIsVastuChakraActive(!isVastuChakraActive);
                  showToast(isVastuChakraActive ? "Vastu Chakra Overlay Deactivated" : "Vastu Chakra Overlay Activated");
                }}
                className={`px-3 h-9 rounded-lg flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  isVastuChakraActive
                    ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 scale-105"
                    : "text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 hover:bg-emerald-900/30"
                }`}
                title="Toggle Vastu Chakra Alignment Overlay"
              >
                <span>🧭</span>
                <span>{isVastuChakraActive ? "CLOSE VASTU CHAKRA" : "OPEN VASTU CHAKRA"}</span>
              </button>
              <button
                onClick={() => setShowChakraLibrary(true)}
                className={`px-3 h-9 rounded-lg flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  customChakraUrl
                    ? "bg-purple-500 text-slate-950 font-black shadow-lg shadow-purple-500/20 scale-105"
                    : "text-purple-400 bg-purple-950/20 border border-purple-500/20 hover:bg-purple-900/30"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>CHAKRA LIBRARY</span>
              </button>

            </>
          )}


        </div>
      )}

      {/* ===================================================
          2. FLOATING QUICK LAYER CAPSULES
         =================================================== */}
      {!isPresentationMode && (
        <div 
          className={`absolute top-18 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-slate-950/80 border border-slate-900/60 rounded-full px-4 py-1.5 shadow-xl backdrop-blur-md transition-all duration-300 ${
            isUserInactive && !leftPanelPinned && !rightPanelPinned ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {[
            { key: "blueprint", label: "Blueprint" },
            { key: "compass", label: "Compass" },
            { key: "directionChakra", label: "Chakra" },
            { key: "zones16", label: "16 Zones" },
            { key: "entrances32", label: "32 Entrances" },
            { key: "devta45", label: "45 Devta" },
            { key: "panchatattva", label: "Panchatattva" },
            { key: "grid", label: "Grid Lines" },
            { key: "rooms", label: "Rooms" },
            { key: "symbols", label: "Symbols" }
          ].map((l) => (
            <button
              key={l.key}
              onClick={() => setLayers({ ...layers, [l.key]: !layers[l.key] })}
              className={`px-2.5 py-0.5 rounded-full border text-[8px] font-bold font-mono transition-all ${
                layers[l.key] 
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold" 
                  : "bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              {l.label.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* --- SPRINT 18 WORKSPACE VIEWPORT INNER CONTAINER --- */}
      <div className="flex-1 flex flex-row relative overflow-hidden w-full h-full">
        
        {/* ===================================================
            3. SPRINT 18: COLLAPSIBLE ANALYSIS WIZARD
           =================================================== */}
        {!isPresentationMode && (
          <div 
            className={`transition-all duration-300 ease-in-out shrink-0 flex z-30 ${
              leftPanelPinned 
                ? "w-[24rem] h-full" 
                : "absolute left-4 top-24 bottom-14 rounded-xl border border-slate-800/80 bg-slate-950/95 shadow-2xl overflow-hidden"
            } ${
              isUserInactive && !leftPanelPinned && !rightPanelPinned ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {/* A. SLIM VERTICAL STEP BAR */}
            <div className="w-16 bg-[#090f1e] border-r border-slate-800/70 flex flex-col items-center justify-between py-4 select-none">
              <div className="flex flex-col items-center gap-5 w-full">
                {/* Slim logo indicator */}
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-[9px] font-black">
                  UΩ
                </div>
                
                <div className="h-[1px] w-8 bg-slate-800/60" />
                
                {/* Stepper Buttons */}
                {getStepsForMode().map((item, index) => {
                  const Icon = item.icon;
                  const isActive = wizardStep === item.step;
                  const stepsForMode = getStepsForMode();
                  const isDisabled = vastuProjectMode === "analyze" && !bgImage.url && 
                    ["ai_recognition", "north_detection", "calibration", "ai_analysis", "evidence", "remedies", "report"].includes(item.step);
                  const isPast = stepsForMode.map(s => s.step).indexOf(wizardStep) >= index;
                  
                  return (
                    <button
                      key={item.step}
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) {
                          showToast("Please upload a blueprint first to access this step");
                          return;
                        }
                        setWizardStep(item.step);
                        setIsLeftPanelOpen(true);
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center relative group transition-all cursor-pointer ${
                        isDisabled ? "opacity-30 cursor-not-allowed" : ""
                      } ${
                        isActive
                          ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 scale-105"
                          : isPast && (vastuProjectMode === "design" || bgImage.url)
                          ? "text-emerald-400 bg-emerald-950/20 hover:text-emerald-300"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                      }`}
                      title={isDisabled ? "Upload floorplan first" : item.label}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {/* Interactive step dot */}
                      <span className="absolute -bottom-1 text-[8px] font-mono font-bold text-slate-600 scale-90">
                        0{index + 1}
                      </span>
                      {/* Floating tooltip */}
                      <span className="absolute left-18 bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-1 rounded text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {/* Expand / Collapse Control */}
              <button
                onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer transition-all"
                title={isLeftPanelOpen ? "Minimize Wizard Details" : "Expand Wizard Details"}
              >
                {isLeftPanelOpen ? <ChevronLeft className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
              </button>
            </div>
            
            {/* B. STEP DETAILED DRAWER CONTENT */}
            <div 
              className={`bg-slate-950/80 backdrop-blur-md flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                isLeftPanelOpen ? "w-[20rem] border-r border-slate-800/60" : "w-0"
              }`}
            >
              <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-5">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest font-mono">
                      URJAFLUX STUDIO • STEP {getStepsForMode().map(s => s.step).indexOf(wizardStep) + 1}
                    </span>
                    <h3 className="text-xs font-bold text-slate-200 uppercase mt-0.5 tracking-tight font-mono">
                      {wizardStep === "project" && "Dossier Telemetry"}
                      {wizardStep === "blueprint" && "CAD Drawing Canvas"}
                      {wizardStep === "ai_recognition" && "AI Recognition Engine"}
                      {wizardStep === "north_detection" && "North Orientation"}
                      {wizardStep === "calibration" && "Calibration Studio"}
                      {wizardStep === "ai_analysis" && "AI Analysis Deck"}
                      {wizardStep === "evidence" && "Evidence Ledger"}
                      {wizardStep === "remedies" && "Remedy Planner"}
                      {wizardStep === "report" && "Executive Dossier"}
                      
                      {wizardStep === "plot_size" && "Plot Boundaries"}
                      {wizardStep === "design_north" && "Plot Orientation"}
                      {wizardStep === "design_chakra" && "Vastu Chakra Place"}
                      {wizardStep === "assisted_layout" && "AI Design Assistant"}
                      {wizardStep === "design_report" && "CAD Compliance Dossier"}
                    </h3>
                  </div>
                  
                  {/* Pin & Close Tools */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setLeftPanelPinned(!leftPanelPinned)}
                      className={`p-1.5 rounded hover:bg-slate-900 transition-colors cursor-pointer ${
                        leftPanelPinned ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                      title={leftPanelPinned ? "Unpin Panel (Float Overlay)" : "Pin Panel to Layout"}
                    >
                      <Pin className={`w-3.5 h-3.5 transform ${leftPanelPinned ? "rotate-45" : ""}`} />
                    </button>
                    <button
                      onClick={() => setIsLeftPanelOpen(false)}
                      className="p-1.5 rounded hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Hide panel content"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                        {/* Active Step Content */}
                <div className="flex-1 space-y-4 font-sans text-xs text-slate-300">
                  
                  {/* STEP: PROJECT SELECTION OR DETAILS */}
                  {wizardStep === "project" && (
                    <div className="space-y-4">
                      {vastuProjectMode === null ? (
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                            Welcome to URJAFLUX AI OS. To begin, select your Vastu project archetype:
                          </p>
                          
                          <div className="space-y-2.5">
                            <button
                              onClick={() => {
                                setVastuProjectMode("analyze");
                                setWizardStep("blueprint");
                                showToast("Mode A: Analyze Existing Property Selected");
                              }}
                              className="w-full text-left p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-slate-950/80 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                                  <UploadCloud className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-slate-200 block font-mono">Analyze Existing</span>
                                  <span className="text-[9px] text-slate-500 block font-mono mt-0.5">Upload floor plan blueprint & calibrate</span>
                                </div>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setVastuProjectMode("design");
                                setWizardStep("plot_size");
                                setBgImage({ name: "EMPTY_PLOT_CANVAS", url: "EMPTY_PLOT_CANVAS" });
                                setBgImageSize({ width: 800, height: 600 });
                                
                                const canvasW = window.innerWidth * 0.7; // Approx
                                const canvasH = window.innerHeight * 0.8;
                                const initialZoom = Math.min(canvasW / 800, canvasH / 600, 1.5);
                                
                                setZoom(initialZoom);
                                setPan({
                                  x: (canvasW - 800 * initialZoom) / 2,
                                  y: (canvasH - 600 * initialZoom) / 2
                                });

                                setChakraState(prev => ({ 
                                  ...prev, 
                                  x: 400, 
                                  y: 300,
                                  isLocked: false, 
                                  scale: 0.9 
                                }));
                                showToast("Mode B: Design New Property Selected");
                              }}
                              className="w-full text-left p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-slate-950/80 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                                  <Square className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-slate-200 block font-mono">Design New Property</span>
                                  <span className="text-[9px] text-slate-500 block font-mono mt-0.5">Enter plot size, design from scratch</span>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-slate-900/80 border border-slate-850 p-2.5 rounded-lg">
                            <div className="font-mono text-[10px]">
                              <span className="text-slate-500 block uppercase">Active Archetype:</span>
                              <span className="text-emerald-400 font-extrabold block">
                                {vastuProjectMode === "analyze" ? "Analyze Existing Property" : "Design New Property"}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm("Warning: Resetting mode will clear your current blueprint or plot canvas state. Continue?")) {
                                  setVastuProjectMode(null);
                                  setBgImage({ name: "", url: "" });
                                  setAnnotations([]);
                                  showToast("Project archetype reset");
                                }
                              }}
                              className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-red-500/40 text-[9px] text-slate-400 hover:text-red-400 rounded transition-all font-mono cursor-pointer"
                            >
                              RESET
                            </button>
                          </div>

                          <div className="space-y-1.5 font-mono">
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Target Property Asset</label>
                            <select
                              value={activeProperty?.id || ""}
                              onChange={(e) => {
                                const p = properties.find(prop => prop.id === e.target.value);
                                if (p) onSetActiveProperty(p);
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                            >
                              <option value="">Select Target Property...</option>
                              {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.ownerName})</option>
                              ))}
                            </select>
                          </div>
                          
                          {activeProperty && (
                            <div className="bg-[#090f1e] border border-slate-850 rounded-lg p-3 space-y-2.5 font-mono text-[10px]">
                              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                <span className="text-slate-500 uppercase">CLIENT:</span>
                                <span className="text-slate-300 font-bold">{activeProperty.ownerName}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                <span className="text-slate-500 uppercase">PLOT SIZE:</span>
                                <span className="text-slate-300 font-bold">{activeProperty.plotSize}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                <span className="text-slate-500 uppercase">FACING:</span>
                                <span className="text-emerald-400 font-bold">{activeProperty.facingDirection || "North"}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                <span className="text-slate-500 uppercase">STATUS:</span>
                                <span className="text-amber-400 font-bold">{activeProperty.constructionStatus}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* MODE A: 2. BLUEPRINT UPLOAD STEP */}
                  {wizardStep === "blueprint" && (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Upload or scale your blueprint floor plan to align geometric coordinates.
                      </p>
                      
                      {/* Real-time dropzone simulation */}
                      <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-lg p-4 bg-slate-950/40 text-center space-y-2 transition-all group relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 mx-auto transition-all animate-pulse" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-300 block uppercase font-mono">Drop floorplan drawing</span>
                          <span className="text-[8px] text-slate-500 block mt-1 font-mono">JPEG / PNG / WebP, Max 10MB</span>
                        </div>
                      </div>
                      
                      {bgImage.url && (
                        <div className="bg-[#090f1e] border border-slate-850 rounded-lg p-3 space-y-2 font-mono text-[10px]">
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-500">FILENAME:</span>
                            <span className="text-slate-300 font-bold truncate max-w-[130px]">{bgImage.name}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-500">DIMENSIONS:</span>
                            <span className="text-slate-300 font-bold">1200 x 850 px</span>
                          </div>
                          
                          {/* Custom Metric scale tuner */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 uppercase">RATIO SCALE:</span>
                              <span className="text-emerald-400 font-bold">1 px = {pixelScaleRatio} mm</span>
                            </div>
                            <select
                              value={pixelScaleRatio}
                              onChange={(e) => {
                                const r = parseInt(e.target.value) || 25;
                                showToast(`Calibration ratio updated: 1px = ${r}mm`);
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[9px] text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                            >
                              <option value={10}>Ultra Dense (1 px = 10 mm)</option>
                              <option value={25}>Standard (1 px = 25 mm)</option>
                              <option value={50}>Large Scale (1 px = 50 mm)</option>
                              <option value={100}>Industrial (1 px = 100 mm)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODE A: 3. AI RECOGNITION */}
                  {wizardStep === "ai_recognition" && (
                    <div className="space-y-3 font-mono text-[10px]">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Our neural model reads wall vectors, segments room zones, and identifies key openings.
                      </p>

                      <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-lg space-y-2.5">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-500">AI MODEL:</span>
                          <span className="text-emerald-400 font-extrabold">URJA-VISION v3.1</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-500">DETECTION CONFIDENCE:</span>
                          <span className="text-slate-200">96.8% Compliant</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-500">SEGMENTED ROOMS:</span>
                          <span className="text-slate-200 font-bold">5 Structural Zones</span>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[9px] text-emerald-400 space-y-1">
                        <span className="font-bold block uppercase tracking-wider">AI Recognition Logs:</span>
                        <div>• Wall vectors aligned to Cartesian coordinate space.</div>
                        <div>• Primary entrance recognized in Northeast boundary.</div>
                        <div>• Kitchen stove/ignition element locked in Southeast sector.</div>
                      </div>
                    </div>
                  )}

                  {/* MODE A: 4. NORTH DETECTION */}
                  {wizardStep === "north_detection" && (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Calibrate True North alignment based on property site maps.
                      </p>
                      
                      <div className="space-y-3 font-mono">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400 uppercase">NORTH DEVIATION:</span>
                            <span className="text-emerald-400 font-bold">{(engineChakra?.transform.rotation ?? chakraState.rotation)}°</span>
                          </div>
                          
                          <input
                            type="range"
                            min="0"
                            max="359"
                            value={(engineChakra?.transform.rotation ?? chakraState.rotation)}
                            onChange={(e) => {
                              const r = parseInt(e.target.value);
                              setChakraState(prev => ({ ...prev, rotation: r }));
                            }}
                            className="w-full cursor-pointer accent-emerald-500 mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                          <button
                            onClick={() => setChakraState(prev => ({ ...prev, rotation: (prev.rotation - 5 + 360) % 360 }))}
                            className="bg-slate-900 border border-slate-800 rounded py-1 text-slate-300 hover:text-white"
                          >
                            Rotate CCW (-5°)
                          </button>
                          <button
                            onClick={() => setChakraState(prev => ({ ...prev, rotation: (prev.rotation + 5) % 360 }))}
                            className="bg-slate-900 border border-slate-800 rounded py-1 text-slate-300 hover:text-white"
                          >
                            Rotate CW (+5°)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE A: 5. CALIBRATION STUDIO */}
                  {wizardStep === "calibration" && (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Calibrate Vastu Chakra dimensions relative to the blueprint's outer footprint.
                      </p>

                      <div className="space-y-3 font-mono text-[10px]">
                        <div className="space-y-1">
                          <span className="text-slate-400 uppercase block">Chakra Ring Radius:</span>
                          <input
                            type="range"
                            min="100"
                            max="500"
                            value={chakraState.scale * 300}
                            onChange={(e) => {
                              const s = parseFloat(e.target.value) / 300;
                              setChakraState(prev => ({ ...prev, scale: s }));
                            }}
                            className="w-full cursor-pointer accent-emerald-500 mt-1"
                          />
                        </div>

                        <div className="flex justify-between border-t border-slate-900 pt-2 text-[9px]">
                          <span className="text-slate-500 uppercase">CHAKRA STATUS:</span>
                          <span className="text-emerald-400 font-bold uppercase">Locked Center</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE A: 6. AI ANALYSIS */}
                  {wizardStep === "ai_analysis" && (
                    <div className="space-y-3 font-mono text-[10px]">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Toggle grid vectors, sectors, element divisions, and placements overlays instantly.
                      </p>
                      
                      <div className="bg-[#090f1e] border border-slate-850 rounded-lg p-3 space-y-3">
                        {[
                          { key: "blueprint", label: "Raster CAD Floor Plan" },
                          { key: "directionChakra", label: "Vastu Direction Chakra" },
                          { key: "zones16", label: "16 Core Vastu Zones" },
                          { key: "entrances32", label: "32 Exterior Entrances" },
                          { key: "devta45", label: "45 Vedic Devtas Plane" },
                          { key: "panchatattva", label: "Panchatattva Elements" }
                        ].map((lyr) => {
                          const config = (layerConfigs as any)[lyr.key];
                          const isVisible = (layers as any)[lyr.key];
                          return (
                          <div key={lyr.key} className="flex flex-col gap-1.5 border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between text-slate-400">
                              <span className="text-[10px] font-bold text-slate-300">{lyr.label}</span>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200" title="Toggle Lock">
                                  <input
                                    type="checkbox"
                                    checked={config.locked}
                                    onChange={(e) => setLayerConfigs({ ...layerConfigs, [lyr.key]: { ...config, locked: e.target.checked } })}
                                    className="accent-slate-500 cursor-pointer h-3 w-3"
                                  />
                                  <span className="text-[8px] uppercase">Lock</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200" title="Toggle Visibility">
                                  <input
                                    type="checkbox"
                                    checked={!!isVisible}
                                    onChange={(e) => setLayers({ ...layers, [lyr.key]: e.target.checked })}
                                    className="accent-emerald-400 cursor-pointer h-3 w-3"
                                  />
                                  <span className="text-[8px] uppercase">Vis</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] text-slate-500 w-6">OPAC</span>
                              <input
                                type="range"
                                min="0.0"
                                max="1.0"
                                step="0.05"
                                value={config.opacity}
                                onChange={(e) => setLayerConfigs({ ...layerConfigs, [lyr.key]: { ...config, opacity: parseFloat(e.target.value) } })}
                                className="w-full accent-emerald-500/50 h-1"
                              />
                            </div>
                          </div>
                        )})}
                        
                        <div className="pt-2 border-t border-slate-800/60 space-y-2 mt-2">
                          {[
                            { key: "rooms", label: "Trace Room Polygons" },
                            { key: "symbols", label: "Placed Element Symbols" },
                            { key: "grid", label: "Engineering Graph Grid" },
                            { key: "measurements", label: "Laser Measurements" }
                          ].map(lyr => (
                            <label key={lyr.key} className="flex items-center justify-between text-slate-400 cursor-pointer hover:text-slate-200 transition-colors py-0.5">
                              <span className="text-[10px]">{lyr.label}</span>
                              <input
                                type="checkbox"
                                checked={!!(layers as any)[lyr.key]}
                                onChange={(e) => setLayers({ ...layers, [lyr.key]: e.target.checked })}
                                className="accent-emerald-400 cursor-pointer h-3 w-3"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE A: 7. EVIDENCE FINDER */}
                  {wizardStep === "evidence" && (
                    <div className="space-y-4 font-mono text-[10px]">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        A dynamic index of all placed rooms, showing actual compliance values against the Vedic Vastu Codex.
                      </p>

                      <div className="space-y-1.5 text-[9px] max-h-48 overflow-y-auto">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Compliance Log</span>
                        {annotations.length === 0 ? (
                          <div className="text-slate-500 py-4 text-center border border-dashed border-slate-800 rounded">
                            No rooms traced yet. Use the sidebar tools to draw rooms.
                          </div>
                        ) : (
                          annotations.map(a => {
                            const validation = getRoomValidation(a);
                            return (
                              <div key={a.id} className="p-2 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-slate-200">{a.name}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                    validation.status === "success" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/20" :
                                    validation.status === "warning" ? "bg-amber-950/80 text-amber-400 border border-amber-500/20" :
                                    "bg-rose-950/80 text-rose-400 border border-rose-500/20"
                                  }`}>{validation.zone} Zone</span>
                                </div>
                                <p className="text-[8.5px] text-slate-400 leading-relaxed">{validation.message}</p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* MODE A: 8. VASTU REMEDIES PALETTE */}
                  {wizardStep === "remedies" && (
                    <div className="space-y-3 font-mono text-[10px]">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Spawn and position traditional remedies directly onto clashing sectors to cure defects virtually.
                      </p>

                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { name: "Brass Wire Strip", desc: "Blocks Toilet drain elements", symbolType: "remedy_brass", color: "text-amber-400" },
                          { name: "Lead Metal Helix", desc: "Enhances SW weight stability", symbolType: "remedy_lead", color: "text-sky-400" },
                          { name: "Copper Energy Pyramid", desc: "Boosts SE fire zone vitality", symbolType: "remedy_copper", color: "text-orange-400" },
                          { name: "Camphor crystal diffuser", desc: "Purifies ambient atmospheric chi", symbolType: "remedy_camphor", color: "text-teal-400" }
                        ].map((rem) => (
                          <button
                            key={rem.name}
                            onClick={() => {
                              handlePlaceRoomTemplate(rem.name, rem.symbolType, 60, 40);
                              showToast(`Spawned "${rem.name}" remedy onto design field`);
                            }}
                            className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/60 hover:border-emerald-500/40 text-left transition-all cursor-pointer flex justify-between items-center group"
                          >
                            <div>
                              <span className="text-[9.5px] font-bold text-slate-200 block group-hover:text-emerald-400 transition-colors">{rem.name}</span>
                              <span className="text-[8px] text-slate-500 block mt-0.5">{rem.desc}</span>
                            </div>
                            <span className={`text-[10px] font-bold ${rem.color}`}>+ SPAWN</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MODE B: 2. PLOT DETAILS STEP */}
                  {wizardStep === "plot_size" && (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Define physical boundary coordinates and setbacks for the raw property site.
                      </p>

                      <div className="space-y-3 font-mono text-[10px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-slate-500 uppercase">PLOT WIDTH (FT):</span>
                            <input
                              type="number"
                              value={plotWidth}
                              onChange={(e) => setPlotWidth(Math.max(10, parseInt(e.target.value) || 0))}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500 uppercase">PLOT LENGTH (FT):</span>
                            <input
                              type="number"
                              value={plotLength}
                              onChange={(e) => setPlotLength(Math.max(10, parseInt(e.target.value) || 0))}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 uppercase">FACING DIRECTION:</span>
                          <select
                            value={plotFacing}
                            onChange={(e) => setPlotFacing(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 cursor-pointer"
                          >
                            <option value="North">North (0° Deviation)</option>
                            <option value="East">East (90° Deviation)</option>
                            <option value="South">South (180° Deviation)</option>
                            <option value="West">West (270° Deviation)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase">BOUNDARY SETBACK:</span>
                            <span className="text-emerald-400 font-bold">{boundarySetback} ft</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="15"
                            value={boundarySetback}
                            onChange={(e) => setBoundarySetback(parseInt(e.target.value) || 0)}
                            className="w-full cursor-pointer accent-emerald-500 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE B: 3. DESIGN NORTH */}
                  {wizardStep === "design_north" && (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Calibrate the structural grid against magnetic North.
                      </p>

                      <div className="space-y-3 font-mono text-[10px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400 uppercase">TRUE NORTH OFFSET:</span>
                            <span className="text-emerald-400 font-bold">{(engineChakra?.transform.rotation ?? chakraState.rotation)}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="359"
                            value={(engineChakra?.transform.rotation ?? chakraState.rotation)}
                            onChange={(e) => {
                              const r = parseInt(e.target.value);
                              setChakraState(prev => ({ ...prev, rotation: r }));
                            }}
                            className="w-full cursor-pointer accent-emerald-500 mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                          <button
                            onClick={() => setChakraState(prev => ({ ...prev, rotation: (prev.rotation - 15 + 360) % 360 }))}
                            className="bg-slate-900 border border-slate-800 rounded py-1 text-slate-400 hover:text-slate-200"
                          >
                            -15° CCW
                          </button>
                          <button
                            onClick={() => setChakraState(prev => ({ ...prev, rotation: (prev.rotation + 15) % 360 }))}
                            className="bg-slate-900 border border-slate-800 rounded py-1 text-slate-400 hover:text-slate-200"
                          >
                            +15° CW
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE B: 4. DESIGN CHAKRA */}
                  {wizardStep === "design_chakra" && (
                    <div className="space-y-4 font-mono text-[10px]">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Situate the Vastu Purusha Mandala over the geometrical center (Brahmasthan) of the plot grid.
                      </p>

                      <div className="bg-[#090f1e] border border-slate-850 rounded-lg p-3 space-y-2.5">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-500">MANDALA DIVISION:</span>
                          <span className="text-emerald-400 font-bold">9x9 (81 Sectors)</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-500">BRAHMASTHAN RADIUS:</span>
                          <span className="text-slate-300">10% Central Volume</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[9px] border-t border-slate-900 pt-2">
                        <span className="text-slate-500 uppercase">CHAKRA AUTO-LOCK:</span>
                        <span className="text-emerald-400 font-extrabold uppercase">CENTRAL AXIS SUCCESS</span>
                      </div>
                    </div>
                  )}

                  {/* MODE B: 5. ASSISTED LAYOUT (AI DESIGN ASSISTANT) */}
                  {wizardStep === "assisted_layout" && (
                    <div className="space-y-3 font-mono text-[10px]">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Spawn modular spaces or run auto-placement scripts to assemble a flawless compliant layout.
                      </p>

                      <button
                        onClick={() => {
                          setAnnotations([]);
                          setTimeout(() => {
                            const cx = chakraState.x || 300;
                            const cy = chakraState.y || 250;
                            const preloaded: AnnotationItem[] = [
                              {
                                id: "puja_auto",
                                type: "room",
                                name: "Sacred Pooja Room",
                                symbolType: "puja" as any,
                                x: cx + 40,
                                y: cy - 100,
                                width: 80,
                                height: 70,
                                color: "text-amber-400",
                                bg: "bg-amber-950/20",
                                border: "border-amber-500/40",
                                rotation: 0,
                                notes: "Auto aligned to Ishanya Northeast quadrant",
                                element: "Water",
                                vastuZone: "NE",
                                customRating: 100
                              },
                              {
                                id: "kitchen_auto",
                                type: "room",
                                name: "Kitchen (Agni)",
                                symbolType: "stove" as any,
                                x: cx + 90,
                                y: cy + 30,
                                width: 100,
                                height: 80,
                                color: "text-rose-400",
                                bg: "bg-rose-950/20",
                                border: "border-rose-500/40",
                                rotation: 0,
                                notes: "Southeast fire sector layout placement",
                                element: "Fire",
                                vastuZone: "SE",
                                customRating: 100
                              },
                              {
                                id: "bedroom_auto",
                                type: "room",
                                name: "Master Bedroom",
                                symbolType: "bed" as any,
                                x: cx - 120,
                                y: cy + 50,
                                width: 120,
                                height: 90,
                                color: "text-emerald-400",
                                bg: "bg-emerald-950/20",
                                border: "border-emerald-500/40",
                                rotation: 0,
                                notes: "Southwest master stability quadrant",
                                element: "Earth",
                                vastuZone: "SW",
                                customRating: 100
                              },
                              {
                                id: "toilet_auto",
                                type: "room",
                                name: "Toilet Unit",
                                symbolType: "toilet" as any,
                                x: cx - 110,
                                y: cy - 100,
                                width: 70,
                                height: 60,
                                color: "text-sky-400",
                                bg: "bg-sky-950/20",
                                border: "border-sky-500/40",
                                rotation: 0,
                                notes: "Northwest waste drainage segment",
                                element: "None",
                                vastuZone: "NW",
                                customRating: 100
                              }
                            ];
                            setAnnotations(preloaded);
                            commitToHistory(preloaded);
                            showToast("AI Auto-Layout generated 100% compliant plan!");
                          }, 300);
                        }}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded text-[10px] tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>AUTO-LAYOUT COMPLIANT PLAN</span>
                      </button>

                      <div className="space-y-1.5 pt-1.5">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Individual Room Stamps</span>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { name: "Pooja Room", symbolType: "puja" },
                            { name: "Kitchen", symbolType: "stove" },
                            { name: "Master Bedroom", symbolType: "bed" },
                            { name: "Toilet Block", symbolType: "toilet" },
                            { name: "Water Source", symbolType: "watertank" }
                          ].map((room) => (
                            <button
                              key={room.name}
                              onClick={() => handlePlaceRoomTemplate(room.name, room.symbolType)}
                              className="px-2 py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-[9px] text-slate-300 rounded text-left transition-all cursor-pointer"
                            >
                              + {room.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Real-time Validation Box */}
                      {annotations.length > 0 && (
                        <div className="space-y-1 pt-1.5 max-h-36 overflow-y-auto">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Live Spatial Compliance</span>
                          {annotations.map(a => {
                            const val = getRoomValidation(a);
                            return (
                              <div key={a.id} className="p-1.5 rounded bg-[#090f1e] border border-slate-850/80 flex items-start gap-1.5">
                                <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${
                                  val.status === "success" ? "bg-emerald-500" :
                                  val.status === "warning" ? "bg-amber-500" : "bg-rose-500"
                                }`} />
                                <div className="text-[8.5px]">
                                  <div className="font-extrabold text-slate-300">{a.name} ({val.zone})</div>
                                  <div className="text-slate-400 mt-0.5 leading-tight">{val.message}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODE B: 6. DESIGN REPORT */}
                  {wizardStep === "design_report" && (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Validate all spatial parameters, print structural reports, and export compliance blueprints.
                      </p>

                      <button
                        onClick={() => {
                          setShowUrjaFluxModal(true);
                          showToast("Exporting Custom CAD Compliance Dossier...");
                        }}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded font-mono text-[10px] tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-950" />
                        <span>GENERATE EXECUTIVE PLAN REPORT</span>
                      </button>
                      
                      <button
                        onClick={handleSaveAnnotations}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-bold rounded font-mono text-[10px] tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-400" />
                        <span>EXPORT TO AUTOCAD DXF</span>
                      </button>
                    </div>
                  )}

                  {/* LEGACY REPORT COMPONENT PLACEHOLDER CURE */}
                  {wizardStep === "report" && (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        Compile all spatial compliance logs, and export the official executive audit documentation.
                      </p>
                      
                      <button
                        onClick={() => {
                          setShowUrjaFluxModal(true);
                          showToast("Launching Executive Dossier Report...");
                        }}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded font-mono text-[10px] tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-950" />
                        <span>GENERATE EXECUTIVE DOSSIER</span>
                      </button>
                      
                      <button
                        onClick={handleSaveAnnotations}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-bold rounded font-mono text-[10px] tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SYNC WORKSPACE DATA</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Stepper Footer Controls */}
                <div className="border-t border-slate-800/60 pt-3 flex gap-2">
                  <button
                    disabled={wizardStep === "project"}
                    onClick={() => {
                      const steps = getStepsForMode().map(s => s.step);
                      const idx = steps.indexOf(wizardStep);
                      if (idx > 0) setWizardStep(steps[idx - 1]);
                    }}
                    className="flex-1 py-1.5 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-bold font-mono text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    PREV
                  </button>
                  <button
                    disabled={
                      wizardStep === "report" || 
                      wizardStep === "design_report" || 
                      (vastuProjectMode === "analyze" && wizardStep === "blueprint" && !bgImage.url)
                    }
                    onClick={() => {
                      const steps = getStepsForMode().map(s => s.step);
                      const idx = steps.indexOf(wizardStep);
                      if (idx < steps.length - 1) setWizardStep(steps[idx + 1]);
                    }}
                    className="flex-1 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-[10px] font-black font-mono text-slate-950 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            3. CENTER INTERACTIVE CANVAS STAGE
           =================================================== */}
        <main
          className="flex-1 relative overflow-hidden bg-[#090e18] outline-none cursor-default"
          onPointerDown={handleCanvasMouseDown}
        >
          {/* Engineering grid lines helper */}
          {bgImage.url && layers.grid && (
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-75"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                  linear-gradient(to right, rgba(16, 185, 129, 0.08) 1.5px, transparent 1px),
                  linear-gradient(to bottom, rgba(16, 185, 129, 0.08) 1.5px, transparent 1px)
                `,
                backgroundSize: `${35 * zoom}px ${35 * zoom}px, ${175 * zoom}px ${175 * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`
              }}
            />
          )}

          {!bgImage.url ? (
            <div 
              className={`absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#090e18] transition-colors duration-200 ${
                isDraggingOver ? "bg-slate-900 border-2 border-dashed border-emerald-500/50" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    let base64Url = reader.result as string;
                    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                      // Beautiful blueprint mock from unsplash for visual CAD calibration
                      base64Url = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80";
                    }
                    setBgImage({
                      name: file.name,
                      url: base64Url
                    });
                    if (activeProperty) {
                      activeProperty.floorplanUrl = base64Url;
                    }
                    setIsLeftPanelOpen(true);
                    setIsRightPanelOpen(true);
                    setIsVastuChakraActive(true);
                    setWizardStep("north");
                    showToast(`Blueprint "${file.name}" loaded as base layer`);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              <div className="max-w-2xl w-full text-center space-y-6 p-10 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <UploadCloud className="w-8 h-8 text-emerald-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Upload House / Commercial / Factory Floor Plan to Begin Analysis
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                    Import a JPEG, PNG, or PDF file to automatically overlay the Vastu Chakra and calibrate environmental directions.
                  </p>
                </div>

                <label className="relative flex flex-col items-center justify-center px-4 py-8 bg-slate-950/80 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer group transition-all duration-200">
                  <div className="space-y-2 text-center">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest group-hover:text-emerald-300">
                      Browse Files / Drag & Drop
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Supports high-resolution JPG, PNG, and PDF files up to 50MB
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,.pdf" 
                    onChange={handleFileUpload} 
                  />
                </label>
              </div>
            </div>
          ) : (
            /* SPRINT 18.2 (FLASH OPTIMIZED) CANVAS */
            <div 
              onWheel={handleWheel}
              className="relative w-full h-[calc(100vh-80px)] bg-slate-950 overflow-hidden"
            >
              {/* Blueprint Image Wrapper - Zoomable and Pannable */}
              <div 
                className="absolute left-0 top-0 select-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                  width: `${bgImageSize.width}px`,
                  height: `${bgImageSize.height}px`
                }}
              >
                {layers.blueprint && bgImage.url !== "EMPTY_PLOT_CANVAS" && (
                  <img 
                    ref={blueprintImgRef}
                    src={bgImage.url} 
                    onLoad={handleImageLoad}
                    alt="Architectural calibration backdrop drawing"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-fill rounded shadow-2xl pointer-events-none select-none"
                    style={{ opacity: layerConfigs.blueprint.opacity }}
                  />
                )}
                
                {layers.blueprint && bgImage.url === "EMPTY_PLOT_CANVAS" && (
                  <div 
                    className="w-full h-full bg-slate-900 border-2 border-dashed border-slate-700 rounded shadow-2xl pointer-events-none select-none"
                    style={{ opacity: layerConfigs.blueprint.opacity }}
                  />
                )}
                
                                                {/* Master Vastu Chakra */}
                {isVastuChakraActive && engineChakra && (() => {
                  const chakraGeometry = engineChakra.geometry;
                  const handles = HandleCalculator.calculateChakraHandles(chakraGeometry);
                  const isLocked = engineChakra.isLocked;
                  const t = engineChakra.transform;
                  
                  return (
                  <div 
                    className={`absolute z-40 ${!isLocked ? "pointer-events-auto" : "pointer-events-none"}`}
                    style={{ 
                       left: `${t.position.x}px`, 
                       top: `${t.position.y}px`,
                       width: '0px',
                       height: '0px'
                     }}
                  >
                    {/* Rotated Container (for Hit Area and Handles) */}
                    <div 
                      className="absolute"
                      style={{
                        transform: `rotate(${t.rotation}deg)`,
                        width: '0px',
                        height: '0px'
                      }}
                    >
                      {/* The Scaled SVG Container (Preserving original SVG implementation) */}
                      <div 
                        className="absolute pointer-events-none" 
                        style={{ transform: `scale(${t.scale.x})`, width: '0px', height: '0px' }}
                      >
                         {/* 100% Full Opacity on original vibrant colors */}
                         <div className="absolute top-1/2 left-1/2 transition-opacity duration-300 pointer-events-none" style={{ transform: 'translate(-50%, -50%)', opacity: selectedId === "chakra" ? 1.0 : 0.95 }}>
                            
                            {customChakraUrl ? (
                              <div className="absolute pointer-events-none flex items-center justify-center" style={{ width: 0, height: 0 }}>
                                <img src={customChakraUrl} alt="Custom Chakra" className="object-contain pointer-events-none" style={{ width: "840px", height: "840px", maxWidth: "none", transform: "translate(-420px, -420px)" }} />
                              </div>
                            ) : (
                              <VastuChakraSVGOverlay className="pointer-events-none" />
                            )}

                         </div>
                      </div>

                      {/* The Hit Area - Uses engine geometry! */}
                      <div 
                         className="absolute rounded-full"
                         style={{
                            left: `${-chakraGeometry.radius}px`,
                            top: `${-chakraGeometry.radius}px`,
                            width: `${chakraGeometry.radius * 2}px`,
                            height: `${chakraGeometry.radius * 2}px`,
                            clipPath: 'circle(50% at 50% 50%)',
                            pointerEvents: isLocked ? 'none' : 'auto',
                            cursor: isLocked ? 'default' : 'move',
                            backgroundColor: 'rgba(0,0,0,0.001)' // Transparent but catches events
                         }}
                         onPointerDown={(e) => {
                           if (isLocked) return;
                           if ((e.target as HTMLElement).closest('.cad-handle')) return;
                           
                           e.stopPropagation();
                           setSelectedId("chakra");
                           setIsDraggingChakra(true);
                           const mainEl = document.querySelector("main");
                           if (mainEl) {
                             const rect = mainEl.getBoundingClientRect();
                             const coords = {
                               x: (e.clientX - rect.left - pan.x) / zoom,
                               y: (e.clientY - rect.top - pan.y) / zoom
                             };
                             setChakraDragOffset({
                               x: coords.x - chakraState.x,
                               y: coords.y - chakraState.y
                             });
                           }
                         }}
                      >
                      </div>

                      {/* Handles Container - Uses Engine HandleCalculator */}
                      {!isLocked && selectedId === "chakra" && (
                        <div className="absolute pointer-events-none" style={{ width: '0px', height: '0px' }}>
                           {handles.map((handle, i) => {
                             if (handle.type === HandleType.ROTATE) {
                               return (
                                 <div key="rotate-handle" className="absolute flex flex-col items-center pointer-events-none" style={{ transform: `translate(-50%, -50%) translate(${handle.position.x}px, ${handle.position.y}px)` }}>
                                   {/* Rotation Handle */}
                                   <div
                                      className="bg-slate-900 border border-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500/20 transition-colors pointer-events-auto cursor-grab cad-handle"
                                      style={{
                                        width: `16px`,
                                        height: `16px`,
                                        borderWidth: `1.5px`,
                                        zIndex: 10,
                                      }}
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        setIsRotatingChakra(true);
                                        const coords = getCanvasCoords(e);
                                        const dx = coords.x - chakraState.x;
                                        const dy = coords.y - chakraState.y;
                                        setChakraInteractionStart({
                                          angle: (Math.atan2(dy, dx) * 180) / Math.PI,
                                          rotation: chakraState.rotation,
                                          x: 0,
                                          y: 0,
                                          scale: chakraState.scale
                                        });
                                      }}
                                      title="Rotate Vastu Chakra"
                                   >
                                     <svg style={{ width: `10px`, height: `10px` }} className="text-emerald-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                     </svg>
                                   </div>
                                 </div>
                               );
                             }
                             if (handle.type === HandleType.SCALE) {
                               return (
                                 <div key="scale-handle" className="absolute flex flex-row items-center pointer-events-none" style={{ transform: `translate(-50%, -50%) translate(${handle.position.x}px, ${handle.position.y}px)` }}>
                                   {/* Resize Handle */}
                                   <div
                                      className="bg-slate-900 border border-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500/20 transition-colors pointer-events-auto cursor-ew-resize cad-handle"
                                      style={{
                                        width: `24px`,
                                        height: `24px`,
                                        borderWidth: `1.5px`,
                                        zIndex: 10,
                                      }}
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        setIsResizingChakra(true);
                                        const coords = getCanvasCoords(e);
                                        const dx = coords.x - chakraState.x;
                                        const dy = coords.y - chakraState.y;
                                        setChakraResizeStart({
                                          scale: chakraState.scale,
                                          dist: Math.sqrt(dx * dx + dy * dy)
                                        });
                                      }}
                                      title="Scale Vastu Chakra"
                                   >
                                     <svg style={{ width: `14px`, height: `14px` }} className="text-emerald-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                     </svg>
                                   </div>
                                 </div>
                               );
                             }
                             return null;
                           })}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })()}

                            {/* 2. SPRINT 5 INTERACTIVE ANNOTATION LAYER */}
              <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
                
                {/* Render Room Boundaries */}
                {layers.rooms &&
                  annotations
                    .filter((a) => a.type === "room" && a.width && a.height)
                    .map((room) => {
                      const isSelected = selectedId === room.id;
                      const isHovered = hoveredId === room.id;
                      const isSearchMatched = searchQuery ? room.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
                      const analysis = getVastuAnalysis(room);

                      return (
                        <div
                          key={room.id}
                          onMouseEnter={() => setHoveredId(room.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={`absolute rounded transition-all cursor-move border-2 border-dashed pointer-events-auto ${
                            isSearchMatched ? "opacity-100" : "opacity-30"
                          } ${
                            isSelected
                              ? "bg-emerald-500/15 border-emerald-400 ring-2 ring-indigo-400/40 z-30"
                              : "bg-white/20 border-slate-700 hover:border-slate-400 z-10"
                          }`}
                          style={{
                            left: `${room.x}px`,
                            top: `${room.y}px`,
                            width: `${room.width}px`,
                            height: `${room.height}px`
                          }}
                        >
                          {/* Dynamic Room Header label */}
                          <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-start pointer-events-none font-mono font-bold">
                            <div className="bg-slate-50/80 px-1.5 py-0.5 rounded border border-slate-200 text-[9px] text-slate-900 leading-tight">
                              {room.name}
                            </div>
                            
                            {/* Compliance state tag inside the room boundary */}
                            <div className={`px-1 py-0.5 rounded text-[7px] font-extrabold uppercase ${
                              analysis.compliance === "Excellent" ? "bg-emerald-500/20 text-emerald-400" :
                              analysis.compliance === "Good" ? "bg-cyan-500/20 text-cyan-400" :
                              analysis.compliance === "Defective" ? "bg-amber-500/20 text-amber-400" :
                              analysis.compliance === "Dangerous" ? "bg-rose-500/20 text-rose-400" :
                              "bg-slate-100 text-slate-400"
                            }`}>
                              {analysis.compliance}
                            </div>
                          </div>

                          {/* Dimensions Label Indicator */}
                          <div className="absolute bottom-1.5 left-1.5 bg-slate-50/90 text-slate-400 text-[8px] font-mono px-1 py-0.5 rounded border border-slate-200/60 pointer-events-none">
                            {convertPxToMetric(room.width!)} × {convertPxToMetric(room.height!)} ({calculateArea(room.width!, room.height!)})
                          </div>

                          {/* Interactive Drag Handle for room resizing (Bottom-Right Corner) */}
                          {isSelected && (
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizingRoom(true);
                                setRoomResizeDirection("br");
                                setDraggedElementId(room.id);
                              }}
                              className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-tl cursor-se-resize flex items-center justify-center shadow-lg"
                              title="Resize room envelope"
                            >
                              <span className="text-[6px] font-bold text-slate-950">↘</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                {/* Render Vector Symbol Placemarks */}
                {layers.symbols &&
                  annotations
                    .filter((a) => a.type === "symbol" || a.type === "note")
                    .map((marker) => {
                      const isSelected = selectedId === marker.id;
                      const isSearchMatched = searchQuery ? marker.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
                      
                      // Match templates to resolve icons
                      const template = SYMBOL_TEMPLATES.find((t) => t.type === marker.symbolType);
                      const IconComponent = template ? template.icon : MessageSquare;
                      const analysis = getVastuAnalysis(marker);

                      return (
                        <div
                          key={marker.id}
                          onMouseEnter={() => setHoveredId(marker.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={`absolute flex items-center justify-center rounded-full border cursor-move transition-all pointer-events-auto ${
                            isSearchMatched ? "opacity-100" : "opacity-20"
                          } ${
                            isSelected
                              ? "w-9 h-9 -ml-[18px] -mt-[18px] bg-emerald-500 border-emerald-300 ring-4 ring-indigo-500/20 z-40 scale-110 shadow-2xl shadow-indigo-500/30"
                              : "w-8 h-8 -ml-4 -mt-4 bg-[#0d1324]/90 hover:bg-white hover:scale-105 hover:border-slate-300 z-25 shadow-lg"
                          }`}
                          style={{
                            left: `${marker.x}px`,
                            top: `${marker.y}px`
                          }}
                        >
                          <IconComponent className={`w-4 h-4 ${isSelected ? "text-slate-950" : marker.color}`} />

                          {/* Compass sector badge attached directly to symbol */}
                          {marker.type === "symbol" && (
                            <span className="absolute -top-3.5 bg-slate-50 border border-slate-200 text-slate-400 font-mono text-[7px] px-1 py-0.2 rounded font-black">
                              {analysis.zone}
                            </span>
                          )}

                          {/* Simple Hover Popover for notes */}
                          {hoveredId === marker.id && !isSelected && (
                            <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-50/95 border border-slate-200 p-2.5 rounded-lg w-48 text-[9px] font-mono leading-relaxed text-slate-700 shadow-2xl pointer-events-none z-50">
                              <span className="font-bold text-slate-900 block mb-0.5">{marker.name}</span>
                              <p className="line-clamp-3">{marker.notes || "No detailed notes recorded."}</p>
                              <span className="text-[7px] text-amber-400 block mt-1 uppercase font-bold">Zone: {analysis.zone} sector</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                {/* Render Tape Measure Graphics overlay */}
                {layers.measurements && measurePoints.length > 0 && (
                  <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-45">
                    <g>
                      {/* Measured lines */}
                      {measurePoints.map((pt, index) => (
                        <circle key={`m-node-${index}`} cx={pt.x} cy={pt.y} r="4" fill="#34d399" stroke="#090e18" strokeWidth="1" />
                      ))}
                      {measurePoints.length === 1 && tempPoint && (
                        <g>
                          <line x1={measurePoints[0].x} y1={measurePoints[0].y} x2={tempPoint.x} y2={tempPoint.y} stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,3" />
                          <circle cx={tempPoint.x} cy={tempPoint.y} r="3" fill="none" stroke="#34d399" strokeWidth="1" />
                          
                          {/* Dynamic Floating calipers value text */}
                          <rect
                            x={(measurePoints[0].x + tempPoint.x)/2 - 32}
                            y={(measurePoints[0].y + tempPoint.y)/2 - 10}
                            width="64"
                            height="16"
                            rx="4"
                            fill="#090e18"
                            stroke="#34d399"
                            strokeWidth="0.5"
                          />
                          <text
                            x={(measurePoints[0].x + tempPoint.x)/2}
                            y={(measurePoints[0].y + tempPoint.y)/2 + 1}
                            fill="#34d399"
                            fontSize="7"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {convertPxToMetric(Math.sqrt(Math.pow(tempPoint.x - measurePoints[0].x, 2) + Math.pow(tempPoint.y - measurePoints[0].y, 2)))}
                          </text>
                        </g>
                      )}
                      {measurePoints.length === 2 && (
                        <g>
                          <line x1={measurePoints[0].x} y1={measurePoints[0].y} x2={measurePoints[1].x} y2={measurePoints[1].y} stroke="#10b981" strokeWidth="2" />
                          <rect
                            x={(measurePoints[0].x + measurePoints[1].x)/2 - 36}
                            y={(measurePoints[0].y + measurePoints[1].y)/2 - 10}
                            width="72"
                            height="16"
                            rx="4"
                            fill="#090e18"
                            stroke="#10b981"
                            strokeWidth="0.5"
                          />
                          <text
                            x={(measurePoints[0].x + measurePoints[1].x)/2}
                            y={(measurePoints[0].y + measurePoints[1].y)/2 + 1}
                            fill="#10b981"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {convertPxToMetric(Math.sqrt(Math.pow(measurePoints[1].x - measurePoints[0].x, 2) + Math.pow(measurePoints[1].y - measurePoints[0].y, 2)))}
                          </text>
                        </g>
                      )}
                    </g>
                  </svg>
                )}

              </div>
            </div>
          </div>
        )}

          {/* Dynamic HUD Coordinate Display */}
          {bgImage.url && (
            <div className="absolute bottom-4 left-4 bg-slate-50/80 border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-400 flex gap-4 pointer-events-none select-none">
              <div className="flex gap-1.5">
                <span className="text-slate-600 font-bold">X:</span>
                <span className="text-slate-700 font-bold">{hoverCoords.x} px</span>
              </div>
              <div className="flex gap-1.5">
                <span className="text-slate-600 font-bold">Y:</span>
                <span className="text-slate-700 font-bold">{hoverCoords.y} px</span>
              </div>
              <div className="flex gap-1.5">
                <span className="text-slate-600 font-bold">METRIC:</span>
                <span className="text-emerald-400 font-bold">{convertPxToMetric(Math.sqrt(Math.pow(hoverCoords.x, 2) + Math.pow(hoverCoords.y, 2)))}</span>
              </div>
              <div className="hidden sm:flex gap-1.5">
                <span className="text-slate-600 font-bold">MODE:</span>
                <span className="text-emerald-400 font-black uppercase">{activeTool}</span>
              </div>
            </div>
          )}

          {/* SPRINT 18: CANVAS FLOATING ZOOM CONTROLS */}
          {bgImage.url && (
            <div className="absolute bottom-4 right-4 bg-slate-950/95 border border-slate-800 rounded-xl p-1.5 flex gap-1 z-45 backdrop-blur-md shadow-2xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
                title="Zoom In"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomReset();
                }}
                className="px-2 h-7 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center font-mono text-[10px] cursor-pointer"
                title="Reset View"
              >
                Reset
              </button>
            </div>
          )}

          <CompassHUD rotation={engineChakra?.transform.rotation ?? chakraState.rotation} isLocked={engineChakra?.isLocked ?? chakraState.isLocked} isActive={isVastuChakraActive} visible={layers.compass} />
        </main>

        {/* ===================================================
            4. ANNOTATION INSPECTOR (RIGHT SIDEBAR)
           =================================================== */}
        {!isPresentationMode && (
          <aside 
            className={`transition-all duration-300 ease-in-out shrink-0 flex flex-col justify-between overflow-y-auto z-30 ${
              rightPanelPinned 
                ? "w-80 h-full border-l border-slate-850 bg-[#070b13]" 
                : "absolute right-4 top-24 bottom-14 rounded-xl border border-slate-800/80 bg-slate-950/95 shadow-2xl overflow-hidden"
            } ${
              isRightPanelOpen ? "w-80 p-4 opacity-100" : "w-0 p-0 border-none opacity-0 overflow-hidden"
            } ${
              isUserInactive && !leftPanelPinned && !rightPanelPinned ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider font-mono">
                  <Settings className="w-4 h-4 animate-spin-slow" />
                  <span>Element Inspector</span>
                </div>
                
                {/* Pin and Close Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRightPanelPinned(!rightPanelPinned)}
                    className={`p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer ${
                      rightPanelPinned ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                    }`}
                    title={rightPanelPinned ? "Unpin Inspector (Float)" : "Pin Inspector to Layout"}
                  >
                    <Pin className={`w-3.5 h-3.5 transform ${rightPanelPinned ? "rotate-45" : ""}`} />
                  </button>
                  <button
                    onClick={() => setIsRightPanelOpen(false)}
                    className="p-1 rounded hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title="Hide inspector"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {selectedId === "chakra" || selectedId === "master-chakra" ? (
                <MasterChakraInspectorPanel selectedObjectId="master-chakra" />
              ) : selectedItem ? (
                // --- ACTIVE SELECTION INSPECTOR VIEW (CRUD READ & UPDATE) ---
                <div className="space-y-4 font-mono text-xs">
                  
                  {/* 1. Name & Type Identifier */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase block font-bold">Entity Label</label>
                    <input
                      type="text"
                      value={selectedItem.name}
                      onChange={(e) => handleUpdateAnnotation(selectedItem.id, { name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 font-bold font-mono"
                    />
                  </div>

                  {/* Semantic Vastu Classification */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase block font-bold font-mono">Semantic Entity Subtype</label>
                    <select
                      value={selectedItem.subType || ""}
                      onChange={(e) => {
                        const newSubType = e.target.value;
                        const defaultNames: Record<string, string> = {
                          master_bedroom: "Master Bedroom",
                          kitchen: "Kitchen Core",
                          puja: "Sacred Puja Altar",
                          toilet: "Toilet Block",
                          mahadwara: "Mahadwara Main Door",
                          load_bearing_wall: "Load Wall Partition",
                          bay_window: "Ventilation Window",
                          borewell: "Underground Borewell",
                          septic_tank: "Septic Disposal Tank",
                          overhead_tank: "Overhead Water Reservoir"
                        };
                        const nextUpdate: Partial<AnnotationItem> = { subType: newSubType };
                        if (newSubType && defaultNames[newSubType]) {
                          nextUpdate.name = defaultNames[newSubType];
                        }
                        handleUpdateAnnotation(selectedItem.id, nextUpdate);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 font-bold font-mono cursor-pointer"
                    >
                      <option value="">-- Select Semantic Role --</option>
                      <option value="master_bedroom">Master Bedroom (Stability)</option>
                      <option value="kitchen">Kitchen / Fire Hearth (Agni)</option>
                      <option value="puja">Puja Room / Altar (Sacred)</option>
                      <option value="toilet">Toilet / Restroom (Disposal)</option>
                      <option value="mahadwara">Mahadwara (Main Entrance Gate)</option>
                      <option value="load_bearing_wall">Load-Bearing Wall (Heavy Earth)</option>
                      <option value="bay_window">Ventilation Aperture / Window</option>
                      <option value="borewell">Borewell / Fresh Water Pit</option>
                      <option value="septic_tank">Septic Accumulation Pit</option>
                      <option value="overhead_tank">Overhead Roof Water Tank</option>
                    </select>
                  </div>

                  {/* Real-world Tape Measure Dimensions (Vastu Standard) */}
                  <div className="space-y-2 border-t border-slate-900 pt-2.5">
                    <label className="text-[9px] text-slate-500 uppercase block font-black">Professional CAD Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] text-slate-500 block leading-none">Width (Feet)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={selectedItem.widthFt || ""}
                          onChange={(e) => handleUpdateAnnotation(selectedItem.id, { widthFt: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g. 12.5"
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] mt-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-slate-500 block leading-none">Length (Feet)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={selectedItem.lengthFt || ""}
                          onChange={(e) => handleUpdateAnnotation(selectedItem.id, { lengthFt: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g. 14.0"
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] mt-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-slate-500 block leading-none">Height (Feet)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={selectedItem.heightFt || ""}
                          onChange={(e) => handleUpdateAnnotation(selectedItem.id, { heightFt: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g. 10.0"
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] mt-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-slate-500 block leading-none">Wall Thick (Inch)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={selectedItem.thicknessInches || ""}
                          onChange={(e) => handleUpdateAnnotation(selectedItem.id, { thicknessInches: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g. 9.0"
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] mt-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grid coordinates & Sizes */}
                  <div className="space-y-1.5 border-t border-slate-900 pt-2">
                    <label className="text-[9px] text-slate-500 uppercase block font-bold">Canvas Vector Parameters (PX)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] text-slate-500 block leading-none">Position X</label>
                        <input
                          type="number"
                          value={selectedItem.x}
                          onChange={(e) => handleUpdateAnnotation(selectedItem.id, { x: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] mt-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-slate-500 block leading-none">Position Y</label>
                        <input
                          type="number"
                          value={selectedItem.y}
                          onChange={(e) => handleUpdateAnnotation(selectedItem.id, { y: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] mt-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* If selected item is a Room, offer Width and Height controls */}
                  {selectedItem.type === "room" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] text-slate-500 block leading-none">Width (px)</label>
                        <input
                          type="number"
                          min="20"
                          value={selectedItem.width || 0}
                          onChange={(e) => handleUpdateAnnotation(selectedItem.id, { width: parseInt(e.target.value) || 20 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] mt-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-slate-500 block leading-none">Height (px)</label>
                        <input
                          type="number"
                          min="20"
                          value={selectedItem.height || 0}
                          onChange={(e) => handleUpdateAnnotation(selectedItem.id, { height: parseInt(e.target.value) || 20 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] mt-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Rotation Dial */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-500 uppercase">Vector Rotation</span>
                      <span className="text-slate-300 font-bold">{selectedItem.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={selectedItem.rotation || 0}
                      onChange={(e) => handleUpdateAnnotation(selectedItem.id, { rotation: parseInt(e.target.value) })}
                      className="w-full cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Real-time Vastu sector compliance indicator card */}
                  {selectedItem.type !== "note" && (() => {
                    const analysis = getVastuAnalysis(selectedItem);
                    const centerPoint = {
                      x: selectedItem.x + (selectedItem.width ? selectedItem.width / 2 : 0),
                      y: selectedItem.y + (selectedItem.height ? selectedItem.height / 2 : 0)
                    };
                    defaultZoneEngine.setNorth(chakraState.rotation);
                    defaultZoneEngine.setOrigin({ x: chakraState.x, y: chakraState.y });
                    const zoneDetails = defaultZoneEngine.getZone(centerPoint, 55);

                    return (
                      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-850 space-y-2.5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                        
                        {/* Compliance score header */}
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] text-slate-500 uppercase font-black">COMPLIANCE DIAGNOSIS</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black ${
                            analysis.compliance === "Excellent" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                            analysis.compliance === "Good" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" :
                            analysis.compliance === "Remedied" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" :
                            analysis.compliance === "Defective" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                            analysis.compliance === "Dangerous" ? "bg-rose-500/15 text-rose-400 border border-rose-500/20 animate-pulse" :
                            "bg-slate-850 text-slate-400 border border-slate-800"
                          }`}>
                            {analysis.compliance}
                          </span>
                        </div>

                        <div className="text-[10px] space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500">
                            <span>DETECTION ZONE:</span>
                            <span className="text-slate-300 font-bold">{zoneDetails.name} Sector</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500">
                            <span>ZONE ELEMENT:</span>
                            <span className="text-slate-300 font-bold">{zoneDetails.element}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500 pb-1.5 border-b border-slate-850">
                            <span>ELEMENT VECTOR:</span>
                            <span className="text-sky-400 font-bold">{analysis.element}</span>
                          </div>
                          
                          <div className="pt-1.5">
                            <span className="text-[7.5px] text-slate-500 uppercase font-bold tracking-wider">Scientific Advice:</span>
                            <p className="text-[9px] text-slate-300 italic pt-0.5 leading-relaxed bg-[#060a12]/80 p-2 rounded border border-slate-850">
                              "{analysis.advice}"
                            </p>
                          </div>

                          {/* Scripture citations display */}
                          {analysis.evidenceLinks && analysis.evidenceLinks.length > 0 && (
                            <div className="pt-1.5">
                              <span className="text-[7.5px] text-slate-500 uppercase font-bold tracking-wider">Classical Evidence:</span>
                              <div className="space-y-1 mt-0.5 bg-slate-950/40 p-2 rounded border border-slate-900">
                                {analysis.evidenceLinks.map((ev, idx) => (
                                  <div key={idx} className="text-[8px] text-slate-400 leading-relaxed">
                                    <span className="text-emerald-400 font-bold">{ev.scripture} {ev.verse}</span>
                                    <p className="mt-0.5 italic text-slate-500 leading-normal font-sans">"{ev.text}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Active Remediation Switches */}
                          {analysis.remedies && analysis.remedies.length > 0 && (
                            <div className="pt-2 border-t border-slate-850">
                              <span className="text-[8px] text-emerald-400 font-black uppercase tracking-wider block mb-1">Interactive Remedies Available</span>
                              <div className="space-y-1.5">
                                {analysis.remedies.map((rem) => {
                                  const isChecked = (selectedItem.remediesApplied || []).includes(rem.id);
                                  return (
                                    <label 
                                      key={rem.id} 
                                      className={`flex items-start gap-2 p-1.5 rounded border transition-colors cursor-pointer ${
                                        isChecked 
                                          ? "bg-emerald-500/5 border-emerald-500/20 text-slate-200" 
                                          : "bg-slate-950/30 border-slate-900 text-slate-400 hover:text-slate-300"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const currentRemedies = selectedItem.remediesApplied || [];
                                          let nextRemedies = [...currentRemedies];
                                          if (e.target.checked) {
                                            if (!nextRemedies.includes(rem.id)) nextRemedies.push(rem.id);
                                          } else {
                                            nextRemedies = nextRemedies.filter(r => r !== rem.id);
                                          }
                                          handleUpdateAnnotation(selectedItem.id, { remediesApplied: nextRemedies });
                                          showToast(`${e.target.checked ? "Activated" : "Deactivated"} remedy: ${rem.name}`);
                                        }}
                                        className="accent-emerald-500 mt-0.5"
                                      />
                                      <div className="flex-1 leading-tight">
                                        <div className="flex items-center justify-between font-bold text-[8.5px]">
                                          <span className={isChecked ? "text-emerald-400" : ""}>{rem.name}</span>
                                          <span className="text-[7px] text-slate-500 font-normal">Rating: {"★".repeat(rem.costRating)}</span>
                                        </div>
                                        <p className="text-[7.5px] text-slate-500 mt-0.5 leading-normal">{rem.description}</p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Sticky memo notes text area */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase block font-bold">Field / Consultant Notes</label>
                    <textarea
                      rows={3}
                      value={selectedItem.notes || ""}
                      onChange={(e) => handleUpdateAnnotation(selectedItem.id, { notes: e.target.value })}
                      placeholder="Enter site notes or manual observations..."
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 resize-none font-mono leading-relaxed"
                    />
                  </div>

                  {/* Elements deletion (CRUD DELETE) */}
                  <div className="pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleDeleteAnnotation(selectedItem.id)}
                      className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-900/30 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>DELETE ELEMENT</span>
                    </button>
                  </div>

                </div>
              ) : (
                // --- NO ACTIVE SELECTION PLACEHOLDER STATE ---
                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-600 bg-slate-950/40 border border-dashed border-slate-850 rounded-xl p-4">
                  <MousePointer className="w-8 h-8 text-slate-700 animate-bounce mb-2" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">No Node Inspected</span>
                  <p className="text-[9px] text-slate-500 mt-1 max-w-[200px] leading-relaxed font-mono">
                    Select any room bounding box, sticky note pin, or Vastu symbol on the canvas to inspect its geometric values.
                  </p>
                </div>
              )}

              {/* List of current placements inventory */}
              <div className="space-y-2 pt-2 border-t border-slate-900 font-mono text-xs">
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                  Placements Index ({annotations.length})
                </span>
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {annotations
                    .filter(a => searchQuery ? a.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
                    .map((a) => {
                      const isSelected = selectedId === a.id;
                      const analysis = getVastuAnalysis(a);
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            setSelectedId(a.id);
                            setIsRightPanelOpen(true);
                          }}
                          className={`w-full text-left p-1.5 rounded text-[10px] flex justify-between items-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400"
                              : "bg-slate-950/20 border border-slate-900 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span className="truncate max-w-[130px] font-bold">{a.name}</span>
                          <div className="flex gap-1 items-center font-mono text-[8px] shrink-0">
                            {a.type !== "note" && (
                              <span className="text-slate-500">{analysis.zone}</span>
                            )}
                            <span className={`px-1 rounded font-bold ${
                              a.type === "room" ? "bg-emerald-500/10 text-emerald-400" :
                              a.type === "symbol" ? "bg-emerald-500/10 text-emerald-400" :
                              "bg-amber-500/10 text-amber-400"
                            }`}>
                              {a.type.toUpperCase()}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                  {annotations.length === 0 && (
                    <div className="text-[9px] text-slate-600 italic py-4 text-center font-mono">
                      No active placements registered. Use tools to begin.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Senior Vastu Expert Real-time Recommendations */}
            <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-3 space-y-2 mt-4 font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Expert Advice Feed</span>
              </div>
              
              <div className="space-y-1.5 text-[9px] leading-normal text-slate-400">
                {totalVastuScore >= 80 ? (
                  <div className="flex gap-1.5 items-start">
                    <span className="text-emerald-400 font-black">✓</span>
                    <p>Exceptional cosmic alignment! Ready for dossier validation and export certification.</p>
                  </div>
                ) : totalVastuScore >= 60 ? (
                  <div className="flex gap-1.5 items-start">
                    <span className="text-amber-400 font-black">⚠️</span>
                    <p>Satisfactory rating. Water or fire anomalies detected. Re-tune symbol zones to hit 85%+.</p>
                  </div>
                ) : (
                  <div className="flex gap-1.5 items-start">
                    <span className="text-rose-400 font-black">⛔</span>
                    <p>Critical Vastu clash. Northeast heaviness or South toilets are contaminating prana vectors.</p>
                  </div>
                )}
              </div>
            </div>

          </aside>
        )}

      </div>

      {/* ===================================================
          5. CAD STATUS BAR (BOTTOM PINNED)
         =================================================== */}
      {!isPresentationMode && (
        <div className="h-10 bg-slate-950 border-t border-slate-900 px-4 flex items-center justify-between font-mono text-[9px] text-slate-400 select-none z-45 relative shrink-0">
          <div className="flex items-center gap-4">
            {/* Cursor Coordinates */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="text-slate-500">X:</span>
              <span className="text-emerald-400 font-bold w-12 text-right block">{hoverCoords.x} px</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-500">Y:</span>
              <span className="text-emerald-400 font-bold w-12 text-right block">{hoverCoords.y} px</span>
            </div>
            
            {/* Metric Scale Ratio Output */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-[8.5px]">
              <span className="text-slate-500 uppercase">RATIO:</span>
              <span className="text-slate-300 font-bold">1 px = {pixelScaleRatio} mm</span>
            </div>

            {/* Total Placed Items indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-[8.5px]">
              <span className="text-slate-500 uppercase">NODES:</span>
              <span className="text-slate-300 font-bold">{annotations.length} Active Placements</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Compass Status */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-850">
              <span className="text-slate-500">TRUE NORTH:</span>
              <span className="text-emerald-400 font-bold">{(engineChakra?.transform.rotation ?? chakraState.rotation)}° N</span>
              <span className={`w-1.5 h-1.5 rounded-full ${chakraState.isLocked ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`} />
            </div>

            {/* View mode indicator */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-850 text-[8.5px]">
              <span className="text-slate-500 uppercase">VIEW:</span>
              <span className="text-emerald-400 font-black">{isPresentationMode ? "PRESENTATION MODE" : "ENGINEERING CAD"}</span>
            </div>

            {/* Toggle Inspector Hotkey tip */}
            <span className="hidden xl:inline text-slate-500 font-bold text-[8px] bg-slate-900/60 border border-slate-850 px-2 py-1 rounded">
              SHORTCUTS: L (WIZARD) | I (INSPECTOR) | F (FOCUS)
            </span>
            
            <div className="w-[1px] h-4 bg-slate-800" />

            {/* Quick Knowledge Base shortcut */}
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate("knowledge");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900/30 text-emerald-400 rounded-lg font-bold hover:text-emerald-200 transition-colors cursor-pointer"
              title="Open Universal Knowledge & Rule Engines"
            >
              <BookOpen className="w-3 h-3 text-emerald-400" />
              <span className="text-[8.5px] uppercase font-mono">Knowledge Base</span>
            </button>

            {/* Exit Workspace back to main OS Dashboard */}
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate("dashboard");
                } else {
                  showToast("Closing Spatial Calibration Studio...");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/30 text-rose-400 rounded-lg font-bold hover:text-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-[8.5px] uppercase">Exit Studio</span>
            </button>
          </div>
        </div>
      )}

      {/* SPRINT 18: EXECUTIVE DOSSIER MODAL OVERLAY */}
      {showUrjaFluxModal && activeProperty && (
        <UrjaFluxReportModal
          clientId={activeProperty.clientId || (clients && clients[0]?.id) || "dummy_client"}
          propertyId={activeProperty.id}
          onClose={() => setShowUrjaFluxModal(false)}
        />
      )}

      {/* OBJECT & CHAKRA LIBRARY MODAL */}
      <ChakraLibraryModal
        isOpen={showChakraLibrary}
        onClose={() => setShowChakraLibrary(false)}
        onSelectObject={handleSelectLibraryObject}
      />



    </div>
  );
}


