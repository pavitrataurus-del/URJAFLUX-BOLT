import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Home,
  LayoutGrid,
  ChevronDown,
  Compass,
  FileText,
  Upload,
  Wrench,
  MoreHorizontal,
  Undo2,
  Redo2,
} from "lucide-react";
import LanguageSelector from "../../localization/LanguageSelector";

interface VastuClientToolbarProps {
  canvasTheme: "light" | "dark";
  canRunAnalysis: boolean;
  runButtonLabel: string;
  canGenerateReport: boolean;
  canAddChakra: boolean;
  chakraDeployed: boolean;
  isAnalyzing: boolean;
  currentStepLabel?: string;
  onOpenWorkspace: () => void;
  onVastuChakra: () => void;
  onRunAnalysis: () => void;
  onGenerateReport: () => void;
  onUploadBlueprint: () => void;
  onShowAdvancedRibbon: () => void;
  onNavigateDashboard?: () => void;
  onOpenLanguageSettings?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const VastuClientToolbar: React.FC<VastuClientToolbarProps> = ({
  canvasTheme,
  canRunAnalysis,
  runButtonLabel,
  canGenerateReport,
  canAddChakra,
  chakraDeployed,
  isAnalyzing,
  currentStepLabel,
  onOpenWorkspace,
  onVastuChakra,
  onRunAnalysis,
  onGenerateReport,
  onUploadBlueprint,
  onShowAdvancedRibbon,
  onNavigateDashboard,
  onOpenLanguageSettings,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = canvasTheme === "dark";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const glass = isDark
    ? "bg-[#0a0e16]/80 border-white/10 text-slate-100"
    : "bg-white/80 border-slate-200/80 text-slate-900";

  return (
    <div className="fixed top-3 left-3 right-3 z-40 flex items-center justify-between gap-3 pointer-events-none">
      {/* Brand + home */}
      <div
        className={`pointer-events-auto flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border shadow-lg ${glass}`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        {onNavigateDashboard && (
          <button
            type="button"
            onClick={onNavigateDashboard}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"
            }`}
            title="Dashboard"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
        <div className="hidden sm:block pr-1">
          <p className="text-[9px] uppercase tracking-[0.15em] font-semibold text-slate-400 leading-none">
            URJAFLUX
          </p>
          <p className={`text-xs font-semibold leading-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Vastu
          </p>
        </div>
      </div>

      {/* Centre — language + step hint */}
      <div className="pointer-events-auto flex items-center gap-2">
        <LanguageSelector compact onOpenSettings={onOpenLanguageSettings} />
        {currentStepLabel && (
          <div
            className={`hidden md:flex items-center px-4 py-1.5 rounded-full border text-xs font-medium ${glass}`}
            style={{ backdropFilter: "blur(20px)" }}
          >
            <span className="text-slate-400 mr-1.5">Now:</span>
            <span className={isDark ? "text-slate-200" : "text-slate-700"}>{currentStepLabel}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className={`pointer-events-auto flex items-center gap-1.5 px-2 py-1.5 rounded-2xl border shadow-lg ${glass}`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        {onUndo && onRedo && (
          <div
            className={`flex items-center gap-0.5 pr-1.5 mr-0.5 border-r ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`p-1.5 rounded-xl transition-colors ${
                canUndo
                  ? isDark
                    ? "hover:bg-white/10 text-slate-300"
                    : "hover:bg-slate-100 text-slate-600"
                  : "opacity-35 cursor-not-allowed text-slate-400"
              }`}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={`p-1.5 rounded-xl transition-colors ${
                canRedo
                  ? isDark
                    ? "hover:bg-white/10 text-slate-300"
                    : "hover:bg-slate-100 text-slate-600"
                  : "opacity-35 cursor-not-allowed text-slate-400"
              }`}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={onOpenWorkspace}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600"
          }`}
          title="Workspace"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline">Workspace</span>
        </button>

        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={!canRunAnalysis || isAnalyzing}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            canRunAnalysis && !isAnalyzing
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
              : isDark
              ? "bg-white/5 text-slate-500 cursor-not-allowed"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="hidden md:inline">
            {isAnalyzing ? "Analyzing…" : canRunAnalysis ? "Run Analysis" : runButtonLabel}
          </span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"
            }`}
            aria-label="More actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-xl py-1 z-50 text-sm overflow-hidden ${
                isDark
                  ? "bg-[#0c1018]/95 border-white/10 text-slate-200"
                  : "bg-white/95 border-slate-200 text-slate-800"
              }`}
              style={{ backdropFilter: "blur(20px)" }}
            >
              <button
                type="button"
                onClick={() => {
                  onUploadBlueprint();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Blueprint
              </button>
              <button
                type="button"
                onClick={() => {
                  onVastuChakra();
                  setMenuOpen(false);
                }}
                disabled={!canAddChakra && !chakraDeployed}
                className="w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Compass className="w-3.5 h-3.5" />
                Vastu Chakra
              </button>
              <button
                type="button"
                onClick={() => {
                  onGenerateReport();
                  setMenuOpen(false);
                }}
                disabled={!canGenerateReport}
                className="w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileText className="w-3.5 h-3.5" />
                Generate Report
              </button>
              <div className={`my-1 border-t ${isDark ? "border-white/10" : "border-slate-100"}`} />
              <button
                type="button"
                onClick={() => {
                  onShowAdvancedRibbon();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 hover:bg-slate-500/10"
              >
                <Wrench className="w-3.5 h-3.5" />
                Advanced Tools
                <ChevronDown className="w-3 h-3 ml-auto opacity-50" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VastuClientToolbar;
