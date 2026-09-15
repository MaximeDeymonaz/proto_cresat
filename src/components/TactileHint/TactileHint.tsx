import './TactileHint.css';

interface TactileHintProps {
  leaving?: boolean;
}

export function TactileHint({ leaving }: TactileHintProps) {
  return (
    <div className={`tactile-hint${leaving ? ' is-leaving' : ''}`}>
      <span className="tactile-hint__dot" />
      <span className="tactile-hint__text">
        Touchez un point pour ouvrir l'entrée du registre
      </span>
    </div>
  );
}
