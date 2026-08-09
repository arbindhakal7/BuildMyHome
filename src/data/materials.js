export const MATERIALS = [
  {
    id: "stucco",
    name: "Premium Stucco",
    category: "Exterior",
    color: "#e8e1d5",
    roughness: 0.82,
    priceMultiplier: 1.0,
  },
  {
    id: "white-stucco",
    name: "White Stucco",
    category: "Exterior",
    color: "#f3f0e8",
    roughness: 0.78,
    priceMultiplier: 1.02,
  },
  {
    id: "sandstone",
    name: "Sandstone",
    category: "Stone",
    color: "#c6a77d",
    roughness: 0.9,
    priceMultiplier: 1.18,
  },
  {
    id: "limestone",
    name: "Limestone",
    category: "Stone",
    color: "#aaa79c",
    roughness: 0.92,
    priceMultiplier: 1.2,
  },
  {
    id: "charcoal-stone",
    name: "Charcoal Stone",
    category: "Stone",
    color: "#55575a",
    roughness: 0.94,
    priceMultiplier: 1.25,
  },
  {
    id: "red-brick",
    name: "Red Brick",
    category: "Brick",
    color: "#914b3b",
    roughness: 0.88,
    priceMultiplier: 1.1,
  },
  {
    id: "dark-brick",
    name: "Dark Brick",
    category: "Brick",
    color: "#45403e",
    roughness: 0.9,
    priceMultiplier: 1.14,
  },
  {
    id: "warm-brick",
    name: "Warm Brick",
    category: "Brick",
    color: "#b56d52",
    roughness: 0.88,
    priceMultiplier: 1.12,
  },
  {
    id: "timber",
    name: "Natural Timber",
    category: "Wood",
    color: "#9b704b",
    roughness: 0.76,
    priceMultiplier: 1.15,
  },
  {
    id: "dark-timber",
    name: "Dark Timber",
    category: "Wood",
    color: "#49382e",
    roughness: 0.8,
    priceMultiplier: 1.18,
  },
  {
    id: "concrete",
    name: "Architectural Concrete",
    category: "Concrete",
    color: "#9a9a95",
    roughness: 0.92,
    priceMultiplier: 1.08,
  },
];

export const ROOF_STYLES = [
  {
    id: "flat",
    name: "Flat Roof",
    description: "Contemporary architectural roof",
    type: "flat",
    priceMultiplier: 1.0,
  },
  {
    id: "gable",
    name: "Classic Gable",
    description: "Traditional pitched roof",
    type: "gable",
    priceMultiplier: 1.06,
  },
  {
    id: "hip",
    name: "Hip Roof",
    description: "Elegant four-sided roof",
    type: "hip",
    priceMultiplier: 1.1,
  },
  {
    id: "mansard",
    name: "Mansard",
    description: "Premium multi-slope roof",
    type: "mansard",
    priceMultiplier: 1.18,
  },
  {
    id: "butterfly",
    name: "Butterfly",
    description: "Modern architectural profile",
    type: "butterfly",
    priceMultiplier: 1.2,
  },
  {
    id: "shed",
    name: "Single Slope",
    description: "Contemporary mono-pitch roof",
    type: "shed",
    priceMultiplier: 1.08,
  },
];

export const DOOR_STYLES = [
  {
    id: "pivot",
    name: "Grand Pivot",
    type: "pivot",
    width: 1.6,
    height: 2.8,
    color: "#49352b",
    glass: true,
    price: 8500,
  },
  {
    id: "double",
    name: "Double Entry",
    type: "double",
    width: 2.2,
    height: 2.6,
    color: "#5a3c2c",
    glass: true,
    price: 6200,
  },
  {
    id: "modern",
    name: "Modern Timber",
    type: "single",
    width: 1.2,
    height: 2.4,
    color: "#725039",
    glass: false,
    price: 3200,
  },
  {
    id: "black",
    name: "Black Statement",
    type: "single",
    width: 1.2,
    height: 2.5,
    color: "#202124",
    glass: true,
    price: 4200,
  },
  {
    id: "glass",
    name: "Full Glass",
    type: "single",
    width: 1.4,
    height: 2.5,
    color: "#222629",
    glass: true,
    price: 5200,
  },
];

export const WINDOW_STYLES = [
  {
    id: "panoramic",
    name: "Panoramic",
    type: "large",
    width: 3.6,
    height: 2.2,
    price: 4200,
  },
  {
    id: "floor-to-ceiling",
    name: "Floor to Ceiling",
    type: "floor",
    width: 3.2,
    height: 2.8,
    price: 5200,
  },
  {
    id: "standard",
    name: "Standard",
    type: "standard",
    width: 2.0,
    height: 1.5,
    price: 2200,
  },
  {
    id: "vertical",
    name: "Vertical",
    type: "vertical",
    width: 1.2,
    height: 2.2,
    price: 2800,
  },
  {
    id: "corner",
    name: "Corner Glass",
    type: "corner",
    width: 3.0,
    height: 2.4,
    price: 6800,
  },
];

export const WINDOW_FRAMES = [
  {
    id: "black",
    name: "Black Aluminium",
    color: "#17191a",
  },
  {
    id: "white",
    name: "White",
    color: "#f1f0eb",
  },
  {
    id: "bronze",
    name: "Bronze",
    color: "#71533d",
  },
  {
    id: "natural",
    name: "Natural Timber",
    color: "#8a6547",
  },
];

export const DRIVEWAY_MATERIALS = [
  {
    id: "concrete",
    name: "Concrete",
    color: "#9a9a96",
    pricePerM2: 95,
  },
  {
    id: "pavers",
    name: "Premium Pavers",
    color: "#77736c",
    pricePerM2: 150,
  },
  {
    id: "stone",
    name: "Natural Stone",
    color: "#a49a86",
    pricePerM2: 210,
  },
  {
    id: "gravel",
    name: "Gravel",
    color: "#aaa18f",
    pricePerM2: 65,
  },
];

export const FLOOR_MATERIALS = [
  {
    id: "oak",
    name: "Natural Oak",
    color: "#b68a5d",
  },
  {
    id: "walnut",
    name: "Walnut",
    color: "#684a35",
  },
  {
    id: "marble",
    name: "Marble",
    color: "#d8d5cc",
  },
  {
    id: "concrete",
    name: "Polished Concrete",
    color: "#888783",
  },
  {
    id: "tile",
    name: "Large Format Tile",
    color: "#b9b5aa",
  },
];

export const MATERIAL_CATEGORIES = [
  "Exterior",
  "Stone",
  "Brick",
  "Wood",
  "Concrete",
];