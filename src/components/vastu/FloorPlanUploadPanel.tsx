import React, { useRef, useState } from "react";
import { Upload, FileText, Image, CheckCircle, Scale, AlertCircle, HelpCircle } from "lucide-react";

interface FloorPlanUploadPanelProps {
  uploadedFile: { name: string; size: string; url: string } | null;
  referenceWall: string;
  referenceLength: string;
  scaleUnit: "Meters" | "Feet" | "Millimeters";
  pixelScaleRatio: number;
  onUploadFile: (file: File) => void;
  onUpdateScale?: (wall: string, len: string, unit: "Meters" | "Feet" | "Millimeters") => void;
}

export default function FloorPlanUploadPanel({
  uploadedFile,
  referenceWall,
  referenceLength,
  scaleUnit,
  pixelScaleRatio,
  onUploadFile,
  onUpdateScale
}: FloorPlanUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCalibratingScale, setIsCalibratingScale] = useState(false);
  const [localWall, setLocalWall] = useState(referenceWall);
  const [localLen, setLocalLen] = useState(referenceLength);
  const [localUnit, setLocalUnit] = useState(scaleUnit);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const handleSaveScale = () => {
    if (onUpdateScale) {
      onUpdateScale(localWall, localLen, localUnit);
    }
    setIsCalibratingScale(false);
  };

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Upload className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Floorplan</h3>
            <p className="text-[10px] text-slate-400 font-mono">Drawing Import & Scale</p>
          </div>
        </div>
      </div>

      {/* DRAG AND DROP AREA */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-slate-200 hover:border-slate-700 bg-slate-50/40"
        }`}
      >
        <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
        <span className="text-[11px] font-bold text-slate-700">Drag & Drop Blueprint</span>
        <span className="text-[8px] text-slate-400 mt-0.5">Supports PNG, JPG, PDF (or DWG placeholder)</span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />
      </div>

      {/* FILE PREVIEW OR STATUS */}
      {uploadedFile ? (
        <div className="p-2.5 bg-slate-50/60 border border-slate-850 rounded-lg space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-mono font-bold text-slate-700 truncate" title={uploadedFile.name}>
                  {uploadedFile.name}
                </p>
                <p className="text-[9px] text-slate-400 font-mono">{uploadedFile.size}</p>
              </div>
            </div>
            <span className="shrink-0 text-[8px] font-mono bg-emerald-500/15 text-emerald-400 px-1 py-0.5 rounded flex items-center gap-0.5 font-bold uppercase">
              <CheckCircle className="w-2.5 h-2.5" />
              Active
            </span>
          </div>

          {/* Miniature Thumbnail Preview */}
          <div className="relative aspect-video w-full rounded bg-slate-50 overflow-hidden border border-slate-200 group">
            <img
              src={uploadedFile.url}
              alt="Floorplan thumbnail"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-1.5">
              <span className="text-[8px] font-mono text-slate-400 bg-slate-50/80 px-1 py-0.5 rounded border border-slate-200">
                2D CAD Visual Layout
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-slate-50/40 border border-slate-850/60 rounded-lg text-center text-xs text-slate-400">
          No blueprint file imported yet.
        </div>
      )}

      {/* SCALE CALIBRATION DETAIL */}
      <div className="p-2.5 bg-slate-50/40 border border-slate-850 rounded-lg space-y-2 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Scale Benchmark</span>
          </div>
          <button
            onClick={() => setIsCalibratingScale(!isCalibratingScale)}
            className="text-[9px] font-mono text-emerald-400 hover:underline"
          >
            {isCalibratingScale ? "Cancel" : "Calibrate"}
          </button>
        </div>

        {isCalibratingScale ? (
          <div className="space-y-2 pt-1">
            <div>
              <label className="text-[8px] font-mono text-slate-400 uppercase block mb-0.5">Reference Wall / Vector</label>
              <input
                type="text"
                value={localWall}
                onChange={(e) => setLocalWall(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[8px] font-mono text-slate-400 uppercase block mb-0.5">Real Length</label>
                <input
                  type="text"
                  value={localLen}
                  onChange={(e) => setLocalLen(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] font-mono text-slate-400 uppercase block mb-0.5">Unit</label>
                <select
                  value={localUnit}
                  onChange={(e) => setLocalUnit(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded px-1 py-0.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="Meters">Meters</option>
                  <option value="Feet">Feet</option>
                  <option value="Millimeters">Millimeters</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSaveScale}
              className="w-full py-1 text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 rounded hover:bg-emerald-600 transition-all"
            >
              SAVE BENCHMARK
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-[10px] text-slate-700 font-mono flex justify-between">
              <span className="text-slate-400">Benchmark Wall:</span>
              <span className="text-right truncate max-w-[120px]">{referenceWall || "Not Set"}</span>
            </div>
            <div className="text-[10px] text-slate-700 font-mono flex justify-between">
              <span className="text-slate-400">Dimension Ratio:</span>
              <span>{referenceLength} {scaleUnit}</span>
            </div>
            <div className="text-[10px] text-slate-700 font-mono flex justify-between">
              <span className="text-slate-400">Computed Scale:</span>
              <span className="text-emerald-400 font-bold">1px = {pixelScaleRatio.toFixed(1)} mm</span>
            </div>
          </div>
        )}
      </div>

      {/* FUTURE DWG FILE EXPORT */}
      <div className="p-2 bg-slate-50/20 border border-slate-200 rounded text-center text-[9px] text-slate-600 flex items-center justify-center gap-1">
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Future DWG/DXF layer mapping pre-configured</span>
      </div>
    </div>
  );
}
