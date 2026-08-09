function Box({ position, size, color, roughness = 0.8, metalness = 0, rotation, opacity }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
    </mesh>
  );
}

function Cyl({ position, args, color, rotation, roughness = 0.7, metalness = 0 }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function Legs({ w, d, height, color, inset = 0.09 }) {
  return (
    <>
      {[
        [-w / 2 + inset, -d / 2 + inset],
        [w / 2 - inset, -d / 2 + inset],
        [-w / 2 + inset, d / 2 - inset],
        [w / 2 - inset, d / 2 - inset],
      ].map(([x, z]) => (
        <Box key={`${x}-${z}`} position={[x, height / 2, z]} size={[0.06, height, 0.06]} color={color} />
      ))}
    </>
  );
}

function Sofa({ w, d, palette }) {
  const seat = 0.42;

  return (
    <group>
      <Box position={[0, seat / 2, 0]} size={[w, seat, d]} color={palette.upholstery} roughness={0.95} />
      <Box position={[0, seat + 0.28, -d / 2 + 0.12]} size={[w, 0.56, 0.24]} color={palette.upholstery} roughness={0.95} />

      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[(side * (w - 0.16)) / 2, seat + 0.1, 0]}
          size={[0.16, 0.5, d]}
          color={palette.upholstery}
          roughness={0.95}
        />
      ))}

      {Array.from({ length: Math.max(2, Math.round(w / 0.9)) }, (_, index, array) => (
        <Box
          key={index}
          position={[
            -w / 2 + (w * (index + 0.5)) / (array.length || 1),
            seat + 0.34,
            -d / 2 + 0.32,
          ]}
          size={[0.36, 0.34, 0.14]}
          color={palette.textile}
          roughness={1}
        />
      ))}

      <Legs w={w} d={d} height={0.1} color={palette.wood} />
    </group>
  );
}

function Armchair({ w, d, palette }) {
  return (
    <group>
      <Box position={[0, 0.36, 0]} size={[w, 0.34, d]} color={palette.upholstery} roughness={0.95} />
      <Box position={[0, 0.68, -d / 2 + 0.1]} size={[w, 0.62, 0.18]} color={palette.upholstery} roughness={0.95} />
      <Legs w={w} d={d} height={0.2} color={palette.wood} />
    </group>
  );
}

function Table({ w, d, height, palette, top = 0.06 }) {
  return (
    <group>
      <Box position={[0, height, 0]} size={[w, top, d]} color={palette.wood} roughness={0.55} />
      <Legs w={w} d={d} height={height} color={palette.wood} />
    </group>
  );
}

function DiningSet({ w, d, palette, seats = 4 }) {
  const perSide = Math.max(1, Math.round(seats / 2));

  return (
    <group>
      <Table w={w} d={d} height={0.74} palette={palette} top={0.07} />

      {[-1, 1].map((side) =>
        Array.from({ length: perSide }, (_, index) => (
          <group
            key={`${side}-${index}`}
            position={[-w / 2 + (w * (index + 0.5)) / perSide, 0, side * (d / 2 + 0.34)]}
          >
            <Box position={[0, 0.44, 0]} size={[0.42, 0.05, 0.42]} color={palette.wood} />
            <Box position={[0, 0.68, side * 0.19]} size={[0.42, 0.44, 0.05]} color={palette.wood} />
            <Legs w={0.42} d={0.42} height={0.44} color={palette.wood} inset={0.04} />
          </group>
        ))
      )}
    </group>
  );
}

function Bed({ w, d, palette, king }) {
  return (
    <group>
      <Box position={[0, 0.2, 0]} size={[w, 0.28, d]} color={palette.wood} roughness={0.7} />
      <Box position={[0, 0.44, 0.02]} size={[w - 0.08, 0.24, d - 0.1]} color="#f2efe7" roughness={1} />
      <Box position={[0, 0.5, d / 4]} size={[w - 0.08, 0.16, d / 2]} color={palette.textile} roughness={1} />
      <Box position={[0, 0.78, -d / 2 + 0.06]} size={[w, 0.9, 0.12]} color={palette.upholstery} roughness={0.95} />

      {(king ? [-1, 1] : [0]).map((side) => (
        <Box
          key={side}
          position={[side * (w / 4), 0.6, -d / 2 + 0.34]}
          size={[king ? w / 2.4 : w * 0.55, 0.14, 0.42]}
          color="#fbfaf6"
          roughness={1}
        />
      ))}
    </group>
  );
}

