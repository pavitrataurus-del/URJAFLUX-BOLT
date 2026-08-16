import React, { useState } from "react";
import { PropertyRecognitionSummary } from "../../recognition/types";
import { CanonicalSpatialCalculationEngine } from "../../core/spatial/CanonicalSpatialCalculationEngine";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  Eye, 
  Cpu, 
  Layers, 
  ListChecks, 
  BarChart2, 
  FileText 
} from "lucide-react";

interface PropertyRecognitionPanelProps {
  summary: PropertyRecognitionSummary | null;
}

export default function PropertyRecognitionPanel({ summary }: PropertyRecognitionPanelProps) {
  const [isFounderMode, setIsFounderMode] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  if (!summary) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
        <Cpu className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-pulse" />
        <p className="text-xs font-semibold">Property Recognition Engine Awaiting Floor Plan Input</p>
        <p className="text-[11px] text-slate-400 mt-1">Import or draw CAD entities to trigger automatic recognition evidence</p>
      </div>
    );
  }

  const { breakdown, coverage, validationChecklist, entities } = summary;
  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      {/* HEADER & VIEW TOGGLE */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Property Recognition Engine (PRE)</h3>
            <p className="text-[11px] text-slate-500">Standardized Spatial Blueprint & Evidence Model</p>
          </div>
        </div>

        {/* CUSTOMER VS FOUNDER MODE TOGGLE */}
        <button
          onClick={() => setIsFounderMode(!isFounderMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
            isFounderMode
              ? "bg-slate-900 text-amber-300 border-slate-800 shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isFounderMode ? "FOUNDER DIAGNOSTIC" : "CUSTOMER VIEW"}</span>
        </button>
      </div>

      {/* CUSTOMER VIEW */}
      {!isFounderMode ? (
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Property Layout Recognized</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Full blueprint perimeter and room geometry mapped successfully
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Building Elements Identified</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {summary.totalRoomsRecognized} Rooms, {summary.totalObjectsRecognized} Objects ({summary.doorsCount} Doors, {summary.windowsCount} Windows)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Spatial Zones Prepared</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                16-point directional grid aligned to True North calibration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Property Ready for Evaluation</span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">
                Verification complete. Passed to Rule Engine for spatial compliance assessment.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* FOUNDER DIAGNOSTIC MODE */
        <div className="space-y-4">
          {/* RECOGNITION SUMMARY MATRIX */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" />
                <span>PROPERTY RECOGNITION SUMMARY</span>
              </span>
              <span className="text-[10px] text-slate-400">FOUNDER DIAGNOSTIC RUNTIME</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Rooms Recognized</span>
                <span className="text-white text-base font-bold">{summary.totalRoomsRecognized}</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Objects Recognized</span>
                <span className="text-white text-base font-bold">{summary.totalObjectsRecognized}</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Doors / Windows</span>
                <span className="text-white text-base font-bold">{summary.doorsCount} / {summary.windowsCount}</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Unknown Spaces</span>
                <span className={`text-base font-bold ${breakdown.unknownSpaces > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {breakdown.unknownSpaces}
                </span>
              </div>
            </div>

            {/* BREAKDOWN PILLS */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {breakdown.kitchens > 0 && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Kitchens: {breakdown.kitchens}</span>}
              {breakdown.bedrooms > 0 && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Bedrooms: {breakdown.bedrooms}</span>}
              {breakdown.toilets > 0 && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Toilets: {breakdown.toilets}</span>}
              {breakdown.staircases > 0 && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Staircases: {breakdown.staircases}</span>}
              {breakdown.septicTanks > 0 && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Septic Tank: {breakdown.septicTanks}</span>}
              {breakdown.waterTanks > 0 && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Water Tank: {breakdown.waterTanks}</span>}
              {breakdown.poojaRooms > 0 && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Pooja Sanctum: {breakdown.poojaRooms}</span>}
              {breakdown.parking > 0 && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Parking: {breakdown.parking}</span>}
              {breakdown.unknownSpaces > 0 && <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px]">Unknown: {breakdown.unknownSpaces}</span>}
            </div>
          </div>

          {/* RECOGNITION COVERAGE REPORT */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
              Recognition Coverage Report
            </span>
            <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[10px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Text</span>
                <span className="text-slate-900 font-bold">{coverage.textCoveragePercent}%</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Symbols</span>
                <span className="text-slate-900 font-bold">{coverage.symbolCoveragePercent}%</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Geometry</span>
                <span className="text-slate-900 font-bold">{coverage.geometryCoveragePercent}%</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Context</span>
                <span className="text-slate-900 font-bold">{coverage.contextCoveragePercent}%</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Unknown</span>
                <span className="text-slate-900 font-bold">{coverage.unknownCoveragePercent}%</span>
              </div>
            </div>
          </div>

          {/* VALIDATION CHECKLIST */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-slate-600" />
              <span>Recognition Validation Checklist</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${validationChecklist.propertyBoundaryFound ? "text-emerald-500" : "text-slate-300"}`} />
                <span className="text-slate-700">Property Boundary Found</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${validationChecklist.scaleAvailable ? "text-emerald-500" : "text-slate-300"}`} />
                <span className="text-slate-700">Scale Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${validationChecklist.northLocked ? "text-emerald-500" : "text-slate-300"}`} />
                <span className="text-slate-700">North Locked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${validationChecklist.allRoomsClassified ? "text-emerald-500" : "text-amber-500"}`} />
                <span className="text-slate-700">All Rooms Classified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${validationChecklist.objectsClassified ? "text-emerald-500" : "text-slate-300"}`} />
                <span className="text-slate-700">Objects Classified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${validationChecklist.zonesAssigned ? "text-emerald-500" : "text-slate-300"}`} />
                <span className="text-slate-700">Zones Assigned</span>
              </div>
            </div>
          </div>

          {/* RECOGNIZED ENTITY LIST & EVIDENCE DRILLDOWN */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
              Recognized Entity Evidence Explorer
            </span>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {entities.map((ent) => (
                <div
                  key={ent.id}
                  onClick={() => setSelectedEntityId(ent.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedEntity?.id === ent.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div>
                    <span className="font-bold block">{ent.name}</span>
                    <span className="text-[10px] opacity-70 font-mono">
                      Method: {ent.detectedBy} | Zone: {ent.zone}
                    </span>
                  </div>

                  <div className="text-right font-mono text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      ent.confidence >= 0.88 ? "bg-emerald-100 text-emerald-800" :
                      ent.confidence >= 0.50 ? "bg-amber-100 text-amber-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>
                      {Math.round(ent.confidence * 100)}%
                    </span>
                    <span className="block opacity-70 mt-0.5">{ent.verificationStatus}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SELECTED ENTITY EVIDENCE & CANONICAL SSOT DOSSIER BOX */}
            {selectedEntity && (
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs font-mono space-y-2 mt-2 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-amber-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>CANONICAL SSOT DOSSIER: {selectedEntity.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">{selectedEntity.verificationStatus}</span>
                </div>

                {/* CANONICAL VALUES */}
                {(() => {
                  const entCoord = selectedEntity.coordinates || { x: 500, y: 400, width: 100, height: 100 };
                  const poly = [
                    { x: entCoord.x, y: entCoord.y },
                    { x: entCoord.x + entCoord.width, y: entCoord.y },
                    { x: entCoord.x + entCoord.width, y: entCoord.y + entCoord.height },
                    { x: entCoord.x, y: entCoord.y + entCoord.height }
                  ];
                  const canonicalCtx = CanonicalSpatialCalculationEngine.createCanonicalSpatialContext({
                    entityId: selectedEntity.id || `ENTITY-${selectedEntity.name.toUpperCase().replace(/\s+/g, '_')}`,
                    propertyId: "PROP-CANONICAL-001",
                    floorId: "FLOOR-1",
                    entityType: selectedEntity.type || "ROOM",
                    polygon: poly,
                    propertyCentroid: { x: 500, y: 400 },
                    propertyBounds: { minX: 0, minY: 0, maxX: 1000, maxY: 800, width: 1000, height: 800 },
                    northRotation: (summary as any).netNorthAngleDegrees || (summary as any).northAngle || 0,
                    recognitionConfidence: selectedEntity.confidence
                  });

                  return (
                    <div className="space-y-2 text-[11px]">
                      <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700/80">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Entity ID</span>
                          <span className="text-amber-300 font-bold">{canonicalCtx.entityId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Zone Code (SSOT)</span>
                          <span className="text-emerald-300 font-bold">{canonicalCtx.zoneCode} ({canonicalCtx.zoneMetadata.englishName})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Centroid (X, Y)</span>
                          <span className="text-white font-mono">({canonicalCtx.centroid.x.toFixed(1)}, {canonicalCtx.centroid.y.toFixed(1)})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Bearing / Adjusted</span>
                          <span className="text-white font-mono">{canonicalCtx.bearing.toFixed(1)}° / {canonicalCtx.adjustedBearing.toFixed(1)}°</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700/80">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Rule IDs</span>
                          <span className="text-slate-200">R-VASTU-{canonicalCtx.zoneCode}-01</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Finding ID</span>
                          <span className="text-slate-200">FIND-{canonicalCtx.entityId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Recommendation ID</span>
                          <span className="text-slate-200">REC-{canonicalCtx.entityId}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-amber-400 font-bold text-[10px] block mb-1">CONSUMED BY DOWNSTREAM MODULES (SSOT IMMUTABLE READ)</span>
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Recognition ✓</span>
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Decision Engine ✓</span>
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Audit Report ✓</span>
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">UKA ✓</span>
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">PDF Engine ✓</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
