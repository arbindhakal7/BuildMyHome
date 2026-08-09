import { useMemo } from "react";
import * as THREE from "three";

import { materialOf, roofHeightOf, windowStyleOf, doorStyleOf } from "../lib/design";
import { facadePattern, surfaceTexture } from "../lib/textures";
import {
  butterflyGeometry,
  facadeOpenings,
  gableGeometry,
  hashSeed,
  hipGeometry,
  mansardGeometry,
  seededRandom,
  shedGeometry,
  wallSegments,
} from "./geometry";

const WALL_THICKNESS = 0.3;
const SLAB_THICKNESS = 0.28;
const FRAME_DEPTH = 0.14;

const FRAME_COLORS = {
  black: "#1b1d1e",
  white: "#eeece5",
  bronze: "#6d5138",
  natural: "#8a6547",
};

function Solid({ position, size, color, map, roughness = 0.85, metalness = 0, rotation }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} map={map} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

/* =========================================================
   GLAZING
========================================================= */

function mullionCount(style, width) {
  switch (style) {
    case "standard":
      return { vertical: 1, horizontal: 1 };
    case "floor-to-ceiling":
      return { vertical: Math.max(1, Math.round(width / 1.3) - 1), horizontal: 0 };
    case "vertical":
      return { vertical: 0, horizontal: 2 };
    case "corner":
      return { vertical: 0, horizontal: 0 };
    default:
      return { vertical: Math.max(1, Math.round(width / 2.2) - 1), horizontal: 0 };
  }
}

function Glazing({ width, height, style, glassColor, frameColor, night }) {
  const grid = mullionCount(style, width);
  const frame = 0.09;

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width - frame, height - frame, 0.04]} />
        <meshStandardMaterial
          color={night ? "#ffd9a1" : glassColor}
          transparent
          opacity={night ? 0.95 : 0.62}
          roughness={0.06}
          metalness={0.15}
          emissive={night ? "#ffb35c" : "#000000"}
          emissiveIntensity={night ? 1.4 : 0}
        />
      </mesh>

      {[
        [0, height / 2 - frame / 2, width, frame],
        [0, -height / 2 + frame / 2, width, frame],
      ].map(([x, y, w, h]) => (
        <Solid
          key={`h-${y}`}
          position={[x, y, 0]}
          size={[w, h, FRAME_DEPTH]}
          color={frameColor}
          roughness={0.4}
          metalness={0.3}
        />
      ))}

      {[-1, 1].map((side) => (
        <Solid
          key={`v-${side}`}
          position={[(side * (width - frame)) / 2, 0, 0]}
          size={[frame, height, FRAME_DEPTH]}
          color={frameColor}
          roughness={0.4}
          metalness={0.3}
        />
      ))}

      {Array.from({ length: grid.vertical }, (_, index) => (
        <Solid
          key={`mv-${index}`}
          position={[-width / 2 + ((index + 1) * width) / (grid.vertical + 1), 0, 0.01]}
          size={[0.06, height - frame, FRAME_DEPTH * 0.8]}
          color={frameColor}
          roughness={0.4}
          metalness={0.3}
        />
      ))}

      {Array.from({ length: grid.horizontal }, (_, index) => (
        <Solid
          key={`mh-${index}`}
          position={[0, -height / 2 + ((index + 1) * height) / (grid.horizontal + 1), 0.01]}
          size={[width - frame, 0.06, FRAME_DEPTH * 0.8]}
          color={frameColor}
          roughness={0.4}
          metalness={0.3}
        />
      ))}
    </group>
  );
}

function EntryDoor({ width, height, color, style, night }) {
  const glass = doorStyleOf(style).glass;

  return (
    <group>
      <Solid position={[0, 0, 0]} size={[width, height, 0.14]} color={color} roughness={0.45} />

      {glass && (
        <mesh position={[0, 0.1, 0.06]}>
          <boxGeometry args={[width * 0.42, height * 0.72, 0.04]} />
          <meshStandardMaterial
            color={night ? "#ffd9a1" : "#9dbecb"}
            transparent
            opacity={night ? 0.95 : 0.55}
            roughness={0.08}
            emissive={night ? "#ffb35c" : "#000000"}
            emissiveIntensity={night ? 1.2 : 0}
          />
        </mesh>
      )}

      <mesh position={[width / 2 - 0.16, 0, 0.12]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, height * 0.42, 12]} />
        <meshStandardMaterial color="#c8a86c" metalness={0.85} roughness={0.22} />
      </mesh>
    </group>
  );
}

