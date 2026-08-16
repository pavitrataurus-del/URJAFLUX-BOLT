import { Finding, FindingSeverity } from "../types/findingTypes";

export interface FindingValidationFailure {
  findingId: string;
  issue: string;
}

/**
 * Audit checks a read-only list of findings to ensure structural and content compliance.
 */
export function validateFindings(findings: readonly Finding[]): {
  isValid: boolean;
  failures: FindingValidationFailure[];
} {
  const failures: FindingValidationFailure[] = [];
  const seenIds = new Set<string>();

  for (const finding of findings) {
    if (!finding) {
      failures.push({ findingId: "unknown", issue: "Finding is null or undefined" });
      continue;
    }

    const fid = finding.id || "unknown";

    // 1. Validate Duplicate Finding IDs
    if (finding.id) {
      if (seenIds.has(finding.id)) {
        failures.push({ findingId: fid, issue: `Duplicate finding ID detected: '${finding.id}'` });
      }
      seenIds.add(finding.id);
    } else {
      failures.push({ findingId: fid, issue: "Finding is missing a valid 'id' property" });
    }

    // 2. Validate Severity compliance
    if (!finding.severity) {
      failures.push({ findingId: fid, issue: "Finding is missing 'severity' property" });
    } else if (!Object.values(FindingSeverity).includes(finding.severity)) {
      failures.push({ findingId: fid, issue: `Invalid severity value: '${finding.severity}'` });
    }

    // 3. Validate Confidence numeric constraints
    if (finding.confidence === undefined || finding.confidence === null) {
      failures.push({ findingId: fid, issue: "Finding is missing 'confidence' property" });
    } else if (typeof finding.confidence !== "number" || isNaN(finding.confidence)) {
      failures.push({ findingId: fid, issue: "Finding confidence must be a valid number" });
    } else if (finding.confidence < 0.0 || finding.confidence > 1.0) {
      failures.push({ findingId: fid, issue: `Confidence must be between 0.0 and 1.0 (inclusive), got: ${finding.confidence}` });
    }

    // 4. Validate Missing/Malformed Evidence
    if (!finding.evidence || !Array.isArray(finding.evidence)) {
      failures.push({ findingId: fid, issue: "Finding 'evidence' must be an array" });
    } else if (finding.evidence.length === 0) {
      failures.push({ findingId: fid, issue: "Missing evidence: Finding must contain at least one evidence entry" });
    } else {
      for (let i = 0; i < finding.evidence.length; i++) {
        const ev = finding.evidence[i];
        if (!ev || typeof ev !== "object") {
          failures.push({ findingId: fid, issue: `Evidence at index ${i} is null or not an object` });
        } else {
          if (!ev.id || typeof ev.id !== "string" || ev.id.trim() === "") {
            failures.push({ findingId: fid, issue: `Evidence at index ${i} is missing a valid 'id'` });
          }
          if (!ev.type || typeof ev.type !== "string" || ev.type.trim() === "") {
            failures.push({ findingId: fid, issue: `Evidence at index ${i} is missing a valid 'type'` });
          }
          if (!ev.description || typeof ev.description !== "string" || ev.description.trim() === "") {
            failures.push({ findingId: fid, issue: `Evidence at index ${i} is missing a valid 'description'` });
          }
        }
      }
    }

    // 5. Validate Missing/Malformed References
    if (!finding.references || !Array.isArray(finding.references)) {
      failures.push({ findingId: fid, issue: "Finding 'references' must be an array" });
    } else if (finding.references.length === 0) {
      failures.push({ findingId: fid, issue: "Missing references: Finding must contain at least one reference entry" });
    } else {
      for (let i = 0; i < finding.references.length; i++) {
        const ref = finding.references[i];
        if (!ref || typeof ref !== "object") {
          failures.push({ findingId: fid, issue: `Reference at index ${i} is null or not an object` });
        } else {
          if (!ref.sourceId || typeof ref.sourceId !== "string" || ref.sourceId.trim() === "") {
            failures.push({ findingId: fid, issue: `Reference at index ${i} is missing a valid 'sourceId'` });
          }
        }
      }
    }
  }

  return {
    isValid: failures.length === 0,
    failures
  };
}

export const FindingValidator = {
  validateFindings
};
