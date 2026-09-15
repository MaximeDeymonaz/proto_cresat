import type * as maplibregl from 'maplibre-gl';
import { POINTS } from '../../data/points';
import { CAT } from '../../data/categories';

export const VOIRON: [number, number] = [5.59, 45.36];

const ACCENT    = CAT.bureau.color;
const ACCENT_HI = CAT.siege.color;

const ARC_DURATION = 325;  // ms par arc
const ARC_STAGGER  = 40;   // ms entre deux départs d'arc

// ── Tri des points non-siège par distance à Voiron ──
function distToVoiron(p: { lat: number; lon: number }): number {
  const dlat = p.lat - VOIRON[1];
  const dlon = (p.lon - VOIRON[0]) * Math.cos(VOIRON[1] * Math.PI / 180);
  return Math.hypot(dlat, dlon);
}

export const SORTED_NON_SIEGE = POINTS
  .filter(p => p.cat !== 'siege')
  .sort((a, b) => distToVoiron(a) - distToVoiron(b));

// Zoom auquel chaque marqueur apparaît (11 pour le plus proche → 7 pour le plus loin)
export function getAppearZoom(rank: number): number {
  const n = Math.max(SORTED_NON_SIEGE.length - 1, 1);
  return 11 - (rank / n) * 4;
}

// ── Courbe de Bézier quadratique ──
function curvedCoords(
  a: [number, number],
  b: [number, number],
  steps = 48,
): number[][] {
  const [alon, alat] = a;
  const [blon, blat] = b;
  const mlon = (alon + blon) / 2;
  const mlat = (alat + blat) / 2;
  const dlon = blon - alon;
  const dlat = blat - alat;
  const len  = Math.hypot(dlon, dlat) || 1;
  const off  = Math.min(len * 0.18, 1.4);
  const clon = mlon + (-dlat / len) * off;
  const clat = mlat + (dlon  / len) * off;
  const pts: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push([
      u * u * alon + 2 * u * t * clon + t * t * blon,
      u * u * alat + 2 * u * t * clat + t * t * blat,
    ]);
  }
  return pts;
}

export function connectionsData(selectedId: string | null) {
  const hq = POINTS.find(p => p.cat === 'siege')!;
  return {
    type: 'FeatureCollection' as const,
    features: POINTS.filter(p => p.cat !== 'siege').map(p => ({
      type: 'Feature' as const,
      properties: {
        id:       p.id,
        selected: p.id === selectedId,
        dimmed:   selectedId !== null && p.id !== selectedId,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: curvedCoords([hq.lon, hq.lat], [p.lon, p.lat]),
      },
    })),
  };
}

// Données initiales vides (lignes de longueur zéro → invisibles)
export function emptyConnectionsData() {
  const hq = POINTS.find(p => p.cat === 'siege')!;
  return {
    type: 'FeatureCollection' as const,
    features: POINTS.filter(p => p.cat !== 'siege').map(p => ({
      type: 'Feature' as const,
      properties: { id: p.id, selected: false, dimmed: false },
      geometry: {
        type: 'LineString' as const,
        coordinates: [[hq.lon, hq.lat], [hq.lon, hq.lat]],
      },
    })),
  };
}

// Crée la source + couche des arcs si absente, sinon met à jour ses données.
export function upsertConnections(
  map: maplibregl.Map,
  data: ReturnType<typeof connectionsData>,
) {
  const src = map.getSource('conns') as maplibregl.GeoJSONSource | undefined;
  if (src) {
    src.setData(data);
    return;
  }
  map.addSource('conns', { type: 'geojson', data });
  map.addLayer({
    id:     'conns',
    type:   'line',
    source: 'conns',
    paint: {
      'line-color':   ['case', ['get', 'selected'], ACCENT_HI, ACCENT],
      'line-width':   ['case', ['get', 'selected'], 2.4, 1.2],
      'line-opacity': ['case', ['get', 'selected'], 0.95, ['get', 'dimmed'], 0.1, 0.5],
    },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
  });
}

// ── Animation des arcs après le dezoom : traçage progressif, stagger ──
// Retourne une fonction d'annulation (pour le nettoyage au démontage).
export function animateArcs(
  map: maplibregl.Map,
  getSelectedId: () => string | null,
  onComplete: () => void,
): () => void {
  const hq = POINTS.find(p => p.cat === 'siege')!;
  const arcData = SORTED_NON_SIEGE.map((p, i) => ({
    point:      p,
    fullCoords: curvedCoords([hq.lon, hq.lat], [p.lon, p.lat]),
    delay:      i * ARC_STAGGER,
  }));

  const totalDuration = (arcData.length - 1) * ARC_STAGGER + ARC_DURATION;
  const startTime     = performance.now();
  let raf = 0;

  function tick(now: number) {
    const elapsed    = now - startTime;
    const selectedId = getSelectedId();
    const features = arcData.map(({ point, fullCoords, delay }) => {
      const t      = Math.max(0, Math.min(1, (elapsed - delay) / ARC_DURATION));
      const tEased = 1 - Math.pow(1 - t, 3); // ease-out cubique
      const count  = Math.max(2, Math.round(tEased * fullCoords.length));
      return {
        type: 'Feature' as const,
        properties: {
          id:       point.id,
          selected: point.id === selectedId,
          dimmed:   selectedId !== null && point.id !== selectedId,
        },
        geometry: { type: 'LineString' as const, coordinates: fullCoords.slice(0, count) },
      };
    });

    (map.getSource('conns') as maplibregl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features,
    });

    if (elapsed < totalDuration) {
      raf = requestAnimationFrame(tick);
    } else {
      onComplete();
      (map.getSource('conns') as maplibregl.GeoJSONSource)?.setData(
        connectionsData(getSelectedId()),
      );
    }
  }

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