/* =========================================================
   WALLS
========================================================= */

function Wall({ span, height, openings, facade, glass, night, door }) {
  const segments = useMemo(() => wallSegments(span, height, openings), [span, height, openings]);

  return (
    <group>
      {segments.map((segment, index) => (
        <Solid
          key={index}
          position={[segment.x, segment.y, 0]}
          size={[segment.width, segment.height, WALL_THICKNESS]}
          color={facade.color}
          map={facade.map}
          roughness={facade.roughness}
        />
      ))}

      {openings.map((opening) => (
        <group key={`o-${opening.x}-${opening.y}`} position={[opening.x, opening.y, 0]}>
          {opening.kind === "door" ? (
            <EntryDoor
              width={opening.width}
              height={opening.height}
              color={door.color}
              style={door.style}
              night={night}
            />
          ) : (
            <>
              <Glazing
                width={opening.width}
                height={opening.height}
                style={glass.style}
                glassColor={glass.color}
                frameColor={glass.frame}
                night={night}
              />

              <Solid
                position={[0, -opening.height / 2 - 0.06, 0.06]}
                size={[opening.width + 0.24, 0.1, WALL_THICKNESS + 0.16]}
                color="#cfcabf"
                roughness={0.7}
              />
            </>
          )}
        </group>
      ))}
    </group>
  );
}

function Storey({ width, length, height, base, openings, facade, glass, night, door, interiorColor }) {
  const sides = [
    { key: "front", span: width, position: [0, base, length / 2 - WALL_THICKNESS / 2], rotation: [0, 0, 0], openings: openings.front },
    { key: "back", span: width, position: [0, base, -length / 2 + WALL_THICKNESS / 2], rotation: [0, Math.PI, 0], openings: openings.back },
    { key: "right", span: length, position: [width / 2 - WALL_THICKNESS / 2, base, 0], rotation: [0, Math.PI / 2, 0], openings: openings.right },
    { key: "left", span: length, position: [-width / 2 + WALL_THICKNESS / 2, base, 0], rotation: [0, -Math.PI / 2, 0], openings: openings.left },
  ];

  return (
    <group>
      {sides.map((side) => (
        <group key={side.key} position={side.position} rotation={side.rotation}>
          <Wall
            span={side.span}
            height={height}
            openings={side.openings}
            facade={facade}
            glass={glass}
            night={night}
            door={door}
          />
        </group>
      ))}

      {/* Interior shell, visible through the openings. */}
      <mesh position={[0, base + height / 2, 0]}>
        <boxGeometry args={[width - WALL_THICKNESS * 2, height - 0.02, length - WALL_THICKNESS * 2]} />
        <meshStandardMaterial
          color={interiorColor}
          side={THREE.BackSide}
          roughness={0.95}
          emissive={night ? "#40260c" : "#000000"}
          emissiveIntensity={night ? 0.9 : 0}
        />
      </mesh>

      <Solid
        position={[0, base + SLAB_THICKNESS / 2, 0]}
        size={[width + 0.16, SLAB_THICKNESS, length + 0.16]}
        color="#d6d2c8"
        roughness={0.9}
      />
    </group>
  );
}

/* =========================================================
   ROOF
========================================================= */

