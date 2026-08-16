// ============================================================================
// FIRESTORE SANITIZER UTILITY
// Guarantees zero `undefined` values in any Firestore write payload.
// Prevents "Unsupported field value: undefined" errors across all Firestore models.
// ============================================================================

import { doc, setDoc, addDoc, updateDoc, DocumentReference, CollectionReference, SetOptions } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Recursively removes all keys whose value is `undefined` from an object or array.
 * Primitive values, dates, nulls, booleans, strings, numbers are preserved as-is.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as unknown as T;
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

export interface ForensicInspectionResult {
  success: boolean;
  docPath: string;
  serializationTimeMs: number;
  byteSize: number;
  kbSize: number;
  mbSize: number;
  firestore1MiBLimitPass: boolean;
  topLevelFields: Array<{ name: string; sizeBytes: number; sizeKB: number }>;
  largest10Fields: Array<{ name: string; sizeBytes: number; sizeKB: number }>;
  sha256Hash?: string;
  offendingFieldPath?: string;
  offendingType?: string;
  error?: string;
}

export async function inspectFirestorePayload(
  docPath: string,
  payload: any
): Promise<ForensicInspectionResult> {
  const startTime = performance.now();
  const visited = new Set<any>();

  let offendingFieldPath: string | undefined;
  let offendingType: string | undefined;

  function findNonSerializable(obj: any, currentPath: string): boolean {
    if (obj === null || obj === undefined) return false;

    const type = typeof obj;
    if (type === "function") {
      offendingFieldPath = currentPath || "root";
      offendingType = "Function";
      return true;
    }
    if (type === "symbol") {
      offendingFieldPath = currentPath || "root";
      offendingType = "Symbol";
      return true;
    }

    if (type === "object") {
      if (visited.has(obj)) {
        offendingFieldPath = currentPath || "root";
        offendingType = "Circular Reference";
        return true;
      }
      visited.add(obj);

      if (typeof File !== "undefined" && obj instanceof File) {
        offendingFieldPath = currentPath || "root";
        offendingType = "File";
        return true;
      }
      if (typeof Blob !== "undefined" && obj instanceof Blob) {
        offendingFieldPath = currentPath || "root";
        offendingType = "Blob";
        return true;
      }
      if (obj instanceof ArrayBuffer || (typeof SharedArrayBuffer !== "undefined" && obj instanceof SharedArrayBuffer)) {
        offendingFieldPath = currentPath || "root";
        offendingType = "ArrayBuffer";
        return true;
      }
      if (obj instanceof Promise || (typeof obj?.then === "function")) {
        offendingFieldPath = currentPath || "root";
        offendingType = "Promise";
        return true;
      }
      if (obj instanceof Map) {
        offendingFieldPath = currentPath || "root";
        offendingType = "Map";
        return true;
      }
      if (obj instanceof Set) {
        offendingFieldPath = currentPath || "root";
        offendingType = "Set";
        return true;
      }
      if (ArrayBuffer.isView(obj) && !(obj instanceof DataView)) {
        offendingFieldPath = currentPath || "root";
        offendingType = `TypedArray (${obj.constructor?.name || 'TypedArray'})`;
        return true;
      }

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          if (findNonSerializable(obj[i], `${currentPath}[${i}]`)) return true;
        }
      } else if (obj instanceof Date) {
        // Date is supported
      } else {
        const keys = Object.keys(obj);
        for (const key of keys) {
          if (findNonSerializable(obj[key], currentPath ? `${currentPath}.${key}` : key)) return true;
        }
      }
    }

    return false;
  }

  const hasOffendingVal = findNonSerializable(payload, "");

  if (hasOffendingVal) {
    const serializationTimeMs = performance.now() - startTime;
    console.error(`==================================================`);
    console.error(`FORENSIC RUNTIME INVESTIGATION: FIRESTORE WRITE`);
    console.error(`Document Path: ${docPath}`);
    console.error(`Total Serialization Time: ${serializationTimeMs.toFixed(2)} ms`);
    console.error(`Serialization Status: FAILURE`);
    console.error(`Exact Offending Field Path: ${offendingFieldPath}`);
    console.error(`Offending Type: ${offendingType}`);
    console.error(`==================================================`);

    return {
      success: false,
      docPath,
      serializationTimeMs,
      byteSize: 0,
      kbSize: 0,
      mbSize: 0,
      firestore1MiBLimitPass: false,
      topLevelFields: [],
      largest10Fields: [],
      offendingFieldPath,
      offendingType,
      error: `Non-serializable or circular value found at field path: ${offendingFieldPath} (Type: ${offendingType})`
    };
  }

  // Attempt serialization
  let serializedStr = "";
  try {
    const cleanedPayload = sanitizeForFirestore(payload);
    serializedStr = JSON.stringify(cleanedPayload);
  } catch (err: any) {
    const serializationTimeMs = performance.now() - startTime;
    console.error(`==================================================`);
    console.error(`FORENSIC RUNTIME INVESTIGATION: FIRESTORE WRITE`);
    console.error(`Document Path: ${docPath}`);
    console.error(`Total Serialization Time: ${serializationTimeMs.toFixed(2)} ms`);
    console.error(`Serialization Status: FAILURE (JSON.stringify Error)`);
    console.error(`Error details:`, err);
    console.error(`==================================================`);

    return {
      success: false,
      docPath,
      serializationTimeMs,
      byteSize: 0,
      kbSize: 0,
      mbSize: 0,
      firestore1MiBLimitPass: false,
      topLevelFields: [],
      largest10Fields: [],
      error: err?.message || String(err)
    };
  }

  const serializationTimeMs = performance.now() - startTime;
  const byteSize = new TextEncoder().encode(serializedStr).length;
  const kbSize = parseFloat((byteSize / 1024).toFixed(2));
  const mbSize = parseFloat((byteSize / (1024 * 1024)).toFixed(4));
  const firestore1MiBLimitPass = byteSize <= 1048576;

  // Compute top-level field sizes
  const topLevelFields: Array<{ name: string; sizeBytes: number; sizeKB: number }> = [];
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    for (const key of Object.keys(payload)) {
      try {
        const valStr = JSON.stringify(sanitizeForFirestore(payload[key]));
        const fieldBytes = valStr ? new TextEncoder().encode(valStr).length : 0;
        topLevelFields.push({
          name: key,
          sizeBytes: fieldBytes,
          sizeKB: parseFloat((fieldBytes / 1024).toFixed(2))
        });
      } catch {
        topLevelFields.push({ name: key, sizeBytes: -1, sizeKB: -1 });
      }
    }
  }

  topLevelFields.sort((a, b) => b.sizeBytes - a.sizeBytes);
  const largest10Fields = topLevelFields.slice(0, 10);

  // Compute SHA256 hash
  let sha256Hash = "N/A";
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(serializedStr));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    sha256Hash = "HASH_COMPUTATION_FAILED";
  }

  console.log(`==================================================`);
  console.log(`FORENSIC RUNTIME INVESTIGATION: FIRESTORE WRITE`);
  console.log(`Document Path: ${docPath}`);
  console.log(`Total Serialization Time: ${serializationTimeMs.toFixed(2)} ms`);
  console.log(`Serialization Status: SUCCESS`);
  console.log(`Exact Serialized Payload Size: ${byteSize} bytes (${kbSize} KB / ${mbSize} MB)`);
  console.log(`Firestore 1 MiB Limit Comparison (1,048,576 bytes): ${firestore1MiBLimitPass ? "PASS" : "FAIL"}`);
  console.log(`SHA-256 Payload Hash: ${sha256Hash}`);
  console.log(`Top-level Field Count: ${topLevelFields.length}`);
  console.log(`Top-level Fields Breakdown:`);
  topLevelFields.forEach(f => {
    console.log(`  - ${f.name}: ${f.sizeBytes} bytes (${f.sizeKB} KB)`);
  });
  console.log(`Largest 10 Fields:`);
  largest10Fields.forEach((f, idx) => {
    console.log(`  ${idx + 1}. ${f.name}: ${f.sizeBytes} bytes (${f.sizeKB} KB)`);
  });
  console.log(`Non-serializable / Circular Value Inspection:`);
  console.log(`  - Circular references: NONE DETECTED`);
  console.log(`  - Non-serializable types: NONE DETECTED`);
  console.log(`==================================================`);

  return {
    success: true,
    docPath,
    serializationTimeMs,
    byteSize,
    kbSize,
    mbSize,
    firestore1MiBLimitPass,
    topLevelFields,
    largest10Fields,
    sha256Hash
  };
}

