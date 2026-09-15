import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import type { Map as MaplibreMap } from 'maplibre-gl';
import { MapView } from './components/MapView/MapView';
import type { Basemap } from './components/MapView/MapView';
import { BasemapToggle } from './components/BasemapToggle/BasemapToggle';
import type { ViewMode } from './components/BasemapToggle/BasemapToggle';
import { TitleCard } from './components/TitleCard/TitleCard';
import { Legend } from './components/Legend/Legend';
import { TactileHint } from './components/TactileHint/TactileHint';
import { FichePanel } from './components/FichePanel/FichePanel';
import { ZoomControls } from './components/ZoomControls/ZoomControls';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';
import { BottomBar } from './components/BottomBar/BottomBar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { POINTS } from './data/points';
import type { Point } from './types';

const VOIRON: [number, number] = [5.59, 45.36]; // [lng, lat] MapLibre
const INITIAL_ZOOM = 6.5;
const TILT_PITCH = 45;

const pitchFor = (v: ViewMode) => (v === 'tilt' ? TILT_PITCH : 0);

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelLeaving, setPanelLeaving] = useState(false);
  const [hintLeaving, setHintLeaving] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [basemap, setBasemap] = useState<Basemap>('relief');
  const [view, setView] = useState<ViewMode>('tilt');
  const [loadPhase, setLoadPhase] = useState<'loading' | 'leaving' | 'done'>('loading');
  const mapRef = useRef<MaplibreMap | null>(null);
  const panelLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewRef = useRef(view);
  useLayoutEffect(() => {
    viewRef.current = view;
  }, [view]);

  const selectedPoint: Point | null =
    selectedId ? POINTS.find(p => p.id === selectedId) ?? null : null;

  const handleSelect = useCallback((id: string | null) => {
    if (id) {
      if (panelLeaveTimer.current) {
        clearTimeout(panelLeaveTimer.current);
        panelLeaveTimer.current = null;
      }
      setPanelLeaving(false);
      setSelectedId(id);
    } else {
      setPanelLeaving(true);
      panelLeaveTimer.current = setTimeout(() => {
        setSelectedId(null);
        setPanelLeaving(false);
        panelLeaveTimer.current = null;
      }, 320);
    }
  }, []);

  const handleMapReady = useCallback((map: MaplibreMap) => {
    mapRef.current = map;
  }, []);

  const resetView = useCallback(() => {
    mapRef.current?.flyTo({
      center:   VOIRON,
      zoom:     INITIAL_ZOOM,
      pitch:    pitchFor(viewRef.current),
      bearing:  0,
      duration: 800,
    });
  }, []);

  const handleFirstIdle = useCallback(() => {
    setLoadPhase('leaving');
    setTimeout(() => setLoadPhase('done'), 950);
  }, []);

  useEffect(() => {
    if (loadPhase !== 'done') return;
    const leaveTimer = setTimeout(() => setHintLeaving(true), 1500);
    const hideTimer = setTimeout(() => setHintVisible(false), 4500);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(hideTimer);
    };
  }, [loadPhase]);

  return (
    <TooltipProvider>
      <div className="fixed inset-0 touch-manipulation overflow-hidden bg-background select-none">
        <div className="absolute inset-0">
          <MapView
            selectedId={selectedId}
            basemap={basemap}
            pitch={pitchFor(view)}
            onSelect={handleSelect}
            onMapReady={handleMapReady}
            onFirstIdle={handleFirstIdle}
          />
        </div>

        <TitleCard />
        <Legend />
        <BasemapToggle value={basemap} onChange={setBasemap} view={view} onViewChange={setView} />

        <ZoomControls onReset={resetView} />

        {hintVisible && <TactileHint leaving={hintLeaving} />}

        {selectedPoint && (
          <FichePanel point={selectedPoint} leaving={panelLeaving} onClose={() => handleSelect(null)} />
        )}

        <BottomBar />

        {loadPhase !== 'done' && <LoadingScreen leaving={loadPhase === 'leaving'} />}
      </div>
    </TooltipProvider>
  );
}
