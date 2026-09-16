// Placement des étiquettes sans chevauchement, à la manière des couches `symbol`
// de MapLibre : glouton par priorité. Chaque étiquette essaie d'abord son ancrage
// actuel (pas de clignotement pendant un zoom), puis les autres ; si aucun n'est
// libre, elle est masquée.

export type LabelAnchor =
  | 'right' | 'top-right' | 'bottom-right'
  | 'left'  | 'top-left'  | 'bottom-left'
  | 'top'   | 'bottom';

// Ordre de préférence cartographique (Imhof) : à droite d'abord, puis les
// diagonales, la gauche, et enfin l'aplomb du cercle.
const ANCHORS: LabelAnchor[] = [
  'right', 'top-right', 'bottom-right', 'left', 'top-left', 'bottom-left', 'top', 'bottom',
];

/** Écart entre le bord du cercle et l'étiquette (px). */
export const LABEL_GAP = 5;
const PADDING = 2;

export interface LabelCandidate {
  x: number;                     // centre du cercle à l'écran (px)
  y: number;
  r: number;                     // rayon du cercle
  w: number;                     // taille de l'étiquette
  h: number;
  current: LabelAnchor | null;
  forced: boolean;               // sélection, survol ou focus : toujours affichée
}

type Box = [minX: number, minY: number, maxX: number, maxY: number];

function labelBox({ x, y, r, w, h }: LabelCandidate, anchor: LabelAnchor): Box {
  const d = r + LABEL_GAP;
  // Diagonales : décalage réduit (0,7 ≈ √2/2), l'étiquette longe le cercle.
  const q = d * 0.7;
  switch (anchor) {
    case 'right':        return [x + d, y - h / 2, x + d + w, y + h / 2];
    case 'left':         return [x - d - w, y - h / 2, x - d, y + h / 2];
    case 'top':          return [x - w / 2, y - d - h, x + w / 2, y - d];
    case 'bottom':       return [x - w / 2, y + d, x + w / 2, y + d + h];
    case 'top-right':    return [x + q, y - q - h, x + q + w, y - q];
    case 'bottom-right': return [x + q, y + q, x + q + w, y + q + h];
    case 'top-left':     return [x - q - w, y - q - h, x - q, y - q];
    case 'bottom-left':  return [x - q - w, y + q, x - q, y + q + h];
  }
}

const overlaps = (a: Box, b: Box) =>
  a[0] < b[2] + PADDING && a[2] + PADDING > b[0] &&
  a[1] < b[3] + PADDING && a[3] + PADDING > b[1];

/**
 * Renvoie l'ancrage de chaque candidat (même ordre), ou null s'il est masqué.
 * `order` liste les indices des candidats par priorité décroissante.
 */
export function placeLabels(
  candidates: LabelCandidate[],
  order: number[],
  width: number,
  height: number,
): (LabelAnchor | null)[] {
  const circles = candidates.map<Box>(({ x, y, r }) => [x - r, y - r, x + r, y + r]);
  const placed: Box[] = [];
  const result: (LabelAnchor | null)[] = candidates.map(() => null);
  const visible = (b: Box) => b[0] >= 0 && b[1] >= 0 && b[2] <= width && b[3] <= height;

  for (const i of order) {
    const c = candidates[i];
    const tries = c.current ? [c.current, ...ANCHORS.filter(a => a !== c.current)] : ANCHORS;
    const free = (box: Box) =>
      !placed.some(p => overlaps(box, p)) &&
      !circles.some((circle, j) => j !== i && overlaps(box, circle));

    // Une étiquette qui ne tient nulle part est masquée plutôt que rognée par le
    // bord ; seule la localité sélectionnée, survolée ou focalisée passe outre.
    const anchor =
      tries.find(a => { const b = labelBox(c, a); return visible(b) && free(b); }) ??
      (c.forced ? tries.find(a => free(labelBox(c, a))) ?? tries[0] : null);

    if (anchor) {
      result[i] = anchor;
      placed.push(labelBox(c, anchor));
    }
  }
  return result;
}