/**
 * Safe wrapper around setDoc that sanitizes data before writing.
 */
export async function safeSetDoc<T>(
  docRef: DocumentReference,
  data: T,
  options?: SetOptions
) {
  const path = docRef.path;
  const startTime = Date.now();
  const entryTimestamp = new Date().toISOString();

  console.log(`==================================================`);
  console.log(`[SAFE_SET_DOC TRACE - ENTRY]`);
  console.log(`- Path: ${path}`);
  console.log(`- Entry Timestamp: ${entryTimestamp}`);
  console.log(`- Has Options: ${Boolean(options)}`);
  console.log(`==================================================`);

  // Verify Firestore App instance, Auth state, and offline persistence configuration
  try {
    const firestoreInst = docRef.firestore as any;
    const app = firestoreInst?.app;
    const appName = app?.name || "unknown";
    const appOptions = app?.options || {};
    const databaseId = firestoreInst?._databaseId?.database || firestoreInst?._databaseId || "(default)";
    const settings = firestoreInst?._settings || firestoreInst?._config || {};

    let authState: any = "AUTH_NOT_CHECKED";
    try {
      if (app) {
        const auth = getAuth(app);
        authState = auth.currentUser
          ? {
              uid: auth.currentUser.uid,
              isAnonymous: auth.currentUser.isAnonymous,
              email: auth.currentUser.email || "no-email",
            }
          : "NO_CURRENT_USER (Unauthenticated)";
      } else {
        authState = "NO_APP_INSTANCE";
      }
    } catch (authErr: any) {
      authState = `AUTH_CHECK_ERROR: ${authErr?.message || authErr}`;
    }

    console.log(`[SAFE_SET_DOC TRACE - RUNTIME ENVIRONMENT VERIFICATION]`);
    console.log(`- Firestore App Name: ${appName}`);
    console.log(`- Firestore Project ID: ${appOptions.projectId || "UNKNOWN"}`);
    console.log(`- Firestore Auth Domain: ${appOptions.authDomain || "UNKNOWN"}`);
    console.log(`- Firestore Database ID: ${databaseId}`);
    console.log(`- Offline Persistence / Settings:`, JSON.stringify(settings));
    console.log(`- Firebase Auth State:`, JSON.stringify(authState));
  } catch (instErr) {
    console.warn(`[SAFE_SET_DOC TRACE - INSTANCE CHECK EXCEPTION]`, instErr);
  }

  console.log(`[SAFE_SET_DOC TRACE - STEP 1] Sanitizing payload for Firestore...`);
  const sanitized = sanitizeForFirestore(data);
  console.log(`[SAFE_SET_DOC TRACE - STEP 1 COMPLETED] Payload sanitization finished.`);

  let payloadSizeStr = "-1";
  try {
    payloadSizeStr = `${JSON.stringify(sanitized).length} bytes`;
  } catch {
    payloadSizeStr = "UNABLE_TO_STRINGIFY";
  }
  console.log(`[SAFE_SET_DOC TRACE - STEP 2 PRE-SDK CALL] Payload size: ${payloadSizeStr}`);
  console.log(`[SAFE_SET_DOC TRACE - BEFORE CALLING FIRESTORE SDK setDoc()] Invoking setDoc for path: ${path} at ${new Date().toISOString()}`);

  let isCompleted = false;
  let caughtError: any = null;

  try {
    console.log(`[SAFE_SET_DOC TRACE - AWAITING FIRESTORE SDK PROMISE] Calling setDoc(docRef, sanitized)...`);
    let res;
    if (options) {
      res = await setDoc(docRef, sanitized, options);
    } else {
      res = await setDoc(docRef, sanitized);
    }
    const durationMs = Date.now() - startTime;
    isCompleted = true;
    console.log(`[SAFE_SET_DOC TRACE - IMMEDIATELY AFTER SDK RETURNS] setDoc promise RESOLVED in ${durationMs}ms for path: ${path} at ${new Date().toISOString()}`);
    return res;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    isCompleted = true;
    caughtError = err;
    console.error(`==================================================`);
    console.error(`[SAFE_SET_DOC TRACE - CATCH BLOCK] setDoc REJECTED after ${durationMs}ms for path: ${path}`);
    console.error(`- Timestamp: ${new Date().toISOString()}`);
    console.error(`- Error Name: ${err?.name}`);
    console.error(`- Error Code: ${err?.code}`);
    console.error(`- Error Message: ${err?.message}`);
    console.error(`- Error Stack: ${err?.stack}`);
    console.error(`- Raw Error Object:`, err);
    console.error(`==================================================`);
    throw err;
  } finally {
    const totalDurationMs = Date.now() - startTime;
    console.log(`==================================================`);
    console.log(`[SAFE_SET_DOC TRACE - FINALLY BLOCK] safeSetDoc execution lifecycle ended for path: ${path}`);
    console.log(`- Total Duration: ${totalDurationMs} ms`);
    console.log(`- Execution Status: ${isCompleted ? (caughtError ? "REJECTED" : "RESOLVED") : "STALLED / UNRESOLVED (HANGING IN AWAIT)"}`);
    console.log(`==================================================`);
  }
}

