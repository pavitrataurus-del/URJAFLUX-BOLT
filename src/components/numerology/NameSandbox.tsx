// src/components/numerology/NameSandbox.tsx
import React, { useState } from "react";
import { getLettersBreakdown, SystemType } from "./numerologyEngine";
import { Shuffle, HelpCircle, Plus, Trash2 } from "lucide-react";

interface NameVariant {
  id: string;
  name: string;
  type: "Current Name" | "Birth Name" | "Married Name" | "Nickname" | "Business Name" | "Brand Name" | "Company Name";
}

export default function NameSandbox() {
  const [system, setSystem] = useState<SystemType>("Pythagorean");
  const [variants, setVariants] = useState<NameVariant[]>([
    { id: "1", name: "Pavitra Sharma", type: "Birth Name" },
    { id: "2", name: "Pav Sharma", type: "Nickname" },
    { id: "3", name: "Zenith Astro Tech", type: "Business Name" }
  ]);

  const [inputName, setInputName] = useState("");
  const [inputType, setInputType] = useState<NameVariant["type"]>("Current Name");

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    setVariants([
      ...variants,
      {
        id: Date.now().toString(),
        name: inputName,
        type: inputType
      }
    ]);
    setInputName("");
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  return (
    <div className="bg-white/40 border border-slate-200 rounded-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-950 pb-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Shuffle className="w-4 h-4 text-emerald-400" />
            Alphanumeric Name Sandbox
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Simulate and evaluate multiple name modifications side-by-side to find optimal cosmic harmonies.
          </p>
        </div>

        {/* System Select */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-850 rounded">
          {(["Pythagorean", "Chaldean"] as SystemType[]).map((sys) => (
            <button
              key={sys}
              onClick={() => setSystem(sys)}
              className={`px-2.5 py-1 text-[9.5px] font-mono font-bold transition-all rounded ${
                system === sys
                  ? "bg-emerald-600 text-slate-900"
                  : "text-slate-400 hover:text-slate-900"
              }`}
            >
              {sys.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddVariant} className="flex flex-col sm:flex-row items-end gap-3 bg-slate-50/40 p-4 border border-slate-200 rounded-lg font-mono text-xs">
        <div className="flex-1 space-y-1 w-full">
          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Test Name Variation</label>
          <input
            type="text"
            required
            placeholder="e.g., Jane Mary Smith"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-850 text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1 w-full sm:w-[220px]">
          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Variant Classification</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-850 text-slate-200 rounded px-3 py-2 focus:outline-none"
          >
            <option value="Current Name">Current Name</option>
            <option value="Birth Name">Birth Name</option>
            <option value="Married Name">Married Name</option>
            <option value="Nickname">Nickname</option>
            <option value="Business Name">Business Name</option>
            <option value="Brand Name">Brand Name</option>
            <option value="Company Name">Company Name</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded font-bold cursor-pointer uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>INJECT NAME</span>
        </button>
      </form>

      {/* Grid Table of Comparisons */}
      {variants.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg">
          <p className="text-xs font-mono text-slate-400">No name variants submitted to the sandbox.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-950 rounded-xl bg-slate-50/20">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Name & Classification</th>
                <th className="p-4 text-center">Gematria Sum</th>
                <th className="p-4 text-center">Expression / Destiny</th>
                <th className="p-4 text-center">Soul Urge (Vowels)</th>
                <th className="p-4 text-center">Personality (Consonants)</th>
                <th className="p-4 text-center">Subconscious Self</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-950">
              {variants.map((v) => {
                const b = getLettersBreakdown(v.name, system);
                return (
                  <tr key={v.id} className="hover:bg-white/40 transition-colors text-slate-700">
                    <td className="p-4">
                      <p className="font-bold text-slate-200">{v.name}</p>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase">{v.type}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-400">{b.value}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-900/40 rounded font-bold text-[11px]">
                        {b.reduced}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 bg-rose-950/40 text-rose-300 border border-rose-900/40 rounded font-bold text-[11px]">
                        {b.vowelsReduced}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-900/40 rounded font-bold text-[11px]">
                        {b.consonantsReduced}
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-400 font-bold">
                      {9 - (9 - new Set(b.letters.map(l => l.val)).size)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRemoveVariant(v.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/10 rounded cursor-pointer transition-colors border border-transparent hover:border-rose-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
