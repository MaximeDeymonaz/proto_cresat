import { useState } from 'react';
import { CAT } from '../../data/categories';
import type { PointCategory } from '../../types';
import { MarkerShape } from '../MapView/MarkerShape';
import './BottomBar.css';

const ORDER: PointCategory[] = ['siege', 'bureau', 'envoye', 'client', 'fournisseur'];

function LegendIcon({ cat }: { cat: PointCategory }) {
  const color = CAT[cat].color;
  const size = 7;
  const svgBox = size * 3;
  return (
    <span className="bb-icon-wrap">
      <svg
        width={svgBox} height={svgBox}
        viewBox={`${-svgBox / 2} ${-svgBox / 2} ${svgBox} ${svgBox}`}
        overflow="visible"
      >
        <MarkerShape cat={cat} size={size} color={color} strokeColor="#fff" strokeWidth={1.4} />
      </svg>
    </span>
  );
}

export function BottomBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="bb-legend-overlay" onClick={() => setOpen(false)}>
          <div className="bb-legend-sheet" onClick={e => e.stopPropagation()}>
            <div className="bb-legend-handle" />
            <div className="bb-legend-title">Légende</div>
            <div className="bb-legend-items">
              {ORDER.map(cat => (
                <div key={cat} className="bb-legend-row">
                  <LegendIcon cat={cat} />
                  <span className="bb-legend-label">
                    {CAT[cat].label}
                    <span className="bb-legend-count">
                      {cat === 'siege' ? 1 : cat === 'bureau' ? 5 : cat === 'envoye' ? 5 : cat === 'client' ? 8 : 5}
                    </span>
                  </span>
                </div>
              ))}
              <div className="bb-legend-route">
                <span className="bb-legend-route-line" />
                <span className="bb-legend-route-label">Liaisons commerciales depuis Voiron</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bottom-bar">
        <button
          className={`bb-btn ${open ? 'bb-btn--active' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label="Légende"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Légende</span>
        </button>
      </div>
    </>
  );
}
