import { CONFRERIES_STEPS, radiusForCount, colorForCount } from '@/data/scale';
import { MarkerShape } from '@/components/MapView/MarkerShape';

const MAX_R = radiusForCount(CONFRERIES_STEPS[CONFRERIES_STEPS.length - 1]);
const BOX = MAX_R * 2 + 4;

/** Pictogramme d'un nombre de confréries, identique au marqueur de la carte. */
export function ConfrerieIcon({ count }: { count: number }) {
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
      <MarkerShape radius={r} color={colorForCount(count)} />
    </svg>
  );
}

/** Contenu de la légende, partagé par le popover (desktop) et le drawer (mobile). */
export function LegendContent() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Confréries estimées par localité</p>
      <ul className="flex flex-wrap items-end gap-x-4 gap-y-2">
        {CONFRERIES_STEPS.map(n => (
          <li key={n} className="flex flex-col items-center gap-1.5">
            <ConfrerieIcon count={n} />
            <span className="text-xs tabular-nums text-muted-foreground">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
