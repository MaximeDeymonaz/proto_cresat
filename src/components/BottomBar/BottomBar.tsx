import type { MapTheme } from '@/data/scale';
import { LegendSteps } from '@/components/Legend/LegendContent';

// Barre inférieure, visible uniquement sur mobile : la légende y est lisible en
// permanence plutôt que cachée derrière un tiroir.
export function BottomBar({ theme }: { theme: MapTheme }) {
  return (
    <section
      data-map-inset
      aria-label="Légende"
      className={
        'absolute inset-x-0 bottom-0 z-25 flex items-center justify-center gap-3 border-t bg-background/85 px-4 ' +
        'pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-md xs:hidden'
      }
    >
      <span className="text-xs text-muted-foreground">Confréries</span>
      <LegendSteps theme={theme} inline />
    </section>
  );
}
