# DOMAIN-005 — Astrology Intelligence Library Ontology & Taxonomy Specification

## 1. Executive Summary & Purpose
The **Enterprise Astrology Intelligence Library** serves as the canonical, evidence-backed knowledge repository for classical Vedic and traditional Astrology within the **URJAFLUX AI OS** ecosystem. It provides verified metadata, shloka citations, and relational linkages without performing any chart calculations or astrological predictions.

## 2. Core Architectural Scope Boundaries
> **Mandate**: DOMAIN-005 is exclusively a Knowledge Library. It DOES NOT calculate Kundlis, compute planetary longitudes, perform transit forecasts, or prescribe remedies.

- **Primary Responsibility**: Store, verify, structure, version, and retrieve classical astrological literature and taxonomy.
- **Data Integrity**: Every entity links directly to a classical manuscript source (e.g., *Brihat Parashara Hora Shastra*, *Phaladeepika*, *Saravali*, *Brihat Samhita*).

## 3. Entity Taxonomy & Classifications
The Astrology Ontology structures knowledge across eight core entity types:

### 3.1 Graha (Celestial Bodies)
- **Entities**: Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu.
- **Attributes**: Exaltation sign/degree, Debilitation sign/degree, Mooltrikona arc, Caste, Gender, Element, Guna, Karakatvas, Associated Gemstone, Metal, Direction.

### 3.2 Rashi (Zodiac Signs)
- **Entities**: Mesha, Vrishabha, Mithuna, Karka, Simha, Kanya, Tula, Vrishchika, Dhanu, Makara, Kumbha, Meena.
- **Attributes**: Sign number, Modality (Chara/Sthira/Dwiswabhava), Element (Agni/Jala/Vayu/Prithvi), Governing Graha, Body Signification, Symbol.

### 3.3 Nakshatra (Lunar Mansions)
- **Entities**: 27 Lunar Mansions (Ashwini to Revati) + Abhijit.
- **Attributes**: Span degrees, Dasha lord, Ruling deity, Symbol, Gana, Yoni, Animal, Body part.

### 3.4 Bhava (Astrological Houses)
- **Entities**: 1st House (Lagna) to 12th House (Vyaya).
- **Attributes**: House classification (Kendra, Trikona, Dusthana, Upachaya, Maraka), Karaka Grahas, Life domains.

### 3.5 Yoga (Astrological Combinations)
- **Entities**: Gaja Kesari, Budhaditya, Pancha Mahapurusha Yogas, Raja Yogas, Dhana Yogas.
- **Attributes**: Classical formula, Benefic/Malefic classification, Classical text references.

### 3.6 DivisionalChart (Vargas)
- **Entities**: D1 (Rashi), D2 (Hora), D3 (Drekkana), D7 (Saptamsha), D9 (Navamsha), D10 (Dashamsha), D12 (Dwadasamsha), D60 (Shashtiamsha).
- **Attributes**: Division factor, Specific domain signification.

### 3.7 DashaConcept (Planetary Time Cycles)
- **Entities**: Vimshottari (120-year), Yogini, Chara Dasha frameworks.
- **Attributes**: Sequential ordering, Duration years, Conceptual framework (non-computational).

### 3.8 PlanetaryState (Avasthas)
- **Entities**: Exaltation (Ucca), Debilitation (Neeca), Mooltrikona, Swakshetra (Own Sign), combustion, retrograde.
- **Attributes**: Definition, Impact weight, Textual authority.

## 4. Primary Classical Reference Sources
1. **Brihat Parashara Hora Shastra (BPHS)** — Maharishi Parashara
2. **Phaladeepika** — Mantreswara
3. **Saravali** — Kalyana Varma
4. **Brihat Samhita** — Varahamihira
5. **Horasara** — Prithuyasas

---
*URJAFLUX AI OS Architecture Board — Approved Canonical Document*
