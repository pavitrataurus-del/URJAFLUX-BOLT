import React, { useState } from "react";
import { 
  Eye, EyeOff, Lock, Unlock, Layers, Sliders, RotateCw, 
  Ruler, FileText, Move, Scale, Compass, Check, X, SlidersHorizontal, RefreshCw, PanelRightClose, Sparkles, AlertTriangle,
  BrainCircuit, Target, ShieldAlert, Users, Compass as ContextIcon
} from "lucide-react";
import { BlueprintData, CadEntity } from "./CadBlueprintWorkspace";
import { VastuAnalysisResult } from "../services/vastuAnalysisOrchestrator";
import { useRuntimeEvaluationSession } from "../core/session/RuntimeEvaluationSession";

export interface LayerItem {
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

export interface RightInspectorPanelProps {
  canvasTheme: "light" | "dark";
  activeInspectorTab: "blueprint" | "layers" | "properties" | "vastu" | "context" | "selection";
  setActiveInspectorTab: (tab: "blueprint" | "layers" | "properties" | "vastu" | "context" | "selection") => void;
  onClose: () => void;
  
  // Blueprint Props
  blueprint: BlueprintData | null;
  setBlueprint: React.Dispatch<React.SetStateAction<BlueprintData | null>>;
  onStartCalibration: () => void;
  onReplaceBlueprint: () => void;

  // Layers Props
  layersList: LayerItem[];
  setLayersList: React.Dispatch<React.SetStateAction<LayerItem[]>>;

  // Selection & Properties Props
  selectedEntity: CadEntity | null;
  onUpdateEntity: (id: string, updates: Partial<CadEntity>) => void;

  // Vastu & Chakra Props
  vastuNorthCalibration: number;
  setVastuNorthCalibration: React.Dispatch<React.SetStateAction<number>>;
  showVastuChakra: boolean;
  setShowVastuChakra: React.Dispatch<React.SetStateAction<boolean>>;
  show16Zones: boolean;
  setShow16Zones: React.Dispatch<React.SetStateAction<boolean>>;
  showBrahmasthan: boolean;
  setShowBrahmasthan: React.Dispatch<React.SetStateAction<boolean>>;
  showEnergyOverlay: boolean;
  setShowEnergyOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  showCompass: boolean;
  setShowCompass: React.Dispatch<React.SetStateAction<boolean>>;
  
  chakraRotation: number;
  setChakraRotation: React.Dispatch<React.SetStateAction<number>>;
  chakraScale: number;
  setChakraScale: React.Dispatch<React.SetStateAction<number>>;
  chakraAspect: number;
  setChakraAspect: React.Dispatch<React.SetStateAction<number>>;
  chakraOpacity: number;
  setChakraOpacity: React.Dispatch<React.SetStateAction<number>>;
  chakraLocked: boolean;
  setChakraLocked: React.Dispatch<React.SetStateAction<boolean>>;

  onCenterChakra: () => void;
  onSnapChakra: () => void;
  onFitChakra: () => void;
  onResetChakra: () => void;

  onConfirmNorthCalibration?: () => void;
  chakraDeployed?: boolean;
  chakraOrientationCalibrated?: boolean;
  calibrationMessage?: string;
  onAddVastuChakra?: () => void;

