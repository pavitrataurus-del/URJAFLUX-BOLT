import { BaseCanonicalizer } from './BaseCanonicalizer';
import { KnowledgeObject } from '../models/KnowledgeObject';

export class ValueCanonicalizer extends BaseCanonicalizer {
  public readonly name = 'ValueCanonicalizer';
  public readonly priority = 80;

  private static readonly UNIT_MAPPINGS: Record<string, string> = {
    m: 'meters',
    meter: 'meters',
    meters: 'meters',
    cm: 'centimeters',
    centimeter: 'centimeters',
    centimeters: 'centimeters',
    mm: 'millimeters',
    millimeter: 'millimeters',
    millimeters: 'millimeters',
    ft: 'feet',
    foot: 'feet',
    feet: 'feet',
    in: 'inches',
    inch: 'inches',
    inches: 'inches',
    sqft: 'square_feet',
    sqm: 'square_meters',
    kg: 'kilograms',
    lbs: 'pounds'
  };

  public canonicalize(object: KnowledgeObject): KnowledgeObject {
    const rawVal = object.value;

    if (typeof rawVal === 'string') {
      const sanitized = this.sanitizeText(rawVal);

      // Check string boolean conversions
      if (sanitized.toLowerCase() === 'true') {
        return this.updateValue(object, true, rawVal);
      }
      if (sanitized.toLowerCase() === 'false') {
        return this.updateValue(object, false, rawVal);
      }

      // Check numeric conversions if string is purely numeric
      if (/^-?\d+(\.\d+)?$/.test(sanitized)) {
        const num = Number(sanitized);
        if (!isNaN(num)) {
          return this.updateValue(object, num, rawVal);
        }
      }

      if (sanitized !== rawVal) {
        return this.updateValue(object, sanitized, rawVal);
      }
    }

    // Check unit normalization in metadata if present
    if (object.metadata && typeof object.metadata.extractedUnit === 'string') {
      const unit = object.metadata.extractedUnit.toLowerCase().trim();
      const mappedUnit = ValueCanonicalizer.UNIT_MAPPINGS[unit] || unit;
      if (mappedUnit !== object.metadata.extractedUnit) {
        return new KnowledgeObject({
          ...object.toJSON(),
          metadata: {
            ...object.metadata,
            canonicalUnit: mappedUnit
          },
          updatedAt: Date.now()
        });
      }
    }

    return object;
  }

  private updateValue(object: KnowledgeObject, newValue: string | number | boolean, rawValue: unknown): KnowledgeObject {
    return new KnowledgeObject({
      ...object.toJSON(),
      value: newValue,
      metadata: {
        ...object.metadata,
        rawValue,
        canonicalizedByValue: true
      },
      updatedAt: Date.now()
    });
  }
}
