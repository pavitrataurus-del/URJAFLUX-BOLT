import React from "react";
import { Info, Hexagon, Link as LinkIcon, ExternalLink } from "lucide-react";
import { IKnowledgeGraph, IGraphNode, IGraphEdge } from "../models/GraphModels";

export default function GraphPropertiesPanel({ graph, selectedNode, selectedEdge, isAdmin }: any) {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <Info className="w-8 h-8 mb-4 opacity-50" />
        <p className="text-sm">Select a knowledge node or relationship to inspect its properties and evidence.</p>
      </div>
    );
  }

  if (selectedNode) {
    return <NodeInspector node={selectedNode} graph={graph} isAdmin={isAdmin} />;
  }

  if (selectedEdge) {
    return <EdgeInspector edge={selectedEdge} graph={graph} isAdmin={isAdmin} />;
  }
  
  return null;
}

function NodeInspector({ node, graph, isAdmin }: any) {
  // Find connected edges
  const connectedEdges = graph.edges.filter((e: IGraphEdge) => e.sourceId === node.id || e.targetId === node.id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-[#0d1424] border-b border-slate-800 shrink-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-bold text-slate-100 truncate">{node.label}</h3>
          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold tracking-wider rounded uppercase">
            {node.type}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-mono mt-2">ID: {node.id}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Attributes</h4>
          <div className="space-y-2 text-xs">
            <PropRow label="Namespace" value={node.namespace} />
            <PropRow label="Version" value={`v${node.version}`} />
            {Object.entries(node.properties || {}).map(([key, value]) => (
              <PropRow key={key} label={key} value={String(value)} />
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5" /> Connections
          </h4>
          {connectedEdges.length === 0 ? (
            <p className="text-slate-600 italic text-xs">No connections.</p>
          ) : (
            <div className="space-y-2">
              {connectedEdges.map((edge: any) => {
                const isSource = edge.sourceId === node.id;
                const otherNodeId = isSource ? edge.targetId : edge.sourceId;
                const otherNode = graph.nodes.find((n: any) => n.id === otherNodeId);
                return (
                  <div key={edge.id} className="bg-slate-800/50 p-2 rounded flex flex-col gap-1 text-xs border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-400 font-mono text-[10px]">{edge.type}</span>
                      <span className="text-slate-500 text-[10px] uppercase">{isSource ? 'OUT' : 'IN'}</span>
                    </div>
                    <div className="text-slate-300 truncate font-semibold">{otherNode?.label || otherNodeId}</div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EdgeInspector({ edge, graph, isAdmin }: any) {
  const source = graph.nodes.find((n: any) => n.id === edge.sourceId);
  const target = graph.nodes.find((n: any) => n.id === edge.targetId);
  
  const evidenceLinks = graph.evidenceLinks?.filter((l: any) => l.edgeId === edge.id) || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-[#0d1424] border-b border-slate-800 shrink-0">
        <h3 className="text-sm font-bold text-indigo-400 font-mono mb-2">{edge.type}</h3>
        <div className="text-xs text-slate-400 flex items-center gap-2 mb-1">
          <span className="truncate max-w-[100px]">{source?.label || edge.sourceId}</span>
          <span>→</span>
          <span className="truncate max-w-[100px]">{target?.label || edge.targetId}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Edge Properties</h4>
          <div className="space-y-2 text-xs">
            <PropRow label="Weight" value={edge.weight !== undefined ? edge.weight.toString() : 'N/A'} />
            <PropRow label="Confidence" value={edge.confidence !== undefined ? `${(edge.confidence * 100).toFixed(1)}%` : 'N/A'} />
            {Object.entries(edge.properties || {}).map(([key, value]) => (
              <PropRow key={key} label={key} value={String(value)} />
            ))}
          </div>
        </section>

        {isAdmin && (
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> Evidence <span className="text-rose-400 text-[9px] border border-rose-500/30 px-1 rounded ml-1">ADMIN</span>
            </h4>
            {evidenceLinks.length === 0 ? (
              <p className="text-slate-600 italic text-xs">No evidence links associated with this relationship.</p>
            ) : (
              <div className="space-y-2">
                {evidenceLinks.map((link: any) => (
                  <div key={link.id} className="bg-slate-800/30 p-2 rounded border border-slate-700/50 text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{link.knowledgeSource}</span>
                      <span className={link.approvalStatus === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500'}>{link.approvalStatus}</span>
                    </div>
                    <div className="text-slate-300 font-medium">{link.documentId}</div>
                    {link.pageNumber && <div className="text-slate-400">Page {link.pageNumber}</div>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function PropRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
