import { EntranceSector32, DevtaCell45, PanchatattvaRegion } from './types';

// Panchatattva (Five Elements) Mapping Regions
export const PANCHATATTVA_REGIONS: Record<string, PanchatattvaRegion> = {
  WATER: {
    element: 'Water',
    nameHindi: 'Jal Tattva',
    nameEnglish: 'Water Element',
    directionCode: 'N_NE',
    displayColor: '#3B82F6',
    description: 'Governs clarity, vision, flow of opportunities and immunity (North to North-East).'
  },
  AIR: {
    element: 'Air',
    nameHindi: 'Vayu Tattva',
    nameEnglish: 'Air / Wood Element',
    directionCode: 'E_ENE',
    displayColor: '#22C55E',
    description: 'Governs social connections, growth, expansion and fun (East to East-North-East).'
  },
  FIRE: {
    element: 'Fire',
    nameHindi: 'Agni Tattva',
    nameEnglish: 'Fire Element',
    directionCode: 'SE_SSE',
    displayColor: '#EF4444',
    description: 'Governs cash flow, liquidity, passion, power and confidence (South-East to South-South-East).'
  },
  EARTH: {
    element: 'Earth',
    nameHindi: 'Prithvi Tattva',
    nameEnglish: 'Earth Element',
    directionCode: 'S_SW',
    displayColor: '#EAB308',
    description: 'Governs stability, skills, relationships and grounding strength (South to South-West).'
  },
  SPACE: {
    element: 'Space',
    nameHindi: 'Akash Tattva',
    nameEnglish: 'Space Element',
    directionCode: 'W_NW_CENTER',
    displayColor: '#94A3B8',
    description: 'Governs gains, profits, space, storage and mental stillness (West, North-West, Brahmasthan).'
  }
};

