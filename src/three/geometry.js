import * as THREE from "three";

/** Deterministic PRNG so a given design always renders the same landscape. */
export function seededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(text) {
  let hash = 2166136261;

  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function extrude(points, depth) {
  const shape = new THREE.Shape();

  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });

  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();

  return geometry;
}

/** Gable: triangular prism whose ridge runs along the building length. */
export function gableGeometry(width, length, height, thickness = 0.28) {
  const half = width / 2;

  const geometry = extrude(
    [
      [-half, 0],
      [half, 0],
      [half, thickness],
      [0, height + thickness],
      [-half, thickness],
    ],
    length
  );

  geometry.rotateY(Math.PI / 2);

  return geometry;
}

/** Single-slope roof plane. */
export function shedGeometry(width, length, height, thickness = 0.26) {
  const half = width / 2;

  const geometry = extrude(
    [
      [-half, 0],
      [half, height],
      [half, height + thickness],
      [-half, thickness],
    ],
    length
  );

  geometry.rotateY(Math.PI / 2);

  return geometry;
}

/** Two planes falling towards a central valley. */
export function butterflyGeometry(width, length, height, thickness = 0.24) {
  const half = width / 2;

  const geometry = extrude(
    [
      [-half, height],
      [0, 0],
      [half, height],
      [half, height + thickness],
      [0, thickness],
      [-half, height + thickness],
    ],
    length
  );

  geometry.rotateY(Math.PI / 2);

  return geometry;
}

/** Mansard: steep lower slope, shallow upper slope, extruded along length. */
export function mansardGeometry(width, length, height) {
  const half = width / 2;
  const inset = Math.min(half * 0.55, 3.2);
  const lower = height * 0.7;

  const geometry = extrude(
    [
      [-half, 0],
      [half, 0],
      [half - inset * 0.35, lower],
      [half - inset, height],
      [-half + inset, height],
      [-half + inset * 0.35, lower],
    ],
    length
  );

  geometry.rotateY(Math.PI / 2);

  return geometry;
}

/**
 * Hip roof: four sloping faces meeting at a ridge that is shorter than the
 * building, built as an explicit triangle soup.
 */
export function hipGeometry(width, length, height) {
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const ridgeHalf = Math.max(0.001, halfLength - halfWidth);

  const corners = {
    frontLeft: [-halfWidth, 0, halfLength],
    frontRight: [halfWidth, 0, halfLength],
    backRight: [halfWidth, 0, -halfLength],
    backLeft: [-halfWidth, 0, -halfLength],
    ridgeFront: [0, height, ridgeHalf],
    ridgeBack: [0, height, -ridgeHalf],
  };

  const faces = [
    [corners.frontLeft, corners.frontRight, corners.ridgeFront],
    [corners.backRight, corners.backLeft, corners.ridgeBack],
    [corners.frontRight, corners.backRight, corners.ridgeBack],
    [corners.frontRight, corners.ridgeBack, corners.ridgeFront],
    [corners.backLeft, corners.frontLeft, corners.ridgeFront],
    [corners.backLeft, corners.ridgeFront, corners.ridgeBack],
  ];

  const positions = new Float32Array(faces.length * 9);

  faces.forEach((face, faceIndex) => {
    face.forEach((vertex, vertexIndex) => {
      positions.set(vertex, faceIndex * 9 + vertexIndex * 3);
    });
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Splits a wall of the given size into solid segments around a row of
 * openings, so windows and doors are actual holes rather than decals.
 */
export function wallSegments(width, height, openings) {
  if (openings.length === 0) {
    return [{ x: 0, y: height / 2, width, height }];
  }

  const sorted = [...openings].sort((a, b) => a.x - b.x);
  const top = Math.max(...sorted.map((opening) => opening.y + opening.height / 2));
  const bottom = Math.min(...sorted.map((opening) => opening.y - opening.height / 2));

  const segments = [];

  if (bottom > 0.01) {
    segments.push({ x: 0, y: bottom / 2, width, height: bottom });
  }

  if (height - top > 0.01) {
    segments.push({ x: 0, y: (height + top) / 2, width, height: height - top });
  }

  let cursor = -width / 2;

  sorted.forEach((opening) => {
    const left = opening.x - opening.width / 2;

    if (left - cursor > 0.01) {
      segments.push({
        x: (cursor + left) / 2,
        y: (bottom + top) / 2,
        width: left - cursor,
        height: top - bottom,
      });
    }

    if (opening.y - opening.height / 2 > bottom + 0.01) {
      segments.push({
        x: opening.x,
        y: (bottom + opening.y - opening.height / 2) / 2,
        width: opening.width,
        height: opening.y - opening.height / 2 - bottom,
      });
    }

    if (top - (opening.y + opening.height / 2) > 0.01) {
      segments.push({
        x: opening.x,
        y: (top + opening.y + opening.height / 2) / 2,
        width: opening.width,
        height: top - opening.y - opening.height / 2,
      });
    }

    cursor = opening.x + opening.width / 2;
  });

  if (width / 2 - cursor > 0.01) {
    segments.push({
      x: (cursor + width / 2) / 2,
      y: (bottom + top) / 2,
      width: width / 2 - cursor,
      height: top - bottom,
    });
  }

  return segments;
}

/**
 * Distributes window openings across a facade using regular structural bays.
 */
export function facadeOpenings({ span, bay = 3.6, ratio = 0.55, sill, height, skip = [] }) {
  const count = Math.max(1, Math.round(span / bay));
  const pitch = span / count;
  const width = Math.min(pitch * 0.86, Math.max(1.1, pitch * ratio * 1.5));

  return Array.from({ length: count }, (_, index) => ({
    x: -span / 2 + pitch * (index + 0.5),
    y: sill + height / 2,
    width,
    height,
    index,
  })).filter((opening) => !skip.some((zone) => Math.abs(opening.x - zone.x) < (zone.width + opening.width) / 2));
}