  // Vastu Analysis Orchestration Props
  onRunVastuAnalysis?: () => void;
  analysisResult?: VastuAnalysisResult | null;
  onOpenAnalysisPanel?: () => void;
  onAutoDetectEntities?: () => void;
}

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  canvasTheme,
  activeInspectorTab,
  setActiveInspectorTab,
  onClose,
  blueprint,
  setBlueprint,
  onStartCalibration,
  onReplaceBlueprint,
  layersList,
  setLayersList,
  selectedEntity,
  onUpdateEntity,
  vastuNorthCalibration,
  setVastuNorthCalibration,
  showVastuChakra,
  setShowVastuChakra,
  show16Zones,
  setShow16Zones,
  showBrahmasthan,
  setShowBrahmasthan,
  showEnergyOverlay,
  setShowEnergyOverlay,
  showCompass,
  setShowCompass,
  chakraRotation,
  setChakraRotation,
  chakraScale,
  setChakraScale,
  chakraAspect,
  setChakraAspect,
  chakraOpacity,
  setChakraOpacity,
  chakraLocked,
  setChakraLocked,
  onCenterChakra,
  onSnapChakra,
  onFitChakra,
  onResetChakra,
  onConfirmNorthCalibration,
  chakraDeployed = false,
  chakraOrientationCalibrated = false,
  calibrationMessage = "Please calibrate the Vastu Chakra before running analysis.",
  onAddVastuChakra,
  onRunVastuAnalysis,
  analysisResult,
  onOpenAnalysisPanel,
  onAutoDetectEntities,
}) => {
  const session = useRuntimeEvaluationSession();
  const profile = session.clientContextProfile;
  const canRunAnalysis = chakraDeployed && chakraOrientationCalibrated;
  const showAnalysisResults = analysisResult && chakraOrientationCalibrated;

  return (
    <div className={`w-80 border-l flex flex-col shrink-0 text-xs font-sans shadow-xl z-20 ${
      canvasTheme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-[#070b13] border-slate-800 text-slate-200"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 border-b border-slate-200 dark:border-slate-800">
        <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 font-mono">Property Inspector</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded cursor-pointer">
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* 6 Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono overflow-x-auto">
        {(["blueprint", "layers", "properties", "vastu", "context", "selection"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveInspectorTab(tab)}
            className={`flex-1 py-2 px-1 text-center font-bold capitalize truncate cursor-pointer transition-colors ${
              activeInspectorTab === tab
                ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 custom-scrollbar">
        
        {/* 1. BLUEPRINT TAB */}
        {activeInspectorTab === "blueprint" && (
          blueprint ? (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Loaded File</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{blueprint.name}</span>
                <span className="text-[10px] text-slate-500 font-mono block">Resolution: {blueprint.naturalWidth} x {blueprint.naturalHeight} px</span>
              </div>

              <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Scale Calibration</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block">{blueprint.scaleText}</span>
                <span className="text-[9px] text-slate-400 font-mono block">({blueprint.pixelsPerMeter.toFixed(1)} px / meter)</span>
              </div>

              {/* Blueprint Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span>Blueprint Opacity</span>
                  <span className="text-emerald-500 font-bold">{Math.round(blueprint.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={blueprint.opacity}
                  onChange={(e) => setBlueprint(prev => prev ? { ...prev, opacity: parseFloat(e.target.value) } : null)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Blueprint Rotation */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono block">Rotation</span>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 90, 180, 270].map(deg => (
                    <button
                      key={deg}
                      onClick={() => setBlueprint(prev => prev ? { ...prev, rotation: deg } : null)}
                      className={`py-1 rounded text-[10px] font-mono font-bold cursor-pointer ${
                        blueprint.rotation === deg ? "bg-emerald-600 text-white" : "border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Blueprint Toggles */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBlueprint(prev => prev ? { ...prev, visible: !prev.visible } : null)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    blueprint.visible ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-slate-300 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  {blueprint.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{blueprint.visible ? "Visible" : "Hidden"}</span>
                </button>

                <button
                  onClick={() => setBlueprint(prev => prev ? { ...prev, locked: !prev.locked } : null)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    blueprint.locked ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400" : "border-slate-300 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  {blueprint.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{blueprint.locked ? "Locked" : "Unlocked"}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                {onAutoDetectEntities && (
                  <button
                    onClick={onAutoDetectEntities}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Detect CAD Entities (AI)</span>
                  </button>
                )}

                <button
                  onClick={onStartCalibration}
                  className="w-full py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Ruler className="w-4 h-4" />
                  <span>Calibrate Scale</span>
                </button>

                <button
                  onClick={onReplaceBlueprint}
                  className="w-full py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Replace Blueprint
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 font-sans space-y-3">
              <p className="text-xs">No blueprint loaded.</p>
              <button
                onClick={onReplaceBlueprint}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Import Blueprint
              </button>
            </div>
          )
        )}

        {/* 2. LAYERS TAB */}
        {activeInspectorTab === "layers" && (
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Layer Visibility & Lock</span>
            {layersList.map((layer, idx) => (
              <div key={layer.name} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                  <span className="font-bold truncate max-w-[120px]">{layer.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLayersList(prev => prev.map((l, i) => i === idx ? { ...l, visible: !l.visible } : l))}
                    className="p-1 text-slate-400 hover:text-emerald-500 cursor-pointer"
                    title={layer.visible ? "Hide Layer" : "Show Layer"}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => setLayersList(prev => prev.map((l, i) => i === idx ? { ...l, locked: !l.locked } : l))}
                    className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                    title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. PROPERTIES TAB */}
        {activeInspectorTab === "properties" && (
          selectedEntity ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Selected Element</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{selectedEntity.name}</span>
                <span className="text-[10px] text-emerald-500 font-mono block">{selectedEntity.type} ({selectedEntity.layer})</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <label className="text-[9px] text-slate-400 block">Position X (m)</label>
                  <input
                    type="number"
                    value={selectedEntity.x}
                    onChange={(e) => onUpdateEntity(selectedEntity.id, { x: parseFloat(e.target.value) || 0 })}
                    className="w-full p-1.5 border rounded bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Position Y (m)</label>
                  <input
                    type="number"
                    value={selectedEntity.y}
                    onChange={(e) => onUpdateEntity(selectedEntity.id, { y: parseFloat(e.target.value) || 0 })}
                    className="w-full p-1.5 border rounded bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Width (m)</label>
                  <input
                    type="number"
                    value={selectedEntity.width}
                    onChange={(e) => onUpdateEntity(selectedEntity.id, { width: parseFloat(e.target.value) || 1 })}
                    className="w-full p-1.5 border rounded bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Height (m)</label>
                  <input
                    type="number"
                    value={selectedEntity.height}
                    onChange={(e) => onUpdateEntity(selectedEntity.id, { height: parseFloat(e.target.value) || 1 })}
                    className="w-full p-1.5 border rounded bg-transparent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 font-sans">
              <p className="text-xs">No element selected on canvas.</p>
              <p className="text-[10px] text-slate-500 mt-1">Click an element to inspect properties.</p>
            </div>
          )
        )}

        {/* 4. VASTU TAB (CHAKRA & ENERGY CONTROLS) */}
        {activeInspectorTab === "vastu" && (
          <div className="space-y-4">
            
            {/* VASTU ANALYSIS AUDIT ENGINE TRIGGER CARD */}
            <div className="p-3 rounded-xl border bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-emerald-500/30 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vastu Audit Pipeline</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">18 Domains</span>
              </div>

              {showAnalysisResults ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono block">Compliance Score</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {analysisResult.overallScore !== null ? `${analysisResult.overallScore}%` : "N/A"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-mono block">Doshas Detected</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                        {analysisResult.doshas.length}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={onRunVastuAnalysis}
                      className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-Run</span>
                    </button>
                    <button
                      onClick={onOpenAnalysisPanel}
                      className="py-1.5 px-2 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>View Audit</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {!chakraDeployed && blueprint && onAddVastuChakra && (
                    <button
                      type="button"
                      onClick={onAddVastuChakra}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Add Vastu Chakra</span>
                    </button>
                  )}

                  {chakraDeployed && !chakraOrientationCalibrated && (
                    <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 space-y-2">
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
                        {calibrationMessage}
                      </p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Position the Chakra, rotate and resize it, set North, then confirm calibration.
                      </p>
                      {onConfirmNorthCalibration && (
                        <button
                          type="button"
                          onClick={onConfirmNorthCalibration}
                          className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Target className="w-3 h-3" />
                          <span>Mark North & Confirm Calibration</span>
                        </button>
                      )}
                    </div>
                  )}

                  {canRunAnalysis && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Chakra calibrated. Run analysis to evaluate compliance, doshas, and remedies.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => onRunVastuAnalysis?.()}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Vastu Analysis</span>
                  </button>

                  {!blueprint && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Upload a blueprint, add the Vastu Chakra, and calibrate North before running analysis.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* North Calibration */}
            <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Compass className="w-4 h-4" />
                  <span>North Mark</span>
                </span>
                <span>{vastuNorthCalibration}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={vastuNorthCalibration}
                onChange={(e) => setVastuNorthCalibration(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                disabled={!chakraDeployed}
              />
              {chakraDeployed && onConfirmNorthCalibration && (
                <button
                  onClick={onConfirmNorthCalibration}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                    chakraOrientationCalibrated
                      ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/40"
                      : "bg-amber-600 hover:bg-amber-500 text-white"
                  }`}
                >
                  <Target className="w-3 h-3" />
                  <span>{chakraOrientationCalibrated ? "North Calibrated ✓" : "Mark North & Confirm"}</span>
                </button>
              )}
            </div>

            {!chakraDeployed && blueprint && onAddVastuChakra && (
              <button
                onClick={onAddVastuChakra}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Add Vastu Chakra to Blueprint</span>
              </button>
            )}

            {/* Vastu Layer Toggles */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Vastu Overlays</span>
              
              {[
                { label: "Show Chakra Overlay", val: showVastuChakra, setVal: setShowVastuChakra },
                { label: "Show 16 Direction Zones", val: show16Zones, setVal: setShow16Zones },
                { label: "Show Brahmasthan Core", val: showBrahmasthan, setVal: setShowBrahmasthan },
                { label: "Show Energy Heatmap", val: showEnergyOverlay, setVal: setShowEnergyOverlay },
                { label: "Show Compass Needle", val: showCompass, setVal: setShowCompass },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-medium">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => item.setVal(e.target.checked)}
                    className="accent-emerald-600 cursor-pointer w-4 h-4"
                  />
                </div>
              ))}
            </div>

            {/* Vastu Chakra Precise Geometry Controls */}
            <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 space-y-3">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono block">Chakra Geometry Controls</span>

              {/* Chakra Rotation */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span>Rotate Chakra (Free °)</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="0.1"
                      value={Math.round(chakraRotation * 10) / 10}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setChakraRotation((val % 360 + 360) % 360);
                      }}
                      className="w-16 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-right font-bold text-emerald-600 dark:text-emerald-400"
                    />
                    <span className="font-bold">°</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="0.1"
                  value={chakraRotation}
                  onChange={(e) => setChakraRotation(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Chakra Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Scale Radius</span>
                  <span className="font-bold">{chakraScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={chakraScale}
                  onChange={(e) => setChakraScale(Math.max(0.5, Math.min(3.0, parseFloat(e.target.value))))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Chakra Aspect Stretch */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span>Stretch Ratio (Free)</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.5"
                      max="3.0"
                      step="0.01"
                      value={Math.round(chakraAspect * 100) / 100}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setChakraAspect(Math.max(0.5, Math.min(3.0, val)));
                      }}
                      className="w-16 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-right font-bold text-emerald-600 dark:text-emerald-400"
                    />
                    <span className="font-bold">x</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.01"
                  value={chakraAspect}
                  onChange={(e) => setChakraAspect(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Chakra Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Opacity</span>
                  <span className="font-bold">{Math.round(chakraOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={chakraOpacity}
                  onChange={(e) => setChakraOpacity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Lock / Unlock */}
              <button
                onClick={() => setChakraLocked(prev => !prev)}
                className={`w-full py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  chakraLocked ? "bg-amber-500/20 text-amber-600 border-amber-500/40" : "border-slate-300 dark:border-slate-700 text-slate-400"
                }`}
              >
                {chakraLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{chakraLocked ? "Chakra Position Locked" : "Chakra Unlocked"}</span>
              </button>

              {/* Alignment Action Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={onCenterChakra}
                  className="py-1.5 px-2 bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Center On Blueprint
                </button>
                <button
                  onClick={onSnapChakra}
                  className="py-1.5 px-2 bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Snap To Blueprint
                </button>
                <button
                  onClick={onFitChakra}
                  className="py-1.5 px-2 bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Fit To Blueprint
                </button>
                <button
                  onClick={onResetChakra}
                  className="py-1.5 px-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Reset Chakra
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 5. CONTEXT TAB (CLIENT CONTEXT INTELLIGENCE ENGINE - CCIE) */}
        {activeInspectorTab === "context" && (
          profile ? (
            <div className="space-y-3 font-sans">
              <div className="p-3 rounded-xl border bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-300 flex items-center gap-1">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Client Context (CCIE)</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    profile.consultationPriority === "HIGH" 
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" 
                      : profile.consultationPriority === "MEDIUM" 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}>
                    {profile.consultationPriority} PRIORITY
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  Client: <span className="text-emerald-400 font-mono">{profile.clientId}</span>
                </div>
              </div>

              {/* Primary Concern */}
              <div className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/30 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Primary Concern</span>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                  {profile.problemClassification.primaryProblem}
                </span>
              </div>

              {/* Primary Goal */}
              <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Target Goal</span>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block leading-relaxed">
                  "{profile.primaryGoalText}"
                </span>
              </div>

              {/* Consultation Objective */}
              <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/30 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Consultation Objective</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug italic">
                  "{profile.consultationObjective}"
                </p>
              </div>

              {/* Key Constraints */}
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Key Constraints</span>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ownership:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{profile.constraintsSummary.ownershipStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{profile.constraintsSummary.budgetLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">No Demolition:</span>
                    <span className="font-bold text-amber-500">{profile.constraintsSummary.hasNoDemolitionRule ? "YES" : "NO"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remedy Preference:</span>
                    <span className="font-bold text-teal-500">{profile.preferenceSummary.remedyStyle}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <BrainCircuit className="w-8 h-8 text-indigo-400 mx-auto" />
              <p className="text-xs font-bold">No Client Context Profile</p>
              <p className="text-[10px] text-slate-500">Complete Client Discovery Engine form to populate consultant context.</p>
            </div>
          )
        )}

        {/* 6. SELECTION TAB — EXPLAINABILITY PANEL */}
        {activeInspectorTab === "selection" && (
          selectedEntity ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Selection Overview</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">{selectedEntity.name}</span>
                <span className="text-[10px] text-emerald-500 font-mono block">ID: {selectedEntity.id}</span>
              </div>

              {/* EXPLAINABILITY PANEL — CATEGORY & PROVENANCE TRACE */}
              <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/30 space-y-2.5">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-1.5">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explainability Panel</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    {selectedEntity.category || "CATEGORY_B"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">Detected By:</span>
                    <span className="font-bold text-indigo-500 text-[11px]">{selectedEntity.source || "OBJECT_DETECTOR"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">Confidence:</span>
                    <span className="font-bold text-emerald-500 text-[11px]">
                      {selectedEntity.confidence ? `${Math.round(selectedEntity.confidence * 100)}%` : "100%"}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 text-[9px] block uppercase font-bold mb-0.5">Detection Reason:</span>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      {selectedEntity.detectedByReason || "AI Multimodal Spatial Recognition & Polygon Mapping"}
                    </p>
                  </div>
                  {selectedEntity.polygon && selectedEntity.polygon.length > 0 && (
                    <div className="pt-1">
                      <span className="text-slate-400 text-[9px] block uppercase font-bold mb-0.5">Bounding Polygon Vertices:</span>
                      <p className="text-[9px] text-slate-500 font-mono break-all bg-slate-100 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                        {JSON.stringify(selectedEntity.polygon)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Layer:</span>
                  <span className="font-bold">{selectedEntity.layer}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Material:</span>
                  <span className="font-bold">{selectedEntity.material}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Vastu Zone:</span>
                  <span className="font-bold text-emerald-500">{selectedEntity.vastu}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 font-sans">
              <p className="text-xs">No element active in selection.</p>
              <p className="text-[10px] text-slate-500 mt-1">Select an element on canvas to view Category & Source Explainability.</p>
            </div>
          )
        )}



      </div>
    </div>
  );
};

export default RightInspectorPanel;
