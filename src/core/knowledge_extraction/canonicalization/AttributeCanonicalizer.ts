import { BaseCanonicalizer } from './BaseCanonicalizer';
import { KnowledgeObject } from '../models/KnowledgeObject';

export class AttributeCanonicalizer extends BaseCanonicalizer {
  public readonly name = 'AttributeCanonicalizer';
  public readonly priority = 90;

  public canonicalize(object: KnowledgeObject): KnowledgeObject {
    const rawAttr = object.attribute;
    if (!rawAttr) {
      return object;
    }

    const cleaned = this.sanitizeText(rawAttr);
    // Standardize attribute name to camelCase format if it contains spaces or underscores
    const camelCased = cleaned
      .replace(/[^a-zA-Z0-9_\s]/g, '')
      .replace(/[\s_]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[A-Z]/, (char) => char.toLowerCase());

    const canonicalAttr = camelCased || cleaned;

    if (canonicalAttr === rawAttr) {
      return object;
    }

    return new KnowledgeObject({
      ...object.toJSON(),
      attribute: canonicalAttr,
      metadata: {
        ...object.metadata,
        rawAttribute: rawAttr,
        canonicalizedByAttribute: true
      },
      updatedAt: Date.now()
    });
  }
}
