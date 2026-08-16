import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Layers,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle,
  Sliders,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  SlidersHorizontal,
  FolderOpen,
  Image as ImageIcon,
  Cpu,
  UserCheck,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Code,
  Layers3,
  Split,
  Merge,
  Maximize2
} from 'lucide-react';

import {
  ImageAsset,
  Detection,
  OCRText,
  InspectionObservation,
  VisionProject,
  SymbolType,
  DefectType,
  UserRole,
  ImageFormat,
  ValidationStatus
} from '../../core/vision/VisionTypes';

import { ImageIngestionEngine } from '../../core/vision/ImageIngestionEngine';
import { OcrEngine } from '../../core/vision/OcrEngine';
import { SymbolRecognitionEngine } from '../../core/vision/SymbolRecognitionEngine';
import { SiteInspectionEngine } from '../../core/vision/SiteInspectionEngine';
import { RasterToVectorPipeline, VectorLine, CandidatePolygon } from '../../core/vision/RasterToVectorPipeline';
import { ModelAbstractionManager, VisionAIProvider } from '../../core/vision/ModelAbstractionLayer';
import { HumanReviewWorkflow } from '../../core/vision/HumanReviewWorkflow';

export const VisionWorkspacePage: React.FC = () => {
  // Roles & Project Setup
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [activeProject, setActiveProject] = useState<VisionProject | null>(null);
  const [modelProviders, setModelProviders] = useState<VisionAIProvider[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<string>('gemini-3.6-flash');

  // Asset States
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Core Perception Detections (Live state)
  const [ocrTexts, setOcrTexts] = useState<OCRText[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [observations, setObservations] = useState<InspectionObservation[]>([]);

  // Raster-To-Vector States (Phase 5)
  const [vectorLines, setVectorLines] = useState<VectorLine[]>([]);
  const [candidatePolygons, setCandidatePolygons] = useState<CandidatePolygon[]>([]);
  const [rasterVectorLogs, setRasterVectorLogs] = useState<string[]>([]);

  // Integration & Transfer log
  const [transferAuditLog, setTransferAuditLog] = useState<string[]>([]);
  const [spatialTransferSuccess, setSpatialTransferSuccess] = useState<boolean>(false);

  // Active View Modes inside Canvas
  const [viewMode, setViewMode] = useState<'ORIGINAL' | 'DETECTIONS' | 'OCR' | 'HEATMAP' | 'VECTORS'>('DETECTIONS');
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const [selectedObservationId, setSelectedObservationId] = useState<string | null>(null);

  // Interactive annotation state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Custom Annotation creation values
  const [newAnnotationType, setNewAnnotationType] = useState<SymbolType>('DOOR');
  const [newAnnotationLabel, setNewAnnotationLabel] = useState<string>('Manually Added Swing Door');

  // Filter types
  const [symbolFilter, setSymbolFilter] = useState<string>('ALL');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(50);

  // Load Initial Project and Providers
  useEffect(() => {
    const ingestion = ImageIngestionEngine.getInstance();
    const proj = ingestion.createSampleVisionProject();
    setActiveProject(proj);

    const modelManager = ModelAbstractionManager.getInstance();
    setModelProviders(modelManager.getProviders());
    setActiveProviderId(modelManager.getActiveProvider().id);

    // Bootstrap sample assets
    const bootstrap = async () => {
      const asset1 = await ingestion.ingestImageAsset('resort_ground_plan_blueprint.png', 'PNG', proj.id);
      const asset2 = await ingestion.ingestImageAsset('site_north_elevation_audit_photo.jpg', 'CAMERA_PHOTO', proj.id);
      setAssets([asset1, asset2]);
      setSelectedAssetId(asset1.id);
    };
    bootstrap();
  }, []);

  // Run Perception Engine whenever selected asset or model provider changes
  useEffect(() => {
    if (!selectedAssetId) return;
    const asset = assets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    const runAIPerception = async () => {
      setIsProcessing(true);
      try {
        // Set provider in abstract layer
        const modelManager = ModelAbstractionManager.getInstance();
        modelManager.setActiveProvider(activeProviderId);
        const provider = modelManager.getActiveProvider();

        // 1. Run OCR
        const parsedOcr = await provider.runOcr(asset);
        setOcrTexts(parsedOcr);

        // 2. Run Symbol Object Detection
        const parsedDets = await provider.detectObjects(asset);
        setDetections(parsedDets);

        // 3. Run Site Inspection
        const parsedObs = await provider.classifySiteDefects(asset);
        setObservations(parsedObs);

        // 4. Run Raster to Vector extraction
        const vectorResult = await RasterToVectorPipeline.getInstance().processRasterToVector(asset);
        setVectorLines(vectorResult.candidateLines);
        setCandidatePolygons(vectorResult.candidatePolygons);
        setRasterVectorLogs(vectorResult.processingLog);

        setSpatialTransferSuccess(false);
      } catch (err) {
        console.error('AI Perception Layer processing error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    runAIPerception();
  }, [selectedAssetId, activeProviderId]);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  // Ingestion Handler
  const handleIngestFile = async (format: ImageFormat, fileName: string) => {
    if (!activeProject) return;
    const ingestion = ImageIngestionEngine.getInstance();
    const newAsset = await ingestion.ingestImageAsset(fileName, format, activeProject.id);
    setAssets(prev => [...prev, newAsset]);
    setSelectedAssetId(newAsset.id);
  };

  // Human Review Handlers
  const handleAcceptDetection = (id: string, notes?: string) => {
    const det = detections.find(d => d.id === id);
    if (!det) return;
    const reviewer = userRole;
    const updated = HumanReviewWorkflow.getInstance().acceptDetection(det, reviewer, notes);
    setDetections(prev => prev.map(d => d.id === id ? updated : d));
  };

  const handleRejectDetection = (id: string, notes?: string) => {
    const det = detections.find(d => d.id === id);
    if (!det) return;
    const reviewer = userRole;
    const updated = HumanReviewWorkflow.getInstance().rejectDetection(det, reviewer, notes);
    setDetections(prev => prev.map(d => d.id === id ? updated : d));
  };

  const handleManualOverrideConfidence = (id: string, newConf: number) => {
    const det = detections.find(d => d.id === id);
    if (!det) return;
    const updated: Detection = {
      ...det,
      confidence: {
        ...det.confidence,
        overallPercent: newConf,
        isHighConfidence: newConf >= 80
      },
      manualOverride: true,
      validationStatus: 'MANUALLY_EDITED',
      audit: {
        ...det.audit,
        changeLog: [...det.audit.changeLog, `[${new Date().toISOString()}] Confidence manually overridden to ${newConf}%`]
      }
    };
    setDetections(prev => prev.map(d => d.id === id ? updated : d));
  };

  // Merge Detections (Phase 8)
  const handleMergeDetections = (idA: string, idB: string) => {
    const detA = detections.find(d => d.id === idA);
    const detB = detections.find(d => d.id === idB);
    if (!detA || !detB) return;

    const merged = HumanReviewWorkflow.getInstance().mergeDetections(
      detA,
      detB,
      `Merged ${detA.symbolType} & ${detB.symbolType}`,
      detA.symbolType,
      userRole
    );

    setDetections(prev => [...prev.filter(d => d.id !== idA && d.id !== idB), merged]);
    setSelectedDetectionId(merged.id);
  };

  // Split Detection (Phase 8)
  const handleSplitDetection = (id: string) => {
    const det = detections.find(d => d.id === id);
    if (!det) return;

    const timestamp = new Date().toISOString();
    // Split into 2 halves
    const part1: Detection = {
      ...det,
      id: `${det.id}-PART-1`,
      label: `${det.label} (Split Part A)`,
      boundingBox: { ...det.boundingBox, width: det.boundingBox.width / 2 },
      validationStatus: 'MANUALLY_EDITED',
      audit: {
        createdBy: userRole,
        updatedBy: userRole,
        changeLog: [`[${timestamp}] Created via split of ${det.id}`]
      }
    };

    const part2: Detection = {
      ...det,
      id: `${det.id}-PART-2`,
      label: `${det.label} (Split Part B)`,
      boundingBox: {
        ...det.boundingBox,
        x: det.boundingBox.x + det.boundingBox.width / 2,
        width: det.boundingBox.width / 2
      },
      validationStatus: 'MANUALLY_EDITED',
      audit: {
        createdBy: userRole,
        updatedBy: userRole,
        changeLog: [`[${timestamp}] Created via split of ${det.id}`]
      }
    };

    setDetections(prev => [...prev.filter(d => d.id !== id), part1, part2]);
    setSelectedDetectionId(part1.id);
  };

  // Transfer Detections to Spatial CAD Engine (Phase 11)
  const handleTransferToDomain11 = () => {
    const reviewer = userRole;
    const result = HumanReviewWorkflow.getInstance().transferApprovedToDomain11(
      detections,
      ocrTexts,
      reviewer
    );

    setTransferAuditLog(result.auditLog);
    setSpatialTransferSuccess(true);
  };

  // Drawing Annotation Handlers (Phase 8)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'DETECTIONS' || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setDrawEnd({ x, y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setDrawEnd({ x, y });
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !drawStart || !drawEnd || !selectedAsset) return;
    setIsDrawing(false);

    const x = Math.min(drawStart.x, drawEnd.x);
    const y = Math.min(drawStart.y, drawEnd.y);
    const width = Math.abs(drawStart.x - drawEnd.x);
    const height = Math.abs(drawStart.y - drawEnd.y);

    // Prevent adding tiny accidental boxes
    if (width < 0.01 || height < 0.01) {
      setDrawStart(null);
      setDrawEnd(null);
      return;
    }

    const timestamp = new Date().toISOString();
    const newDet: Detection = {
      id: `DET-MANUAL-${Date.now()}`,
      version: 1,
      assetId: selectedAsset.id,
      symbolType: newAnnotationType,
      label: newAnnotationLabel,
      boundingBox: { x, y, width, height },
      confidence: {
        overallPercent: 100,
        classConfidence: 100,
        boxConfidence: 100,
        isHighConfidence: true
      },
      modelName: 'Manual Human Annotation',
      detectedAt: timestamp,
      validationStatus: 'APPROVED',
      manualOverride: true,
      associatedOcrTextIds: [],
      metadata: { isManuallyAdded: true },
      audit: {
        createdBy: userRole,
        updatedBy: userRole,
        changeLog: [`[${timestamp}] Created manually by ${userRole}`]
      }
    };

    setDetections(prev => [...prev, newDet]);
    setSelectedDetectionId(newDet.id);
    setDrawStart(null);
    setDrawEnd(null);
  };

  // Filtered lists
  const filteredDetections = detections.filter(d => {
    if (symbolFilter !== 'ALL' && d.symbolType !== symbolFilter) return false;
    if (d.confidence.overallPercent < confidenceThreshold) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Workspace Header & Abstract Model Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              DOMAIN-012 Vision AI Perception Layer
            </span>
            <span className="text-xs text-slate-400">• Raster Image, PDF, Scan, and Photo Object Detector</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <Camera className="w-6 h-6 text-emerald-400" />
            Enterprise Vision AI Inspection Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Performs OCR, symbol recognition, site inspection defects classification and edge tracing.
            Approved objects are forwarded strictly to <span className="text-emerald-400 font-bold">DOMAIN-011 Spatial CAD Engine</span> for geometric validation.
          </p>
        </div>

        {/* Vision Project Meta & Role switcher */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Active Provider Selector (Phase 10: Model Abstraction) */}
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-1">
              Active Vision Model Provider
            </label>
            <select
              value={activeProviderId}
              onChange={(e) => setActiveProviderId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-emerald-400 outline-none cursor-pointer"
            >
              {modelProviders.map(provider => (
                <option key={provider.id} value={provider.id} className="bg-slate-900 text-slate-100">
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role selector */}
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-1">
              Reviewer Workspace RBAC
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-sky-400 outline-none cursor-pointer"
            >
              <option value="ADMIN" className="bg-slate-900 text-slate-100">ADMIN</option>
              <option value="PROJECT_MANAGER" className="bg-slate-900 text-slate-100">PROJECT_MANAGER</option>
              <option value="FIELD_ENGINEER" className="bg-slate-900 text-slate-100">FIELD_ENGINEER</option>
              <option value="END_USER" className="bg-slate-900 text-slate-100">END_USER (View Only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Asset Pipeline & Ingestion Queue */}
        <div className="xl:col-span-3 space-y-6">
          {/* Project Details */}
          {activeProject && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">Active Inspection Project</h3>
              <p className="text-sm font-semibold text-white">{activeProject.name}</p>
              <p className="text-xs text-slate-500 mt-1">{activeProject.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono border-t border-slate-800/60 pt-3">
                <div>
                  <span className="text-slate-500">Building ID:</span>
                  <div className="text-slate-300 font-bold">{activeProject.buildingId}</div>
                </div>
                <div>
                  <span className="text-slate-500">Asset Count:</span>
                  <div className="text-slate-300 font-bold">{assets.length} Ingested</div>
                </div>
              </div>
            </div>
          )}

          {/* Ingestion & Upload Container (Phase 2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Image Ingestion Engine</span>
              <span className="text-[10px] text-emerald-400">Phase 2</span>
            </h3>

            {/* Simulated Drag & Drop Zone / Rapid Ingestion Buttons */}
            <div className="border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition bg-slate-950/40">
              <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-300">Drag & drop inspection media here</div>
              <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, BMP, TIFF, WebP, PDF Pages</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fast Ingestion Presets:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleIngestFile('PNG', `foyer_scan_${Date.now()}.png`)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-left text-[11px] font-mono flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  PNG Blueprint
                </button>
                <button
                  onClick={() => handleIngestFile('CAMERA_PHOTO', `defect_kitchen_leak_${Date.now()}.jpg`)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-left text-[11px] font-mono flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-orange-400" />
                  Site Photograph
                </button>
              </div>
            </div>
          </div>

          {/* Ingested Assets list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-3">Batch Processing Queue</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {assets.map((asset) => {
                const isSelected = asset.id === selectedAssetId;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'bg-emerald-600/10 border-emerald-500'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center shrink-0">
                      {asset.fileFormat === 'CAMERA_PHOTO' ? (
                        <Camera className="w-5 h-5 text-amber-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate text-slate-200">{asset.fileName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-mono flex items-center gap-1.5">
                        <span>{asset.fileFormat}</span>
                        <span>•</span>
                        <span>{(asset.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate font-mono">{asset.sourceDevice}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Vision workspace canvas (Interactive image & detection layer) */}
        <div className="xl:col-span-6 space-y-4">
          {/* Canvas Mode Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {(['ORIGINAL', 'DETECTIONS', 'OCR', 'HEATMAP', 'VECTORS'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === mode
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 font-mono px-2">
              Resolution: {selectedAsset?.widthPx} x {selectedAsset?.heightPx} px
            </div>
          </div>

          {/* Interactive Canvas Viewer Stage */}
          <div
            ref={canvasContainerRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl select-none group"
            style={{ cursor: viewMode === 'DETECTIONS' ? 'crosshair' : 'default' }}
          >
            {isProcessing ? (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <div className="text-xs font-mono text-slate-300">Running AI Vision Inference Pipeline...</div>
              </div>
            ) : null}

            {/* Blueprint Grid / Site Image representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              {selectedAsset?.fileFormat === 'CAMERA_PHOTO' ? (
                // Defect inspection image visual mock
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 opacity-85" />
                  <div className="z-10 text-center">
                    <Camera className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <div className="text-sm font-semibold text-slate-400">Site Audit Photograph</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{selectedAsset?.fileName}</div>
                  </div>
                </div>
              ) : (
                // Floor plan CAD drawing visual mock
                <div className="w-full h-full relative bg-slate-900 grid grid-cols-12 grid-rows-6 opacity-30 pointer-events-none">
                  {Array.from({ length: 72 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-slate-800" />
                  ))}
                  {/* Subtle Vector Floorplan Overlay lines */}
                  <div className="absolute inset-x-8 inset-y-6 border border-emerald-500/20 rounded-md" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-500/15" />
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-500/15" />
                </div>
              )}
            </div>

            {/* View Mode: VECTORS - Raster to Vector extracted paths (Phase 5) */}
            {viewMode === 'VECTORS' && (
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                {/* Render extracted lines */}
                {vectorLines.map((line) => (
                  <line
                    key={line.id}
                    x1={`${line.start.x * 100}%`}
                    y1={`${line.start.y * 100}%`}
                    x2={`${line.end.x * 100}%`}
                    y2={`${line.end.y * 100}%`}
                    stroke={line.lineType === 'WALL_CANDIDATE' ? '#10b981' : '#475569'}
                    strokeWidth={line.thickness}
                    strokeDasharray={line.lineType === 'GRID_LINE' ? '4,4' : undefined}
                    className="animate-pulse"
                  />
                ))}
                {/* Render polygons */}
                {candidatePolygons.map((poly) => (
                  <polygon
                    key={poly.id}
                    points={poly.points.map(p => `${p.x * 100}%,${p.y * 100}%`).join(' ')}
                    fill="rgba(16, 185, 129, 0.05)"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                  />
                ))}
              </svg>
            )}

            {/* View Mode: OCR - Display OCR Texts (Phase 3) */}
            {viewMode === 'OCR' && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {ocrTexts.map((ocr) => (
                  <div
                    key={ocr.id}
                    style={{
                      left: `${ocr.boundingBox.x * 100}%`,
                      top: `${ocr.boundingBox.y * 100}%`,
                      width: `${ocr.boundingBox.width * 100}%`,
                      height: `${ocr.boundingBox.height * 100}%`,
                    }}
                    className="absolute border border-blue-500/50 bg-blue-500/5 flex items-center justify-center p-0.5 text-[8px] font-mono font-bold text-blue-300 pointer-events-auto"
                    title={`Confidence: ${ocr.confidencePercent}% | Type: ${ocr.category}`}
                  >
                    <span className="bg-slate-950/80 px-1 py-0.5 rounded border border-blue-500/20 truncate">
                      {ocr.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* View Mode: HEATMAP - Visualized confidence weights (Phase 7) */}
            {viewMode === 'HEATMAP' && (
              <div className="absolute inset-0 z-10 pointer-events-none bg-slate-950/20">
                {detections.map((det) => {
                  const isLow = det.confidence.overallPercent < 80;
                  return (
                    <div
                      key={det.id}
                      style={{
                        left: `${det.boundingBox.x * 100}%`,
                        top: `${det.boundingBox.y * 100}%`,
                        width: `${det.boundingBox.width * 100}%`,
                        height: `${det.boundingBox.height * 100}%`,
                      }}
                      className={`absolute border flex items-center justify-center ${
                        isLow
                          ? 'bg-rose-500/20 border-rose-500 animate-pulse'
                          : 'bg-emerald-500/20 border-emerald-500'
                      }`}
                    >
                      <span className="bg-slate-950/90 text-[10px] font-mono px-1.5 py-0.5 rounded text-white font-bold">
                        {det.confidence.overallPercent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View Mode: DETECTIONS - Display interactive object bounding boxes (Phase 4, 6) */}
            {viewMode === 'DETECTIONS' && (
              <div className="absolute inset-0 z-10">
                {/* Active detections list */}
                {filteredDetections.map((det) => {
                  const isSelected = det.id === selectedDetectionId;
                  const isLowConfidence = det.confidence.overallPercent < 80;
                  return (
                    <div
                      key={det.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDetectionId(det.id);
                      }}
                      style={{
                        left: `${det.boundingBox.x * 100}%`,
                        top: `${det.boundingBox.y * 100}%`,
                        width: `${det.boundingBox.width * 100}%`,
                        height: `${det.boundingBox.height * 100}%`,
                      }}
                      className={`absolute border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/10 ring-2 ring-sky-400/50 z-20'
                          : isLowConfidence
                            ? 'border-amber-500 bg-amber-500/5 hover:border-amber-400'
                            : 'border-emerald-500 bg-emerald-500/5 hover:border-emerald-400'
                      }`}
                    >
                      {/* Label badge */}
                      <div className="flex items-center justify-between p-1">
                        <span className="text-[8px] font-bold text-white bg-slate-950/90 border border-slate-700 rounded px-1 truncate max-w-[80%]">
                          {det.symbolType}: {det.label}
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                          isLowConfidence ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                        }`}>
                          {det.confidence.overallPercent}%
                        </span>
                      </div>

                      {/* Status dot in bottom right */}
                      <div className="flex justify-end p-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          det.validationStatus === 'APPROVED'
                            ? 'bg-emerald-400'
                            : det.validationStatus === 'REJECTED'
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                        }`} />
                      </div>
                    </div>
                  );
                })}

                {/* Live draw feedback box */}
                {isDrawing && drawStart && drawEnd && (
                  <div
                    style={{
                      left: `${Math.min(drawStart.x, drawEnd.x) * 100}%`,
                      top: `${Math.min(drawStart.y, drawEnd.y) * 100}%`,
                      width: `${Math.abs(drawStart.x - drawEnd.x) * 100}%`,
                      height: `${Math.abs(drawStart.y - drawEnd.y) * 100}%`,
                    }}
                    className="absolute border-2 border-dashed border-sky-400 bg-sky-400/10 z-30"
                  />
                )}
              </div>
            )}
          </div>

          {/* Quick instructions / manual draw toolbar */}
          {viewMode === 'DETECTIONS' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono text-sky-400 uppercase tracking-wider flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" /> Manual Annotation Tool
                </span>
                <p className="text-xs text-slate-400">
                  Select a category, click & drag on the canvas stage to outline a new bounding box.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={newAnnotationType}
                  onChange={(e) => setNewAnnotationType(e.target.value as SymbolType)}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 outline-none font-semibold text-slate-300"
                >
                  <option value="DOOR">DOOR</option>
                  <option value="WINDOW">WINDOW</option>
                  <option value="WALL_SEGMENT">WALL SEGMENT</option>
                  <option value="COLUMN">COLUMN</option>
                  <option value="BEAM">BEAM</option>
                  <option value="FURNITURE">FURNITURE</option>
                  <option value="NORTH_ARROW">NORTH COMPASS</option>
                  <option value="ROOM_LABEL">ROOM LABEL</option>
                </select>

                <input
                  type="text"
                  value={newAnnotationLabel}
                  onChange={(e) => setNewAnnotationLabel(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 outline-none text-slate-300 w-44"
                  placeholder="Annotation name"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Human Review & Validation Control Center */}
        <div className="xl:col-span-3 space-y-6">
          {/* Filtering and list header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Perception Filter Controls</h3>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Symbol Type filter</label>
                <select
                  value={symbolFilter}
                  onChange={(e) => setSymbolFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 outline-none text-slate-300"
                >
                  <option value="ALL">All Categories</option>
                  <option value="DOOR">Doors</option>
                  <option value="WINDOW">Windows</option>
                  <option value="WALL_SEGMENT">Wall Segments</option>
                  <option value="COLUMN">Columns</option>
                  <option value="NORTH_ARROW">North Compass</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                  Confidence cutoff: {confidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Site Inspection Defect Observations (Phase 6) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between mb-3">
              <span>Site Defect Observations</span>
              <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">Phase 6</span>
            </h3>
            {observations.length === 0 ? (
              <p className="text-xs text-slate-500">No photo observations present.</p>
            ) : (
              <div className="space-y-2">
                {observations.map((obs) => {
                  const isCritical = obs.severity === 'CRITICAL' || obs.severity === 'HIGH';
                  return (
                    <div
                      key={obs.id}
                      onClick={() => {
                        setViewMode('DETECTIONS');
                        setSelectedObservationId(obs.id);
                      }}
                      className={`p-2.5 rounded-xl border text-[11px] transition cursor-pointer ${
                        obs.id === selectedObservationId
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {obs.defectType} ({obs.severity})
                        </span>
                        <span className="text-slate-400 font-mono text-[9px]">{obs.confidencePercent}%</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{obs.description}</p>
                      <div className="text-[9px] text-slate-500 font-mono mt-1.5">Context: {obs.locationContext}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detections / Symbol list & Review Decisions (Phase 7 & 8) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Perception Review Queue</h3>
              <span className="text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-bold font-mono">
                {filteredDetections.length} Items
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredDetections.map((det) => {
                const isSelected = det.id === selectedDetectionId;
                const isLow = det.confidence.overallPercent < 80;
                return (
                  <div
                    key={det.id}
                    onClick={() => setSelectedDetectionId(det.id)}
                    className={`p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      isSelected
                        ? 'border-sky-400 bg-sky-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{det.label}</span>
                      <span className={`text-[10px] font-mono font-bold px-1 rounded ${
                        isLow ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                      }`}>
                        {det.confidence.overallPercent}%
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span>{det.symbolType}</span>
                      <span>•</span>
                      <span className={`${
                        det.validationStatus === 'APPROVED' ? 'text-emerald-400' :
                        det.validationStatus === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {det.validationStatus}
                      </span>
                    </div>

                    {/* Detailed expanded reviewer controls for selected item */}
                    {isSelected && (
                      <div className="mt-3 border-t border-slate-800 pt-3 space-y-2.5 z-10">
                        {isLow && (
                          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] p-2 rounded-lg flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Low Confidence. Manual verification recommended.</span>
                          </div>
                        )}

                        {/* RBAC constraints on review actions */}
                        {userRole === 'END_USER' ? (
                          <p className="text-[10px] text-slate-500 italic">Review actions disabled for END_USER role</p>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => handleAcceptDetection(det.id, 'Verified on scan drawing')}
                                className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectDetection(det.id, 'Invalid signature')}
                                className="px-2 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 border border-rose-500/20"
                              >
                                <Trash2 className="w-3 h-3" /> Reject
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => handleSplitDetection(det.id)}
                                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold transition flex items-center justify-center gap-1 border border-slate-700"
                              >
                                <Split className="w-3 h-3" /> Split Object
                              </button>
                              <button
                                onClick={() => {
                                  // Find another object of same type to merge
                                  const sibling = detections.find(d => d.id !== det.id && d.symbolType === det.symbolType);
                                  if (sibling) {
                                    handleMergeDetections(det.id, sibling.id);
                                  }
                                }}
                                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold transition flex items-center justify-center gap-1 border border-slate-700"
                              >
                                <Merge className="w-3 h-3" /> Merge Sibling
                              </button>
                            </div>

                            {/* Confidence Slider manual override */}
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold block mb-1">Override Confidence value</label>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                value={det.confidence.overallPercent}
                                onChange={(e) => handleManualOverrideConfidence(det.id, Number(e.target.value))}
                                className="w-full accent-sky-400"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL: Spatial Registry Pipeline Export / Integration Log (Phase 11) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              DOMAIN-011 Geometry Ingress Pipe
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-emerald-400" />
              Perception-to-Geometry Transition Engine
            </h2>
            <p className="text-xs text-slate-400">
              Transfer verified physical features into the main spatial database. High-precision coordinate translation matches pixels to floor scale.
            </p>
          </div>

          <button
            onClick={handleTransferToDomain11}
            disabled={detections.filter(d => d.validationStatus === 'APPROVED').length === 0}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer text-xs"
          >
            <Send className="w-4 h-4" /> Export Detections to DOMAIN-011 Spatial Engine
          </button>
        </div>

        {spatialTransferSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle className="w-4.5 h-4.5" />
              <span>Detections successfully processed into Spatial Geometry Registry!</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Traceability Audit Chain</span>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-1 font-mono text-[10px] text-slate-300">
                {transferAuditLog.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-emerald-500 select-none">✓</span>
                    <p>{log}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vector / Line Processing Logs block */}
      {viewMode === 'VECTORS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-3">Raster-to-Vector Pipeline Processing Output</h3>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-emerald-400 space-y-1 max-h-[150px] overflow-y-auto">
            {rasterVectorLogs.map((log, i) => (
              <p key={i}>{log}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
