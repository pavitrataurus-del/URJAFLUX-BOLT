import React from "react";
import { Upload, FileUp, Plus, X, Sparkles } from "lucide-react";

interface WorkspaceUploadPopupProps {
  canvasTheme: "light" | "dark";
  hasBlueprint: boolean;
  onClose: () => void;
  onUpload: () => void;
  onNewProject?: () => void;
}

export const WorkspaceUploadPopup: React.FC<WorkspaceUploadPopupProps> = ({
  canvasTheme,
  hasBlueprint,
  onClose,
  onUpload,
  onNewProject,
}) => {
  const isDark = canvasTheme === "dark";

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Workspace setup"
    >
      <div
        className="absolute inset-0 bg-black/20 dark:bg-black/30 pointer-events-auto"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md pointer-events-auto rounded-3xl border shadow-2xl overflow-hidden ${
          isDark
            ? "bg-[#0c1018]/95 border-white/10 text-slate-100 shadow-black/40"
            : "bg-white/95 border-slate-200/80 text-slate-900 shadow-slate-300/40"
        }`}
        style={{ backdropFilter: "blur(24px)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 pt-10 pb-8 text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
              isDark
                ? "bg-emerald-500/15 border border-emerald-500/25"
                : "bg-emerald-50 border border-emerald-100"
            }`}
          >
            <Sparkles className={`w-7 h-7 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
          </div>

          <h2 className="text-xl font-semibold tracking-tight mb-2">
            {hasBlueprint ? "Workspace" : "Welcome to Vastu Workspace"}
          </h2>
          <p className={`text-sm leading-relaxed mb-8 max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {hasBlueprint
              ? "Import a new blueprint or continue working on your floor plan."
              : "Upload a blueprint, or start a blank drawing when no CAD file exists."}
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onUpload}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98]"
            >
              <Upload className="w-5 h-5" />
              {hasBlueprint ? "Import New Blueprint" : "Upload Blueprint"}
            </button>

            {!hasBlueprint && onNewProject && (
              <button
                type="button"
                onClick={onNewProject}
                className={`w-full py-3 px-5 font-medium rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
                    : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                }`}
              >
                <Plus className="w-4 h-4" />
                New Blank Drawing
              </button>
            )}

            {hasBlueprint && (
              <button
                type="button"
                onClick={onClose}
                className={`w-full py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Continue on Blueprint
              </button>
            )}
          </div>

          <p className={`mt-6 text-[11px] flex items-center justify-center gap-1.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <FileUp className="w-3.5 h-3.5" />
            PDF, PNG, JPG supported
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceUploadPopup;
