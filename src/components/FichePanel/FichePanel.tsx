import type { Point, PointCategory } from '../../types';
import { CAT } from '../../data/categories';
import { MarkerShape } from '../MapView/MarkerShape';
import './FichePanel.css';

interface FichePanelProps {
  point: Point;
  leaving?: boolean;
  onClose: () => void;
}

function CategoryChip({ cat }: { cat: PointCategory }) {
  const c = CAT[cat];
  return (
    <span className="fiche-chip">
      <svg width={15} height={15} viewBox="-10 -10 20 20" style={{ overflow: 'visible' }}>
        <MarkerShape cat={cat} size={6.5} color={c.color} strokeColor="#fff" strokeWidth={1.4} />
      </svg>
      {c.label}
    </span>
  );
}

export function FichePanel({ point, leaving, onClose }: FichePanelProps) {
  return (
    <div className={`fiche-panel${leaving ? ' is-leaving' : ''}`}>
      <div className="fiche-scroll" key={point.id}>
        <div className="fiche-header">
          <div className="fiche-header__left">
            <CategoryChip cat={point.cat} />
          </div>
          <button className="fiche-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        <div className="fiche-city">{point.ville}</div>
        <div className="fiche-pays">{point.pays}</div>

        <div className="fiche-divider" />

        <div className="fiche-fields" id="fiche-fields">
          <div className="fiche-field">
            <div className="fiche-field__label">Date</div>
            <div className="fiche-field__value">{point.date}</div>
          </div>
          <div className="fiche-field">
            <div className="fiche-field__label">Opération</div>
            <div className="fiche-field__value">{point.type}</div>
          </div>
          <div className="fiche-field">
            <div className="fiche-field__label">Désignation</div>
            <div className="fiche-field__value fiche-field__value--wrap">{point.desig}</div>
          </div>
          <div className="fiche-field-grid">
            <div className="fiche-field">
              <div className="fiche-field__label">Quantité</div>
              <div className="fiche-field__value">{point.qte}</div>
            </div>
            <div className="fiche-field">
              <div className="fiche-field__label">Montant</div>
              <div className="fiche-field__value fiche-field__value--amount">{point.montant}</div>
            </div>
          </div>
          <div className="fiche-field">
            <div className="fiche-field__label">Correspondant</div>
            <div className="fiche-field__value">{point.corr}</div>
          </div>
        </div>

        <div className="fiche-registre">
          <div className="fiche-registre__header">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#2C6E9C" strokeWidth={1.7} style={{ flex: 'none' }}>
              <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15.5H5.5C4.7 19.5 4 18.8 4 18V5.5Z" />
              <path d="M20 5.5C20 4.7 19.3 4 18.5 4H13v15.5h5.5c.8 0 1.5-.7 1.5-1.5V5.5Z" />
            </svg>
            <span className="fiche-registre__tag">consulter dans le registre</span>
          </div>
          <div className="fiche-registre__ref">
            Tome {point.tome} · Folio {point.folio}
          </div>
          <div className="fiche-registre__year">Année {point.annee}</div>
        </div>

        {point.note && (
          <div className="fiche-note">{point.note}</div>
        )}
      </div>
    </div>
  );
}
