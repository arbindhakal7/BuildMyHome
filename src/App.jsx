import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
} from "@react-three/drei";

import {
  Home,
  Plus,
  Save,
  Undo2,
  Redo2,
  RotateCcw,
  Maximize,
  Moon,
  Sun,
  ChevronRight,
  Building2,
  Palette,
  Layers3,
  DoorOpen,
  Square,
  Warehouse,
  Waves,
  TreePine,
  Sofa,
  BedDouble,
  Bath,
  Utensils,
  Trash2,
  LayoutDashboard,
  Settings2,
  Download,
  Copy,
  X,
  Ruler,
  Building,
  CarFront,
  Dumbbell,
  MonitorPlay,
  BriefcaseBusiness,
  UtensilsCrossed,
} from "lucide-react";

import { HOUSE_TEMPLATES } from "./data/houseTemplates";
import {
  MATERIALS,
  ROOF_STYLES,
  DOOR_STYLES,
  WINDOW_STYLES,
  WINDOW_FRAMES,
  DRIVEWAY_MATERIALS,
  FLOOR_MATERIALS,
} from "./data/materials";
import {
  ROOM_TYPES,
  ROOM_CATEGORIES,
} from "./data/roomTypes";

import "./index.css";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_ROOMS = [
  {
    id: crypto.randomUUID(),
    type: "living",
    name: "Living Room",
    floor: 0,
    width: 6,
    length: 5,
  },
  {
    id: crypto.randomUUID(),
    type: "kitchen",
    name: "Kitchen",
    floor: 0,
    width: 4,
    length: 4,
  },
  {
    id: crypto.randomUUID(),
    type: "master",
    name: "Master Suite",
    floor: 1,
    width: 6,
    length: 5,
  },
  {
    id: crypto.randomUUID(),
    type: "bedroom",
    name: "Bedroom",
    floor: 1,
    width: 4,
    length: 4,
  },
];

const INITIAL_DESIGN = {
  id: crypto.randomUUID(),
  name: "My Dream Home",

  architecture: {
    style: "contemporary",
    width: 18,
    length: 26,
    floors: 2,
    floorHeight: 3.2,

    upperSetback: 0,
    secondWing: true,
    rearWing: false,

    roofStyle: "flat",
    roofOverhang: 0.6,

    facadeMaterial: "stucco",
    facadeColor: "#e8e0d2",

    roofColor: "#20252a",

    windowStyle: "panoramic",
    windowColor: "#78aabd",

    doorStyle: "pivot",
    doorColor: "#4d3528",
  },

  features: {
    garages: 2,
    balcony: 2,
    terrace: true,
    pool: true,
    porch: true,
    garden: true,
    driveway: true,
    outdoorKitchen: false,
  },

  rooms: DEFAULT_ROOMS,

  savedAt: null,
};

/* =========================================================
   HELPERS
========================================================= */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function priceOf(design) {
  const a = design.architecture;

  const baseArea = a.width * a.length;

  let price = 180000;

  price += baseArea * 950;

  price += Math.max(0, a.floors - 1) * baseArea * 450;

  price += design.features.garages * 38000;

  price += design.features.balcony * 18000;

  if (design.features.terrace) price += 25000;
  if (design.features.pool) price += 65000;
  if (design.features.porch) price += 14000;
  if (design.features.garden) price += 18000;
  if (design.features.driveway) price += 12000;
  if (design.features.outdoorKitchen) price += 22000;

  const material = MATERIALS.find(
    (m) => m.id === a.facadeMaterial
  );

  price *= material?.priceFactor || 1;

  return Math.round(price);
}

/* =========================================================
   3D PRIMITIVES
========================================================= */

