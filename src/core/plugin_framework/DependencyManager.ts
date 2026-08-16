import { PluginRegistry } from "./PluginRegistry";
import { PluginDependency } from "./types";

export interface DependencyValidationResult {
  valid: boolean;
  missing: string[];
  conflicts: string[];
  circularPath?: string[];
}

export class DependencyManager {
  private static instance: DependencyManager | null = null;

  private constructor() {}

  public static getInstance(): DependencyManager {
    if (!DependencyManager.instance) {
      DependencyManager.instance = new DependencyManager();
    }
    return DependencyManager.instance;
  }

  /**
   * Evaluates if a given plugin's manifest is compatible with currently installed plugins.
   */
  public validateDependencies(pluginId: string, dependencies: PluginDependency[]): DependencyValidationResult {
    const registry = PluginRegistry.getInstance();
    const installed = registry.getPlugins();

    const missing: string[] = [];
    const conflicts: string[] = [];

    // 1. Basic validation
    for (const dep of dependencies) {
      const target = installed.find(p => p.id === dep.pluginId);
      if (!target) {
        if (!dep.optional) {
          missing.push(`${dep.pluginId} (Constraint: ${dep.versionConstraint})`);
        }
        continue;
      }

      // Check version compatibility constraint
      // Simple parse: compare major version (or exact match for simulation)
      const targetVer = parseFloat(target.currentVersion);
      if (dep.versionConstraint.includes(">")) {
        const match = dep.versionConstraint.match(/>=?([0-9.]+)/);
        if (match && targetVer < parseFloat(match[1])) {
          conflicts.push(`Version conflict: ${target.name} installed version is v${target.currentVersion}, requires ${dep.versionConstraint}`);
        }
      }
    }

    // 2. Circular dependency check
    const circularPath = this.detectCircularDependency(pluginId, dependencies);

    return {
      valid: missing.length === 0 && conflicts.length === 0 && !circularPath,
      missing,
      conflicts,
      circularPath
    };
  }

  /**
   * Helper DFS algorithm to find circular paths in the dependency tree.
   */
  private detectCircularDependency(pluginId: string, dependencies: PluginDependency[]): string[] | undefined {
    const registry = PluginRegistry.getInstance();
    const visited = new Set<string>();
    const stack = [pluginId];

    const checkNode = (currentId: string, currentDeps: PluginDependency[]): string[] | undefined => {
      visited.add(currentId);

      for (const dep of currentDeps) {
        if (dep.pluginId === pluginId) {
          // Circle detected! Return cycle list
          return [...stack, dep.pluginId];
        }

        if (!visited.has(dep.pluginId)) {
          const target = registry.getPlugins().find(p => p.id === dep.pluginId);
          if (target) {
            stack.push(dep.pluginId);
            const cycle = checkNode(dep.pluginId, target.manifest.dependencies);
            if (cycle) return cycle;
            stack.pop();
          }
        }
      }

      return undefined;
    };

    return checkNode(pluginId, dependencies);
  }

  /**
   * Formulates a sequential planning path to safely upgrade or install an array of items.
   */
  public generateUpgradePlanner(pluginId: string): string[] {
    const registry = PluginRegistry.getInstance();
    const plugin = registry.getPlugins().find(p => p.id === pluginId);
    if (!plugin) return [];

    const plan: string[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const target = registry.getPlugins().find(p => p.id === id);
      if (target) {
        target.manifest.dependencies.forEach(d => traverse(d.pluginId));
      }
      plan.push(id);
    };

    traverse(pluginId);
    return plan;
  }
}
