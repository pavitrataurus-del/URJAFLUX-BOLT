import React, { useState } from "react";
import { 
  Terminal, 
  Code2, 
  Download, 
  Play, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  RotateCw, 
  Globe, 
  Copy 
} from "lucide-react";
import { SdkMetadata, CliCommandDef } from "../../types/developerPlatform";
import { OFFICIAL_SDKS, CLI_COMMAND_DEFS } from "../../services/developer_platform/developerPlatformService";

export const SdkAndCliStudio: React.FC = () => {
  const [sdks] = useState<SdkMetadata[]>(OFFICIAL_SDKS);
  const [selectedSdk, setSelectedSdk] = useState<SdkMetadata>(OFFICIAL_SDKS[0]);
  const [cliCommands] = useState<CliCommandDef[]>(CLI_COMMAND_DEFS);
  const [activeCliCommand, setActiveCliCommand] = useState<string>("urjaflux doctor");
  
  const [terminalInput, setTerminalInput] = useState("urjaflux doctor --verbose");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "UrjaFlux CLI v3.2.0-GA initialized.",
    "Type 'urjaflux doctor' or click a command preset above to test local execution."
  ]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunCliCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!terminalInput) return;

    setIsExecuting(true);
    const newLogs = [...terminalLogs, `$ ${terminalInput}`];
    setTerminalLogs(newLogs);

    setTimeout(() => {
      let outputLines: string[] = [];
      if (terminalInput.includes("doctor")) {
        outputLines = [
          "[✓] Node.js Runtime: v20.11.0 (Supported)",
          "[✓] UrjaFlux CLI Version: 3.2.0-GA",
          "[✓] Local Dev Sandbox Port: 3000 (Open)",
          "[✓] Auth Profile 'enterprise-dev': Valid token (pavitra@urjaflux.io)",
          "[✓] Network Latency to UrjaFlux API: 18ms",
          "Result: ALL SYSTEMS OPERATIONAL (Ready for plugin development)"
        ];
      } else if (terminalInput.includes("login")) {
        outputLines = [
          "Opening browser OAuth2 authorization window...",
          "Authenticated as Super Admin (pavitra@urjaflux.io)",
          "Profile token saved to ~/.urjaflux/config.json"
        ];
      } else if (terminalInput.includes("project")) {
        outputLines = [
          "Creating UrjaFlux Plugin Project 'my-cad-plugin'...",
          "Template: cad-sync (TypeScript + Vite + Tailwind)",
          "Writing manifest.json with required CAD permissions...",
          "Installing dependencies (@urjaflux/sdk-ts@^3.2.0)...",
          "Project initialized! Run 'cd my-cad-plugin && urjaflux plugin dev' to start local sandbox."
        ];
      } else if (terminalInput.includes("digital-twin")) {
        outputLines = [
          "Querying Zone ZONE-NE-01 Digital Twin Telemetry...",
          "Actuator 04 State: OPTIMAL (22.4°C, 45.2% Humidity)",
          "Magnetic Grid MicroTesla: 42.1 (Vastu Compliant)",
          "Streaming telemetry frames (press Ctrl+C to stop)..."
        ];
      } else if (terminalInput.includes("deploy")) {
        outputLines = [
          "Packaging plugin extension artifact...",
          "Validating manifest signature against workspace RSA key...",
          "Uploading @urjaflux/plugin-autocad-sync@2.1.0 to UrjaFlux Package Registry...",
          "Artifact deployed successfully to channel 'BETA'!"
        ];
      } else {
        outputLines = [
          `Executing command: ${terminalInput}`,
          "Process completed with exit code 0."
        ];
      }

      setTerminalLogs(prev => [...prev, ...outputLines]);
      setIsExecuting(false);
    }, 600);
  };

  const codeSnippets: Record<string, string> = {
    TYPESCRIPT: `import { UrjaFluxClient } from "@urjaflux/sdk-ts";

const client = new UrjaFluxClient({
  apiKey: process.env.URJAFLUX_API_KEY,
  environment: "production",
  autoRetry: true
});

// Stream real-time Digital Twin Telemetry
const stream = await client.digitalTwin.subscribeTelemetry({
  zoneId: "ZONE-NE-01"
});

stream.on("data", (frame) => {
  console.log("Telemetry Frame:", frame.temperature, frame.vastuGridScore);
});`,
    PYTHON: `from urjaflux import UrjaFluxClient

client = UrjaFluxClient(
    api_key="urja_live_9f8a...",
    environment="production"
)

# Execute automated Vastu AI Audit
result = client.vastu.run_audit(
    cad_file_id="CAD-2026-FLOOR-01",
    include_recommendations=True
)

print(f"Compliance Score: {result.score}%")`,
    JAVA: `import io.urjaflux.sdk.UrjaFluxClient;
import io.urjaflux.sdk.models.VastuAuditResult;

UrjaFluxClient client = new UrjaFluxClient.Builder()
    .apiKey(System.getenv("URJAFLUX_API_KEY"))
    .build();

VastuAuditResult result = client.vastu().runAudit("CAD-2026-FLOOR-01");
System.out.println("Vastu Compliance: " + result.getComplianceScore());`,
    DOTNET: `using UrjaFlux.Sdk;

var client = new UrjaFluxClient(new UrjaFluxConfig {
    ApiKey = Environment.GetEnvironmentVariable("URJAFLUX_API_KEY")
});

var response = await client.Cad.GetLayersAsync("CAD-2026-FLOOR-01");
Console.WriteLine($"Extracted {response.Layers.Count} BIM layers.");`,
    GO: `package main

import (
    "fmt"
    "github.com/urjaflux/urjaflux-go-sdk"
)

func main() {
    client := urjaflux.NewClient("urja_live_9f8a...")
    res, err := client.DigitalTwin.GetZoneStatus("ZONE-NE-01")
    if err != nil {
        panic(err)
    }
    fmt.Printf("Zone Status: %s\\n", res.Status)
}`
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Code2 className="w-4 h-4" />
            <span>MODULE 2 & 3 • OFFICIAL SDK PLATFORM & CLI STUDIO</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Language SDKs & UrjaFlux CLI</h2>
          <p className="text-xs text-slate-400 mt-1">
            Production SDKs across TypeScript, Python, Java, .NET, and Go, plus interactive developer CLI terminal commands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-amber-300 border border-slate-800 font-bold">
            CLI VERSION: v3.2.0-GA
          </span>
        </div>
      </div>

      {/* SECTION 1: SDK LANGUAGE MATRIX */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Official SDK Language Matrix & Type Declarations</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {sdks.map(sdk => {
            const isSelected = selectedSdk.language === sdk.language;
            return (
              <button
                key={sdk.language}
                onClick={() => setSelectedSdk(sdk)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1 ${
                  isSelected 
                    ? "bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{sdk.language}</span>
                  <span className="text-[9px] text-amber-300 font-bold">{sdk.sdkType}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">{sdk.version}</div>
                <div className="text-[9px] text-slate-500">{sdk.monthlyDownloads.toLocaleString()} dl/mo</div>
              </button>
            );
          })}
        </div>

        {/* Selected SDK Code Snippet */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-emerald-400 font-bold text-sm">{selectedSdk.language} SDK Code Example</span>
              <p className="text-slate-400 text-xs font-sans mt-0.5">Package Name: {selectedSdk.packageUrl}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                {selectedSdk.supportsWebsocket ? "✓ WebSocket Client" : "REST Only"}
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                {selectedSdk.supportsRetryLogic ? "✓ Exponential Retry" : "Manual Retry"}
              </span>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-850 text-emerald-300 overflow-x-auto text-xs leading-relaxed">
            <code>{codeSnippets[selectedSdk.language]}</code>
          </pre>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE CLI TERMINAL */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Interactive UrjaFlux Developer CLI Execution Studio</span>
        </h3>

        {/* Command Preset Chips */}
        <div className="flex flex-wrap gap-2">
          {cliCommands.map(cmd => (
            <button
              key={cmd.command}
              onClick={() => {
                setTerminalInput(cmd.exampleUsage);
                setActiveCliCommand(cmd.command);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                activeCliCommand === cmd.command 
                  ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/50" 
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {cmd.command}
            </button>
          ))}
        </div>

        {/* Terminal Output Screen */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-slate-400 font-bold ml-2">bash — urjaflux-cli terminal</span>
            </div>
            <button 
              onClick={() => setTerminalLogs(["UrjaFlux CLI terminal logs cleared."])}
              className="hover:text-white"
            >
              Clear Logs
            </button>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-850 h-56 overflow-y-auto space-y-1 text-slate-300">
            {terminalLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={
                  log.startsWith("$") 
                    ? "text-emerald-400 font-bold" 
                    : log.includes("[✓]") 
                    ? "text-emerald-300" 
                    : log.includes("Error") 
                    ? "text-rose-400" 
                    : "text-slate-300 font-sans text-[11px]"
                }
              >
                {log}
              </div>
            ))}
          </div>

          {/* Terminal Input Line */}
          <form onSubmit={handleRunCliCommand} className="flex items-center gap-2 pt-1">
            <span className="text-emerald-400 font-bold">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              placeholder="Enter CLI command (e.g. urjaflux doctor --verbose)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isExecuting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isExecuting ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>Run</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
