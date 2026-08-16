import React, { useState } from "react";
import { Property, Client } from "../types/app";
import { Building2, Search, Compass, MapPin, Sliders, Trash2, Plus, Users } from "lucide-react";

interface PropertiesPageProps {
  properties: Property[];
  clients: Client[];
  onAddProperty: (property: Omit<Property, "id">) => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onSelectPropertyToCalibrate: (property: Property) => void;
}

export default function PropertiesPage({
  properties,
  clients,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onSelectPropertyToCalibrate
}: PropertiesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add Property state
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [address, setAddress] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [floors, setFloors] = useState(1);
  const [facingDirection, setFacingDirection] = useState("North");

  const filteredProperties = properties.filter((property) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = property.name?.toLowerCase().includes(q);
      const matchesAddress = property.address?.toLowerCase().includes(q);
      const matchesOwner = property.ownerName?.toLowerCase().includes(q);
      if (!matchesName && !matchesAddress && !matchesOwner) return false;
    }

    if (selectedStatus !== "All") {
      if (property.constructionStatus !== selectedStatus) return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setName("");
    setOwnerId(clients[0]?.id || "");
    setAddress("");
    setPlotSize("");
    setBuiltUpArea("");
    setFloors(1);
    setFacingDirection("North");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerClient = clients.find(c => c.id === ownerId);
    if (!ownerClient) return;

    onAddProperty({
      name,
      address,
      plotSize,
      floors,
      clientId: ownerId,
      ownerName: ownerClient.name,
      constructionStatus: "Planned",
      consultationStatus: "Pending",
      builtUpArea,
      facingDirection,
      compassCalibration: {},
      analysisHistory: []
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Asset Portfolio & Coordinate Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and manage geo-spatial properties linked directly to the Universal CRM dossiers.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW ASSET</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/40 p-3.5 border border-slate-200 rounded-xl">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by name, address or owner name..."
            className="w-full bg-slate-50 text-xs text-slate-200 pl-4 pr-4 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-slate-850 text-slate-200 text-xs rounded px-3 py-2 focus:outline-none"
        >
          <option value="All">All Construction Statuses</option>
          <option value="Planned">Planned</option>
          <option value="Under Construction">Under Construction</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Grid of properties */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
          <Building2 className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-400 text-xs font-mono">No property assets match your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <div key={property.id} className="p-5 bg-white/45 hover:bg-white border border-slate-200 hover:border-slate-200 rounded-xl transition-all flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-900/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{property.name}</h4>
                    <p className="text-[10px] text-emerald-300 font-mono mt-0.5 flex items-center gap-1 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      <span>Owner: {property.ownerName}</span>
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[8.5px] font-mono font-bold rounded uppercase ${
                  property.constructionStatus === "Completed" 
                    ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30"
                    : property.constructionStatus === "Under Construction"
                    ? "bg-amber-950/20 text-amber-400 border border-amber-900/30"
                    : "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30"
                }`}>
                  {property.constructionStatus}
                </span>
              </div>

              {/* specs */}
              <div className="space-y-1.5 text-xs text-slate-700 font-mono border-t border-slate-950 pt-3">
                <p className="flex justify-between">
                  <span className="text-slate-400">FACING DIRECTION:</span>
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    {property.facingDirection || "North"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">PLOT SIZE:</span>
                  <span className="text-slate-200">{property.plotSize}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">ADDRESS:</span>
                  <span className="text-slate-200 truncate max-w-[150px]">{property.address}</span>
                </p>
              </div>

              {/* footer action */}
              <div className="flex items-center justify-between border-t border-slate-950 pt-3 mt-1">
                <button
                  onClick={() => onDeleteProperty(property.id)}
                  className="p-1.5 bg-slate-50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-850 rounded cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectPropertyToCalibrate(property)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900/40 text-[10.5px] font-mono font-bold text-emerald-300 hover:text-emerald-200 rounded-lg transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>CALIBRATE VASTU GRID</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-950 p-4 bg-slate-50">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Register New Asset Portfolio
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Asset Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Maple Villa"
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Linked Client (Dossier)</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Facing Direction</label>
                  <select
                    value={facingDirection}
                    onChange={(e) => setFacingDirection(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                  >
                    <option value="North">North (Uttara)</option>
                    <option value="North-East">North-East (Ishan)</option>
                    <option value="East">East (Purva)</option>
                    <option value="South-East">South-East (Agneya)</option>
                    <option value="South">South (Dakshin)</option>
                    <option value="South-West">South-West (Nairutya)</option>
                    <option value="West">West (Pashchima)</option>
                    <option value="North-West">North-West (Vayavya)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Plot Size</label>
                  <input
                    type="text"
                    value={plotSize}
                    onChange={(e) => setPlotSize(e.target.value)}
                    required
                    placeholder="e.g., 2000 sq.ft."
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="e.g., Block G, Delhi"
                  className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-950 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-900 border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs font-mono font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-lg transition-colors cursor-pointer text-xs font-mono font-bold"
                >
                  REGISTER PROPERTIES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export class X extends React.Component<any, any> {}
