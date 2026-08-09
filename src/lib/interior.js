import {
  CEILING_STYLES,
  FURNITURE_LEVELS,
  INTERIOR_FLOORS,
  INTERIOR_STYLES,
  WET_FLOOR_FALLBACK,
} from "../data/interior";
import { roomTypeOf } from "./design";
import { layoutFloor } from "./layout";

export const DOOR_WIDTH = 0.9;
export const DOOR_HEIGHT = 2.1;
export const INTERIOR_WALL = 0.12;

export const BASE_INTERIOR = {
  style: "modern",
  wallColor: "#efece5",
  floorMaterial: "oak",
  ceiling: "flat",
  furniture: "full",
  rugs: true,
  plants: true,
  artwork: true,
  pendants: true,
};

export function interiorStyleOf(id) {
  return INTERIOR_STYLES.find((style) => style.id === id) || INTERIOR_STYLES[0];
}

export function interiorFloorOf(id) {
  return INTERIOR_FLOORS.find((floor) => floor.id === id) || INTERIOR_FLOORS[0];
}

export function ceilingStyleOf(id) {
  return CEILING_STYLES.find((ceiling) => ceiling.id === id) || CEILING_STYLES[0];
}

export function furnitureLevelOf(id) {
  return FURNITURE_LEVELS.find((level) => level.id === id) || FURNITURE_LEVELS[1];
}

export function paletteOf(design) {
  const interior = design.interior || BASE_INTERIOR;
  const style = interiorStyleOf(interior.style);

  return {
    ...style,
    wall: interior.wallColor || style.wall,
  };
}

/** Resolves the finish for one room, honouring per-room overrides and wet areas. */
export function finishOf(design, room) {
  const interior = design.interior || BASE_INTERIOR;
  const palette = paletteOf(design);
  const category = roomTypeOf(room.type).category;
  const override = room.finish || {};

  let floorId = override.floor || interior.floorMaterial || palette.floor;

  if ((category === "Bathroom" || room.type === "laundry") && WET_FLOOR_FALLBACK[floorId] && !override.floor) {
    floorId = WET_FLOOR_FALLBACK[floorId];
  }

  return {
    floor: interiorFloorOf(floorId),
    wall: override.wall || palette.wall,
  };
}

/* =========================================================
   FURNITURE
========================================================= */

function item(kind, x, z, w, d, extra = {}) {
  return { kind, x, z, w, d, rot: 0, ...extra };
}

