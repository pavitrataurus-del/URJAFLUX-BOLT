import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Calculator,
  Compass,
  Grid,
  Image,
  Layers,
  Search,
  Sparkles,
  CheckCircle2,
  Cpu,
  BarChart2,
  Box,
  Play
} from 'lucide-react';
import { CentralObjectRegistry } from '../../core/knowledge_ingestion/multimodal/CentralObjectRegistry';
import { FormulaEngine } from '../../core/knowledge_ingestion/multimodal/FormulaEngine';
import { MultimodalObject, MultimodalSearchResult } from '../../core/knowledge_ingestion/types/multimodal.types';

export const MultimodalIntelligenceView: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MultimodalSearchResult[]>([]);
  const [activeObject, setActiveObject] = useState<MultimodalObject | null>(null);

  // Formula Evaluator State
  const [calcInputArea, setCalcInputArea] = useState<number>(1200);
  const [calcVelocity, setCalcVelocity] = useState<number>(2.5);

  const allObjects = CentralObjectRegistry.getAllObjects();
  const metrics = CentralObjectRegistry.getQualityMetrics();

  const filteredObjects = allObjects.filter(obj => {
    if (selectedType !== 'ALL' && obj.objectType !== selectedType) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        obj.caption?.toLowerCase().includes(q) ||
        obj.rawText?.toLowerCase().includes(q) ||
        obj.objectType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const res = CentralObjectRegistry.searchObjects(searchQuery);
    setSearchResults(res);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Layers className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> EMKIE v1.0 Multimodal Engine
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Enterprise Multimodal Knowledge Intelligence Engine
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Extracts and structures tables, executable formulas, spatial floor plans, sacred yantras, and engineering diagrams into searchable knowledge objects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-indigo-500/30 text-right">
              <div className="text-xs text-slate-400">Total Extracted Objects</div>
              <div className="text-xl font-extrabold text-indigo-400">{allObjects.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Quality Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Text Coverage</div>
          <div className="text-lg font-bold text-emerald-400">{metrics.textCoveragePct}%</div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Table Coverage</div>
          <div className="text-lg font-bold text-cyan-400">{metrics.tableCoveragePct}%</div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Formula Coverage</div>
          <div className="text-lg font-bold text-indigo-400">{metrics.formulaCoveragePct}%</div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Floor Plan Index</div>
          <div className="text-lg font-bold text-amber-400">{metrics.diagramCoveragePct}%</div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Extraction Accuracy</div>
          <div className="text-lg font-bold text-blue-400">{metrics.objectExtractionAccuracy}%</div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Citation Fidelity</div>
          <div className="text-lg font-bold text-purple-400">{metrics.citationAccuracy}%</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search multimodal objects (e.g. 'Ayadi table', 'Aya formula', 'North-East floor plan', 'Kuber Yantra')..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'TABLE', 'FORMULA', 'FLOOR_PLAN', 'YANTRA', 'DIAGRAM'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedType === t
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multimodal Object Explorer List */}
        <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredObjects.length === 0 ? (
            <div className="bg-slate-900/60 p-8 rounded-xl border border-slate-800 text-center">
              <Box className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-slate-300 font-semibold">No Multimodal Objects Match Filter</h3>
              <p className="text-slate-500 text-xs mt-1">
                Upload a Vastu, Engineering, or Lal Kitab treatise document to extract structured tables, formulas, and diagrams.
              </p>
            </div>
          ) : (
            filteredObjects.map(obj => (
              <div
                key={obj.objectId}
                onClick={() => setActiveObject(obj)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeObject?.objectId === obj.objectId
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {obj.objectType === 'TABLE' && <FileSpreadsheet className="w-4 h-4 text-cyan-400" />}
                    {obj.objectType === 'FORMULA' && <Calculator className="w-4 h-4 text-indigo-400" />}
                    {obj.objectType === 'FLOOR_PLAN' && <Compass className="w-4 h-4 text-amber-400" />}
                    {obj.objectType === 'YANTRA' && <Grid className="w-4 h-4 text-purple-400" />}
                    {obj.objectType === 'DIAGRAM' && <Image className="w-4 h-4 text-emerald-400" />}
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {obj.objectType}
                    </span>
                    <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                      Page {obj.pageNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                    Conf: {Math.round(obj.confidenceScore * 100)}%
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-100">{obj.caption}</p>
                {obj.rawText && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-mono bg-slate-950/60 p-2 rounded">
                    {obj.rawText}
                  </p>
                )}
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
                  <span>ID: {obj.objectId}</span>
                  <span>BBox: [{obj.boundingBox.x}, {obj.boundingBox.y}, {obj.boundingBox.width}, {obj.boundingBox.height}]</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Object Detail & Executable Formula Inspector Panel */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          {activeObject ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                  {activeObject.objectType} Inspector
                </span>
                <h3 className="text-base font-bold text-white mt-1">{activeObject.caption}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {activeObject.objectId}</p>
              </div>

              {/* Table Viewer */}
              {activeObject.tableData && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                    Structured Table ({activeObject.tableData.rows} Rows x {activeObject.tableData.columns} Cols)
                  </div>
                  <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800 p-2">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-900 text-cyan-300 font-semibold border-b border-slate-800">
                        <tr>
                          {activeObject.tableData.headers.map((h, i) => (
                            <th key={i} className="p-1.5 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.min(activeObject.tableData.rows, 5) }).map((_, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-900 hover:bg-slate-900/50">
                            {activeObject.tableData?.cells.filter(c => c.rowIndex === rIdx).map((cell, cIdx) => (
                              <td key={cIdx} className="p-1.5 font-mono">{cell.value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Formula Inspector & Sandbox */}
              {activeObject.formulaData && (
                <div className="space-y-3 bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30">
                  <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                    Formula Expression & Execution Sandbox
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-indigo-500/20 font-mono text-sm text-indigo-300 text-center">
                    {activeObject.formulaData.latexOrExpression}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 block">Input Building Area (sq. ft):</label>
                    <input
                      type="number"
                      value={calcInputArea}
                      onChange={e => setCalcInputArea(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/30 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Calculated Value:</span>
                    <span className="text-base font-extrabold text-indigo-400 font-mono">
                      {FormulaEngine.calculateFormula(activeObject.formulaData, { area: calcInputArea, velocity: calcVelocity })}
                    </span>
                  </div>
                </div>
              )}

              {/* Spatial Floor Plan Inspector */}
              {activeObject.spatialData && (
                <div className="space-y-2 bg-amber-950/20 p-4 rounded-xl border border-amber-500/20">
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    Spatial Layout & Elements ({activeObject.spatialData.detectedElements.length} Elements)
                  </div>
                  <div className="space-y-1.5">
                    {activeObject.spatialData.detectedElements.map((el, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-200 font-medium">{el.label}</span>
                        <span className="text-amber-400 font-mono">{el.zone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yantra Geometry Inspector */}
              {activeObject.yantraData && (
                <div className="space-y-2 bg-purple-950/20 p-4 rounded-xl border border-purple-500/20">
                  <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-purple-400" />
                    Sacred Geometry: {activeObject.yantraData.geometry}
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                    {activeObject.yantraData.purpose}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activeObject.yantraData.symbols.map((sym, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Box className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs font-medium">Select an object from the list to inspect structured properties, executable formulas, or spatial layouts.</p>
            </div>
          )}

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>EMKIE v1.0 Multimodal Registry synchronized with Knowledge Graph & Vector Engine.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
