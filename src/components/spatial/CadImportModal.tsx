import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle2, X } from 'lucide-react';
import { CadImportEngine } from '../../core/spatial/CadImportEngine';
import { FloorPlan, UserRole } from '../../core/spatial/SpatialTypes';

interface CadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (floorPlan: FloorPlan) => void;
  userRole: UserRole;
}

export const CadImportModal: React.FC<CadImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  userRole
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'PNG' | 'JPG' | 'SVG' | 'DXF' | 'DWG' | 'IFC'>('DXF');
  const [fileName, setFileName] = useState<string>('ground_floor_plan.dxf');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    setIsImporting(true);
    const engine = CadImportEngine.getInstance();
    const plan = await engine.importFloorPlanFile(fileName, selectedFormat, 'BLDG-2026-001', userRole);
    setIsImporting(false);
    onImportComplete(plan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-5 text-xs text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Import CAD / Floor Plan File</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">File Format</label>
            <div className="grid grid-cols-4 gap-2">
              {(['DXF', 'DWG', 'SVG', 'PDF', 'PNG', 'JPG', 'IFC'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    setSelectedFormat(fmt);
                    setFileName(`architectural_plan.${fmt.toLowerCase()}`);
                  }}
                  className={`p-2.5 rounded-xl border font-bold transition text-center ${
                    selectedFormat === fmt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Drawing File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-400">
            <span className="font-bold text-emerald-400 block">Unified Ingestion Engine Active</span>
            <p>
              The multi-format parser converts DXF/DWG vector layers, SVG polylines, and raster PDF plans into unified 2D spatial objects with permanent UUIDs.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <Upload className="w-4 h-4" />
            <span>{isImporting ? 'Ingesting Floor Plan...' : 'Import Floor Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
