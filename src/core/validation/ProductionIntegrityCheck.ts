/**
 * URJAFLUX AI OS - Production Integrity Checker
 * Phase 8: Scans customer-facing codebase for prohibited demo placeholders, hardcoded scores, or synthetic fallbacks.
 */

import fs from "fs";
import path from "path";

export interface IntegrityViolation {
  filePath: string;
  lineNumber: number;
  lineContent: string;
  prohibitedPattern: string;
}

export class ProductionIntegrityCheck {
  private static PROHIBITED_PATTERNS = [
    { pattern: "ENT-KITCHEN-01", description: "Hardcoded Kitchen Demo Entity" },
    { pattern: "ENT-BEDROOM-01", description: "Hardcoded Bedroom Demo Entity" },
    { pattern: "ENT-ENTRANCE-01", description: "Hardcoded Entrance Demo Entity" },
    { pattern: "ENT-TOILET-01", description: "Hardcoded Toilet Demo Entity" },
    { pattern: "overallScore - 18", description: "Synthetic Comparison Score Subtraction" },
    { pattern: "hasExecuted ? 68 : 0", description: "Hardcoded 68 Score Mock" },
  ];

  private static CUSTOMER_FACING_FILES = [
    "src/components/vastu/ReportPanel.tsx",
    "src/components/vastu/EvaluationCoveragePanel.tsx",
    "src/components/vastu/ConsultantSuitePanel.tsx",
    "src/components/vastu/PropertyRecognitionPanel.tsx",
    "src/components/vastu/PositiveNegativeAuditPanel.tsx",
    "src/components/vastu/WorkspaceLayout.tsx"
  ];

  public static runCheck(baseDir: string = process.cwd()): {
    passed: boolean;
    violations: IntegrityViolation[];
  } {
    const violations: IntegrityViolation[] = [];

    for (const relativePath of this.CUSTOMER_FACING_FILES) {
      const fullPath = path.join(baseDir, relativePath);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        for (const rule of this.PROHIBITED_PATTERNS) {
          if (line.includes(rule.pattern)) {
            violations.push({
              filePath: relativePath,
              lineNumber: index + 1,
              lineContent: line.trim(),
              prohibitedPattern: `${rule.pattern} (${rule.description})`
            });
          }
        }
      });
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }
}
