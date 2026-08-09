import { useMemo } from "react";

import { BASE_INTERIOR, DOOR_HEIGHT, INTERIOR_WALL, interiorPlan, paletteOf } from "../lib/interior";
import { surfaceTexture } from "../lib/textures";
import Furniture from "./Furniture";

function Partition({ wall, height, color }) {
  const length = wall.length;
  const thickness = INTERIOR_WALL;
  const doorHeight = Math.min(DOOR_HEIGHT, height - 0.25);

  const size = (span, tall) =>
    wall.horizontal ? [span, tall, thickness] : [thickness, tall, span];

  const along = (offset) =>
    wall.horizontal ? [wall.center.x + offset, 0, wall.center.z] : [wall.center.x, 0, wall.center.z + offset];

  if (!wall.door) {
    const [x, , z] = along(0);

    return (
      <mesh position={[x, height / 2, z]} castShadow receiveShadow>
        <boxGeometry args={size(length, height)} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    );
  }

  const side = (length - wall.door.width) / 2;
  const offset = (wall.door.width + side) / 2;

  return (
    <group>
      {[-1, 1].map((direction) => {
        const [x, , z] = along(direction * offset);

        return (
          <mesh key={direction} position={[x, height / 2, z]} castShadow receiveShadow>
            <boxGeometry args={size(side, height)} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
        );
      })}

      {(() => {
        const [x, , z] = along(0);

        return (
          <mesh position={[x, doorHeight + (height - doorHeight) / 2, z]} castShadow receiveShadow>
            <boxGeometry args={size(wall.door.width, height - doorHeight)} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
        );
      })()}

      {(() => {
        const [x, , z] = along(-wall.door.width / 2 + 0.02);

        return (
          <mesh
            position={[x, doorHeight / 2, z]}
            rotation={[0, wall.horizontal ? -0.9 : Math.PI / 2 - 0.9, 0]}
            castShadow
          >
            <boxGeometry args={[wall.door.width - 0.04, doorHeight - 0.04, 0.045]} />
            <meshStandardMaterial color="#f0ede6" roughness={0.6} />
          </mesh>
        );
      })()}
    </group>
  );
}

function RoomFloor({ room, texture }) {
  return (
    <mesh position={[room.cx, 0.01, room.cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[room.width - 0.02, room.length - 0.02]} />
      <meshStandardMaterial
        color={room.finish.floor.color}
        map={texture}
        roughness={room.finish.floor.id === "marble" ? 0.25 : 0.8}
      />
    </mesh>
  );
}

function Pendant({ x, z, height, night }) {
  return (
    <group position={[x, height - 0.05, z]}>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.56, 6]} />
        <meshStandardMaterial color="#2c2f31" />
      </mesh>

      <mesh position={[0, -0.62, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.11, 0.22, 18]} />
        <meshStandardMaterial
          color="#f6efdc"
          emissive={night ? "#ffcb85" : "#000000"}
          emissiveIntensity={night ? 1.5 : 0}
          roughness={0.6}
        />
      </mesh>

      {night && <pointLight position={[0, -0.7, 0]} intensity={5} distance={7} color="#ffca86" />}
    </group>
  );
}

function Ceiling({ width, length, height, style, color, wood }) {
  if (style === "flat" || style === "cove") return null;

  if (style === "beams") {
    const beams = Math.max(3, Math.round(length / 1.6));

    return (
      <group>
        {Array.from({ length: beams }, (_, index) => (
          <mesh
            key={index}
            position={[0, height - 0.16, -length / 2 + (length * (index + 0.5)) / beams]}
            castShadow
          >
            <boxGeometry args={[width, 0.24, 0.18]} />
            <meshStandardMaterial color={wood} roughness={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  const cols = Math.max(2, Math.round(width / 2.4));
  const rows = Math.max(2, Math.round(length / 2.4));

  return (
    <group>
      {Array.from({ length: cols + 1 }, (_, index) => (
        <mesh key={`c-${index}`} position={[-width / 2 + (width * index) / cols, height - 0.1, 0]}>
          <boxGeometry args={[0.16, 0.2, length]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}

      {Array.from({ length: rows + 1 }, (_, index) => (
        <mesh key={`r-${index}`} position={[0, height - 0.1, -length / 2 + (length * index) / rows]}>
          <boxGeometry args={[width, 0.2, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Furnished interior of a single storey, drawn in building coordinates
 * (origin at the footprint centre, y at the storey's finished floor level).
 */
export default function Interior({ design, floor, base = 0, night = false, scale = 1 }) {
  const settings = design.interior || BASE_INTERIOR;
  const palette = paletteOf(design);
  const { width, length, floorHeight } = design.architecture;

  const plan = useMemo(() => interiorPlan(design, floor), [design, floor]);

  const rooms = plan.rooms.map((room) => ({
    ...room,
    cx: room.x + room.width / 2 - width / 2,
    cz: room.y + room.length / 2 - length / 2,
  }));

  const partitions = plan.partitions.map((wall) => ({
    ...wall,
    center: { x: wall.center.x - width / 2, z: wall.center.z - length / 2 },
  }));

  const textures = useMemo(() => {
    const unique = new Map();

    rooms.forEach((room) => {
      const finish = room.finish.floor;

      if (!unique.has(finish.id)) {
        unique.set(finish.id, surfaceTexture(finish.texture, finish.color, Math.max(2, room.width / 1.4)));
      }
    });

    return unique;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, settings.floorMaterial, settings.style]);

  return (
    <group position={[0, base, 0]} scale={[scale, 1, scale]}>
      {rooms.map((room) => (
        <group key={room.id}>
          <RoomFloor room={room} texture={textures.get(room.finish.floor.id)} />

          <group position={[room.cx, 0, room.cz]}>
            {room.furniture.map((piece, index) => (
              <Furniture
                key={`${piece.kind}-${index}`}
                piece={piece}
                palette={{ ...palette, wall: room.finish.wall }}
                ceilingHeight={floorHeight}
              />
            ))}

            {settings.artwork && room.width > 2.4 && (
              <mesh position={[0, 1.65, -room.length / 2 + 0.08]} castShadow>
                <boxGeometry args={[Math.min(room.width * 0.4, 1.4), 0.9, 0.05]} />
                <meshStandardMaterial color={palette.accent} roughness={0.7} />
              </mesh>
            )}
          </group>

          {settings.pendants && (
            <Pendant x={room.cx} z={room.cz} height={floorHeight} night={night} />
          )}
        </group>
      ))}

      {partitions.map((wall, index) => (
        <Partition
          key={`${wall.center.x}-${wall.center.z}-${index}`}
          wall={wall}
          height={floorHeight - 0.12}
          color={palette.wall}
        />
      ))}

      <Ceiling
        width={width - 0.6}
        length={length - 0.6}
        height={floorHeight - 0.05}
        style={settings.ceiling}
        color={palette.ceiling}
        wood={palette.wood}
      />
    </group>
  );
}
