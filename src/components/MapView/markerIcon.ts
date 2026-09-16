import type { Point } from '../../types';
import { radiusForCount, colorForCount } from '../../data/scale';
import type { LabelAnchor } from './labelPlacement';

// Demi-côté du SVG : le rayon plus la place du liseré. Il doit rester inférieur
// à la zone de clic (--mk-hit, au moins 2r + 6px) : un SVG plus grand que le
// bouton déborde de la grille, qui le recale alors dans le coin, et le cercle
// se retrouve décalé de son propre halo. L'ombre portée, elle, déborde
// librement (overflow: visible).
const box = (r: number) => r + 2;

/** Éléments DOM d'une localité, chacun porté par un MapLibre Marker. */
export interface LocaliteMarker {
  point:     Point;
  radius:    number;
  /** Cercle et zone de clic, focusable au clavier. */
  button:    HTMLButtonElement;
  /** Conteneur de l'étiquette : Marker distinct, au-dessus de tous les cercles. */
  label:     HTMLElement;
  labelText: HTMLElement;
  anchor:    LabelAnchor | null;
  size:      { w: number; h: number };
}

/**
 * Crée les éléments d'une localité. `rank` : 0 pour la plus attestée ; il fixe
 * l'empilement (les gros cercles dessous) et l'ordre d'apparition en cascade.
 */
export function buildMarker(p: Point, rank: number): LocaliteMarker {
  const r = radiusForCount(p.confreries);
  // Rayon et rang exposés au CSS : halo, zone de clic, écart et délai de l'étiquette.
  const vars = `--mk-r:${r}px;--mk-rank:${rank};`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mk-icon';
  button.dataset.localite = p.id;
  button.setAttribute('aria-label', `${p.ville}, ${p.confreries} confréries`);
  button.setAttribute('aria-pressed', 'false');
  button.style.cssText =
    vars +
    `--mk-fill-dark:${colorForCount(p.confreries, 'dark')};` +
    `--mk-fill-light:${colorForCount(p.confreries, 'light')};` +
    `z-index:${10 + rank};`;
  const b = box(r);
  button.innerHTML = `
    <svg class="mk-svg" viewBox="${-b} ${-b} ${b * 2} ${b * 2}"
         width="${b * 2}" height="${b * 2}" aria-hidden="true">
      <circle r="${r}" />
    </svg>
  `;

  const labelText = document.createElement('span');
  labelText.className = 'mk-label';
  labelText.style.cssText = vars;
  labelText.textContent = p.ville;
  labelText.setAttribute('aria-hidden', 'true'); // le bouton porte déjà le nom

  const label = document.createElement('div');
  label.className = 'mk-label-anchor';
  label.append(labelText);

  return { point: p, radius: r, button, label, labelText, anchor: null, size: { w: 0, h: 0 } };
}

export function measureLabel(m: LocaliteMarker): void {
  m.size = { w: m.labelText.offsetWidth, h: m.labelText.offsetHeight };
}

/** Une étiquette masquée garde son dernier côté : elle s'efface sur place. */
export function setLabelAnchor(m: LocaliteMarker, anchor: LabelAnchor | null): void {
  if (m.anchor === anchor) return;
  m.anchor = anchor;
  if (anchor) m.labelText.dataset.anchor = anchor;
  m.labelText.toggleAttribute('data-hidden', !anchor);
}

export function setMarkerHover(m: LocaliteMarker, hover: boolean): void {
  m.button.classList.toggle('is-hover', hover);
}

export function setMarkerSelected(m: LocaliteMarker, selected: boolean): void {
  m.button.classList.toggle('is-selected', selected);
  m.button.setAttribute('aria-pressed', String(selected));
}
