# Project Data Model Specification — DOMAIN-007

## Overview
All entities in DOMAIN-007 inherit standard audit metadata (`id`, `version`, `status`, `owner`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`).

## Primary Entities
1. **`IExecutionProject`**:
   - `id`: Unique UUID
   - `projectCode`: e.g. `UF-PRJ-2026-081`
   - `title`, `clientName`, `siteAddress`
   - `originatingSessionId`, `originatingRecommendationIds`
   - `phases`: List of `IExecutionPhase`
   - `issues`: List of `IExecutionIssue`
   - `risks`: List of `IExecutionRisk`
   - `overallProgressPercentage`

2. **`IExecutionPhase`**:
   - `phaseNumber`, `title`, `description`
   - `startDate`, `targetEndDate`
   - `tasks`: List of `IExecutionTask`
   - `milestones`: List of `IExecutionMilestone`

3. **`IExecutionTask`**:
   - `originatingRecommendationId`
   - `title`, `description`, `category`, `priority`
   - `assignedTo`, `assignedRole`
   - `dueDate`, `estimatedDurationHours`, `actualDurationHours`
   - `checklists`, `evidenceIds`, `inspectionIds`, `approvalIds`

4. **`IExecutionEvidence`**:
   - `evidenceType` (`IMAGE` | `VIDEO` | `PDF` | `REPORT` | `MEASUREMENT`)
   - `fileUrl`, `uploaderName`, `uploaderRole`
   - `immutableChecksum` (SHA256)
   - `gpsCoordinates`, `measurementValue`

5. **`ISiteInspection`**:
   - `inspectorName`, `complianceStatus` (`FULLY_COMPLIANT` | `PARTIALLY_COMPLIANT` | `NON_COMPLIANT`)
   - `measurementsTaken`, `observations`

6. **`IApprovalRecord`**:
   - `approvalTier` (`FIELD_ENGINEER` | `SENIOR_CONSULTANT` | `PROJECT_MANAGER` | `ADMINISTRATOR`)
   - `decision` (`APPROVED` | `REJECTED` | `REQUESTED_CHANGES`)
   - `digitalSignatureHash`, `comments`