function Box({
  position,
  size,
  color,
  roughness = 0.7,
  metalness = 0,
  castShadow = true,
}) {
  return (
    <mesh
      position={position}
      castShadow={castShadow}
      receiveShadow
    >
      <boxGeometry args={size} />

      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

function WindowUnit({
  position,
  rotation = [0, 0, 0],
  width = 2.8,
  height = 1.9,
  style = "panoramic",
  color = "#78aabd",
}) {
  const glassWidth =
    style === "vertical"
      ? width * 0.55
      : width;

  return (
    <group
      position={position}
      rotation={rotation}
    >
      <Box
        position={[0, 0, 0]}
        size={[
          width + 0.18,
          height + 0.18,
          0.16,
        ]}
        color="#25282a"
      />

      <Box
        position={[0, 0, 0.1]}
        size={[
          glassWidth,
          height - 0.16,
          0.05,
        ]}
        color={color}
        roughness={0.12}
        metalness={0.05}
      />

      {style !== "vertical" && (
        <Box
          position={[0, 0, 0.14]}
          size={[
            0.07,
            height - 0.16,
            0.08,
          ]}
          color="#25282a"
        />
      )}

      <Box
        position={[0, 0, 0.14]}
        size={[
          width - 0.15,
          0.07,
          0.08,
        ]}
        color="#25282a"
      />
    </group>
  );
}

function DoorUnit({
  position,
  style = "pivot",
  color = "#4d3528",
}) {
  const width =
    style === "double" ? 2.4 : 1.5;

  return (
    <group position={position}>
      <Box
        position={[0, 1.3, 0]}
        size={[width, 2.6, 0.18]}
        color={color}
        roughness={0.4}
      />

      {style === "glass" && (
        <Box
          position={[0, 1.3, 0.12]}
          size={[
            width - 0.25,
            2.2,
            0.04,
          ]}
          color="#6e9eaf"
          roughness={0.12}
        />
      )}

      <mesh
        position={[
          width / 2 - 0.25,
          1.3,
          -0.12,
        ]}
      >
        <sphereGeometry
          args={[0.07, 16, 16]}
        />

        <meshStandardMaterial
          color="#d9b96e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   ARCHITECTURAL MASSING
========================================================= */

function FloorSlab({
  width,
  length,
  y,
  color = "#d2cec5",
}) {
  return (
    <Box
      position={[0, y, 0]}
      size={[width + 0.35, 0.18, length + 0.35]}
      color={color}
    />
  );
}

function Roof({
  design,
  y,
}) {
  const {
    width,
    length,
    roofStyle,
    roofColor,
    roofOverhang,
  } = design.architecture;

  if (roofStyle === "flat") {
    return (
      <group>
        <Box
          position={[
            0,
            y + 0.25,
            0,
          ]}
          size={[
            width + roofOverhang * 2,
            0.45,
            length + roofOverhang * 2,
          ]}
          color={roofColor}
        />

        <Box
          position={[
            0,
            y + 0.52,
            0,
          ]}
          size={[
            width + 0.4,
            0.12,
            length + 0.4,
          ]}
          color="#151719"
        />
      </group>
    );
  }

  const roofHeight =
    roofStyle === "hip"
      ? 2.5
      : 3.2;

  return (
    <group
      position={[
        0,
        y + roofHeight / 2,
        0,
      ]}
    >
      <mesh
        rotation={[
          0,
          Math.PI / 4,
          0,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            Math.max(
              width,
              length
            ) / 1.42,
            roofHeight,
            4,
          ]}
        />

        <meshStandardMaterial
          color={roofColor}
          roughness={0.72}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   BALCONY
========================================================= */

function Balcony({
  position,
  width = 5,
  depth = 2,
}) {
  return (
    <group position={position}>
      <Box
        position={[0, 0, 0]}
        size={[
          width,
          0.22,
          depth,
        ]}
        color="#55585a"
      />

      <Box
        position={[
          0,
          0.7,
          depth / 2,
        ]}
        size={[
          width,
          1.4,
          0.08,
        ]}
        color="#242729"
      />

      {[-1, 0, 1].map((x) => (
        <Box
          key={x}
          position={[
            x * (width / 2),
            0.7,
            depth / 2,
          ]}
          size={[
            0.06,
            1.4,
            0.1,
          ]}
          color="#242729"
        />
      ))}
    </group>
  );
}

/* =========================================================
   GARAGE
========================================================= */

function Garage({
  position,
  width = 6,
}) {
  return (
    <group position={position}>
      <Box
        position={[0, 1.5, 0]}
        size={[
          width,
          3,
          0.2,
        ]}
        color="#25282a"
      />

      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          position={[
            -width / 2 +
              0.7 +
              i * 1.5,
            1.5,
            -0.12,
          ]}
          size={[
            0.06,
            2.8,
            0.08,
          ]}
          color="#64676a"
        />
      ))}
    </group>
  );
}

/* =========================================================
   POOL
========================================================= */

function Pool({
  position,
  width = 6,
  length = 10,
}) {
  return (
    <group position={position}>
      <Box
        position={[0, 0.08, 0]}
        size={[
          width + 0.8,
          0.12,
          length + 0.8,
        ]}
        color="#ded8cc"
      />

      <Box
        position={[0, 0.15, 0]}
        size={[
          width,
          0.16,
          length,
        ]}
        color="#3297bd"
        roughness={0.08}
        metalness={0.05}
      />

      <Box
        position={[
          0,
          0.25,
          -length / 2 + 0.6,
        ]}
        size={[
          width - 0.5,
          0.06,
          0.08,
        ]}
        color="#b8edf8"
      />
    </group>
  );
}

/* =========================================================
   TREES
========================================================= */

function Tree({
  position,
  scale = 1,
}) {
  return (
    <group
      position={position}
      scale={scale}
    >
      <mesh
        position={[0, 1, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.16,
            0.25,
            2,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#60432f"
        />
      </mesh>

      <mesh
        position={[0, 2.3, 0]}
        castShadow
      >
        <sphereGeometry
          args={[1.25, 16, 16]}
        />

        <meshStandardMaterial
          color="#3e7049"
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   MAIN HOUSE GENERATOR
========================================================= */

function HouseModel({ design }) {
  const a = design.architecture;

  const {
    width,
    length,
    floors,
    floorHeight,
  } = a;

  const totalHeight =
    floors * floorHeight;

  const floorLevels =
    Array.from(
      { length: floors },
      (_, index) => index
    );

  const isVilla =
    a.style === "villa";

  const isFarmhouse =
    a.style === "farmhouse";

  const isMountain =
    a.style === "mountain";

  const isBlack =
    a.style === "blackline";

  const isCourtyard =
    a.style === "courtyard";

  return (
    <group>
      {/* MAIN FLOOR MASSES */}

      {floorLevels.map((floor) => {
        const setback =
          floor === 0
            ? 0
            : a.upperSetback;

        const currentWidth =
          width - setback * 2;

        const currentLength =
          length - setback * 2;

        return (
          <group
            key={floor}
            position={[
              0,
              floor *
                floorHeight,
              0,
            ]}
          >
            <Box
              position={[
                0,
                floorHeight / 2,
                0,
              ]}
              size={[
                currentWidth,
                floorHeight,
                currentLength,
              ]}
              color={
                isBlack
                  ? "#34373a"
                  : a.facadeColor
              }
            />

            <FloorSlab
              width={
                currentWidth
              }
              length={
                currentLength
              }
              y={0}
            />

            {/* FRONT GLAZING */}

            <WindowUnit
              position={[
                -currentWidth /
                  3,
                floorHeight * 0.56,
                currentLength /
                  2 +
                  0.12,
              ]}
              width={
                isVilla
                  ? 4.2
                  : 2.8
              }
              height={
                isVilla
                  ? 2.3
                  : 1.9
              }
              style={
                a.windowStyle
              }
              color={
                a.windowColor
              }
            />

            <WindowUnit
              position={[
                currentWidth /
                  3,
                floorHeight * 0.56,
                currentLength /
                  2 +
                  0.12,
              ]}
              width={
                isVilla
                  ? 4.2
                  : 2.8
              }
              height={
                isVilla
                  ? 2.3
                  : 1.9
              }
              style={
                a.windowStyle
              }
              color={
                a.windowColor
              }
            />

            {/* SIDE WINDOWS */}

            <WindowUnit
              position={[
                currentWidth /
                  2 +
                  0.12,
                floorHeight * 0.56,
                0,
              ]}
              rotation={[
                0,
                Math.PI / 2,
                0,
              ]}
              width={2.4}
              height={1.8}
              style={
                a.windowStyle
              }
              color={
                a.windowColor
              }
            />

            {/* BACK WINDOW */}

            <WindowUnit
              position={[
                0,
                floorHeight * 0.56,
                -currentLength /
                  2 -
                  0.12,
              ]}
              rotation={[
                0,
                Math.PI,
                0,
              ]}
              width={4}
              height={2}
              style={
                a.windowStyle
              }
              color={
                a.windowColor
              }
            />
          </group>
        );
      })}

      {/* ENTRY FEATURE */}

      <DoorUnit
        position={[
          0,
          0,
          length / 2 + 0.18,
        ]}
        style={
          a.doorStyle
        }
        color={
          a.doorColor
        }
      />

      {/* LARGE ENTRY CANOPY */}

      {design.features.porch && (
        <group
          position={[
            0,
            2.95,
            length / 2 + 1.3,
          ]}
        >
          <Box
            position={[
              0,
              0,
              0,
            ]}
            size={[
              6.5,
              0.18,
              2.5,
            ]}
            color="#4d4d4a"
          />

          {[-2.7, 2.7].map(
            (x) => (
              <Box
                key={x}
                position={[
                  x,
                  -1.45,
                  0,
                ]}
                size={[
                  0.15,
                  2.9,
                  0.15,
                ]}
                color="#343638"
              />
            )
          )}
        </group>
      )}

      {/* BALCONIES */}

      {design.features.balcony >
        0 &&
        floors >= 2 && (
          <>
            <Balcony
              position={[
                -width / 3,
                floorHeight * 2,
                length / 2 + 1.1,
              ]}
              width={5}
            />

            {design.features.balcony >
              1 && (
              <Balcony
                position={[
                  width / 3,
                  floorHeight * 2,
                  length / 2 + 1.1,
                ]}
                width={5}
              />
            )}
          </>
        )}

      {/* TERRACE */}

      {design.features.terrace && (
        <Box
          position={[
            0,
            0.16,
            -length / 2 - 2,
          ]}
          size={[
            width * 0.72,
            0.3,
            3.8,
          ]}
          color="#a89a83"
        />
      )}

      {/* GARAGES */}

      {design.features.garages >
        0 && (
        <group
          position={[
            width / 2 + 3.2,
            0,
            length / 4,
          ]}
        >
          {Array.from({
            length:
              design.features
                .garages,
          }).map((_, i) => (
            <Garage
              key={i}
              position={[
                i * 6.4,
                0,
                0,
              ]}
            />
          ))}
        </group>
      )}

      {/* POOL */}

      {design.features.pool && (
        <Pool
          position={[
            width / 2 + 6,
            0,
            -length / 4,
          ]}
          width={6}
          length={11}
        />
      )}

      {/* SPECIAL ARCHITECTURAL WING */}

      {a.secondWing && (
        <group
          position={[
            -width / 2 - 2.8,
            0,
            1.5,
          ]}
        >
          <Box
            position={[
              0,
              floorHeight / 2,
              0,
            ]}
            size={[
              5.5,
              floorHeight,
              length * 0.58,
            ]}
            color={
              isBlack
                ? "#292b2d"
                : a.facadeColor
            }
          />

          <WindowUnit
            position={[
              -2.8,
              1.7,
              0,
            ]}
            rotation={[
              0,
              Math.PI / 2,
              0,
            ]}
            width={2.4}
            height={2}
            style={
              a.windowStyle
            }
            color={
              a.windowColor
            }
          />
        </group>
      )}

      {/* REAR WING */}

      {a.rearWing && (
        <group
          position={[
            0,
            0,
            -length / 2 - 3,
          ]}
        >
          <Box
            position={[
              0,
              floorHeight / 2,
              0,
            ]}
            size={[
              width * 0.65,
              floorHeight,
              6,
            ]}
            color={
              a.facadeColor
            }
          />

          <WindowUnit
            position={[
              0,
              1.6,
              3.05,
            ]}
            width={4}
            height={2}
            style={
              a.windowStyle
            }
            color={
              a.windowColor
            }
          />
        </group>
      )}

      {/* FARMHOUSE PORCH */}

      {isFarmhouse && (
        <Box
          position={[
            0,
            0.3,
            length / 2 + 2,
          ]}
          size={[
            width * 0.82,
            0.35,
            3,
          ]}
          color="#8e7960"
        />
      )}

      {/* MOUNTAIN BALCONY */}

      {isMountain &&
        floors >= 2 && (
          <Balcony
            position={[
              0,
              floorHeight * 2,
              length / 2 + 1.4,
            ]}
            width={width * 0.6}
            depth={2.8}
          />
        )}

      {/* COURTYARD */}

      {isCourtyard && (
        <group
          position={[
            0,
            0.2,
            0,
          ]}
        >
          <Box
            position={[
              0,
              0,
              0,
            ]}
            size={[
              width * 0.35,
              0.12,
              length * 0.3,
            ]}
            color="#82946f"
          />
        </group>
      )}

      {/* ROOF */}

      <Roof
        design={design}
        y={totalHeight}
      />

      {/* GARDEN */}

      {design.features.garden && (
        <>
          <Tree
            position={[
              -width / 2 - 3,
              0,
              -length / 2,
            ]}
            scale={1.1}
          />

          <Tree
            position={[
              width / 2 + 2,
              0,
              -length / 2 - 3,
            ]}
            scale={0.8}
          />

          <Tree
            position={[
              -width / 2 - 3,
              0,
              length / 2 + 3,
            ]}
            scale={0.9}
          />

          <Tree
            position={[
              width / 2 + 4,
              0,
              length / 2 + 2,
            ]}
            scale={1.15}
          />
        </>
      )}
    </group>
  );
}

/* =========================================================
   3D SCENE
========================================================= */

function HouseScene({
  design,
  night,
}) {
  return (
    <Canvas
      shadows
      camera={{
        position: [
          30,
          20,
          30,
        ],
        fov: 38,
      }}
      dpr={[1, 2]}
    >
      <color
        attach="background"
        args={[
          night
            ? "#0b1118"
            : "#dce5e8",
        ]}
      />

      <ambientLight
        intensity={
          night ? 0.45 : 1.1
        }
      />

      <directionalLight
        position={[
          20,
          30,
          15,
        ]}
        intensity={
          night ? 1.2 : 3.2
        }
        castShadow
        shadow-mapSize-width={
          2048
        }
        shadow-mapSize-height={
          2048
        }
      />

      <directionalLight
        position={[
          -15,
          10,
          -10,
        ]}
        intensity={
          night ? 0.3 : 0.5
        }
      />

      <HouseModel
        design={design}
      />

      <ContactShadows
        position={[
          0,
          -0.02,
          0,
        ]}
        opacity={0.38}
        scale={90}
        blur={2.5}
      />

      <gridHelper
        args={[
          120,
          120,
          "#b7bec0",
          "#d0d5d5",
        ]}
        position={[
          0,
          -0.03,
          0,
        ]}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={8}
        maxDistance={90}
        maxPolarAngle={
          Math.PI / 2.05
        }
      />
    </Canvas>
  );
}

/* =========================================================
   FLOOR PLAN
========================================================= */

function FloorPlan({
  design,
  selectedFloor,
  setSelectedFloor,
}) {
  const rooms =
    design.rooms.filter(
      (r) =>
        r.floor ===
        selectedFloor
    );

  return (
    <div className="floor-plan">
      <div className="floor-tabs">
        {Array.from(
          {
            length:
              design.architecture
                .floors,
          },
          (_, i) => (
            <button
              key={i}
              className={
                selectedFloor === i
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedFloor(i)
              }
            >
              {i === 0
                ? "Ground"
                : `Floor ${i + 1}`}
            </button>
          )
        )}
      </div>

      <div
        className="plan-canvas"
        style={{
          aspectRatio:
            design.architecture
              .width /
            design.architecture
              .length,
        }}
      >
        {rooms.map(
          (room, index) => (
            <div
              key={room.id}
              className="plan-room"
              style={{
                left:
                  `${10 + (index % 3) * 30}%`,
                top:
                  `${10 + Math.floor(index / 3) * 30}%`,
                width:
                  `${Math.min(
                    27,
                    room.width *
                      4
                  )}%`,
                height:
                  `${Math.min(
                    25,
                    room.length *
                      4
                  )}%`,
                background:
                  roomColor(
                    room.type
                  ),
              }}
            >
              <strong>
                {room.name}
              </strong>

              <span>
                {room.width} ×{" "}
                {room.length}m
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function roomColor(type) {
  const room =
    ROOM_TYPES.find(
      (r) => r.id === type
    );

  return (
    room?.color ||
    "#ddd"
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [design, setDesign] =
    useState(
      clone(INITIAL_DESIGN)
    );

  const [history, setHistory] =
    useState([]);

  const [future, setFuture] =
    useState([]);

  const [page, setPage] =
    useState("explore");

  const [tool, setTool] =
    useState("architecture");

  const [view, setView] =
    useState("3d");

  const [night, setNight] =
    useState(false);

  const [
    selectedFloor,
    setSelectedFloor,
  ] = useState(0);

  const [
    savedDesigns,
    setSavedDesigns,
  ] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "bmhome-projects"
        ) || "[]"
      );
    } catch {
      return [];
    }
  });

  const price = useMemo(
    () => priceOf(design),
    [design]
  );

  function commit(next) {
    setHistory((prev) => [
      ...prev.slice(-40),
      clone(design),
    ]);

    setFuture([]);

    setDesign(clone(next));
  }

  function changeArchitecture(
    key,
    value
  ) {
    commit({
      ...design,
      architecture: {
        ...design.architecture,
        [key]: value,
      },
    });
  }

  function changeFeature(
    key,
    value
  ) {
    commit({
      ...design,
      features: {
        ...design.features,
        [key]: value,
      },
    });
  }

  function addRoom(typeId) {
    const type =
      ROOM_TYPES.find(
        (r) =>
          r.id === typeId
      );

    if (!type) return;

    commit({
      ...design,
      rooms: [
        ...design.rooms,
        {
          id: crypto.randomUUID(),
          type: type.id,
          name: type.name,
          floor: Math.min(
            selectedFloor,
            design
              .architecture
              .floors - 1
          ),
          width: type.width,
          length: type.length,
        },
      ],
    });
  }

  function removeRoom(id) {
    commit({
      ...design,
      rooms:
        design.rooms.filter(
          (room) =>
            room.id !== id
        ),
    });
  }

  function changeRoom(
    id,
    key,
    value
  ) {
    commit({
      ...design,
      rooms:
        design.rooms.map(
          (room) =>
            room.id === id
              ? {
                  ...room,
                  [key]:
                    value,
                }
              : room
        ),
    });
  }

  function setFloors(count) {
    const nextRooms =
      design.rooms.map(
        (room) => ({
          ...room,
          floor: Math.min(
            room.floor,
            count - 1
          ),
        })
      );

    commit({
      ...design,
      architecture: {
        ...design.architecture,
        floors: count,
      },
      rooms: nextRooms,
    });

    setSelectedFloor(
      Math.min(
        selectedFloor,
        count - 1
      )
    );
  }

  function undo() {
    if (!history.length)
      return;

    const previous =
      history[
        history.length - 1
      ];

    setHistory((h) =>
      h.slice(0, -1)
    );

    setFuture((f) => [
      clone(design),
      ...f,
    ]);

    setDesign(
      clone(previous)
    );
  }

  function redo() {
    if (!future.length)
      return;

    const next =
      future[0];

    setFuture((f) =>
      f.slice(1)
    );

    setHistory((h) => [
      ...h,
      clone(design),
    ]);

    setDesign(clone(next));
  }

  function reset() {
    commit(
      clone(INITIAL_DESIGN)
    );
  }

  function chooseTemplate(
    template
  ) {
    const next =
      clone(INITIAL_DESIGN);

    next.name =
      template.name;

    next.architecture.style =
      template.style;

    next.architecture.width =
      template.width;

    next.architecture.length =
      template.length;

    next.architecture.floors =
      template.floors;

    next.architecture.facadeColor =
      template.wall;

    next.architecture.roofColor =
      template.roof;

    next.architecture.roofStyle =
      template.roofStyle;

    next.features.garages =
      template.garage;

    next.features.balcony =
      template.balconies;

    next.features.pool =
      template.pool;

    next.features.terrace =
      template.terrace;

    next.features.porch =
      template.porch;

    commit(next);

    setPage("designer");
    setTool("architecture");
  }

  function startBlank() {
    const next =
      clone(INITIAL_DESIGN);

    next.name =
      "Untitled Residence";

    next.rooms = [];

    commit(next);

    setPage("designer");
  }

  function save() {
    const saved = {
      ...clone(design),
      id: crypto.randomUUID(),
      savedAt:
        new Date().toISOString(),
    };

    const next = [
      saved,
      ...savedDesigns,
    ];

    localStorage.setItem(
      "bmhome-projects",
      JSON.stringify(next)
    );

    setSavedDesigns(next);
  }

  function load(project) {
    commit(project);
    setPage("designer");
  }

  function deleteProject(id) {
    const next =
      savedDesigns.filter(
        (p) => p.id !== id
      );

    localStorage.setItem(
      "bmhome-projects",
      JSON.stringify(next)
    );

    setSavedDesigns(next);
  }

  function exportProject() {
    const blob =
      new Blob(
        [
          JSON.stringify(
            design,
            null,
            2
          ),
        ],
        {
          type:
            "application/json",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;
    a.download =
      `${design.name.replace(
        /\s+/g,
        "-"
      )}.json`;

    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div
      className={
        night
          ? "app night"
          : "app"
      }
    >
      <header className="topbar">
        <button
          className="logo"
          onClick={() =>
            setPage("explore")
          }
        >
          <span>
            <Home size={20} />
          </span>

          Build
          <b>MyHome</b>
        </button>

        <nav>
          <button
            className={
              page === "explore"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage(
                "explore"
              )
            }
          >
            Explore
          </button>

          <button
            className={
              page === "designer"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage(
                "designer"
              )
            }
          >
            Designer
          </button>

          <button
            className={
              page === "projects"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage(
                "projects"
              )
            }
          >
            My Projects
          </button>
        </nav>

        <div className="top-actions">
          <button
            className="icon-btn"
            onClick={() =>
              setNight(!night)
            }
          >
            {night ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          <button
            className="save-btn"
            onClick={save}
          >
            <Save size={16} />
            Save Project
          </button>
        </div>
      </header>

      {page ===
        "explore" && (
        <ExplorePage
          design={design}
          price={price}
          chooseTemplate={
            chooseTemplate
          }
          startBlank={
            startBlank
          }
        />
      )}

      {page ===
        "designer" && (
        <DesignerPage
          design={design}
          price={price}
          tool={tool}
          setTool={setTool}
          view={view}
          setView={setView}
          night={night}
          selectedFloor={
            selectedFloor
          }
          setSelectedFloor={
            setSelectedFloor
          }
          history={history}
          future={future}
          undo={undo}
          redo={redo}
          reset={reset}
          save={save}
          exportProject={
            exportProject
          }
          changeArchitecture={
            changeArchitecture
          }
          changeFeature={
            changeFeature
          }
          setFloors={setFloors}
          addRoom={addRoom}
          removeRoom={
            removeRoom
          }
          changeRoom={
            changeRoom
          }
        />
      )}

      {page ===
        "projects" && (
        <ProjectsPage
          projects={
            savedDesigns
          }
          load={load}
          deleteProject={
            deleteProject
          }
          setPage={setPage}
        />
      )}
    </div>
  );
}

/* =========================================================
   EXPLORE PAGE
========================================================= */

function ExplorePage({
  design,
  price,
  chooseTemplate,
  startBlank,
}) {
  return (
    <main className="explore-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            ARCHITECTURAL HOME DESIGN
          </span>

          <h1>
            Design a home
            <br />
            <em>that is actually yours.</em>
          </h1>

          <p>
            Start with an architectural
            concept, change the number
            of floors, reshape the
            building, add rooms,
            garages, balconies,
            terraces and outdoor spaces,
            then explore everything in
            interactive 3D.
          </p>

          <div className="hero-buttons">
            <button
              className="primary"
              onClick={startBlank}
            >
              <Plus size={18} />
              Start designing
            </button>

            <button
              className="secondary"
              onClick={() =>
                document
                  .getElementById(
                    "templates"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
            >
              Browse architecture
              <ChevronRight
                size={17}
              />
            </button>
          </div>

          <div className="stats">
            <div>
              <strong>4+</strong>
              <span>storeys</span>
            </div>

            <div>
              <strong>20+</strong>
              <span>room types</span>
            </div>

            <div>
              <strong>3D</strong>
              <span>live model</span>
            </div>
          </div>
        </div>

        <div className="hero-model">
          <div className="model-label">
            LIVE ARCHITECTURAL MODEL
          </div>

          <Canvas
            camera={{
              position: [
                28,
                17,
                28,
              ],
              fov: 38,
            }}
          >
            <ambientLight
              intensity={1.2}
            />

            <directionalLight
              position={[
                20,
                30,
                20,
              ]}
              intensity={3}
              castShadow
            />

            <HouseModel
              design={design}
            />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.45}
            />
          </Canvas>

          <div className="model-price">
            <span>
              Current estimate
            </span>

            <strong>
              $
              {price.toLocaleString()}
            </strong>
          </div>
        </div>
      </section>

      <section
        id="templates"
        className="templates"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              ARCHITECTURAL LIBRARY
            </span>

            <h2>
              Start with something
              <br />
              <em>beautiful.</em>
            </h2>
          </div>

          <p>
            These aren't flat images.
            Each design is a
            parametric starting point
            you can completely
            customise.
          </p>
        </div>

        <div className="template-grid">
          {HOUSE_TEMPLATES.map(
            (template) => (
              <TemplateCard
                key={template.id}
                template={
                  template
                }
                onClick={() =>
                  chooseTemplate(
                    template
                  )
                }
              />
            )
          )}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   TEMPLATE CARD
========================================================= */

function TemplateCard({
  template,
  onClick,
}) {
  const preview = {
    ...clone(INITIAL_DESIGN),

    architecture: {
      ...clone(
        INITIAL_DESIGN.architecture
      ),
      style:
        template.style,
      width:
        template.width,
      length:
        template.length,
      floors:
        template.floors,
      facadeColor:
        template.wall,
      roofColor:
        template.roof,
      roofStyle:
        template.roofStyle,
    },

    features: {
      ...clone(
        INITIAL_DESIGN.features
      ),
      garages:
        template.garage,
      balcony:
        template.balconies,
      pool:
        template.pool,
      terrace:
        template.terrace,
      porch:
        template.porch,
    },
  };

  return (
    <article className="template-card">
      <div className="template-preview">
        <Canvas
          camera={{
            position: [
              24,
              15,
              24,
            ],
            fov: 40,
          }}
        >
          <ambientLight
            intensity={1.1}
          />

          <directionalLight
            position={[
              15,
              25,
              15,
            ]}
            intensity={3}
          />

          <HouseModel
            design={preview}
          />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>

        <span>
          {template.category}
        </span>
      </div>

      <div className="template-content">
        <h3>{template.name}</h3>

        <p>
          {template.description}
        </p>

        <div className="template-footer">
          <strong>
            From $
            {template.price.toLocaleString()}
          </strong>

          <button
            onClick={onClick}
          >
            Customize
            <ChevronRight
              size={15}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DESIGNER
========================================================= */

function DesignerPage({
  design,
  price,
  tool,
  setTool,
  view,
  setView,
  night,
  selectedFloor,
  setSelectedFloor,
  history,
  future,
  undo,
  redo,
  reset,
  save,
  exportProject,
  changeArchitecture,
  changeFeature,
  setFloors,
  addRoom,
  removeRoom,
  changeRoom,
}) {
  return (
    <main className="designer">
      <div className="designer-header">
        <div>
          <span>PROJECT</span>

          <h2>
            {design.name}
          </h2>
        </div>

        <div className="history">
          <button
            disabled={
              !history.length
            }
            onClick={undo}
          >
            <Undo2 size={16} />
          </button>

          <button
            disabled={
              !future.length
            }
            onClick={redo}
          >
            <Redo2 size={16} />
          </button>

          <button
            onClick={reset}
          >
            <RotateCcw
              size={16}
            />
          </button>

          <button
            onClick={exportProject}
          >
            <Download
              size={16}
            />
            Export
          </button>

          <button
            className="save-btn"
            onClick={save}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="designer-layout">
        <aside className="tool-sidebar">
          <Tool
            icon={Building2}
            label="Architecture"
            active={
              tool ===
              "architecture"
            }
            onClick={() =>
              setTool(
                "architecture"
              )
            }
          />

          <Tool
            icon={LayoutDashboard}
            label="Rooms"
            active={
              tool === "rooms"
            }
            onClick={() =>
              setTool("rooms")
            }
          />

          <Tool
            icon={Palette}
            label="Materials"
            active={
              tool ===
              "materials"
            }
            onClick={() =>
              setTool(
                "materials"
              )
            }
          />

          <Tool
            icon={Warehouse}
            label="Exterior"
            active={
              tool ===
              "exterior"
            }
            onClick={() =>
              setTool(
                "exterior"
              )
            }
          />

          <Tool
            icon={Settings2}
            label="Features"
            active={
              tool ===
              "features"
            }
            onClick={() =>
              setTool(
                "features"
              )
            }
          />
        </aside>

        <section className="viewer-panel">
          <div className="viewer-toolbar">
            <div className="view-tabs">
              <button
                className={
                  view === "3d"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView("3d")
                }
              >
                3D View
              </button>

              <button
                className={
                  view ===
                  "floorplan"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView(
                    "floorplan"
                  )
                }
              >
                Floor Plan
              </button>
            </div>

            <button
              onClick={() =>
                document
                  .documentElement
                  .requestFullscreen?.()
              }
            >
              <Maximize
                size={17}
              />
            </button>
          </div>

          <div className="viewer">
            {view === "3d" ? (
              <HouseScene
                design={design}
                night={night}
              />
            ) : (
              <FloorPlan
                design={design}
                selectedFloor={
                  selectedFloor
                }
                setSelectedFloor={
                  setSelectedFloor
                }
              />
            )}

            <div className="viewer-info">
              <div>
                <span>
                  Footprint
                </span>

                <strong>
                  {
                    design
                      .architecture
                      .width
                  }
                  m ×{" "}
                  {
                    design
                      .architecture
                      .length
                  }
                  m
                </strong>
              </div>

              <div>
                <span>Floors</span>

                <strong>
                  {
                    design
                      .architecture
                      .floors
                  }
                </strong>
              </div>

              <div>
                <span>Rooms</span>

                <strong>
                  {
                    design.rooms
                      .length
                  }
                </strong>
              </div>

              <div className="estimate">
                <span>
                  Estimated build
                </span>

                <strong>
                  $
                  {price.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <aside className="properties">
          {tool ===
            "architecture" && (
            <ArchitecturePanel
              design={design}
              change={
                changeArchitecture
              }
              setFloors={
                setFloors
              }
            />
          )}

          {tool === "rooms" && (
            <RoomsPanel
              design={design}
              addRoom={addRoom}
              removeRoom={
                removeRoom
              }
              changeRoom={
                changeRoom
              }
              selectedFloor={
                selectedFloor
              }
              setSelectedFloor={
                setSelectedFloor
              }
            />
          )}

          {tool ===
            "materials" && (
            <MaterialsPanel
              design={design}
              change={
                changeArchitecture
              }
            />
          )}

          {tool ===
            "exterior" && (
            <ExteriorPanel
              design={design}
              change={
                changeArchitecture
              }
            />
          )}

          {tool ===
            "features" && (
            <FeaturesPanel
              design={design}
              change={
                changeFeature
              }
            />
          )}
        </aside>
      </div>
    </main>
  );
}

/* =========================================================
   TOOL BUTTON
========================================================= */

function Tool({
  icon: Icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      className={
        active
          ? "tool active"
          : "tool"
      }
      onClick={onClick}
    >
      <Icon size={19} />
      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   ARCHITECTURE PANEL
========================================================= */

function ArchitecturePanel({
  design,
  change,
  setFloors,
}) {
  const a =
    design.architecture;

  return (
    <Panel title="Architecture">
      <SectionTitle
        icon={Ruler}
        title="Building size"
      />

      <Slider
        label="Width"
        value={a.width}
        min={8}
        max={35}
        suffix="m"
        onChange={(v) =>
          change(
            "width",
            v
          )
        }
      />

      <Slider
        label="Length"
        value={a.length}
        min={10}
        max={45}
        suffix="m"
        onChange={(v) =>
          change(
            "length",
            v
          )
        }
      />

      <Slider
        label="Floor height"
        value={a.floorHeight}
        min={2.6}
        max={5}
        step={0.1}
        suffix="m"
        onChange={(v) =>
          change(
            "floorHeight",
            v
          )
        }
      />

      <SectionTitle
        icon={Building}
        title="Storeys"
      />

      <div className="segmented">
        {[1, 2, 3, 4].map(
          (n) => (
            <button
              key={n}
              className={
                a.floors === n
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFloors(n)
              }
            >
              {n}
              <small>
                {n === 1
                  ? "Ground"
                  : n === 2
                  ? "Two"
                  : n === 3
                  ? "Three"
                  : "Four"}
              </small>
            </button>
          )
        )}
      </div>

      <SectionTitle
        icon={Building2}
        title="Massing"
      />

      <Toggle
        label="Upper floor setback"
        active={
          a.upperSetback > 0
        }
        onClick={() =>
          change(
            "upperSetback",
            a.upperSetback
              ? 0
              : 2
          )
        }
      />

      <Toggle
        label="Second architectural wing"
        active={a.secondWing}
        onClick={() =>
          change(
            "secondWing",
            !a.secondWing
          )
        }
      />

      <Toggle
        label="Rear wing"
        active={a.rearWing}
        onClick={() =>
          change(
            "rearWing",
            !a.rearWing
          )
        }
      />

      <SectionTitle
        icon={Layers3}
        title="Roof"
      />

      <div className="option-grid">
        {ROOF_STYLES.map(
          (roof) => (
            <button
              key={roof.id}
              className={
                a.roofStyle ===
                roof.id
                  ? "selected"
                  : ""
              }
              onClick={() =>
                change(
                  "roofStyle",
                  roof.id
                )
              }
            >
              {roof.name}
            </button>
          )
        )}
      </div>
    </Panel>
  );
}

/* =========================================================
   MATERIAL PANEL
========================================================= */

function MaterialsPanel({
  design,
  change,
}) {
  return (
    <Panel title="Materials">
      <SectionTitle
        icon={Palette}
        title="Facade"
      />

      <div className="material-grid">
        {MATERIALS.map(
          (material) => (
            <button
              key={material.id}
              className={
                design
                  .architecture
                  .facadeMaterial ===
                material.id
                  ? "material-card active"
                  : "material-card"
              }
              onClick={() => {
                change(
                  "facadeMaterial",
                  material.id
                );

                change(
                  "facadeColor",
                  material.color
                );
              }}
            >
              <span
                style={{
                  background:
                    material.color,
                }}
              />

              {material.name}
            </button>
          )
        )}
      </div>

      <ColorField
        label="Custom facade color"
        value={
          design
            .architecture
            .facadeColor
        }
        onChange={(value) =>
          change(
            "facadeColor",
            value
          )
        }
      />

      <ColorField
        label="Roof color"
        value={
          design
            .architecture
            .roofColor
        }
        onChange={(value) =>
          change(
            "roofColor",
            value
          )
        }
      />
    </Panel>
  );
}

/* =========================================================
   EXTERIOR PANEL
========================================================= */

function ExteriorPanel({
  design,
  change,
}) {
  return (
    <Panel title="Exterior">
      <SectionTitle
        icon={Square}
        title="Windows"
      />

      <div className="option-grid">
        {WINDOW_STYLES.map(
          (window) => (
            <button
              key={window.id}
              className={
                design
                  .architecture
                  .windowStyle ===
                window.id
                  ? "selected"
                  : ""
              }
              onClick={() =>
                change(
                  "windowStyle",
                  window.id
                )
              }
            >
              {window.name}
            </button>
          )
        )}
      </div>

      <ColorField
        label="Glass tint"
        value={
          design
            .architecture
            .windowColor
        }
        onChange={(value) =>
          change(
            "windowColor",
            value
          )
        }
      />

      <SectionTitle
        icon={DoorOpen}
        title="Front door"
      />

      <div className="option-grid">
        {DOOR_STYLES.map(
          (door) => (
            <button
              key={door.id}
              className={
                design
                  .architecture
                  .doorStyle ===
                door.id
                  ? "selected"
                  : ""
              }
              onClick={() =>
                change(
                  "doorStyle",
                  door.id
                )
              }
            >
              {door.name}
            </button>
          )
        )}
      </div>

      <ColorField
        label="Door color"
        value={
          design
            .architecture
            .doorColor
        }
        onChange={(value) =>
          change(
            "doorColor",
            value
          )
        }
      />
    </Panel>
  );
}

/* =========================================================
   FEATURES PANEL
========================================================= */

function FeaturesPanel({
  design,
  change,
}) {
  return (
    <Panel title="Exterior Features">
      <NumberFeature
        icon={CarFront}
        label="Garages"
        value={
          design.features
            .garages
        }
        min={0}
        max={6}
        onChange={(value) =>
          change(
            "garages",
            value
          )
        }
      />

      <NumberFeature
        icon={Building2}
        label="Balconies"
        value={
          design.features
            .balcony
        }
        min={0}
        max={6}
        onChange={(value) =>
          change(
            "balcony",
            value
          )
        }
      />

      <Toggle
        icon={Waves}
        label="Swimming pool"
        active={
          design.features.pool
        }
        onClick={() =>
          change(
            "pool",
            !design.features.pool
          )
        }
      />

      <Toggle
        icon={Warehouse}
        label="Large porch"
        active={
          design.features.porch
        }
        onClick={() =>
          change(
            "porch",
            !design.features.porch
          )
        }
      />

      <Toggle
        icon={Square}
        label="Outdoor terrace"
        active={
          design.features
            .terrace
        }
        onClick={() =>
          change(
            "terrace",
            !design.features
              .terrace
          )
        }
      />

      <Toggle
        icon={TreePine}
        label="Landscape garden"
        active={
          design.features
            .garden
        }
        onClick={() =>
          change(
            "garden",
            !design.features
              .garden
          )
        }
      />

      <Toggle
        icon={CarFront}
        label="Driveway"
        active={
          design.features
            .driveway
        }
        onClick={() =>
          change(
            "driveway",
            !design.features
              .driveway
          )
        }
      />

      <Toggle
        icon={UtensilsCrossed}
        label="Outdoor kitchen"
        active={
          design.features
            .outdoorKitchen
        }
        onClick={() =>
          change(
            "outdoorKitchen",
            !design.features
              .outdoorKitchen
          )
        }
      />
    </Panel>
  );
}

/* =========================================================
   ROOMS PANEL
========================================================= */

function RoomsPanel({
  design,
  addRoom,
  removeRoom,
  changeRoom,
  selectedFloor,
  setSelectedFloor,
}) {
  const rooms =
    design.rooms.filter(
      (r) =>
        r.floor ===
        selectedFloor
    );

  return (
    <Panel title="Floor Planner">
      <SectionTitle
        icon={LayoutDashboard}
        title="Select floor"
      />

      <div className="segmented">
        {Array.from(
          {
            length:
              design.architecture
                .floors,
          },
          (_, i) => (
            <button
              key={i}
              className={
                selectedFloor === i
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedFloor(i)
              }
            >
              {i === 0
                ? "Ground"
                : `Floor ${i + 1}`}
            </button>
          )
        )}
      </div>

      <SectionTitle
        icon={Plus}
        title="Add rooms"
      />

      <div className="room-add-grid">
        {ROOM_TYPES.map(
          (room) => (
            <button
              key={room.id}
              onClick={() =>
                addRoom(room.id)
              }
            >
              <Plus size={13} />
              {room.name}
            </button>
          )
        )}
      </div>

      <SectionTitle
        icon={Home}
        title={`Rooms on ${
          selectedFloor === 0
            ? "ground floor"
            : `floor ${
                selectedFloor +
                1
              }`
        }`}
      />

      {rooms.length === 0 && (
        <div className="empty-room">
          No rooms on this floor.
        </div>
      )}

      {rooms.map((room) => (
        <div
          className="room-editor"
          key={room.id}
        >
          <div className="room-title">
            <strong>
              {room.name}
            </strong>

            <button
              onClick={() =>
                removeRoom(
                  room.id
                )
              }
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="room-controls">
            <label>
              Width
              <input
                type="number"
                min="2"
                max="15"
                value={
                  room.width
                }
                onChange={(e) =>
                  changeRoom(
                    room.id,
                    "width",
                    Number(
                      e.target.value
                    )
                  )
                }
              />
            </label>

            <label>
              Length
              <input
                type="number"
                min="2"
                max="15"
                value={
                  room.length
                }
                onChange={(e) =>
                  changeRoom(
                    room.id,
                    "length",
                    Number(
                      e.target.value
                    )
                  )
                }
              />
            </label>
          </div>

          <label className="room-floor">
            Move to floor

            <select
              value={
                room.floor
              }
              onChange={(e) =>
                changeRoom(
                  room.id,
                  "floor",
                  Number(
                    e.target.value
                  )
                )
              }
            >
              {Array.from(
                {
                  length:
                    design
                      .architecture
                      .floors,
                },
                (_, i) => (
                  <option
                    key={i}
                    value={i}
                  >
                    {i === 0
                      ? "Ground Floor"
                      : `Floor ${
                          i + 1
                        }`}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
      ))}
    </Panel>
  );
}

/* =========================================================
   GENERIC COMPONENTS
========================================================= */

function Panel({
  title,
  children,
}) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <span>
          CUSTOMIZE
        </span>

        <h2>{title}</h2>
      </div>

      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}) {
  return (
    <div className="section-title">
      <Icon size={17} />
      <span>{title}</span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}) {
  return (
    <label className="slider">
      <div>
        <span>{label}</span>

        <strong>
          {value}
          {suffix}
        </strong>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(
            Number(
              e.target.value
            )
          )
        }
      />
    </label>
  );
}

function Toggle({
  icon: Icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      className={
        active
          ? "toggle active"
          : "toggle"
      }
      onClick={onClick}
    >
      {Icon && (
        <Icon size={17} />
      )}

      <span>{label}</span>

      <b>
        {active
          ? "ON"
          : "OFF"}
      </b>
    </button>
  );
}

function NumberFeature({
  icon: Icon,
  label,
  value,
  min,
  max,
  onChange,
}) {
  return (
    <div className="number-feature">
      <div>
        <Icon size={17} />

        <span>{label}</span>
      </div>

      <div>
        <button
          onClick={() =>
            onChange(
              Math.max(
                min,
                value - 1
              )
            )
          }
        >
          −
        </button>

        <strong>
          {value}
        </strong>

        <button
          onClick={() =>
            onChange(
              Math.min(
                max,
                value + 1
              )
            )
          }
        >
          +
        </button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}) {
  return (
    <label className="color-field">
      <span>{label}</span>

      <input
        type="color"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
      />
    </label>
  );
}

/* =========================================================
   PROJECTS
========================================================= */

function ProjectsPage({
  projects,
  load,
  deleteProject,
  setPage,
}) {
  return (
    <main className="projects-page">
      <div className="page-title">
        <span className="eyebrow">
          PROJECT LIBRARY
        </span>

        <h1>
          My{" "}
          <em>Homes</em>
        </h1>

        <p>
          Continue working on your
          saved architectural
          concepts.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="empty-projects">
          <Home size={42} />

          <h2>
            No projects yet
          </h2>

          <p>
            Create your first
            architectural concept.
          </p>

          <button
            className="primary"
            onClick={() =>
              setPage(
                "explore"
              )
            }
          >
            Explore designs
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(
            (project) => (
              <article
                className="project-card"
                key={
                  project.id
                }
              >
                <div className="project-preview">
                  <Canvas
                    camera={{
                      position: [
                        25,
                        15,
                        25,
                      ],
                      fov: 40,
                    }}
                  >
                    <ambientLight
                      intensity={1.1}
                    />

                    <directionalLight
                      position={[
                        15,
                        25,
                        15,
                      ]}
                      intensity={3}
                    />

                    <HouseModel
                      design={
                        project
                      }
                    />

                    <OrbitControls
                      enableZoom={
                        false
                      }
                      enablePan={
                        false
                      }
                      autoRotate
                    />
                  </Canvas>
                </div>

                <div className="project-info">
                  <h3>
                    {
                      project.name
                    }
                  </h3>

                  <p>
                    {
                      project
                        .architecture
                        .floors
                    }{" "}
                    storeys ·{" "}
                    {
                      project
                        .rooms
                        .length
                    }{" "}
                    rooms
                  </p>

                  <strong>
                    $
                    {priceOf(
                      project
                    ).toLocaleString()}
                  </strong>

                  <div className="project-actions">
                    <button
                      onClick={() =>
                        load(
                          project
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        navigator
                          .clipboard
                          ?.writeText(
                            JSON.stringify(
                              project,
                              null,
                              2
                            )
                          )
                      }
                    >
                      <Copy
                        size={15}
                      />
                    </button>

                    <button
                      onClick={() =>
                        deleteProject(
                          project.id
                        )
                      }
                    >
                      <Trash2
                        size={15}
                      />
                    </button>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </main>
  );
}