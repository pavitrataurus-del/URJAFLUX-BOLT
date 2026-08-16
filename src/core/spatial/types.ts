export type Point = { x: number; y: number };

export interface VastuZone {
  id: string;
  name: string;
  startAngle: number;
  endAngle: number;
  displayColor: string;
  element: string;
  planet: string;
  devta: string;
  priority: number;
}
