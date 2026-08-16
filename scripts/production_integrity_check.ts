import { ProductionIntegrityCheck } from "../src/core/validation/ProductionIntegrityCheck";

console.log("🔍 URJAFLUX AI OS — Running Production Integrity Check...");

const result = ProductionIntegrityCheck.runCheck();

if (!result.passed) {
  console.error("❌ PRODUCTION INTEGRITY CHECK FAILED! Prohibited customer-facing placeholders found:");
  result.violations.forEach(v => {
    console.error(`   - [${v.filePath}:${v.lineNumber}] Pattern: ${v.prohibitedPattern}`);
    console.error(`     Code: "${v.lineContent}"`);
  });
  process.exit(1);
} else {
  console.log("✅ PRODUCTION INTEGRITY CHECK PASSED. Zero prohibited customer-facing placeholders found.");
  process.exit(0);
}
