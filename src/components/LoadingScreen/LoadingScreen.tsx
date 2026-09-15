import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const TIPS = [
  'Inclinez la carte à 45° pour révéler le relief des Alpes.',
  'La vue de haut offre une lecture claire des distances.',
  'Sélectionnez un comptoir pour consulter sa fiche.',
  'La molette permet de survoler vallées et massifs.',
];

interface LoadingScreenProps {
  leaving: boolean;
}

export function LoadingScreen({ leaving }: LoadingScreenProps) {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTip(t => (t + 1) % TIPS.length), 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-background transition-opacity duration-900',
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
          <span className="text-4xl font-semibold tracking-tight sm:text-5xl">Réseau commercial</span>
          <span className="text-lg text-muted-foreground sm:text-2xl">Jacques Denantes et son fils</span>
        </h1>
        <p className="text-sm text-muted-foreground tabular-nums">1772–1778</p>
      </div>

      <div className="absolute inset-x-0 bottom-[calc(2.5rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-3 px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner aria-label="Chargement" />
          Chargement…
        </div>
        <p key={tip} className="max-w-md text-center text-sm text-muted-foreground/70 duration-500 animate-in fade-in">
          {TIPS[tip]}
        </p>
      </div>
    </div>
  );
}
