import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { POINTS, ALSACE_CENTER, FOCUS_POINT } from '../../data/points';
import {
  buildMarker, measureLabel, setLabelAnchor, setMarkerHover, setMarkerSelected,
} from './markerIcon';
import type { LocaliteMarker } from './markerIcon';
import { placeLabels } from './labelPlacement';
import { alsaceCamera } from './camera';
import {
  STYLES, MAP_THEME, BASEMAP_BACKGROUND, TERRAIN_EXAGGERATION, filterStyleLayers,
} from './reliefStyle';
import type { Basemap } from './reliefStyle';
import { addDepartementsLayers, setDepartementsVisible } from './departementsLayer';

const INTRO_ZOOM      = 11;    // Démarre zoomé sur la localité la plus attestée
const DEZOOM_DURATION = 1500;  // ms
const INTRO_FALLBACK  = 12000; // garde-fou si les tuiles ne répondent pas
const VEIL_IN         = 150;   // ms, fondu du voile avant le changement de fond (MapView.css)
const VEIL_MAX_WAIT   = 1500;  // ms, le voile se lève même si des tuiles manquent

// MapLibre v6 cherche son worker à côté de son propre fichier, ce qui casse
// avec le pré-bundling Vite : on lui fournit l'URL du worker bundlé par Vite.
maplibregl.setWorkerUrl(maplibreWorkerUrl);

interface UseReliefMapOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  veilRef:      RefObject<HTMLDivElement | null>;
  selectedId:   string | null;
  basemap:      Basemap;
  pitch:        number;
  showDepartements: boolean;
  /** Attente (ms) entre onFirstIdle et le dézoom : le temps que le loader s'efface. */
  introDelay:   number;
  onSelect:     (id: string | null, viaKeyboard: boolean) => void;
  onMapReady?:  (map: maplibregl.Map) => void;
  onFirstIdle?: () => void;
  onRevealed?:  () => void;
}

