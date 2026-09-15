// Génère une texture de nuages parfaitement raccordable (bruit de valeur
// toroïdal : les indices de grille bouclent, donc les bords coïncident
// exactement — ni couture, ni axe de symétrie visible).

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (t: number) => t * t * (3 - 2 * t);

interface CloudTextureOptions {
  seed:      number;
  size?:     number;                    // côté de la texture en px
  baseCells?: number;                   // fréquence de la première octave
  octaves?:  number;
  color?:    [number, number, number];
  threshold?: number;                   // niveau de bruit où le nuage apparaît
  softness?: number;                    // douceur de la transition
}

export function makeCloudTexture({
  seed,
  size      = 512,
  baseCells = 3,
  octaves   = 4,
  color     = [255, 255, 255],
  threshold = 0.52,
  softness  = 0.30,
}: CloudTextureOptions): string {
  const rand = mulberry32(seed);

  // Grilles de valeurs aléatoires par octave (indices bouclants)
  const grids: { n: number; v: Float32Array }[] = [];
  for (let o = 0; o < octaves; o++) {
    const n = baseCells << o;
    const v = new Float32Array(n * n);
    for (let i = 0; i < v.length; i++) v[i] = rand();
    grids.push({ n, v });
  }

  const canvas  = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const [r, g, b] = color;

  let ampSum = 0;
  for (let o = 0; o < octaves; o++) ampSum += 1 / (1 << o);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let value = 0;
      for (let o = 0; o < octaves; o++) {
        const { n, v } = grids[o];
        const gx = (x / size) * n;
        const gy = (y / size) * n;
        const ix = Math.floor(gx), iy = Math.floor(gy);
        const fx = smooth(gx - ix), fy = smooth(gy - iy);
        const x0 = ix % n, x1 = (ix + 1) % n;
        const y0 = iy % n, y1 = (iy + 1) % n;
        const top = v[y0 * n + x0] * (1 - fx) + v[y0 * n + x1] * fx;
        const bot = v[y1 * n + x0] * (1 - fx) + v[y1 * n + x1] * fx;
        value += (top * (1 - fy) + bot * fy) / (1 << o);
      }
      value /= ampSum;

      const alpha = Math.min(1, Math.max(0, (value - threshold) / softness));
      const idx = (y * size + x) * 4;
      img.data[idx]     = r;
      img.data[idx + 1] = g;
      img.data[idx + 2] = b;
      img.data[idx + 3] = Math.round(alpha * 255);
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}
