import React, { useState } from "react";
import { Building2, Compass, Map, Home, MapPin, Check, Edit2, Sliders } from "lucide-react";
import { Property, Project } from "../../types/app";

interface PropertyInformationPanelProps {
  property: Property | null;
  project: Project | null;
  propertiesList?: Property[];
  onPropertyChange?: (updated: Property) => void;
  onSelectProperty?: (propertyId: string) => void;
  onUpdateProjectName?: (newName: string) => void;
}

export default function PropertyInformationPanel({
  property,
  project,
  propertiesList = [],
  onPropertyChange,
  onSelectProperty,
  onUpdateProjectName
}: PropertyInformationPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property | null>(property);
  const [editedProjectName, setEditedProjectName] = useState(project?.name || "");

  React.useEffect(() => {
    setEditedProperty(property);
  }, [property]);

  React.useEffect(() => {
    setEditedProjectName(project?.name || "");
  }, [project]);

  if (!editedProperty) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
        <Building2 className="w-10 h-10 text-slate-600 mb-2" />
        <p className="text-xs text-slate-400">No active property context.</p>
        {propertiesList.length > 0 && onSelectProperty && (
          <div className="mt-3 w-full">
            <select
              onChange={(e) => onSelectProperty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Select Property --</option>
              {propertiesList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  const handleSave = () => {
    if (editedProperty && onPropertyChange) {
      onPropertyChange(editedProperty);
    }
    if (onUpdateProjectName && editedProjectName.trim()) {
      onUpdateProjectName(editedProjectName);
    }
    setIsEditing(false);
  };

  const handlePropertyChange = (field: keyof Property, value: any) => {
    if (editedProperty) {
      setEditedProperty({
        ...editedProperty,
        [field]: value
      });
    }
  };

  // Extract lat/long if present in GPS coordinates e.g. "12.9716, 77.5946"
  const gpsParts = (editedProperty.gpsCoordinates || "").split(",");
  const latVal = gpsParts[0]?.trim() || "12.9716° N";
  const lngVal = gpsParts[1]?.trim() || "77.5946° E";

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Property Specs</h3>
            <p className="text-[10px] text-slate-400 font-mono">Structural Dossier</p>
          </div>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="p-1 bg-slate-50 border border-slate-200 hover:border-emerald-500/40 hover:bg-white rounded text-slate-400 hover:text-emerald-400 transition-all"
        >
          {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="space-y-2.5 pt-1 overflow-y-auto max-h-[300px]">
        {/* Project Name */}
        <div>
          <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Project Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editedProjectName}
              onChange={(e) => setEditedProjectName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50/40 px-2.5 py-1.5 rounded border border-slate-850/60 font-semibold text-emerald-400">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>{project?.name || "Vastu Analysis Project"}</span>
            </div>
          )}
        </div>

        {/* Site Name */}
        <div>
          <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Site / Property Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editedProperty.name}
              onChange={(e) => handlePropertyChange("name", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50/40 px-2.5 py-1.5 rounded border border-slate-850/60">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>{editedProperty.name}</span>
            </div>
          )}
        </div>

        {/* Plot Size & Built-up Area */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Plot Size</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProperty.plotSize}
                onChange={(e) => handlePropertyChange("plotSize", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50/40 px-2 py-1 rounded border border-slate-850/60">
                <Map className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{editedProperty.plotSize || "2400 sq.ft."}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Built-up Area</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProperty.notes || "1800 sq.ft."}
                onChange={(e) => handlePropertyChange("notes", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50/40 px-2 py-1 rounded border border-slate-850/60">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{editedProperty.notes || "1800 sq.ft."}</span>
              </div>
            )}
          </div>
        </div>

        {/* Facing Direction & Floors & Units */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Facing</label>
            {isEditing ? (
              <select
                value={editedProperty.gpsCoordinates?.split(";")[2] || "North"}
                onChange={(e) => {
                  const currentGps = editedProperty.gpsCoordinates || "12.9716, 77.5946";
                  const parts = currentGps.split(";");
                  parts[2] = e.target.value;
                  handlePropertyChange("gpsCoordinates", parts.join(";"));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-205 focus:outline-none focus:border-emerald-500"
              >
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="South">South</option>
                <option value="West">West</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            ) : (
              <div className="flex flex-col items-center justify-center p-1 bg-slate-50/40 rounded border border-slate-850/60 text-center">
                <Compass className="w-3.5 h-3.5 text-amber-500 mb-0.5" />
                <span className="text-[10px] text-slate-700 font-mono truncate max-w-full">
                  {editedProperty.gpsCoordinates?.split(";")[2] || "North-East"}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Floors</label>
            {isEditing ? (
              <input
                type="number"
                value={editedProperty.floors}
                onChange={(e) => handlePropertyChange("floors", parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-1 bg-slate-50/40 rounded border border-slate-850/60 text-center">
                <span className="text-xs font-mono font-bold text-slate-700">{editedProperty.floors || 1}</span>
                <span className="text-[8px] text-slate-400 uppercase">Levels</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Units</label>
            {isEditing ? (
              <input
                type="number"
                value={editedProperty.compassDeviation || 1}
                onChange={(e) => handlePropertyChange("compassDeviation", parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-1 bg-slate-50/40 rounded border border-slate-850/60 text-center">
                <span className="text-xs font-mono font-bold text-slate-700">{editedProperty.compassDeviation || 1}</span>
                <span className="text-[8px] text-slate-400 uppercase">Units</span>
              </div>
            )}
          </div>
        </div>

        {/* GPS Location Details */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Latitude</label>
            {isEditing ? (
              <input
                type="text"
                value={latVal}
                onChange={(e) => {
                  const currentGps = editedProperty.gpsCoordinates || "12.9716, 77.5946";
                  const parts = currentGps.split(";");
                  const coords = (parts[0] || "12.9716, 77.5946").split(",");
                  coords[0] = e.target.value;
                  parts[0] = coords.join(",");
                  handlePropertyChange("gpsCoordinates", parts.join(";"));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-202 focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-slate-400 bg-slate-50/30 rounded border border-slate-850/40">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{latVal}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Longitude</label>
            {isEditing ? (
              <input
                type="text"
                value={lngVal}
                onChange={(e) => {
                  const currentGps = editedProperty.gpsCoordinates || "12.9716, 77.5946";
                  const parts = currentGps.split(";");
                  const coords = (parts[0] || "12.9716, 77.5946").split(",");
                  coords[1] = e.target.value;
                  parts[0] = coords.join(",");
                  handlePropertyChange("gpsCoordinates", parts.join(";"));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-202 focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-slate-400 bg-slate-50/30 rounded border border-slate-850/40">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{lngVal}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