/** Furniture is laid out in room-local metres: origin at the room centre. */
const LAYOUTS = {
  living: (w, l) => {
    const pieces = [
      item("rug", 0, 0, Math.min(w - 1.4, 3.6), Math.min(l - 1.8, 2.6), { decor: true }),
      item("sofa", 0, -l / 2 + 0.75, Math.min(w - 1.6, 2.6), 0.95),
      item("coffee-table", 0, -l / 2 + 2.2, 1.2, 0.6),
      item("tv-unit", 0, l / 2 - 0.35, Math.min(w - 2, 2.2), 0.45, { rot: Math.PI }),
      item("plant", w / 2 - 0.5, l / 2 - 0.6, 0.6, 0.6, { decor: true }),
    ];

    if (w > 5) {
      pieces.push(item("armchair", -w / 2 + 0.8, 0.2, 0.8, 0.85, { rot: Math.PI / 2 }));
      pieces.push(item("armchair", w / 2 - 0.8, 0.2, 0.8, 0.85, { rot: -Math.PI / 2 }));
    }

    if (l > 6) pieces.push(item("dining-table", 0, l / 2 - 2.1, 1.7, 0.95, { seats: 6 }));

    return pieces;
  },

  kitchen: (w, l) => {
    const pieces = [
      item("counter-run", 0, -l / 2 + 0.33, w - 0.2, 0.65),
      item("upper-cabinets", 0, -l / 2 + 0.2, w - 1.4, 0.36),
      item("fridge", w / 2 - 0.45, -l / 2 + 0.45, 0.85, 0.7),
      item("sink", -w / 4, -l / 2 + 0.33, 0.7, 0.5, { decor: true }),
    ];

    if (w >= 3.6 && l >= 3.6) pieces.push(item("island", 0, 0.2, Math.min(w - 1.8, 2.6), 1));
    if (l >= 5) pieces.push(item("dining-table", 0, l / 2 - 1.4, 1.6, 0.9, { seats: 4 }));

    return pieces;
  },

  "master-bedroom": (w, l) => [
    item("rug", 0, -l / 2 + 2.4, Math.min(w - 1.2, 3.2), 2.4, { decor: true }),
    item("bed", 0, -l / 2 + 1.2, 1.9, 2.1, { size: "king" }),
    item("nightstand", -1.25, -l / 2 + 0.3, 0.5, 0.45),
    item("nightstand", 1.25, -l / 2 + 0.3, 0.5, 0.45),
    item("wardrobe", -w / 2 + 0.32, l / 2 - 1.4, 0.6, Math.min(l / 2, 2.6), { rot: Math.PI / 2 }),
    item("bench", 0, -l / 2 + 2.5, 1.3, 0.45),
    item("plant", w / 2 - 0.5, l / 2 - 0.6, 0.6, 0.6, { decor: true }),
  ],

  bedroom: (w, l) => {
    const pieces = [
      item("rug", 0, -l / 2 + 2, Math.min(w - 1, 2.4), 1.9, { decor: true }),
      item("bed", 0, -l / 2 + 1.1, 1.5, 2, { size: "double" }),
      item("nightstand", -1.05, -l / 2 + 0.3, 0.45, 0.4),
      item("wardrobe", w / 2 - 0.3, l / 2 - 1.1, 0.6, Math.min(l / 2, 2.2), { rot: -Math.PI / 2 }),
    ];

    if (w * l >= 12) pieces.push(item("desk", -w / 2 + 0.4, l / 2 - 1, 0.6, 1.3, { rot: Math.PI / 2 }));

    return pieces;
  },

  nursery: (w, l) => [
    item("rug", 0, 0, Math.min(w - 1, 2.2), 1.8, { decor: true }),
    item("crib", 0, -l / 2 + 0.7, 1.3, 0.75),
    item("dresser", w / 2 - 0.35, 0, 0.55, 1.2, { rot: -Math.PI / 2 }),
    item("armchair", -w / 2 + 0.6, l / 2 - 0.9, 0.8, 0.8, { rot: Math.PI / 2 }),
  ],

  bathroom: (w, l) => [
    item("bathtub", -w / 2 + 0.85, -l / 2 + 0.95, 1.7, 0.78, { rot: Math.PI / 2 }),
    item("vanity", 0, l / 2 - 0.28, Math.min(w - 1.2, 1.4), 0.55, { rot: Math.PI }),
    item("toilet", w / 2 - 0.4, -l / 2 + 0.45, 0.42, 0.7),
    item("shower", w / 2 - 0.6, l / 2 - 0.7, 1.1, 1.1),
  ],

  ensuite: (w, l) => [
    item("shower", -w / 2 + 0.6, -l / 2 + 0.6, 1, 1),
    item("vanity", 0, l / 2 - 0.28, Math.min(w - 1, 1.2), 0.5, { rot: Math.PI }),
    item("toilet", w / 2 - 0.4, -l / 2 + 0.45, 0.42, 0.7),
  ],

  office: (w, l) => [
    item("desk", 0, -l / 2 + 0.6, Math.min(w - 1.2, 1.8), 0.75),
    item("office-chair", 0, -l / 2 + 1.35, 0.6, 0.6),
    item("bookshelf", -w / 2 + 0.22, 0, 0.35, Math.min(l - 1, 2.2), { rot: Math.PI / 2 }),
    item("plant", w / 2 - 0.5, l / 2 - 0.5, 0.6, 0.6, { decor: true }),
  ],

  library: (w, l) => [
    item("bookshelf", -w / 2 + 0.22, 0, 0.35, l - 0.8, { rot: Math.PI / 2 }),
    item("bookshelf", w / 2 - 0.22, 0, 0.35, l - 0.8, { rot: -Math.PI / 2 }),
    item("rug", 0, 0, Math.min(w - 1.6, 2.4), Math.min(l - 1.4, 2.4), { decor: true }),
    item("armchair", -0.6, 0, 0.85, 0.85),
    item("armchair", 0.6, 0, 0.85, 0.85, { rot: Math.PI }),
    item("floor-lamp", 0, -l / 2 + 0.6, 0.4, 0.4, { decor: true }),
  ],

  gym: (w, l) => [
    item("mirror-wall", 0, -l / 2 + 0.08, w - 0.4, 0.08, { decor: true }),
    item("treadmill", -w / 2 + 0.8, 0, 0.9, 1.8),
    item("weight-bench", w / 4, -0.4, 0.6, 1.4),
    item("weight-rack", w / 2 - 0.3, l / 2 - 1, 0.5, 1.4, { rot: -Math.PI / 2 }),
    item("rug", 0, l / 2 - 1.2, Math.min(w - 1.4, 2.4), 1.8, { decor: true }),
  ],

  cinema: (w, l) => [
    item("screen", 0, -l / 2 + 0.12, Math.min(w - 0.8, 4), 0.12, { decor: true }),
    item("cinema-row", 0, 0.1, Math.min(w - 1, 3.4), 0.95, { seats: 3 }),
    item("cinema-row", 0, 1.5, Math.min(w - 1, 3.4), 0.95, { seats: 3 }),
    item("rug", 0, 0.6, Math.min(w - 0.8, 4), Math.min(l - 1.6, 3), { decor: true }),
  ],

  "wine-cellar": (w, l) => [
    item("wine-rack", -w / 2 + 0.2, 0, 0.35, l - 0.6, { rot: Math.PI / 2 }),
    item("wine-rack", w / 2 - 0.2, 0, 0.35, l - 0.6, { rot: -Math.PI / 2 }),
    item("tasting-table", 0, 0, Math.min(w - 1.4, 1.2), 0.8),
  ],

  laundry: (w, l) => [
    item("washer", -w / 2 + 0.45, -l / 2 + 0.4, 0.65, 0.65),
    item("washer", -w / 2 + 1.15, -l / 2 + 0.4, 0.65, 0.65, { dryer: true }),
    item("counter-run", 0, l / 2 - 0.32, w - 0.4, 0.6, { rot: Math.PI }),
    item("sink", w / 4, l / 2 - 0.32, 0.6, 0.45, { decor: true }),
  ],

  mudroom: (w, l) => [
    item("lockers", 0, -l / 2 + 0.3, w - 0.4, 0.55),
    item("bench", 0, l / 2 - 0.6, Math.min(w - 0.8, 1.6), 0.42),
  ],

  garage: (w, l) => [
    item("car", 0, 0, 1.9, 4.4),
    item("shelving", -w / 2 + 0.22, -l / 2 + 1.2, 0.4, 1.8, { rot: Math.PI / 2 }),
  ],

  sunroom: (w, l) => [
    item("armchair", -w / 4, 0, 0.85, 0.85),
    item("armchair", w / 4, 0, 0.85, 0.85, { rot: Math.PI }),
    item("coffee-table", 0, 0, 0.9, 0.6),
    item("plant", -w / 2 + 0.5, -l / 2 + 0.5, 0.7, 0.7, { decor: true }),
    item("plant", w / 2 - 0.5, l / 2 - 0.5, 0.8, 0.8, { decor: true }),
  ],
};

