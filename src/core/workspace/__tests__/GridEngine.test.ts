import { describe, it, expect, beforeEach } from 'vitest';
import { GridEngine } from '../GridEngine';

describe('GridEngine', () => {
  let grid: GridEngine;

  beforeEach(async () => {
    grid = new GridEngine();
    await grid.initialize();
  });

  it('calculates adaptive spacing based on zoom', () => {
    expect(grid.getAdaptiveSpacing(1)).toBe(10);
    expect(grid.getAdaptiveSpacing(2)).toBe(10);
    expect(grid.getAdaptiveSpacing(0.5)).toBe(100); 
    
    // Zooming out to 0.1 -> lines get 10x closer visually -> spacing needs to be 100
    expect(grid.getAdaptiveSpacing(0.1)).toBe(100);
    
    // Zooming in to 20 -> lines get 20x further visually -> spacing needs to be 1
    expect(grid.getAdaptiveSpacing(20)).toBe(1);
  });

  it('generates grid lines correctly', () => {
    const bounds = { x: 0, y: 0, width: 50, height: 50 };
    const zoom = 1; // Spacing 10, Major spacing 100
    
    const lines = grid.generateGrid(bounds, zoom);
    
    // Vertical lines at 0, 10, 20, 30, 40, 50 = 6 lines
    // Horizontal lines at 0, 10, 20, 30, 40, 50 = 6 lines
    // Total 12 lines
    expect(lines.length).toBe(12);
    
    const majorLines = lines.filter(l => l.isMajor);
    // 0 is major for both vertical and horizontal (2 lines)
    expect(majorLines.length).toBe(2);
  });
});
