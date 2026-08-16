import React, { useState } from "react";
import { Cpu, ShieldCheck, AlertCircle } from "lucide-react";
import ClientInformationPanel from "./ClientInformationPanel";
import PropertyInformationPanel from "./PropertyInformationPanel";
import FloorSelectionPanel from "./FloorSelectionPanel";
import CompassCalibrationPanel from "./CompassCalibrationPanel";
import FloorPlanUploadPanel from "./FloorPlanUploadPanel";
import AnalysisControlPanel from "./AnalysisControlPanel";
import FindingsPanel from "./FindingsPanel";
import RecommendationsPanel from "./RecommendationsPanel";
import EvidencePanel from "./EvidencePanel";
import PropertyRecognitionPanel from "./PropertyRecognitionPanel";
import DecisionChainPanel from "./DecisionChainPanel";
import PropertyHealthIndexPanel from "./PropertyHealthIndexPanel";
import PositiveNegativeAuditPanel from "./PositiveNegativeAuditPanel";
import ConsultantSuitePanel from "./ConsultantSuitePanel";
import EvaluationCoveragePanel from "./EvaluationCoveragePanel";
import AnalysisTimeline from "./AnalysisTimeline";
import ReportPanel from "./ReportPanel";
import EvaluationExperienceModal, { EvaluationProgressState } from "./EvaluationExperienceModal";

import { Client, Property, Project } from "../../types/app";
import { WorkflowOrchestrator } from "../../engines/orchestrator/WorkflowOrchestrator";
import { InterpretationFinding, InterpretationRecommendation } from "../../engines/interpretation/InterpretationTypes";
import { KnowledgeReference } from "../../engines/calculation/CalculationTypes";
import { executeVastuAnalysisPipeline, DoshaItem } from "../../services/vastuAnalysisOrchestrator";
import { PropertyRecognitionSummary } from "../../recognition/types";
import { DecisionEngineExecutionResult } from "../../engines/decision/UrjafluxDecisionEngine";

import { 
  useRuntimeEvaluationSession, 
  RuntimeEvaluationSessionStore 
} from "../../core/session/RuntimeEvaluationSession";
import { getActiveTransportMode } from "../../spatial/VisionRuntime";
import { ClientDiscoveryModal } from "../discovery/ClientDiscoveryModal";
import { clientDiscoveryService } from "../../services/clientDiscoveryService";

interface WorkspaceLayoutProps {
  client: Client | null;
  clientsList?: Client[];
  property: Property | null;
  propertiesList?: Property[];
  project: Project | null;
  uploadedFile: { name: string; size: string; url: string } | null;
  rotation: number;
  canvasObjects: any[];
  onUploadFile: (file: File) => void;
  onRotationChange: (rot: number) => void;
  onClientChange?: (updated: Client) => void;
  onSelectClient?: (clientId: string) => void;
  onPropertyChange?: (updated: Property) => void;
  onSelectProperty?: (propertyId: string) => void;
  onUpdateProjectName?: (newName: string) => void;
}

