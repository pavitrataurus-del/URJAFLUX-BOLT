# DOMAIN-002A: Document Classification & Metadata Report

## Document Classification Taxonomy

The **Document Classification Engine** (`DocumentClassificationEngine.ts`) automatically classifies incoming files into 11 canonical domain types based on semantic keyword density, heading structures, and title metadata:

1. **Vastu**: Classical architectural shastras (*Mayamatam*, *Manasara*, *Samarangana Sutradhara*, *Brihat Samhita*).
2. **Chakra**: Subtle body yoga shastras (*Sat-Cakra-Nirupana*, *Siva Samhita*, *Gheranda Samhita*).
3. **Lal Kitab**: Astro-remedial palmistry and Vastu rectifications.
4. **Numerology**: Chaldean and Vedic integer vibration manuals.
5. **Astrology (Jyotish)**: Parashari and Jaimini horoscope mechanics.
6. **Research Paper**: Peer-reviewed empirical biofield & environmental psychology research.
7. **Book**: General reference manuscripts and publications.
8. **Article**: Specialized essays and domain commentary.
9. **Reference Manual**: Operational practitioner field guide.
10. **Expert Notes**: Handwritten or digitized Acharya SME commentary.
11. **Unknown**: Default fallback queue for manual SME classification.

---

## 14-Field Metadata Extraction Schema

```typescript
export interface IDocumentMetadata {
  title: string;              // e.g., "Mayamatam Vastu Shastra Volume I"
  author: string;             // e.g., "Acharya Mayamuni"
  publisher: string;          // e.g., "IGNCA Publications"
  edition: string;            // e.g., "Critical Devanagari Translation"
  publicationYear: number;    // e.g., 1995
  language: string;           // e.g., "Sanskrit / English"
  isbn?: string;              // e.g., "978-81-208-1320-5"
  documentType: string;       // e.g., "Classical Scripture"
  domain: KnowledgeDomain;    // e.g., "Vastu"
  keywords: string[];         // e.g., ["vastu", "shastra", "directions"]
  sourceQuality: number;      // 0.00 to 1.00
  evidencePriority: 'HIGH' | 'MEDIUM' | 'LOW';
  approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  version: string;            // e.g., "1.0.0"
}
```

Admin users have complete manual override authority to edit any metadata field before approving the document.
