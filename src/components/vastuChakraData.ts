export interface VastuZoneInfo {
  code: string;
  name: string;
  startDeg: number;
  endDeg: number;
  centerDeg: number;
  element: "Water" | "Fire" | "Earth" | "Air" | "Space";
  color: string;
  fillColor: string;
  gradientId: string;
  description: string;
}

export interface VastuPadaInfo {
  code: string;
  direction: "N" | "E" | "S" | "W";
  num: number;
  startDeg: number;
  endDeg: number;
  centerDeg: number;
  isAuspicious: boolean;
}

export const VASTU_16_ZONES: VastuZoneInfo[] = [
  { code: "N", name: "North (Kubera / Wealth)", startDeg: 348.75, endDeg: 11.25, centerDeg: 0, element: "Water", color: "#38bdf8", fillColor: "rgba(56, 189, 248, 0.10)", gradientId: "grad-water", description: "Money, New Opportunities, Career Growth" },
  { code: "NNE", name: "North-North-East (Health)", startDeg: 11.25, endDeg: 33.75, centerDeg: 22.5, element: "Water", color: "#0284c7", fillColor: "rgba(2, 132, 199, 0.10)", gradientId: "grad-water", description: "Health, Immunity, Healing Energy" },
  { code: "NE", name: "North-East (Ishanya / Mind)", startDeg: 33.75, endDeg: 56.25, centerDeg: 45, element: "Water", color: "#60a5fa", fillColor: "rgba(96, 165, 250, 0.12)", gradientId: "grad-water-ne", description: "Clarity, Wisdom, Divine Energy, Puja Room" },
  { code: "ENE", name: "East-North-East (Joy)", startDeg: 56.25, endDeg: 78.75, centerDeg: 67.5, element: "Air", color: "#34d399", fillColor: "rgba(52, 211, 153, 0.10)", gradientId: "grad-air", description: "Recreation, Joy, Fun, Relaxation" },
  { code: "E", name: "East (Indra / Social Connection)", startDeg: 78.75, endDeg: 101.25, centerDeg: 90, element: "Air", color: "#10b981", fillColor: "rgba(16, 185, 129, 0.10)", gradientId: "grad-air", description: "Social Networking, Government Contacts" },
  { code: "ESE", name: "East-South-East (Churning)", startDeg: 101.25, endDeg: 123.75, centerDeg: 112.5, element: "Air", color: "#059669", fillColor: "rgba(5, 150, 105, 0.10)", gradientId: "grad-air", description: "Overthinking, Anxiety, Churning" },
  { code: "SE", name: "South-East (Agneya / Cash)", startDeg: 123.75, endDeg: 146.25, centerDeg: 135, element: "Fire", color: "#f87171", fillColor: "rgba(248, 113, 113, 0.12)", gradientId: "grad-fire", description: "Kitchen, Cash Flow, Passion, Energy" },
  { code: "SSE", name: "South-South-East (Confidence)", startDeg: 146.25, endDeg: 168.75, centerDeg: 157.5, element: "Fire", color: "#fb923c", fillColor: "rgba(251, 146, 60, 0.10)", gradientId: "grad-fire", description: "Confidence, Power, Strength" },
  { code: "S", name: "South (Yama / Fame & Rest)", startDeg: 168.75, endDeg: 191.25, centerDeg: 180, element: "Fire", color: "#f43f5e", fillColor: "rgba(244, 63, 94, 0.10)", gradientId: "grad-fire", description: "Fame, Name, Relaxation, Restful Sleep" },
  { code: "SSW", name: "South-South-West (Expenditure)", startDeg: 191.25, endDeg: 213.75, centerDeg: 202.5, element: "Earth", color: "#fbbf24", fillColor: "rgba(251, 191, 36, 0.10)", gradientId: "grad-earth", description: "Disposal, Waste, Expenditure, Toilet Zone" },
  { code: "SW", name: "South-West (Relationships)", startDeg: 213.75, endDeg: 236.25, centerDeg: 225, element: "Earth", color: "#d97706", fillColor: "rgba(217, 119, 6, 0.12)", gradientId: "grad-earth", description: "Stability, Skills, Master Bedroom, Relationships" },
  { code: "WSW", name: "West-South-West (Education)", startDeg: 236.25, endDeg: 258.75, centerDeg: 247.5, element: "Space", color: "#a78bfa", fillColor: "rgba(167, 139, 250, 0.10)", gradientId: "grad-space", description: "Knowledge, Education, Savings" },
  { code: "W", name: "West (Varuna / Gains & Profits)", startDeg: 258.75, endDeg: 281.25, centerDeg: 270, element: "Space", color: "#818cf8", fillColor: "rgba(129, 140, 248, 0.10)", gradientId: "grad-space", description: "Gains, Profits, Wish Fulfillment" },
  { code: "WNW", name: "West-North-West (Detox)", startDeg: 281.25, endDeg: 303.75, centerDeg: 292.5, element: "Space", color: "#c084fc", fillColor: "rgba(192, 132, 252, 0.10)", gradientId: "grad-space", description: "Detoxification, Depression Release, Low Energy" },
  { code: "NW", name: "North-West (Vayu / Support)", startDeg: 303.75, endDeg: 326.25, centerDeg: 315, element: "Space", color: "#38bdf8", fillColor: "rgba(56, 189, 248, 0.10)", gradientId: "grad-space", description: "Support, Banking, Financial Help, Guest Room" },
  { code: "NNW", name: "North-North-West (Attraction)", startDeg: 326.25, endDeg: 348.75, centerDeg: 337.5, element: "Water", color: "#22d3ee", fillColor: "rgba(34, 211, 238, 0.10)", gradientId: "grad-water", description: "Attraction, Marital Harmony, Sex & Sensuality" }
];

