import { useState, useEffect, useRef } from 'react';
import type { Basemap } from '../MapView/MapView';
import './BasemapToggle.css';

export type ViewMode = 'top' | 'tilt';

interface BasemapToggleProps {
  value: Basemap;
  onChange: (b: Basemap) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

export function BasemapToggle({ value, onChange, view, onViewChange }: BasemapToggleProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const select = (b: Basemap) => { onChange(b); setOpen(false); };

  return (
    <div className="basemap-wrap" ref={wrapRef}>
      <button
        className={`basemap-gear${open ? ' is-active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Paramètres"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
      {open && (
        <div className="basemap-toggle" role="group" aria-label="Paramètres">
          <div className="settings-label">Fond de carte</div>
          <button
            className={`basemap-btn${value === 'relief' ? ' is-active' : ''}`}
            onClick={() => select('relief')}
          >
            <span className="basemap-swatch basemap-swatch--relief" />
            Relief 3D
          </button>
          <button
            className={`basemap-btn${value === 'positron' ? ' is-active' : ''}`}
            onClick={() => select('positron')}
          >
            <span className="basemap-swatch basemap-swatch--light" />
            Clair
          </button>
          <button
            className={`basemap-btn${value === 'dark' ? ' is-active' : ''}`}
            onClick={() => select('dark')}
          >
            <span className="basemap-swatch basemap-swatch--dark" />
            Sombre
          </button>

          <div className="basemap-divider" />
          <div className="settings-label">Angle de vue</div>
          <button
            className={`basemap-btn${view === 'top' ? ' is-active' : ''}`}
            onClick={() => onViewChange('top')}
          >
            <svg className="basemap-btn__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="14" height="14" rx="1" />
            </svg>
            Vue de haut
          </button>
          <button
            className={`basemap-btn${view === 'tilt' ? ' is-active' : ''}`}
            onClick={() => onViewChange('tilt')}
          >
            <svg className="basemap-btn__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h8l4 12H4L8 6z" />
            </svg>
            Vue inclinée 45°
          </button>
        </div>
      )}
    </div>
  );
}
