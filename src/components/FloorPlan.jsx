import { useMemo } from "react";

import { layoutFloor, WALL_THICKNESS } from "../lib/layout";

const PADDING = 2.4;

export default function FloorPlan({ design, floor, selectedRoomId, onSelectRoom }) {
  const { width, length } = design.architecture;

  const layout = useMemo(() => layoutFloor(design, floor), [design, floor]);

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

        {layout.rooms.map((room) => (
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
              fill={room.color}
              stroke="#2c302e"
              strokeWidth="0.12"
            />

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

        {floor === 0 && (
          <g>
            <rect x={width / 2 - 0.9} y={length - WALL_THICKNESS} width="1.8" height={WALL_THICKNESS} fill="#f7f5ef" />
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

      {layout.rooms.length === 0 && (
        <p className="floorplan-empty">No rooms on this level yet — add some from the Rooms panel.</p>
      )}
    </div>
  );
}
