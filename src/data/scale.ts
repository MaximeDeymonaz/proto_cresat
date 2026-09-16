// Échelle de cercles proportionnels : taille ET couleur varient selon
// le nombre de confréries estimé (légende de la carte source : 1, 3, 5, 8, 10, 27).
export const CONFRERIES_STEPS = [1, 3, 5, 8, 10, 27] as const;

const MIN_COUNT = 1;
const MAX_COUNT = 27;

// Écart de taille doublé (amplitude 22 px) sans grossir les petites localités.
const MIN_RADIUS = 2;
export const MAX_RADIUS = 24;

/** Luminosité du fond de carte : elle fixe le sens de la rampe de couleur. */
export type MapTheme = 'dark' | 'light';

interface Hsl { h: number; s: number; l: number }

// Dégradés HSL. La clarté est une variable ordonnée : sur fond sombre « plus clair
// = plus », sur fond clair « plus foncé = plus ». La localité la plus attestée est
// ainsi toujours la plus contrastée (contraste mini : 3,2:1 sur le relief #323232,
// 5,2:1 sur Positron).
const RAMPS: Record<MapTheme, { few: Hsl; many: Hsl }> = {
  dark:  { few: { h: 262, s: 50, l: 58 }, many: { h: 282, s: 100, l: 86 } },
  light: { few: { h: 266, s: 60, l: 60 }, many: { h: 280, s: 75,  l: 24 } },
};

// Couleur : échelle logarithmique à partir de 3 (seuil des localités géocodées),
// pour doubler l'écart entre les petites valeurs, les plus nombreuses (4, 5, 8).
const COLOR_MIN_COUNT = 3;

function normalize(n: number): number {
  const t = (n - MIN_COUNT) / (MAX_COUNT - MIN_COUNT);
  return Math.min(1, Math.max(0, t));
}

/** Rayon du cercle (px) : surface ~ proportionnelle au nombre de confréries. */
export function radiusForCount(n: number): number {
  return MIN_RADIUS + Math.sqrt(normalize(n)) * (MAX_RADIUS - MIN_RADIUS);
}

/** Couleur du cercle : du moins au plus contrasté avec le fond. */
export function colorForCount(n: number, theme: MapTheme): string {
  const { few, many } = RAMPS[theme];
  const c   = Math.min(MAX_COUNT, Math.max(COLOR_MIN_COUNT, n));
  const t   = Math.log(c / COLOR_MIN_COUNT) / Math.log(MAX_COUNT / COLOR_MIN_COUNT);
  const mix = (a: number, b: number) => Math.round(a + t * (b - a));
  return `hsl(${mix(few.h, many.h)} ${mix(few.s, many.s)}% ${mix(few.l, many.l)}%)`;
}

/** Teinte des cercles les plus attestés, reprise par les limites départementales. */
export const accentColor = (theme: MapTheme) => colorForCount(MAX_COUNT, theme);
