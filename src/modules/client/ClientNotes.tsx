import React, { useState } from "react";
import { Client } from "../../types/app";
import { FileText, Save, CheckCircle, Plus, Hash } from "lucide-react";

interface ClientNotesProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => Promise<any>;
}

export const ClientNotes: React.FC<ClientNotesProps> = ({ client, onUpdateClient }) => {
  const [notesText, setNotesText] = useState(client.notes || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Vastu", "Astro", "Priority-High"]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setNotesText(client.notes || "");
  }, [client]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedClient: Client = {
        ...client,
        notes: notesText
      };
      await onUpdateClient(updatedClient);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving notes:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Spiritual Biography & Annotations
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            LOG GENERAL CLERICAL NOTES, SPECIALLY PRESCRIPTIVE AUDITS AND DIET MATRIX
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-emerald-400 animate-fade">
              <CheckCircle className="w-3.5 h-3.5" />
              COMMITTED
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span>{saving ? "SAVING..." : "COMMIT JOURNAL"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Notes editor */}
        <div className="md:col-span-2 space-y-2">
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={10}
            placeholder="Type private consultant notes, diet prescriptions, cosmic deficiencies or any clerical instructions..."
            className="w-full bg-white/40 border border-slate-200 focus:border-emerald-500 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Tags / Meta sidebar */}
        <div className="p-4 bg-white/25 border border-slate-200 rounded-xl space-y-4 md:col-span-1">
          <h4 className="text-[10.5px] font-mono text-emerald-400 uppercase tracking-widest border-b border-slate-950 pb-2 font-bold">
            Taxonomy & Core Tags
          </h4>

          {/* Render tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 hover:bg-white text-[10px] font-mono text-emerald-300 rounded border border-slate-850"
              >
                <Hash className="w-3 h-3 text-emerald-500" />
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-rose-400 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add Tag Form */}
          <form onSubmit={handleAddTag} className="flex gap-1.5 pt-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="New tag..."
              className="bg-slate-50 text-[10px] font-mono text-slate-200 px-2 py-1.5 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 flex-1"
            />
            <button
              type="submit"
              className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/40 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[9.5px] text-slate-400 font-mono leading-normal pt-2">
            Use tags to filter clients or categorize consultation logs dynamically in downstream business intelligence queries.
          </p>
        </div>
      </div>
    </div>
  );
};
export default ClientNotes;