// Generate 32 Sub-Entrance Padas (N1-N8, E1-E8, S1-S8, W1-W8)
export const VASTU_32_PADAS: VastuPadaInfo[] = (() => {
  const padas: VastuPadaInfo[] = [];
  // 32 sectors of 11.25 degrees each starting at 337.5° (N8/N1 boundary)
  // Auspicious entrance padas in classical Vastu Shastra: N3, N4, N5, E3, E4, S3, S4, W3, W4, W5
  const auspiciousCodes = ["N3", "N4", "N5", "E3", "E4", "S3", "S4", "W3", "W4", "W5"];

  const dirOrder: Array<{ dir: "N" | "E" | "S" | "W"; start: number }> = [
    { dir: "N", start: 337.5 },
    { dir: "E", start: 67.5 },
    { dir: "S", start: 157.5 },
    { dir: "W", start: 247.5 }
  ];

  dirOrder.forEach(({ dir, start }) => {
    for (let i = 1; i <= 8; i++) {
      let startDeg = (start + (i - 1) * 11.25) % 360;
      let endDeg = (start + i * 11.25) % 360;
      let centerDeg = (startDeg + 5.625) % 360;
      const code = `${dir}${i}`;

      padas.push({
        code,
        direction: dir,
        num: i,
        startDeg,
        endDeg,
        centerDeg,
        isAuspicious: auspiciousCodes.includes(code)
      });
    }
  });

  return padas;
})();

export function describeSvgSector(cx: number, cy: number, rInner: number, rOuter: number, startAngleDeg: number, endAngleDeg: number): string {
  // SVG angles: 0deg is North (top, -90deg in standard math coordinates)
  let start = startAngleDeg;
  let end = endAngleDeg;
  if (start > end) {
    end += 360;
  }
  
  const startRad = ((start - 90) * Math.PI) / 180;
  const endRad = ((end - 90) * Math.PI) / 180;

  const xOuterStart = cx + rOuter * Math.cos(startRad);
  const yOuterStart = cy + rOuter * Math.sin(startRad);
  const xOuterEnd = cx + rOuter * Math.cos(endRad);
  const yOuterEnd = cy + rOuter * Math.sin(endRad);

  const xInnerEnd = cx + rInner * Math.cos(endRad);
  const yInnerEnd = cy + rInner * Math.sin(endRad);
  const xInnerStart = cx + rInner * Math.cos(startRad);
  const yInnerStart = cy + rInner * Math.sin(startRad);

  const largeArcFlag = (end - start) <= 180 ? "0" : "1";

  if (rInner <= 0) {
    return `M ${cx} ${cy} L ${xOuterStart} ${yOuterStart} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${xOuterEnd} ${yOuterEnd} Z`;
  }

  return `M ${xOuterStart} ${yOuterStart} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${xOuterEnd} ${yOuterEnd} L ${xInnerEnd} ${yInnerEnd} A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${xInnerStart} ${yInnerStart} Z`;
}
