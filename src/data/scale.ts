// Échelle de cercles proportionnels : taille ET niveau de gris varient selon
// le nombre de confréries estimé (légende de la carte source : 1, 3, 5, 8, 10, 27).
export const CONFRERIES_STEPS = [1, 3, 5, 8, 10, 27] as const;

const MIN_COUNT = 1;
const MAX_COUNT = 27;

const MIN_RADIUS = 5;
const MAX_RADIUS = 16;

const MIN_LIGHTNESS = 82; // % — peu de confréries → gris clair
const MAX_LIGHTNESS = 20; // % — beaucoup de confréries → gris sombre

function normalize(n: number): number {
  const t = (n - MIN_COUNT) / (MAX_COUNT - MIN_COUNT);
  return Math.min(1, Math.max(0, t));
}

/** Rayon du cercle (px) : surface ~ proportionnelle au nombre de confréries. */
export function radiusForCount(n: number): number {
  return MIN_RADIUS + Math.sqrt(normalize(n)) * (MAX_RADIUS - MIN_RADIUS);
}

/** Niveau de gris du cercle : plus sombre = plus de confréries. */
export function colorForCount(n: number): string {
  const l = Math.round(MIN_LIGHTNESS - normalize(n) * (MIN_LIGHTNESS - MAX_LIGHTNESS));
  return `hsl(0 0% ${l}%)`;
}
