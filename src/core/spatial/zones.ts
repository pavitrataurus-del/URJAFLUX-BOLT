import { VastuZone } from './types';

// The 8 principal zones (Octants) used currently
export const VASTU_ZONES_8: VastuZone[] = [
  { id: "N", name: "North", startAngle: 337.5, endAngle: 22.5, displayColor: "bg-blue-500", element: "Water", planet: "Mercury", devta: "Kubera", priority: 1 },
  { id: "NE", name: "North-East", startAngle: 22.5, endAngle: 67.5, displayColor: "bg-blue-300", element: "Water", planet: "Jupiter", devta: "Shiva", priority: 2 },
  { id: "E", name: "East", startAngle: 67.5, endAngle: 112.5, displayColor: "bg-green-500", element: "Air", planet: "Sun", devta: "Indra", priority: 1 },
  { id: "SE", name: "South-East", startAngle: 112.5, endAngle: 157.5, displayColor: "bg-red-500", element: "Fire", planet: "Venus", devta: "Agni", priority: 2 },
  { id: "S", name: "South", startAngle: 157.5, endAngle: 202.5, displayColor: "bg-orange-500", element: "Earth", planet: "Mars", devta: "Yama", priority: 1 },
  { id: "SW", name: "South-West", startAngle: 202.5, endAngle: 247.5, displayColor: "bg-yellow-600", element: "Earth", planet: "Rahu", devta: "Pitri", priority: 2 },
  { id: "W", name: "West", startAngle: 247.5, endAngle: 292.5, displayColor: "bg-slate-400", element: "Space", planet: "Saturn", devta: "Varuna", priority: 1 },
  { id: "NW", name: "North-West", startAngle: 292.5, endAngle: 337.5, displayColor: "bg-slate-200", element: "Space", planet: "Moon", devta: "Vayu", priority: 2 },
  { id: "Center", name: "Brahmasthan", startAngle: 0, endAngle: 0, displayColor: "bg-white", element: "Space", planet: "None", devta: "Brahma", priority: 0 }
];

export const VASTU_ZONES_16: VastuZone[] = [
  { id: "N", name: "North", startAngle: 348.75, endAngle: 11.25, displayColor: "bg-blue-500", element: "Water", planet: "Mercury", devta: "Kubera", priority: 1 },
  { id: "NNE", name: "North-North-East", startAngle: 11.25, endAngle: 33.75, displayColor: "bg-blue-400", element: "Water", planet: "Jupiter", devta: "Shiva", priority: 2 },
  { id: "NE", name: "North-East", startAngle: 33.75, endAngle: 56.25, displayColor: "bg-blue-300", element: "Water", planet: "Jupiter", devta: "Shiva", priority: 2 },
  { id: "ENE", name: "East-North-East", startAngle: 56.25, endAngle: 78.75, displayColor: "bg-green-400", element: "Air", planet: "Sun", devta: "Indra", priority: 1 },
  { id: "E", name: "East", startAngle: 78.75, endAngle: 101.25, displayColor: "bg-green-500", element: "Air", planet: "Sun", devta: "Indra", priority: 1 },
  { id: "ESE", name: "East-South-East", startAngle: 101.25, endAngle: 123.75, displayColor: "bg-red-400", element: "Fire", planet: "Venus", devta: "Agni", priority: 2 },
  { id: "SE", name: "South-East", startAngle: 123.75, endAngle: 146.25, displayColor: "bg-red-500", element: "Fire", planet: "Venus", devta: "Agni", priority: 2 },
  { id: "SSE", name: "South-South-East", startAngle: 146.25, endAngle: 168.75, displayColor: "bg-orange-400", element: "Earth", planet: "Mars", devta: "Yama", priority: 1 },
  { id: "S", name: "South", startAngle: 168.75, endAngle: 191.25, displayColor: "bg-orange-500", element: "Earth", planet: "Mars", devta: "Yama", priority: 1 },
  { id: "SSW", name: "South-South-West", startAngle: 191.25, endAngle: 213.75, displayColor: "bg-yellow-500", element: "Earth", planet: "Rahu", devta: "Pitri", priority: 2 },
  { id: "SW", name: "South-West", startAngle: 213.75, endAngle: 236.25, displayColor: "bg-yellow-600", element: "Earth", planet: "Rahu", devta: "Pitri", priority: 2 },
  { id: "WSW", name: "West-South-West", startAngle: 236.25, endAngle: 258.75, displayColor: "bg-slate-500", element: "Space", planet: "Saturn", devta: "Varuna", priority: 1 },
  { id: "W", name: "West", startAngle: 258.75, endAngle: 281.25, displayColor: "bg-slate-400", element: "Space", planet: "Saturn", devta: "Varuna", priority: 1 },
  { id: "WNW", name: "West-North-West", startAngle: 281.25, endAngle: 303.75, displayColor: "bg-slate-300", element: "Space", planet: "Moon", devta: "Vayu", priority: 2 },
  { id: "NW", name: "North-West", startAngle: 303.75, endAngle: 326.25, displayColor: "bg-slate-200", element: "Space", planet: "Moon", devta: "Vayu", priority: 2 },
  { id: "NNW", name: "North-North-West", startAngle: 326.25, endAngle: 348.75, displayColor: "bg-slate-200", element: "Space", planet: "Moon", devta: "Vayu", priority: 2 },
  { id: "Center", name: "Brahmasthan", startAngle: 0, endAngle: 0, displayColor: "bg-white", element: "Space", planet: "None", devta: "Brahma", priority: 0 }
];

export const VASTU_ZONES_32: VastuZone[] = [
  // Future use
];
