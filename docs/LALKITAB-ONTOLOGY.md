# DOMAIN-003 — Enterprise Lal Kitab Ontology Specification

## Overview
The **Enterprise Lal Kitab Ontology** establishes a canonical, structured knowledge model representing traditional Lal Kitab shastric wisdom. It categorizes physical elements, planetary forces (Grahas), cosmic houses (Bhavs), physical remedies (Upays), charity donations (Daan), materials, metals, colors, animals, trees, plants, directions, and conditional placement rules.

## Canonical Entity Types
1. **Graha (Planet)**: Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu.
2. **Bhav (House)**: Cosmic houses 1 through 12 representing life facets and physical spatial zones.
3. **Remedy (Upay)**: Physical, non-predictive spatial alignment remedies (e.g., solid silver in water, flowing copper coins in rivers, brass honey pots).
4. **Donation (Daan)**: Charity items and material offerings to balance elemental forces.
5. **Object**: Physical artifacts (Solid Silver Ball, Copper Vessel, Lead Wire, Red Cloth, Earthen Pot).
6. **Metal**: Copper, Solid Silver, Gold, Brass, Lead, Iron, Mercury, Alloys.
7. **Color**: Crimson Red, Pearl White, Golden Yellow, Emerald Green, Royal Blue, Jet Black, Smoky Grey, Rust Brown.
8. **Animal & Bird**: Black Dog, Red Monkey, White Horse, Sacred Cow, Wild Crow, Pigeon.
9. **Tree & Plant**: Neem, Peepal, Banyan, Kikar, Banana, Tulsi.
10. **Direction & Room**: East, West, North, South, NE, NW, SE, SW, Main Entrance, Kitchen, Store Room, Toilet, Roof Apex.
11. **Conditional & Time Rules**: Varshphal annual cycles, planetary age transits, Mangal Badd vs Mangal Neek conditions, dormant houses.

## Entity Core Schema Attributes
- `id`: Unique identifier (e.g. `lk-grh-001`).
- `canonicalName`: Primary canonical title with Urdu/Hindi transliteration.
- `alternateNames`: Array of historical synonyms across manuscripts.
- `hindiName` & `englishName`: Multi-lingual display names.
- `urduName`: Original Urdu Farman nomenclature.
- `entityType`: One of 21 canonical ontology types.
- `description`: Formal shastric explanation.
- `category` & `tags`: Taxonomy classifications.
- `version` & `status`: Semantic versioning (`1.0.0`) and state (`CANONICAL`, `DRAFT`, `DISPUTED`, `DEPRECATED`).