function Roof({ architecture, base, night }) {
  const { width, length, roofStyle, roofColor, roofOverhang } = architecture;

  const roofWidth = width + roofOverhang * 2;
  const roofLength = length + roofOverhang * 2;
  const height = roofHeightOf(architecture);

  const texture = useMemo(
    () => (roofStyle === "flat" ? null : surfaceTexture("shingle", roofColor, 6)),
    [roofStyle, roofColor]
  );

  const geometry = useMemo(() => {
    switch (roofStyle) {
      case "gable":
        return gableGeometry(roofWidth, roofLength, height);
      case "hip":
        return hipGeometry(roofWidth, roofLength, height);
      case "shed":
        return shedGeometry(roofWidth, roofLength, height);
      case "butterfly":
        return butterflyGeometry(roofWidth, roofLength, height);
      case "mansard":
        return mansardGeometry(roofWidth, roofLength, height);
      default:
        return null;
    }
  }, [roofStyle, roofWidth, roofLength, height]);

  if (!geometry) {
    return (
      <group position={[0, base, 0]}>
        <Solid
          position={[0, 0.14, 0]}
          size={[roofWidth, 0.28, roofLength]}
          color={roofColor}
          roughness={0.9}
        />

        {/* Parapet */}
        {[
          [0, [roofWidth, 0.6, 0.24], [0, 0.58, roofLength / 2 - 0.12]],
          [1, [roofWidth, 0.6, 0.24], [0, 0.58, -roofLength / 2 + 0.12]],
          [2, [0.24, 0.6, roofLength], [roofWidth / 2 - 0.12, 0.58, 0]],
          [3, [0.24, 0.6, roofLength], [-roofWidth / 2 + 0.12, 0.58, 0]],
        ].map(([key, size, position]) => (
          <Solid key={key} position={position} size={size} color={roofColor} roughness={0.8} />
        ))}
      </group>
    );
  }

  return (
    <group position={[0, base, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={roofColor}
          map={texture}
          roughness={0.82}
          emissive={night ? "#05070a" : "#000000"}
        />
      </mesh>

      {/* Fascia board around the eaves */}
      <Solid position={[0, -0.06, roofLength / 2]} size={[roofWidth, 0.22, 0.1]} color="#3a3d3f" />
      <Solid position={[0, -0.06, -roofLength / 2]} size={[roofWidth, 0.22, 0.1]} color="#3a3d3f" />
    </group>
  );
}

/* =========================================================
   ATTACHED STRUCTURES
========================================================= */

function Balcony({ position, width, depth, facadeColor }) {
  const posts = Math.max(2, Math.round(width / 1.4));

  return (
    <group position={position}>
      <Solid position={[0, 0, 0]} size={[width, 0.22, depth]} color={facadeColor} roughness={0.85} />
      <Solid position={[0, -0.16, 0]} size={[width - 0.3, 0.12, depth - 0.3]} color="#8d8a82" />

      <mesh position={[0, 0.62, depth / 2 - 0.05]}>
        <boxGeometry args={[width - 0.1, 1.05, 0.03]} />
        <meshStandardMaterial color="#a9c6d0" transparent opacity={0.35} roughness={0.05} metalness={0.2} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * (width - 0.1)) / 2, 0.62, 0]}>
          <boxGeometry args={[0.03, 1.05, depth - 0.1]} />
          <meshStandardMaterial color="#a9c6d0" transparent opacity={0.35} roughness={0.05} metalness={0.2} />
        </mesh>
      ))}

      <Solid position={[0, 1.16, depth / 2 - 0.05]} size={[width, 0.07, 0.09]} color="#2a2d2f" metalness={0.6} roughness={0.3} />

      {Array.from({ length: posts }, (_, index) => (
        <Solid
          key={index}
          position={[-width / 2 + (width * index) / (posts - 1 || 1), 0.62, depth / 2 - 0.05]}
          size={[0.06, 1.05, 0.06]}
          color="#2a2d2f"
          metalness={0.6}
          roughness={0.3}
        />
      ))}
    </group>
  );
}

function Porch({ width, depth, height, position, columnColor }) {
  return (
    <group position={position}>
      <Solid position={[0, height, 0]} size={[width, 0.22, depth]} color="#54565a" roughness={0.8} />

      {[-1, 1].map((side) => (
        <Solid
          key={side}
          position={[(side * (width - 0.6)) / 2, height / 2, depth / 2 - 0.3]}
          size={[0.16, height, 0.16]}
          color={columnColor}
          roughness={0.6}
        />
      ))}
    </group>
  );
}

function Steps({ position, width, count = 3 }) {
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, index) => (
        <Solid
          key={index}
          position={[0, 0.09 + index * 0.18, (count - index) * 0.34 - 0.17]}
          size={[width - index * 0.18, 0.18, 0.34]}
          color="#c3bdb1"
          roughness={0.9}
        />
      ))}
    </group>
  );
}

