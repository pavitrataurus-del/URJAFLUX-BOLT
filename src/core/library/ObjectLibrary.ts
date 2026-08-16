export type LibraryCategory = 
  | 'chakras' 
  | 'yantras' 
  | 'furniture' 
  | 'remedies' 
  | 'symbols' 
  | 'cad';

export interface LibraryItem {
  id: string;
  name: string;
  category: LibraryCategory;
  version: string;
  description: string;
  iconName?: string;
  defaultScale: number;
  geometrySource: string; // 'SingleSourceGeometry'
  metadata: Record<string, any>;
  tags: string[];
}

export const OBJECT_LIBRARY: LibraryItem[] = [
  // --- CHAKRA OBJECTS ---
  {
    id: 'master-vastu-chakra',
    name: 'Master Vastu Chakra',
    category: 'chakras',
    version: '1.1',
    description: 'Complete 360° Vastu Chakra with 16 Zones, 32 Entrances, 45 Devtas, and Panchatattva alignment.',
    defaultScale: 0.8,
    geometrySource: 'SingleSourceGeometry',
    metadata: {
      type: 'CHAKRA',
      layers: ['directionChakra', 'entrances32', 'devta45', 'panchatattva'],
      numberOfSectors: 32,
    },
    tags: ['master', 'vastu', 'chakra', '16-zones', '32-entrances', '45-devta']
  },
  {
    id: '8-direction-chakra',
    name: '8-Direction Compass Chakra',
    category: 'chakras',
    version: '1.0',
    description: 'Fundamental Ashta-Dikpalak compass ring indicating N, NE, E, SE, S, SW, W, NW.',
    defaultScale: 0.7,
    geometrySource: 'SingleSourceGeometry',
    metadata: {
      type: 'CHAKRA',
      layers: ['directionChakra'],
      numberOfSectors: 8,
    },
    tags: ['8-directions', 'ashta-dikpalak', 'compass']
  },
  {
    id: '16-zone-chakra',
    name: '16-Zone Vastu Chakra',
    category: 'chakras',
    version: '1.0',
    description: 'Detailed 16 Vastu Energy Zones mapped precisely at 22.5° intervals.',
    defaultScale: 0.75,
    geometrySource: 'SingleSourceGeometry',
    metadata: {
      type: 'CHAKRA',
      layers: ['directionChakra'],
      numberOfSectors: 16,
    },
    tags: ['16-zones', 'vastu', 'energy-zones']
  },
  {
    id: '32-entrance-chakra',
    name: '32-Entrance Padavinyasa Chakra',
    category: 'chakras',
    version: '1.0',
    description: '32 Doorway Entrance Grid (N1-N8, E1-E8, S1-S8, W1-W8) highlighting positive entrance points.',
    defaultScale: 0.75,
    geometrySource: 'SingleSourceGeometry',
    metadata: {
      type: 'CHAKRA',
      layers: ['entrances32'],
      numberOfSectors: 32,
    },
    tags: ['32-entrances', 'doors', 'padavinyasa']
  },
  {
    id: '45-devta-chakra',
    name: '45-Devta Mandala Chakra',
    category: 'chakras',
    version: '1.0',
    description: '45 Celestial Energy Fields including Brahma Sthan, 8 Inner Deities, and 32 Perimeter Deities.',
    defaultScale: 0.85,
    geometrySource: 'SingleSourceGeometry',
    metadata: {
      type: 'CHAKRA',
      layers: ['devta45'],
      numberOfSectors: 32,
    },
    tags: ['45-devta', 'brahma-sthan', 'deities', 'mandala']
  },
  {
    id: 'panchatattva-chakra',
    name: 'Panchatattva 5 Elements Chakra',
    category: 'chakras',
    version: '1.0',
    description: 'Five Great Cosmic Elements (Water, Air, Fire, Earth, Space) sector distribution wheel.',
    defaultScale: 0.8,
    geometrySource: 'SingleSourceGeometry',
    metadata: {
      type: 'CHAKRA',
      layers: ['panchatattva'],
      numberOfSectors: 5,
    },
    tags: ['5-elements', 'panchatattva', 'jal', 'vayu', 'agni', 'prithvi', 'aakash']
  },

  // --- YANTRA LIBRARY ---
  {
    id: 'shri-yantra',
    name: 'Sacred Shri Yantra v1.0',
    category: 'yantras',
    version: '1.0',
    description: 'Supreme 9 Interlocking Triangles geometry for prosperity, harmony, and space alignment.',
    defaultScale: 0.5,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'YANTRA', category: 'prospective-geometry' },
    tags: ['yantra', 'shri-yantra', 'sacred-geometry']
  },
  {
    id: 'kuber-yantra',
    name: 'Kuber Yantra v1.0',
    category: 'yantras',
    version: '1.0',
    description: 'Lord Kuber wealth energizer placement object for North zone financial activation.',
    defaultScale: 0.4,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'YANTRA', category: 'wealth-remedy' },
    tags: ['kuber', 'wealth', 'north-remedy']
  },
  {
    id: 'vastu-dosh-nivaran-yantra',
    name: 'Vastu Dosh Nivaran Yantra v1.0',
    category: 'yantras',
    version: '1.0',
    description: 'Universal Vastu affliction correction geometric matrix.',
    defaultScale: 0.45,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'YANTRA', category: 'correction' },
    tags: ['vastu-dosh', 'correction', 'neutralizer']
  },

  // --- FURNITURE LIBRARY ---
  {
    id: 'master-bed',
    name: 'Master Bed (King) v1.0',
    category: 'furniture',
    version: '1.0',
    description: 'Standard King Size Bed with headboard orientation vector for SW zone sleep alignment.',
    defaultScale: 0.6,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'FURNITURE', width: 180, height: 200, zoneRule: 'SW' },
    tags: ['bed', 'furniture', 'bedroom', 'south-west']
  },
  {
    id: 'executive-desk',
    name: 'Executive Office Desk v1.0',
    category: 'furniture',
    version: '1.0',
    description: 'Working desk placement object for W or WSW zone productivity alignment.',
    defaultScale: 0.5,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'FURNITURE', width: 150, height: 80, zoneRule: 'W' },
    tags: ['desk', 'office', 'furniture', 'workstation']
  },
  {
    id: 'pooja-mandir',
    name: 'Pooja Mandir Altar v1.0',
    category: 'furniture',
    version: '1.0',
    description: 'Sacred Altar fixture object for NE (Ishan) zone spiritual alignment.',
    defaultScale: 0.4,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'FURNITURE', width: 100, height: 60, zoneRule: 'NE' },
    tags: ['pooja', 'mandir', 'altar', 'north-east']
  },
  {
    id: 'kitchen-stove',
    name: 'Kitchen Fire Cooking Hob v1.0',
    category: 'furniture',
    version: '1.0',
    description: 'Cooking stove symbol for SE (Agneya) zone fire balancing.',
    defaultScale: 0.45,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'FURNITURE', width: 90, height: 60, zoneRule: 'SE' },
    tags: ['kitchen', 'stove', 'fire', 'south-east']
  },

  // --- VASTU REMEDIES ---
  {
    id: 'copper-helix-rod',
    name: 'Copper Helix Rod v1.0',
    category: 'remedies',
    version: '1.0',
    description: 'SE / E Zone Fire Element energy booster rod for correcting kitchen/toilet cuts.',
    defaultScale: 0.3,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'REMEDY', material: 'Copper' },
    tags: ['remedy', 'copper', 'helix', 'south-east']
  },
  {
    id: 'brass-pyramid-grid',
    name: 'Brass Pyramid Energy Grid v1.0',
    category: 'remedies',
    version: '1.0',
    description: '9-Pyramid Brass plate for South/SW zone weight and stability enhancement.',
    defaultScale: 0.35,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'REMEDY', material: 'Brass' },
    tags: ['pyramid', 'brass', 'south-west']
  },
  {
    id: 'elemental-color-strip',
    name: 'Elemental Color Remedial Strip v1.0',
    category: 'remedies',
    version: '1.0',
    description: 'Virtual boundary color insulation tape for zone balancing.',
    defaultScale: 0.4,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'REMEDY', category: 'tape-remedy' },
    tags: ['color-tape', 'strip', 'zone-balancing']
  },

  // --- SYMBOLS ---
  {
    id: 'vedic-swastika',
    name: 'Vedic Swastika Symbol v1.0',
    category: 'symbols',
    version: '1.0',
    description: 'Auspicious positive energy symbol for Main Entrance doors.',
    defaultScale: 0.35,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'SYMBOL', category: 'auspicious' },
    tags: ['swastika', 'symbol', 'entrance']
  },
  {
    id: 'sacred-om',
    name: 'Sacred Om Symbol v1.0',
    category: 'symbols',
    version: '1.0',
    description: 'High-frequency primordial cosmic sound vibration symbol.',
    defaultScale: 0.35,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'SYMBOL', category: 'mantra' },
    tags: ['om', 'sacred', 'symbol']
  },

  // --- CAD COMPONENTS ---
  {
    id: 'main-entrance-door',
    name: 'Main Entrance Door v1.0',
    category: 'cad',
    version: '1.0',
    description: '2D CAD Door swing opening symbol with opening arc vector.',
    defaultScale: 0.5,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'CAD', category: 'architectural' },
    tags: ['door', 'cad', 'architecture']
  },
  {
    id: 'structural-column',
    name: 'Structural Pillar/Column v1.0',
    category: 'cad',
    version: '1.0',
    description: 'Load-bearing column CAD element for Brahma Sthan weight checking.',
    defaultScale: 0.3,
    geometrySource: 'SingleSourceGeometry',
    metadata: { type: 'CAD', category: 'structural' },
    tags: ['column', 'pillar', 'cad']
  }
];