export default function WorkspaceLayout({
  client,
  clientsList = [],
  property,
  propertiesList = [],
  project,
  uploadedFile,
  rotation,
  canvasObjects = [],
  onUploadFile,
  onRotationChange,
  onClientChange,
  onSelectClient,
  onPropertyChange,
  onSelectProperty,
  onUpdateProjectName
}: WorkspaceLayoutProps) {
  // Navigation tabs for the right intelligence column
  const [rightActiveTab, setRightActiveTab] = useState<
    "coverage" | "decisionChains" | "propertyHealth" | "audit" | "consultant" | "recognition" | "defects" | "remedies" | "evidence"
  >("coverage");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Calibration and structural states
  const [isNorthLocked, setIsNorthLocked] = useState(false);
  const [northType, setNorthType] = useState<"True" | "Magnetic">("True");
  const [magneticDeviation, setMagneticDeviation] = useState(0.0);

  const [floors, setFloors] = useState([
    { id: "floor_basement", name: "Basement", level: -1 },
    { id: "floor_ground", name: "Ground Floor", level: 0 },
    { id: "floor_first", name: "First Floor", level: 1 },
    { id: "floor_second", name: "Second Floor", level: 2 }
  ]);
  const [activeFloorId, setActiveFloorId] = useState("floor_ground");

  const [referenceWall, setReferenceWall] = useState("Main Hall North Boundary");
  const [referenceLength, setReferenceLength] = useState("45");
  const [scaleUnit, setScaleUnit] = useState<"Meters" | "Feet" | "Millimeters">("Feet");
  const [pixelScaleRatio, setPixelScaleRatio] = useState(13.7);

  // Analysis and Orchestration Pipeline States
  const session = useRuntimeEvaluationSession();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeEngine, setActiveEngine] = useState<"none" | "knowledge" | "rules" | "calculations" | "interpretation" | "report" | "done" | "all">("none");
  const [hasExecutedState, setHasExecutedState] = useState(false);
  const [cycleDuration, setCycleDuration] = useState(0);

  const hasExecuted = session.hasExecuted || hasExecutedState;

  // Dynamic outputs from execution
  const [findings, setFindings] = useState<InterpretationFinding[]>([]);
  const [recommendations, setRecommendations] = useState<InterpretationRecommendation[]>([]);
  const [knowledgeRefs, setKnowledgeRefs] = useState<KnowledgeReference[]>([]);
  const [recognitionSummary, setRecognitionSummary] = useState<PropertyRecognitionSummary | null>(null);
  const [decisionResult, setDecisionResult] = useState<DecisionEngineExecutionResult | null>(null);
  const [doshasList, setDoshasList] = useState<DoshaItem[]>([]);
  const [overallScoreVal, setOverallScoreVal] = useState<number | null>(null);

  // Runtime Evaluation Experience Modal State
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalState, setEvalState] = useState<EvaluationProgressState | null>(null);
  const [isClientDiscoveryModalOpen, setIsClientDiscoveryModalOpen] = useState(false);

  // Orchestrate execution through the 5 engines with live evaluation experience
  const handleRunFullAnalysis = async () => {
    // KIE Sprint-2 Architecture Rule: Client Discovery Engine is MANDATORY
    if (!clientDiscoveryService.isCompleted()) {
      setIsClientDiscoveryModalOpen(true);
      alert("CLIENT DISCOVERY MANDATORY: Please complete the Client Discovery Engine form before running Vastu Analysis.");
      return;
    }

    setIsAnalyzing(true);
    setHasExecutedState(false);
    setEvalModalOpen(true);
    setEvalState(null);
    const start = performance.now();

    try {
      setActiveEngine("all");
      const result = await executeVastuAnalysisPipeline(
        [],
        null,
        rotation,
        0,
        (progress) => {
          setEvalState(progress);
        },
        "VASTU"
      );

      if (result.recognitionSummary) {
        setRecognitionSummary(result.recognitionSummary);
      }

      if (result.decisionExecutionResult) {
        setDecisionResult(result.decisionExecutionResult);
      }

      if (result.doshas) {
        setDoshasList(result.doshas);
      }

      if (result.overallScore !== null) {
        setOverallScoreVal(result.overallScore);
      }

      if (result.rawReport) {
        setFindings(result.rawReport.findings || []);
        setRecommendations(result.rawReport.recommendations || []);
        setKnowledgeRefs(result.rawReport.knowledgeReferences || []);
      } else if (result.doshas) {
        setFindings(result.doshas.map(d => ({
          id: d.id,
          title: d.title,
          description: d.description,
          category: "VASTU_DEFECT",
          severity: d.severity === "CRITICAL" ? "CRITICAL" : d.severity === "HIGH" ? "HIGH" : "MEDIUM",
          confidence: 0.98,
          evidence: [],
          relatedRules: [d.ruleId],
          relatedCalculations: [],
          affectedArea: d.zone,
          pluginSource: "vastu_orchestrator",
          timestamp: new Date().toISOString()
        })));

        setRecommendations(result.doshas.map(d => ({
          id: `REC-${d.id}`,
          findingId: d.id,
          title: `Remedy for ${d.title}`,
          priority: d.severity === "CRITICAL" ? "HIGH" : "MEDIUM",
          reason: d.description,
          expectedBenefit: "Restores directional energy balance and nullifies defect impact",
          implementationDifficulty: "EASY",
          estimatedImpact: d.severity === "CRITICAL" ? "HIGH" : "MEDIUM",
          remedyAction: d.remedy
        })));
      }

      setHasExecutedState(true);
      setActiveEngine("done");
    } catch (err) {
      console.error("Orchestrator pipeline failed:", err);
      setActiveEngine("none");
    } finally {
      setIsAnalyzing(false);
      setCycleDuration(performance.now() - start);
    }
  };

  const handleRunRuleEngine = async () => {
    setIsAnalyzing(true);
    setActiveEngine("rules");
    await new Promise((r) => setTimeout(r, 800));
    setIsAnalyzing(false);
    setActiveEngine("done");
    setHasExecutedState(true);
  };

  const handleRunCalculationEngine = async () => {
    setIsAnalyzing(true);
    setActiveEngine("calculations");
    await new Promise((r) => setTimeout(r, 800));
    setIsAnalyzing(false);
    setActiveEngine("done");
    setHasExecutedState(true);
  };

  const handleRunInterpretationEngine = async () => {
    setIsAnalyzing(true);
    setActiveEngine("interpretation");
    await new Promise((r) => setTimeout(r, 800));
    setIsAnalyzing(false);
    setActiveEngine("done");
    setHasExecutedState(true);
  };

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    setActiveEngine("report");
    await new Promise((r) => setTimeout(r, 800));
    setIsAnalyzing(false);
    setActiveEngine("done");
    setHasExecutedState(true);
  };

  // Floor modifications
  const handleAddFloor = (name: string, level: number) => {
    const newFloor = { id: `floor_${Date.now()}`, name, level };
    setFloors([...floors, newFloor]);
  };

  const handleDeleteFloor = (id: string) => {
    setFloors(floors.filter((f) => f.id !== id));
  };

  const handleUpdateScale = (wall: string, len: string, unit: "Meters" | "Feet" | "Millimeters") => {
    setReferenceWall(wall);
    setReferenceLength(len);
    setScaleUnit(unit);
    // Recalculate dummy pixel scale
    const val = parseFloat(len) || 10;
    setPixelScaleRatio((val * 304.8) / 300); // meters/feet conversion factor scale ratio
  };

  return (
    <div className="flex flex-col gap-4 text-slate-900 min-h-screen bg-slate-50 p-1 md:p-4 select-none">
      {/* THREE COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* COLUMN 1: LEFT SIDEBAR (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <ClientInformationPanel
            client={client}
            clientsList={clientsList}
            onClientChange={onClientChange}
            onSelectClient={onSelectClient}
          />
          <PropertyInformationPanel
            property={property}
            project={project}
            propertiesList={propertiesList}
            onPropertyChange={onPropertyChange}
            onSelectProperty={onSelectProperty}
            onUpdateProjectName={onUpdateProjectName}
          />
          <FloorSelectionPanel
            floors={floors}
            activeFloorId={activeFloorId}
            onSelectFloor={setActiveFloorId}
            onAddFloor={handleAddFloor}
            onDeleteFloor={handleDeleteFloor}
          />
        </div>

        {/* COLUMN 2: CENTER / MAIN SPACE (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <FloorPlanUploadPanel
            uploadedFile={uploadedFile}
            referenceWall={referenceWall}
            referenceLength={referenceLength}
            scaleUnit={scaleUnit}
            pixelScaleRatio={pixelScaleRatio}
            onUploadFile={onUploadFile}
            onUpdateScale={handleUpdateScale}
          />

          <CompassCalibrationPanel
            rotation={rotation}
            isNorthLocked={isNorthLocked}
            northType={northType}
            magneticDeviation={magneticDeviation}
            onRotationChange={onRotationChange}
            onNorthLockedChange={setIsNorthLocked}
            onNorthTypeChange={setNorthType}
            onMagneticDeviationChange={setMagneticDeviation}
          />

          <AnalysisControlPanel
            isAnalyzing={isAnalyzing}
            activeEngine={activeEngine === "done" ? "all" : (activeEngine as any)}
            onRunFullAnalysis={handleRunFullAnalysis}
            onRunRuleEngine={handleRunRuleEngine}
            onRunCalculationEngine={handleRunCalculationEngine}
            onRunInterpretationEngine={handleRunInterpretationEngine}
            onGenerateReport={handleGenerateReport}
            hasExecuted={hasExecuted}
          />
        </div>

        {/* COLUMN 3: RIGHT SIDEBAR INTELLIGENCE (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4 bg-white/40 border border-slate-200/60 rounded-2xl p-3 shadow-inner">
          {/* FOUNDER DEBUG PANEL — SPRINT 4A.9 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-[10px] space-y-2 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>FOUNDER DEBUG PANEL (SPRINT 4A.9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  ACTIVE TRANSPORT = {getActiveTransportMode()}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  session.hasExecuted && session.overallScore !== null
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-rose-950 text-rose-300 border border-rose-800"
                }`}>
                  {session.hasExecuted && session.overallScore !== null ? "PASS (EXECUTED)" : "FAIL (NOT EXECUTED)"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500">Execution ID: </span>
                <span className="text-amber-300 font-bold">{session.executionId}</span>
              </div>
              <div>
                <span className="text-slate-500">Timestamp: </span>
                <span className="text-slate-200">{session.formattedTimestamp}</span>
              </div>
              <div>
                <span className="text-slate-500">Entities / Rules: </span>
                <span className="text-emerald-400 font-bold">{session.recognitionCount} Entities / {session.ruleCount} Rules</span>
              </div>
              <div>
                <span className="text-slate-500">Findings Count: </span>
                <span className="text-rose-400 font-bold">{session.findingCount} Imbalances</span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px]">
              <span className="text-slate-500 uppercase tracking-wider">Consumer SSOT Bindings:</span>
              <div className="flex gap-1.5 font-bold">
                <span className={session.consumersBound.reportBound ? "text-emerald-400" : "text-slate-600"}>
                  Report: {session.consumersBound.reportBound ? "BOUND" : "UNBOUND"}
                </span>
                <span>•</span>
                <span className={session.consumersBound.ukaBound ? "text-emerald-400" : "text-slate-600"}>
                  UKA: {session.consumersBound.ukaBound ? "BOUND" : "UNBOUND"}
                </span>
                <span>•</span>
                <span className={session.consumersBound.coverageBound ? "text-emerald-400" : "text-slate-600"}>
                  Coverage: {session.consumersBound.coverageBound ? "BOUND" : "UNBOUND"}
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS FOR INTELLIGENCE COL */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
            <button
              onClick={() => setRightActiveTab("coverage")}
              className={`py-1.5 px-2.5 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "coverage"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              COVERAGE & TRACE
            </button>
            <button
              onClick={() => setRightActiveTab("decisionChains")}
              className={`py-1.5 px-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "decisionChains"
                  ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              DECISION CHAINS
            </button>
            <button
              onClick={() => setRightActiveTab("propertyHealth")}
              className={`py-1.5 px-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "propertyHealth"
                  ? "bg-emerald-600 text-white font-black shadow-md shadow-emerald-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              HEALTH INDEX
            </button>
            <button
              onClick={() => setRightActiveTab("audit")}
              className={`py-1.5 px-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "audit"
                  ? "bg-amber-600 text-white font-black shadow-md shadow-amber-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              BALANCED AUDIT
            </button>
            <button
              onClick={() => setRightActiveTab("consultant")}
              className={`py-1.5 px-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "consultant"
                  ? "bg-slate-900 text-amber-300 font-black shadow-md shadow-slate-900/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CONSULTANT SUITE
            </button>
            <button
              onClick={() => setRightActiveTab("recognition")}
              className={`py-1.5 px-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "recognition"
                  ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              PRE MODEL
            </button>
            <button
              onClick={() => setRightActiveTab("defects")}
              className={`py-1.5 px-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "defects"
                  ? "bg-rose-600 text-white font-black shadow-md shadow-rose-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              DEFECTS
            </button>
            <button
              onClick={() => setRightActiveTab("remedies")}
              className={`py-1.5 px-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "remedies"
                  ? "bg-teal-600 text-white font-black shadow-md shadow-teal-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              REMEDIES
            </button>
            <button
              onClick={() => setRightActiveTab("evidence")}
              className={`py-1.5 px-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all whitespace-nowrap ${
                rightActiveTab === "evidence"
                  ? "bg-amber-700 text-white font-black shadow-md shadow-amber-700/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CANON
            </button>
          </div>

          <div className="flex-1 min-h-[350px]">
            {rightActiveTab === "coverage" && (
              <EvaluationCoveragePanel
                summary={recognitionSummary}
                entities={recognitionSummary?.entities || []}
                findings={findings as any}
                decisionChains={decisionResult?.decisionChains || []}
                overallScore={overallScoreVal}
              />
            )}
            {rightActiveTab === "decisionChains" && (
              <DecisionChainPanel decisionChains={decisionResult?.decisionChains || []} />
            )}
            {rightActiveTab === "propertyHealth" && (
              <PropertyHealthIndexPanel propertyHealthIndex={decisionResult?.propertyHealthIndex || null} />
            )}
            {rightActiveTab === "audit" && (
              <PositiveNegativeAuditPanel audit={decisionResult?.positiveNegativeAudit || null} />
            )}
            {rightActiveTab === "consultant" && (
              <ConsultantSuitePanel
                entities={recognitionSummary?.entities || []}
                doshas={doshasList}
                overallScore={overallScoreVal}
              />
            )}
            {rightActiveTab === "recognition" && (
              <PropertyRecognitionPanel summary={recognitionSummary} />
            )}
            {rightActiveTab === "defects" && (
              <FindingsPanel
                findings={findings}
                onSelectFinding={setSelectedFindingId}
                selectedFindingId={selectedFindingId}
              />
            )}
            {rightActiveTab === "remedies" && (
              <RecommendationsPanel
                recommendations={recommendations}
                selectedFindingId={selectedFindingId}
              />
            )}
            {rightActiveTab === "evidence" && (
              <EvidencePanel knowledgeReferences={knowledgeRefs} />
            )}
          </div>

          <ReportPanel
            hasExecuted={hasExecuted}
            score={hasExecuted ? overallScoreVal : null}
            canonicalFindings={findings as any}
            evaluationCoverage={null}
            recognizedEntityCount={recognitionSummary?.entities?.length || 0}
            propertyHealth={decisionResult?.propertyHealthIndex ? { healthIndex: decisionResult.propertyHealthIndex } as any : null}
            decisionEngineOutput={decisionResult}
            clientName={client?.name}
            projectName={project?.name}
          />
        </div>
      </div>

      {/* BOTTOM ROW: PIPELINE EXECUTION MONITOR */}
      <div className="w-full">
        <AnalysisTimeline
          currentStage={activeEngine}
          isExecuting={isAnalyzing}
          durationMs={cycleDuration}
        />
      </div>

      {/* EVALUATION EXPERIENCE MODAL */}
      <EvaluationExperienceModal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        state={evalState}
        onViewReport={() => setRightActiveTab("defects")}
      />

      {/* KIE SPRINT-2 MODULE 1: CLIENT DISCOVERY MODAL */}
      <ClientDiscoveryModal
        isOpen={isClientDiscoveryModalOpen}
        onClose={() => setIsClientDiscoveryModalOpen(false)}
        onSuccess={() => {
          handleRunFullAnalysis();
        }}
      />
    </div>
  );
}