// 32 Entrance Sectors (11.25° per sector around 360° compass starting from N1 = 337.5°)
export const ENTRANCE_SECTORS_32: EntranceSector32[] = [
  // NORTH SECTORS (N1 - N8)
  { id: 'N1', name: 'N1 - Roga', devtaName: 'Roga', startAngle: 337.5, endAngle: 348.75, cardinalGroup: 'NORTH', quality: 'UNFAVORABLE', effect: 'Sickness and financial instability' },
  { id: 'N2', name: 'N2 - Naga', devtaName: 'Naga', startAngle: 348.75, endAngle: 360.0, cardinalGroup: 'NORTH', quality: 'UNFAVORABLE', effect: 'Enmity and jealousy from relatives' },
  { id: 'N3', name: 'N3 - Mukhya', devtaName: 'Mukhya', startAngle: 0.0, endAngle: 11.25, cardinalGroup: 'NORTH', quality: 'FAVORABLE', effect: 'Prosperity, wealth and perfection' },
  { id: 'N4', name: 'N4 - Bhallat', devtaName: 'Bhallat', startAngle: 11.25, endAngle: 22.5, cardinalGroup: 'NORTH', quality: 'FAVORABLE', effect: 'Abundance of riches and property' },
  { id: 'N5', name: 'N5 - Soma', devtaName: 'Soma / Kuber', startAngle: 22.5, endAngle: 33.75, cardinalGroup: 'NORTH', quality: 'FAVORABLE', effect: 'Spiritual growth and money flow' },
  { id: 'N6', name: 'N6 - Bhujang', devtaName: 'Bhujang', startAngle: 33.75, endAngle: 45.0, cardinalGroup: 'NORTH', quality: 'UNFAVORABLE', effect: 'Conflict and rash behavior' },
  { id: 'N7', name: 'N7 - Aditi', devtaName: 'Aditi', startAngle: 45.0, endAngle: 56.25, cardinalGroup: 'NORTH', quality: 'NEUTRAL', effect: 'Peace of mind and women empowerment' },
  { id: 'N8', name: 'N8 - Diti', devtaName: 'Diti', startAngle: 56.25, endAngle: 67.5, cardinalGroup: 'NORTH', quality: 'UNFAVORABLE', effect: 'Vision problems and low energy' },

  // EAST SECTORS (E1 - E8)
  { id: 'E1', name: 'E1 - Shikhi', devtaName: 'Shikhi', startAngle: 67.5, endAngle: 78.75, cardinalGroup: 'EAST', quality: 'UNFAVORABLE', effect: 'Fire hazards and disputes' },
  { id: 'E2', name: 'E2 - Parjanya', devtaName: 'Parjanya', startAngle: 78.75, endAngle: 90.0, cardinalGroup: 'EAST', quality: 'NEUTRAL', effect: 'Wasteful expenditure' },
  { id: 'E3', name: 'E3 - Jayanta', devtaName: 'Jayanta', startAngle: 90.0, endAngle: 101.25, cardinalGroup: 'EAST', quality: 'FAVORABLE', effect: 'Victory, social recognition and joy' },
  { id: 'E4', name: 'E4 - Indra', devtaName: 'Indra', startAngle: 101.25, endAngle: 112.5, cardinalGroup: 'EAST', quality: 'FAVORABLE', effect: 'Government favors and royal status' },
  { id: 'E5', name: 'E5 - Surya', devtaName: 'Surya', startAngle: 112.5, endAngle: 123.75, cardinalGroup: 'EAST', quality: 'NEUTRAL', effect: 'Short temper and high ego' },
  { id: 'E6', name: 'E6 - Satya', devtaName: 'Satya', startAngle: 123.75, endAngle: 135.0, cardinalGroup: 'EAST', quality: 'UNFAVORABLE', effect: 'Breach of trust and false promises' },
  { id: 'E7', name: 'E7 - Bhrisha', devtaName: 'Bhrisha', startAngle: 135.0, endAngle: 146.25, cardinalGroup: 'EAST', quality: 'UNFAVORABLE', effect: 'Overthinking and anxiety' },
  { id: 'E8', name: 'E8 - Antariksha', devtaName: 'Antariksha', startAngle: 146.25, endAngle: 157.5, cardinalGroup: 'EAST', quality: 'UNFAVORABLE', effect: 'Theft and lack of security' },

  // SOUTH SECTORS (S1 - S8)
  { id: 'S1', name: 'S1 - Anil', devtaName: 'Anil', startAngle: 157.5, endAngle: 168.75, cardinalGroup: 'SOUTH', quality: 'UNFAVORABLE', effect: 'Disagreements with offspring' },
  { id: 'S2', name: 'S2 - Pusha', devtaName: 'Pusha', startAngle: 168.75, endAngle: 180.0, cardinalGroup: 'SOUTH', quality: 'NEUTRAL', effect: 'Servitude and hard labor' },
  { id: 'S3', name: 'S3 - Vitatha', devtaName: 'Vitatha', startAngle: 180.0, endAngle: 191.25, cardinalGroup: 'SOUTH', quality: 'FAVORABLE', effect: 'Prestige, wealth and fame' },
  { id: 'S4', name: 'S4 - Grihakshat', devtaName: 'Grihakshat', startAngle: 191.25, endAngle: 202.5, cardinalGroup: 'SOUTH', quality: 'FAVORABLE', effect: 'Growth in business and male child' },
  { id: 'S5', name: 'S5 - Yama', devtaName: 'Yama', startAngle: 202.5, endAngle: 213.75, cardinalGroup: 'SOUTH', quality: 'UNFAVORABLE', effect: 'Debts and legal worries' },
  { id: 'S6', name: 'S6 - Gandharva', devtaName: 'Gandharva', startAngle: 213.75, endAngle: 225.0, cardinalGroup: 'SOUTH', quality: 'UNFAVORABLE', effect: 'Poverty and lack of reputation' },
  { id: 'S7', name: 'S7 - Bhringraj', devtaName: 'Bhringraj', startAngle: 225.0, endAngle: 236.25, cardinalGroup: 'SOUTH', quality: 'UNFAVORABLE', effect: 'Hard work without results' },
  { id: 'S8', name: 'S8 - Mrig', devtaName: 'Mrig', startAngle: 236.25, endAngle: 247.5, cardinalGroup: 'SOUTH', quality: 'UNFAVORABLE', effect: 'Weakness in bodily health' },

  // WEST SECTORS (W1 - W8)
  { id: 'W1', name: 'W1 - Pitra', devtaName: 'Pitra', startAngle: 247.5, endAngle: 258.75, cardinalGroup: 'WEST', quality: 'UNFAVORABLE', effect: 'Instability and family disputes' },
  { id: 'W2', name: 'W2 - Dauvarik', devtaName: 'Dauvarik', startAngle: 258.75, endAngle: 270.0, cardinalGroup: 'WEST', quality: 'NEUTRAL', effect: 'Insecurity and doubts' },
  { id: 'W3', name: 'W3 - Sugreev', devtaName: 'Sugreev', startAngle: 270.0, endAngle: 281.25, cardinalGroup: 'WEST', quality: 'FAVORABLE', effect: 'Financial gains and knowledge' },
  { id: 'W4', name: 'W4 - Pushpadanta', devtaName: 'Pushpadanta', startAngle: 281.25, endAngle: 292.5, cardinalGroup: 'WEST', quality: 'FAVORABLE', effect: 'Fulfillment of desires and growth' },
  { id: 'W5', name: 'W5 - Varuna', devtaName: 'Varuna', startAngle: 292.5, endAngle: 303.75, cardinalGroup: 'WEST', quality: 'NEUTRAL', effect: 'Excessive expectations' },
  { id: 'W6', name: 'W6 - Asura', devtaName: 'Asura', startAngle: 303.75, endAngle: 315.0, cardinalGroup: 'WEST', quality: 'UNFAVORABLE', effect: 'Lethargy and depression' },
  { id: 'W7', name: 'W7 - Shoshana', devtaName: 'Shoshana', startAngle: 315.0, endAngle: 326.25, cardinalGroup: 'WEST', quality: 'UNFAVORABLE', effect: 'Health problems and stress' },
  { id: 'W8', name: 'W8 - Papyakshma', devtaName: 'Papyakshma', startAngle: 326.25, endAngle: 337.5, cardinalGroup: 'WEST', quality: 'UNFAVORABLE', effect: 'Chronic illnesses and addiction' }
];