function Garage({ position, bays, height, facade, roofColor }) {
  const width = bays * 3.2 + 0.8;
  const depth = 6.4;

  return (
    <group position={position}>
      <Solid
        position={[0, height / 2, 0]}
        size={[width, height, depth]}
        color={facade.color}
        map={facade.map}
        roughness={facade.roughness}
      />

      <Solid position={[0, height + 0.16, 0]} size={[width + 0.5, 0.3, depth + 0.5]} color={roofColor} />

      {Array.from({ length: bays }, (_, index) => (
        <group
          key={index}
          position={[-width / 2 + 0.4 + 1.6 + index * 3.2, height * 0.42, depth / 2 + 0.02]}
        >
          <Solid position={[0, 0, 0]} size={[2.9, height * 0.78, 0.14]} color="#33373a" roughness={0.55} />

          {Array.from({ length: 4 }, (_, line) => (
            <Solid
              key={line}
              position={[0, -height * 0.3 + line * height * 0.2, 0.08]}
              size={[2.9, 0.04, 0.04]}
              color="#5b6064"
            />
          ))}
        </group>
      ))}
    </group>
  );
}

function Pergola({ position, width, depth }) {
  const beams = Math.max(4, Math.round(depth * 1.6));

  return (
    <group position={position}>
      {[
        [-width / 2 + 0.1, -depth / 2 + 0.1],
        [width / 2 - 0.1, -depth / 2 + 0.1],
        [-width / 2 + 0.1, depth / 2 - 0.1],
        [width / 2 - 0.1, depth / 2 - 0.1],
      ].map(([x, z]) => (
        <Solid key={`${x}-${z}`} position={[x, 1.3, z]} size={[0.14, 2.6, 0.14]} color="#6d5540" />
      ))}

      {Array.from({ length: beams }, (_, index) => (
        <Solid
          key={index}
          position={[0, 2.66, -depth / 2 + (depth * index) / (beams - 1)]}
          size={[width, 0.1, 0.08]}
          color="#7a614a"
        />
      ))}
    </group>
  );
}

function Pool({ position, width, length }) {
  const water = useMemo(() => surfaceTexture("water", "#3fb0d2", 2), []);
  const coping = useMemo(() => surfaceTexture("paving", "#cdc6b8", 3), []);

  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[width + 1.6, 0.12, length + 1.6]} />
        <meshStandardMaterial map={coping} roughness={0.9} />
      </mesh>

      <Solid position={[0, 0.02, 0]} size={[width, 0.5, length]} color="#1b6f8d" roughness={0.4} />

      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[width - 0.2, 0.06, length - 0.2]} />
        <meshStandardMaterial map={water} roughness={0.08} metalness={0.25} transparent opacity={0.92} />
      </mesh>

      {[0, 1, 2].map((index) => (
        <Solid
          key={index}
          position={[-width / 2 + 0.9, 0.02 - index * 0.12, length / 2 - 0.7 - index * 0.32]}
          size={[1.5, 0.08, 0.32]}
          color="#d8f1f7"
        />
      ))}
    </group>
  );
}

function Tree({ position, scale, random }) {
  const layers = 3;

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.24, 2.2, 8]} />
        <meshStandardMaterial color="#5b4230" roughness={0.95} />
      </mesh>

      {Array.from({ length: layers }, (_, index) => (
        <mesh key={index} position={[0, 2.2 + index * 0.72, 0]} castShadow>
          <icosahedronGeometry args={[1.25 - index * 0.24, 1]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#3f7048" : "#4a7d55"}
            roughness={0.95}
            flatShading
          />
        </mesh>
      ))}

      <mesh position={[random() * 0.3, 2.4, random() * 0.3]} castShadow>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#456f4a" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

function Hedge({ position, size }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#4b6d43" roughness={1} />
    </mesh>
  );
}

/* =========================================================
   HOUSE
========================================================= */

