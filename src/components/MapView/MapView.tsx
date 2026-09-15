import { useRef } from 'react';
import type * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useReliefMap } from './useReliefMap';
import { Atmosphere } from './Atmosphere';
import type { Basemap } from './reliefStyle';
import './MapView.css';

export type { Basemap };

interface MapViewProps {
  selectedId: string | null;
  basemap:    Basemap;
  pitch:      number;
  onSelect:   (id: string | null) => void;
  onMapReady?: (map: maplibregl.Map) => void;
  onFirstIdle?: () => void;
}

export function MapView(props: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useReliefMap({ containerRef, ...props });

  return (
    <div className="map-wrap">
      <div
        ref={containerRef}
        className={`map-maplibre${props.basemap === 'dark' ? ' theme-dark' : ''}`}
      />
      {props.basemap === 'relief' && <Atmosphere />}
    </div>
  );
}