LAYOUTS.family = LAYOUTS.living;

/** Furniture for a placed room, clipped to pieces that actually fit. */
export function furnitureFor(room, level = "full") {
  const spec = furnitureLevelOf(level);

  if (spec.multiplier === 0) return [];

  const build = LAYOUTS[room.type];

  if (!build) return [];

  const w = room.width - INTERIOR_WALL * 2;
  const l = room.length - INTERIOR_WALL * 2;

  if (w < 1.2 || l < 1.2) return [];

  return build(w, l)
    .filter((piece) => (spec.id === "full" ? true : !piece.decor))
    .filter((piece) => piece.w > 0.15 && piece.d > 0.15)
    .filter(
      (piece) =>
        Math.abs(piece.x) + Math.max(piece.w, piece.d) / 2 <= w / 2 + 0.05 &&
        Math.abs(piece.z) + Math.max(piece.w, piece.d) / 2 <= l / 2 + 0.05
    );
}

/* =========================================================
   WALLS + DOORS
========================================================= */

const EPS = 0.06;

function edgeKey(a, b) {
  const points = [a, b].sort((p, q) => p.x - q.x || p.z - q.z);
  return points.map((point) => `${point.x.toFixed(2)},${point.z.toFixed(2)}`).join("|");
}

/**
 * Interior partitions for one floor: the shared edges of the packed rooms,
 * excluding the building perimeter, each with a doorway punched through it.
 */
