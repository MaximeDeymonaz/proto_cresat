import { cn } from '@/lib/utils';

interface TactileHintProps {
  leaving: boolean;
  onExited: () => void;
}

// Invite affichée après la cascade des cercles (delay-900), le temps que l'œil
// se pose sur la carte. Elle part à la première sélection, ou d'elle-même.
export function TactileHint({ leaving, onExited }: TactileHintProps) {
  return (
    <div
      role="status"
      onAnimationEnd={e => {
        if (leaving && e.target === e.currentTarget) onExited();
      }}
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-8 z-20 mx-auto flex w-fit max-w-[80%] items-center gap-2.5',
        'rounded-full border bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-lg backdrop-blur-md',
        'max-md:top-28 max-md:bottom-auto max-xs:hidden',
        leaving
          ? 'animate-out fade-out slide-out-to-bottom-2 fill-mode-forwards duration-200 ease-exit'
          : 'animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards delay-900 duration-300 ease-enter',
      )}
    >
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-brand" />
      </span>
      <span>
        <span className="pointer-coarse:hidden">Cliquez sur</span>
        <span className="hidden pointer-coarse:inline">Touchez</span>
        {' '}un point pour voir le détail de la localité
      </span>
    </div>
  );
}