// Gère tout le cycle de vie impératif de la carte MapLibre : création, intro
// animée (dezoom), marqueurs, et synchronisation avec les props React.
export function useReliefMap({
  containerRef, veilRef, selectedId, basemap, pitch, showDepartements, introDelay,
  onSelect, onMapReady, onFirstIdle, onRevealed,
}: UseReliefMapOptions) {
  const mapRef          = useRef<maplibregl.Map | null>(null);
  const markersRef      = useRef<LocaliteMarker[]>([]);
  const updateLabelsRef = useRef<() => void>(() => {});
  const onSelectRef     = useRef(onSelect);
  const onFirstIdleRef  = useRef(onFirstIdle);
  const onRevealedRef   = useRef(onRevealed);
  const basemapRef      = useRef(basemap);
  const pitchRef        = useRef(pitch);
  const selectedIdRef   = useRef(selectedId);
  const showDepartementsRef = useRef(showDepartements);

  // Synchronise les refs avec les dernières props (hors rendu).
  useLayoutEffect(() => {
    onSelectRef.current    = onSelect;
    onFirstIdleRef.current = onFirstIdle;
    onRevealedRef.current  = onRevealed;
    basemapRef.current     = basemap;
    pitchRef.current       = pitch;
    selectedIdRef.current  = selectedId;
    showDepartementsRef.current = showDepartements;
  });

  // ── Création de la carte (une seule fois) ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const map = new maplibregl.Map({
      container,
      style:              STYLES[basemap],
      center:             ALSACE_CENTER,
      zoom:               8,
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
    // Cadrage sur l'ensemble des localités, dans la zone laissée libre par l'interface.
    map.jumpTo(alsaceCamera(map, pitch));

    map.on('style.load', () => {
      const current = basemapRef.current;
      if (current === 'relief') {
        map.setTerrain({ source: 'dem-terrain', exaggeration: TERRAIN_EXAGGERATION });
      } else {
        if (map.getTerrain()) map.setTerrain(null);
        filterStyleLayers(map);
      }
      addDepartementsLayers(map, showDepartementsRef.current, MAP_THEME[current]);
    });

    // ── Marqueurs : cercle (bouton) et étiquette (Marker séparé, au-dessus) ──
    const ranked  = [...POINTS].sort((a, b) => b.confreries - a.confreries);
    const markers = POINTS.map(p => buildMarker(p, ranked.indexOf(p)));
    markersRef.current = markers;
    let hoveredId: string | null = null;
    let focusedId: string | null = null;

    const updateLabels = () => {
      const isForced = (id: string) =>
        id === selectedIdRef.current || id === hoveredId || id === focusedId;
      const candidates = markers.map(m => {
        const { x, y } = map.project([m.point.lon, m.point.lat]);
        return {
          x, y, r: m.radius, w: m.size.w, h: m.size.h,
          current: m.anchor, forced: isForced(m.point.id),
        };
      });
      // Priorité : sélection, survol et focus, puis les localités les plus attestées.
      const order = markers.map((_, i) => i).sort((a, b) =>
        Number(candidates[b].forced) - Number(candidates[a].forced) ||
        markers[b].point.confreries - markers[a].point.confreries,
      );
      placeLabels(candidates, order, container.clientWidth, container.clientHeight)
        .forEach((anchor, i) => setLabelAnchor(markers[i], anchor));
    };
    updateLabelsRef.current = updateLabels;

    markers.forEach(m => {
      const select = (ev: MouseEvent) => {
        ev.stopPropagation();
        // detail === 0 : clic déclenché au clavier (Entrée, Espace).
        onSelectRef.current(m.point.id, ev.detail === 0);
      };
      const hover = (on: boolean) => () => {
        if (on) hoveredId = m.point.id;
        else if (hoveredId === m.point.id) hoveredId = null;
        setMarkerHover(m, on);
        updateLabels();
      };
      for (const el of [m.button, m.labelText]) {
        el.addEventListener('click', select);
        el.addEventListener('pointerenter', hover(true));
        el.addEventListener('pointerleave', hover(false));
      }
      m.button.addEventListener('focus', () => { focusedId = m.point.id; updateLabels(); });
      m.button.addEventListener('blur', () => { focusedId = null; updateLabels(); });

      for (const element of [m.button, m.label]) {
        new maplibregl.Marker({ element, anchor: 'center' })
          .setLngLat([m.point.lon, m.point.lat])
          .addTo(map);
      }
    });

    markers.forEach(measureLabel);
    map.on('move', updateLabels);
    map.on('resize', updateLabels);
    // La largeur des étiquettes dépend de la police : on remesure une fois chargée.
    document.fonts.ready.then(() => {
      if (mapRef.current !== map) return;
      markers.forEach(measureLabel);
      updateLabels();
    });

    // ── Intro : un seul mouvement à la fois ──
    // 1. vue finale puis vue de départ chargées : tuiles en cache, le relief ne
    //    se construit pas par dalles pendant le dézoom ;
    // 2. le loader s'efface (introDelay) ; 3. la caméra dézoome ;
    // 4. les cercles apparaissent en cascade (MapView.css).
    // Mouvement réduit : ni dézoom ni cascade, la carte s'affiche déjà cadrée.
    let phase: 'final' | 'start' | 'played' = 'final';
    let revealed = false;
    let introTimer: ReturnType<typeof setTimeout> | undefined;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      container.dataset.revealed = '';
      onRevealedRef.current?.();
    };

    const play = () => {
      if (phase === 'played') return;
      const flyFromStart = phase === 'start';
      phase = 'played';
      clearTimeout(introFallback);
      onFirstIdleRef.current?.();
      if (!flyFromStart) {
        reveal();
        return;
      }
      introTimer = setTimeout(() => {
        map.once('moveend', reveal);
        map.flyTo({ ...alsaceCamera(map, pitchRef.current), duration: DEZOOM_DURATION });
      }, introDelay);
    };

    map.once('idle', () => {
      if (reducedMotion || phase !== 'final') {
        play();
        return;
      }
      phase = 'start';
      map.jumpTo({ center: [FOCUS_POINT.lon, FOCUS_POINT.lat], zoom: INTRO_ZOOM });
      map.once('idle', play);
    });
    const introFallback = setTimeout(play, INTRO_FALLBACK);

    map.on('click', () => onSelectRef.current(null, false));

    onMapReady?.(map);

    return () => {
      clearTimeout(introFallback);
      clearTimeout(introTimer);
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      delete container.dataset.revealed;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Changement de fond de carte ──
  // On ignore le style déjà appliqué : un setStyle pendant le chargement initial
  // force MapLibre à tout reconstruire et retarde l'événement 'load'.
  // Un voile de la teinte du nouveau fond masque la reconstruction du style.
  const appliedBasemapRef = useRef(basemap);
  const swapTokenRef      = useRef(0);
  useEffect(() => {
    const map  = mapRef.current;
    const veil = veilRef.current;
    if (!map || !veil || appliedBasemapRef.current === basemap) return;
    appliedBasemapRef.current = basemap;
    const token = ++swapTokenRef.current;

    veil.style.background = BASEMAP_BACKGROUND[basemap];
    veil.dataset.active = '';
    const swap = setTimeout(() => {
      map.setStyle(STYLES[basemap]);
      const lift = () => {
        if (swapTokenRef.current === token) delete veil.dataset.active;
      };
      map.once('idle', lift);
      setTimeout(lift, VEIL_MAX_WAIT);
    }, VEIL_IN);
    return () => clearTimeout(swap);
  }, [basemap, veilRef]);

  // ── Changement d'angle de vue (vue de haut / inclinée) ──
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.getPitch() !== pitch) {
      map.easeTo({ pitch, duration: 1000 });
    }
  }, [pitch]);

  // ── Affichage des limites départementales ──
  useEffect(() => {
    if (mapRef.current) setDepartementsVisible(mapRef.current, showDepartements);
  }, [showDepartements]);

  // ── Mise à jour de la sélection ──
  useEffect(() => {
    markersRef.current.forEach(m => setMarkerSelected(m, m.point.id === selectedId));
    updateLabelsRef.current();
  }, [selectedId]);
}
