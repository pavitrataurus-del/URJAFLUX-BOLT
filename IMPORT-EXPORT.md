# Import / Export Engine (IMPORT-EXPORT.md)

## 1. Description
The Import / Export Engine manages batch data pipelines to load and dump structured assets securely.

## 2. Supported Formats
- **Inbound Import Pipeline:** CSV, JSON, XML, Excel (XLSX).
- **Outbound Export Pipeline:** CSV, JSON, XML, Excel (XLSX).

## 3. Transformation & Validation Pipelines
1. **Parser Layer:** Extracts tabular lines or schemas into generic structured memory records.
2. **Sanitation & Verification Layer:**
   - Validates column types, range limits, and null constraints.
   - Cleanses SQL injection characters and cross-site scripting strings.
   - Maps coordinates to standard decimal structures.
3. **Ingestion Layer:** Safely dispatches sanitized datasets to public domain service endpoints (e.g. creating Spatial Pins in DOMAIN-011 or adding inspection logs in DOMAIN-012).
