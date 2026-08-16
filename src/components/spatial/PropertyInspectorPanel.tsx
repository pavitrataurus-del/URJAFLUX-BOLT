import React from 'react';
import { Info, Shield, Compass, Ruler, MapPin, Hash, User, Clock } from 'lucide-react';
import { FloorPlan, Room, Wall, Door, Window } from '../../core/spatial/SpatialTypes';

interface PropertyInspectorPanelProps {
  floorPlan: FloorPlan;
  selectedObjectId?: string | null;
  selectedObjectType?: string | null;
}

export const PropertyInspectorPanel: React.FC<PropertyInspectorPanelProps> = ({
  floorPlan,
  selectedObjectId,
  selectedObjectType
}) => {
  let selectedObject: Room | Wall | Door | Window | undefined;

  if (selectedObjectId) {
    if (selectedObjectType === 'ROOM') {
      selectedObject = floorPlan.rooms.find((r) => r.id === selectedObjectId);
    } else if (selectedObjectType === 'WALL') {
      selectedObject = floorPlan.walls.find((w) => w.id === selectedObjectId);
    } else if (selectedObjectType === 'DOOR') {
      selectedObject = floorPlan.doors.find((d) => d.id === selectedObjectId);
    } else if (selectedObjectType === 'WINDOW') {
      selectedObject = floorPlan.windows.find((win) => win.id === selectedObjectId);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          Spatial Property Inspector
        </h3>
        {selectedObject && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {selectedObject.id}
          </span>
        )}
      </div>

      {selectedObject ? (
        <div className="space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Object Name</span>
            <h4 className="text-sm font-bold text-white mt-0.5">{selectedObject.name}</h4>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 block">Cardinal Zone</span>
              <span className="font-mono font-bold text-emerald-400">{selectedObject.cardinalDirection}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Status</span>
              <span className="font-bold text-slate-200">{selectedObject.status}</span>
            </div>

            {'areaSqMeters' in selectedObject && (
              <>
                <div>
                  <span className="text-[10px] text-slate-500 block">Area</span>
                  <span className="font-mono font-bold text-slate-200">{selectedObject.areaSqMeters} m²</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Perimeter</span>
                  <span className="font-mono font-bold text-slate-200">{selectedObject.perimeterMeters} m</span>
                </div>
              </>
            )}

            {'lengthMeters' in selectedObject && (
              <>
                <div>
                  <span className="text-[10px] text-slate-500 block">Wall Length</span>
                  <span className="font-mono font-bold text-slate-200">{selectedObject.lengthMeters} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Thickness</span>
                  <span className="font-mono font-bold text-slate-200">{selectedObject.thicknessMm} mm</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Audit & Ownership</span>
            <p className="text-slate-300">Owner: <span className="text-white font-medium">{selectedObject.owner}</span></p>
            <p className="text-slate-400 font-mono text-[10px]">Version: v{selectedObject.version}.0</p>
            <p className="text-slate-400 font-mono text-[10px]">Updated: {new Date(selectedObject.updatedAt).toLocaleTimeString()}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 text-xs">
          Select an object on the canvas or tree to view geometric properties.
        </div>
      )}
    </div>
  );
};
