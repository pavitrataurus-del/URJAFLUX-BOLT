import React, { useState } from "react";
import { 
  FileCode, 
  Download, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Globe, 
  Sliders, 
  FileText,
  Info
} from "lucide-react";
import { bimInteroperabilityService } from "../../services/digitalTwin/bimInteroperabilityService";
import { BimModelFile } from "../../types/digitalTwin";

export const BimInteroperabilityPanel: React.FC = () => {
  const categoryMatrix = bimInteroperabilityService.getRevitCategoryMappingMatrix();

  const [uploadedFiles, setUploadedFiles] = useState<BimModelFile[]>([
    {
      filename: "URJAFLUX_HorizonTower_AsBuilt_v2.ifc",
      fileFormat: "IFC",
      fileSizeBytes: 24500000, // 24.5 MB
      uploadedAt: "2026-07-01T10:00:00.000Z",
      importedElementsCount: 240,
      status: "PARSED_SUCCESS",
      georeference: {
        epsgCode: "EPSG:3857",
        latitude: 12.9716,
        longitude: 77.5946,
        altitudeMeters: 920,
        trueNorthOffsetDeg: 12.5
      }
    },
    {
      filename: "Architectural_Interior_Draft.rvt",
      fileFormat: "RVT",
      fileSizeBytes: 85000000, // 85 MB
      uploadedAt: "2026-07-15T14:20:00.000Z",
      importedElementsCount: 0,
      status: "UNSUPPORTED_BINARY_FORMAT",
      unsupportedReason: "Revit Binary (.rvt) requires Autodesk Forge/Design Automation API conversion service. Please export as IFC4 standard format or IFC2x3 before uploading."
    }
  ]);

  const handleSimulateUpload = (format: "IFC" | "RVT" | "DWG" | "DXF") => {
    const fn = `Sample_Upload_Model.${format.toLowerCase()}`;
    const result = bimInteroperabilityService.processBimUpload(fn, 18000000);
    setUploadedFiles([result, ...uploadedFiles]);
  };

  const handleDownloadIfcExport = () => {
    const stepContent = bimInteroperabilityService.generateIfcStepExport();
    const blob = new Blob([stepContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `URJAFLUX_DigitalTwin_Export_${Date.now()}.ifc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <FileCode className="w-4 h-4" />
            <span>MODULE 4: BIM INTEROPERABILITY & IFC STEP ENGINE</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">IFC2x3 / IFC4 Ingestion & Revit Category Mapping</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Import industry-standard openBIM IFC geometry or export live digital twin states to standard STEP files. Proprietary binary formats are explicitly diagnosed.
          </p>
        </div>

        <button 
          onClick={handleDownloadIfcExport}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT IFC STEP FILE</span>
        </button>
      </div>

      {/* BIM Upload Simulation & Testing Buttons */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>TEST BIM FILE INGESTION PARSER</span>
          </div>
          <span className="text-slate-400">Explicit Unsupported Binary Diagnostics</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button 
            onClick={() => handleSimulateUpload("IFC")}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold cursor-pointer transition-all"
          >
            + Upload .IFC (Standard openBIM)
          </button>
          <button 
            onClick={() => handleSimulateUpload("DXF")}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold cursor-pointer transition-all"
          >
            + Upload .DXF (Vector CAD)
          </button>
          <button 
            onClick={() => handleSimulateUpload("RVT")}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold cursor-pointer transition-all"
          >
            + Upload .RVT (Revit Binary - Expect Diagnostic Warning)
          </button>
        </div>
      </div>

      {/* Uploaded BIM Files List */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Ingested BIM & CAD Model Files</h3>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                    file.status === "PARSED_SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {file.fileFormat}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{file.filename}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  {file.status === "PARSED_SUCCESS" ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{file.importedElementsCount} Elements Ingested</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 border border-rose-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Unsupported Binary Format</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Diagnostic Error Reason if unsupported */}
              {file.unsupportedReason && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 font-sans text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{file.unsupportedReason}</span>
                </div>
              )}

              {/* Georeference coordinates if parsed */}
              {file.georeference && (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>EPSG: <span className="text-cyan-400">{file.georeference.epsgCode}</span></div>
                  <div>Lat: <span className="text-slate-100">{file.georeference.latitude}° N</span></div>
                  <div>Long: <span className="text-slate-100">{file.georeference.longitude}° E</span></div>
                  <div>True North: <span className="text-amber-400">+{file.georeference.trueNorthOffsetDeg}°</span></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revit Category to IFC Entity Mapping Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Revit Category to IFC Schema Mapping Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Revit Built-In Category</th>
                <th className="p-3">IFC Schema Entity Class</th>
                <th className="p-3">URJAFLUX Twin Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categoryMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-200">{row.revitCategory}</td>
                  <td className="p-3 text-cyan-400">{row.ifcEntity}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-[10px] font-bold">
                      {row.twinCategory}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