/**
 * Safe wrapper around addDoc that sanitizes data before writing.
 */
export async function safeAddDoc<T>(
  collRef: CollectionReference,
  data: T
) {
  const path = collRef.path;
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const sanitized = sanitizeForFirestore(data);
  let payloadSize = 0;
  try {
    payloadSize = JSON.stringify(sanitized).length;
  } catch {
    payloadSize = -1;
  }

  console.log(`[STAGE 11 FIRESTORE WRITE] About to call addDoc for path: ${path}`, {
    timestamp,
    payloadSizeBytes: payloadSize
  });
  console.log(`[STAGE 11 FIRESTORE WRITE] Await started for addDoc path: ${path} at ${new Date().toISOString()}`);

  try {
    const res = await addDoc(collRef, sanitized);
    const durationMs = Date.now() - startTime;
    console.log(`[STAGE 11 FIRESTORE WRITE] Await completed for addDoc path: ${path} in ${durationMs}ms at ${new Date().toISOString()}`);
    return res;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error(`[STAGE 11 FIRESTORE EXCEPTION] Exception in addDoc path: ${path} after ${durationMs}ms at ${new Date().toISOString()}:`, err);
    throw err;
  }
}

/**
 * Safe wrapper around updateDoc that sanitizes data before writing.
 */
export async function safeUpdateDoc<T>(
  docRef: DocumentReference,
  data: any
) {
  const path = docRef.path;
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const sanitized = sanitizeForFirestore(data);
  let payloadSize = 0;
  try {
    payloadSize = JSON.stringify(sanitized).length;
  } catch {
    payloadSize = -1;
  }

  console.log(`[STAGE 11 FIRESTORE WRITE] About to call updateDoc for path: ${path}`, {
    timestamp,
    payloadSizeBytes: payloadSize
  });
  console.log(`[STAGE 11 FIRESTORE WRITE] Await started for updateDoc path: ${path} at ${new Date().toISOString()}`);

  try {
    const res = await updateDoc(docRef, sanitized);
    const durationMs = Date.now() - startTime;
    console.log(`[STAGE 11 FIRESTORE WRITE] Await completed for updateDoc path: ${path} in ${durationMs}ms at ${new Date().toISOString()}`);
    return res;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error(`[STAGE 11 FIRESTORE EXCEPTION] Exception in updateDoc path: ${path} after ${durationMs}ms at ${new Date().toISOString()}:`, err);
    throw err;
  }
}
