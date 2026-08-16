import React from "react";
import { User, Calendar, Clock, MapPin, Globe, Compass, CheckCircle2, ShieldAlert } from "lucide-react";
import { Client } from "../../../types/app";

interface BirthProfileCardProps {
  client: Client;
}

export const BirthProfileCard: React.FC<BirthProfileCardProps> = ({ client }) => {
  // Compute Age
  const calculateAge = (dobString?: string): string => {
    if (!dobString) return "Unknown Age";
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return "Unknown Age";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} years old` : "Newborn";
  };

  const formattedTime = client.birthTime 
    ? client.birthTime === "Unknown / Not Available" 
      ? "Unknown / Not Available" 
      : client.birthTime 
    : "Not Configured";

  return (
    <div className="space-y-4 p-4 bg-slate-50/40 border border-slate-200 rounded-lg" id="birth-profile-card">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-emerald-400" />
          Birth Dossier Record
        </span>
        <div className="flex items-center gap-1">
          {client.birthDataStatus === "Verified" ? (
            <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[8px] font-mono font-bold uppercase rounded border border-emerald-900/60 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Verified
            </span>
          ) : (
            <span className="px-1.5 py-0.5 bg-amber-950 text-amber-400 text-[8px] font-mono font-bold uppercase rounded border border-amber-900/60 flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5 animate-pulse" />
              {client.birthDataStatus || "User Entered"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar / Symbol */}
        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0">
          <Globe className="w-7 h-7 text-emerald-500 animate-pulse" />
          <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase">GEOCENTRIC</span>
        </div>

        {/* Info List */}
        <div className="flex-1 space-y-2 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {/* Full Name */}
            <div className="flex justify-between border-b border-slate-950/45 py-1">
              <span className="text-slate-400 font-mono text-[10.5px]">CLIENT NAME:</span>
              <span className="text-slate-200 font-medium">{client.name}</span>
            </div>

            {/* Gender */}
            <div className="flex justify-between border-b border-slate-950/45 py-1">
              <span className="text-slate-400 font-mono text-[10.5px]">GENDER:</span>
              <span className="text-slate-200 font-medium">{client.gender || "Not Specified"}</span>
            </div>

            {/* Date of Birth */}
            <div className="flex justify-between border-b border-slate-950/45 py-1">
              <span className="text-slate-400 font-mono text-[10.5px]">DATE OF BIRTH:</span>
              <span className="text-slate-200 font-medium font-mono">{client.dob || "Not Entered"}</span>
            </div>

            {/* Birth Time */}
            <div className="flex justify-between border-b border-slate-950/45 py-1">
              <span className="text-slate-400 font-mono text-[10.5px]">BIRTH TIME:</span>
              <span className="text-emerald-400 font-semibold font-mono">{formattedTime}</span>
            </div>

            {/* Age */}
            <div className="flex justify-between border-b border-slate-950/45 py-1">
              <span className="text-slate-400 font-mono text-[10.5px]">COMPUTED AGE:</span>
              <span className="text-slate-700 font-mono">{calculateAge(client.dob)}</span>
            </div>

            {/* Preferred Language */}
            <div className="flex justify-between border-b border-slate-950/45 py-1">
              <span className="text-slate-400 font-mono text-[10.5px]">PREF LANGUAGE:</span>
              <span className="text-slate-700">{client.preferredLanguage || client.language || "English"}</span>
            </div>
          </div>

          {/* Location details row */}
          <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded space-y-1.5 text-[11px] font-mono">
            <div className="flex items-start gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-sans font-semibold text-slate-200">
                  {client.birthPlace || "No Location Logged"}
                </p>
                <p className="text-[9.5px] text-slate-400 mt-0.5">
                  {client.state ? `${client.state}, ` : ""}{client.country || "Earth"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/40 text-[9.5px] text-slate-400">
              <div>
                <span className="text-slate-600 block">LATITUDE</span>
                <span className="text-slate-700">{client.birthLatitude !== undefined ? `${client.birthLatitude.toFixed(4)}° N` : "Not Calibrated"}</span>
              </div>
              <div>
                <span className="text-slate-600 block">LONGITUDE</span>
                <span className="text-slate-700">{client.birthLongitude !== undefined ? `${client.birthLongitude.toFixed(4)}° E` : "Not Calibrated"}</span>
              </div>
              <div>
                <span className="text-slate-600 block">TIMEZONE</span>
                <span className="text-slate-700 truncate block">{client.birthTimezone || "UTC"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthProfileCard;
