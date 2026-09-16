import { LngLatBounds } from 'maplibre-gl';
import type { CameraOptions, Map as MaplibreMap } from 'maplibre-gl';
import { POINTS, ALSACE_CENTER } from '../../data/points';

/** Marges en pixels, sur les quatre côtés (PaddingOptions, mais tout est requis). */
interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Emprise du corpus : la vue s'adapte à l'écran au lieu d'un zoom fixe.
const BOUNDS = POINTS.reduce(
  (b, p) => b.extend([p.lon, p.lat]),
  new LngLatBounds([POINTS[0].lon, POINTS[0].lat], [POINTS[0].lon, POINTS[0].lat]),
);

// Marge autour des points : les étiquettes débordent surtout à l'horizontale.
const MARGIN_X = 56;
const MARGIN_Y = 40;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Zone de carte masquée par l'interface. Les overlays portent `data-map-inset` ;
 * on lit leurs dimensions de mise en page (offset*), que les animations
 * d'entrée (transform) ne faussent pas.
 */
function measureInsets(width: number, height: number): Insets {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  document.querySelectorAll<HTMLElement>('[data-map-inset]').forEach(el => {
    if (!el.offsetParent) return; // masqué à ce breakpoint
    const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = el;
    if (h >= height * 0.6) {
      // Bande verticale : fiche latérale
      if (x + w / 2 > width / 2) insets.right = Math.max(insets.right, width - x);
      else insets.left = Math.max(insets.left, x + w);
    } else if (w >= width * 0.4) {
      // Bande horizontale : titre et barre du bas (mobile), fiche en bottom sheet.
      // En dessous de ce seuil (légende, boutons), l'élément reste dans son coin :
      // réserver toute la bande écraserait le cadrage pour rien.
      if (y + h / 2 < height / 2) insets.top = Math.max(insets.top, y + h);
      else insets.bottom = Math.max(insets.bottom, height - y);
    }
  });
  return insets;
}

function framingPadding(map: MaplibreMap): Insets {
  const { clientWidth, clientHeight } = map.getContainer();
  const { top, right, bottom, left } = measureInsets(clientWidth, clientHeight);
  return {
    top:    top + MARGIN_Y,
    bottom: bottom + MARGIN_Y,
    left:   left + MARGIN_X,
    right:  right + MARGIN_X,
  };
}

/** Caméra qui cadre toutes les localités dans la zone laissée libre par l'interface. */
export function alsaceCamera(map: MaplibreMap, pitch: number): CameraOptions {
  const camera = map.cameraForBounds(BOUNDS, { padding: framingPadding(map), pitch });
  return { center: ALSACE_CENTER, zoom: 8, ...camera, pitch, bearing: 0 };
}

/** Déplace la carte au minimum pour qu'un point ne soit pas masqué par l'interface. */
export function revealPoint(map: MaplibreMap, lngLat: [number, number]): void {
  const { clientWidth, clientHeight } = map.getContainer();
  const { top, right, bottom, left } = framingPadding(map);
  const { x, y } = map.project(lngLat);
  // Zone libre plus étroite que les marges (bottom sheet sur mobile) : on centre.
  const shift = (v: number, min: number, max: number) =>
    min > max ? v - (min + max) / 2 : v < min ? v - min : v > max ? v - max : 0;
  const dx = shift(x, left, clientWidth - right);
  const dy = shift(y, top, clientHeight - bottom);
  if (dx || dy) map.panBy([dx, dy], { duration: 450, easing: easeOutCubic });
}
