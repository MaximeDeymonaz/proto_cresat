import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MarkerShape } from '@/components/MapView/MarkerShape';
import { CAT } from '@/data/categories';
import { POINTS } from '@/data/points';
import type { PointCategory } from '@/types';

const ORDER: PointCategory[] = ['siege', 'bureau', 'envoye', 'client', 'fournisseur'];

const COUNTS = POINTS.reduce<Partial<Record<PointCategory, number>>>((acc, p) => {
  acc[p.cat] = (acc[p.cat] ?? 0) + 1;
  return acc;
}, {});

/** Pictogramme d'une catégorie, identique au marqueur de la carte. */
export function CategoryIcon({ cat, size = 7 }: { cat: PointCategory; size?: number }) {
  const box = size * 3;
  return (
    <svg
      width={box}
      height={box}
      viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`}
      overflow="visible"
      className="shrink-0"
      aria-hidden="true"
    >
      <MarkerShape cat={cat} size={size} color={CAT[cat].color} strokeColor="#fff" strokeWidth={1.4} />
    </svg>
  );
}

/** Contenu de la légende, partagé par le popover (desktop) et le drawer (mobile). */
export function LegendContent() {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2.5">
        {ORDER.map(cat => (
          <li key={cat} className="flex items-center gap-3">
            <CategoryIcon cat={cat} />
            <span className="flex-1 text-sm">{CAT[cat].label}</span>
            <Badge variant="secondary" className="tabular-nums">
              {COUNTS[cat] ?? 0}
            </Badge>
          </li>
        ))}
      </ul>
      <Separator />
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-0.5 w-5 shrink-0 rounded-full bg-brand" />
        Liaisons commerciales depuis Voiron
      </div>
    </div>
  );
}
