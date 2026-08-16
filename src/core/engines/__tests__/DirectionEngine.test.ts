import { describe, it, expect, beforeEach } from 'vitest';
import { DirectionEngine } from '../DirectionEngine';
import { EventEngine } from '../../events/EventEngine';

describe('DirectionEngine', () => {
  let eventEngine: EventEngine;
  let directionEngine: DirectionEngine;

  beforeEach(async () => {
    eventEngine = new EventEngine();
    await eventEngine.initialize();

    directionEngine = new DirectionEngine(eventEngine);
    await directionEngine.initialize();
  });

  it('initializes with default True North (0°) and User North (0°)', () => {
    expect(directionEngine.getTrueNorth()).toBe(0);
    expect(directionEngine.getUserNorth()).toBe(0);
    expect(directionEngine.getBearing()).toBe(0);
  });

  it('updates User North and calculates bearing correctly', () => {
    directionEngine.setUserNorth(45);
    expect(directionEngine.getUserNorth()).toBe(45);
    expect(directionEngine.getBearing()).toBe(45);
  });

  it('rotates North relative and absolute', () => {
    directionEngine.rotateNorth(30, false);
    expect(directionEngine.getUserNorth()).toBe(30);

    directionEngine.rotateNorth(15, true);
    expect(directionEngine.getUserNorth()).toBe(45);
  });

  it('publishes DIRECTION_CHANGED event on rotation', () => {
    let publishedEvent: any = null;
    eventEngine.subscribe('DIRECTION_CHANGED', (event) => {
      publishedEvent = event;
    });

    directionEngine.setUserNorth(90);

    expect(publishedEvent).not.toBeNull();
    expect(publishedEvent.type).toBe('DIRECTION_CHANGED');
    expect(publishedEvent.payload.userNorth).toBe(90);
    expect(publishedEvent.payload.bearing).toBe(90);
  });

  it('generates direction matrix with sectors', () => {
    directionEngine.setUserNorth(15);
    const matrix = directionEngine.getDirectionMatrix();

    expect(matrix.userNorth).toBe(15);
    expect(matrix.sectors16).toHaveLength(16);
    expect(matrix.entrances32).toHaveLength(32);
    expect(matrix.devtas45).toHaveLength(45);
    expect(matrix.panchatattva).toHaveLength(5);
    expect(matrix.rotationMatrix).toBeDefined();
    expect(matrix.cardinalVectors.N).toBeDefined();
  });

  it('converts screen coordinates to bearing', () => {
    const center = { x: 500, y: 500 };
    // Point directly above center (-Y direction = North = 0° bearing)
    const northPoint = { x: 500, y: 300 };
    const bearing = directionEngine.screenToBearing(northPoint, center);
    expect(Math.round(bearing)).toBe(0);

    // Point directly to the right (+X direction = East = 90° bearing)
    const eastPoint = { x: 700, y: 500 };
    const eastBearing = directionEngine.screenToBearing(eastPoint, center);
    expect(Math.round(eastBearing)).toBe(90);
  });

  it('resolves bearing to sector and direction name', () => {
    const sector16 = directionEngine.bearingToSector(0, 16);
    expect(sector16).toBe(0);

    const name8 = directionEngine.getDirectionName(90, '8');
    expect(name8).toBe('E');

    const name16 = directionEngine.getDirectionName(45, '16');
    expect(name16).toBe('NE');
  });
});