function Wardrobe({ w, d, palette, height = 2.2 }) {
  const doors = Math.max(2, Math.round(w / 0.6));

  return (
    <group>
      <Box position={[0, height / 2, 0]} size={[w, height, d]} color={palette.wood} roughness={0.6} />

      {Array.from({ length: doors - 1 }, (_, index) => (
        <Box
          key={index}
          position={[-w / 2 + (w * (index + 1)) / doors, height / 2, d / 2 + 0.005]}
          size={[0.015, height - 0.1, 0.01]}
          color="#00000022"
        />
      ))}

      {Array.from({ length: doors }, (_, index) => (
        <Box
          key={`h-${index}`}
          position={[-w / 2 + (w * (index + 0.85)) / doors, height / 2, d / 2 + 0.02]}
          size={[0.02, 0.24, 0.03]}
          color={palette.metal}
          metalness={0.7}
          roughness={0.3}
        />
      ))}
    </group>
  );
}

function KitchenRun({ w, d, palette, upper }) {
  if (upper) {
    return (
      <group>
        <Box position={[0, 1.85, 0]} size={[w, 0.72, d]} color={palette.trim} roughness={0.5} />
        <Box position={[0, 1.42, 0]} size={[w, 0.12, d * 0.6]} color={palette.metal} metalness={0.5} roughness={0.4} />
      </group>
    );
  }

  const doors = Math.max(2, Math.round(w / 0.62));

  return (
    <group>
      <Box position={[0, 0.44, 0]} size={[w, 0.88, d]} color={palette.trim} roughness={0.5} />
      <Box position={[0, 0.91, 0]} size={[w + 0.04, 0.06, d + 0.04]} color="#3c3f41" roughness={0.35} metalness={0.2} />
      <Box position={[0, 1.15, -d / 2 + 0.03]} size={[w, 0.42, 0.03]} color={palette.accent} roughness={0.4} />

      {Array.from({ length: doors - 1 }, (_, index) => (
        <Box
          key={index}
          position={[-w / 2 + (w * (index + 1)) / doors, 0.44, d / 2 + 0.005]}
          size={[0.012, 0.8, 0.01]}
          color="#00000022"
        />
      ))}
    </group>
  );
}

function Island({ w, d, palette }) {
  return (
    <group>
      <Box position={[0, 0.44, 0]} size={[w, 0.88, d]} color={palette.accent} roughness={0.5} />
      <Box position={[0, 0.92, 0]} size={[w + 0.12, 0.08, d + 0.12]} color="#e9e6df" roughness={0.3} />

      {[-1, 1].map((side) => (
        <group key={side} position={[side * (w / 4), 0, d / 2 + 0.36]}>
          <Cyl position={[0, 0.33, 0]} args={[0.04, 0.05, 0.66, 10]} color={palette.metal} metalness={0.7} roughness={0.3} />
          <Cyl position={[0, 0.68, 0]} args={[0.17, 0.17, 0.06, 16]} color={palette.upholstery} />
        </group>
      ))}
    </group>
  );
}

function Bathtub({ w, d, palette }) {
  return (
    <group>
      <Box position={[0, 0.28, 0]} size={[w, 0.56, d]} color="#f4f3ef" roughness={0.25} />
      <Box position={[0, 0.5, 0]} size={[w - 0.14, 0.14, d - 0.14]} color="#dfe8ea" roughness={0.1} metalness={0.1} />
      <Cyl
        position={[-w / 2 + 0.16, 0.72, 0]}
        args={[0.025, 0.025, 0.32, 10]}
        color={palette.metal}
        metalness={0.85}
        roughness={0.2}
      />
    </group>
  );
}

function Shower({ w, d, palette }) {
  return (
    <group>
      <Box position={[0, 0.05, 0]} size={[w, 0.1, d]} color="#e4e2dc" roughness={0.4} />

      <mesh position={[0, 1.05, d / 2]} castShadow>
        <boxGeometry args={[w, 2, 0.02]} />
        <meshStandardMaterial color="#cfe0e4" transparent opacity={0.28} roughness={0.05} metalness={0.2} />
      </mesh>

      <mesh position={[w / 2, 1.05, 0]} castShadow>
        <boxGeometry args={[0.02, 2, d]} />
        <meshStandardMaterial color="#cfe0e4" transparent opacity={0.28} roughness={0.05} metalness={0.2} />
      </mesh>

      <Cyl position={[0, 2, -d / 4]} args={[0.09, 0.09, 0.04, 14]} color={palette.metal} metalness={0.8} roughness={0.2} />
    </group>
  );
}

