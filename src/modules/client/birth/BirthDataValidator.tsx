import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, ShieldAlert } from "lucide-react";
import { Client, Property } from "../../../types/app";

interface BirthDataValidatorProps {
  client: Client;
  properties: Property[];
  onSetBirthTimeUnavailable: () => void;
}

export const BirthDataValidator: React.FC<BirthDataValidatorProps> = ({
  client,
  properties,
  onSetBirthTimeUnavailable
}) => {
  // Validate Mandatory Fields
  const hasName = !!client.name;
  const hasDOB = !!client.dob;
  const hasBirthTime = !!client.birthTime;
  const hasBirthPlace = !!client.birthPlace;

  // Compute Module Completion Percentages
  // 1. Personal Details: Name, email, phone, gender, preferred language
  let personalScore = 0;
  if (client.name) personalScore += 20;
  if (client.email) personalScore += 20;
  if (client.phone) personalScore += 20;
  if (client.gender) personalScore += 20;
  if (client.language || client.preferredLanguage) personalScore += 20;

  // 2. Birth Registry: DOB, Birth Time, Birth Place, Latitude, Longitude, Timezone
  let birthScore = 0;
  if (client.dob) birthScore += 20;
  if (client.birthTime) birthScore += 20;
  if (client.birthPlace) birthScore += 20;
  if (client.birthLatitude !== undefined) birthScore += 15;
  if (client.birthLongitude !== undefined) birthScore += 15;
  if (client.birthTimezone) birthScore += 10;

  // 3. Properties: 100% if has properties, otherwise 50% if address set, else 0%
  const clientProperties = properties.filter((p) => p.clientId === client.id);
  const propertyScore = clientProperties.length > 0 ? 100 : (client.address ? 50 : 0);

  // 4. Consultations: 100% if history exists, otherwise 40% if bio notes exist, else 0%
  const consultationsCount = (client.consultationHistory || []).length;
  const consultationsScore = consultationsCount > 0 ? 100 : (client.notes ? 40 : 0);

  // 5. Overall Completion Index (weighted average or clean math)
  const overallScore = Math.round((personalScore + birthScore + propertyScore + consultationsScore) / 4);

  const isProfileComplete = hasName && hasDOB && hasBirthTime && hasBirthPlace;

  return (
    <div className="space-y-4 p-4 bg-slate-50/40 border border-slate-200 rounded-lg" id="birth-data-validator">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          Client Completion Index
        </span>
        <span className="text-[9px] font-mono text-slate-400">MANDATORY KEY COMPLIANCE</span>
      </div>

      {/* Validation Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-3 bg-slate-50/50 border border-slate-200 rounded">
          <h4 className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Mandatory Birth Fields
          </h4>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Full Name:</span>
              {hasName ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">✓ PASSED</span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1">✗ REQUIRED</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Date of Birth:</span>
              {hasDOB ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">✓ PASSED</span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1">✗ REQUIRED</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Birth Time:</span>
              {hasBirthTime ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">✓ {client.birthTime === "Unknown / Not Available" ? "LOGGED AS UNKNOWN" : "PASSED"}</span>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-rose-400 font-bold">✗ REQUIRED</span>
                  <button
                    type="button"
                    onClick={onSetBirthTimeUnavailable}
                    className="text-[9px] text-emerald-400 hover:text-slate-900 underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Set Unknown / Not Available
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Birth Place:</span>
              {hasBirthPlace ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">✓ PASSED</span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1">✗ REQUIRED</span>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200">
            {isProfileComplete ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Scripture Calculation Ready! All core parameters verified.</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 text-rose-400 text-[10px] font-mono">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-pulse" />
                <span>Profiles cannot be calculated or closed until all core details are entered.</span>
              </div>
            )}
          </div>
        </div>

        {/* Completion Progress Bars */}
        <div className="space-y-2.5 p-3 bg-slate-50/50 border border-slate-200 rounded">
          <h4 className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Profile Completion Metrics
          </h4>
          <div className="space-y-1.5 pt-1">
            {/* Personal Details */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Personal Details</span>
                <span className="text-slate-200 font-bold">{personalScore}%</span>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${personalScore}%` }} />
              </div>
            </div>

            {/* Birth Registry */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Birth Registry</span>
                <span className="text-slate-200 font-bold">{birthScore}%</span>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${birthScore}%` }} />
              </div>
            </div>

            {/* Properties */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Properties</span>
                <span className="text-slate-200 font-bold">{propertyScore}%</span>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${propertyScore}%` }} />
              </div>
            </div>

            {/* Consultations */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Consultations</span>
                <span className="text-slate-200 font-bold">{consultationsScore}%</span>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${consultationsScore}%` }} />
              </div>
            </div>

            {/* Overall Index */}
            <div className="pt-1.5 border-t border-slate-200/60 mt-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-900 font-bold">Overall Completion Status</span>
                <span className="text-emerald-400 font-bold">{overallScore}%</span>
              </div>
              <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden mt-1">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${overallScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthDataValidator;
