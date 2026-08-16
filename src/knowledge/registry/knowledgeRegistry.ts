import { KnowledgePack } from "../types/knowledgeTypes";
import { coreKnowledgePack } from "../packs/coreKnowledgePack";

// In-memory registry mapping pack ID to KnowledgePack state
const registry = new Map<string, KnowledgePack>();

// Bootstrapping default core knowledge pack on initialization
registry.set(coreKnowledgePack.id, { ...coreKnowledgePack });

/**
 * Register a new knowledge pack (supporting marketplace, user, AI Draft, DB, and cloud loads).
 */
export function registerPack(pack: KnowledgePack): void {
  if (!pack || !pack.id) {
    throw new Error("Invalid pack definition: Pack must have a unique 'id' property.");
  }
  // Store a clone of the pack to protect registry integrity
  registry.set(pack.id, {
    ...pack,
    items: pack.items ? [...pack.items] : []
  });
}

/**
 * Unregister an existing knowledge pack.
 */
export function unregisterPack(packId: string): boolean {
  return registry.delete(packId);
}

/**
 * Enable a registered pack.
 */
export function enablePack(packId: string): boolean {
  const pack = registry.get(packId);
  if (pack) {
    pack.enabled = true;
    return true;
  }
  return false;
}

/**
 * Disable a registered pack.
 */
export function disablePack(packId: string): boolean {
  const pack = registry.get(packId);
  if (pack) {
    pack.enabled = false;
    return true;
  }
  return false;
}

/**
 * Returns active (enabled) packs.
 */
export function getActivePacks(): readonly KnowledgePack[] {
  const active: KnowledgePack[] = [];
  for (const pack of registry.values()) {
    if (pack.enabled !== false) {
      active.push({ ...pack });
    }
  }
  return Object.freeze(active);
}

/**
 * Returns all installed/registered packs (enabled or disabled).
 */
export function getInstalledPacks(): readonly KnowledgePack[] {
  const all: KnowledgePack[] = [];
  for (const pack of registry.values()) {
    all.push({ ...pack });
  }
  return Object.freeze(all);
}

/**
 * Summary metadata of a registered pack.
 */
export interface PackMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  itemCount: number;
  enabled: boolean;
}

/**
 * Returns metadata of a specific pack if installed.
 */
export function getPackMetadata(packId: string): PackMetadata | null {
  const pack = registry.get(packId);
  if (!pack) return null;

  return {
    id: pack.id,
    name: pack.name,
    description: pack.description,
    version: pack.version,
    author: pack.author,
    category: pack.category,
    itemCount: pack.items ? pack.items.length : 0,
    enabled: pack.enabled !== false
  };
}

export const KnowledgeRegistry = {
  registerPack,
  unregisterPack,
  enablePack,
  disablePack,
  getActivePacks,
  getInstalledPacks,
  getPackMetadata
};
