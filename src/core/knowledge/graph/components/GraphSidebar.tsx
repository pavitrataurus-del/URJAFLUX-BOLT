import React from "react";
import { LayoutDashboard, Library, FileText, History, Hexagon, Search } from "lucide-react";
import { IKnowledgeGraph, IGraphNode } from "../models/GraphModels";

export default function GraphSidebar({ graph, activeTab, onTabChange, selectedNodeId, onSelectNode, searchQuery, isAdmin }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 bg-[#0d1424] shrink-0 border-b border-slate-800 gap-1 overflow-x-auto no-scrollbar">
        <TabButton icon={LayoutDashboard} label="Dash" active={activeTab === "dashboard"} onClick={() => onTabChange("dashboard")} />
        <TabButton icon={Library} label="Ontology" active={activeTab === "ontology"} onClick={() => onTabChange("ontology")} />
        {isAdmin && <TabButton icon={FileText} label="Evidence" active={activeTab === "evidence"} onClick={() => onTabChange("evidence")} />}
        <TabButton icon={History} label="History" active={activeTab === "history"} onClick={() => onTabChange("history")} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "dashboard" && <GraphDashboard graph={graph} />}
        {activeTab === "ontology" && <OntologyExplorer graph={graph} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} searchQuery={searchQuery} />}
        {activeTab === "evidence" && isAdmin && <EvidenceExplorer graph={graph} />}
        {activeTab === "history" && <SelectionHistory />}
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap transition-colors ${
        active ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function GraphDashboard({ graph }: { graph: IKnowledgeGraph }) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Graph Dashboard</div>
      
      <div className="space-y-3">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Status</div>
          <div className="text-indigo-400 text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> SYNCHRONIZED
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-500 uppercase mb-2">Graph Statistics</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Total Nodes</span><span className="text-slate-200 font-mono">{graph.nodes.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Edges</span><span className="text-slate-200 font-mono">{graph.edges.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Evidence Links</span><span className="text-slate-200 font-mono">{graph.evidenceLinks?.length || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OntologyExplorer({ graph, selectedNodeId, onSelectNode, searchQuery }: any) {
  const filteredNodes = graph.nodes.filter((n: IGraphNode) => 
    !searchQuery || 
    n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-slate-400 px-1 uppercase tracking-wider mb-2">Ontology Nodes</div>
      {filteredNodes.length === 0 ? (
        <p className="text-xs text-slate-500 px-1">No nodes found.</p>
      ) : (
        <div className="space-y-1">
          {filteredNodes.map((node: IGraphNode) => (
            <div 
              key={node.id} 
              onClick={() => onSelectNode(node.id)}
              className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-xs transition-colors ${
                selectedNodeId === node.id ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Hexagon className="w-3.5 h-3.5 opacity-70" />
              <div className="truncate flex-1">{node.label}</div>
              <div className="text-[9px] font-mono opacity-50 uppercase">{node.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceExplorer({ graph }: any) {
  const links = graph.evidenceLinks || [];
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
        Evidence Store <span className="text-rose-400 text-[9px] border border-rose-500/30 px-1 rounded">ADMIN</span>
      </div>
      {links.length === 0 ? (
        <p className="text-xs text-slate-500 px-1">No evidence links found.</p>
      ) : (
        <div className="space-y-2">
          {links.map((link: any) => (
            <div key={link.id} className="bg-slate-800/50 border border-slate-700 p-2 rounded text-xs space-y-1">
              <div className="text-indigo-400 font-mono text-[10px]">{link.id}</div>
              <div className="text-slate-300">Doc: {link.documentId}</div>
              {link.pageNumber && <div className="text-slate-400">Page: {link.pageNumber}</div>}
              <div className={`text-[10px] font-bold ${link.approvalStatus === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {link.approvalStatus}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectionHistory() {
  return (
    <div className="p-4 text-center">
      <History className="w-8 h-8 text-slate-600 mb-3 mx-auto opacity-50" />
      <p className="text-xs text-slate-400">No recent selections.</p>
    </div>
  );
}
