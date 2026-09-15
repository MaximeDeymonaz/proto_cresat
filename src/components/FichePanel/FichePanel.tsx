import { BookOpenIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/Legend/LegendContent';
import { CAT } from '@/data/categories';
import type { Point } from '@/types';

interface FichePanelProps {
  point: Point;
  leaving?: boolean;
  onClose: () => void;
}

function Field({ label, value, half, emphasis }: {
  label: string;
  value: string;
  half?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className={cn('flex flex-col gap-1', !half && 'col-span-2')}>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className={cn('text-base text-pretty', emphasis && 'text-xl font-semibold tabular-nums')}>
        {value}
      </dd>
    </div>
  );
}

export function FichePanel({ point, leaving, onClose }: FichePanelProps) {
  return (
    <aside
      className={cn(
        'absolute inset-y-0 right-0 z-30 flex w-[398px] max-w-[46vw] flex-col border-l bg-background/85 shadow-2xl backdrop-blur-xl',
        'max-md:w-80 max-md:max-w-[52vw]',
        'max-[480px]:inset-x-0 max-[480px]:top-auto max-[480px]:h-[72vh] max-[480px]:w-full max-[480px]:max-w-full',
        'max-[480px]:rounded-t-2xl max-[480px]:border-t max-[480px]:border-l-0 max-[480px]:pb-[env(safe-area-inset-bottom)]',
        leaving
          ? 'pointer-events-none animate-out fill-mode-forwards fade-out duration-300 min-[481px]:slide-out-to-right-10 max-[480px]:slide-out-to-bottom'
          : 'animate-in fade-in duration-300 min-[481px]:slide-in-from-right-10 max-[480px]:slide-in-from-bottom',
      )}
    >
      {/* Poignée (mobile) */}
      <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted min-[481px]:hidden" />

      <ScrollArea className="min-h-0 flex-1">
        <div
          key={point.id}
          className="flex flex-col gap-6 p-8 duration-500 animate-in fade-in slide-in-from-bottom-2 max-md:p-6 max-[480px]:pt-3"
        >
          <div className="flex items-start justify-between gap-4">
            <Badge variant="outline" className="gap-1.5">
              <CategoryIcon cat={point.cat} size={4.5} />
              {CAT[point.cat].label}
            </Badge>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fermer">
              <XIcon />
            </Button>
          </div>

          <div>
            <h2 className="text-4xl font-semibold tracking-tight max-[480px]:text-3xl">{point.ville}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{point.pays}</p>
          </div>

          <Separator />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Field label="Date" value={point.date} />
            <Field label="Opération" value={point.type} />
            <Field label="Désignation" value={point.desig} />
            <Field label="Quantité" value={point.qte} half />
            <Field label="Montant" value={point.montant} half emphasis />
            <Field label="Correspondant" value={point.corr} />
          </dl>

          <Card size="sm" className="bg-muted/40">
            <CardHeader>
              <CardDescription className="flex items-center gap-2 text-brand">
                <BookOpenIcon className="size-4" />
                Consulter dans le registre
              </CardDescription>
              <CardTitle className="text-xl tabular-nums">
                Tome {point.tome} · Folio {point.folio}
              </CardTitle>
              <CardDescription>Année {point.annee}</CardDescription>
            </CardHeader>
          </Card>

          {point.note && (
            <blockquote className="border-l-2 pl-4 text-sm text-pretty text-muted-foreground italic">
              {point.note}
            </blockquote>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
