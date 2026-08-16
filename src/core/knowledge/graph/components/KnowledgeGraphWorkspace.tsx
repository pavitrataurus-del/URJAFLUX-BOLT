import React, { useState, useEffect } from "react";
import { Activity, Network, Database, Search } from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";
const PanelGroup = Group as any;
const PanelResizeHandle = Separator as any;
import { GraphApi } from "../api/GraphApi";
import { IKnowledgeGraph, IGraphNode } from "../models/GraphModels";
import GraphViewer from "./GraphViewer";
import GraphSidebar from "./GraphSidebar";
import GraphPropertiesPanel from "./GraphPropertiesPanel";
import GraphStatusBar from "./GraphStatusBar";

export default function KnowledgeGraphWorkspace({ projectId, isAdmin = false }: { projectId: string, isAdmin?: boolean }) {
  const [graph, setGraph] = useState<IKnowledgeGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"dashboard" | "ontology" | "evidence" | "history">("dashboard");
  const [viewState, setViewState] = useState({ zoom: 100, x: 0, y: 0 });

  useEffect(() => {
    const loadGraph = async () => {
      setLoading(true);
      try {
        const api = GraphApi.getInstance();
        const graphId = `graph_${projectId}`;
        let loaded = await api.loadGraph(graphId);
        
        if (!loaded) {
          // Generate an empty/mock graph if one doesn't exist for the project
          loaded = await api.createGraph({
            id: graphId,
            nodes: [
              { id: "n1", type: "CONCEPT", label: "Root Knowledge", namespace: "core", properties: {}, version: 1 }
            ],
            edges: [],
            evidenceLinks: [],
            version: 1,
            metadata: { created: Date.now() }
          });
        }
        setGraph(loaded);
      } catch (err) {
        console.error("Error loading graph:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGraph();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#05080f]">
        <Activity className="w-8 h-8 text-indigo-500 animate-pulse mb-4" />
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Initializing Knowledge Engine...</p>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#05080f]">
        <p className="text-red-400 font-mono text-sm">Failed to load Knowledge Graph.</p>
      </div>
    );
  }

  const selectedNode = graph.nodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = graph.edges.find(e => e.id === selectedEdgeId) || null;

  return (
    <div className="flex flex-col h-full w-full bg-[#05080f] text-slate-200 overflow-hidden font-sans">
      
      {/* WORKSPACE HEADER */}
      <div className="h-12 border-b border-slate-800 bg-[#0a101d] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-indigo-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide">Enterprise Knowledge Graph</h2>
            <p className="text-[10px] text-slate-500 font-mono">ID: {graph.id} • V{graph.version}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search nodes, relationships..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#05080f] border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
              <Database className="w-3 h-3" /> Indexed
            </span>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
              <Activity className="w-3 h-3" /> Live
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          
          {/* LEFT SIDEBAR */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-[#0a101d] border-r border-slate-800 flex flex-col">
            <GraphSidebar 
              graph={graph} 
              activeTab={activeSidebarTab} 
              onTabChange={setActiveSidebarTab}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              searchQuery={searchQuery}
              isAdmin={isAdmin}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-indigo-500/50 transition-colors cursor-col-resize" />

          {/* MAIN VIEWER */}
          <Panel minSize={30} className="flex flex-col relative overflow-hidden bg-[#000000]">
            <GraphViewer 
              graph={graph} 
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onSelectEdge={setSelectedEdgeId}
              viewState={viewState}
              setViewState={setViewState}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-indigo-500/50 transition-colors cursor-col-resize" />

          {/* RIGHT PROPERTIES PANEL */}
          <Panel defaultSize={25} minSize={20} maxSize={35} className="bg-[#0a101d] border-l border-slate-800 flex flex-col">
            <GraphPropertiesPanel graph={graph} selectedNode={selectedNode} selectedEdge={selectedEdge} isAdmin={isAdmin} />
          </Panel>
        </PanelGroup>
      </div>

      {/* STATUS BAR */}
      <GraphStatusBar graph={graph} viewState={viewState} selectedNode={selectedNode} />
    </div>
  );
}
