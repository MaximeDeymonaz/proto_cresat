import { CONFRERIES_STEPS, radiusForCount, colorForCount, accentColor } from '@/data/scale';
import type { MapTheme } from '@/data/scale';
import { POINTS } from '@/data/points';
import { MarkerShape } from '@/components/MapView/MarkerShape';
import { cn } from '@/lib/utils';

const MAX_R = radiusForCount(CONFRERIES_STEPS[CONFRERIES_STEPS.length - 1]);
const BOX = MAX_R * 2 + 4;

// Paliers de la légende source effectivement présents sur la carte : aucune
// localité géocodée n'a moins de 4 confréries, les cercles 1 et 3 ne servent à rien.
const MIN_MAPPED = Math.min(...POINTS.map(p => p.confreries));
const STEPS = CONFRERIES_STEPS.filter(n => n >= MIN_MAPPED);

/** Pictogramme d'un nombre de confréries, identique au marqueur de la carte. */
export function ConfrerieIcon({ count, theme }: { count: number; theme: MapTheme }) {
  const r = radiusForCount(count);
  return (
    <svg
      width={r * 2 + 4}
      height={r * 2 + 4}
      viewBox={`${-BOX / 2} ${-BOX / 2} ${BOX} ${BOX}`}
      overflow="visible"
      className="shrink-0"
      aria-hidden="true"
    >
      <MarkerShape radius={r} color={colorForCount(count, theme)} />
    </svg>
  );
}

interface LegendProps {
  theme: MapTheme;
}

/**
 * Paliers de cercles. Sur fond de carte clair, les symboles sont posés sur une
 * plage claire : l'interface reste sombre mais la légende garde son contraste.
 */
export function LegendSteps({ theme, inline = false }: LegendProps & { inline?: boolean }) {
  return (
    <ul
      className={cn(
        'flex',
        inline ? 'items-center gap-3' : 'items-end gap-x-4',
        theme === 'light' && 'rounded-md bg-neutral-100 p-2 [&_span]:text-neutral-600',
      )}
    >
      {STEPS.map(n => (
        <li key={n} className={cn('flex', inline ? 'items-center gap-1.5' : 'flex-col items-center gap-1.5')}>
          <ConfrerieIcon count={n} theme={theme} />
          <span className="text-xs tabular-nums text-muted-foreground">{n}</span>
        </li>
      ))}
    </ul>
  );
}

/** Contenu de la légende (desktop/tablette) ; sur mobile, voir BottomBar. */
export function LegendContent({ theme, showDepartements }: LegendProps & { showDepartements: boolean }) {
  const accent = accentColor(theme);
  return (
    <div className="flex flex-col gap-3">
      <LegendSteps theme={theme} />
      {showDepartements && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="h-0.5 w-6 shrink-0 rounded-full"
            style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
          />
          Limite départementale
        </div>
      )}
    </div>
  );
}
