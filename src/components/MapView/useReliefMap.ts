import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { POINTS, ALSACE_CENTER, FOCUS_POINT } from '../../data/points';
import { buildMarkerElement, updateMarkerSelection } from './markerIcon';
import { STYLES, TERRAIN_EXAGGERATION, filterStyleLayers } from './reliefStyle';
import type { Basemap } from './reliefStyle';

const FINAL_ZOOM      = 8;
const INTRO_ZOOM      = 11;   // Démarre zoomé sur la localité la plus attestée
const DEZOOM_DURATION = 1800; // ms
const INTRO_FALLBACK  = 12000; // garde-fou si les tuiles ne répondent pas

// MapLibre v6 cherche son worker à côté de son propre fichier, ce qui casse
// avec le pré-bundling Vite : on lui fournit l'URL du worker bundlé par Vite.
maplibregl.setWorkerUrl(maplibreWorkerUrl);

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
// animée (dezoom), marqueurs, et synchronisation avec les props React.
export function useReliefMap({
  containerRef, selectedId, basemap, pitch, onSelect, onMapReady, onFirstIdle,
}: UseReliefMapOptions) {
  const mapRef         = useRef<maplibregl.Map | null>(null);
  const markerElemsRef = useRef<Map<string, HTMLElement>>(new Map());
  const onSelectRef    = useRef(onSelect);
  const onFirstIdleRef = useRef(onFirstIdle);
  const basemapRef     = useRef(basemap);

  // Synchronise les refs avec les dernières props (hors rendu).
  useLayoutEffect(() => {
    onSelectRef.current    = onSelect;
    onFirstIdleRef.current = onFirstIdle;
    basemapRef.current     = basemap;
  });

  // ── Création de la carte (une seule fois) ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const markerElems = markerElemsRef.current;

    const map = new maplibregl.Map({
      container:          containerRef.current,
      style:              STYLES[basemap],
      center:             [FOCUS_POINT.lon, FOCUS_POINT.lat],
      zoom:               INTRO_ZOOM,
      pitch,
      maxPitch:           60,
      minZoom:            6,
      maxZoom:            13,
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

    map.on('style.load', () => {
      if (basemapRef.current === 'relief') {
        map.setTerrain({ source: 'dem-terrain', exaggeration: TERRAIN_EXAGGERATION });
      } else {
        if (map.getTerrain()) map.setTerrain(null);
        filterStyleLayers(map);
      }
    });

    // L'intro (dezoom) démarre quand les tuiles initiales sont chargées.
    let introStarted = false;
    const startIntro = () => {
      if (introStarted) return;
      introStarted = true;
      onFirstIdleRef.current?.();
      map.flyTo({ center: ALSACE_CENTER, zoom: FINAL_ZOOM, duration: DEZOOM_DURATION, essential: true });
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
      map.remove();
      mapRef.current = null;
      markerElems.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Changement de fond de carte ──
  // On ignore le style déjà appliqué : un setStyle pendant le chargement initial
  // force MapLibre à tout reconstruire et retarde l'événement 'load'.
  const appliedBasemapRef = useRef(basemap);
  useEffect(() => {
    if (appliedBasemapRef.current === basemap) return;
    appliedBasemapRef.current = basemap;
    mapRef.current?.setStyle(STYLES[basemap]);
  }, [basemap]);

  // ── Changement d'angle de vue (vue de haut / inclinée) ──
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.getPitch() !== pitch) {
      map.easeTo({ pitch, duration: 1000 });
    }
  }, [pitch]);

  // ── Mise à jour de la sélection ──
  useEffect(() => {
    markerElemsRef.current.forEach((el, id) =>
      updateMarkerSelection(el, id === selectedId),
    );
  }, [selectedId]);
}
