import { useMemo } from "react";

import { DOOR_WIDTH, INTERIOR_WALL, interiorPlan } from "../lib/interior";
import { WALL_THICKNESS } from "../lib/layout";

const PADDING = 2.4;

const ROUND_PIECES = new Set(["office-chair", "plant", "floor-lamp", "sink"]);
const SOFT_PIECES = new Set(["rug", "mirror-wall", "screen"]);

/** Furniture footprint in plan coordinates, honouring the piece's rotation. */
function footprintOf(piece, cx, cz) {
  const turned = Math.abs(Math.sin(piece.rot || 0)) > 0.5;
  const w = turned ? piece.d : piece.w;
  const d = turned ? piece.w : piece.d;

  return { x: cx + piece.x - w / 2, y: cz + piece.z - d / 2, w, d };
}

function FurnitureSymbol({ piece, cx, cz }) {
  const box = footprintOf(piece, cx, cz);

  if (ROUND_PIECES.has(piece.kind)) {
    return (
      <circle
        cx={box.x + box.w / 2}
        cy={box.y + box.d / 2}
        r={Math.min(box.w, box.d) / 2}
        fill="none"
        stroke="#6d716e"
        strokeWidth="0.05"
      />
    );
  }

  return (
    <rect
      x={box.x}
      y={box.y}
      width={box.w}
      height={box.d}
      rx={piece.kind === "bathtub" ? 0.25 : 0.05}
      fill={SOFT_PIECES.has(piece.kind) ? "none" : "#ffffff"}
      fillOpacity={SOFT_PIECES.has(piece.kind) ? 0 : 0.45}
      stroke="#6d716e"
      strokeWidth="0.05"
      strokeDasharray={SOFT_PIECES.has(piece.kind) ? "0.28 0.2" : undefined}
    />
  );
}

function Partition({ wall }) {
  const half = INTERIOR_WALL / 2;
  const { center, horizontal, length, door } = wall;

  const segments = door
    ? [(length - door.width) / 2, (length - door.width) / 2].map((span, index) => ({
        span,
        offset: (index === 0 ? -1 : 1) * (door.width + span) / 2,
      }))
    : [{ span: length, offset: 0 }];

  return (
    <g>
      {segments.map(({ span, offset }) => (
        <rect
          key={`${offset}-${span}`}
          x={horizontal ? center.x + offset - span / 2 : center.x - half}
          y={horizontal ? center.z - half : center.z + offset - span / 2}
          width={horizontal ? span : INTERIOR_WALL}
          height={horizontal ? INTERIOR_WALL : span}
          fill="#2c302e"
        />
      ))}

      {door && (
        <path
          d={
            horizontal
              ? `M ${center.x - door.width / 2} ${center.z} a ${door.width} ${door.width} 0 0 1 ${door.width} ${door.width}`
              : `M ${center.x} ${center.z - door.width / 2} a ${door.width} ${door.width} 0 0 0 ${door.width} ${door.width}`
          }
          fill="none"
          stroke="#9aa09c"
          strokeWidth="0.05"
          strokeDasharray="0.25 0.2"
        />
      )}
    </g>
  );
}

export default function FloorPlan({ design, floor, selectedRoomId, onSelectRoom, showFurniture = true }) {
  const { width, length } = design.architecture;

  const plan = useMemo(() => interiorPlan(design, floor), [design, floor]);

  const viewBox = `${-PADDING} ${-PADDING} ${width + PADDING * 2} ${length + PADDING * 2}`;

  return (
    <div className="floorplan">
      <svg viewBox={viewBox} role="img" aria-label={`Floor plan of level ${floor + 1}`}>
        <defs>
          <pattern id="hatch" width="0.6" height="0.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="0.6" stroke="#b9b5ab" strokeWidth="0.12" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={width} height={length} fill="url(#hatch)" stroke="#2c302e" strokeWidth="0.28" />

        <rect
          x={WALL_THICKNESS}
          y={WALL_THICKNESS}
          width={width - WALL_THICKNESS * 2}
          height={length - WALL_THICKNESS * 2}
          fill="#faf9f5"
          stroke="#2c302e"
          strokeWidth="0.08"
        />

        {plan.rooms.map((room) => (
          <g
            key={room.id}
            className={`plan-room${selectedRoomId === room.id ? " selected" : ""}`}
            onClick={() => onSelectRoom?.(room.id)}
          >
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.length}
              fill={room.finish.floor.color}
              fillOpacity="0.5"
              stroke="#2c302e"
              strokeWidth="0.08"
            />

            {showFurniture &&
              room.furniture.map((piece, index) => (
                <FurnitureSymbol
                  key={`${piece.kind}-${index}`}
                  piece={piece}
                  cx={room.x + room.width / 2}
                  cz={room.y + room.length / 2}
                />
              ))}

            <text x={room.x + room.width / 2} y={room.y + room.length / 2 - 0.25} textAnchor="middle" fontSize="0.85">
              {room.name}
            </text>

            <text
              x={room.x + room.width / 2}
              y={room.y + room.length / 2 + 0.95}
              textAnchor="middle"
              fontSize="0.68"
              opacity="0.65"
            >
              {room.width.toFixed(1)} × {room.length.toFixed(1)} m · {room.area.toFixed(1)} m²
            </text>
          </g>
        ))}

        {plan.partitions.map((wall, index) => (
          <Partition key={`${wall.center.x}-${wall.center.z}-${index}`} wall={wall} />
        ))}

        {floor === 0 && (
          <g>
            <rect
              x={width / 2 - DOOR_WIDTH}
              y={length - WALL_THICKNESS}
              width={DOOR_WIDTH * 2}
              height={WALL_THICKNESS}
              fill="#f7f5ef"
            />
            <path
              d={`M ${width / 2 - 0.9} ${length} a 1.8 1.8 0 0 0 1.8 -1.8`}
              fill="none"
              stroke="#7d827f"
              strokeWidth="0.08"
              strokeDasharray="0.3 0.25"
            />
          </g>
        )}

        <g stroke="#6f736f" strokeWidth="0.06" fontSize="0.8" fill="#4c514e">
          <line x1="0" y1={-1.1} x2={width} y2={-1.1} />
          <text x={width / 2} y={-1.5} textAnchor="middle">
            {width.toFixed(1)} m
          </text>

          <line x1={-1.1} y1="0" x2={-1.1} y2={length} />
          <text
            x={-1.5}
            y={length / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${-1.5} ${length / 2})`}
          >
            {length.toFixed(1)} m
          </text>
        </g>
      </svg>

      {plan.rooms.length === 0 && (
        <p className="floorplan-empty">No rooms on this level yet — add some from the Rooms panel.</p>
      )}
    </div>
  );
}
