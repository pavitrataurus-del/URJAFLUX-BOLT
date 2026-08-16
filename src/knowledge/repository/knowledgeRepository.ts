import { KnowledgeItem, KnowledgeCategory } from "../types/knowledgeTypes";
import { KnowledgeRegistry } from "../registry/knowledgeRegistry";

/**
 * Deep freezes a knowledge item to enforce immutability.
 */
function freezeItem(item: KnowledgeItem): Readonly<KnowledgeItem> {
  const frozen = {
    ...item,
    references: Object.freeze([...item.references]),
    metadata: Object.freeze({
      ...item.metadata,
      tags: Object.freeze([...item.metadata.tags])
    })
  };
  return Object.freeze(frozen);
}

/**
 * Returns an immutable, read-only collection of all items across active registered packs.
 */
export function getAllActiveItems(): readonly Readonly<KnowledgeItem>[] {
  const activePacks = KnowledgeRegistry.getActivePacks();
  const items: KnowledgeItem[] = [];
  for (const pack of activePacks) {
    if (pack.items) {
      items.push(...pack.items);
    }
  }
  return Object.freeze(items.map(freezeItem));
}

/**
 * Returns an immutable collection of items filtered by category (case-insensitive).
 */
export function findItemsByCategory(category: KnowledgeCategory): readonly Readonly<KnowledgeItem>[] {
  const items = getAllActiveItems();
  const catLower = (category || "").toLowerCase();
  return Object.freeze(items.filter((item) => (item.category || "").toLowerCase() === catLower));
}

/**
 * Returns an immutable collection of items associated with a specific source ID (case-insensitive).
 */
export function findItemsBySource(sourceId: string): readonly Readonly<KnowledgeItem>[] {
  const items = getAllActiveItems();
  const srcLower = (sourceId || "").toLowerCase();
  return Object.freeze(
    items.filter((item) =>
      (item.references || []).some((ref) => (ref.sourceId || "").toLowerCase() === srcLower)
    )
  );
}

/**
 * Returns an immutable collection of items containing any of the given tags (case-insensitive).
 */
export function findItemsByTags(tags: string[]): readonly Readonly<KnowledgeItem>[] {
  if (!tags || tags.length === 0) return Object.freeze([]);
  const lowercaseTags = tags.map((t) => (t || "").toLowerCase());
  const items = getAllActiveItems();
  
  return Object.freeze(
    items.filter((item) =>
      (item.metadata?.tags || []).some((tag) => lowercaseTags.includes((tag || "").toLowerCase()))
    )
  );
}

/**
 * Returns an immutable collection of items filtered by version.
 */
export function findItemsByVersion(version: string): readonly Readonly<KnowledgeItem>[] {
  const items = getAllActiveItems();
  return Object.freeze(items.filter((item) => item.metadata.version === version));
}

export const KnowledgeRepository = {
  getAllActiveItems,
  findItemsByCategory,
  findItemsBySource,
  findItemsByTags,
  findItemsByVersion
};
