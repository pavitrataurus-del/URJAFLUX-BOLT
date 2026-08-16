import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeStatus } from '../types/knowledge.types';
import { ICanonicalizer } from './BaseCanonicalizer';
import { EntityCanonicalizer } from './EntityCanonicalizer';
import { AttributeCanonicalizer } from './AttributeCanonicalizer';
import { ValueCanonicalizer } from './ValueCanonicalizer';

export class CanonicalizationEngine {
  private readonly canonicalizers: ICanonicalizer[];

  constructor(customCanonicalizers?: ICanonicalizer[]) {
    if (customCanonicalizers && customCanonicalizers.length > 0) {
      this.canonicalizers = [...customCanonicalizers].sort((a, b) => b.priority - a.priority);
    } else {
      this.canonicalizers = [
        new EntityCanonicalizer(),
        new AttributeCanonicalizer(),
        new ValueCanonicalizer()
      ].sort((a, b) => b.priority - a.priority);
    }
  }

  public canonicalizeObject(object: KnowledgeObject): KnowledgeObject {
    let current = object;
    const activeCanonicalizers = this.canonicalizers.filter((c) => c.enabled);

    for (const canonicalizer of activeCanonicalizers) {
      current = canonicalizer.canonicalize(current);
    }

    if (current.status === KnowledgeStatus.EXTRACTED) {
      current = current.withStatus(KnowledgeStatus.VALIDATED);
    }

    return current;
  }

  public canonicalizeObjects(objects: readonly KnowledgeObject[]): readonly KnowledgeObject[] {
    return objects.map((obj) => this.canonicalizeObject(obj));
  }
}
