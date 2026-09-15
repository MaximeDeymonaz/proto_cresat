import type * as maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';

export type Basemap = 'relief' | 'positron' | 'dark';

// ── Fond « Relief 3D » : paysage naturel sans construction humaine ──
// Altimétrie Terrarium (Mapzen/AWS, libre), teinte hypsométrique + ombrage,
// eau vectorielle Carto. Aucune route, aucun bâtiment, aucun label.
const TERRARIUM_TILES = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
export const TERRAIN_EXAGGERATION = 4;

const RELIEF_STYLE: StyleSpecification = {
  version: 8,
  sky: {
    'sky-color':          '#7d95a6',
    'horizon-color':      '#c6d0d4',
    'fog-color':          '#bfc9cd',
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
      paint: { 'background-color': '#283c38' },
    },
    {
      id:     'relief-couleurs',
      type:   'color-relief',
      source: 'dem-relief',
      paint: {
        // Palette froide et désaturée, ligne des neiges abaissée
        'color-relief-color': [
          'interpolate', ['linear'], ['elevation'],
          -50,  '#1f302e',
          150,  '#283c38',
          400,  '#334a43',
          700,  '#41564c',
          1000, '#546457',
          1400, '#6d7a6e',
          1700, '#8b9089',
          2000, '#adb2af',
          2300, '#d0d9db',
          2700, '#ecf2f5',
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
        'hillshade-shadow-color':    '#141f27',
        'hillshade-highlight-color': '#e9f2f7',
        'hillshade-accent-color':    '#1f2d33',
      },
    },
    {
      id:           'eau',
      type:         'fill',
      source:       'carto-vector',
      'source-layer': 'water',
      paint: {
        // Opaque : masque la bathymétrie du DEM (bandes de tuiles visibles sinon)
        'fill-color':   '#2c4654',
        'fill-opacity': 1,
      },
    },
    {
      id:           'rivieres',
      type:         'line',
      source:       'carto-vector',
      'source-layer': 'waterway',
      paint: {
        'line-color':   '#2c4654',
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
