import type { Point, PointCategory } from '../../types';
import { CAT } from '../../data/categories';

function starPoints(outerR: number, innerR: number, n = 5): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const angle = (Math.PI / n) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${(r * Math.cos(angle)).toFixed(2)},${(r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function shapeSvg(cat: PointCategory, color: string, size: number): string {
  const common = `fill="${color}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"`;
  if (cat === 'siege') {
    return `<polygon points="${starPoints(size * 1.35, size * 0.54)}" ${common} />`;
  }
  if (cat === 'bureau') {
    return `<rect x="${-size}" y="${-size}" width="${size * 2}" height="${size * 2}" rx="1.5" ${common} />`;
  }
  if (cat === 'envoye') {
    const d = (size * 1.3).toFixed(2);
    const w = (size * 1.1).toFixed(2);
    return `<polygon points="0,${-d} ${w},0 0,${d} ${-w},0" ${common} />`;
  }
  if (cat === 'fournisseur') {
    const h = (size * 1.25).toFixed(2);
    const w = (size * 1.1).toFixed(2);
    const b = (size * 0.82).toFixed(2);
    return `<polygon points="0,${-h} ${w},${b} ${-w},${b}" ${common} />`;
  }
  return `<circle r="${size}" ${common} />`;
}

// BOX est le demi-côté du SVG en px.
// Le SVG fait (BOX*2)×(BOX*2) = la zone clicable effective.
// Toutes les formes tiennent dans ce rayon :
//   siege  – étoile outer r = 9*1.35 = 12.15 px  < 16 ✓
//   envoye – losange h = 6*1.3  = 7.8 px          < 16 ✓
//   autres – cercle/carré r=6                       < 16 ✓
const BOX = 16;

/** Crée l'élément DOM d'un marqueur (compatible MapLibre Marker). */
export function buildMarkerElement(p: Point): HTMLElement {
  const cfg = CAT[p.cat];
  const isHQ = p.cat === 'siege';
  const size = isHQ ? 9 : 6;

  const el = document.createElement('div');
  el.className = ['mk-icon', `mk-${p.cat}`, isHQ ? 'is-hq' : ''].filter(Boolean).join(' ');

  el.innerHTML = `
    <svg class="mk-svg" viewBox="${-BOX} ${-BOX} ${BOX * 2} ${BOX * 2}"
         width="${BOX * 2}" height="${BOX * 2}" style="overflow:visible">
      ${shapeSvg(p.cat, cfg.color, size)}
    </svg>
    <span class="mk-label">${p.ville}</span>
  `;

  return el;
}

export function updateMarkerSelection(el: HTMLElement, selected: boolean): void {
  el.classList.toggle('is-selected', selected);
}
