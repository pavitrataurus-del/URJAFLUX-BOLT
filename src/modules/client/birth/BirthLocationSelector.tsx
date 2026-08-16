import React, { useState, useEffect } from "react";
import { Search, MapPin, Navigation } from "lucide-react";

export interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// Comprehensive predefined cities database for Indian and Global locations
const PRESET_LOCATIONS: LocationData[] = [
  { city: "New Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.2090, timezone: "Asia/Kolkata" },
  { city: "Mumbai", state: "Maharashtra", country: "India", latitude: 19.0760, longitude: 72.8777, timezone: "Asia/Kolkata" },
  { city: "Bangalore", state: "Karnataka", country: "India", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata" },
  { city: "Chennai", state: "Tamil Nadu", country: "India", latitude: 13.0827, longitude: 80.2707, timezone: "Asia/Kolkata" },
  { city: "Kolkata", state: "West Bengal", country: "India", latitude: 22.5726, longitude: 88.3639, timezone: "Asia/Kolkata" },
  { city: "Hyderabad", state: "Telangana", country: "India", latitude: 17.3850, longitude: 78.4867, timezone: "Asia/Kolkata" },
  { city: "Pune", state: "Maharashtra", country: "India", latitude: 18.5204, longitude: 73.8567, timezone: "Asia/Kolkata" },
  { city: "Ahmedabad", state: "Gujarat", country: "India", latitude: 23.0225, longitude: 72.5714, timezone: "Asia/Kolkata" },
  { city: "Jaipur", state: "Rajasthan", country: "India", latitude: 26.9124, longitude: 75.7873, timezone: "Asia/Kolkata" },
  { city: "Varanasi", state: "Uttar Pradesh", country: "India", latitude: 25.3176, longitude: 82.9739, timezone: "Asia/Kolkata" },
  { city: "Haridwar", state: "Uttarakhand", country: "India", latitude: 29.9457, longitude: 78.1642, timezone: "Asia/Kolkata" },
  { city: "Rishikesh", state: "Uttarakhand", country: "India", latitude: 30.0869, longitude: 78.2676, timezone: "Asia/Kolkata" },
  { city: "New York", state: "New York", country: "United States", latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York" },
  { city: "Los Angeles", state: "California", country: "United States", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { city: "London", state: "England", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
  { city: "Tokyo", state: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
  { city: "Sydney", state: "New South Wales", country: "Australia", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
  { city: "Dubai", state: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },
  { city: "Singapore", state: "Central Region", country: "Singapore", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore" },
  { city: "Ujjain", state: "Madhya Pradesh", country: "India", latitude: 23.1760, longitude: 75.7885, timezone: "Asia/Kolkata" },
];

interface BirthLocationSelectorProps {
  initialCity?: string;
  initialState?: string;
  initialCountry?: string;
  initialLat?: number;
  initialLng?: number;
  initialTimezone?: string;
  onSelectLocation: (data: LocationData) => void;
}

export const BirthLocationSelector: React.FC<BirthLocationSelectorProps> = ({
  initialCity = "",
  initialState = "",
  initialCountry = "",
  initialLat,
  initialLng,
  initialTimezone = "",
  onSelectLocation
}) => {
  const [search, setSearch] = useState(initialCity);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customLat, setCustomLat] = useState<string>(initialLat !== undefined ? initialLat.toString() : "");
  const [customLng, setCustomLng] = useState<string>(initialLng !== undefined ? initialLng.toString() : "");
  const [customTimezone, setCustomTimezone] = useState<string>(initialTimezone || "Asia/Kolkata");
  const [customState, setCustomState] = useState<string>(initialState || "");
  const [customCountry, setCustomCountry] = useState<string>(initialCountry || "");

  // Synced with changes in parent initialCity
  useEffect(() => {
    setSearch(initialCity);
    setCustomLat(initialLat !== undefined ? initialLat.toString() : "");
    setCustomLng(initialLng !== undefined ? initialLng.toString() : "");
    setCustomTimezone(initialTimezone || "Asia/Kolkata");
    setCustomState(initialState || "");
    setCustomCountry(initialCountry || "");
  }, [initialCity, initialLat, initialLng, initialTimezone, initialState, initialCountry]);

  // Filter list
  const sLower = (search || "").toLowerCase();
  const filtered = PRESET_LOCATIONS.filter(loc => 
    (loc.city || "").toLowerCase().includes(sLower) ||
    (loc.country || "").toLowerCase().includes(sLower) ||
    (loc.state || "").toLowerCase().includes(sLower)
  );

  const handleSelectPreset = (loc: LocationData) => {
    setSearch(loc.city);
    setCustomLat(loc.latitude.toString());
    setCustomLng(loc.longitude.toString());
    setCustomTimezone(loc.timezone);
    setCustomState(loc.state);
    setCustomCountry(loc.country);
    setShowDropdown(false);
    onSelectLocation(loc);
  };

  const handleCustomCoordinatesChange = (field: "lat" | "lng" | "tz" | "state" | "country" | "city", value: string) => {
    let cityVal = search;
    let stateVal = customState;
    let countryVal = customCountry;
    let latVal = parseFloat(customLat) || 0;
    let lngVal = parseFloat(customLng) || 0;
    let tzVal = customTimezone;

    if (field === "lat") {
      setCustomLat(value);
      latVal = parseFloat(value) || 0;
    } else if (field === "lng") {
      setCustomLng(value);
      lngVal = parseFloat(value) || 0;
    } else if (field === "tz") {
      setCustomTimezone(value);
      tzVal = value;
    } else if (field === "state") {
      setCustomState(value);
      stateVal = value;
    } else if (field === "country") {
      setCustomCountry(value);
      countryVal = value;
    } else if (field === "city") {
      setSearch(value);
      cityVal = value;
    }

    onSelectLocation({
      city: cityVal,
      state: stateVal,
      country: countryVal,
      latitude: latVal,
      longitude: lngVal,
      timezone: tzVal
    });
  };

  return (
    <div className="space-y-3.5 p-4 bg-slate-50/40 border border-slate-200 rounded-lg" id="birth-location-selector">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          Smart Geolocation Services
        </span>
        <span className="text-[9px] font-mono text-slate-400">AUTO-COORDINATE RESOLUTION</span>
      </div>

      <div className="relative">
        <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Search Birth Place *</label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
              handleCustomCoordinatesChange("city", e.target.value);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search city e.g. New Delhi, Varanasi, London..."
            className="w-full bg-slate-50 text-xs text-slate-200 pl-8.5 pr-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-sans"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Suggestion Dropdown */}
        {showDropdown && search && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl max-h-48 overflow-y-auto z-10">
            {filtered.length > 0 ? (
              filtered.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(loc)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-b border-slate-950/40 last:border-0 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-sans flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    {loc.city}, {loc.state ? `${loc.state}, ` : ""}{loc.country}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                  </span>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-[10px] font-mono text-slate-400">
                No matching presets. Continue entering details manually.
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="w-full text-center py-1 text-[9px] font-mono bg-slate-50 text-emerald-400 hover:text-slate-900 uppercase tracking-wider"
            >
              Close Suggestions
            </button>
          </div>
        )}
      </div>

      {/* Lat/Lng/TZ Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">State / Province</label>
          <input
            type="text"
            value={customState}
            onChange={(e) => handleCustomCoordinatesChange("state", e.target.value)}
            placeholder="e.g. Uttar Pradesh"
            className="w-full bg-slate-50 text-xs text-slate-700 px-2.5 py-1.5 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Country</label>
          <input
            type="text"
            value={customCountry}
            onChange={(e) => handleCustomCoordinatesChange("country", e.target.value)}
            placeholder="e.g. India"
            className="w-full bg-slate-50 text-xs text-slate-700 px-2.5 py-1.5 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">IANA Time Zone</label>
          <input
            type="text"
            value={customTimezone}
            onChange={(e) => handleCustomCoordinatesChange("tz", e.target.value)}
            placeholder="e.g. Asia/Kolkata"
            className="w-full bg-slate-50 text-xs text-slate-700 px-2.5 py-1.5 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Latitude</label>
          <div className="relative">
            <input
              type="text"
              value={customLat}
              onChange={(e) => handleCustomCoordinatesChange("lat", e.target.value)}
              placeholder="e.g. 28.6139"
              className="w-full bg-slate-50 text-xs text-slate-700 px-2.5 py-1.5 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-mono"
            />
            <Navigation className="w-3 h-3 text-slate-600 absolute right-2.5 top-2.5 rotate-45" />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Longitude</label>
          <div className="relative">
            <input
              type="text"
              value={customLng}
              onChange={(e) => handleCustomCoordinatesChange("lng", e.target.value)}
              placeholder="e.g. 77.2090"
              className="w-full bg-slate-50 text-xs text-slate-700 px-2.5 py-1.5 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-mono"
            />
            <Navigation className="w-3 h-3 text-slate-600 absolute right-2.5 top-2.5 rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthLocationSelector;