export default function House({ design, night = false, showGround = true }) {
  const a = design.architecture;
  const features = design.features;

  const material = materialOf(a.facadeMaterial);
  const windowStyle = windowStyleOf(a.windowStyle);

  const facadeMap = useMemo(
    () => surfaceTexture(facadePattern(a.facadeMaterial), a.facadeColor, Math.max(3, a.width / 4)),
    [a.facadeMaterial, a.facadeColor, a.width]
  );

  const facade = { color: a.facadeColor, map: facadeMap, roughness: material.roughness };

  const glass = {
    style: a.windowStyle,
    color: a.windowColor,
    frame: FRAME_COLORS[a.windowFrame] || FRAME_COLORS.black,
  };

  const door = { style: a.doorStyle, color: a.doorColor };
  const doorSpec = doorStyleOf(a.doorStyle);

  const random = useMemo(
    () => seededRandom(hashSeed(`${design.id}-${a.width}-${a.length}-${a.floors}`)),
    [design.id, a.width, a.length, a.floors]
  );

  const grass = useMemo(() => surfaceTexture("grass", "#6e8a58", 24), []);
  const paving = useMemo(() => surfaceTexture("paving", "#9c968c", 6), []);
  const deck = useMemo(() => surfaceTexture("siding", "#a5825c", 8), []);

  const storeys = Array.from({ length: a.floors }, (_, floor) => {
    const setback = floor === 0 ? 0 : a.upperSetback;
    const width = a.width - setback * 2;
    const length = a.length - setback * 2;
    const base = floor * a.floorHeight + (a.plinth ? 0.35 : 0);

    const sill = windowStyle.type === "floor" ? 0.25 : 0.95;
    const openingHeight = Math.min(a.floorHeight - sill - 0.5, windowStyle.height * (0.7 + a.windowRatio * 0.6));

    const doorWidth = doorSpec.width;
    const doorHeight = Math.min(doorSpec.height, a.floorHeight - 0.45);

    const front = facadeOpenings({
      span: width,
      bay: 3.6,
      ratio: a.windowRatio,
      sill,
      height: openingHeight,
      skip: floor === 0 ? [{ x: 0, width: doorWidth + 1.1 }] : [],
    });

    if (floor === 0) {
      front.push({ x: 0, y: doorHeight / 2, width: doorWidth, height: doorHeight, kind: "door" });
    }

    return {
      floor,
      width,
      length,
      base,
      openings: {
        front,
        back: facadeOpenings({ span: width, bay: 4.2, ratio: a.windowRatio, sill, height: openingHeight }),
        right: facadeOpenings({ span: length, bay: 4.4, ratio: a.windowRatio, sill, height: openingHeight }),
        left: facadeOpenings({ span: length, bay: 4.4, ratio: a.windowRatio, sill, height: openingHeight }),
      },
    };
  });

  const roofBase = a.floors * a.floorHeight + (a.plinth ? 0.35 : 0);

  return (
    <group>
      {showGround && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[Math.max(90, a.width * 4), Math.max(90, a.length * 3.4)]} />
            <meshStandardMaterial map={grass} roughness={1} color={night ? "#4a5c42" : "#ffffff"} />
          </mesh>

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, a.length / 2 + 6]} receiveShadow>
            <planeGeometry args={[a.width + 8, 10]} />
            <meshStandardMaterial map={paving} roughness={0.95} />
          </mesh>
        </>
      )}

      {a.plinth && (
        <Solid
          position={[0, 0.18, 0]}
          size={[a.width + 0.7, 0.36, a.length + 0.7]}
          color="#b4aea3"
          roughness={0.95}
        />
      )}

      {storeys.map((storey) => (
        <Storey
          key={storey.floor}
          width={storey.width}
          length={storey.length}
          height={a.floorHeight}
          base={storey.base}
          openings={storey.openings}
          facade={facade}
          glass={glass}
          night={night}
          door={door}
          interiorColor={night ? "#4a3322" : "#8c8880"}
        />
      ))}

      <Roof architecture={a} base={roofBase} night={night} />

      <Steps position={[0, 0, a.length / 2 + 0.2]} width={doorSpec.width + 1.2} />

      {features.porch && (
        <Porch
          position={[0, 0, a.length / 2 + 1.5]}
          width={Math.min(a.width * 0.5, 7)}
          depth={3}
          height={Math.min(a.floorHeight - 0.2, 3)}
          columnColor={a.facadeColor}
        />
      )}

      {a.floors >= 2 &&
        Array.from({ length: Math.min(features.balcony, (a.floors - 1) * 2) }, (_, index) => {
          const level = Math.floor(index / 2) + 1;
          const side = index % 2 === 0 ? -1 : 1;
          const offset = features.balcony === 1 ? 0 : side * (a.width / 4);

          return (
            <Balcony
              key={index}
              position={[offset, level * a.floorHeight + (a.plinth ? 0.35 : 0), a.length / 2 + 1]}
              width={Math.min(a.width / 2.4, 5.5)}
              depth={2.2}
              facadeColor={a.facadeColor}
            />
          );
        })}

      {features.garages > 0 && (
        <Garage
          position={[a.width / 2 + (features.garages * 3.2 + 0.8) / 2 + 1.2, 0, a.length / 4]}
          bays={features.garages}
          height={Math.min(3.2, a.floorHeight)}
          facade={facade}
          roofColor={a.roofColor}
        />
      )}

      {features.driveway && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[a.width / 2 + 4, 0.02, a.length / 2 + 5]}
          receiveShadow
        >
          <planeGeometry args={[features.garages * 3.4 + 3, 12]} />
          <meshStandardMaterial map={paving} roughness={0.95} />
        </mesh>
      )}

      {features.terrace && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.06, -a.length / 2 - 3]}
          receiveShadow
        >
          <planeGeometry args={[a.width * 0.75, 6]} />
          <meshStandardMaterial map={deck} roughness={0.85} />
        </mesh>
      )}

      {features.pergola && (
        <Pergola position={[0, 0, -a.length / 2 - 3]} width={a.width * 0.55} depth={4.5} />
      )}

      {features.outdoorKitchen && (
        <group position={[a.width * 0.24, 0, -a.length / 2 - 2.2]}>
          <Solid position={[0, 0.5, 0]} size={[3.2, 1, 0.9]} color="#5c5f61" roughness={0.6} />
          <Solid position={[0, 1.04, 0]} size={[3.4, 0.09, 1]} color="#2f3234" metalness={0.4} roughness={0.3} />
        </group>
      )}

      {features.pool && (
        <Pool position={[-a.width / 2 - 6.5, 0, -a.length / 6]} width={5.5} length={11} />
      )}

      {features.chimney && (
        <Solid
          position={[a.width / 4, roofBase + roofHeightOf(a) * 0.6 + 0.8, -a.length / 5]}
          size={[1.1, roofHeightOf(a) + 1.8, 1.1]}
          color="#8d8577"
          roughness={0.95}
        />
      )}

      {features.solar && a.roofStyle === "flat" && (
        <group position={[0, roofBase + 0.5, 0]}>
          {Array.from({ length: 6 }, (_, index) => (
            <Solid
              key={index}
              position={[-a.width / 3 + (index % 3) * 2.6, 0.2, -a.length / 4 + Math.floor(index / 3) * 3]}
              size={[2.4, 0.08, 2.4]}
              color="#1c2a44"
              rotation={[-0.22, 0, 0]}
              metalness={0.5}
              roughness={0.25}
            />
          ))}
        </group>
      )}

      {features.courtyard && (
        <group position={[0, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, roofBase + 0.32, 0]}>
            <planeGeometry args={[a.width * 0.3, a.length * 0.22]} />
            <meshStandardMaterial color="#7f9469" roughness={1} />
          </mesh>
        </group>
      )}

      {features.fence &&
        [1, -1].map((side) => (
          <Solid
            key={side}
            position={[side * (a.width / 2 + 12), 0.7, 0]}
            size={[0.16, 1.4, a.length + 16]}
            color="#6f6558"
            roughness={0.9}
          />
        ))}

      {features.garden && (
        <>
          {Array.from({ length: 7 }, (_, index) => {
            const side = index % 2 === 0 ? -1 : 1;

            return (
              <Tree
                key={index}
                position={[
                  side * (a.width / 2 + 4 + random() * 7),
                  0,
                  -a.length / 2 + random() * (a.length + 10),
                ]}
                scale={0.8 + random() * 0.6}
                random={random}
              />
            );
          })}

          <Hedge position={[0, 0.4, a.length / 2 + 11]} size={[a.width + 6, 0.8, 0.9]} />
        </>
      )}
    </group>
  );
}
