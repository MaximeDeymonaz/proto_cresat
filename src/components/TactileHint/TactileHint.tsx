import { cn } from '@/lib/utils';

interface TactileHintProps {
  leaving?: boolean;
}

export function TactileHint({ leaving }: TactileHintProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-8 z-20 mx-auto flex w-fit max-w-[80%] items-center gap-2.5',
        'rounded-full border bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-lg backdrop-blur-md',
        'transition-all duration-[2000ms] ease-out max-[480px]:hidden',
        leaving && 'translate-y-2 opacity-0',
      )}
    >
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-brand" />
      </span>
      Touchez un point pour ouvrir l'entrée du registre
    </div>
  );
}
