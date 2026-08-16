import React, { useState } from "react";
import { 
  Network, Code, Sliders, Database, Search, Shield, Play, 
  RefreshCw, Layers, CheckCircle2, AlertCircle, Sparkles, 
  Activity, ArrowRight, CornerDownRight, Key, Info, HelpCircle, 
  Terminal, GitMerge, Lock, Unlock, Eye, Trash2, Plus, Share2, FileText, FileJson
} from "lucide-react";

// Types for simulated framework
export interface EntityNode {
  id: string;
  name: string;
  type: string;
  category: string;
  lifecycle: "Created" | "Draft" | "Validated" | "Analyzed" | "Approved" | "Published" | "Archived";
  geometryType: "Point" | "Line" | "Polyline" | "Rectangle" | "Polygon" | "Circle" | "Virtual";
  layer: string;
  vastuZone: string;
  version: string;
  revision: number;
}

export interface EntityRelationship {
  source: string;
  target: string;
  predicate: "Contains" | "Inside" | "Adjacent" | "Touches" | "Intersects" | "Connected To" | "Hosted By" | "North Of" | "South Of" | "East Of" | "West Of";
  strength: number; // 0.0 to 1.0
}

export default function SpatialObjectModelPage() {
  // Navigation & Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<"hierarchy" | "schema" | "graph" | "api" | "specs">("hierarchy");
  
  // Interactive State: Selected Inheritance Level
  const [selectedInheritance, setSelectedInheritance] = useState<string>("SpatialEntity");

  // Schema Tab Selected Type
  const [selectedSchemaType, setSelectedSchemaType] = useState<string>("RoomEntity");

  // API Simulation states
  const [apiLogs, setApiLogs] = useState<string[]>([
    "[SYSTEM] Spatial Object Model Kernel v3.2-CORE initialized.",
    "[DB] Indexing 12,500 background virtual nodes...",
    "[RESOLVER] Registered 15 spatial relationships for active blueprint."
  ]);
  const [simulatedEntities, setSimulatedEntities] = useState<EntityNode[]>([
    { id: "ent_001", name: "Brahmasthan Center", type: "VirtualAnchor", category: "Virtual", lifecycle: "Validated", geometryType: "Point", layer: "Vastu Grid", vastuZone: "Brahmasthan (Center)", version: "1.0.0", revision: 1 },
    { id: "ent_002", name: "Main Boundary Wall", type: "Wall", category: "Structural", lifecycle: "Approved", geometryType: "Polyline", layer: "Architecture", vastuZone: "Nirriti (Southwest)", version: "1.2.4", revision: 4 },
    { id: "ent_003", name: "Primary Living Room", type: "Room", category: "Architectural", lifecycle: "Analyzed", geometryType: "Rectangle", layer: "Architecture", vastuZone: "Ishanya (Northeast)", version: "2.1.0", revision: 5 },
    { id: "ent_004", name: "Eshanya Water Portal", type: "WaterInlet", category: "MEP Systems", lifecycle: "Draft", geometryType: "Circle", layer: "Water", vastuZone: "Ishanya (Northeast)", version: "1.0.1", revision: 2 },
    { id: "ent_005", name: "Solar Agni Battery", type: "EnergySource", category: "MEP Systems", lifecycle: "Published", geometryType: "Rectangle", layer: "Electrical", vastuZone: "Agneya (Southeast)", version: "3.4.0", revision: 12 }
  ]);
  const [simulatedRelations, setSimulatedRelations] = useState<EntityRelationship[]>([
    { source: "ent_003", target: "ent_001", predicate: "Adjacent", strength: 0.95 },
    { source: "ent_003", target: "ent_002", predicate: "Connected To", strength: 1.0 },
    { source: "ent_004", target: "ent_003", predicate: "North Of", strength: 0.85 },
    { source: "ent_005", target: "ent_001", predicate: "South Of", strength: 0.90 }
  ]);

  // Selected Node in Graph
  const [selectedGraphNode, setSelectedGraphNode] = useState<string>("ent_003");

  // State modification counters
  const [mutationCount, setMutationCount] = useState<number>(0);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchTypeFilter, setSearchTypeFilter] = useState<string>("ALL");

  const addApiLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setApiLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Simulated API Methods
  const handleCreateEntity = () => {
    const id = `ent_00${simulatedEntities.length + 1}`;
    const newEnt: EntityNode = {
      id,
      name: `Custom AI Portal Node ${simulatedEntities.length + 1}`,
      type: "VastuGate",
      category: "Analysis",
      lifecycle: "Created",
      geometryType: "Circle",
      layer: "Annotations",
      vastuZone: "Vayu (Northwest)",
      version: "1.0.0",
      revision: 1
    };

    setSimulatedEntities(prev => [...prev, newEnt]);
    setMutationCount(m => m + 1);
    addApiLog(`API CALL: createEntity(type: "VastuGate", layer: "Annotations") -> returns ${id}`);
    addApiLog(`EVENT DISPATCH: EntityCreatedEvent { id: "${id}", name: "${newEnt.name}" }`);
  };

  const handleMoveEntity = (id: string, dx: number, dy: number) => {
    setSimulatedEntities(prev => prev.map(ent => {
      if (ent.id === id) {
        const nextRev = ent.revision + 1;
        return { ...ent, revision: nextRev, lifecycle: "Draft" };
      }
      return ent;
    }));
    const target = simulatedEntities.find(e => e.id === id);
    addApiLog(`API CALL: moveEntity(id: "${id}", dx: ${dx}m, dy: ${dy}m) -> revision bumped to r${target ? target.revision + 1 : 1}`);
    addApiLog(`EVENT DISPATCH: EntityMovedEvent { id: "${id}", transformMatrix: [1, 0, 0, 1, ${dx}, ${dy}] }`);
  };

  const handleAddRelationship = (source: string, target: string, predicate: EntityRelationship["predicate"]) => {
    const exists = simulatedRelations.some(r => r.source === source && r.target === target && r.predicate === predicate);
    if (exists) {
      addApiLog(`API WARN: Relationship already exists between ${source} and ${target}`);
      return;
    }
    const newRel: EntityRelationship = { source, target, predicate, strength: 0.88 };
    setSimulatedRelations(prev => [...prev, newRel]);
    addApiLog(`API CALL: addRelationship(source: "${source}", target: "${target}", predicate: "${predicate}")`);
    addApiLog(`EVENT DISPATCH: RelationshipCreatedEvent { ${source} --[${predicate}]--> ${target} }`);
  };

  const handleExecuteRules = () => {
    addApiLog(`API CALL: executeAnalysisRules() -> scanning entity graph...`);
    setTimeout(() => {
      setSimulatedEntities(prev => prev.map(ent => {
        if (ent.lifecycle === "Draft" || ent.lifecycle === "Created") {
          return { ...ent, lifecycle: "Analyzed" };
        }
        return ent;
      }));
      addApiLog(`EVENT DISPATCH: RulesEvaluatedEvent { status: SUCCESS, rulesTriggered: 14, anomaliesFlagged: 0 }`);
      addApiLog(`API SUCCESS: Analysis state synchronized. Vastu balancing parameters validated.`);
    }, 400);
  };

  // Inheritance data
  const inheritanceTree = {
    Entity: {
      desc: "The root constitutional archetype. Every data record inside URJAFLUX is an Entity.",
      fields: [
        { name: "id", type: "UUID", desc: "Global immutable object signature." },
        { name: "name", type: "string", desc: "Human-readable label." },
        { name: "type", type: "string", desc: "Primary architectural type key (e.g. 'Room', 'Wall')." },
        { name: "createdDate", type: "ISO-8601", desc: "Creation record log." },
        { name: "version", type: "string", desc: "Semantic version control tag (X.Y.Z)." },
        { name: "revision", type: "integer", desc: "Monotonically increasing sequence tracker." },
        { name: "status", type: "string", desc: "Active system health or state." }
      ],
      children: ["SpatialEntity", "AnalysisEntity", "ReportEntity"]
    },
    SpatialEntity: {
      desc: "Entities possessing physical metrics, transformations, boundaries, and coordinates inside 2D/3D workspaces.",
      fields: [
        { name: "geometry", type: "GeometryModel", desc: "Abstract geometry definitions (Point, Line, Rectangle)." },
        { name: "layer", type: "string", desc: "Viewport group layer reference." },
        { name: "transformMatrix", type: "Float32Array[16]", desc: "Affine transformation matrix." },
        { name: "boundingBox", type: "BoundingBox2D", desc: "Collision and selection bounding coordinates." },
        { name: "coordinateSystem", type: "string", desc: "Tracking grid mode (e.g., 'LOCAL_GRID_WGS84')." }
      ],
      children: ["ArchitecturalEntity", "ReferenceEntity"]
    },
    ArchitecturalEntity: {
      desc: "Subclass specifying elements critical to building planning, space scheduling, and energy analysis.",
      fields: [
        { name: "material", type: "string", desc: "Core material classification." },
        { name: "thermalConductivity", type: "float", desc: "Environmental flux performance metrics." },
        { name: "heightOffset", type: "float", desc: "Z-axis projection heights (in meters)." }
      ],
      children: ["StructuralEntity", "OpeningEntity"]
    },
    StructuralEntity: {
      desc: "Concrete pillars, structural load bearings, boundary walls, and geometric dividers.",
      fields: [
        { name: "loadCapacity", type: "float", desc: "Engineering limit specs." },
        { name: "reinforcementType", type: "string", desc: "Structural load standard tags." }
      ],
      children: []
    },
    OpeningEntity: {
      desc: "Portals enabling spatial connection and environmental flow (Doors, Gates, Windows, Skylights).",
      fields: [
        { name: "swingDirection", type: "enum", desc: "Door pivot angle configuration (LH / RH)." },
        { name: "ventilationCoefficient", type: "float", desc: "Prana flow ratios." }
      ],
      children: []
    },
    ReferenceEntity: {
      desc: "Geometric guides, compass directions, baseline grids, and measurement guidelines.",
      fields: [
        { name: "guideLineType", type: "string", desc: "Style specification (dashed, dotted, solid)." },
        { name: "snapPriority", type: "integer", desc: "Magnetic snap priority index." }
      ],
      children: []
    },
    AnalysisEntity: {
      desc: "Calculated structural outcomes, energy flows, and Vastu scoring datasets. Immutable states linked to base geometry.",
      fields: [
        { name: "targetEntityId", type: "UUID", desc: "Identifier of the target entity under evaluation." },
        { name: "confidence", type: "float", desc: "Statistical algorithm certainty ratio (0.0 - 1.0)." },
        { name: "recommendations", type: "string[]", desc: "Automated corrective measures generated by SRE." }
      ],
      children: []
    },
    ReportEntity: {
      desc: "Synthesized workspace report components, diagnostic layouts, and text summaries.",
      fields: [
        { name: "sections", type: "array", desc: "Structured markdown texts." },
        { name: "signatureChain", type: "string[]", desc: "SHA-256 validation signatures." }
      ],
      children: []
    }
  };

  // Schema interface codes
  const schemaInterfaceCode: Record<string, string> = {
    RoomEntity: `/**
 * @interface RoomEntity
 * @extends ArchitecturalEntity
 * Definitive spatial blueprint schema for floorplan rooms inside URJAFLUX AI OS.
 */
export interface RoomEntity extends ArchitecturalEntity {
  id: string;             // Inherited from Entity (UUID)
  name: string;           // Inherited from Entity (e.g. "Primary Bed Room")
  type: "Room";          // Immutable entity type
  
  // Spatial Geometry
  geometry: {
    type: "Rectangle" | "Polygon";
    coordinates: Point2D[];
    center: Point2D;
    area: number;         // Calculated area in sq. meters
  };
  
  // Vastu & Metadata parameters
  metadata: {
    vastuZone: VastuChakraZone; // e.g. "Northeast"
    energyScore: number;       // 0.0 to 100.0 prana score
    recommendedColor: string;  // Balanced chroma hue
    usage: "Sleeping" | "Dining" | "Worship" | "Kitchen" | "Study";
  };

  // Relationships
  adjacentRooms: UUID[];       // Neighboring wall nodes
  hostStoryId: UUID;          // Target Floor Plan reference
}`,
    WallEntity: `/**
 * @interface WallEntity
 * @extends StructuralEntity
 * High-performance structural divider modeling.
 */
export interface WallEntity extends StructuralEntity {
  id: string;             // Inherited from Entity
  type: "Wall";
  
  // Spatial Vector
  geometry: {
    type: "Polyline";
    vertices: Point2D[];   // Endpoint coordinates
    thickness: number;     // Wall width in meters (default 0.23m)
    height: number;        // Wall height in meters (default 3.0m)
  };

  // Material Matrix
  specifications: {
    material: string;      // e.g. "Concrete Block"
    loadBearing: boolean;  // True if columns depend on it
    soundTransmissionClass: number; // Decibel damping index
  };
}`,
    OpeningEntity: `/**
 * @interface OpeningEntity
 * @extends ArchitecturalEntity
 * Models Doors, Gates, Windows, and Air Inlets.
 */
export interface OpeningEntity extends ArchitecturalEntity {
  id: string;
  type: "Door" | "Window" | "Inlet";

  geometry: {
    type: "Line" | "Circle";
    placementOffset: number; // Distance from parent Wall endpoint
    width: number;           // Panel width (meters)
    clearOpening: number;    // Effective passage size
  };

  hostWallId: UUID;          // Linked wall hosting this opening

  performance: {
    ventilationRatio: number; // CFM flow indicator
    fireRating: string;       // Safety threshold tag
  };
}`
  };

  const currentInherit = inheritanceTree[selectedInheritance as keyof typeof inheritanceTree] || inheritanceTree.Entity;
  const currentSchema = schemaInterfaceCode[selectedSchemaType] || schemaInterfaceCode.RoomEntity;

  // Filter entities
  const filteredEntities = simulatedEntities.filter(ent => {
    const matchesSearch = ent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ent.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ent.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = searchTypeFilter === "ALL" || ent.category === searchTypeFilter;
    return matchesSearch && matchesType;
  });

  const selectedNode = simulatedEntities.find(e => e.id === selectedGraphNode) || simulatedEntities[0];
  const nodeRelations = simulatedRelations.filter(r => r.source === selectedGraphNode || r.target === selectedGraphNode);

  return (
    <div className="w-full h-full bg-[#04060a] flex flex-col overflow-hidden font-mono text-[11px] text-slate-300">
      
      {/* 1. TOP HEADER BRAND */}
      <div className="h-12 shrink-0 bg-[#070b13] border-b border-slate-900 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-widest text-slate-100 leading-none">SPATIAL OBJECT MODEL & ENTITY FRAMEWORK</h1>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 inline-block">Universal System Specification • Active Core Kernel</span>
          </div>
        </div>

        {/* Dynamic sub-tab selector */}
        <div className="flex items-center gap-1">
          {[
            { id: "hierarchy", label: "Inheritance Model", icon: GitMerge },
            { id: "schema", label: "Data Schemas", icon: Code },
            { id: "graph", label: "Semantic Graph", icon: Network },
            { id: "api", label: "API Simulator", icon: Play },
            { id: "specs", label: "Technical Specs", icon: FileText }
          ].map(tab => {
            const IsActive = activeSubTab === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`h-7 px-3 rounded-sm font-bold flex items-center gap-1.5 transition-all uppercase text-[9px] border ${
                  IsActive 
                    ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CORE WORKSPACE AREA */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        
        {/* ========================================================================= */}
        {/* SUB-TAB 1: INHERITANCE TREE EXPLORER */}
        {/* ========================================================================= */}
        {activeSubTab === "hierarchy" && (
          <div className="flex-1 flex overflow-hidden divide-x divide-slate-900/60">
            
            {/* Tree column */}
            <div className="w-[45%] p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">ARCHITECTURE TREE</span>
                <h2 className="text-sm font-bold text-slate-200 mt-1">Universal Spatial Class Inheritance</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Every object inside URJAFLUX is represented as a subclass inheriting from the root constitutional Entity archetype. Click on any block to audit its fields.
                </p>
              </div>

              {/* Graphical inheritance map */}
              <div className="space-y-3">
                {/* Level 0: Root Entity */}
                <div 
                  onClick={() => setSelectedInheritance("Entity")}
                  className={`p-3 rounded border text-left cursor-pointer transition-all ${
                    selectedInheritance === "Entity" 
                      ? "bg-slate-950 border-indigo-500/30 text-slate-100 shadow-md shadow-indigo-950/20" 
                      : "bg-[#070b13] border-slate-900/80 text-slate-400 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-indigo-400" /> Entity [Root Class]
                    </span>
                    <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 py-0.5 rounded font-bold font-mono">BASE Archetype</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Declares unique keys, identity scopes, system versions, and revision sequences.</p>
                </div>

                {/* Level 1 arrow */}
                <div className="flex justify-center h-4"><ArrowRight className="w-3.5 h-3.5 text-slate-700 transform rotate-90" /></div>

                {/* Level 1 Subclasses */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "SpatialEntity", title: "SpatialEntity", desc: "Coordinates & Geometry" },
                    { id: "AnalysisEntity", title: "AnalysisEntity", desc: "Vastu & Energy Audits" },
                    { id: "ReportEntity", title: "ReportEntity", desc: "Markdown Synthesis" }
                  ].map(lvl1 => (
                    <div 
                      key={lvl1.id}
                      onClick={() => setSelectedInheritance(lvl1.id)}
                      className={`p-2.5 rounded border text-center cursor-pointer transition-all ${
                        selectedInheritance === lvl1.id 
                          ? "bg-slate-950 border-indigo-500/40 text-slate-100 shadow-sm" 
                          : "bg-[#070b13] border-slate-900/80 text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase block">{lvl1.title}</span>
                      <span className="text-[8px] text-slate-500 mt-1 block">{lvl1.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Level 2 arrow */}
                <div className="flex justify-center h-4"><ArrowRight className="w-3.5 h-3.5 text-slate-700 transform rotate-90" /></div>

                {/* Level 2 (Spatial Specific) */}
                <div className="pl-6 border-l border-dashed border-slate-800 space-y-3">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">SpatialEntity Branches</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "ArchitecturalEntity", title: "ArchitecturalEntity", desc: "Planning & Energy Elements" },
                      { id: "ReferenceEntity", title: "ReferenceEntity", desc: "Grid Guidelines & Anchors" }
                    ].map(lvl2 => (
                      <div 
                        key={lvl2.id}
                        onClick={() => setSelectedInheritance(lvl2.id)}
                        className={`p-2 rounded border text-left cursor-pointer transition-all ${
                          selectedInheritance === lvl2.id 
                            ? "bg-slate-950 border-indigo-500/40 text-slate-100" 
                            : "bg-[#070b13] border-slate-900/80 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase block">{lvl2.title}</span>
                        <p className="text-[8px] text-slate-500 mt-0.5">{lvl2.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Level 3 arrow */}
                  <div className="flex justify-center h-4"><ArrowRight className="w-3.5 h-3.5 text-slate-700 transform rotate-90" /></div>

                  {/* Level 3 (Architectural Specific) */}
                  <div className="pl-4 border-l border-dashed border-slate-700 grid grid-cols-2 gap-2">
                    {[
                      { id: "StructuralEntity", title: "StructuralEntity", desc: "Walls, load bearers" },
                      { id: "OpeningEntity", title: "OpeningEntity", desc: "Doors, Gates, Windows" }
                    ].map(lvl3 => (
                      <div 
                        key={lvl3.id}
                        onClick={() => setSelectedInheritance(lvl3.id)}
                        className={`p-2 rounded border text-left cursor-pointer transition-all ${
                          selectedInheritance === lvl3.id 
                            ? "bg-slate-950 border-indigo-500/40 text-slate-100" 
                            : "bg-[#070b13] border-slate-900/80 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        <span className="text-[8px] font-bold uppercase block">{lvl3.title}</span>
                        <span className="text-[7px] text-slate-500 block">{lvl3.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Field Specifications Column */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#05080f] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">SPECIFICATION VIEWER</span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">Class Properties: <span className="text-emerald-400">{selectedInheritance}</span></h3>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0a0f1b] border border-slate-800 px-2 py-0.5 rounded">
                  <span className="text-[8px] text-slate-500 uppercase font-bold">Inherited from</span>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase">{selectedInheritance === "Entity" ? "NONE" : "Entity"}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-900 rounded space-y-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Class Intent</span>
                <p className="text-xs text-slate-300 leading-relaxed">{currentInherit.desc}</p>
              </div>

              {/* Property Grid */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Constitutional Properties Schema</span>
                <div className="border border-slate-900 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#070b13] border-b border-slate-900 text-slate-400">
                        <th className="p-2.5 font-bold text-[9px] uppercase tracking-wider">Property Name</th>
                        <th className="p-2.5 font-bold text-[9px] uppercase tracking-wider">Data Type</th>
                        <th className="p-2.5 font-bold text-[9px] uppercase tracking-wider">Validation Specification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 bg-[#04060a]">
                      {currentInherit.fields.map(f => (
                        <tr key={f.name} className="hover:bg-slate-900/30">
                          <td className="p-2.5 font-bold text-slate-200 font-mono">{f.name}</td>
                          <td className="p-2.5 font-mono text-[9px] text-indigo-400">{f.type}</td>
                          <td className="p-2.5 text-slate-400">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* JSON preview */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
                  <FileJson className="w-3.5 h-3.5 text-slate-500" /> Compiled Metadata representation (YAML/JSON)
                </span>
                <pre className="p-4 bg-slate-950 border border-slate-900 text-slate-400 rounded text-[10px] overflow-x-auto select-all">
{`{
  "$schema": "https://urjaflux.com/schemas/v3/${selectedInheritance}.json",
  "archetype": "${selectedInheritance}",
  "inherits": [${selectedInheritance === "Entity" ? "" : '"Entity"'}${selectedInheritance.includes("Entity") && selectedInheritance !== "Entity" && selectedInheritance !== "SpatialEntity" ? ', "SpatialEntity"' : ''}],
  "properties": {
    ${currentInherit.fields.map(f => `"${f.name}": { "type": "${f.type.toLowerCase()}", "description": "${f.desc}" }`).join(",\n    ")}
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: DATA SCHEMAS & TYPINGS PLAYGROUND */}
        {/* ========================================================================= */}
        {activeSubTab === "schema" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Schema selection left bar */}
            <div className="w-[30%] border-r border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-4 shrink-0">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">DATA SCHEMAS</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">TypeScript Interface Models</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Select a pre-compiled high-fidelity spatial subclass to view its strict TypeScript declarations.
                </p>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: "RoomEntity", label: "RoomEntity Interface", desc: "Planning & Zone Metrics" },
                  { id: "WallEntity", label: "WallEntity Interface", desc: "Structural Polyline Geometry" },
                  { id: "OpeningEntity", label: "OpeningEntity Interface", desc: "Passage portals (Doors & Windows)" }
                ].map(sch => (
                  <button
                    key={sch.id}
                    onClick={() => setSelectedSchemaType(sch.id)}
                    className={`w-full p-2.5 rounded border text-left transition-all block ${
                      selectedSchemaType === sch.id 
                        ? "bg-slate-950 border-indigo-500/30 text-slate-100" 
                        : "bg-[#070b13] border-slate-900/80 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <span className="font-bold text-[9px] uppercase block">{sch.label}</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">{sch.desc}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-slate-950 border border-slate-900 rounded space-y-2">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Info className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase tracking-wider">No Overwriting Rule</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Our core architecture dictates that **Analysis results (e.g. Vastu scores, heating zones) must never overwrite raw geometric coordinate points**. This keeps architectural vectors pristine.
                </p>
              </div>
            </div>

            {/* Code editor viewport */}
            <div className="flex-1 flex flex-col bg-[#05080f] overflow-hidden">
              <div className="h-9 border-b border-slate-900 bg-[#070b13] px-4 flex items-center justify-between shrink-0 select-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" /> SOURCE: src/types/spatial/{selectedSchemaType}.ts
                </span>
                <span className="text-[8px] text-slate-600 bg-[#0a0f1b] border border-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  READ-ONLY SYSTEM CORE
                </span>
              </div>

              <div className="flex-1 overflow-auto p-6 font-mono text-[10px] bg-slate-950/40 text-slate-300">
                <pre className="select-text whitespace-pre-wrap leading-relaxed">
                  <code>{currentSchema}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: SEMANTIC KNOWLEDGE GRAPH VISUALIZER */}
        {/* ========================================================================= */}
        {activeSubTab === "graph" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Visual network simulation space */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <div className="p-4 bg-[#070b13]/80 border-b border-slate-900 absolute top-0 left-0 right-0 z-10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">LIVE SPATIAL GRAPH RELATIONSHIP EXPLORER</span>
                  <span className="text-[8px] text-slate-500 block">Interactive node networks simulating Vastu intelligence & adjacency. Click on a node to view links.</span>
                </div>
                <div className="flex items-center gap-1 bg-[#05080e] border border-slate-800 px-2 py-0.5 rounded">
                  <span className="text-[8px] text-slate-500 uppercase">ACTIVE EDGES:</span>
                  <span className="font-bold text-emerald-400 text-[10px]">{simulatedRelations.length} Graph Connections</span>
                </div>
              </div>

              {/* Graphic container */}
              <div className="flex-1 flex items-center justify-center p-6 mt-12 relative overflow-hidden select-none bg-[#030508]">
                
                {/* SVG canvas mapping nodes and relationship lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer circle layout projection line */}
                  <circle cx="50%" cy="50%" r="180" stroke="#111827" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                  <circle cx="50%" cy="50%" r="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />

                  {/* Draw connection vectors */}
                  {simulatedRelations.map((rel, idx) => {
                    // Positional calculations for simulated nodes
                    const pos: Record<string, { x: string; y: string }> = {
                      ent_001: { x: "50%", y: "50%" },      // center
                      ent_002: { x: "25%", y: "40%" },      // left
                      ent_003: { x: "75%", y: "35%" },      // right-top
                      ent_004: { x: "70%", y: "70%" },      // right-bottom
                      ent_005: { x: "40%", y: "75%" }       // bottom
                    };

                    const srcPos = pos[rel.source] || { x: "50%", y: "50%" };
                    const tgtPos = pos[rel.target] || { x: "50%", y: "50%" };

                    return (
                      <g key={`${rel.source}-${rel.target}-${idx}`}>
                        <line 
                          x1={srcPos.x} 
                          y1={srcPos.y} 
                          x2={tgtPos.x} 
                          y2={tgtPos.y} 
                          stroke={selectedGraphNode === rel.source || selectedGraphNode === rel.target ? "#818cf8" : "#1e293b"} 
                          strokeWidth={selectedGraphNode === rel.source || selectedGraphNode === rel.target ? "1.5" : "0.75"}
                          strokeDasharray={rel.predicate === "Adjacent" ? "3 3" : "none"}
                        />
                        {/* Text overlay near center of line */}
                        <g className="opacity-70 hover:opacity-100">
                          <rect 
                            x="48%" 
                            y="48%" 
                            width="60" 
                            height="12" 
                            rx="2" 
                            fill="#04060a" 
                            stroke="#1e293b" 
                            strokeWidth="0.5"
                            className="transform -translate-x-1/2 -translate-y-1/2"
                          />
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes rendering as CSS absolute items */}
                <div className="absolute inset-0 flex items-center justify-center">
                  
                  {/* Anchor Center: Brahmasthan Node */}
                  <div 
                    onClick={() => setSelectedGraphNode("ent_001")}
                    style={{ left: "50%", top: "50%" }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border flex flex-col items-center justify-center cursor-pointer transition-all ${
                      selectedGraphNode === "ent_001" 
                        ? "bg-indigo-950 border-indigo-500 shadow-lg text-white font-bold" 
                        : "bg-[#070b13] border-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Network className="w-4 h-4 text-indigo-400 mb-0.5" />
                    <span className="text-[7px] uppercase tracking-wider">CORE</span>
                  </div>

                  {/* Node 2: Wall */}
                  <button 
                    onClick={() => setSelectedGraphNode("ent_002")}
                    style={{ left: "25%", top: "40%" }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded border text-left transition-all ${
                      selectedGraphNode === "ent_002" 
                        ? "bg-slate-950 border-emerald-500/60 text-slate-100 shadow-md" 
                        : "bg-[#070b13] border-slate-900 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <div className="text-[8px] text-slate-500 font-bold uppercase">WALL</div>
                    <div className="font-bold text-[9px] text-slate-200">Main Boundary</div>
                  </button>

                  {/* Node 3: Room */}
                  <button 
                    onClick={() => setSelectedGraphNode("ent_003")}
                    style={{ left: "75%", top: "35%" }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded border text-left transition-all ${
                      selectedGraphNode === "ent_003" 
                        ? "bg-slate-950 border-emerald-500/60 text-slate-100 shadow-md" 
                        : "bg-[#070b13] border-slate-900 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <div className="text-[8px] text-indigo-400 font-bold uppercase">ROOM</div>
                    <div className="font-bold text-[9px] text-slate-200">Primary Living</div>
                  </button>

                  {/* Node 4: Water */}
                  <button 
                    onClick={() => setSelectedGraphNode("ent_004")}
                    style={{ left: "70%", top: "70%" }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded border text-left transition-all ${
                      selectedGraphNode === "ent_004" 
                        ? "bg-slate-950 border-emerald-500/60 text-slate-100 shadow-md" 
                        : "bg-[#070b13] border-slate-900 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <div className="text-[8px] text-teal-400 font-bold uppercase">MEP WATER</div>
                    <div className="font-bold text-[9px] text-slate-200">Water Portal</div>
                  </button>

                  {/* Node 5: Solar */}
                  <button 
                    onClick={() => setSelectedGraphNode("ent_005")}
                    style={{ left: "40%", top: "75%" }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded border text-left transition-all ${
                      selectedGraphNode === "ent_005" 
                        ? "bg-slate-950 border-emerald-500/60 text-slate-100 shadow-md" 
                        : "bg-[#070b13] border-slate-900 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <div className="text-[8px] text-amber-400 font-bold uppercase">MEP SOLAR</div>
                    <div className="font-bold text-[9px] text-slate-200">Agni Solar Array</div>
                  </button>

                </div>

                {/* Legend overlay */}
                <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-900 p-3 rounded space-y-1.5 text-[8px] select-none">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">RELATIONSHIP LEGEND</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-indigo-500 inline-block" /> Solid Edge (Physical Alignment / Anchored)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 border-t border-dashed border-indigo-400 inline-block" /> Dashed Edge (Spatial Adjacency / Prana zone)</div>
                  <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> High Relationship Strength (≥0.90)</div>
                </div>
              </div>
            </div>

            {/* Relationship detailed audit right panel */}
            <div className="w-[30%] bg-[#070b13] border-l border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">RELATIONSHIP INSPECTOR</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Audit: <span className="text-emerald-400">{selectedNode.name}</span></h3>
              </div>

              {/* Node statistics */}
              <div className="space-y-3 bg-[#04060a] p-4 border border-slate-900 rounded">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block border-b border-slate-900 pb-1.5">Entity Core Metrics</span>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between"><span className="text-slate-500">Node Identifier:</span> <span className="font-mono text-slate-300 font-bold">{selectedNode.id}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Archetype Class:</span> <span className="text-indigo-400 font-bold">{selectedNode.category}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Active Layer:</span> <span className="text-slate-300">{selectedNode.layer}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">SRE Vastu Zone:</span> <span className="text-amber-500 font-bold">{selectedNode.vastuZone}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Compliance State:</span> <span className="text-emerald-400 font-bold">{selectedNode.lifecycle}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Revision Chain:</span> <span className="text-slate-400">r{selectedNode.revision} (v{selectedNode.version})</span></div>
                </div>
              </div>

              {/* Edge definitions */}
              <div className="space-y-3">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block">Graph Adjacency Paths ({nodeRelations.length})</span>
                {nodeRelations.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No directional predicates found for this entity.</p>
                ) : (
                  <div className="space-y-2">
                    {nodeRelations.map((rel, i) => {
                      const isSource = rel.source === selectedNode.id;
                      const neighborId = isSource ? rel.target : rel.source;
                      const neighbor = simulatedEntities.find(e => e.id === neighborId) || { name: "Unknown Node" };
                      return (
                        <div key={i} className="p-3 bg-[#04060a] border border-slate-900 rounded space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{rel.predicate}</span>
                            <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded font-bold font-mono">
                              {(rel.strength * 100).toFixed(0)}% WT
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {isSource ? "Self" : neighbor.name} → {isSource ? neighbor.name : "Self"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Universal Graph Relationship rule */}
              <div className="p-3.5 bg-slate-950 border border-slate-900 rounded space-y-1.5">
                <span className="text-[8px] text-indigo-400 uppercase font-bold tracking-wider block">Graph Architectural Constraint</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  In URJAFLUX, any Spatial Entity can bind to any other Entity via directional semantic predicates. Our reasoning graph automatically calculates prana paths without hardcoding layout workflows.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 4: API & EVENT SYSTEM PIPELINE SIMULATOR */}
        {/* ========================================================================= */}
        {activeSubTab === "api" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Interactive Operations Console */}
            <div className="w-[50%] p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">MUTATION SANDBOX</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Universal Entity Mutation Sandbox</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Test-execute standardized architectural platform API calls. Watch transaction logs and reactive event dispatches stream in the system telemetry monitor in real-time.
                </p>
              </div>

              {/* Live interactive inputs */}
              <div className="space-y-4">
                
                {/* Method 1: Create Entity */}
                <div className="p-4 bg-[#070b13] border border-slate-900 rounded space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-emerald-400" /> Method: createEntity()
                    </span>
                    <span className="text-[9px] text-slate-500">POST /api/entities</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Spawns a new Vastu coordinate node dynamically on the custom layer partition.</p>
                  <button 
                    onClick={handleCreateEntity}
                    className="h-7 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase rounded-sm text-[9px] transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-white" /> Execute createEntity
                  </button>
                </div>

                {/* Method 2: Move Entity */}
                <div className="p-4 bg-[#070b13] border border-slate-900 rounded space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <GitMerge className="w-3.5 h-3.5 text-amber-500" /> Method: moveEntity(id, dx, dy)
                    </span>
                    <span className="text-[9px] text-slate-500">PATCH /api/entities/:id</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <label className="text-slate-500 block mb-1">Target Entity</label>
                      <select 
                        value={selectedGraphNode} 
                        onChange={(e) => setSelectedGraphNode(e.target.value)}
                        className="w-full bg-[#04060a] border border-slate-800 p-1.5 rounded text-slate-300 font-mono"
                      >
                        {simulatedEntities.map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Translation Delta</label>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleMoveEntity(selectedGraphNode, -2.5, 0)}
                          className="flex-1 bg-[#04060a] hover:bg-slate-950 border border-slate-800 py-1 font-bold text-slate-300"
                        >
                          -2.5m X
                        </button>
                        <button 
                          onClick={() => handleMoveEntity(selectedGraphNode, 2.5, 0)}
                          className="flex-1 bg-[#04060a] hover:bg-slate-950 border border-slate-800 py-1 font-bold text-slate-300"
                        >
                          +2.5m X
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Method 3: Add Relationship */}
                <div className="p-4 bg-[#070b13] border border-slate-900 rounded space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Method: addRelationship()
                    </span>
                    <span className="text-[9px] text-slate-500">POST /api/relations</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <label className="text-slate-500 block mb-1">Source Node</label>
                      <select id="rel_src" className="w-full bg-[#04060a] border border-slate-800 p-1.5 rounded text-slate-300 font-mono">
                        {simulatedEntities.map(e => <option key={e.id} value={e.id}>{e.id}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Predicate Link</label>
                      <select id="rel_pred" className="w-full bg-[#04060a] border border-slate-800 p-1.5 rounded text-slate-300 font-mono">
                        <option value="Contains">Contains</option>
                        <option value="Inside">Inside</option>
                        <option value="Adjacent">Adjacent</option>
                        <option value="Touches">Touches</option>
                        <option value="Intersects">Intersects</option>
                        <option value="Connected To">Connected To</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Target Node</label>
                      <select id="rel_tgt" className="w-full bg-[#04060a] border border-slate-800 p-1.5 rounded text-slate-300 font-mono">
                        {simulatedEntities.map(e => <option key={e.id} value={e.id}>{e.id}</option>)}
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const src = (document.getElementById("rel_src") as HTMLSelectElement)?.value || "ent_001";
                      const pred = (document.getElementById("rel_pred") as HTMLSelectElement)?.value as any || "Adjacent";
                      const tgt = (document.getElementById("rel_tgt") as HTMLSelectElement)?.value || "ent_003";
                      handleAddRelationship(src, tgt, pred);
                    }}
                    className="h-7 px-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-sm text-[9px] transition-all font-bold uppercase"
                  >
                    Execute addRelationship
                  </button>
                </div>

                {/* Method 4: Run Analysis rules */}
                <div className="p-4 bg-[#070b13] border border-slate-900 rounded space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-300 block">SRE Reasoner Sync</span>
                  <p className="text-[10px] text-slate-500 leading-normal">Forces a whole-graph rule compliance audit to validate vastu alignment energy points.</p>
                  <button 
                    onClick={handleExecuteRules}
                    className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase rounded-sm text-[9px] transition-colors"
                  >
                    Trigger Rule Engine Audit
                  </button>
                </div>

              </div>
            </div>

            {/* Event Dispatch / Diagnostics Terminal Console */}
            <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative">
              <div className="h-9 border-b border-slate-900 bg-[#070b13] px-4 flex items-center justify-between shrink-0 select-none">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" /> PLATFORM TELEMETRY BUS (REACTIVE MONITOR)
                </span>
                <button 
                  onClick={() => setApiLogs([])}
                  className="text-[8px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors uppercase font-mono"
                >
                  <RefreshCw className="w-3 h-3" /> Clear Bus
                </button>
              </div>

              {/* Streaming logs */}
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] text-slate-300 space-y-1.5 custom-scrollbar bg-slate-950/80">
                {apiLogs.length === 0 ? (
                  <p className="text-slate-600 italic">Telemetry idle. Trigger mutations or evaluations on the left to fire events.</p>
                ) : (
                  apiLogs.map((log, i) => {
                    let textClass = "text-slate-400";
                    if (log.includes("API CALL")) textClass = "text-indigo-400 font-bold";
                    else if (log.includes("EVENT DISPATCH")) textClass = "text-emerald-400 font-bold";
                    else if (log.includes("API SUCCESS")) textClass = "text-teal-300 font-bold";
                    else if (log.includes("WARN")) textClass = "text-amber-500";

                    return (
                      <div key={i} className="flex gap-2 leading-relaxed border-b border-slate-950 pb-1">
                        <span className="text-slate-600 select-none">›</span>
                        <p className={textClass}>{log}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reactive active stats */}
              <div className="h-10 bg-[#070b13] border-t border-slate-900 px-4 flex items-center justify-between text-[9px] text-slate-500 shrink-0">
                <span className="font-mono">MUTATION INSTANCE COUNTER: {mutationCount}</span>
                <span className="font-mono uppercase text-emerald-500 font-bold">● ACTIVE KERNEL SYNCHRONIZED</span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 5: DETAILED CONCEPTUAL DOCUMENTATION */}
        {/* ========================================================================= */}
        {activeSubTab === "specs" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Table of contents */}
            <div className="w-[28%] border-r border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-4 shrink-0">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">DELIVERABLES LIST</span>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">15 System Architectural Manifestos</h3>
              
              <div className="space-y-1 text-[10px]">
                {[
                  "1. Universal Entity Architecture",
                  "2. Entity Inheritance Model",
                  "3. Geometry Model",
                  "4. Relationship Model",
                  "5. Metadata Architecture",
                  "6. Analysis Data Model",
                  "7. Event System",
                  "8. Permission Model",
                  "9. Versioning Strategy",
                  "10. Search Model",
                  "11. API Blueprint",
                  "12. Plugin Registration Model",
                  "13. Graph Architecture",
                  "14. Performance Strategy",
                  "15. Future Expansion Rules"
                ].map((item, idx) => (
                  <a 
                    key={idx}
                    href={`#spec_${idx + 1}`}
                    className="block p-1.5 hover:bg-slate-900 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Document contents */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#05080f] space-y-12 select-text">
              
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">URJAFLUX SRE DOCUMENTATION PLATFORM</span>
                <h1 className="text-base font-bold text-slate-100 tracking-tight mt-1">Definitive Spatial Object Model & Entity Framework Blueprint</h1>
                <p className="text-xs text-slate-400 leading-relaxed mt-2 font-mono">
                  This specification governs the permanent, unified data layer of URJAFLUX. Every future engineering, spatial reasoning, Vastu calculation, or report layout module inherits this constitution.
                </p>
              </div>

              {/* Spec 1 */}
              <div id="spec_1" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 01</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">1. Universal Entity Architecture</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every object in URJAFLUX is represented under a single unifying interface named **Entity**. Domain modules (CAD, Vastu, Solar) are strictly forbidden from maintaining siloed or disjoint databases. This constitutional architecture forces unified schemas, eliminating parsing friction during complex AI evaluations.
                </p>
              </div>

              {/* Spec 2 */}
              <div id="spec_2" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 02</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">2. Entity Inheritance Model</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We enforce a rigid subclass inheritance sequence. The base <code className="text-indigo-400 font-bold font-mono">Entity</code> branches into <code className="text-indigo-400 font-bold font-mono">SpatialEntity</code> (physical models containing grid locations and geometries) or <code className="text-indigo-400 font-bold font-mono">AnalysisEntity</code> (non-geometric records linking mathematical score evaluations back to physical parameters). This ensures standard property propagation across all levels of the platform.
                </p>
              </div>

              {/* Spec 3 */}
              <div id="spec_3" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 03</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">3. Geometry Model</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Geometries inside the coordinate space exist purely as relative vector definitions: Point, Line, Polyline, Circle, and Closed Polygon matrices. Sizing calculations utilize real-world Metric standard values (meters). Viewport systems convert relative vector coordinates to pixel grids dynamically, allowing the data structure to stay mathematically clean and ready for immediate WebGL rendering pipelines.
                </p>
              </div>

              {/* Spec 4 */}
              <div id="spec_4" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 04</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">4. Relationship Model</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Physical objects relate to neighbors via semantic predicates. Our predicate engine handles topological bounds (Contains, Inside, Adjacent, Intersects) as well as absolute compass coordinate bindings (North Of, Southwest Of, East Of). This allows the AI model to reason over spatial arrangements without computing raw CAD intersections repeatedly.
                </p>
              </div>

              {/* Spec 5 */}
              <div id="spec_5" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 05</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">5. Metadata Architecture</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Entities incorporate a dynamic, unlimited, non-nesting schema partition named <code className="text-indigo-400 font-bold font-mono">metadata</code>. This key isolates industry-specific configurations—such as engineering R-values, electrical capacity, and celestial Vastu directions—away from the core spatial data structures, preventing model degradation as third-party plugin integrations grow.
                </p>
              </div>

              {/* Spec 6 */}
              <div id="spec_6" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 06</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">6. Analysis Data Model</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Analysis results (e.g. Vastu prana ratings, load bearing limits) are treated as strictly read-only, separate subclasses that link back to the host spatial entity via UUIDs. **Analysis routines may never modify coordinate vertices directly**. This prevents rule engine processes from introducing geometric skewing.
                </p>
              </div>

              {/* Spec 7 */}
              <div id="spec_7" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 07</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">7. Event System</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The framework dispatches asynchronous, lightweight reactive lifecycle events over the global event bus: <code className="text-indigo-400 font-mono text-[10px]">EntityCreatedEvent</code>, <code className="text-indigo-400 font-mono text-[10px]">EntityMovedEvent</code>, <code className="text-indigo-400 font-mono text-[10px]">EntityDeletedEvent</code>, and <code className="text-indigo-400 font-mono text-[10px]">RelationshipCreatedEvent</code>. UI render buffers and external telemetry sync systems hook into this stream for real-time reactive updates.
                </p>
              </div>

              {/* Spec 8 */}
              <div id="spec_8" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 08</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">8. Permission Model</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Role-based permissions (Viewer, Editor, Owner) propagate directly down the hierarchical tree. If a parent floorplan is locked as Read-Only, all hosted entities (walls, HVAC units, doors) instantly inherit locked states, blocking client-side mutation updates.
                </p>
              </div>

              {/* Spec 9 */}
              <div id="spec_9" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 09</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">9. Versioning Strategy</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Each entity preserves an immutable monotonically increasing sequence counter: <code className="text-indigo-400 font-mono text-[10px]">revision: number</code>. Standard modifications increment this count, allowing the system to handle concurrent database edits and coordinate precise rollback actions during multi-user collaboration.
                </p>
              </div>

              {/* Spec 10 */}
              <div id="spec_10" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 10</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">10. Search Model</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The universal search engine indexes all spatial entities. It utilizes specialized reverse index files mapping Name, Category, Tags, and Vastu Zone parameters. This achieves sub-millisecond search read speeds, bypassing slow coordinate scans.
                </p>
              </div>

              {/* Spec 11 */}
              <div id="spec_11" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 11</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">11. API Blueprint</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Entity mutations are executed via lightweight, atomic abstract methods: <code className="text-indigo-400 font-mono text-[10px]">createEntity(type, layer)</code>, <code className="text-indigo-400 font-mono text-[10px]">moveEntity(id, matrix)</code>, <code className="text-indigo-400 font-mono text-[10px]">addRelationship(source, target, predicate)</code>, and <code className="text-indigo-400 font-mono text-[10px]">executeAnalysisRules()</code>.
                </p>
              </div>

              {/* Spec 12 */}
              <div id="spec_12" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 12</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">12. Plugin Registration Model</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Third-party plugin developers register new custom subclasses by writing metadata manifest files. Registered entities expose custom geometric fields and UI inspector sheets to the platform, ensuring the platform remains highly extensible for at least the next 10 years.
                </p>
              </div>

              {/* Spec 13 */}
              <div id="spec_13" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 13</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">13. Graph Architecture</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Semantic structures map connections between physical elements, client profiles, and Vastu rule-sets. The AI model translates this unified graph into natural language summaries, enabling real-time engineering and prana evaluations.
                </p>
              </div>

              {/* Spec 14 */}
              <div id="spec_14" className="space-y-3 scroll-mt-6 border-b border-slate-900 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 14</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">14. Performance Strategy</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To scale past 100,000 entities, URJAFLUX isolates visual rendering buffers from raw metadata state storage. Viewports stream simple, flat 2D projection vectors during rapid zoom movements, while comprehensive calculations execute lazily in separate worker threads.
                </p>
              </div>

              {/* Spec 15 */}
              <div id="spec_15" className="space-y-3 scroll-mt-6 pb-6">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DELIVERABLE 15</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">15. Future Expansion Rules</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our universal schema design remains fully compatible with WebGL meshes and 3D digital twin projections. Coordinate definitions feature native Z-axis projection attributes, enabling immediate isometric transitions without data migration.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 3. CORE TELEMETRY FOOTER STATUS BAR */}
      <div className="h-7 bg-[#070b13] border-t border-slate-900 px-4 flex items-center justify-between text-[10px] select-none text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-bold text-slate-300 font-mono">SRE OBJECT ARCHITECTURE • OK</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="font-mono uppercase text-slate-400">UNITS: METRIC (METERS)</span>
          <span className="text-slate-700">|</span>
          <span className="font-mono uppercase text-slate-400">INDEX: 5 ACTIVE ENTITIES</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-slate-400 uppercase">SYSTEM ARCHETYPE: {activeSubTab.toUpperCase()} ACTIVE</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500">v3.2-CORE</span>
        </div>
      </div>

    </div>
  );
}
