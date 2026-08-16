export const Directions = {
  NORTH: "North",
  EAST: "East",
  WEST: "West",
  SOUTH: "South",
  NORTHEAST: "Northeast",
  NORTHWEST: "Northwest",
  SOUTHEAST: "Southeast",
  SOUTHWEST: "Southwest",
  CENTER: "Center"
} as const;

export type DirectionType = typeof Directions[keyof typeof Directions];

export const Zones = {
  Z_NORTH: "Zone_North",
  Z_EAST: "Zone_East",
  Z_WEST: "Zone_West",
  Z_SOUTH: "Zone_South",
  Z_NORTHEAST: "Zone_Northeast",
  Z_NORTHWEST: "Zone_Northwest",
  Z_SOUTHEAST: "Zone_Southeast",
  Z_SOUTHWEST: "Zone_Southwest",
  Z_CENTER: "Zone_Center"
} as const;

export type ZoneType = typeof Zones[keyof typeof Zones];

export const SpaceTypes = {
  BEDROOM: "Bedroom",
  KITCHEN: "Kitchen",
  LIVING_ROOM: "LivingRoom",
  BATHROOM: "Bathroom",
  ENTRANCE: "Entrance",
  BALCONY: "Balcony",
  STUDY_ROOM: "StudyRoom",
  DINING_ROOM: "DiningRoom"
} as const;

export type SpaceType = typeof SpaceTypes[keyof typeof SpaceTypes];

export const ObjectTypes = {
  DOOR: "Door",
  WINDOW: "Window",
  STAIRCASE: "Staircase",
  WATER_TANK: "WaterTank",
  HEATING_SOURCE: "HeatingSource",
  BED: "Bed"
} as const;

export type ObjectType = typeof ObjectTypes[keyof typeof ObjectTypes];
