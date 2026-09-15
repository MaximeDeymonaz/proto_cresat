import type { Point } from '../../types';
import { radiusForCount, colorForCount } from '../../data/scale';

// BOX est le demi-côté du SVG en px : doit couvrir le plus grand cercle possible.
const BOX = 20;

/** Crée l'élément DOM d'un marqueur (compatible MapLibre Marker). */
export function buildMarkerElement(p: Point): HTMLElement {
  const r = radiusForCount(p.confreries);

  const el = document.createElement('div');
  el.className = 'mk-icon';

  el.innerHTML = `
    <svg class="mk-svg" viewBox="${-BOX} ${-BOX} ${BOX * 2} ${BOX * 2}"
         width="${BOX * 2}" height="${BOX * 2}" style="overflow:visible">
      <circle r="${r}" fill="${colorForCount(p.confreries)}" stroke="#fff" stroke-width="1.6" />
    </svg>
    <span class="mk-label">${p.ville}</span>
  `;

  return el;
}

export function updateMarkerSelection(el: HTMLElement, selected: boolean): void {
  el.classList.toggle('is-selected', selected);
}
