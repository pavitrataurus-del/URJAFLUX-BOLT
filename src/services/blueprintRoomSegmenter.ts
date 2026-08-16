/**
 * Geometry-first room detection: enclosed spaces on raster blueprints.
 * Rooms are visual objects (polygons); text inside defines the name later.
 */

export interface RoomRegion {
  id: string;
  polygon: Array<{ x: number; y: number }>;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  centroid: { x: number; y: number };
  areaPx: number;
}

function toGrayscale(data: Uint8ClampedArray, len: number): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(len);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return gray;
}

function adaptiveThreshold(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  blockSize: number,
  C: number
): Uint8ClampedArray {
  const binary = new Uint8ClampedArray(gray.length);
  const halfBlock = Math.floor(blockSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -halfBlock; dy <= halfBlock; dy++) {
        for (let dx = -halfBlock; dx <= halfBlock; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            sum += gray[ny * width + nx];
            count++;
          }
        }
      }
      const mean = sum / count;
      const current = gray[y * width + x];
      binary[y * width + x] = current < mean - C ? 255 : 0;
    }
  }
  return binary;
}

function dilateWalls(binary: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(binary.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxV = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
          maxV = Math.max(maxV, binary[ny * width + nx]);
        }
      }
      out[y * width + x] = maxV;
    }
  }
  return out;
}

function touchesBorder(
  pixels: number[],
  width: number,
  height: number
): boolean {
  for (const idx of pixels) {
    const x = idx % width;
    const y = Math.floor(idx / width);
    if (x <= 1 || y <= 1 || x >= width - 2 || y >= height - 2) return true;
  }
  return false;
}

function componentBBox(pixels: number[], width: number): { x0: number; y0: number; x1: number; y1: number } {
  let x0 = width;
  let y0 = width;
  let x1 = 0;
  let y1 = 0;
  for (const idx of pixels) {
    const x = idx % width;
    const y = Math.floor(idx / width);
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
}

/**
 * Segment enclosed room regions from a blueprint canvas (browser only).
 */
export function segmentRoomRegionsFromCanvas(
  source: HTMLCanvasElement,
  options?: { maxDimension?: number; minAreaPx?: number }
): { regions: RoomRegion[]; sourceWidth: number; sourceHeight: number } {
  const maxDimension = options?.maxDimension ?? 900;
  const minAreaPx = options?.minAreaPx ?? 2200;

  const srcW = source.width;
  const srcH = source.height;
  const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const scaled = document.createElement("canvas");
  scaled.width = w;
  scaled.height = h;
  const sctx = scaled.getContext("2d");
  if (!sctx) return { regions: [], sourceWidth: srcW, sourceHeight: srcH };
  sctx.drawImage(source, 0, 0, w, h);

  const imageData = sctx.getImageData(0, 0, w, h);
  const gray = toGrayscale(imageData.data, w * h);
  let binary = adaptiveThreshold(gray, w, h, 15, 8);
  binary = dilateWalls(binary, w, h, 2);

  const visited = new Uint8Array(w * h);
  const regions: RoomRegion[] = [];
  let regionIndex = 0;

  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      const idx = y * w + x;
      if (binary[idx] !== 0 || visited[idx]) continue;

      const stack = [idx];
      const component: number[] = [];
      visited[idx] = 1;

      while (stack.length > 0) {
        const cur = stack.pop()!;
        component.push(cur);
        const cx = cur % w;
        const cy = Math.floor(cur / w);

        const neighbors = [
          cur - 1,
          cur + 1,
          cur - w,
          cur + w,
        ];
        for (const n of neighbors) {
          if (n < 0 || n >= w * h || visited[n]) continue;
          const nx = n % w;
          const ny = Math.floor(n / w);
          if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
          if (binary[n] !== 0) continue;
          visited[n] = 1;
          stack.push(n);
        }
      }

      if (component.length < minAreaPx) continue;
      if (touchesBorder(component, w, h)) continue;

      const bbox = componentBBox(component, w);
      const cx = (bbox.x0 + bbox.x1) / 2;
      const cy = (bbox.y0 + bbox.y1) / 2;

      const invScale = 1 / scale;
      const poly = [
        { x: bbox.x0 * invScale, y: bbox.y0 * invScale },
        { x: bbox.x1 * invScale, y: bbox.y0 * invScale },
        { x: bbox.x1 * invScale, y: bbox.y1 * invScale },
        { x: bbox.x0 * invScale, y: bbox.y1 * invScale },
      ];

      regions.push({
        id: `room_region_${regionIndex++}`,
        polygon: poly,
        bbox: {
          x0: bbox.x0 * invScale,
          y0: bbox.y0 * invScale,
          x1: bbox.x1 * invScale,
          y1: bbox.y1 * invScale,
        },
        centroid: { x: cx * invScale, y: cy * invScale },
        areaPx: component.length / (scale * scale),
      });
    }
  }

  regions.sort((a, b) => b.areaPx - a.areaPx);
  return { regions, sourceWidth: srcW, sourceHeight: srcH };
}
