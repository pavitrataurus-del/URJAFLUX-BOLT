import React, { useState } from "react";
import { Property, Client } from "../../types/app";
import { 
  Building2, Plus, Trash2, MapPin, Compass, Maximize2, Layout, Calendar, Layers, ShieldCheck
} from "lucide-react";

interface ClientPropertiesProps {
  client: Client;
  properties: Property[];
  onAddProperty: (propertyData: Omit<Property, "id">) => Promise<Property>;
  onDeleteProperty: (id: string) => Promise<void>;
  onEditProperty?: (property: Property) => Promise<Property>;
}

export const ClientProperties: React.FC<ClientPropertiesProps> = ({
  client,
  properties,
  onAddProperty,
  onDeleteProperty,
  onEditProperty
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState<Property["constructionStatus"]>("Planned");
  const [address, setAddress] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [floors, setFloors] = useState<number>(1);
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [facingDirection, setFacingDirection] = useState("North");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const propertyPayload: Omit<Property, "id"> = {
        name,
        address,
        plotSize,
        floors: Number(floors),
        clientId: client.id,
        ownerName: client.name,
        constructionStatus: propertyType,
        consultationStatus: "Pending",
        builtUpArea,
        facingDirection,
        gpsCoordinates: latitude && longitude ? `${latitude}, ${longitude}` : undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        floorPlans: [],
        compassCalibration: {},
        analysisHistory: [
          {
            date: new Date().toISOString().split("T")[0],
            event: "Initial Property Created",
            status: "Pending"
          }
        ]
      };
      await onAddProperty(propertyPayload);
      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error("Error creating property:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPropertyType("Planned");
    setAddress("");
    setPlotSize("");
    setFloors(1);
    setBuiltUpArea("");
    setFacingDirection("North");
    setLatitude("");
    setLongitude("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Asset Portfolio Management
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            REAL ESTATE COORDINATE MAPS • {properties.length} PROPERTIES LOGGED
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {isAdding ? "CANCEL" : "REGISTER PROPERTY"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-5 bg-white/40 border border-slate-200 rounded-xl space-y-4">
          <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-950 pb-2">
            Register Real Estate Coordinate Asset
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Property Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Asset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Emerald Villa, South Office"
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Construction Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Construction Status</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as Property["constructionStatus"])}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="Planned">Planned / Proposed</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Completed">Completed / Handover</option>
              </select>
            </div>

            {/* Facing Direction */}
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

            {/* Plot Size */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Plot Size</label>
              <input
                type="text"
                value={plotSize}
                onChange={(e) => setPlotSize(e.target.value)}
                required
                placeholder="e.g., 2400 sq.ft."
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Built-up Area */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Built-up Area</label>
              <input
                type="text"
                value={builtUpArea}
                onChange={(e) => setBuiltUpArea(e.target.value)}
                placeholder="e.g., 1800 sq.ft."
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Floors count */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Floor Count</label>
              <input
                type="number"
                min={1}
                value={floors}
                onChange={(e) => setFloors(Number(e.target.value))}
                required
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Latitude */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Latitude (GPS)</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 28.6139"
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Longitude */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Longitude (GPS)</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., 77.2090"
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Address */}
            <div className="space-y-1 sm:col-span-2 md:col-span-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="e.g., Sector 4, New Delhi"
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {loading ? "COMMITTING ASSET..." : "REGISTER PROPERTIES"}
            </button>
          </div>
        </form>
      )}

      {properties.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-white/10">
          <Building2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-400 text-xs font-medium">No properties currently owned by this client.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-emerald-400 hover:text-emerald-300 font-mono text-[10.5px] mt-2 underline cursor-pointer"
          >
            Register first property asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="p-4 bg-white/35 border border-slate-200 rounded-xl flex flex-col justify-between gap-3 hover:border-slate-200 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{property.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[200px]">{property.address}</span>
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

              {/* Physical specifications */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50/40 p-2.5 rounded-lg text-[10.5px] text-slate-700 font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">PLOT SIZE</span>
                  <span className="font-bold">{property.plotSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">BUILT AREA</span>
                  <span className="font-bold">{property.builtUpArea || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">FACING</span>
                  <span className="font-bold flex items-center gap-1 text-emerald-300">
                    <Compass className="w-3.5 h-3.5" />
                    {property.facingDirection || "North"}
                  </span>
                </div>
              </div>

              {/* Geo location parameters */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-950">
                <span className="text-slate-400">GPS COORDINATES:</span>
                <span className="text-slate-700 font-semibold">{property.gpsCoordinates || "Not Configured"}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end pt-2 mt-1">
                <button
                  onClick={() => onDeleteProperty(property.id)}
                  className="p-1.5 bg-slate-50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-850 rounded cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[9.5px] font-mono uppercase px-1">DISMISS ASSET</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClientProperties;
