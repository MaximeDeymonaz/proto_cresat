import { useState, useEffect, useRef } from 'react';
import { CAT } from '../../data/categories';
import type { PointCategory } from '../../types';
import { MarkerShape } from '../MapView/MarkerShape';
import './Legend.css';

const ORDER: PointCategory[] = ['siege', 'bureau', 'envoye', 'client', 'fournisseur'];

function LegendIcon({ cat }: { cat: PointCategory }) {
  const color = CAT[cat].color;
  const size = 7;
  const svgBox = size * 3;
  return (
    <span className="legend-icon-wrap">
      <svg
        width={svgBox}
        height={svgBox}
        viewBox={`${-svgBox / 2} ${-svgBox / 2} ${svgBox} ${svgBox}`}
        overflow="visible"
      >
        <MarkerShape cat={cat} size={size} color={color} strokeColor="#fff" strokeWidth={1.4} />
      </svg>
    </span>
  );
}

export function Legend() {
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

  return (
    <div className="legend-wrap" ref={wrapRef}>
      {open && (
        <div className="legend">
          <div className="legend__title">Légende</div>
          <div className="legend__items">
            {ORDER.map(cat => (
              <div key={cat} className="legend__row">
                <LegendIcon cat={cat} />
                <span className="legend__label">
                  {CAT[cat].label}
                  <span className="legend__count">
                    {cat === 'siege' ? 1 : cat === 'bureau' ? 5 : cat === 'envoye' ? 5 : cat === 'client' ? 8 : 5}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="legend__route">
            <span className="legend__route-line" />
            <span className="legend__route-label">Liaisons commerciales depuis Voiron</span>
          </div>
        </div>
      )}
      <button
        className={`legend-toggle${open ? ' is-active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Afficher la légende"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="9" y1="6"  x2="21" y2="6"/>
          <line x1="9" y1="12" x2="21" y2="12"/>
          <line x1="9" y1="18" x2="21" y2="18"/>
          <circle cx="4" cy="6"  r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/>
        </svg>
        <span>{open ? 'Masquer' : 'Légende'}</span>
      </button>
    </div>
  );
}
