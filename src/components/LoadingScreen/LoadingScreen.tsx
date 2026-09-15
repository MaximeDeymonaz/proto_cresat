import {useEffect, useState} from 'react';
import './LoadingScreen.css';

const TIPS = [
    'Inclinez la carte à 45° pour révéler le relief des Alpes.',
    'La vue de haut offre une lecture claire des distances.',
    'Sélectionnez un comptoir pour consulter sa fiche.',
    'La molette permet de survoler vallées et massifs.',
];

interface LoadingScreenProps {
    leaving: boolean;
}

export function LoadingScreen({leaving}: LoadingScreenProps) {
    const [tip, setTip] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTip(t => (t + 1) % TIPS.length), 3400);
        return () => clearInterval(id);
    }, []);

    return (
        <div className={`loading-screen${leaving ? ' is-leaving' : ''}`}>
            <div className="loading-screen__fog loading-screen__fog--a"/>
            <div className="loading-screen__fog loading-screen__fog--b"/>

            <div className="loading-screen__center">
                <h1 className="loading-screen__title">
                    <span className="loading-screen__title-main">Réseau commercial</span>
                    <span className="loading-screen__title-name">Jacques Denantes et son fils</span>
                    <span className="loading-screen__title-date">1772–1778</span>
                </h1>
                <div className="loading-screen__rule">
                    <span className="loading-screen__rule-glyph"></span>
                </div>
                <div className="loading-screen__sub">
                    Prototype
                </div>
            </div>

            <div className="loading-screen__bottom">
                <div className="loading-screen__spinner"/>
                <div className="loading-screen__label">Chargement…</div>
                <div className="loading-screen__tip" key={tip}>{TIPS[tip]}</div>
            </div>
        </div>
    );
}
