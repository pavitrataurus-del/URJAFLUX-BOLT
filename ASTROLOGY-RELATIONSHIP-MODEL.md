# DOMAIN-005 — Astrology Intelligence Library Relationship Model

## 1. Overview
Relationships in the Astrology Intelligence Library link entities across planetary governance, exaltation/debilitation states, house lordship, yoga dependencies, and cross-domain synapses.

## 2. Relationship Taxonomy (`AstrologyRelationshipType`)
- `RULES`: Planetary ownership of a Rashi or Nakshatra (e.g., Surya RULES Simha).
- `EXALTED_IN`: Peak exaltation relationship (e.g., Surya EXALTED_IN Mesha).
- `DEBILITATED_IN`: Peak debilitation relationship (e.g., Surya DEBILITATED_IN Tula).
- `MOOLTRIKONA_IN`: Primary work sign relationship (e.g., Surya MOOLTRIKONA_IN Simha 0°-20°).
- `ASPECTS`: Planetary vision/Drishti on houses or planets (e.g., Shani ASPECTS 3rd, 7th, 10th houses).
- `KARAKA_FOR`: Significator role for house domains (e.g., Surya KARAKA_FOR 1st House).
- `COMBINES_WITH`: Mutual combination forming a Yoga (e.g., Guru COMBINES_WITH Chandra for Gaja Kesari).
- `ASSOCIATED_WITH`: Cross-domain link (e.g., Surya ASSOCIATED_WITH Vastu East Direction & Agni Element).
- `DEPENDS_ON`: Structural dependency.

## 3. Pre-Defined Relationships

| Relationship ID | Source Entity | Target Entity | Relationship Type | Weight | Conditional Rule |
|---|---|---|---|---|---|
| `rel-surya-simha` | Surya (`grh-001`) | Simha (`rsh-005`) | RULES | 0.99 | None |
| `rel-surya-mesha` | Surya (`grh-001`) | Mesha (`rsh-001`) | EXALTED_IN | 0.98 | Exalted up to 10° |
| `rel-gaja-kesari` | Gaja Kesari (`yog-001`) | Chandra (`grh-002`) | DEPENDS_ON | 0.97 | Guru in Kendra from Chandra |
| `rel-surya-vastu-east` | Surya (`grh-001`) | Vastu East (`vst-dir-001`) | ASSOCIATED_WITH | 0.99 | Cross-Domain Vastu Link |

## 4. Cross-Domain Knowledge Graph Integration
- **Vastu Domain**: Planets map directly to cardinal directions (Surya -> East, Mangal -> South, Shani -> West, Budh -> North).
- **Chakra Domain**: Planets map to primary energetic chakras (Surya -> Manipura/Ajna, Chandra -> Swadhisthana).
- **Lal Kitab Domain**: Astro entities share planet-house placements and blind-house concepts.
- **Numerology Domain**: Planets link to Chaldean single-digit vibration values (Sun -> 1, Moon -> 2, Jupiter -> 3, Uranus/Rahu -> 4, Mercury -> 5, Venus -> 6, Neptune/Ketu -> 7, Saturn -> 8, Mars -> 9).

---
*URJAFLUX AI OS Graph Architecture Team — Approved Canonical Document*
