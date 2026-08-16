# DOMAIN-002: Canonical Chakra Ontology Report

## Overview & Scope

This report documents the canonical 40+ field ontology defined for the **Enterprise Chakra Intelligence Library** (DOMAIN-002) in URJAFLUX AI OS.

Every Chakra entity registered in `ChakraOntologyCatalog.ts` conforms strictly to classical Sanskrit yoga shastras (*Sat-Cakra-Nirupana*, *Siva Samhita*, *Gheranda Samhita*, *Goraksha Sataka*, *Hatha Yoga Pradipika*) and verified biofield research.

---

## 40+ Field Canonical Ontology Schema

| Field Name | Type | Description | Example (Muladhara) |
|---|---|---|---|
| `id` | `string` | Unique Entity ID | `chk-001` |
| `sanskritName` | `string` | Classical Sanskrit Name | `Muladhara` |
| `englishName` | `string` | Standard English Name | `Root Chakra` |
| `commonName` | `string` | Descriptive Common Name | `Base / Foundation Center` |
| `chakraNumber` | `number` | Order (1 to 7) | `1` |
| `element` | `string` | Pancha Mahabhuta | `Earth (Prithvi)` |
| `color` | `string` | Spectrum / Radiance | `Crimson Red` |
| `geometry` | `string` | Yantra Geometry | `Yellow Square (Prithvi Mandala)` |
| `symbol` | `string` | Visual Symbolism | `Inverted Triangle inside Square` |
| `lotusPetals` | `number` | Count of Petals | `4` |
| `seedMantra` | `string` | Bija Acoustic Mantra | `LAM` |
| `associatedDeity` | `string` | Presiding Deity | `Ganesha & Lord Brahma` |
| `associatedShakti` | `string` | Presiding Shakti | `Dakini Shakti` |
| `bodyRegion` | `string` | Physical Anatomy | `Base of Spine, Perineum` |
| `organs` | `string[]` | Associated Organs | `Adrenal Glands, Colon, Kidneys` |
| `endocrineGlands` | `string[]` | Endocrine Correlates | `Adrenal Cortex` |
| `nervousSystem` | `string[]` | Neural Clusters | `Sacral Plexus, Sciatic Nerve` |
| `emotionalFunctions` | `string[]` | Emotional Attributes | `Survival, Grounding, Trust` |
| `psychologicalFunctions` | `string[]` | Mind Correlates | `Stability, Fear Management` |
| `spiritualFunctions` | `string[]` | Metaphysical Function | `Kundalini Awakening Seat` |
| `balancedState` | `string` | Optimal Condition | `Grounded, secure, vital` |
| `underactiveIndicators` | `string[]` | Deficiency Signs | `Anxiety, Chronic Fatigue` |
| `overactiveIndicators` | `string[]` | Excessive Signs | `Greed, Material Obsession` |
| `blockedIndicators` | `string[]` | Somatic Pathology | `Sciatica, Lower Back Pain` |
| `positiveTraits` | `string[]` | Virtues | `Patience, Reliability` |
| `negativeTraits` | `string[]` | Flaws | `Insecurity, Hoarding` |
| `meditationMethods` | `string[]` | Contemplation Techs | `Earth Visualization, Mula Bandha` |
| `breathingPractices` | `string[]` | Pranayama Techs | `Samavritti Box Breathing` |
| `mudras` | `string[]` | Hand Gestures | `Prithvi Mudra` |
| `mantras` | `string[]` | Acoustic Phrases | `Om Muladhara Namah` |
| `yantras` | `string[]` | Sacred Geometry | `Prithvi Square Yantra` |
| `crystals` | `string[]` | Mineral Resonators | `Red Jasper, Black Tourmaline` |
| `metals` | `string[]` | Metallic Elements | `Lead, Heavy Cast Iron` |
| `herbs` | `string[]` | Approved Botanicals | `Vetiver, Cedarwood, Patchouli` |
| `soundTherapy` | `string[]` | Acoustic Media | `Tibetan Bowls (C Note)` |
| `colorTherapy` | `string[]` | Light Spectrum | `Warm Crimson Red (620-750nm)` |
| `frequencies` | `string[]` | Hertz Frequencies | `256 Hz, 396 Hz` |
| `approvedRemedies` | `string[]` | Rectification Methods | `Brass Strip Floor Sealing, Terracotta Pots` |
| `contraindications` | `string[]` | Safety Guidance | `Avoid over-activation during hypertension` |
| `expertNotes` | `string` | SME Commentary | `Foundational anchor of consciousness...` |

---

## Cross-Domain Link Schema

```typescript
crossDomainLinks: {
  panchaMahabhuta: string;  // e.g. "Prithvi (Earth)"
  direction: string;        // e.g. "South-West (SW)"
  roomType: string;         // e.g. "Master Bedroom"
  vastuZone: string;        // e.g. "SW - Pitra / Stability Zone"
  primaryRemedy: string;    // e.g. "Terracotta Earth Elements & Heavy Brass Weights"
  primaryYantra: string;    // e.g. "Prithvi Earth Yantra"
  primaryObject: string;    // e.g. "Heavy Earth Storage / Rock Crystal Clusters"
  energyFieldType: string;  // e.g. "Prithvi Tattva Gravitational Energy Field"
}
```

---

## Future DOMAIN-007 Energy Interaction Matrix Schema Preparation

```typescript
futureInteractionMatrix: {
  relatedVastuZones: string[];
  relatedElements: string[];
  relatedDirections: string[];
  relatedRemedies: string[];
  relatedYantras: string[];
  relatedObjects: string[];
  relatedChakras: string[];
  compatibilityLinks: Array<{ targetChakraId: string; compatibilityScore: number; reason: string }>;
  conflictLinks: Array<{ targetChakraId: string; conflictType: string; description: string }>;
}
```

This completes the canonical ontology specification for DOMAIN-002.
