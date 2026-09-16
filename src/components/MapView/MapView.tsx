import { useRef } from 'react';
import type * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useReliefMap } from './useReliefMap';
import { Atmosphere } from './Atmosphere';
import { MAP_THEME } from './reliefStyle';
import type { Basemap } from './reliefStyle';
import './MapView.css';

export type { Basemap };

interface MapViewProps {
  selectedId: string | null;
  basemap:    Basemap;
  pitch:      number;
  showDepartements: boolean;
  introDelay: number;
  onSelect:   (id: string | null, viaKeyboard: boolean) => void;
  onMapReady?:  (map: maplibregl.Map) => void;
  onFirstIdle?: () => void;
  onRevealed?:  () => void;
}

export function MapView(props: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const veilRef      = useRef<HTMLDivElement>(null);
  useReliefMap({ containerRef, veilRef, ...props });

  return (
    <div className="map-wrap" data-map-theme={MAP_THEME[props.basemap]}>
      <div ref={containerRef} className="map-maplibre" />
      <div ref={veilRef} className="map-veil" aria-hidden="true" />
      {props.basemap === 'relief' && <Atmosphere />}
    </div>
  );
}
