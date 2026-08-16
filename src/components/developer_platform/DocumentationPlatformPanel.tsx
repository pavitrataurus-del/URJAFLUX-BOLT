import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  Code2, 
  FileText, 
  Layers, 
  Boxes, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle 
} from "lucide-react";

export const DocumentationPlatformPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<"REST" | "SDK" | "PLUGIN" | "TWIN" | "MIGRATION">("REST");
  const [searchQuery, setSearchQuery] = useState("");

  const docArticles = [
    {
      category: "REST",
      title: "Authentication & OAuth2 PKCE Flows",
      summary: "Learn how to obtain Bearer API tokens and configure OAuth2 refresh loops for web and desktop clients.",
      codeSnippet: "GET /api/v3/auth/token\nAuthorization: Bearer <URJAFLUX_SECRET_KEY>"
    },
    {
      category: "REST",
      title: "CAD Layer Extraction & Wall Vector API",
      summary: "Query DWG/DXF/Revit file geometry layers and obtain Vastu compass coordinates for spatial rendering.",
      codeSnippet: "POST /api/v3/cad/extract-layers\nBody: { fileId: 'CAD-2026-FLOOR-01' }"
    },
    {
      category: "SDK",
      title: "TypeScript SDK Quickstart (@urjaflux/sdk-ts)",
      summary: "Installation, client initialization, automated retries, and WebSocket telemetry streaming.",
      codeSnippet: "npm install @urjaflux/sdk-ts\nimport { UrjaFluxClient } from '@urjaflux/sdk-ts';"
    },
    {
      category: "SDK",
      title: "Python SDK Quickstart (urjaflux-sdk)",
      summary: "Pythonic wrappers for batch Vastu AI audits, CAD geometry parsing, and automated reporting.",
      codeSnippet: "pip install urjaflux-sdk\nfrom urjaflux import UrjaFluxClient"
    },
    {
      category: "PLUGIN",
      title: "Plugin Lifecycle Hooks & Event Subscriptions",
      summary: "Declare onLoad, onCadFileParsed, and onTelemetryDataReceived hooks inside plugin.manifest.json.",
      codeSnippet: "export function onLoad(ctx: PluginContext) {\n  ctx.subscribe('twin:telemetry');\n}"
    },
    {
      category: "TWIN",
      title: "Digital Twin Sensor Streaming via WebSockets",
      summary: "Connect to wss://api.urjaflux.io/twin/v3/stream for live temperature, humidity, and magnetic field frames.",
      codeSnippet: "wss://api.urjaflux.io/twin/v3/stream?zoneId=ZONE-NE-01"
    },
    {
      category: "MIGRATION",
      title: "v2.x to v3.0.0-GA Migration Guide",
      summary: "Upgrading legacy REST endpoints to v3.0.0-GA, adopting multi-agent routing, and configuring human approval thresholds.",
      codeSnippet: "// Legacy v2.0 endpoint: /api/v2/cad\n// Upgraded v3.0 endpoint: /api/v3/cad/layers"
    }
  ];

  const filteredDocs = docArticles.filter(doc => 
    doc.category === activeCategory &&
    (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>MODULE 6 • DOCUMENTATION PLATFORM & GUIDES</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">UrjaFlux Developer Documentation Hub</h2>
          <p className="text-xs text-slate-400 mt-1">
            Auto-generated REST references, SDK quickstarts, Plugin PDK guides, and v3.0.0-GA migration assistants.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search docs..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {[
          { id: "REST", label: "REST API Docs" },
          { id: "SDK", label: "SDK Client Guides" },
          { id: "PLUGIN", label: "Plugin PDK Docs" },
          { id: "TWIN", label: "Digital Twin API" },
          { id: "MIGRATION", label: "v3.0 Migration Guide" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
              activeCategory === tab.id
                ? "bg-emerald-600 text-white"
                : "bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocs.map((doc, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between text-amber-300 font-bold text-[10px] uppercase">
              <span>{doc.category} REFERENCE</span>
              <span className="text-slate-500">Auto-Generated</span>
            </div>

            <h3 className="text-base font-bold text-white">{doc.title}</h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">{doc.summary}</p>

            <pre className="p-3 rounded-xl bg-slate-900 border border-slate-850 text-emerald-300 font-mono text-[11px] overflow-x-auto">
              <code>{doc.codeSnippet}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
