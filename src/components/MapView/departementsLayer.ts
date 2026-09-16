import type * as maplibregl from 'maplibre-gl';
import departements from '../../data/departements_alsace.json';
import { accentColor } from '../../data/scale';
import type { MapTheme } from '../../data/scale';

// ── Limites départementales : Bas-Rhin (67) et Haut-Rhin (68) ──
// Contours issus de france-geojson (Grégoire David, d'après IGN Admin Express).
// L'effet brillant est obtenu en empilant un halo large et flou, un halo
// intermédiaire, puis un trait net au centre, dans la teinte des cercles les plus
// attestés : claire sur fond sombre, foncée sur fond clair (contraste > 7:1).
const SOURCE_ID = 'departements-alsace';

// Affichage et masquage en fondu : on anime l'opacité plutôt que la visibilité.
const FADE: maplibregl.TransitionSpecification = { duration: 200, delay: 0 };

const OPACITY: Record<string, number> = {
  'departements-halo-large': 0.18,
  'departements-halo':       0.4,
  'departements-trait':      0.9,
};

const LAYERS: maplibregl.LineLayerSpecification[] = [
  {
    id:     'departements-halo-large',
    type:   'line',
    source: SOURCE_ID,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width':   ['interpolate', ['linear'], ['zoom'], 6, 8, 12, 18],
      'line-blur':    ['interpolate', ['linear'], ['zoom'], 6, 6, 12, 12],
    },
  },
  {
    id:     'departements-halo',
    type:   'line',
    source: SOURCE_ID,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width':   ['interpolate', ['linear'], ['zoom'], 6, 3, 12, 7],
      'line-blur':    ['interpolate', ['linear'], ['zoom'], 6, 2, 12, 4],
    },
  },
  {
    id:     'departements-trait',
    type:   'line',
    source: SOURCE_ID,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width':   ['interpolate', ['linear'], ['zoom'], 6, 0.8, 12, 1.8],
    },
  },
];

const opacity = (id: string, visible: boolean) => (visible ? OPACITY[id] : 0);

// À appeler à chaque 'style.load' : setStyle() efface sources et couches ajoutées.
export function addDepartementsLayers(map: maplibregl.Map, visible: boolean, theme: MapTheme) {
  if (map.getSource(SOURCE_ID)) return;
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: departements as maplibregl.GeoJSONSourceSpecification['data'],
  });
  const color = accentColor(theme);
  LAYERS.forEach(layer =>
    map.addLayer({
      ...layer,
      paint: {
        ...layer.paint,
        'line-color':              color,
        'line-opacity':            opacity(layer.id, visible),
        'line-opacity-transition': FADE,
      },
    }),
  );
}

export function setDepartementsVisible(map: maplibregl.Map, visible: boolean) {
  LAYERS.forEach(({ id }) => {
    if (map.getLayer(id)) map.setPaintProperty(id, 'line-opacity', opacity(id, visible));
  });
}
