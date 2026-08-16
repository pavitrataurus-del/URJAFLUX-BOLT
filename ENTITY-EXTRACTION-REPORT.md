# DOMAIN-002A: Entity Extraction Engine Report

## 19 Canonical Entity Types

The **Entity Extraction Engine** automatically scans chunked text to identify 19 distinct entity types across all supported knowledge domains:

| Entity Type | Description | Example Canonical Entity |
|---|---|---|
| `OBJECT` | Physical items or structural elements | Subterranean Fresh Water Reservoir |
| `ROOM` | Functional interior spaces | Kitchen / Culinary Agni Room |
| `DIRECTION` | Cardinal or ordinal directions | South-West (SW) Direction |
| `ZONE` | Energy grid sectors | North-East (NE) Ishan Zone |
| `CHAKRA` | Subtle energy centers | Muladhara (Root Chakra) |
| `ELEMENT` | Pancha Mahabhuta elements | Prithvi (Earth Tattva) |
| `YANTRA` | Sacred geometric forms | Prithvi Square Yantra |
| `MANTRA` | Acoustic seed formulas | LAM Bija Acoustic Mantra |
| `REMEDY` | Physical rectifiers | 3D Pure Copper Helix Rectifier |
| `PLANET` | Navagraha celestial bodies | Surya (Sun) |
| `NUMBER` | Chaldean integer vibrations | Integer Vibration 1 (Sun) |
| `DEITY` | Presiding shastra deities | Lord Ishana |
| `SYMBOL` | Visual symbols | Inverted Fire Triangle |
| `COLOR` | Spectrum radiances | Luminous Crimson Red |
| `SHAPE` | Structural geometry | Square / Pyramid |
| `CRYSTAL` | Mineral resonators | Red Jasper Crystal |
| `METAL` | Elemental metallic strips | Heavy Cast Brass Strip |
| `PLANT` | Botanical remedies | Vetiver (Khus) Root |
| `DISEASE` | Somatic indications | Chronic Anxiety & Lower Back Pain |

---

## Entity Candidate Workflow

1. **Extraction**: Raw text mentions are extracted with page and paragraph coordinates.
2. **Confidence Scoring**: Each candidate receives an algorithmic confidence score (0.00–1.00).
3. **Candidate Queue**: Extracted entities enter as `Candidate` status.
4. **SME Review**: Admin approves candidate entities, changing status to `Approved`.
5. **Knowledge Graph Sync**: Only `Approved` entities are serialized into the Knowledge Graph.