export function partitionsOf(layout) {
  const { inner } = layout;
  const right = inner.x + inner.width;
  const bottom = inner.y + inner.length;
  const seen = new Map();

  layout.rooms.forEach((room) => {
    const x0 = room.x;
    const x1 = room.x + room.width;
    const z0 = room.y;
    const z1 = room.y + room.length;

    const edges = [
      [{ x: x0, z: z0 }, { x: x1, z: z0 }],
      [{ x: x0, z: z1 }, { x: x1, z: z1 }],
      [{ x: x0, z: z0 }, { x: x0, z: z1 }],
      [{ x: x1, z: z0 }, { x: x1, z: z1 }],
    ];

    edges.forEach(([a, b]) => {
      const onPerimeter =
        (Math.abs(a.z - b.z) < EPS && (Math.abs(a.z - inner.y) < EPS || Math.abs(a.z - bottom) < EPS)) ||
        (Math.abs(a.x - b.x) < EPS && (Math.abs(a.x - inner.x) < EPS || Math.abs(a.x - right) < EPS));

      if (onPerimeter) return;

      const key = edgeKey(a, b);
      const existing = seen.get(key);

      if (existing) existing.shared = true;
      else seen.set(key, { a, b, shared: false, roomId: room.id });
    });
  });

  return [...seen.values()].map((edge) => {
    const horizontal = Math.abs(edge.a.z - edge.b.z) < EPS;
    const length = horizontal ? Math.abs(edge.b.x - edge.a.x) : Math.abs(edge.b.z - edge.a.z);

    const center = {
      x: (edge.a.x + edge.b.x) / 2,
      z: (edge.a.z + edge.b.z) / 2,
    };

    return {
      ...edge,
      horizontal,
      length,
      center,
      door: length >= DOOR_WIDTH + 0.6 ? { ...center, width: DOOR_WIDTH, horizontal } : null,
    };
  });
}

/** Everything needed to draw one floor's interior, in footprint coordinates. */
export function interiorPlan(design, floor) {
  const layout = layoutFloor(design, floor);
  const settings = design.interior || BASE_INTERIOR;

  const rooms = layout.rooms.map((room) => {
    const source = design.rooms.find((entry) => entry.id === room.id) || { type: room.type };

    return {
      ...room,
      finish: finishOf(design, source),
      furniture: furnitureFor(room, settings.furniture).filter(
        (piece) => settings.plants || piece.kind !== "plant"
      ),
    };
  });

  return { ...layout, rooms, partitions: partitionsOf(layout) };
}

export function interiorCost(design) {
  const interior = design.interior || BASE_INTERIOR;
  const style = interiorStyleOf(interior.style);
  const level = furnitureLevelOf(interior.furniture);
  const ceiling = ceilingStyleOf(interior.ceiling);

  const flooring = design.rooms.reduce((total, room) => {
    const finish = finishOf(design, room);
    return total + room.width * room.length * finish.floor.pricePerM2;
  }, 0);

  const furniture = design.rooms.reduce((total, room) => {
    const type = roomTypeOf(room.type);
    const rate = type.category === "Utility" ? 320 : type.category === "Luxury" ? 1650 : 780;
    return total + room.width * room.length * rate * level.multiplier;
  }, 0);

  const joinery = design.rooms.length * 4200 * style.priceMultiplier;

  return {
    flooring: Math.round(flooring * style.priceMultiplier),
    furniture: Math.round(furniture * style.priceMultiplier),
    joinery: Math.round(joinery),
    ceiling: Math.round(ceiling.price * (interior.ceiling === "flat" ? 0 : 1)),
    lighting: Math.round(design.rooms.length * (interior.pendants ? 1400 : 650)),
  };
}
