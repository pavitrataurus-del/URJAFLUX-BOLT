import React from "react";
import { Info, Box, Map, Network, AlertTriangle } from "lucide-react";
import { ITwinObject } from "../models/TwinModels";

export default function TwinPropertiesPanel({ twin, selectedObject }: any) {
  if (!selectedObject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <Info className="w-8 h-8 mb-4 opacity-50" />
        <p className="text-sm">Select an object or room to inspect its properties and spatial intelligence metadata.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-[#0d1424] border-b border-slate-800 shrink-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-bold text-slate-100 truncate">{selectedObject.canonicalType}</h3>
          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">
            {selectedObject.id.substring(0,8)}
          </span>
        </div>
        <p className="text-xs text-slate-500">{selectedObject.ontologyReference}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Dimensions & Geometry */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Geometry & Positioning</h4>
          <div className="space-y-2 text-xs">
            <PropRow label="Status" value={selectedObject.lifecycleState} />
            <PropRow label="Confidence" value={`${(selectedObject.confidence?.score || 1) * 100}%`} />
            <PropRow label="Namespace" value={selectedObject.namespaceId} />
          </div>
        </section>

        {/* Metadata */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Metadata</h4>
          <div className="space-y-2 text-xs">
            {Object.entries(selectedObject.metadata || {}).length === 0 ? (
              <p className="text-slate-600 italic">No additional metadata available.</p>
            ) : (
              Object.entries(selectedObject.metadata).map(([key, value]) => (
                <PropRow key={key} label={key} value={String(value)} />
              ))
            )}
          </div>
        </section>

        {/* Relationships Summary */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Relationships</h4>
          {(!selectedObject.relationships || selectedObject.relationships.length === 0) ? (
            <p className="text-slate-600 italic text-xs">Isolated object</p>
          ) : (
            <div className="space-y-2">
              {selectedObject.relationships.map((rel: any, idx: number) => (
                <div key={idx} className="bg-slate-800/50 p-2 rounded flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-mono text-[10px]">{rel.type}</span>
                  <span className="text-slate-400 truncate ml-2">{rel.targetId.substring(0,8)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

function PropRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
