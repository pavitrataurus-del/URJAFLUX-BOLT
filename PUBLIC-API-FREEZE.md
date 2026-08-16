# PUBLIC-API-FREEZE.md

This document freezes and registers the complete public API contracts of the URJAFLUX AI OS platform at **Version 1.0**.

---

## 1. Frozen Public Service Interfaces

All core services must implement these frozen public contracts to ensure stability and compatibility across the system.

### A. Astrology Service Contract (`AstroService`)
```typescript
/**
 * @version 1.0
 */
export interface IAstroService {
  calculateKundli(birthDetails: BirthDetails): Promise<KundliResult>;
  calculateKPChart(birthDetails: BirthDetails): Promise<KPChartResult>;
  calculateLalKitabRemedies(birthDetails: BirthDetails): Promise<LalKitabRemediesResult>;
  calculateNumerology(birthDetails: BirthDetails): Promise<NumerologyResult>;
}
```

### B. Vastu & Spatial Service Contract (`SpatialService`)
```typescript
/**
 * @version 1.0
 */
export interface ISpatialService {
  analyzeFloorPlan(dimensions: Dimensions, elements: SpatialElement[]): VastuZoningResult;
  getDirectionalCompassZoning(angle: number): CompassZoning;
  validateRemedyPlacement(remedyId: string, location: Coordinates): PlacementValidity;
}
```

### C. Workflow & Orchestration Contract (`WorkflowService`)
```typescript
/**
 * @version 1.0
 */
export interface IWorkflowService {
  triggerWorkflow(pipelineId: string, context: Record<string, any>): Promise<string>;
  getWorkflowStatus(instanceId: string): Promise<WorkflowStatus>;
  registerActivity(activityId: string, handler: ActivityHandler): void;
}
```

---

## 2. Frozen Data Transfer Objects (DTOs)

The structure of data passed between domains is strictly specified to prevent translation errors.

### A. Birth Details DTO
```typescript
/**
 * @version 1.0
 */
export interface BirthDetails {
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:MM:SS
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
```

### B. Spatial Element DTO
```typescript
/**
 * @version 1.0
 */
export interface SpatialElement {
  id: string;
  name: string;
  type: "entrance" | "toilet" | "kitchen" | "bedroom" | "living" | "remedy";
  coordinates: Coordinates;
  weight: number;
}
```

---

## 3. Backward Compatibility and Versioning Policy
- **Minor Enhancements**: To introduce optional, non-breaking fields, new fields should be appended with optional markers (`?`) to preserve backward compatibility.
- **Breaking Modifications**: Direct modifications to these frozen signatures are strictly blocked. Major structural alterations require establishing a new interface contract (e.g., `IAstroService_v2`) without altering the existing 1.0 signatures.
