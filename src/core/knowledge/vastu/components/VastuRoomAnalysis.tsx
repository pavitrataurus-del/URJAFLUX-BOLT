import React from "react";
import { DoorOpen, LayoutGrid, CheckCircle } from "lucide-react";
import { IDigitalTwin } from "../../digital_twin/models/TwinModels";

export default function VastuRoomAnalysis({ twin, selectedRoomId, onSelectRoom }: any) {
  const rooms = twin?.objects?.filter(o => o.type === "room") || [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 shrink-0">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <DoorOpen className="w-4 h-4 text-purple-400" /> Room Analysis
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {rooms.length === 0 ? (
          <div className="text-center p-6 text-slate-500">
            <LayoutGrid className="w-8 h-8 mb-4 opacity-50 mx-auto" />
            <p className="text-xs">No rooms detected.</p>
          </div>
        ) : (
          rooms.map(room => (
            <div 
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedRoomId === room.id 
                  ? "bg-purple-500/10 border-purple-500/30" 
                  : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-xs text-slate-200">{room.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-700 text-slate-300">
                  {room.properties?.roomType || "Unknown"}
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                <span>Area: {room.properties?.area || "?"} sqm</span>
                <span className="flex items-center gap-1 text-emerald-500"><CheckCircle className="w-3 h-3"/> Analyzed</span>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedRoomId && (
        <div className="h-1/2 border-t border-slate-800 bg-slate-900 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-purple-400 uppercase">Room Details</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
              <span className="text-slate-500">Orientation</span>
              <span className="text-slate-200 font-medium">South-West</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
              <span className="text-slate-500">Assigned Zone</span>
              <span className="text-slate-200 font-medium">Earth (Nairutya)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
              <span className="text-slate-500">Compliance</span>
              <span className="text-emerald-400 font-bold">92%</span>
            </div>
            <div className="space-y-1 pt-2">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Detected Issues</span>
              <p className="text-slate-400 bg-slate-800/30 p-2 rounded text-[10px]">No major Vastu doshas detected.</p>
            </div>
            <div className="mt-4 p-2 bg-purple-500/10 border border-purple-500/30 rounded text-[9px] text-purple-400 text-center">
              Temporary Placeholder. Waiting for RoomVastuEngine API.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
