import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import type { Map as MaplibreMap } from 'maplibre-gl';
import { MapView } from './components/MapView/MapView';
import type { Basemap } from './components/MapView/MapView';
import { MAP_THEME } from './components/MapView/reliefStyle';
import { alsaceCamera, revealPoint } from './components/MapView/camera';
import { BasemapToggle } from './components/BasemapToggle/BasemapToggle';
import type { ViewMode } from './components/BasemapToggle/BasemapToggle';
import { TitleCard } from './components/TitleCard/TitleCard';
import { Legend } from './components/Legend/Legend';
import { TactileHint } from './components/TactileHint/TactileHint';
import { FichePanel } from './components/FichePanel/FichePanel';
import { ZoomControls } from './components/ZoomControls/ZoomControls';
import { LoadingScreen, LOADER_FADE_MS } from './components/LoadingScreen/LoadingScreen';
import { BottomBar } from './components/BottomBar/BottomBar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { POINTS } from './data/points';
import type { Point } from './types';

const TILT_PITCH    = 45;
const HINT_DURATION = 6000; // ms, sauf première sélection plus tôt

const pitchFor = (v: ViewMode) => (v === 'tilt' ? TILT_PITCH : 0);

type HintPhase = 'hidden' | 'visible' | 'leaving' | 'gone';

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelLeaving, setPanelLeaving] = useState(false);
  const [focusPanel, setFocusPanel] = useState(false);
  const [hint, setHint] = useState<HintPhase>('hidden');
  const [basemap, setBasemap] = useState<Basemap>('relief');
  const [view, setView] = useState<ViewMode>('tilt');
  const [showDepartements, setShowDepartements] = useState(true);
  const [loadPhase, setLoadPhase] = useState<'loading' | 'leaving' | 'done'>('loading');
  const mapRef = useRef<MaplibreMap | null>(null);
  const viewRef = useRef(view);
  useLayoutEffect(() => {
    viewRef.current = view;
  }, [view]);

  const selectedPoint: Point | null =
    selectedId ? POINTS.find(p => p.id === selectedId) ?? null : null;
  const panelOpen = selectedPoint !== null && !panelLeaving;
  const theme = MAP_THEME[basemap];

  const handleSelect = useCallback((id: string | null, viaKeyboard = false) => {
    if (id) {
      setPanelLeaving(false);
      setSelectedId(id);
      setFocusPanel(viaKeyboard);
      setHint(h => (h === 'visible' ? 'leaving' : h));
    } else {
      // Démontage à la fin de l'animation de sortie (handlePanelExited).
      setPanelLeaving(true);
    }
  }, []);

  const closePanel = useCallback(() => handleSelect(null), [handleSelect]);

  const handlePanelExited = useCallback(() => {
    setSelectedId(null);
    setPanelLeaving(false);
  }, []);

  // La carte se décale juste assez pour que la localité choisie ne reste pas
  // sous la fiche (constance de l'objet sélectionné).
  useEffect(() => {
    if (selectedPoint && mapRef.current) {
      revealPoint(mapRef.current, [selectedPoint.lon, selectedPoint.lat]);
    }
  }, [selectedPoint]);

  // L'invite disparaît d'elle-même si personne ne touche la carte.
  useEffect(() => {
    if (hint !== 'visible') return;
    const timer = setTimeout(() => setHint('leaving'), HINT_DURATION);
    return () => clearTimeout(timer);
  }, [hint]);

  const handleMapReady = useCallback((map: MaplibreMap) => {
    mapRef.current = map;
  }, []);

  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (map) map.flyTo({ ...alsaceCamera(map, pitchFor(viewRef.current)), duration: 800 });
  }, []);

  const handleFirstIdle = useCallback(() => setLoadPhase('leaving'), []);
  const handleRevealed  = useCallback(() => setHint('visible'), []);

  return (
    <TooltipProvider>
      <div className="fixed inset-0 touch-manipulation overflow-hidden bg-background select-none">
        <div className="absolute inset-0">
          <MapView
            selectedId={selectedId}
            basemap={basemap}
            pitch={pitchFor(view)}
            showDepartements={showDepartements}
            introDelay={LOADER_FADE_MS}
            onSelect={handleSelect}
            onMapReady={handleMapReady}
            onFirstIdle={handleFirstIdle}
            onRevealed={handleRevealed}
          />
        </div>

        <TitleCard />
        <Legend theme={theme} showDepartements={showDepartements} />
        <BasemapToggle
          value={basemap}
          onChange={setBasemap}
          view={view}
          onViewChange={setView}
          showDepartements={showDepartements}
          onShowDepartementsChange={setShowDepartements}
          panelOpen={panelOpen}
        />

        <ZoomControls onReset={resetView} panelOpen={panelOpen} />

        {(hint === 'visible' || hint === 'leaving') && (
          <TactileHint leaving={hint === 'leaving'} onExited={() => setHint('gone')} />
        )}

        {selectedPoint && (
          <FichePanel
            point={selectedPoint}
            theme={theme}
            leaving={panelLeaving}
            autoFocus={focusPanel}
            onClose={closePanel}
            onExited={handlePanelExited}
          />
        )}

        <BottomBar theme={theme} />

        {loadPhase !== 'done' && (
          <LoadingScreen leaving={loadPhase === 'leaving'} onExited={() => setLoadPhase('done')} />
        )}
      </div>
    </TooltipProvider>
  );
}