function Toilet({ palette }) {
  return (
    <group>
      <Box position={[0, 0.2, 0.05]} size={[0.38, 0.4, 0.5]} color="#f6f5f1" roughness={0.25} />
      <Box position={[0, 0.42, 0.14]} size={[0.4, 0.06, 0.52]} color="#eceae4" roughness={0.3} />
      <Box position={[0, 0.55, -0.2]} size={[0.4, 0.7, 0.2]} color="#f6f5f1" roughness={0.25} />
      <Box position={[0.12, 0.86, -0.2]} size={[0.06, 0.02, 0.1]} color={palette.metal} metalness={0.8} roughness={0.2} />
    </group>
  );
}

function Vanity({ w, d, palette }) {
  return (
    <group>
      <Box position={[0, 0.42, 0]} size={[w, 0.72, d]} color={palette.wood} roughness={0.55} />
      <Box position={[0, 0.8, 0]} size={[w + 0.04, 0.06, d + 0.04]} color="#eae7e0" roughness={0.3} />
      <Cyl position={[0, 0.86, 0]} args={[0.17, 0.15, 0.1, 18]} color="#fbfaf7" roughness={0.2} />
      <Box position={[0, 1.55, -d / 2 + 0.03]} size={[w * 0.8, 0.9, 0.03]} color="#c9d6d8" roughness={0.08} metalness={0.4} />
    </group>
  );
}

function Bookshelf({ w, d, palette }) {
  const shelves = 5;

  return (
    <group>
      <Box position={[0, 1.1, 0]} size={[w, 2.2, d]} color={palette.wood} roughness={0.65} />

      {Array.from({ length: shelves }, (_, index) => (
        <Box
          key={index}
          position={[0, 0.28 + index * 0.44, d / 2 - 0.02]}
          size={[w * 0.86, 0.26, 0.06]}
          color={index % 2 === 0 ? palette.accent : palette.textile}
          roughness={0.9}
        />
      ))}
    </group>
  );
}

