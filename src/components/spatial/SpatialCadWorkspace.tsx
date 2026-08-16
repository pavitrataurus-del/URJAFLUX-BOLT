import React, { useState, useEffect } from 'react';
import {
  Compass,
  Layers,
  Ruler,
  ShieldCheck,
  Database,
  Upload,
  Info,
  Sliders,
  CheckCircle2,
  FileCode,
  Share2,
  UserCheck,
  Eye,
  Activity
} from 'lucide-react';

import { FloorPlan, UserRole, Layer } from '../../core/spatial/SpatialTypes';
import { CadImportEngine } from '../../core/spatial/CadImportEngine';
import { NorthOrientationEngine } from '../../core/spatial/NorthOrientationEngine';
import { CadCanvasViewer } from './CadCanvasViewer';
import { LayerManagerPanel } from './LayerManagerPanel';
import { PropertyInspectorPanel } from './PropertyInspectorPanel';
import { SpatialObjectTree } from './SpatialObjectTree';
import { GeometryValidatorModal } from './GeometryValidatorModal';
import { CadImportModal } from './CadImportModal';
import { SpatialRegistryExplorer } from './SpatialRegistryExplorer';
import { SpatialIntegrationService } from '../../core/spatial/SpatialIntegrationService';

export const SpatialCadWorkspace: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [activeTab, setActiveTab] = useState<'CANVAS' | 'REGISTRY' | 'VALIDATION' | 'SERVICES'>('CANVAS');
  const [activeTool, setActiveTool] = useState<'SELECT' | 'MEASURE' | 'NORTH_MARKER'>('SELECT');
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('ROOM-NE');
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>('ROOM');
  const [measuredDistanceMsg, setMeasuredDistanceMsg] = useState<string | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isValidatorModalOpen, setIsValidatorModalOpen] = useState<boolean>(false);

  // Initialize sample floor plan
  useEffect(() => {
    async function initFloorPlan() {
      const engine = CadImportEngine.getInstance();
      const plan = await engine.importFloorPlanFile('ground_floor_architectural.dxf', 'DXF', 'BLDG-2026-001', userRole);
      setFloorPlan(plan);
    }
    initFloorPlan();
  }, []);

  if (!floorPlan) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-mono">
        Initializing DOMAIN-011 Spatial CAD & Floor Plan Intelligence Engine...
      </div>
    );
  }

  const handleNorthAngleChange = (newAngle: number) => {
    const updated = NorthOrientationEngine.getInstance().updateFloorPlanOrientation(
      floorPlan,
      newAngle,
      floorPlan.orientation.magneticDeclination
    );
    setFloorPlan(updated);
  };

  const handleToggleLayerVisibility = (layerId: string) => {
    const updatedLayers = floorPlan.layers.map((l) =>
      l.id === layerId ? { ...l, isVisible: !l.isVisible } : l
    );
    setFloorPlan({ ...floorPlan, layers: updatedLayers });
  };

  const handleToggleLayerLock = (layerId: string) => {
    const updatedLayers = floorPlan.layers.map((l) =>
      l.id === layerId ? { ...l, isLocked: !l.isLocked } : l
    );
    setFloorPlan({ ...floorPlan, layers: updatedLayers });
  };

  const integrationService = SpatialIntegrationService.getInstance();
  const reasoningSpecs = integrationService.getSpatialSummaryForReasoning(floorPlan);
  const executionSpecs = integrationService.getSpatialSpecsForExecution(floorPlan);
  const twinSpecs = integrationService.getSpatialMeshForDigitalTwin(floorPlan);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Workspace Header & Role Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              DOMAIN-011 Spatial Geometry Engine
            </span>
            <span className="text-xs text-slate-400">• Single Source of Spatial Truth</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            Enterprise CAD & Floor Plan Intelligence Studio
          </h1>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Role:
          </span>
          {(['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER', 'END_USER'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                userRole === role
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('CANVAS')}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === 'CANVAS'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Interactive CAD Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTRY')}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === 'REGISTRY'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Spatial Object Registry</span>
          </button>

          <button
            onClick={() => setIsValidatorModalOpen(true)}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold transition flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Geometry Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === 'SERVICES'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Downstream Services API</span>
          </button>
        </div>

        {userRole !== 'END_USER' && (
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <Upload className="w-4 h-4" />
            <span>Import CAD / Floor Plan</span>
          </button>
        )}
      </div>

      {/* Main Tab Views */}
      {activeTab === 'CANVAS' && (
        <div className="space-y-6">
          {/* Active Tool & North Angle Calibration Header */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            {/* Interactive Tool Selector */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTool('SELECT')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeTool === 'SELECT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Select & Inspect
              </button>
              <button
                onClick={() => setActiveTool('MEASURE')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeTool === 'MEASURE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                Measurement Tool
              </button>
            </div>

            {measuredDistanceMsg && (
              <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                {measuredDistanceMsg}
              </span>
            )}

            {/* Live North Orientation Calibration */}
            {userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER' ? (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Calibrate North Angle:
                </span>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={floorPlan.orientation.northAngleDegrees}
                  onChange={(e) => handleNorthAngleChange(Number(e.target.value))}
                  className="w-32 accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-emerald-300 w-12">
                  {floorPlan.orientation.northAngleDegrees}°
                </span>
              </div>
            ) : null}
          </div>

          {/* Main 3-Column Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Object Tree & Layer Manager */}
            <div className="lg:col-span-3 space-y-4">
              <LayerManagerPanel
                layers={floorPlan.layers}
                onToggleVisibility={handleToggleLayerVisibility}
                onToggleLock={handleToggleLayerLock}
              />
              <SpatialObjectTree
                floorPlan={floorPlan}
                selectedObjectId={selectedObjectId}
                onSelectObject={(id, type) => {
                  setSelectedObjectId(id);
                  setSelectedObjectType(type);
                }}
              />
            </div>

            {/* Center Canvas Viewer */}
            <div className="lg:col-span-6">
              <CadCanvasViewer
                floorPlan={floorPlan}
                selectedObjectId={selectedObjectId}
                onSelectObject={(id, type) => {
                  setSelectedObjectId(id);
                  setSelectedObjectType(type);
                }}
                activeTool={activeTool}
                onMeasureDistance={(dist) => setMeasuredDistanceMsg(`Distance: ${dist.toFixed(2)} meters`)}
              />
            </div>

            {/* Right Sidebar: Property Inspector */}
            <div className="lg:col-span-3">
              <PropertyInspectorPanel
                floorPlan={floorPlan}
                selectedObjectId={selectedObjectId}
                selectedObjectType={selectedObjectType}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'REGISTRY' && <SpatialRegistryExplorer floorPlan={floorPlan} />}

      {activeTab === 'SERVICES' && (
        <div className="space-y-6 text-xs text-slate-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              Downstream Spatial Services API & Integration Matrix
            </h2>
            <p className="text-slate-400">
              DOMAIN-011 exposes geometric intelligence to downstream domains via clean service abstractions without cyclic imports or business logic pollution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 block">DOMAIN-006 (Unified Reasoning)</span>
                <p className="text-slate-400">Provides room centroids, areas, and cardinal directions for energy zone synthesis.</p>
                <div className="pt-2 font-mono text-[11px] text-slate-300">
                  Total Area: {reasoningSpecs.totalAreaSqMeters} m²
                  <br />
                  Rooms Parsed: {reasoningSpecs.rooms.length}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-sky-400 block">DOMAIN-007 (Project Execution)</span>
                <p className="text-slate-400">Provides wall lengths, structural volumes, and material estimates.</p>
                <div className="pt-2 font-mono text-[11px] text-slate-300">
                  Wall Length: {executionSpecs.totalWallLengthMeters} m
                  <br />
                  Estimated Brick Vol: {executionSpecs.materialsEstimated.brickVolumeCuMeters} m³
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 block">DOMAIN-008 (Digital Twin)</span>
                <p className="text-slate-400">Provides QuadTree 2D/3D spatial coordinates mesh for IoT positioning.</p>
                <div className="pt-2 font-mono text-[11px] text-slate-300">
                  Spatial Nodes: {twinSpecs.spatialNodesCount}
                  <br />
                  QuadTree Active: {twinSpecs.quadTreeIndexed ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geometry Diagnostics Modal */}
      <GeometryValidatorModal
        floorPlan={floorPlan}
        isOpen={isValidatorModalOpen}
        onClose={() => setIsValidatorModalOpen(false)}
      />

      {/* CAD Import Modal */}
      <CadImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(importedPlan) => setFloorPlan(importedPlan)}
        userRole={userRole}
      />
    </div>
  );
};
