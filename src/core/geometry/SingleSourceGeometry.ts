export interface DirectionDefinition {
  code: string;
  name: string;
  angle: number;
  color: string;
  element: string;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  startAngle: number;
  endAngle: number;
  color: string;
  element: string;
}

export interface EntranceDefinition {
  code: string;
  name: string;
  direction: 'N' | 'E' | 'S' | 'W';
  index: number;
  angle: number;
  positive: boolean;
}

export interface PanchatattvaElement {
  id: string;
  name: string;
  color: string;
  bgFill: string;
  stroke: string;
  startAngle: number;
  endAngle: number;
}

export class SingleSourceGeometry {
  public static readonly BASE_RADIUS = 420;

  public static readonly DIRECTIONS_8: DirectionDefinition[] = [
    { code: 'N', name: 'North', angle: 0, color: '#60a5fa', element: 'Water' },
    { code: 'NE', name: 'North-East', angle: 45, color: '#38bdf8', element: 'Water/Air' },
    { code: 'E', name: 'East', angle: 90, color: '#22c55e', element: 'Air' },
    { code: 'SE', name: 'South-East', angle: 135, color: '#ef4444', element: 'Fire' },
    { code: 'S', name: 'South', angle: 180, color: '#f97316', element: 'Fire/Earth' },
    { code: 'SW', name: 'South-West', angle: 225, color: '#eab308', element: 'Earth' },
    { code: 'W', name: 'West', angle: 270, color: '#cbd5e1', element: 'Space' },
    { code: 'NW', name: 'North-West', angle: 315, color: '#f1f5f9', element: 'Space/Water' },
  ];

  public static readonly VASTU_ZONES_16: ZoneDefinition[] = [
    { id: 'N', name: 'North', startAngle: 348.75, endAngle: 11.25, color: '#0ea5e9', element: 'Water' },
    { id: 'NNE', name: 'North-North-East', startAngle: 11.25, endAngle: 33.75, color: '#0284c7', element: 'Water' },
    { id: 'NE', name: 'North-East', startAngle: 33.75, endAngle: 56.25, color: '#38bdf8', element: 'Water' },
    { id: 'ENE', name: 'East-North-East', startAngle: 56.25, endAngle: 78.75, color: '#4ade80', element: 'Air' },
    { id: 'E', name: 'East', startAngle: 78.75, endAngle: 101.25, color: '#22c55e', element: 'Air' },
    { id: 'ESE', name: 'East-South-East', startAngle: 101.25, endAngle: 123.75, color: '#f87171', element: 'Fire' },
    { id: 'SE', name: 'South-East', startAngle: 123.75, endAngle: 146.25, color: '#ef4444', element: 'Fire' },
    { id: 'SSE', name: 'South-South-East', startAngle: 146.25, endAngle: 168.75, color: '#fb923c', element: 'Fire' },
    { id: 'S', name: 'South', startAngle: 168.75, endAngle: 191.25, color: '#f97316', element: 'Fire' },
    { id: 'SSW', name: 'South-South-West', startAngle: 191.25, endAngle: 213.75, color: '#facc15', element: 'Earth' },
    { id: 'SW', name: 'South-West', startAngle: 213.75, endAngle: 236.25, color: '#eab308', element: 'Earth' },
    { id: 'WSW', name: 'West-South-West', startAngle: 236.25, endAngle: 258.75, color: '#94a3b8', element: 'Space' },
    { id: 'W', name: 'West', startAngle: 258.75, endAngle: 281.25, color: '#cbd5e1', element: 'Space' },
    { id: 'WNW', name: 'West-North-West', startAngle: 281.25, endAngle: 303.75, color: '#e2e8f0', element: 'Space' },
    { id: 'NW', name: 'North-West', startAngle: 303.75, endAngle: 326.25, color: '#f1f5f9', element: 'Space' },
    { id: 'NNW', name: 'North-North-West', startAngle: 326.25, endAngle: 348.75, color: '#38bdf8', element: 'Water' },
  ];

  public static readonly PANCHATATTVA_ELEMENTS: PanchatattvaElement[] = [
    { id: 'water', name: 'Water (Jal)', color: '#0ea5e9', bgFill: 'rgba(14, 165, 233, 0.18)', stroke: 'rgba(14, 165, 233, 0.85)', startAngle: 326.25, endAngle: 56.25 },
    { id: 'air', name: 'Air (Vayu)', color: '#22c55e', bgFill: 'rgba(34, 197, 94, 0.18)', stroke: 'rgba(34, 197, 94, 0.85)', startAngle: 56.25, endAngle: 101.25 },
    { id: 'fire', name: 'Fire (Agni)', color: '#ef4444', bgFill: 'rgba(239, 68, 68, 0.18)', stroke: 'rgba(239, 68, 68, 0.85)', startAngle: 101.25, endAngle: 168.75 },
    { id: 'earth', name: 'Earth (Prithvi)', color: '#eab308', bgFill: 'rgba(234, 179, 8, 0.18)', stroke: 'rgba(234, 179, 8, 0.85)', startAngle: 168.75, endAngle: 236.25 },
    { id: 'space', name: 'Space (Aakash)', color: '#a855f7', bgFill: 'rgba(168, 85, 247, 0.18)', stroke: 'rgba(168, 85, 247, 0.85)', startAngle: 236.25, endAngle: 326.25 },
  ];

  public static polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  public static calculateSectors(numberOfSectors: number, radius: number = 420) {
    const step = 360 / numberOfSectors;
    return Array.from({ length: numberOfSectors }).map((_, i) => ({
      index: i,
      startAngle: i * step,
      endAngle: (i + 1) * step,
      radius,
    }));
  }
}
