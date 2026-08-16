import React, { useState } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Compass, 
  HelpCircle, 
  Video, 
  ExternalLink, 
  Award, 
  Sparkles, 
  ArrowRight 
} from "lucide-react";
import { InteractiveTutorialStep } from "../../types/customerLifecycle";

const INITIAL_TUTORIAL_STEPS: InteractiveTutorialStep[] = [
  { id: "step-1", title: "Initialize First Digital Twin Workspace", description: "Learn how to import IFC/BIM files and configure spatial coordinates.", category: "DIGITAL_TWIN", completed: true },
  { id: "step-2", title: "Configure CAD DXF Arc Snapping & Layers", description: "Set up 2D drafting layers and Vastu orientation markers.", category: "CAD", completed: true },
  { id: "step-3", title: "Connect Telemetry IoT Stream", description: "Bind OPC-UA / MQTT time-series data to 3D spatial twin components.", category: "DIGITAL_TWIN", completed: false },
  { id: "step-4", title: "Run Gemini Grounded Vastu AI Audit", description: "Query spatial intelligence engine for structural compliance scoring.", category: "KNOWLEDGE", completed: false },
  { id: "step-5", title: "Configure SAML 2.0 / OAuth Enterprise SSO", description: "Set up role-based access control and tenant security policies.", category: "ADMIN", completed: false }
];

export const InAppTrainingCenter: React.FC = () => {
  const [steps, setSteps] = useState<InteractiveTutorialStep[]>(INITIAL_TUTORIAL_STEPS);
  const [activeTab, setActiveTab] = useState<"TUTORIALS" | "GUIDED_TOUR" | "ADMIN_PATH" | "KNOWLEDGE_LINKS">("TUTORIALS");
  const [activeTourStep, setActiveTourStep] = useState(0);

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const tourSteps = [
    { title: "Welcome to URJAFLUX AI OS", desc: "Your enterprise platform combines CAD drafting, 3D Digital Twins, Vastu AI audits, and isolated cloud telemetry." },
    { title: "Top Workspace Navigation", desc: "Switch seamlessly between Enterprise Operations, CAD Blueprints, Digital Twins, and Admin Control." },
    { title: "Grounded Gemini AI Assistant", desc: "Interact with grounded spatial intelligence to query twin metrics, execute CAD rules, and generate automated compliance reports." },
    { title: "Offline Cryptographic Security", desc: "Your license and operational telemetry run securely with optional air-gapped RSA signature verification." }
  ];

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("TUTORIALS")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "TUTORIALS"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Interactive Tutorials ({completedCount}/{steps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("GUIDED_TOUR")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "GUIDED_TOUR"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Guided Platform Tour</span>
          </button>
          <button
            onClick={() => setActiveTab("ADMIN_PATH")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "ADMIN_PATH"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Administrator Learning Path</span>
          </button>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 pr-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Interactive Onboarding Progress: {progressPercent}%</span>
        </div>
      </div>

      {/* TUTORIALS VIEW */}
      {activeTab === "TUTORIALS" && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold text-sm">First Run Experience (FRE) Onboarding Track</span>
              <span className="text-emerald-400 font-bold">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {steps.map(s => (
              <div
                key={s.id}
                onClick={() => toggleStep(s.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between font-mono text-xs ${
                  s.completed
                    ? "bg-slate-900/60 border-slate-800/80 text-slate-300"
                    : "bg-slate-900 border-emerald-500/40 text-white shadow-md shadow-emerald-500/5 hover:border-emerald-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    s.completed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-500"
                  }`}>
                    {s.completed ? "✓" : "•"}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 text-[10px] font-bold uppercase mr-2 border border-slate-800">
                      {s.category}
                    </span>
                    <span className={`font-bold ${s.completed ? "line-through text-slate-400" : "text-white"}`}>{s.title}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.description}</p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-xl text-[10px] font-bold ${
                  s.completed ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-300"
                }`}>
                  {s.completed ? "Completed" : "Start Exercise"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GUIDED TOUR VIEW */}
      {activeTab === "GUIDED_TOUR" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <Compass className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
              Step {activeTourStep + 1} of {tourSteps.length}
            </span>
            <h2 className="text-2xl font-bold font-mono text-white mt-1">{tourSteps[activeTourStep].title}</h2>
            <p className="text-xs text-slate-300 mt-2 font-sans">{tourSteps[activeTourStep].desc}</p>
          </div>

          <div className="flex justify-center gap-2">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  activeTourStep === i ? "w-8 bg-emerald-500" : "w-2 bg-slate-800"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              disabled={activeTourStep === 0}
              onClick={() => setActiveTourStep(prev => prev - 1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold cursor-pointer disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveTourStep(prev => (prev + 1) % tourSteps.length)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
            >
              <span>{activeTourStep === tourSteps.length - 1 ? "Restart Tour" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ADMIN PATH VIEW */}
      {activeTab === "ADMIN_PATH" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Certified Administrator Learning Path</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Curriculum for system administrators to master multi-tenant isolation, security policies, and backup disaster recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold">Module A: Security & Compliance</div>
              <p className="text-slate-400 text-[11px]">SAML 2.0 / OAuth, Audit Logs, ISO 27001 policies & RBAC permission tags.</p>
              <div className="text-slate-500 text-[10px]">Status: Verified Certified</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold">Module B: Digital Twin & Telemetry</div>
              <p className="text-slate-400 text-[11px]">OPC-UA time-series pipelines, WebGL/Three.js rendering optimization & LOD level scaling.</p>
              <div className="text-slate-500 text-[10px]">Status: Verified Certified</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold">Module C: Backup & Disaster Recovery</div>
              <p className="text-slate-400 text-[11px]">RPO/RTO validation, point-in-time recovery & multi-region database failover testing.</p>
              <div className="text-slate-500 text-[10px]">Status: Verified Certified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
