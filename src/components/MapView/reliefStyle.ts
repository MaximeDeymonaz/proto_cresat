import type * as maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import type { MapTheme } from '../../data/scale';

export type Basemap = 'relief' | 'positron' | 'dark';

/** Luminosité de chaque fond : pilote la rampe des cercles et le style des étiquettes. */
export const MAP_THEME: Record<Basemap, MapTheme> = {
  relief:   'dark',
  positron: 'light',
  dark:     'dark',
};

/** Teinte dominante de chaque fond, pour le voile du changement de fond. */
export const BASEMAP_BACKGROUND: Record<Basemap, string> = {
  relief:   '#2e2e2e',
  positron: '#f2f3f0',
  dark:     '#0e0e0e',
};

// ── Fond « Relief 3D » : paysage naturel sans construction humaine ──
// Altimétrie Terrarium (Mapzen/AWS, libre), teinte hypsométrique + ombrage,
// eau vectorielle Carto. Aucune route, aucun bâtiment, aucun label.
const TERRARIUM_TILES = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
export const TERRAIN_EXAGGERATION = 4;

const RELIEF_STYLE: StyleSpecification = {
  version: 8,
  sky: {
    'sky-color':          '#929292',
    'horizon-color':      '#cdcdcd',
    'fog-color':          '#c6c6c6',
    'sky-horizon-blend':  0.75,
    'horizon-fog-blend':  0.65,
    'fog-ground-blend':   0.7,
  },
  sources: {
    'dem-terrain': {
      type:        'raster-dem',
      tiles:       [TERRARIUM_TILES],
      encoding:    'terrarium',
      tileSize:    256,
      maxzoom:     13,
      attribution: 'Relief © <a href="https://registry.opendata.aws/terrain-tiles/">Mapzen Terrain Tiles</a>',
    },
    'dem-relief': {
      type:     'raster-dem',
      tiles:    [TERRARIUM_TILES],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom:  13,
    },
    'carto-vector': {
      type: 'vector',
      url:  'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json',
    },
  },
  layers: [
    {
      id:    'fond',
      type:  'background',
      paint: { 'background-color': '#323232' },
    },
    {
      id:     'relief-couleurs',
      type:   'color-relief',
      source: 'dem-relief',
      paint: {
        // Rampe hypsométrique en niveaux de gris, du plus sombre (creux) au blanc (sommets)
        'color-relief-color': [
          'interpolate', ['linear'], ['elevation'],
          -50,  '#282828',
          150,  '#323232',
          400,  '#3f3f3f',
          700,  '#4c4c4c',
          1000, '#5c5c5c',
          1400, '#747474',
          1700, '#8c8c8c',
          2000, '#b0b0b0',
          2300, '#d5d5d5',
          2700, '#f0f0f0',
          3300, '#ffffff',
        ],
      },
    },
    {
      id:     'relief-ombres',
      type:   'hillshade',
      source: 'dem-relief',
      paint: {
        'hillshade-exaggeration':    0.72,
        'hillshade-shadow-color':    '#1e1e1e',
        'hillshade-highlight-color': '#f0f0f0',
        'hillshade-accent-color':    '#292929',
      },
    },
    {
      id:           'eau',
      type:         'fill',
      source:       'carto-vector',
      'source-layer': 'water',
      paint: {
        // Opaque : masque la bathymétrie du DEM (bandes de tuiles visibles sinon)
        // Volontairement plus sombre que le relief pour rester lisible en niveaux de gris
        'fill-color':   '#181818',
        'fill-opacity': 1,
      },
    },
    {
      id:           'rivieres',
      type:         'line',
      source:       'carto-vector',
      'source-layer': 'waterway',
      paint: {
        'line-color':   '#181818',
        'line-opacity': 0.85,
        'line-width':   ['interpolate', ['linear'], ['zoom'], 6, 0.4, 12, 1.8],
      },
    },
  ],
};

export const STYLES: Record<Basemap, string | StyleSpecification> = {
  relief:   RELIEF_STYLE,
  positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark:     'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

// Couches conservées quand on masque un fond tiers (positron/dark) : eau seule.
const KEEP_SOURCE_LAYERS = new Set(['water', 'waterway', 'water_name', 'water_label']);

export function filterStyleLayers(map: maplibregl.Map) {
  const layers = map.getStyle()?.layers;
  if (!layers) return;
  for (const layer of layers) {
    const sl = (layer as Record<string, unknown>)['source-layer'] as string | undefined;
    const keep =
      layer.type === 'background' ||
      (sl !== undefined && KEEP_SOURCE_LAYERS.has(sl));
    map.setLayoutProperty(layer.id, 'visibility', keep ? 'visible' : 'none');
  }
}
