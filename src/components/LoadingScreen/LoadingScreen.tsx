import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

/** Durée du fondu de sortie (ms) : la caméra attend sa fin pour démarrer l'intro. */
export const LOADER_FADE_MS = 400;

const TIPS = [
  'Inclinez la carte à 45° pour révéler le relief des Vosges.',
  'La vue de haut offre une lecture claire des distances.',
  'Sélectionnez une localité pour consulter sa fiche.',
  'La taille des cercles est proportionnelle au nombre de confréries.',
];

const TIP_INTERVAL = 3400; // ms
const TIP_FADE_OUT = 200;  // ms, doit suivre la classe duration-200 ci-dessous

interface LoadingScreenProps {
  leaving: boolean;
  onExited: () => void;
}

export function LoadingScreen({ leaving, onExited }: LoadingScreenProps) {
  const [tip, setTip] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  // Enchaînement des astuces : fondu sortant, changement de texte, fondu entrant.
  useEffect(() => {
    let swap: ReturnType<typeof setTimeout>;
    const cycle = setInterval(() => {
      setTipVisible(false);
      swap = setTimeout(() => {
        setTip(t => (t + 1) % TIPS.length);
        setTipVisible(true);
      }, TIP_FADE_OUT);
    }, TIP_INTERVAL);
    return () => {
      clearInterval(cycle);
      clearTimeout(swap);
    };
  }, []);

  return (
    <div
      onTransitionEnd={e => {
        if (leaving && e.target === e.currentTarget) onExited();
      }}
      className={cn(
        'fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-background',
        'transition-opacity duration-400 ease-exit',
        leaving && 'pointer-events-none opacity-0',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,var(--color-muted)_0%,transparent_60%)]"
      />

      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        <Badge variant="outline">Prototype</Badge>
        <h1 className="flex flex-col items-center gap-2">
          <span className="text-4xl font-semibold tracking-tight sm:text-5xl">Confréries alsaciennes</span>
          <span className="text-lg text-muted-foreground sm:text-2xl">Attestées au XVIIIe siècle</span>
        </h1>
        <p className="text-sm text-muted-foreground tabular-nums">Carte 7 · O. Kammerer, 2011</p>
      </div>

      <div className="absolute inset-x-0 bottom-[calc(2.5rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-3 px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner aria-label="Chargement" />
          Chargement…
        </div>
        <p
          className={cn(
            'max-w-md text-center text-sm text-muted-foreground/85 transition-opacity',
            tipVisible ? 'duration-300 ease-enter' : 'opacity-0 duration-200 ease-exit',
          )}
        >
          {TIPS[tip]}
        </p>
      </div>
    </div>
  );
}
