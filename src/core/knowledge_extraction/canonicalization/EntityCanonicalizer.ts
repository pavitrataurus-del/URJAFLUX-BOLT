import { BaseCanonicalizer } from './BaseCanonicalizer';
import { KnowledgeObject } from '../models/KnowledgeObject';

export class EntityCanonicalizer extends BaseCanonicalizer {
  public readonly name = 'EntityCanonicalizer';
  public readonly priority = 100;

  public canonicalize(object: KnowledgeObject): KnowledgeObject {
    const rawEntity = object.entity;
    if (!rawEntity) {
      return object;
    }

    const cleaned = this.sanitizeText(rawEntity);
    // Remove leading punctuation / special characters
    const canonicalEntity = cleaned.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');

    if (canonicalEntity === rawEntity) {
      return object;
    }

    return new KnowledgeObject({
      ...object.toJSON(),
      entity: canonicalEntity || cleaned,
      metadata: {
        ...object.metadata,
        rawEntity,
        canonicalizedByEntity: true
      },
      updatedAt: Date.now()
    });
  }
}
