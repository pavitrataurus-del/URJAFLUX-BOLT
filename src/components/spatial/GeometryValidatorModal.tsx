import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { FloorPlan, GeometryValidationResult } from '../../core/spatial/SpatialTypes';
import { GeometryValidationEngine } from '../../core/spatial/GeometryValidationEngine';

interface GeometryValidatorModalProps {
  floorPlan: FloorPlan;
  isOpen: boolean;
  onClose: () => void;
}

export const GeometryValidatorModal: React.FC<GeometryValidatorModalProps> = ({
  floorPlan,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const result: GeometryValidationResult = GeometryValidationEngine.getInstance().validateFloorPlan(floorPlan);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-2xl w-full space-y-5 text-xs text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Floor Plan Geometry Validation Report</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          result.isValid
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {result.isValid ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
            <div>
              <h3 className="font-bold text-sm">{result.isValid ? 'Geometry Passed Validation' : 'Geometry Anomalies Detected'}</h3>
              <p className="text-[11px] opacity-80 mt-0.5">
                Verified at {new Date(result.validationTimestamp).toLocaleTimeString()} • Zero Vastu reasoning applied.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 block">Total Rooms</span>
            <span className="text-sm font-mono font-bold text-white">{result.metrics.totalRooms}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Closed Polygons</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{result.metrics.closedPolygons}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Open Polygons</span>
            <span className="text-sm font-mono font-bold text-rose-400">{result.metrics.openPolygons}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Total Wall Length</span>
            <span className="text-sm font-mono font-bold text-sky-400">{result.metrics.totalWallLengthMeters} m</span>
          </div>
        </div>

        {/* Errors / Warnings List */}
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Diagnostic Log</h4>
          {result.errors.length === 0 && result.warnings.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">No geometrical issues or broken wall topologies detected.</p>
          ) : (
            <>
              {result.errors.map((err, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{err.code}</span>
                    <p>{err.message}</p>
                  </div>
                </div>
              ))}
              {result.warnings.map((warn, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{warn.code}</span>
                    <p>{warn.message}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
