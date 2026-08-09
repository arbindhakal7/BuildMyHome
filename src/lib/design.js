import { HOUSE_TEMPLATES } from "../data/houseTemplates";
import { BASE_INTERIOR, interiorCost, interiorStyleOf } from "./interior";
import { MATERIALS, ROOF_STYLES, WINDOW_STYLES, DOOR_STYLES } from "../data/materials";
import { ROOM_TYPES } from "../data/roomTypes";

export const MAX_FLOORS = 5;

export const ARCHITECTURE_LIMITS = {
  width: { min: 8, max: 36, step: 0.5 },
  length: { min: 10, max: 46, step: 0.5 },
  floorHeight: { min: 2.6, max: 4.5, step: 0.1 },
  roofPitch: { min: 10, max: 45, step: 1 },
  roofOverhang: { min: 0, max: 1.6, step: 0.1 },
  upperSetback: { min: 0, max: 4, step: 0.25 },
  windowRatio: { min: 0.2, max: 0.85, step: 0.05 },
};

export function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function clone(value) {
  return structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function roomTypeOf(id) {
  return ROOM_TYPES.find((type) => type.id === id) || ROOM_TYPES[0];
}

export function makeRoom(typeId, floor = 0) {
  const type = roomTypeOf(typeId);

  return {
    id: newId(),
    type: type.id,
    name: type.name,
    floor,
    width: type.defaultWidth,
    length: type.defaultLength,
  };
}

export const BASE_ARCHITECTURE = {
  style: "contemporary",
  width: 18,
  length: 26,
  floors: 2,
  floorHeight: 3.2,

  upperSetback: 0,
  secondWing: false,
  rearWing: false,

  roofStyle: "flat",
  roofPitch: 28,
  roofOverhang: 0.6,

  facadeMaterial: "stucco",
  facadeColor: "#e8e1d5",
  accentMaterial: "dark-timber",
  plinth: true,

  roofColor: "#20252a",

  windowStyle: "panoramic",
  windowColor: "#8fb6c6",
  windowFrame: "black",
  windowRatio: 0.55,

  doorStyle: "pivot",
  doorColor: "#49352b",
};

export const BASE_FEATURES = {
  garages: 2,
  balcony: 2,
  terrace: true,
  pool: true,
  porch: true,
  garden: true,
  driveway: true,
  outdoorKitchen: false,
  pergola: false,
  fence: false,
  solar: false,
  chimney: false,
  courtyard: false,
};

export function createDesign(overrides = {}) {
  return {
    id: newId(),
    name: "My Dream Home",
    templateId: null,
    architecture: { ...clone(BASE_ARCHITECTURE), ...(overrides.architecture || {}) },
    features: { ...clone(BASE_FEATURES), ...(overrides.features || {}) },
    interior: { ...clone(BASE_INTERIOR), ...(overrides.interior || {}) },
    rooms: overrides.rooms
      ? clone(overrides.rooms)
      : ["living", "kitchen", "master-bedroom", "bedroom", "bathroom"].map((type, index) =>
          makeRoom(type, index > 2 ? 1 : 0)
        ),
    savedAt: null,
    ...("name" in overrides ? { name: overrides.name } : {}),
    ...("templateId" in overrides ? { templateId: overrides.templateId } : {}),
  };
}

/**
 * Templates are authored in a human-readable shape; the designer works on a
 * normalised design object. This is the single place that maps between them.
 */
export function designFromTemplate(template) {
  const floors = clamp(template.floors, 1, MAX_FLOORS);

  const rooms = template.rooms.map((typeId, index) =>
    makeRoom(typeId, distributeFloor(index, template.rooms.length, floors))
  );

  return createDesign({
    name: template.name,
    templateId: template.id,
    rooms,
    architecture: {
      style: template.style,
      width: template.width,
      length: template.length,
      floors,
      roofStyle: template.roofStyle,
      roofColor: template.roofColor,
      facadeMaterial: template.wallMaterial,
      facadeColor: template.wallColor,
      doorStyle: template.doorStyle,
      windowStyle: template.windowStyle,
      windowRatio: template.windowStyle === "floor-to-ceiling" ? 0.75 : 0.55,
      roofPitch: template.roofStyle === "gable" ? 32 : 24,
    },
    features: {
      garages: template.features.garage ? template.features.garageSpaces : 0,
      balcony: template.features.balcony ? (floors > 2 ? 2 : 1) : 0,
      terrace: template.features.terrace,
      pool: template.features.pool,
      porch: template.features.porch,
      garden: template.features.garden,
      courtyard: template.features.courtyard,
      driveway: template.features.garage,
      pergola: template.features.terrace,
      chimney: ["Classic", "Coastal", "Natural Modern"].includes(template.style),
    },
    interior: interiorForStyle(template.style),
  });
}

const TEMPLATE_INTERIORS = {
  Modern: "modern",
  Contemporary: "modern",
  "Natural Modern": "japandi",
  Minimalist: "japandi",
  Classic: "classic",
  Traditional: "classic",
  Coastal: "coastal",
  Industrial: "industrial",
  Scandinavian: "scandi",
};

function interiorForStyle(style) {
  const id = TEMPLATE_INTERIORS[style] || "modern";
  const preset = interiorStyleOf(id);

  return { style: id, wallColor: preset.wall, floorMaterial: preset.floor };
}

/** Ground floor keeps the living spaces, upper floors take the remainder. */
function distributeFloor(index, total, floors) {
  if (floors === 1) return 0;

  const groundCount = Math.ceil(total / floors);

  return clamp(Math.floor(index / groundCount), 0, floors - 1);
}

export function materialOf(id) {
  return MATERIALS.find((material) => material.id === id) || MATERIALS[0];
}

export function roofStyleOf(id) {
  return ROOF_STYLES.find((roof) => roof.id === id) || ROOF_STYLES[0];
}

export function windowStyleOf(id) {
  return WINDOW_STYLES.find((style) => style.id === id) || WINDOW_STYLES[0];
}

export function doorStyleOf(id) {
  return DOOR_STYLES.find((style) => style.id === id) || DOOR_STYLES[0];
}

export function metricsOf(design) {
  const a = design.architecture;

  const footprint = a.width * a.length;

  const upperArea = (a.width - a.upperSetback * 2) * (a.length - a.upperSetback * 2);

  const wingArea = (a.secondWing ? 5.5 * a.length * 0.58 : 0) + (a.rearWing ? a.width * 0.65 * 6 : 0);

  const floorArea = footprint + Math.max(0, a.floors - 1) * upperArea + wingArea;

  return {
    footprint,
    floorArea,
    volume: floorArea * a.floorHeight,
    height: a.floors * a.floorHeight + roofHeightOf(a),
    bedrooms: design.rooms.filter((room) => roomTypeOf(room.type).category === "Bedroom").length,
    bathrooms: design.rooms.filter((room) => roomTypeOf(room.type).category === "Bathroom").length,
  };
}

export function roofHeightOf(a) {
  const span = Math.min(a.width, a.length) / 2;
  const pitch = Math.tan((a.roofPitch * Math.PI) / 180);

  switch (a.roofStyle) {
    case "gable":
    case "hip":
      return span * pitch;
    case "mansard":
      return span * pitch * 0.75;
    case "shed":
    case "butterfly":
      return a.width * Math.tan((a.roofPitch * Math.PI) / 360);
    default:
      return 0.55;
  }
}

const FEATURE_PRICES = {
  terrace: 26000,
  pool: 68000,
  porch: 16000,
  garden: 19000,
  driveway: 13500,
  outdoorKitchen: 24000,
  pergola: 15000,
  fence: 11000,
  solar: 21000,
  chimney: 9500,
  courtyard: 32000,
};

const FEATURE_LABELS = {
  terrace: "Outdoor terrace",
  pool: "Swimming pool",
  porch: "Entry porch",
  garden: "Landscaping",
  driveway: "Driveway",
  outdoorKitchen: "Outdoor kitchen",
  pergola: "Pergola",
  fence: "Boundary fence",
  solar: "Solar array",
  chimney: "Chimney & fireplace",
  courtyard: "Internal courtyard",
};

export function priceBreakdown(design) {
  const a = design.architecture;
  const { floorArea } = metricsOf(design);

  const material = materialOf(a.facadeMaterial);
  const roof = roofStyleOf(a.roofStyle);
  const windowStyle = windowStyleOf(a.windowStyle);
  const door = doorStyleOf(a.doorStyle);

  const shell = Math.round(floorArea * 1180 * material.priceMultiplier);
  const roofing = Math.round(a.width * a.length * 320 * roof.priceMultiplier);
  const glazing = Math.round(windowStyle.price * (6 + a.floors * 4) * a.windowRatio);
  const fitout = Math.round(
    design.rooms.reduce((total, room) => total + room.width * room.length * 950, 0)
  );

  const interior = interiorCost(design);
  const interiorStyle = interiorStyleOf((design.interior || {}).style);

  const items = [
    { id: "shell", label: `Structure & ${material.name.toLowerCase()} facade`, amount: shell },
    { id: "roof", label: `${roof.name} roofing`, amount: roofing },
    { id: "glazing", label: `${windowStyle.name} glazing`, amount: glazing },
    { id: "door", label: `${door.name} entry`, amount: door.price },
    { id: "fitout", label: `Interior fit-out (${design.rooms.length} rooms)`, amount: fitout },
    { id: "flooring", label: "Floor finishes", amount: interior.flooring },
    { id: "joinery", label: `${interiorStyle.name} joinery & millwork`, amount: interior.joinery },
    { id: "lighting", label: "Lighting package", amount: interior.lighting },
  ];

  if (interior.furniture > 0) {
    items.push({ id: "furniture", label: "Furniture & styling", amount: interior.furniture });
  }

  if (interior.ceiling > 0) {
    items.push({ id: "ceiling", label: "Feature ceilings", amount: interior.ceiling });
  }

  if (design.features.garages > 0) {
    items.push({
      id: "garage",
      label: `${design.features.garages}-car garage`,
      amount: design.features.garages * 39000,
    });
  }

  if (design.features.balcony > 0) {
    items.push({
      id: "balcony",
      label: `${design.features.balcony} balcon${design.features.balcony > 1 ? "ies" : "y"}`,
      amount: design.features.balcony * 19500,
    });
  }

  Object.entries(FEATURE_PRICES).forEach(([key, amount]) => {
    if (design.features[key]) items.push({ id: key, label: FEATURE_LABELS[key], amount });
  });

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return { items, total };
}

export function priceOf(design) {
  return priceBreakdown(design).total;
}

export function formatMoney(value) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/** Older saved projects may miss fields added later; fill them in. */
export function migrateDesign(saved) {
  const base = createDesign();

  return {
    ...base,
    ...saved,
    architecture: { ...base.architecture, ...(saved.architecture || {}) },
    features: { ...base.features, ...(saved.features || {}) },
    interior: { ...base.interior, ...(saved.interior || {}) },
    rooms: (saved.rooms || []).map((room) => ({
      ...makeRoom(room.type, room.floor || 0),
      ...room,
      width: Number(room.width) || roomTypeOf(room.type).defaultWidth,
      length: Number(room.length) || roomTypeOf(room.type).defaultLength,
    })),
  };
}

export function templateById(id) {
  return HOUSE_TEMPLATES.find((template) => template.id === id) || null;
}
