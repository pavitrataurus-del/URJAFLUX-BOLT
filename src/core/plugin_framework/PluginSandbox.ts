import { PluginRegistry } from "./PluginRegistry";
import { PluginPermission, PluginHealth } from "./types";

export interface SandboxExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  telemetry: {
    cpuCycles: number;
    memoryAllocatedMb: number;
    networkCallsMade: number;
    executionTimeMs: number;
  };
}

export class PluginSandbox {
  private static instance: PluginSandbox | null = null;
  private healthCache: Record<string, PluginHealth> = {};

  private constructor() {
    this.seedDefaultHealthState();
  }

  public static getInstance(): PluginSandbox {
    if (!PluginSandbox.instance) {
      PluginSandbox.instance = new PluginSandbox();
    }
    return PluginSandbox.instance;
  }

  private seedDefaultHealthState() {
    this.healthCache = {
      "plg-vastu-ar-viewer": {
        pluginId: "plg-vastu-ar-viewer",
        status: "HEALTHY",
        cpuUsagePct: 2.4,
        memoryUsageMb: 12.8,
        responseTimeMs: 45,
        apiCallsCount: 1540,
        errorsCount: 0
      },
      "plg-chakra-sound-generator": {
        pluginId: "plg-chakra-sound-generator",
        status: "HEALTHY",
        cpuUsagePct: 5.1,
        memoryUsageMb: 24.1,
        responseTimeMs: 82,
        apiCallsCount: 420,
        errorsCount: 1,
        lastErrorMsg: "OscillatorNode frequency out of bounds"
      }
    };
  }

  public getHealth(pluginId: string): PluginHealth {
    if (!this.healthCache[pluginId]) {
      this.healthCache[pluginId] = {
        pluginId,
        status: "HEALTHY",
        cpuUsagePct: 0.1,
        memoryUsageMb: 2.5,
        responseTimeMs: 12,
        apiCallsCount: 0,
        errorsCount: 0
      };
    }
    return this.healthCache[pluginId];
  }

  public getAllHealthMetrics(): PluginHealth[] {
    return Object.values(this.healthCache);
  }

  /**
   * Safely execute a sandboxed task on behalf of a specific plugin.
   * Enforces declared permissions, catches exceptions, and computes resource overhead.
   */
  public executeTask(
    pluginId: string,
    actionName: string,
    payload: any,
    requestedPermissions: PluginPermission[]
  ): SandboxExecutionResult {
    const registry = PluginRegistry.getInstance();
    const plugin = registry.getPlugins().find(p => p.id === pluginId);

    const startTime = Date.now();
    const result: SandboxExecutionResult = {
      success: true,
      telemetry: {
        cpuCycles: Math.floor(Math.random() * 5000) + 1200,
        memoryAllocatedMb: +(5 + Math.random() * 15).toFixed(1),
        networkCallsMade: 0,
        executionTimeMs: 0
      }
    };

    // Initialize health metrics if missing
    const health = this.getHealth(pluginId);
    health.apiCallsCount += 1;

    // 1. Check if plugin is active and installed
    if (!plugin) {
      result.success = false;
      result.error = "Sandbox Error: Target plugin registry record not found.";
      return result;
    }

    if (plugin.isSuspended || plugin.status === "DISABLED") {
      result.success = false;
      result.error = `Sandbox Security Warning: Execution blocked. Plugin is currently ${plugin.status}.`;
      return result;
    }

    // 2. Validate Sandbox Permissions
    for (const permission of requestedPermissions) {
      const grant = plugin.permissions.find(g => g.permission === permission);
      if (!grant || !grant.granted) {
        // Enforce boundary: Block and audit immediately
        registry.logAudit({
          pluginId,
          userId: "sandbox-runtime",
          action: "SANDBOX_VIOLATION",
          severity: "CRITICAL",
          details: `BLOCKED sandbox task '${actionName}'. Tried to invoke unauthorized permission '${permission}'.`,
          status: "BLOCKED"
        });

        health.status = "DEGRADED";
        health.errorsCount += 1;
        health.lastErrorMsg = `Security exception: lack of permission ${permission}`;

        result.success = false;
        result.error = `Security Access Violation: Permission '${permission}' is not granted to this plugin. Request rejected.`;
        return result;
      }
    }

    // 3. Exception Isolation Simulation & Execution Mock
    try {
      // Simulate direct network restrictions
      if (requestedPermissions.includes(PluginPermission.NETWORK_ACCESS)) {
        result.telemetry.networkCallsMade += 1;
        if (payload?.url && payload.url.includes("unverified-domain.com")) {
          throw new Error("Sandbox Network Restriction: Host unverified or blacklisted in Domain-017 policies.");
        }
      }

      // Simulate a localized plugin failure
      if (payload?.simulateFailure) {
        throw new Error("Plugin core execution handler failed dynamically: Null pointer reference.");
      }

      // Simulate normal task completion output
      let finalString = `[SANDBOX RUNTIME v3.6] Task '${actionName}' completed successfully.\n`;
      if (pluginId === "plg-vastu-ar-viewer") {
        finalString += `Generated 3D mesh points of North-East zoning overlay. Intersected coordinates: 12.3, 44.5. Remedial recommendation overlay completed.`;
      } else if (pluginId === "plg-chakra-sound-generator") {
        finalString += `Synthesized active 528Hz Solfeggio soundwave loop. Active nodes: OscillatorNode, GainNode, StereoPannerNode. Total wave cycles outputted: 1420.`;
      } else {
        finalString += `Processed payload params: ${JSON.stringify(payload)}`;
      }

      result.output = finalString;

      // Update healthy performance metrics
      health.responseTimeMs = Math.round((health.responseTimeMs * 4 + (Date.now() - startTime)) / 5);
      health.cpuUsagePct = +(2 + Math.random() * 4).toFixed(1);
      health.memoryUsageMb = +(10 + Math.random() * 20).toFixed(1);
    } catch (err: any) {
      // Catch exceptions and safely isolate. Main thread remains active!
      result.success = false;
      result.error = `Plugin Isolated Crash: ${err.message || "Unknown execution panic."}`;

      registry.logAudit({
        pluginId,
        userId: "sandbox-compiler",
        action: "API_EXECUTION",
        severity: "WARNING",
        details: `Isolator intercepted uncaught error in task '${actionName}': ${err.message}`,
        status: "FAILED"
      });

      health.status = "DEGRADED";
      health.errorsCount += 1;
      health.lastErrorMsg = err.message || "Sandbox internal failure";
      health.lastCrashTime = new Date().toISOString();
    }

    result.telemetry.executionTimeMs = Date.now() - startTime;
    return result;
  }
}
