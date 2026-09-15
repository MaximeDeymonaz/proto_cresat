import './TitleCard.css';

export function TitleCard() {
    return (
        <div className="title-card">
            {/*<div className="title-card__proto">Prototype</div>*/}
            <div className="title-card__name">
                Réseau commercial — Jacques Denantes et son fils
            </div>
            <div className="title-card__rule">
                <span className="title-card__rule-glyph"></span>
            </div>
            <div className="title-card__meta">
                Carte établie d'après le Registre des ventes · 1772–1778
            </div>
        </div>
    );
}
