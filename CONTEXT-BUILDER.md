# Context Builder Specification — DOMAIN-006

## Objective
The `ContextBuilder` normalizes heterogeneous inputs across spatial, temporal, planetary, energetic, and numeric dimensions into a single unified context graph (`IUnifiedReasoningContext`).

## Inputs Normalized
1. **Property Parameters**: Category (Residential, Commercial, Industrial, Personal).
2. **Spatial Zone**: Room / Direction (Northeast, Southwest, Center, Northwest, Southeast).
3. **Pancha Tattva Element**: Agni, Jala, Prithvi, Vayu, Akasha.
4. **Graha / Planetary Ruler**: Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu.
5. **Chakra Focal Zone**: Muladhara, Swadhisthana, Manipura, Anahata, Vishuddha, Ajna, Sahasrara.
6. **Numeric Vibrations**: Life Path & Chaldean Name Numbers.
7. **Astrological Rashi/Bhava**: Natal placement references.

## Graph Graph Structure
- **Nodes (`IReasoningGraphNode`)**:
  - `id`: Unique node identifier
  - `domain`: Vastu | Chakra | LalKitab | Numerology | Astrology | UserContext
  - `entityId`: Canonical entity ID
  - `confidenceScore`: Quality score from Truth Engine
- **Edges (`IReasoningGraphEdge`)**:
  - `sourceNodeId` / `targetNodeId`
  - `relationType`: e.g. `APPLIES_SPATIAL_RULE`, `ENERGETIC_SYNAPSE`, `REMEDIAL_KARMIC_LINK`
  - `isCrossDomain`: Boolean flag indicating cross-domain synapse link
