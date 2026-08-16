import React, { useState } from "react";
import {
  FileText, ArrowRight, CornerDownRight, CheckCircle2, AlertTriangle,
  Play, RefreshCw, Layers, Shield, Activity, GitMerge, Network,
  Database, Lock, Search, Zap, Trash2, Eye, Save, RotateCcw,
  Sliders, User, Clock, Check, ChevronRight, X, AlertCircle, Sparkles,
  Award, Archive, ChevronDown, CheckSquare, Plus, Upload, Compass, HelpCircle
} from "lucide-react";

// Interfaces for Lifecycle Workflow Steps
interface StageSpecification {
  id: number;
  name: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  uiState: string;
  commands: string[];
  events: string[];
  entityChanges: string[];
  validationRules: string[];
  errorRecovery: string;
  telemetryTarget: string;
}

export default function ProjectWorkflowValidationPage() {
  // Navigation & Sub-Tabs
  const [activeTab, setActiveTab] = useState<"stepper" | "deliverables" | "statemachine">("stepper");
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [activeDeliverable, setActiveDeliverable] = useState<string>("diagram");

  // Simulated Audit Trail state for validation logs
  const [auditLogs, setAuditLogs] = useState<string[]>([
    "[AUDIT] Project 'Vedic-Tech HQ' initialized in WGS84 space.",
    "[AUDIT] Hash validation for Floor-01-Draft.pdf succeeded: SHA256-8A3F29D...",
    "[AUDIT] Calibration factor calculated: 1px = 0.045m.",
    "[AUDIT] Reference North confirmed at 14.5 degrees east.",
    "[AUDIT] Spatial recognition confidence matched 92.4% standard threshold."
  ]);

  // Stage-by-Stage Architectural Specifications
  const stages: StageSpecification[] = [
    {
      id: 1,
      name: "Project Creation",
      purpose: "Instantiate durable project context within the Entity database and establish Workspace coordinates.",
      inputs: ["Project Name (string)", "Client (string)", "Location Coordinates (WGS84)", "Measurement Unit (Metric/Imperial)", "Project Type (Commercial/Residential)", "Project Notes (text)"],
      outputs: ["Project UUID", "Default Layers Object", "Audit Trail Ledger", "Workspace Canvas Coordinates Template"],
      uiState: "ProjectOnboardingPanel: renders location queries, defaults to appropriate drafting grid presets.",
      commands: [
        "Cmd.CreateProject { id: UUID, details: ProjectMetadata }",
        "Cmd.InitializeWorkspaceCoordinates { datum: 'WGS84', unit: 'METRIC' }",
        "Cmd.BootAuditTrail { projectId: UUID }"
      ],
      events: [
        "Evt.ProjectCreated { projectId: UUID, client: String }",
        "Evt.WorkspaceInitialized { bounds: MapBounds }",
        "Evt.AuditLedgerRegistered { hash: String }"
      ],
      entityChanges: [
        "Insert ProjectNode [UUID] containing metadata properties.",
        "Bind default Layers Collection { 'Structural', 'Sanitary', 'Annotations' } to ProjectNode.",
        "Initialize WorkspaceState node with defaults."
      ],
      validationRules: [
        "Project Name must exceed 4 characters and contain zero illegal HTML injection tokens.",
        "GPS coordinates must fall within valid coordinate bounds (-90 to +90, -180 to +180)."
      ],
      errorRecovery: "If remote Firestore handshake fails, write to local encrypted IndexedDB queue and queue offline sync. Alert user with non-blocking toast.",
      telemetryTarget: "Execution Delay < 120ms; DB payload size < 4KB; network payload < 1.2KB."
    },
    {
      id: 2,
      name: "Import Pipeline",
      purpose: "Ingest visual or technical files (PDF, DWG, DXF, PNG, SVG) and dispatch vectorization workers.",
      inputs: ["Source File Stream", "Format Type", "File Size Metadata", "SHA256 Fingerprint"],
      outputs: ["ImportJob UUID", "Raw Graphic Layer Object", "Verification Metadata Record"],
      uiState: "ImportPipelineManager: shows file drop zones, size checkers, progress tracking gauges.",
      commands: [
        "Cmd.DispatchImportWorker { fileId: UUID, type: 'PDF_RASTER' }",
        "Cmd.VerifyFileFingerprint { hash: 'SHA256-...' }"
      ],
      events: [
        "Evt.ImportJobQueued { id: UUID, type: String }",
        "Evt.FileFingerprintVerified { matches: true }",
        "Evt.RasterPreparationCompleted { layerId: UUID }"
      ],
      entityChanges: [
        "Insert ImportJobNode into state tracking queue.",
        "Append GraphicLayer entity to active ProjectNode children."
      ],
      validationRules: [
        "File size must not exceed 150MB maximum buffer.",
        "Validate MIME type against registered importers whitelist."
      ],
      errorRecovery: "Corrupt file fallback: Cancel worker instantly, flush half-allocated binary buffers from memory cache, notify user to upload uncompressed PDF.",
      telemetryTarget: "Parallel execution on 4 Web Workers; max main thread block < 16ms (60 FPS maintained)."
    },
    {
      id: 3,
      name: "Scale Calibration",
      purpose: "Establish physical coordinates measurement scaling from pixel distances.",
      inputs: ["Two Vector points: p1(x,y), p2(x,y)", "Known Distance (meters)", "Precision Margin Of Error threshold"],
      outputs: ["Scaling Ratio constant (px/meter)", "Calibration Factor Metadata"],
      uiState: "ScaleCalibrationRuler: interactive drawing tool snapping to visual bounds to define actual length.",
      commands: [
        "Cmd.SetCalibrationScale { p1: Coord, p2: Coord, length: 12.5m }"
      ],
      events: [
        "Evt.ScaleCalibrated { ratio: 22.45, accuracyMargin: 0.001 }"
      ],
      entityChanges: [
        "Update WorkspaceState properties with 'calibrationFactor' and 'unitConversionRatio'."
      ],
      validationRules: [
        "Selected pixel distance must exceed 20px to prevent high-tolerance division errors.",
        "Length input must represent a positive rational real number > 0.01m."
      ],
      errorRecovery: "Unreasonable scale input protection: If pixel-to-meter ratio results in a 1px = 100m error margin, flag as potential user input mistake. Request validation re-entry.",
      telemetryTarget: "Re-rendering trigger latency < 10ms; execution is synchronous."
    },
    {
      id: 4,
      name: "North Orientation",
      purpose: "Configure astronomical rotation vector of space to align analysis grids properly.",
      inputs: ["Orientation Angle (degrees)", "Source (Manual Vector/AI Compass Detection)"],
      outputs: ["North Rotation Vector Matrix", "Declination Constant"],
      uiState: "NorthCompassIndicator: overlay dial allowing rotary alignment of true solar direction.",
      commands: [
        "Cmd.SetNorthAngle { rotation: 14.5 }"
      ],
      events: [
        "Evt.NorthOrientationChanged { angle: 14.5, source: 'MANUAL' }"
      ],
      entityChanges: [
        "Update ProjectNode with property 'northOrientationOffset' in radians."
      ],
      validationRules: [
        "Angle must fall within [0, 360) degree bounds."
      ],
      errorRecovery: "Fallback: Standardize defaults to 0.00 degrees (Absolute North) and permit hot-recalculation at any point without losing spatial layouts.",
      telemetryTarget: "Matrix transform math completes in < 1ms."
    },
    {
      id: 5,
      name: "Geometry Review",
      purpose: "Inspect ingested lines and points, highlight broken structures, duplicate segments, and open wall polygons.",
      inputs: ["Raw Vector Collections", "Tolerance Closeness Range"],
      outputs: ["GeometryIssue[]", "Analyzed Vertices Matrix"],
      uiState: "GeometryInspectorOverlay: renders red circular nodes over unjoined wall intersections.",
      commands: [
        "Cmd.AnalyzeGeometryErrors { bounds: ViewportBounds }",
        "Cmd.RepairConnectedVerts { joinDistance: 0.05m }"
      ],
      events: [
        "Evt.GeometryIssuesDetected { count: 12, categories: ['BROKEN_WALL', 'DUPLICATE_LINE'] }",
        "Evt.AutoGeometryRepairExecuted { fixedCount: 8 }"
      ],
      entityChanges: [
        "Update Vertices indexes in state memory.",
        "Unlink orphaned lines and merge coincident points."
      ],
      validationRules: [
        "Walls must represent closed-loop multi-point boundaries to support accurate prana air-volume analysis.",
        "Intersection overlap distances should not exceed wall thickness margins."
      ],
      errorRecovery: "Suggest corrections with automatic healing algorithm, permitting the user to click 'Auto-Heal All' or bypass warning alerts manually.",
      telemetryTarget: "Search indexing spatial octree built in < 45ms for 10,000 vectors."
    },
    {
      id: 6,
      name: "Spatial Recognition",
      purpose: "Execute AI model segmentation pipelines to automatically isolate wall boundaries, doors, and window openings.",
      inputs: ["Raster Bitmap / Vector Collection", "Confidence Cutoff Score"],
      outputs: ["SpatialSegment[]: bounding box layouts with confidence scores"],
      uiState: "SpatialRecognitionOverlay: transparent heatmaps indicating AI confidence levels on walls and entry points.",
      commands: [
        "Cmd.TriggerSpatialSegmentation { imageRef: UUID }",
        "Cmd.AcceptAIPositioning { items: IdentifiedObjects[] }"
      ],
      events: [
        "Evt.SegmentationJobStarted { trackingId: UUID }",
        "Evt.SegmentationJobCompleted { count: 32, avgConfidence: 0.94 }"
      ],
      entityChanges: [
        "Instantiate WallEntity, DoorEntity, WindowEntity nodes in the spatial database.",
        "Construct parent-child linkages: DoorEntity children bound to parent WallEntity nodes."
      ],
      validationRules: [
        "Recognized structures must hold confidence levels above 60% default setting before auto-instantiating."
      ],
      errorRecovery: "Manual bypass: Permit the architect to manually draw, move, or split structural nodes directly on the canvas to override or correct bad AI classifications.",
      telemetryTarget: "Cloud model execution < 2.5s; client canvas sync < 8ms."
    },
    {
      id: 7,
      name: "Object Classification",
      purpose: "Assign architectural/functional semantic meanings to isolated geometric zones (e.g., Bedroom, Kitchen, Puja room).",
      inputs: ["Enclosed Polygon bounds", "Functional Type Assignment"],
      outputs: ["ClassifiedZone[] containing semantic markers"],
      uiState: "ZoneClassificationPanel: dropdown list assigning room classes to selected visual boundaries.",
      commands: [
        "Cmd.ClassifyZone { id: UUID, roomType: 'KITCHEN' }",
        "Cmd.MergeNeighborZones { parent: UUID, child: UUID }"
      ],
      events: [
        "Evt.ZoneClassificationChanged { zoneId: UUID, type: 'KITCHEN' }"
      ],
      entityChanges: [
        "Update ZoneEntity properties: set 'semanticType' to 'KITCHEN' and recalculate spatial area property."
      ],
      validationRules: [
        "Zone boundary must consist of a mathematically closed loop.",
        "Functional assignments must match the supported types array schema."
      ],
      errorRecovery: "If an undefined custom room class is submitted, map to fallback type 'CUSTOM_ZONE' and store string label in custom metadata attribute.",
      telemetryTarget: "Area calculations complete in < 2ms."
    },
    {
      id: 8,
      name: "Analysis Pipeline",
      purpose: "Execute multi-stage Vastu and spatial calculations, integrating knowledge base rules with geometrical offsets.",
      inputs: ["Active Workspace Project Database", "Location declination angle", "Functional Zone Classifications"],
      outputs: ["AnalysisResult: scoring values, energy quadrant vectors, rules violation array"],
      uiState: "AnalysisStatusOverlay: progress bar indicating active pipeline phases (Pre-validation -> Rule Prep -> evaluation).",
      commands: [
        "Cmd.ExecuteSpatialAudit { projectId: UUID }",
        "Cmd.LoadRuleset { rulesetId: 'Vedic-Core-V1' }"
      ],
      events: [
        "Evt.AuditPipelineStarted { rulesCount: 144 }",
        "Evt.KnowledgeBaseRetrieved { matches: 28 }",
        "Evt.SpatialAnalysisCompleted { overallScore: 84.5 }"
      ],
      entityChanges: [
        "Insert SpatialAnalysisResultNode under parent ProjectNode.",
        "Append diagnostic reference keys directly to evaluated entities."
      ],
      validationRules: [
        "Vastu centerpoint (Brahmasthan) must be mathematically calculated based on convex envelope vertices."
      ],
      errorRecovery: "If the analysis fails mid-calculation due to geometric polygon loop gaps, fallback to boundary estimation algorithm and complete remaining rule checks. Log warning to Diagnostics.",
      telemetryTarget: "Pipeline completion < 800ms for 1,000-room complex layouts."
    },
    {
      id: 9,
      name: "Findings & Diagnostics",
      purpose: "Consolidate and categorize structural problems and compliance discrepancies by severity (Critical, Major, Minor, Info).",
      inputs: ["AnalysisResult Node", "Entity References"],
      outputs: ["DiagnosticFinding[]: containing exact affected entities and supporting rules citations"],
      uiState: "DiagnosticsDashboard: prioritized warning feed with expandable code-level audit citations.",
      commands: [
        "Cmd.CreateFinding { severity: 'CRITICAL', ruleCode: 'V-E-01', targetEntity: UUID }"
      ],
      events: [
        "Evt.FindingRegistered { findingId: UUID, severity: 'CRITICAL' }"
      ],
      entityChanges: [
        "Instantiate FindingNode under parent SpatialAnalysisResultNode.",
        "Bind visual diagnostic highlight markers directly to corresponding UI layers."
      ],
      validationRules: [
        "Each finding must maintain explicit links to a supporting rule code and at least one spatial entity."
      ],
      errorRecovery: "Gracefully suppress duplicated findings referring to identical wall vertices to keep diagnostic outputs clean and highly readable.",
      telemetryTarget: "UI rendering lag < 15ms during filtering."
    },
    {
      id: 10,
      name: "Recommendations",
      purpose: "Generate intelligent corrective actions and spatial improvements mapped directly to the active findings.",
      inputs: ["DiagnosticFinding[]", "Knowledge Database matching patterns"],
      outputs: ["RecommendationProposal[]"],
      uiState: "RecommendationsPanel: actionable modification cards with simulated interactive 'Apply Action' controls.",
      commands: [
        "Cmd.ProposeRecommendation { findingId: UUID, proposal: String, estimatedImpact: Integer }"
      ],
      events: [
        "Evt.RecommendationGenerated { id: UUID, associatedFinding: UUID }"
      ],
      entityChanges: [
        "Insert ProposeRecommendationNode connected to parent FindingNode."
      ],
      validationRules: [
        "Recommendations must include a calculated estimated priority level and a defined supporting citation."
      ],
      errorRecovery: "If the AI recommendation generator engine times out, fallback to template-based structural rulesets to populate static solutions instantly.",
      telemetryTarget: "Evaluation completes in < 250ms."
    },
    {
      id: 11,
      name: "Report Studio",
      purpose: "Assemble structural geometry, diagnostic results, and corrective actions into a polished, editable client report.",
      inputs: ["ProjectNode", "SpatialAnalysisResultNode", "Brand Styles Settings"],
      outputs: ["Draft Report Document", "Editable PDF stream"],
      uiState: "ReportEditorCanvas: print preview page layout with configurable sections, custom logos, and toggle switches.",
      commands: [
        "Cmd.AssembleReportDraft { sections: SelectedSections[] }",
        "Cmd.SaveReportEdits { reportId: UUID, textContent: Object }"
      ],
      events: [
        "Evt.ReportDraftCreated { reportId: UUID }",
        "Evt.ReportSaved { reportId: UUID }"
      ],
      entityChanges: [
        "Instantiate ReportDocumentNode containing markdown paragraphs and dynamic chart references."
      ],
      validationRules: [
        "Selected sections list must include Executive Summary and Findings by default."
      ],
      errorRecovery: "Autosave restoration: Local buffer saves document edits every 10 seconds. In case of browser crash, recover the last edited version automatically.",
      telemetryTarget: "Document serialization & asset packaging < 120ms."
    },
    {
      id: 12,
      name: "Review & Approval",
      purpose: "Progress report state through standard audit review, managing revision requests and final publisher locks.",
      inputs: ["ReportDocumentNode", "Reviewer Identity", "Role Permission"],
      outputs: ["Approved Report Cryptographic signature", "Published Document Node"],
      uiState: "ApprovalWorkflowCenter: digital signature panels, revision comments feed, and audit locking buttons.",
      commands: [
        "Cmd.SubmitForReview { documentId: UUID }",
        "Cmd.ApproveReport { documentId: UUID, signature: CryptoHash }"
      ],
      events: [
        "Evt.DocumentStatusChanged { id: UUID, oldStatus: 'DRAFT', newStatus: 'APPROVED' }",
        "Evt.AuditTrailLocked { hash: String }"
      ],
      entityChanges: [
        "Update ReportDocumentNode state attribute to 'APPROVED' and lock all properties from further user edits."
      ],
      validationRules: [
        "User approving must hold high-security role permission: 'SENIOR_CONSULTANT'."
      ],
      errorRecovery: "If digital signature fails check, revert document status back to 'DRAFT', unlock entities, and register validation failure to System Logs.",
      telemetryTarget: "Verification completed in < 5ms."
    },
    {
      id: 13,
      name: "Export",
      purpose: "Compile and download reports and geometric files in standard cross-platform file types (PDF, JSON, CSV).",
      inputs: ["Approved ReportDocumentNode", "Export Formats Selection"],
      outputs: ["Binary PDF/JSON files", "Export History Log"],
      uiState: "ExportUtilityDialog: download indicators, type select checkboxes, and download success alerts.",
      commands: [
        "Cmd.ExportDocument { id: UUID, format: 'PDF' }"
      ],
      events: [
        "Evt.ExportDispatched { documentId: UUID, format: 'PDF' }",
        "Evt.ExportCompleted { fileUrl: String }"
      ],
      entityChanges: [
        "Append ExportActivityNode to ProjectNode audit ledger collection."
      ],
      validationRules: [
        "Only approved and locked reports are allowed to be packaged for client-facing PDF downloads."
      ],
      errorRecovery: "If download package generation fails due to a network interruption, cache the binary on local temporary storage and offer a resume download mechanism.",
      telemetryTarget: "Export processing completed in < 1.5s."
    },
    {
      id: 14,
      name: "Project Archive",
      purpose: "Freeze project state to preserve analytical data, audit logs, and spatial layouts, saving resources without deletion.",
      inputs: ["Active Project ID"],
      outputs: ["Archived Project Package", "Project Index Entry"],
      uiState: "ProjectManagementDashboard: archived project listings with a quick 'Restore Project' trigger.",
      commands: [
        "Cmd.ArchiveProject { projectId: UUID }",
        "Cmd.RestoreArchivedProject { projectId: UUID }"
      ],
      events: [
        "Evt.ProjectArchived { id: UUID }",
        "Evt.ProjectRestored { id: UUID }"
      ],
      entityChanges: [
        "Update ProjectNode state property to 'ARCHIVED'. Remove active references from active in-memory search indices."
      ],
      validationRules: [
        "Active editing on archived projects is fully restricted until a formal 'Restore Project' command completes."
      ],
      errorRecovery: "If the archive process is interrupted, the rollback mechanism automatically marks the project as 'ACTIVE' to prevent corrupted, partially frozen file states.",
      telemetryTarget: "Archive processing completed in < 100ms; memory freed > 25MB."
    }
  ];

  // Helper to add custom audit logs
  const addAuditLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setAuditLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 7)]);
  };

  const currentStage = stages.find(s => s.id === selectedStageId) || stages[0];

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#04060a]">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* ========================================================= */}
        {/* HEADER SECTION */}
        {/* ========================================================= */}
        <div className="border-b border-slate-900 pb-5">
          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">CHAPTER 03</span>
          <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight mt-1">Production-Grade Lifecycle & Workflow Validation Panel</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            The formal verification suite for URJAFLUX AI OS. Step through the deterministic project lifecycle to analyze how the system layers coordinate through events, transactional command stacks, and strict entity-relationship bounds.
          </p>
        </div>

        {/* ========================================================= */}
        {/* NAVIGATION SUB-TABS */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1 border-b border-slate-900/60 pb-3">
          {[
            { id: "stepper", label: "1. Stage-by-Stage Telemetry Stepper", icon: Compass },
            { id: "statemachine", label: "2. Workflow State Machine Rules", icon: Sliders },
            { id: "deliverables", label: "3. Consolidated Architectural Deliverables", icon: Layers }
          ].map(tab => {
            const IsActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-7.5 px-3.5 rounded font-bold font-mono flex items-center gap-2 transition-all text-[10px] uppercase border ${
                  IsActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: STAGE-BY-STAGE STEPPER */}
        {/* ========================================================================= */}
        {activeTab === "stepper" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-12 gap-6">
              
              {/* Vertical Step Selector Sidebar */}
              <div className="col-span-4 bg-[#060a12]/80 border border-slate-900 rounded p-4 space-y-2 max-h-[640px] overflow-y-auto custom-scrollbar">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block pb-2 border-b border-slate-900">
                  Select Lifecycle Stage
                </span>
                <div className="space-y-1">
                  {stages.map(stg => {
                    const isSelected = selectedStageId === stg.id;
                    return (
                      <button
                        key={stg.id}
                        onClick={() => {
                          setSelectedStageId(stg.id);
                          addAuditLog(`Switched validation focus to Stage ${stg.id}: ${stg.name}`);
                        }}
                        className={`w-full p-2 rounded-sm text-left font-mono transition-all border flex items-center justify-between ${
                          isSelected
                            ? "bg-indigo-950/40 text-indigo-400 border-indigo-500/20 font-bold"
                            : "bg-[#04060a]/60 text-slate-400 border-transparent hover:bg-slate-900/60 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-slate-600">0{stg.id}</span>
                          <span className="text-[10px] truncate max-w-[150px]">{stg.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isSelected ? "translate-x-0.5 text-indigo-400" : ""}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stage Specifications Sheet */}
              <div className="col-span-8 bg-[#060a12]/40 border border-slate-900 rounded p-6 space-y-6">
                <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded">
                      Stage 0{currentStage.id} Validation Target
                    </span>
                    <h3 className="text-base font-bold font-mono text-slate-100 mt-2">{currentStage.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{currentStage.purpose}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] text-slate-500 uppercase font-bold block">Latency SLA Budget</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">{currentStage.telemetryTarget}</span>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Inputs and Outputs */}
                  <div className="space-y-4">
                    <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded space-y-1.5">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Input Payload Signatures</span>
                      <ul className="space-y-1 pl-1">
                        {currentStage.inputs.map((inp, idx) => (
                          <li key={idx} className="text-[9.5px] text-slate-500 font-mono flex items-center gap-1.5">
                            <CornerDownRight className="w-3 h-3 text-indigo-400" /> {inp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded space-y-1.5">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Output Entity Mutations</span>
                      <ul className="space-y-1 pl-1">
                        {currentStage.outputs.map((out, idx) => (
                          <li key={idx} className="text-[9.5px] text-slate-500 font-mono flex items-center gap-1.5">
                            <CornerDownRight className="w-3 h-3 text-emerald-400" /> {out}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Active UI State and Error Recovery */}
                  <div className="space-y-4">
                    <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded space-y-1.5">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Active UX Presentation Shell</span>
                      <p className="text-[9.5px] text-slate-400 leading-normal">{currentStage.uiState}</p>
                    </div>

                    <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded space-y-1.5">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Error Recovery Strategy</span>
                      <p className="text-[9.5px] text-slate-400 leading-normal">{currentStage.errorRecovery}</p>
                    </div>
                  </div>
                </div>

                {/* Commands and Events bus specs */}
                <div className="border-t border-slate-900 pt-6 grid grid-cols-2 gap-6">
                  
                  {/* Commands */}
                  <div className="space-y-3">
                    <span className="text-[9.5px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <GitMerge className="w-4 h-4" /> Dispatched Command Payloads
                    </span>
                    <div className="space-y-1.5">
                      {currentStage.commands.map((cmd, idx) => (
                        <div key={idx} className="p-2 bg-slate-950/90 border border-slate-900 rounded font-mono text-[9px] text-indigo-300">
                          {cmd}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="space-y-3">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Network className="w-4 h-4" /> Immutable Event Broadcasts
                    </span>
                    <div className="space-y-1.5">
                      {currentStage.events.map((evt, idx) => (
                        <div key={idx} className="p-2 bg-slate-950/90 border border-slate-900 rounded font-mono text-[9px] text-emerald-300">
                          {evt}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Entity mutations and validation rules */}
                <div className="border-t border-slate-900 pt-6 grid grid-cols-2 gap-6">
                  {/* Entity mutations */}
                  <div className="space-y-3">
                    <span className="text-[9.5px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Database className="w-4 h-4" /> Entity DB Schema Modifications
                    </span>
                    <div className="space-y-2">
                      {currentStage.entityChanges.map((chg, idx) => (
                        <div key={idx} className="text-[9.5px] text-slate-400 flex items-start gap-1.5 leading-normal">
                          <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{chg}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Validation rules */}
                  <div className="space-y-3">
                    <span className="text-[9.5px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Stage Constraint Validators
                    </span>
                    <div className="space-y-2">
                      {currentStage.validationRules.map((rule, idx) => (
                        <div key={idx} className="text-[9.5px] text-slate-400 flex items-start gap-1.5 leading-normal">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interactive Stage Simulation Verification */}
                <div className="bg-[#070c14] border border-indigo-900/40 p-4 rounded flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Interactive Verification</span>
                    <h4 className="text-[11px] font-bold text-slate-200 mt-1">Validate core services integration for this stage</h4>
                  </div>
                  <button
                    onClick={() => {
                      addAuditLog(`Triggered simulation run for: ${currentStage.name}`);
                      addAuditLog(`All ${currentStage.commands.length} commands successfully executed and transactions committed.`);
                    }}
                    className="h-7 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold uppercase rounded-sm transition-colors text-[9px] flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Simulate Pipeline Execution
                  </button>
                </div>

              </div>

            </div>

            {/* Audit Trail & Event Logger stream */}
            <div className="bg-[#060a12]/40 border border-slate-900 rounded p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Active Platform Audit Trail Monitor
                </span>
                <button 
                  onClick={() => setAuditLogs([])}
                  className="text-[8px] text-slate-600 hover:text-slate-400 font-bold uppercase"
                >
                  Clear Terminal Logs
                </button>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar font-mono text-[9px]">
                {auditLogs.length === 0 ? (
                  <div className="text-slate-600 italic py-2">Terminal buffer empty. Dispatched commands will generate live diagnostic outputs.</div>
                ) : (
                  auditLogs.map((log, idx) => (
                    <div key={idx} className="text-slate-400 flex items-start gap-2">
                      <span className="text-slate-600 select-none">[{idx + 1}]</span>
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: WORKFLOW STATE MACHINE */}
        {/* ========================================================================= */}
        {activeTab === "statemachine" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#060a12]/40 border border-slate-900 rounded p-6 space-y-6">
              <div>
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">TRANSITION LOGIC MATRIX</span>
                <h3 className="text-sm font-bold font-mono text-slate-100">Workflow State Machine & Locking Regulations</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  The state machine controls state transitions between project stages. It ensures that critical diagnostics and reports are securely locked to prevent metadata manipulation.
                </p>
              </div>

              {/* Graphic State Map */}
              <div className="p-4 bg-slate-950/80 border border-slate-900 rounded overflow-x-auto">
                <div className="min-w-[800px] flex items-center justify-between py-6 px-4">
                  {[
                    { state: "Drafting", rules: "Editable", color: "border-slate-800 bg-slate-950/60" },
                    { state: "Analysis Ingress", rules: "Validating Geometry", color: "border-indigo-900 bg-indigo-950/20" },
                    { state: "Findings Output", rules: "Read-Only Snapshots", color: "border-amber-900 bg-amber-950/20" },
                    { state: "Draft Report", rules: "Editable Documentation", color: "border-slate-800 bg-slate-950/60" },
                    { state: "Senior Approved", rules: "Cryptographic Lock", color: "border-emerald-900 bg-emerald-950/20 font-bold" },
                    { state: "Archived Context", rules: "Immutable Frozen State", color: "border-rose-950 bg-rose-950/10 text-slate-500" }
                  ].map((st, i) => (
                    <React.Fragment key={i}>
                      <div className={`p-3 border rounded text-center w-36 space-y-1 hover:border-slate-700 transition-all ${st.color}`}>
                        <span className="text-[10px] font-bold block uppercase tracking-wider">{st.state}</span>
                        <span className="text-[8px] text-slate-500 block font-mono">{st.rules}</span>
                      </div>
                      {i < 5 && (
                        <div className="flex flex-col items-center">
                          <ArrowRight className="w-4 h-4 text-slate-700" />
                          <span className="text-[7.5px] text-slate-600 font-mono mt-0.5">Transition 0{i + 1}</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Strict state tables */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* Transition Rules */}
                <div className="space-y-3">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block">Core State Machine Constraints</span>
                  <div className="space-y-3">
                    {[
                      { action: "Ingest to Geometry Calibration", constraint: "Calibration reference coordinates (p1, p2) must resolve correctly before geometry review tools release locks." },
                      { action: "Classification to Analysis Pipeline", constraint: "All bounding polygon vertices must represent structurally closed polygons before running Vastu audits." },
                      { action: "Recommendations to Report Synthesis", constraint: "Diagnostic findings database cannot hold null values; each proposal must hold dynamic index tags." },
                      { action: "Approval Cryptographic Signatures", constraint: "Report transitions from 'DRAFT' to 'APPROVED' require senior consultant digital signatures matching authorization credentials." }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1">
                        <span className="text-[9.5px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Transition rule 0{idx + 1}: {item.action}</span>
                        <p className="text-[10px] text-slate-400 leading-normal">{item.constraint}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* State Change Commands Map */}
                <div className="space-y-3">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block">Transition Commands & Payload Structures</span>
                  <div className="space-y-3">
                    {[
                      { command: "Cmd.TransitionState { projectId: UUID, targetState: 'ANALYSIS_READY' }", validation: "Triggers pre-flight geometrics validator and blocks further manual entity mutations." },
                      { command: "Cmd.LockDocument { reportId: UUID, signature: ByteStream }", validation: "Appends Cryptographic SHA256 audit ledger and generates uneditable frozen outputs." },
                      { command: "Cmd.UnsealReport { reportId: UUID, rationale: String }", validation: "Only executable by 'SENIOR_CONSULTANT' roles. Generates a new revision node while keeping previous approved signatures in audit." },
                      { command: "Cmd.ArchiveProject { id: UUID }", validation: "Compiles complete entity and transactional buffers, serializes to GZIP, and flushes RAM cache." }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1">
                        <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-widest font-mono">{item.command.split(" {")[0]}</span>
                        <p className="text-[10px] text-slate-400 leading-normal">{item.validation}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: ARCHITECTURAL DELIVERABLES */}
        {/* ========================================================================= */}
        {activeTab === "deliverables" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-12 gap-6">
              
              {/* Sidebar Selector */}
              <div className="col-span-3 bg-[#060a12]/80 border border-slate-900 rounded p-4 space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block pb-2 border-b border-slate-900 mb-2">
                  System Blueprints
                </span>
                {[
                  { id: "diagram", label: "Complete Lifecycle Diagram" },
                  { id: "journey", label: "User Journey Matrix" },
                  { id: "statemachine", label: "Workflow State Machine" },
                  { id: "uiflow", label: "UI Flow Map" },
                  { id: "commandflow", label: "Command Dependency Flow" },
                  { id: "eventflow", label: "Kernel Event Flow" },
                  { id: "entitylifecycle", label: "Entity Database Lifecycle" },
                  { id: "analysis", label: "Analysis Pipeline stages" },
                  { id: "report", label: "Report Pipeline standard" },
                  { id: "approval", label: "Approval Workflow and Logs" },
                  { id: "error", label: "Error Recovery & Autorecover" },
                  { id: "collab", label: "Collaboration & Multi-User" },
                  { id: "performance", label: "100k+ Entity Performance" },
                  { id: "audit", label: "Cryptographic Audit Strategy" },
                  { id: "future", label: "Decade Future Expansion Rules" }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActiveDeliverable(d.id);
                      addAuditLog(`Selected architectural blueprint: ${d.label}`);
                    }}
                    className={`w-full p-2 rounded-sm text-left font-mono text-[9.5px] transition-all border ${
                      activeDeliverable === d.id
                        ? "bg-indigo-950/40 text-indigo-400 border-indigo-500/20 font-bold"
                        : "bg-[#04060a]/60 text-slate-400 border-transparent hover:bg-slate-900/60 hover:text-slate-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Deliverable Blueprint Sheet */}
              <div className="col-span-9 bg-[#060a12]/40 border border-slate-900 rounded p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* 1. Complete Project Lifecycle Diagram */}
                {activeDeliverable === "diagram" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      1. Complete Project Lifecycle Diagram & Stage Gates
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Every project undergoes a rigorous state progression from visual raster files to finalized cryptographic PDF downloads. Stage gates validate data completeness at each block.
                    </p>
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded font-mono text-[10px] text-slate-400 space-y-3">
                      <span className="font-bold text-slate-300">Phase Gate Flowchart representation:</span>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">DRAFTING ZONE:</span>
                          <span>Draft → Project Creation → Import Pipeline → Calibration Snapping</span>
                        </div>
                        <div className="pl-6 border-l border-slate-800 text-[9.5px] text-slate-500">
                          - Gate 1: Check unit scaling factor &gt; 0 px/meter.
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-bold">ANALYSIS LAYER:</span>
                          <span>Orientation Set → Geometry Review & Heal → Spatial Segmenting → Semantic Classification</span>
                        </div>
                        <div className="pl-6 border-l border-slate-800 text-[9.5px] text-slate-500">
                          - Gate 2: Bounding polygon vectors must represent strictly closed-loop structures.
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold">COMPLIANCE DECISIONS:</span>
                          <span>Multi-Stage Audit Pipeline → Finding Generation → Recommendation proposals</span>
                        </div>
                        <div className="pl-6 border-l border-slate-800 text-[9.5px] text-slate-500">
                          - Gate 3: Each proposal must bind to a validated Vedic rule database reference.
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">PUBLISHING STAGE:</span>
                          <span>Report Studio Drafting → Senior Review & digital Signatures → PDF Exporting → Frozen Archive</span>
                        </div>
                        <div className="pl-6 border-l border-slate-800 text-[9.5px] text-slate-500">
                          - Gate 4: SHA256 digital signature must match Sr. Consultant cryptographic public keys.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. User Journey Map */}
                {activeDeliverable === "journey" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      2. End-to-End User Journey Matrix
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[10px] font-mono">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/40">
                            <th className="p-2">Journey Stage</th>
                            <th className="p-2">User Touchpoint</th>
                            <th className="p-2">Internal Pipeline Response</th>
                            <th className="p-2">Verification Gate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          <tr>
                            <td className="p-2 font-bold text-slate-300">File Ingestion</td>
                            <td className="p-2">Drag & Drop Floor plan PDF</td>
                            <td className="p-2 text-indigo-400">Initialize DB and load Web Worker processes</td>
                            <td className="p-2 text-emerald-400">SHA256 duplicate checks</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-slate-300">Spatial Tuning</td>
                            <td className="p-2">Interactive ruler snapping</td>
                            <td className="p-2 text-indigo-400">Calculate px/meter calibration constant</td>
                            <td className="p-2 text-emerald-400">Tolerance bounds evaluation</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-slate-300">Spatial Recognition</td>
                            <td className="p-2">Accept AI identified rooms</td>
                            <td className="p-2 text-indigo-400">Instantiate spatial entities list</td>
                            <td className="p-2 text-emerald-400">Room confidence thresholds</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-slate-300">Audit execution</td>
                            <td className="p-2">Click 'Run Vedic Audit'</td>
                            <td className="p-2 text-indigo-400">Execute rule processing systems</td>
                            <td className="p-2 text-emerald-400">Evaluate Brahmasthan voids</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-slate-300">Client Delivery</td>
                            <td className="p-2">Export digitally signed PDF</td>
                            <td className="p-2 text-indigo-400">Assemble reports and generate static exports</td>
                            <td className="p-2 text-emerald-400">Cryptographic audit locking</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Workflow State Machine */}
                {activeDeliverable === "statemachine" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      3. Workflow State Machine Rules & Locking States
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ensures absolute consistency across the platform. Manual CAD geometry updates are locked once reports enter review phases, guaranteeing published reports represent exactly what was analyzed.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[9.5px] font-mono text-slate-400">
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-2">
                        <span className="font-bold text-slate-300 block">State: Analysis Lockout</span>
                        <p className="text-slate-500">
                          - Target: WallEntity, DoorEntity, ZoneEntity<br />
                          - Active State: PROJECT_LOCKED<br />
                          - Rules: Any database writes to vertices will return standard SQL constraint exceptions unless the project is manually reverted to 'DRAFT' state.
                        </p>
                      </div>
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-2">
                        <span className="font-bold text-slate-300 block">State: Approved Immutable Lock</span>
                        <p className="text-slate-500">
                          - Target: ReportDocumentNode<br />
                          - Active State: APPROVED<br />
                          - Rules: Modifying report paragraphs directly on the UI is completely blocked. Revisions require an official 'Unseal' action which increments version parameters automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. UI Flow Map */}
                {activeDeliverable === "uiflow" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      4. UI Flow Map & Decoupled Panels Coordinates
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Renders layout structures without loading direct component coupling. Coordinate layout boundaries are stored in WorkspaceState allowing panel configurations to restore accurately on any device resolution.
                    </p>
                    <pre className="p-4 bg-slate-950 border border-slate-900 text-slate-400 rounded text-[9.5px] overflow-x-auto font-mono leading-relaxed">
{`WorkspaceLayoutSpec: {
  panels: [
    { id: "navigator", dock: "LEFT", width: 280, collapsed: false },
    { id: "drafting_viewport", dock: "CENTER", activeLayers: ["STRUCTURAL", "ANALYTICAL"] },
    { id: "diagnostics_feed", dock: "RIGHT", width: 340, activeTab: "findings" },
    { id: "status_console", dock: "BOTTOM", height: 180, collapsed: true }
  ],
  coordinateSystem: {
    datum: "WGS84_EPSG3857",
    viewportCenter: [12.9715, 77.5946], // Bangalore HQ Location
    zoomLevel: 1.62
  }
}`}
                    </pre>
                  </div>
                )}

                {/* 5. Command Dependency Flow */}
                {activeDeliverable === "commandflow" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      5. Command Dependency Flow & Atomic Scopes
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Commands represent atomic mutations that support linear state navigation (Undo/Redo journal stacks). Complex macros are executed under isolated transaction queues.
                    </p>
                    <div className="space-y-2 font-mono text-[9.5px] text-slate-400">
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1">
                        <span className="font-bold text-indigo-400 uppercase">Cmd.Macro_BuildDoorInstance</span>
                        <p className="text-slate-500">
                          - Step 1: Cmd.CreateDoorEntity &#123; parentWallId: UUID &#125;<br />
                          - Step 2: Cmd.BindCoordinateOffset &#123; offset: 4.5 &#125;<br />
                          - Step 3: Cmd.ValidateWallStructure &#123; entityId: parentWallId &#125;<br />
                          - Execution constraint: If Step 3 fails, roll back the transaction and restore database to original state.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Kernel Event Flow */}
                {activeDeliverable === "eventflow" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      6. Kernel Event Flow Pub-Sub Streams
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The central event broker maps publish-subscribe vectors. No visual view writes directly to service layers; they broadcast events, and appropriate managers respond asynchronously.
                    </p>
                    <div className="overflow-x-auto font-mono text-[9.5px]">
                      <table className="w-full text-left border border-slate-900 rounded">
                        <thead>
                          <tr className="bg-slate-950/50 border-b border-slate-900 text-slate-400">
                            <th className="p-2">Event Name</th>
                            <th className="p-2">Publisher Subsystem</th>
                            <th className="p-2">Subscribing Systems</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-slate-500">
                          <tr>
                            <td className="p-2 font-bold text-emerald-400">Evt.WorkspaceChanged</td>
                            <td className="p-2">WorkspaceManager</td>
                            <td className="p-2">ViewportEngine, LocalCacheStore</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-emerald-400">Evt.SpatialAnalysisCompleted</td>
                            <td className="p-2">VastuAnalysisEngine</td>
                            <td className="p-2">DiagnosticsManager, RecommendationService</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-emerald-400">Evt.ProjectArchived</td>
                            <td className="p-2">ProjectService</td>
                            <td className="p-2">IndexedDBCache, NotificationManager</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 7. Entity Database Lifecycle */}
                {activeDeliverable === "entitylifecycle" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      7. Entity Database Lifecycle (Instantiation to Archive)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Maps the complete lifespan of a spatial entity (e.g., a structural wall) from instantiation within local buffers to persistent cloud storage indexing and archived serialization states.
                    </p>
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded font-mono text-[9.5px] text-slate-400 space-y-3">
                      <div className="flex gap-2">
                        <span className="text-amber-500 font-bold">1. Allocation:</span>
                        <span>Client viewport allocations buffer a transient entity structure. Unique UUID keys are assigned in memory.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-500 font-bold">2. Persist:</span>
                        <span>Command Commit triggers local DB insertion and starts Firestore asynchronous synchronization pipeline.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-500 font-bold">3. Audit:</span>
                        <span>The Entity is bound to Vedic verification models; any changes will record a new ledger signature trace.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-500 font-bold">4. Freeze:</span>
                        <span>Project archiving serializes all entity properties into a single unmodifiable binary state object.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Analysis Pipeline Stages */}
                {activeDeliverable === "analysis" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      8. Multi-Stage Compliance Analysis Pipeline
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Calculates compliance scoring through a deterministic, observable multi-step pipeline. Real-time updates report scoring calculations to diagnostic listeners.
                    </p>
                    <div className="space-y-3 font-mono text-[9.5px] text-slate-400">
                      {[
                        { step: "Phase 1: Pre-Validation", desc: "Verifies the layout coordinates represents closed geometries and has set true scale/orientation vectors." },
                        { step: "Phase 2: Knowledge Ingress", desc: "Loads architectural and Vastu core rulesets matching the project context and client geographic location." },
                        { step: "Phase 3: Coordinate Evaluations", desc: "Calculates room centroid indices, solar offsets, entry quadrant angles, and wall thicknesses." },
                        { step: "Phase 4: Finding Aggregators", desc: "Matches spatial configurations against loaded rules, appending diagnostic flags over violated zones." }
                      ].map((p, i) => (
                        <div key={i} className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1">
                          <span className="font-bold text-indigo-400 uppercase">{p.step}</span>
                          <p className="text-slate-500">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. Report Pipeline standard */}
                {activeDeliverable === "report" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      9. Report Pipeline Assembly & Packing
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Report Studio structures dynamic spatial telemetry into standardized, editable client documents. The report generation pipeline ensures that layout outputs match raw analysis records identically.
                    </p>
                    <pre className="p-4 bg-slate-950 border border-slate-900 text-slate-400 rounded text-[9.5px] overflow-x-auto font-mono leading-relaxed">
{`ReportGenerationPipeline: {
  parser: "MarkdownToDocumentStream",
  assets: {
    logoRef: "organization_branding_logo.png",
    charts: [
      { id: "vastu_chakra_radial", format: "SVG", dataRef: "ProjectNode.analysisResults" }
    ]
  },
  outputFormats: ["PDF_PRINT", "JSON_AUDIT", "DOCX_EDITABLE"],
  compression: "DEFLATE_COMPACT_METADATA"
}`}
                    </pre>
                  </div>
                )}

                {/* 10. Approval Workflow and Logs */}
                {activeDeliverable === "approval" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      10. Reviewer Approval Roles & Audit Trail
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Maintains comprehensive audit history records. Senior approvers register cryptographic SHA256 signatures to lock completed project deliverables before exports are dispatched.
                    </p>
                    <div className="space-y-2 font-mono text-[9.5px] text-slate-400">
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1">
                        <span className="font-bold text-emerald-400 uppercase">Approval Role: Senior Consultant</span>
                        <p className="text-slate-500">
                          - Permissions: DOCUMENT_SIGN, UNSEAL_LOCKED_PROJECT, FORCE_OVERRIDE_RULES<br />
                          - Signature Check: WebCrypto RSA-2048 signing keys. Registers timestamped signature block inside the immutable audit ledger database.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. Error Recovery & Autorecover */}
                {activeDeliverable === "error" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      11. Fail-Safe Error Recovery & Memory Isolation
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      If an importer worker crashes or the browser memory buffer reaches critical limits, the isolation system steps in to save progress without corrupting database states.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[9.5px] font-mono text-slate-400">
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1.5">
                        <span className="font-bold text-rose-400 uppercase">Worker Crash Fallback</span>
                        <p className="text-slate-500">
                          If Web Workers crash, close the active memory channel, flush the temporary buffer, restore the last committed local transaction, and notify the user with diagnostic logs.
                        </p>
                      </div>
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1.5">
                        <span className="font-bold text-emerald-400 uppercase">Autosave Buffer Protocol</span>
                        <p className="text-slate-500">
                          Commit active draft layouts to IndexedDB every 10 seconds. In case of sudden power loss or tab closure, restore workspace to exact zoom, selection, and draft geometry coordinates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 12. Collaboration & Multi-User */}
                {activeDeliverable === "collab" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      12. Multi-User Collaboration & Row-Level Locking
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      URJAFLUX supports real-time multi-user auditing. Concurrent writes are managed through row-level entity locks and operational transform queues.
                    </p>
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded font-mono text-[9.5px] text-slate-400 space-y-2">
                      <span className="font-bold text-slate-300">Concurrent Modification Rules:</span>
                      <p className="text-slate-500 leading-normal">
                        - Lock Level: Individual WallEntity / RoomEntity nodes.<br />
                        - Session Flags: Users opening a room for classification lock that specific room metadata while leaving the rest of the floor plan fully accessible to other draftsmen.<br />
                        - Comments and Reviews: Handled via decoupled AnnotationNode objects that refer to entities without mutating their geometric coordinate parameters.
                      </p>
                    </div>
                  </div>
                )}

                {/* 13. 100k+ Entity Performance */}
                {activeDeliverable === "performance" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      13. Large Project Scalability Strategy (100,000+ Entities)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Large floor plans represent massive geometry coordinate loads. URJAFLUX handles millions of segments using lazy loading, viewport spatial hashing (Quadtrees), and vertex stream virtualization.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[9.5px] font-mono text-slate-400">
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1">
                        <span className="font-bold text-indigo-400 uppercase">Spatial Quadtree Hashing</span>
                        <p className="text-slate-500">
                          Index geometry coordinates based on Quadtree bounds. The viewport canvas only renders segments falling inside active coordinate view bounds, keeping GPU memory loads extremely light.
                        </p>
                      </div>
                      <div className="p-3 bg-[#070c14] border border-emerald-900/40 rounded space-y-1">
                        <span className="font-bold text-emerald-400 uppercase">Vertex Virtualization SLA</span>
                        <p className="text-slate-500">
                          - Vector Count: 100,000+ segments.<br />
                          - Target FPS: Stable 60 FPS.<br />
                          - Render Buffer: Pre-cached off-screen canvas arrays, shifting costly path calculations off main scripting threads.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 14. Cryptographic Audit Strategy */}
                {activeDeliverable === "audit" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      14. Cryptographic Compliance Audit Ledger
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      All critical mutations are recorded inside a blockchain-style append-only ledger, preventing developers, consultants, or clients from manually tempering historical spatial calculations.
                    </p>
                    <pre className="p-4 bg-slate-950 border border-slate-900 text-slate-400 rounded text-[9.5px] overflow-x-auto font-mono leading-relaxed">
{`AuditTrailLedgerEntry: {
  index: 432,
  timestamp: "2026-07-27T12:17:56Z",
  commandDispatched: "Cmd.OverrideVastuViolation",
  params: { entityId: "ent_001", reason: "Architectural Beam structural constraint" },
  revertingHash: "SHA256-4D2A92E47B0A11F6D8A...",
  previousHash: "SHA256-001A8E24C779F21A0F9..." // Immutable block linkage
}`}
                    </pre>
                  </div>
                )}

                {/* 15. Decade Future Expansion Rules */}
                {activeDeliverable === "future" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">
                      15. Decade-Horizon Extensibility Rules
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ensures that future modules (e.g., BIM integrations, smart HVAC routing) are supported cleanly without editing core application kernel classes.
                    </p>
                    <div className="space-y-3 font-mono text-[9.5px] text-slate-400">
                      {[
                        { title: "No Kernel Modification Rule", desc: "No future feature release can ever edit or modify the core Kernel source code directly. New services must register dynamically through public manifest hook scripts." },
                        { title: "Strict Contract Inheritance", desc: "All spatial entities must subclass our root SpatialEntity type to guarantee they inherit WGS84 projection coordinates and undo history interfaces." },
                        { title: "Service Contracts Over Internals", desc: "Subsystems must depend purely on generic service interfaces (e.g., depending on AbstractStorageService instead of ConcreteFirestoreClient) ensuring easy storage migration (e.g., Cloud SQL) with zero code modifications." }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded space-y-1">
                          <span className="font-bold text-indigo-400 uppercase">{item.title}</span>
                          <p className="text-slate-500">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
