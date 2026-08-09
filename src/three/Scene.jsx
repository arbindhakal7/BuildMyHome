import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Grid, OrbitControls, Sky, Stars } from "@react-three/drei";
import * as THREE from "three";

import House from "./House";
import { interiorPlan } from "../lib/interior";

export const CAMERA_VIEWS = {
  perspective: { label: "3/4", offset: [1, 0.62, 1.15] },
  front: { label: "Front", offset: [0, 0.32, 1.7] },
  side: { label: "Side", offset: [1.7, 0.34, 0] },
  top: { label: "Plan", offset: [0.02, 2.1, 0.02] },
  eye: { label: "Street", offset: [0.55, 0.1, 1.5] },
};

function CameraRig({ view, radius, controls, focus }) {
  const { camera } = useThree();

  useEffect(() => {
    if (focus) {
      camera.position.set(...focus.position);
      camera.lookAt(...focus.target);
      camera.fov = focus.fov;
      camera.updateProjectionMatrix();

      if (controls.current) {
        controls.current.target.set(...focus.target);
        controls.current.update();
      }

      return;
    }

    const preset = CAMERA_VIEWS[view] || CAMERA_VIEWS.perspective;
    const [x, y, z] = preset.offset;

    camera.fov = 38;

    camera.position.set(x * radius, Math.max(2.4, y * radius), z * radius);
    camera.lookAt(0, radius * 0.16, 0);
    camera.updateProjectionMatrix();

    if (controls.current) {
      controls.current.target.set(0, radius * 0.16, 0);
      controls.current.update();
    }
  }, [view, radius, camera, controls, focus]);

  return null;
}

function Sun({ night, radius }) {
  const extent = radius * 1.8;

  return (
    <directionalLight
      position={night ? [-radius, radius * 1.1, -radius * 0.6] : [radius * 0.9, radius * 1.4, radius * 0.7]}
      intensity={night ? 0.45 : 2.6}
      color={night ? "#93b4e8" : "#fff4e2"}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0006}
      shadow-camera-near={0.5}
      shadow-camera-far={radius * 8}
      shadow-camera-left={-extent}
      shadow-camera-right={extent}
      shadow-camera-top={extent}
      shadow-camera-bottom={-extent}
    />
  );
}

export default function Scene({
  design,
  night = false,
  view = "perspective",
  autoRotate = false,
  interactive = true,
  showGround = true,
  showGrid = false,
  interior = null,
  className,
}) {
  const controls = useRef();

  const radius = useMemo(() => {
    const { width, length, floors, floorHeight } = design.architecture;
    return Math.max(width, length, floors * floorHeight) * 1.25;
  }, [design.architecture]);

  const focus = useMemo(() => {
    if (!interior) return null;

    const { width, length, floorHeight, plinth, floors } = design.architecture;
    const level = Math.min(interior.floor, floors - 1);
    const base = level * floorHeight + (plinth ? 0.35 : 0);

    if (interior.mode === "walk") {
      const rooms = interiorPlan(design, level).rooms;

      const room = rooms.reduce(
        (largest, candidate) => (candidate.area > (largest?.area ?? 0) ? candidate : largest),
        null
      );

      const cx = room ? room.x + room.width / 2 - width / 2 : 0;
      const cz = room ? room.y + room.length / 2 - length / 2 : 0;
      const back = room ? Math.max(room.length / 2 - 0.6, 0.6) : length * 0.3;

      return {
        fov: 70,
        position: [cx, base + 1.6, cz + back],
        target: [cx, base + 1.4, cz - 0.5],
      };
    }

    return {
      fov: 38,
      position: [width * 0.95, base + Math.max(width, length) * 0.75, length * 0.95],
      target: [0, base, 0],
    };
  }, [interior, design]);

  return (
    <Canvas
      className={className}
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: 38, near: 0.1, far: radius * 12, position: [radius, radius * 0.7, radius] }}
    >
      <color attach="background" args={[night ? "#0a1018" : "#dfe7ea"]} />
      <fog attach="fog" args={[night ? "#0a1018" : "#dfe7ea", radius * 3, radius * 8]} />

      <Suspense fallback={null}>
        {night ? (
          <Stars radius={200} depth={60} count={2200} factor={4} fade speed={0.6} />
        ) : (
          <Sky sunPosition={[radius, radius * 1.4, radius * 0.6]} turbidity={6} rayleigh={0.7} />
        )}

        <hemisphereLight
          intensity={night ? 0.28 : 0.85}
          color={night ? "#31405c" : "#eaf3ff"}
          groundColor={night ? "#0b0f13" : "#8a8a72"}
        />

        <Sun night={night} radius={radius} />

        {night && (
          <>
            <pointLight
              position={[0, 3, design.architecture.length / 2 + 3]}
              intensity={26}
              distance={18}
              color="#ffb765"
            />
            <pointLight position={[0, 8, 0]} intensity={12} distance={40} color="#4c6ea8" />
          </>
        )}

        <House design={design} night={night} showGround={showGround} interior={interior} />

        {interior && <ambientLight intensity={night ? 0.5 : 1.1} color={night ? "#ffdcae" : "#fff6e9"} />}

        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={night ? 0.5 : 0.42}
          scale={radius * 3}
          blur={2.4}
          far={20}
          resolution={1024}
        />

        {showGrid && (
          <Grid
            args={[radius * 4, radius * 4]}
            cellSize={1}
            cellThickness={0.5}
            sectionSize={5}
            sectionThickness={1}
            cellColor={night ? "#26313d" : "#b8c0c4"}
            sectionColor={night ? "#3c4a5a" : "#8f9ba1"}
            position={[0, 0.03, 0]}
            fadeDistance={radius * 4}
            infiniteGrid
          />
        )}
      </Suspense>

      <CameraRig view={view} radius={radius} controls={controls} focus={focus} />

      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.07}
        enabled={interactive}
        enablePan={interactive}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minDistance={interior?.mode === "walk" ? 0.4 : 6}
        maxDistance={radius * 5}
        maxPolarAngle={interior ? Math.PI / 1.9 : Math.PI / 2.05}
      />
    </Canvas>
  );
}