// 45 Devta Cells in Vastu Purusha Mandala
export const DEVTA_CELLS_45: DevtaCell45[] = [
  // BRAHMA (Central 1)
  { id: 'DEV_01', name: 'Brahma', devtaType: 'CREATOR', ring: 'BRAHMA', angularSector: 'CENTER', attributes: 'Source of cosmic energy, central consciousness, supreme balance' },

  // INNER RING (12 Padadevtas)
  { id: 'DEV_02', name: 'Bhudhar', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'NORTH', attributes: 'Manifestation power, stability, foundational strength' },
  { id: 'DEV_03', name: 'Aryama', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'EAST', attributes: 'Relationships, marriage, social alliances' },
  { id: 'DEV_04', name: 'Vivasvan', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'SOUTH', attributes: 'Status, fame, vital solar power' },
  { id: 'DEV_05', name: 'Mitra', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'WEST', attributes: 'Trust, honesty, commercial agreements' },
  { id: 'DEV_06', name: 'Aap', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'NORTH_EAST', attributes: 'Healing energy, water flow, life force' },
  { id: 'DEV_07', name: 'Aapavatsa', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'NORTH_EAST', attributes: 'Nourishment, nectar, vital fluids' },
  { id: 'DEV_08', name: 'Savita', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'SOUTH_EAST', attributes: 'Ignition, starting new projects, illumination' },
  { id: 'DEV_09', name: 'Savitra', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'SOUTH_EAST', attributes: 'Willpower, motivation, perseverance' },
  { id: 'DEV_10', name: 'Jaya', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'SOUTH_WEST', attributes: 'Victory, courage, strength to overcome obstacles' },
  { id: 'DEV_11', name: 'Indra (Inner)', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'SOUTH_WEST', attributes: 'Command, leadership, administrative authority' },
  { id: 'DEV_12', name: 'Rudra', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'NORTH_WEST', attributes: 'Transformation, dissolution of negativity, focus' },
  { id: 'DEV_13', name: 'Rajayakshma', devtaType: 'INNER_PADADEVTA', ring: 'INNER', angularSector: 'NORTH_WEST', attributes: 'Holding power, retention, control' },

  // OUTER RING (32 Peripheral Deities corresponding to sectors)
  { id: 'DEV_14', name: 'Shikhi', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NE', attributes: 'Fire element, spiritual sight' },
  { id: 'DEV_15', name: 'Parjanya', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'ENE', attributes: 'Clouds, rain, insight' },
  { id: 'DEV_16', name: 'Jayanta', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'E', attributes: 'Success, zeal, victories' },
  { id: 'DEV_17', name: 'Indra', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'E', attributes: 'Power, state support' },
  { id: 'DEV_18', name: 'Surya', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'ESE', attributes: 'Health, vitality, soul energy' },
  { id: 'DEV_19', name: 'Satya', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'ESE', attributes: 'Truth, goodwill, honor' },
  { id: 'DEV_20', name: 'Bhrisha', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'SE', attributes: 'Gravity, attraction' },
  { id: 'DEV_21', name: 'Antariksha', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'SE', attributes: 'Atmosphere, space' },
  { id: 'DEV_22', name: 'Anil', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'SSE', attributes: 'Air, movement' },
  { id: 'DEV_23', name: 'Pusha', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'S', attributes: 'Protection, nourishment' },
  { id: 'DEV_24', name: 'Vitatha', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'S', attributes: 'Falsehood, vanity' },
  { id: 'DEV_25', name: 'Grihakshat', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'SSW', attributes: 'Householder stability' },
  { id: 'DEV_26', name: 'Yama', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'SSW', attributes: 'Justice, discipline, duty' },
  { id: 'DEV_27', name: 'Gandharva', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'SW', attributes: 'Art, music, charm' },
  { id: 'DEV_28', name: 'Bhringraj', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'SW', attributes: 'Extracting essence, discrimination' },
  { id: 'DEV_29', name: 'Mrig', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'WSW', attributes: 'Search, research, curiosity' },
  { id: 'DEV_30', name: 'Pitra', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'WSW', attributes: 'Ancestral blessings, legacy' },
  { id: 'DEV_31', name: 'Dauvarik', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'W', attributes: 'Gatekeeper, filter' },
  { id: 'DEV_32', name: 'Sugreev', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'W', attributes: 'Acquisition of knowledge' },
  { id: 'DEV_33', name: 'Pushpadanta', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'WNW', attributes: 'Flow of prosperity, elegance' },
  { id: 'DEV_34', name: 'Varuna', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'WNW', attributes: 'Ocean, cosmic order, liquidity' },
  { id: 'DEV_35', name: 'Asura', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NW', attributes: 'Intellect, critical thinking' },
  { id: 'DEV_36', name: 'Shoshana', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NW', attributes: 'Drying up, detox' },
  { id: 'DEV_37', name: 'Papyakshma', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NNW', attributes: 'Remover of guilt' },
  { id: 'DEV_38', name: 'Roga', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NNW', attributes: 'Destruction of disease' },
  { id: 'DEV_39', name: 'Naga', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'N', attributes: 'Cosmic serpent, intuition' },
  { id: 'DEV_40', name: 'Mukhya', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'N', attributes: 'Main entrance, key focus' },
  { id: 'DEV_41', name: 'Bhallat', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NNE', attributes: 'Abundance, vastness' },
  { id: 'DEV_42', name: 'Soma', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NNE', attributes: 'Treasure, elixir of peace' },
  { id: 'DEV_43', name: 'Bhujang', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NE', attributes: 'Flexibility, agility' },
  { id: 'DEV_44', name: 'Aditi', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NE', attributes: 'Boundless mother energy' },
  { id: 'DEV_45', name: 'Diti', devtaType: 'OUTER_DEVTA', ring: 'OUTER', angularSector: 'NE', attributes: 'Individual mind, discrimination' }
];
