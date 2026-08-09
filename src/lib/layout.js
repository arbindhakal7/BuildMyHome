import { roomTypeOf } from "./design";

export const WALL_THICKNESS = 0.25;

export const ROOM_COLORS = {
  Living: "#cfdcd2",
  Kitchen: "#e3d8c4",
  Bedroom: "#d5dbe6",
  Bathroom: "#cfe0e4",
  Utility: "#dedbd4",
  Luxury: "#e2d4dd",
};

export function roomColor(typeId) {
  return ROOM_COLORS[roomTypeOf(typeId).category] || "#dcdcd6";
}

/**
 * Squarified treemap: rooms are packed to fill the whole floor plate, keeping
 * each room close to its requested area and to a sensible aspect ratio.
 */
function squarify(items, rect, out) {
  if (items.length === 0) return;

  if (items.length === 1) {
    out.push({ ...items[0], ...rect });
    return;
  }

  const total = items.reduce((sum, item) => sum + item.area, 0);
  const horizontal = rect.width >= rect.length;
  const side = horizontal ? rect.length : rect.width;

  let row = [];
  let rowArea = 0;
  let best = Infinity;

  for (const item of items) {
    const nextArea = rowArea + item.area;
    const thickness = nextArea / side;
    const worst = Math.max(
      ...[...row, item].map((entry) => {
        const other = entry.area / thickness;
        return Math.max(thickness / other, other / thickness);
      })
    );

    if (row.length > 0 && worst > best) break;

    row.push(item);
    rowArea = nextArea;
    best = worst;
  }

  const thickness = rowArea / side;
  let offset = 0;

  row.forEach((item) => {
    const extent = (item.area / rowArea) * side;

    out.push({
      ...item,
      x: horizontal ? rect.x : rect.x + offset,
      y: horizontal ? rect.y + offset : rect.y,
      width: horizontal ? thickness : extent,
      length: horizontal ? extent : thickness,
    });

    offset += extent;
  });

  const rest = items.slice(row.length);

  const remaining = horizontal
    ? { x: rect.x + thickness, y: rect.y, width: rect.width - thickness, length: rect.length }
    : { x: rect.x, y: rect.y + thickness, width: rect.width, length: rect.length - thickness };

  const scale = (total - rowArea) / total;

  if (rest.length > 0 && remaining.width > 0.01 && remaining.length > 0.01 && scale > 0) {
    squarify(rest, remaining, out);
  }
}

/**
 * Lays out one floor of a design. Returns placed rooms in metres, relative to
 * the top-left corner of the building footprint.
 */
export function layoutFloor(design, floor) {
  const { width, length } = design.architecture;

  const inner = {
    x: WALL_THICKNESS,
    y: WALL_THICKNESS,
    width: width - WALL_THICKNESS * 2,
    length: length - WALL_THICKNESS * 2,
  };

  const rooms = design.rooms
    .filter((room) => room.floor === floor)
    .map((room) => ({
      id: room.id,
      type: room.type,
      name: room.name,
      requested: room.width * room.length,
      area: Math.max(2, room.width * room.length),
    }))
    .sort((a, b) => b.area - a.area);

  if (rooms.length === 0) return { rooms: [], inner, usage: 0 };

  const available = inner.width * inner.length;
  const requestedTotal = rooms.reduce((sum, room) => sum + room.area, 0);
  const scale = available / requestedTotal;

  const scaled = rooms.map((room) => ({ ...room, area: room.area * scale }));

  const placed = [];
  squarify(scaled, inner, placed);

  return {
    inner,
    usage: requestedTotal / available,
    rooms: placed.map((room) => ({
      ...room,
      area: room.width * room.length,
      color: roomColor(room.type),
    })),
  };
}

export function layoutAll(design) {
  return Array.from({ length: design.architecture.floors }, (_, floor) => layoutFloor(design, floor));
}
