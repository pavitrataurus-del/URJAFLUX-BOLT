/**
 * URJAFLUX AI OS — Classical Knowledge Canon Database
 * Approved Vastu Shastra Canon Citations and Spatial Principles.
 */

export interface VastuCanonItem {
  id: string;
  topic: string;
  shlokaReference: string;
  canonSource: string;
  description: string;
  keywords: string[];
}

export const VASTU_CANON_DATABASE: VastuCanonItem[] = [
  {
    id: "CANON-01",
    topic: "Brahmasthan",
    shlokaReference: "Vishwakarma Prakash, Chapter 4, Verse 12",
    canonSource: "Vishwakarma Prakash",
    description: "The central zone of any spatial layout must remain open, unburdened by heavy structures, pillars, or water bodies to ensure free energy circulation.",
    keywords: ["brahmasthan", "center", "middle", "open space", "heavy weight"]
  },
  {
    id: "CANON-02",
    topic: "Kitchen",
    shlokaReference: "Mayamatam, Chapter 7, Verse 45",
    canonSource: "Mayamatam",
    description: "The South-East (Agni/Fire) quadrant is optimal for culinary fire placement (Pachanalayam) to balance elemental energy.",
    keywords: ["kitchen", "rasoi", "cookhouse", "fire", "agni", "south-east", "se"]
  },
  {
    id: "CANON-03",
    topic: "Master Bedroom",
    shlokaReference: "Samarangana Sutradhara, Chapter 18, Verse 8",
    canonSource: "Samarangana Sutradhara",
    description: "The South-West (Nairitya/Earth) zone provides maximum stability and gravitational grounding, making it ideal for the head of the household.",
    keywords: ["bedroom", "master bedroom", "south-west", "sw", "nairitya", "stability"]
  },
  {
    id: "CANON-04",
    topic: "Toilet & Waste",
    shlokaReference: "Brihat Samhita, Chapter 53, Verse 22",
    canonSource: "Brihat Samhita",
    description: "Sanitary facilities and waste disposal points should be positioned in North-West (Vayavya) or South-of-South-West, avoiding sacred zones.",
    keywords: ["toilet", "bathroom", "shauchalay", "north-west", "nw", "vayavya", "wc"]
  },
  {
    id: "CANON-05",
    topic: "Entrance Door",
    shlokaReference: "Vishwakarma Prakash, Chapter 5, Verse 3",
    canonSource: "Vishwakarma Prakash",
    description: "Main entrances positioned in auspicious padas of North (Kubera) or East (Aditya) invite positive cosmic magnetic flux.",
    keywords: ["entrance", "door", "pravesh", "dwar", "main door", "north", "east"]
  }
];
