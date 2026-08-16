import React from "react";
import { Compass, Lock, Unlock, RotateCcw, Sliders, AlertTriangle } from "lucide-react";
import { defaultZoneEngine } from "../../core/spatial/zoneEngine";

interface CompassCalibrationPanelProps {
  rotation: number;
  isNorthLocked: boolean;
  northType: "True" | "Magnetic";
  magneticDeviation: number;
  onRotationChange: (rot: number) => void;
  onNorthLockedChange: (locked: boolean) => void;
  onNorthTypeChange?: (type: "True" | "Magnetic") => void;
  onMagneticDeviationChange?: (dev: number) => void;
}

export default function CompassCalibrationPanel({
  rotation,
  isNorthLocked,
  northType,
  magneticDeviation,
  onRotationChange,
  onNorthLockedChange,
  onNorthTypeChange,
  onMagneticDeviationChange
}: CompassCalibrationPanelProps) {
  
  const getSectorInfo = (deg: number) => {
    // Determine approximate Vastu quadrant name
    const normalized = ((deg % 360) + 360) % 360;
    const zone = defaultZoneEngine.getZoneFromAngle(normalized);
    if (zone) return { name: zone.name, desc: zone.devta + " Zone", element: zone.element };
    return { name: "Unknown", desc: "Unknown", element: "Unknown" };
  };

  const sector = getSectorInfo(rotation);

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Compass Calibration</h3>
            <p className="text-[10px] text-slate-400 font-mono">True Geographic Alignment</p>
          </div>
        </div>
        
        <button
          onClick={() => onNorthLockedChange(!isNorthLocked)}
          className={`px-2 py-1 rounded text-[10px] font-mono border flex items-center gap-1 transition-all ${
            isNorthLocked
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold"
              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700"
          }`}
        >
          {isNorthLocked ? (
            <>
              <Lock className="w-3 h-3 text-emerald-400" />
              LOCKED
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 text-slate-400" />
              UNLOCKED
            </>
          )}
        </button>
      </div>

      <div className="space-y-3.5 pt-1">
        {/* Rotation slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-slate-400 uppercase">North Deviation Angle</span>
            <span className="text-amber-400 font-bold">{rotation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            disabled={isNorthLocked}
            value={rotation}
            onChange={(e) => onRotationChange(parseInt(e.target.value) || 0)}
            className="w-full accent-emerald-500 bg-slate-50 rounded h-1.5 cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Dynamic Sector Information */}
        <div className="p-2.5 bg-slate-50/60 border border-slate-850 rounded-lg flex gap-3 items-start">
          <div className="relative shrink-0 flex items-center justify-center bg-white border border-slate-200 rounded-full w-10 h-10">
            <Compass 
              className="w-7 h-7 text-emerald-400 transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="absolute top-0 text-[7px] font-mono font-bold text-rose-500">N</div>
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-slate-900 leading-none">{sector.name}</span>
              <span className="text-[8px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 px-1 rounded">
                {sector.element}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate font-mono">{sector.desc}</p>
          </div>
        </div>

        {/* Config: True/Magnetic North & Deviation */}
        <div className="grid grid-cols-2 gap-2 text-left">
          {onNorthTypeChange && (
            <div>
              <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">North Reference</label>
              <select
                disabled={isNorthLocked}
                value={northType}
                onChange={(e) => onNorthTypeChange(e.target.value as "True" | "Magnetic")}
                className="w-full bg-slate-50 border border-slate-850 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-mono"
              >
                <option value="True">True North</option>
                <option value="Magnetic">Magnetic</option>
              </select>
            </div>
          )}

          {onMagneticDeviationChange && northType === "Magnetic" && (
            <div>
              <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Mag Deviation</label>
              <div className="flex items-center bg-slate-50 border border-slate-850 rounded px-2 py-1">
                <input
                  type="number"
                  step="0.1"
                  disabled={isNorthLocked}
                  value={magneticDeviation}
                  onChange={(e) => onMagneticDeviationChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none text-xs text-slate-700 focus:outline-none disabled:opacity-50 font-mono"
                />
                <span className="text-[10px] text-slate-400 ml-1">°</span>
              </div>
            </div>
          )}
        </div>

        {isNorthLocked && (
          <div className="flex items-start gap-1.5 p-2 rounded bg-amber-500/5 border border-amber-500/20 text-[9px] text-amber-500/90 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Calibration locked. Unlock to calibrate rotation vectors manually.</span>
          </div>
        )}
      </div>
    </div>
  );
}
