import { ISKOValidator, SKOValidationResult } from "./types";
import { SpatialKnowledgeObjectEntity } from "../../types/sig";

/**
 * Concrete Validator for Spatial Knowledge Objects.
 * Validates domain invariants, geometric coordinate structures, and property constraints.
 */
export class SKOValidator implements ISKOValidator {
  private allowedSectors = new Set([
    "NORTH",
    "NORTHEAST",
    "EAST",
    "SOUTHEAST",
    "SOUTH",
    "SOUTHWEST",
    "WEST",
    "NORTHWEST",
    "CENTER",
    "UNKNOWN",
  ]);

  private allowedElements = new Set([
    "Water",
    "Fire",
    "Earth",
    "Air",
    "Space",
    "None",
  ]);

  private allowedGeometries = new Set(["POLYGON", "POINT", "POLYLINE", "CIRCLE"]);

  /**
   * Validates the complete entity structure.
   */
  public validate(sko: SpatialKnowledgeObjectEntity): SKOValidationResult {
    const errors: string[] = [];

    if (!sko.id || typeof sko.id !== "string") {
      errors.push("Invalid Entity ID: must be a non-empty string.");
    }

    if (sko.type !== "SPATIAL_KNOWLEDGE_OBJECT") {
      errors.push("Invalid Entity Type: must be SPATIAL_KNOWLEDGE_OBJECT.");
    }

    if (!sko.tenantId || typeof sko.tenantId !== "string") {
      errors.push("Invalid Tenant ID: must be a non-empty string.");
    }

    if (typeof sko.version !== "number" || sko.version < 1) {
      errors.push("Invalid Version: must be a positive integer.");
    }

    const properties = sko.properties;
    if (!properties) {
      errors.push("Missing Properties structure.");
      return { isValid: false, errors };
    }

    if (!properties.label || typeof properties.label !== "string" || properties.label.trim() === "") {
      errors.push("Label is required and must be a non-empty string.");
    }

    if (
      !properties.functionalZoneType ||
      typeof properties.functionalZoneType !== "string" ||
      properties.functionalZoneType.trim() === ""
    ) {
      errors.push("functionalZoneType is required and must be a non-empty string.");
    }

    if (!this.allowedGeometries.has(properties.geometricalType)) {
      errors.push(
        `Invalid Geometrical Type: '${properties.geometricalType}'. Must be POLYGON, POINT, POLYLINE, or CIRCLE.`
      );
    }

    // Validate Coordinates
    const coordValidation = this.validateCoordinates(properties.coordinates, properties.geometricalType);
    if (!coordValidation.isValid) {
      errors.push(...coordValidation.errors);
    }

    // Validate Cardinal Sector
    if (properties.cardinalSector && !this.allowedSectors.has(properties.cardinalSector)) {
      errors.push(`Invalid Cardinal Sector: '${properties.cardinalSector}'.`);
    }

    // Validate Primary Element
    if (properties.primaryElement && !this.allowedElements.has(properties.primaryElement)) {
      errors.push(`Invalid Primary Element: '${properties.primaryElement}'.`);
    }

    // Validate area
    if (typeof properties.calculatedGridAreaSqMeters !== "number" || properties.calculatedGridAreaSqMeters < 0) {
      errors.push("Invalid Calculated Grid Area: must be a non-negative number.");
    }

    // Validate center of mass
    const center = properties.centerOfMass;
    if (!center || typeof center.x !== "number" || typeof center.y !== "number") {
      errors.push("centerOfMass must contain valid numeric x and y coordinates.");
    } else if (
      !Number.isFinite(center.x) ||
      !Number.isFinite(center.y) ||
      (center.z !== undefined && !Number.isFinite(center.z))
    ) {
      errors.push("centerOfMass coordinates cannot be infinite or NaN.");
    }

    // Validate audit trail
    if (!sko.audit) {
      errors.push("Missing Audit Trail.");
    } else {
      const audit = sko.audit;
      if (!audit.createdTimestamp || isNaN(Date.parse(audit.createdTimestamp))) {
        errors.push("Invalid createdTimestamp in audit trail.");
      }
      if (!audit.modifiedTimestamp || isNaN(Date.parse(audit.modifiedTimestamp))) {
        errors.push("Invalid modifiedTimestamp in audit trail.");
      }
      if (!audit.createdByUser) {
        errors.push("createdByUser is required in audit trail.");
      }
      if (!audit.modifiedByUser) {
        errors.push("modifiedByUser is required in audit trail.");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates geometrical coordinate arrays based on element typing.
   */
  public validateCoordinates(
    coordinates: Array<{ x: number; y: number; z?: number }>,
    geometricalType: "POLYGON" | "POINT" | "POLYLINE" | "CIRCLE"
  ): SKOValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(coordinates)) {
      return { isValid: false, errors: ["Coordinates must be a valid array."] };
    }

    // Numerical validation
    for (let i = 0; i < coordinates.length; i++) {
      const pt = coordinates[i];
      if (!pt || typeof pt.x !== "number" || typeof pt.y !== "number") {
        errors.push(`Coordinate at index ${i} is missing numeric 'x' or 'y' parameters.`);
        continue;
      }
      if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y) || (pt.z !== undefined && !Number.isFinite(pt.z))) {
        errors.push(`Coordinate at index ${i} contains non-finite values (NaN or Infinity).`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Geometric structure validation
    switch (geometricalType) {
      case "POINT":
        if (coordinates.length === 0) {
          errors.push("POINT geometry requires at least one coordinate.");
        }
        break;

      case "POLYLINE":
        if (coordinates.length < 2) {
          errors.push("POLYLINE geometry requires at least two coordinates.");
        }
        break;

      case "POLYGON":
        if (coordinates.length < 3) {
          errors.push("POLYGON geometry requires at least three vertices.");
        }
        break;

      case "CIRCLE":
        if (coordinates.length === 0) {
          errors.push("CIRCLE geometry requires at least one coordinate indicating the center.");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
