import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { POINTS } from '../../data/points';
import { buildMarkerElement, updateMarkerSelection } from './markerIcon';
import { STYLES, TERRAIN_EXAGGERATION, filterStyleLayers } from './reliefStyle';
import type { Basemap } from './reliefStyle';
import {
  VOIRON, SORTED_NON_SIEGE, getAppearZoom,
  connectionsData, emptyConnectionsData, upsertConnections, animateArcs,
} from './connections';

const FINAL_ZOOM      = 5;
const INTRO_ZOOM      = 10;   // Démarre zoomé sur Voiron
const DEZOOM_DURATION = 2100; // ms
const INTRO_FALLBACK  = 12000; // garde-fou si les tuiles ne répondent pas

// MapLibre v6 cherche son worker à côté de son propre fichier, ce qui casse
// avec le pré-bundling Vite : on lui fournit l'URL du worker bundlé par Vite.
maplibregl.setWorkerUrl(maplibreWorkerUrl);

type AnimPhase = 'dezoom' | 'arcs' | 'done';

interface UseReliefMapOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  selectedId:   string | null;
  basemap:      Basemap;
  pitch:        number;
  onSelect:     (id: string | null) => void;
  onMapReady?:  (map: maplibregl.Map) => void;
  onFirstIdle?: () => void;
}

// Gère tout le cycle de vie impératif de la carte MapLibre : création, intro
// animée (dezoom + arcs), marqueurs, et synchronisation avec les props React.
export function useReliefMap({
  containerRef, selectedId, basemap, pitch, onSelect, onMapReady, onFirstIdle,
}: UseReliefMapOptions) {
  const mapRef         = useRef<maplibregl.Map | null>(null);
  const markerElemsRef = useRef<Map<string, HTMLElement>>(new Map());
  const cancelArcsRef  = useRef<(() => void) | null>(null);
  const onSelectRef    = useRef(onSelect);
  const onFirstIdleRef = useRef(onFirstIdle);
  const basemapRef     = useRef(basemap);
  const selectedIdRef  = useRef(selectedId);
  const animPhaseRef   = useRef<AnimPhase>('dezoom');

  // Synchronise les refs avec les dernières props (hors rendu).
  useLayoutEffect(() => {
    onSelectRef.current    = onSelect;
    onFirstIdleRef.current = onFirstIdle;
    basemapRef.current     = basemap;
    selectedIdRef.current  = selectedId;
  });

  function ensureCustomLayers(map: maplibregl.Map) {
    upsertConnections(map, animPhaseRef.current === 'done'
      ? connectionsData(selectedIdRef.current)
      : emptyConnectionsData());
  }

  // ── Création de la carte (une seule fois) ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const markerElems = markerElemsRef.current;

    const map = new maplibregl.Map({
      container:          containerRef.current,
      style:              STYLES[basemap],
      center:             VOIRON,
      zoom:               INTRO_ZOOM,
      pitch,
      maxPitch:           60,
      minZoom:            6,
      maxZoom:            10,
      canvasContextAttributes: { antialias: true },
      attributionControl: {},
      dragRotate:         false,
      pitchWithRotate:    false,
      touchPitch:         false,
    });
    mapRef.current = map;
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__map = map;
    }

    let markersHidden = false;
    let introStarted  = false;

    map.on('style.load', () => {
      if (basemapRef.current === 'relief') {
        map.setTerrain({ source: 'dem-terrain', exaggeration: TERRAIN_EXAGGERATION });
      } else {
        if (map.getTerrain()) map.setTerrain(null);
        filterStyleLayers(map);
      }
      ensureCustomLayers(map);

      if (!markersHidden) {
        markersHidden = true;
        // Masquer tous les marqueurs non-siège au départ
        markerElemsRef.current.forEach((el, id) => {
          const p = POINTS.find(pt => pt.id === id);
          if (p?.cat !== 'siege') el.classList.add('mk-anim-hidden');
        });
      }
    });

    // L'intro (dezoom + arcs) démarre quand les tuiles initiales sont chargées.
    const startIntro = () => {
      if (introStarted) return;
      introStarted = true;
      onFirstIdleRef.current?.();

      map.flyTo({ center: VOIRON, zoom: FINAL_ZOOM, duration: DEZOOM_DURATION, essential: true });

      // Révéler les marqueurs au fur et à mesure du dezoom
      const onMove = () => {
        const z = map.getZoom();
        SORTED_NON_SIEGE.forEach((p, rank) => {
          if (z <= getAppearZoom(rank)) {
            markerElemsRef.current.get(p.id)?.classList.remove('mk-anim-hidden');
          }
        });
      };
      map.on('move', onMove);

      map.once('moveend', () => {
        map.off('move', onMove);
        markerElemsRef.current.forEach(el => el.classList.remove('mk-anim-hidden'));
        animPhaseRef.current = 'arcs';
        cancelArcsRef.current = animateArcs(
          map,
          () => selectedIdRef.current,
          () => { animPhaseRef.current = 'done'; },
        );
      });
    };

    map.once('load', startIntro);
    const introFallback = setTimeout(startIntro, INTRO_FALLBACK);

    map.on('click', () => onSelectRef.current(null));

    POINTS.forEach(p => {
      const el = buildMarkerElement(p);
      el.addEventListener('click', ev => {
        ev.stopPropagation();
        onSelectRef.current(p.id);
      });
      markerElemsRef.current.set(p.id, el);
      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([p.lon, p.lat])
        .addTo(map);
    });

    onMapReady?.(map);

    return () => {
      clearTimeout(introFallback);
      cancelArcsRef.current?.();
      map.remove();
      mapRef.current = null;
      markerElems.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Changement de fond de carte ──
  useEffect(() => {
    mapRef.current?.setStyle(STYLES[basemap]);
  }, [basemap]);

  // ── Changement d'angle de vue (vue de haut / inclinée) ──
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.getPitch() !== pitch) {
      map.easeTo({ pitch, duration: 1000 });
    }
  }, [pitch]);

  // ── Mise à jour de la sélection (uniquement après animation) ──
  useEffect(() => {
    const map = mapRef.current;
    if (animPhaseRef.current === 'done') {
      (map?.getSource('conns') as maplibregl.GeoJSONSource | undefined)
        ?.setData(connectionsData(selectedId));
    }
    markerElemsRef.current.forEach((el, id) =>
      updateMarkerSelection(el, id === selectedId),
    );
  }, [selectedId]);
}