function Plant({ w }) {
  const scale = Math.max(0.6, w);

  return (
    <group scale={scale}>
      <Cyl position={[0, 0.16, 0]} args={[0.17, 0.13, 0.32, 14]} color="#a9836a" roughness={0.9} />

      {[0, 1, 2, 3].map((index) => (
        <mesh
          key={index}
          position={[Math.cos(index * 1.6) * 0.14, 0.6 + index * 0.12, Math.sin(index * 1.6) * 0.14]}
          rotation={[0.3, index, 0.2]}
          castShadow
        >
          <sphereGeometry args={[0.26, 10, 8]} />
          <meshStandardMaterial color={index % 2 ? "#4b7a4b" : "#3f6b42"} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function CinemaRow({ w, palette, seats = 3 }) {
  return (
    <group>
      {Array.from({ length: seats }, (_, index) => (
        <group key={index} position={[-w / 2 + (w * (index + 0.5)) / seats, 0, 0]}>
          <Box position={[0, 0.24, 0]} size={[w / seats - 0.1, 0.36, 0.8]} color={palette.upholstery} roughness={0.95} />
          <Box position={[0, 0.62, -0.34]} size={[w / seats - 0.1, 0.72, 0.16]} color={palette.upholstery} roughness={0.95} />
        </group>
      ))}
    </group>
  );
}

function WineRack({ w, d, palette }) {
  return (
    <group>
      <Box position={[0, 1.05, 0]} size={[w, 2.1, d]} color={palette.wood} roughness={0.8} />

      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: Math.max(2, Math.round(d / 0.4)) }, (_, col, array) => (
          <Cyl
            key={`${row}-${col}`}
            position={[w / 2 - 0.04, 0.35 + row * 0.32, -d / 2 + (d * (col + 0.5)) / array.length]}
            args={[0.05, 0.05, 0.12, 10]}
            rotation={[0, 0, Math.PI / 2]}
            color={row % 2 ? "#31402f" : "#4a2733"}
            roughness={0.35}
          />
        ))
      )}
    </group>
  );
}

function Car({ palette }) {
  return (
    <group>
      <Box position={[0, 0.5, 0]} size={[1.85, 0.62, 4.3]} color={palette.accent} roughness={0.35} metalness={0.5} />
      <Box position={[0, 0.98, -0.25]} size={[1.6, 0.52, 2.1]} color="#26292b" roughness={0.2} metalness={0.4} />

      {[
        [-0.95, 1.4],
        [0.95, 1.4],
        [-0.95, -1.4],
        [0.95, -1.4],
      ].map(([x, z]) => (
        <Cyl
          key={`${x}-${z}`}
          position={[x, 0.32, z]}
          args={[0.32, 0.32, 0.22, 16]}
          rotation={[0, 0, Math.PI / 2]}
          color="#1c1e20"
          roughness={0.9}
        />
      ))}
    </group>
  );
}

/** One furniture piece, positioned in room-local space. */
export default function Furniture({ piece, palette, ceilingHeight }) {
  const { kind, w, d, rot } = piece;

  const content = (() => {
    switch (kind) {
      case "sofa":
        return <Sofa w={w} d={d} palette={palette} />;
      case "armchair":
        return <Armchair w={w} d={d} palette={palette} />;
      case "coffee-table":
        return <Table w={w} d={d} height={0.4} palette={palette} />;
      case "tasting-table":
        return <Table w={w} d={d} height={0.9} palette={palette} />;
      case "dining-table":
        return <DiningSet w={w} d={d} palette={palette} seats={piece.seats} />;
      case "tv-unit":
        return (
          <group>
            <Box position={[0, 0.22, 0]} size={[w, 0.44, d]} color={palette.wood} roughness={0.6} />
            <Box position={[0, 1.15, 0]} size={[w * 0.86, 0.66, 0.05]} color="#141618" roughness={0.25} />
          </group>
        );
      case "bed":
        return <Bed w={w} d={d} palette={palette} king={piece.size === "king"} />;
      case "crib":
        return (
          <group>
            <Box position={[0, 0.42, 0]} size={[w, 0.16, d]} color="#f3f1eb" roughness={1} />
            <Box position={[0, 0.5, 0]} size={[w, 0.6, d]} color={palette.trim} roughness={0.6} opacity={0.55} />
          </group>
        );
      case "nightstand":
        return (
          <group>
            <Box position={[0, 0.26, 0]} size={[w, 0.52, d]} color={palette.wood} roughness={0.6} />
            <Cyl position={[0, 0.72, 0]} args={[0.11, 0.13, 0.34, 14]} color={palette.textile} roughness={0.9} />
          </group>
        );
      case "dresser":
        return <Box position={[0, 0.45, 0]} size={[w, 0.9, d]} color={palette.wood} roughness={0.6} />;
      case "wardrobe":
        return <Wardrobe w={w} d={d} palette={palette} height={Math.min(2.3, ceilingHeight - 0.4)} />;
      case "bench":
        return (
          <group>
            <Box position={[0, 0.42, 0]} size={[w, 0.12, d]} color={palette.textile} roughness={1} />
            <Legs w={w} d={d} height={0.4} color={palette.wood} />
          </group>
        );
      case "desk":
        return <Table w={w} d={d} height={0.74} palette={palette} />;
      case "office-chair":
        return (
          <group>
            <Cyl position={[0, 0.24, 0]} args={[0.04, 0.04, 0.48, 10]} color={palette.metal} metalness={0.6} />
            <Box position={[0, 0.5, 0]} size={[0.46, 0.08, 0.46]} color={palette.upholstery} roughness={0.95} />
            <Box position={[0, 0.8, -0.2]} size={[0.44, 0.52, 0.08]} color={palette.upholstery} roughness={0.95} />
          </group>
        );
      case "bookshelf":
        return <Bookshelf w={w} d={d} palette={palette} />;
      case "counter-run":
        return <KitchenRun w={w} d={d} palette={palette} />;
      case "upper-cabinets":
        return <KitchenRun w={w} d={d} palette={palette} upper />;
      case "island":
        return <Island w={w} d={d} palette={palette} />;
      case "fridge":
        return (
          <group>
            <Box position={[0, 0.9, 0]} size={[w, 1.8, d]} color="#c8ccce" roughness={0.3} metalness={0.55} />
            <Box position={[w / 2 - 0.06, 1.1, d / 2 + 0.02]} size={[0.03, 0.5, 0.03]} color={palette.metal} metalness={0.8} />
          </group>
        );
      case "sink":
        return <Box position={[0, 0.94, 0]} size={[w, 0.06, d]} color="#b9bcbd" metalness={0.7} roughness={0.25} />;
      case "washer":
        return (
          <group>
            <Box position={[0, 0.43, 0]} size={[w, 0.86, d]} color={piece.dryer ? "#dedbd4" : "#eeece7"} roughness={0.4} />
            <Cyl
              position={[0, 0.5, d / 2 - 0.01]}
              args={[0.19, 0.19, 0.04, 18]}
              rotation={[Math.PI / 2, 0, 0]}
              color="#4a5153"
              roughness={0.2}
              metalness={0.3}
            />
          </group>
        );
      case "lockers":
        return (
          <group>
            <Box position={[0, 1, 0]} size={[w, 2, d]} color={palette.trim} roughness={0.6} />
            <Box position={[0, 0.5, d / 2 + 0.02]} size={[w - 0.1, 0.05, 0.28]} color={palette.wood} />
          </group>
        );
      case "shelving":
        return <Bookshelf w={w} d={d} palette={palette} />;
      case "bathtub":
        return <Bathtub w={w} d={d} palette={palette} />;
      case "shower":
        return <Shower w={w} d={d} palette={palette} />;
      case "toilet":
        return <Toilet palette={palette} />;
      case "vanity":
        return <Vanity w={w} d={d} palette={palette} />;
      case "rug":
        return (
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[w, d]} />
            <meshStandardMaterial color={palette.textile} roughness={1} />
          </mesh>
        );
      case "plant":
        return <Plant w={w} />;
      case "floor-lamp":
        return (
          <group>
            <Cyl position={[0, 0.02, 0]} args={[0.16, 0.18, 0.04, 14]} color={palette.metal} metalness={0.6} />
            <Cyl position={[0, 0.75, 0]} args={[0.02, 0.02, 1.5, 8]} color={palette.metal} metalness={0.6} />
            <Cyl position={[0, 1.6, 0]} args={[0.19, 0.14, 0.3, 16]} color="#f6efdd" roughness={0.9} />
          </group>
        );
      case "mirror-wall":
        return <Box position={[0, 1.1, 0]} size={[w, 2, 0.05]} color="#c6d2d4" roughness={0.06} metalness={0.6} />;
      case "screen":
        return <Box position={[0, 1.4, 0]} size={[w, 1.6, 0.1]} color="#101214" roughness={0.6} />;
      case "cinema-row":
        return <CinemaRow w={w} palette={palette} seats={piece.seats} />;
      case "wine-rack":
        return <WineRack w={w} d={d} palette={palette} />;
      case "treadmill":
        return (
          <group>
            <Box position={[0, 0.18, 0]} size={[w, 0.22, d]} color="#2f3234" roughness={0.6} />
            <Box position={[0, 0.75, -d / 2 + 0.15]} size={[w, 1.1, 0.08]} color="#4a4f52" roughness={0.5} />
          </group>
        );
      case "weight-bench":
        return (
          <group>
            <Box position={[0, 0.45, 0]} size={[w, 0.14, d]} color="#2b2e30" roughness={0.8} />
            <Legs w={w} d={d} height={0.44} color={palette.metal} inset={0.06} />
          </group>
        );
      case "weight-rack":
        return (
          <group>
            <Box position={[0, 0.6, 0]} size={[w, 1.2, d]} color="#33383a" roughness={0.7} />
            {[0.35, 0.75, 1.1].map((y) => (
              <Cyl
                key={y}
                position={[0, y, 0]}
                args={[0.09, 0.09, d * 0.9, 12]}
                rotation={[Math.PI / 2, 0, 0]}
                color="#1e2123"
                metalness={0.6}
                roughness={0.4}
              />
            ))}
          </group>
        );
      case "car":
        return <Car palette={palette} />;
      default:
        return null;
    }
  })();

  if (!content) return null;

  return (
    <group position={[piece.x, 0, piece.z]} rotation={[0, rot || 0, 0]}>
      {content}
    </group>
  );
}
