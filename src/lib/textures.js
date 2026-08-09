import * as THREE from "three";

const cache = new Map();

function makeCanvas(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function toTexture(canvas, repeat) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function noise(ctx, size, amount, alpha) {
  for (let i = 0; i < amount; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 2.4 + 0.4;

    ctx.fillStyle = `rgba(0,0,0,${Math.random() * alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function brickCanvas(color) {
  const size = 512;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#efe9e2";
  ctx.fillRect(0, 0, size, size);

  const rows = 16;
  const brickHeight = size / rows;
  const brickWidth = size / 8;
  const base = new THREE.Color(color);

  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : brickWidth / 2;

    for (let column = -1; column < 9; column += 1) {
      const shade = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.08);

      ctx.fillStyle = `#${shade.getHexString()}`;
      ctx.fillRect(
        column * brickWidth + offset + 2,
        row * brickHeight + 2,
        brickWidth - 4,
        brickHeight - 4
      );
    }
  }

  noise(ctx, size, 900, 0.08);

  return canvas;
}

function sidingCanvas(color) {
  const size = 512;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(color);

  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, size, size);

  const boards = 14;
  const boardHeight = size / boards;

  for (let i = 0; i < boards; i += 1) {
    const shade = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.07);

    ctx.fillStyle = `#${shade.getHexString()}`;
    ctx.fillRect(0, i * boardHeight, size, boardHeight - 1);

    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, i * boardHeight + boardHeight - 1);
    ctx.lineTo(size, i * boardHeight + boardHeight - 1);
    ctx.stroke();

    for (let g = 0; g < 26; g += 1) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
      const y = i * boardHeight + Math.random() * boardHeight;
      ctx.beginPath();
      ctx.moveTo(Math.random() * size, y);
      ctx.lineTo(Math.random() * size, y + (Math.random() - 0.5) * 2);
      ctx.stroke();
    }
  }

  return canvas;
}

function plasterCanvas(color) {
  const size = 512;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  noise(ctx, size, 5200, 0.05);

  return canvas;
}

function stoneCanvas(color) {
  const size = 512;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(color);

  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, size, size);

  const rows = 8;
  const rowHeight = size / rows;

  for (let row = 0; row < rows; row += 1) {
    let x = -Math.random() * 60;

    while (x < size) {
      const stoneWidth = 50 + Math.random() * 90;
      const shade = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);

      ctx.fillStyle = `#${shade.getHexString()}`;
      ctx.fillRect(x + 2, row * rowHeight + 2, stoneWidth - 4, rowHeight - 4);

      x += stoneWidth;
    }
  }

  noise(ctx, size, 1600, 0.07);

  return canvas;
}

function shingleCanvas(color) {
  const size = 512;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(color);

  ctx.fillStyle = `#${base.clone().offsetHSL(0, 0, -0.05).getHexString()}`;
  ctx.fillRect(0, 0, size, size);

  const rows = 18;
  const rowHeight = size / rows;

  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : 16;

    for (let column = -1; column < 17; column += 1) {
      const shade = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.06);

      ctx.fillStyle = `#${shade.getHexString()}`;
      ctx.beginPath();
      ctx.roundRect(column * 32 + offset + 1, row * rowHeight, 30, rowHeight * 1.6, 3);
      ctx.fill();
    }
  }

  return canvas;
}

function grassCanvas() {
  const size = 512;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#6e8a58";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 9000; i += 1) {
    const light = Math.random() * 0.35;
    ctx.strokeStyle = `rgba(${40 + light * 120},${90 + light * 110},${45 + light * 90},0.6)`;
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - Math.random() * 5);
    ctx.stroke();
  }

  return canvas;
}

function pavingCanvas(color) {
  const size = 512;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(color);

  ctx.fillStyle = "#8d8b86";
  ctx.fillRect(0, 0, size, size);

  const tiles = 6;
  const tile = size / tiles;

  for (let row = 0; row < tiles; row += 1) {
    for (let column = 0; column < tiles; column += 1) {
      const shade = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.08);
      ctx.fillStyle = `#${shade.getHexString()}`;
      ctx.fillRect(column * tile + 3, row * tile + 3, tile - 6, tile - 6);
    }
  }

  noise(ctx, size, 1200, 0.06);

  return canvas;
}

function waterCanvas() {
  const size = 256;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#2f95bd");
  gradient.addColorStop(0.5, "#3fb0d2");
  gradient.addColorStop(1, "#2b86ad");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 40; i += 1) {
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(0, y);

    for (let x = 0; x <= size; x += 16) {
      ctx.lineTo(x, y + Math.sin(x / 22 + i) * 3);
    }

    ctx.stroke();
  }

  return canvas;
}

const BUILDERS = {
  brick: brickCanvas,
  siding: sidingCanvas,
  plaster: plasterCanvas,
  stone: stoneCanvas,
  shingle: shingleCanvas,
  paving: pavingCanvas,
  grass: grassCanvas,
  water: waterCanvas,
};

export function surfaceTexture(kind, color = "#ffffff", repeat = 4) {
  const key = `${kind}:${color}:${repeat}`;

  if (!cache.has(key)) {
    cache.set(key, toTexture(BUILDERS[kind](color), repeat));
  }

  return cache.get(key);
}

/** Maps a facade material id onto the procedural pattern that suits it. */
export function facadePattern(materialId) {
  if (materialId.includes("brick")) return "brick";
  if (materialId.includes("timber")) return "siding";
  if (materialId.includes("stone") || materialId === "limestone" || materialId === "sandstone") {
    return "stone";
  }
  return "plaster";
}
