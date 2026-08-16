# Enterprise Data Warehouse (DATA-WAREHOUSE.md)

## 1. Unified Analytics Store
The Enterprise Data Warehouse inside DOMAIN-016 compiles and structures operational data streams into structured time-series snapshots partitioned by core module domains.

## 2. Ingest Pipelines & Partitions
Snapshots consist of:
- **Dimensions:** Categorical values (e.g. `model`, `phase`, `region`, `sensorId`, `deviceType`).
- **Measures:** Continuous variables (e.g. `inferenceTimeMs`, `taskCompletionRate`, `pagesProcessed`, `apiRequests`).

Data partitions are strictly segmented to preserve boundary isolation:
1. `dataset-domain-006`: AI Reasoning telemetry.
2. `dataset-domain-007`: Project Execution metrics.
3. `dataset-domain-008`: Digital Twin vibration and drift sensors.
4. `dataset-domain-009`: AI Consultation message volumes.
5. `dataset-domain-010`: Document OCR processing times.
6. `dataset-domain-011`: CAD floor plan coordinates.
7. `dataset-domain-012`: Vision neural confidence levels.
8. `dataset-domain-013`: SLA breaches and runs.
9. `dataset-domain-014`: Collaboration attachments and response times.
10. `dataset-domain-015`: API Gateway rate limit trips.

## 3. Storage & Retention Policies
The warehouse supports customizable retention rules (90 Days, 365 Days, or Indefinite) to optimize cold storage footprint.
