import { KnowledgePack, KnowledgeItem, KnowledgeReference } from "../types/knowledgeTypes";

export interface KnowledgeValidationFailure {
  packId?: string;
  itemId?: string;
  issue: string;
}

/**
 * Validates if the version follows simple semver format.
 */
export function isValidSemver(version: string): boolean {
  if (typeof version !== "string") return false;
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version);
}

/**
 * Validates an individual reference's attributes.
 */
export function validateReference(ref: KnowledgeReference): string[] {
  const issues: string[] = [];
  if (!ref || typeof ref !== "object") {
    issues.push("Reference is null or not an object");
    return issues;
  }
  if (!ref.sourceId || typeof ref.sourceId !== "string" || ref.sourceId.trim() === "") {
    issues.push("Reference is missing a valid 'sourceId'");
  }
  return issues;
}

/**
 * Validates an individual knowledge item.
 */
export function validateKnowledgeItem(item: KnowledgeItem): string[] {
  const issues: string[] = [];
  if (!item || typeof item !== "object") {
    issues.push("Item is null or not an object");
    return issues;
  }

  if (!item.id || typeof item.id !== "string" || item.id.trim() === "") {
    issues.push("Item is missing 'id' or id is not a string");
  }

  if (!item.category || typeof item.category !== "string" || item.category.trim() === "") {
    issues.push("Item is missing 'category' or category is not a string");
  }

  if (!item.title || typeof item.title !== "string" || item.title.trim() === "") {
    issues.push("Item is missing 'title' or title is not a string");
  }

  if (typeof item.content !== "string") {
    issues.push("Item content must be a string");
  }

  // Validate metadata existence and attributes
  if (!item.metadata || typeof item.metadata !== "object") {
    issues.push("Item is missing 'metadata' object");
  } else {
    const meta = item.metadata;
    if (!meta.version || typeof meta.version !== "string") {
      issues.push("Item metadata is missing 'version'");
    } else if (!isValidSemver(meta.version)) {
      issues.push(`Item metadata contains invalid version format: '${meta.version}'`);
    }

    if (!Array.isArray(meta.tags)) {
      issues.push("Item metadata 'tags' must be an array of strings");
    } else {
      for (const tag of meta.tags) {
        if (typeof tag !== "string") {
          issues.push("Item metadata 'tags' contains non-string elements");
        }
      }
    }

    if (!meta.createdAt || typeof meta.createdAt !== "string") {
      issues.push("Item metadata is missing 'createdAt'");
    }
    if (!meta.updatedAt || typeof meta.updatedAt !== "string") {
      issues.push("Item metadata is missing 'updatedAt'");
    }
  }

  // Validate references array
  if (!Array.isArray(item.references)) {
    issues.push("Item 'references' must be an array");
  } else {
    for (const ref of item.references) {
      const refIssues = validateReference(ref);
      for (const issue of refIssues) {
        issues.push(`Malformed reference: ${issue}`);
      }
    }
  }

  return issues;
}

/**
 * Validates a complete KnowledgePack and all its items.
 */
export function validateKnowledgePack(pack: KnowledgePack): {
  isValid: boolean;
  failures: KnowledgeValidationFailure[];
} {
  const failures: KnowledgeValidationFailure[] = [];

  if (!pack || typeof pack !== "object") {
    failures.push({ issue: "Pack is null or not an object" });
    return { isValid: false, failures };
  }

  const packId = pack.id || "unknown";

  if (!pack.id || typeof pack.id !== "string" || pack.id.trim() === "") {
    failures.push({ issue: "Pack is missing a valid 'id'" });
  }

  if (!pack.name || typeof pack.name !== "string" || pack.name.trim() === "") {
    failures.push({ packId, issue: "Pack is missing a valid 'name'" });
  }

  if (!pack.version || typeof pack.version !== "string") {
    failures.push({ packId, issue: "Pack is missing 'version'" });
  } else if (!isValidSemver(pack.version)) {
    failures.push({ packId, issue: `Pack contains invalid version format: '${pack.version}'` });
  }

  if (!pack.author || typeof pack.author !== "string" || pack.author.trim() === "") {
    failures.push({ packId, issue: "Pack is missing a valid 'author'" });
  }

  if (!pack.category || typeof pack.category !== "string" || pack.category.trim() === "") {
    failures.push({ packId, issue: "Pack is missing 'category'" });
  }

  if (!Array.isArray(pack.items)) {
    failures.push({ packId, issue: "Pack 'items' must be an array" });
  } else {
    const seenItemIds = new Set<string>();

    for (const item of pack.items) {
      const itemId = item?.id || "unknown";

      // Duplicate item ID verification within the pack
      if (item && item.id) {
        if (seenItemIds.has(item.id)) {
          failures.push({
            packId,
            itemId: item.id,
            issue: `Duplicate item ID '${item.id}' found in pack`
          });
        }
        seenItemIds.add(item.id);
      }

      // Detailed item property audits
      const itemIssues = validateKnowledgeItem(item);
      for (const issue of itemIssues) {
        failures.push({
          packId,
          itemId,
          issue
        });
      }
    }
  }

  return {
    isValid: failures.length === 0,
    failures
  };
}

export const KnowledgeValidator = {
  isValidSemver,
  validateReference,
  validateKnowledgeItem,
  validateKnowledgePack
};
