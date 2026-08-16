# DOMAIN-005 — Astrology Intelligence Library Entity Library Catalog

## 1. Overview
This document catalogs the pre-populated canonical entities available in `AstrologyOntologyCatalog.ts` and managed by `AstrologyMasterKnowledgeRegistry.ts`.

## 2. Pre-Populated Canonical Entities

| Entity ID | Entity Type | Canonical Name | Sanskrit Name | Associated Element / Planet / Sign | Classical Source | Confidence Score |
|---|---|---|---|---|---|---|
| `grh-001` | Graha | Surya (Sun) — Soul & Cosmic Authority | सूर्य (Surya) | Fire / Simha / Mesha Exalted | BPHS Ch. 3 | 99% (A+) |
| `grh-002` | Graha | Chandra (Moon) — Mind & Emotions | चन्द्र (Chandra) | Water / Karka / Vrishabha Exalted | BPHS Ch. 3 | 99% (A+) |
| `rsh-001` | Rashi | Mesha Rashi (Aries) — Primal Fire | मेष (Mesha) | Agni / Mangal Owned / Surya Exalted | BPHS Ch. 4 | 98% (A+) |
| `nak-001` | Nakshatra | Ashwini Nakshatra — Celestial Physicians | अश्विनी (Ashwini) | Mesha 0°-13°20' / Ketu Lord | Brihat Samhita Ch. 15 | 97% (A+) |
| `bhv-001` | Bhava | 1st Bhava (Lagna / Tanu) — Self & Body | प्रथम भाव | Head / Self / Surya Karaka | BPHS Ch. 7 | 99% (A+) |
| `bhv-010` | Bhava | 10th Bhava (Karma) — Profession & Status | दशम भाव | Career / Shani & Surya Karaka | BPHS Ch. 7 | 98% (A+) |
| `yog-001` | Yoga | Gaja Kesari Yoga — Wisdom & Fame | गजकेसरी योग | Guru in Kendra from Chandra | Phaladeepika Ch. 6 | 98% (A+) |
| `div-009` | DivisionalChart | D9 Navamsha Chart — Soul Destiny | नवांश चक्र | 1/9th Division / Spousal Karma | BPHS Ch. 6 | 99% (A+) |
| `dsh-001` | DashaConcept | Vimshottari Dasha Framework (120-Yr) | विंशोत्तरी दशा | 9 Planetary Cycles (Ketu to Budh) | BPHS Ch. 46 | 99% (A+) |

## 3. Entity Classification Rules & Attributes
1. **Grahas**: Must include exaltation, debilitation, and mooltrikona parameters.
2. **Rashis**: Must define sign number (1-12), modality, element, and governing planet.
3. **Nakshatras**: Must specify span degrees, Dasha lord, deity, and symbol.
4. **Bhavas**: Must classify house category (Kendra, Trikona, Dusthana) and primary Karakas.
5. **Yogas**: Must state exact planetary combination conditions and classical text references.

---
*URJAFLUX AI OS Ontology Team — Approved Canonical Document*
