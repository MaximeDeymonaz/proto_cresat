import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { NoticeFictif } from './NoticeFictif';
import { useDragToDismiss } from './useDragToDismiss';
import type { Confrerie, Point } from '@/types';

interface ConfrerieDetailProps {
  confrerie: Confrerie;
  point:     Point;
  leaving:   boolean;
  onBack:    () => void;
  onExited:  () => void;
}

/** Une ligne du descriptif archivistique. */
function Champ({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-pretty">{children}</dd>
    </div>
  );
}

/**
 * Sous-volet : recouvre la fiche de la localité et présente l'exemple de cote
 * d'une confrérie. Le retour rend la main à la liste, d'où l'on vient.
 */
export function ConfrerieDetail({ confrerie, point, leaving, onBack, onExited }: ConfrerieDetailProps) {
  const rootRef    = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId  = useId();
  const dragHandlers = useDragToDismiss(rootRef, onBack);
  const { cote } = confrerie;

  // Le lecteur arrive en haut du sous-volet, pas au milieu de la fiche précédente.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [confrerie.id]);

  return (
    <div
      ref={rootRef}
      role="group"
      aria-labelledby={headingId}
      onAnimationEnd={e => {
        if (leaving && e.target === e.currentTarget) onExited();
      }}
      className={cn(
        'absolute inset-0 z-10 flex flex-col bg-background max-xs:rounded-t-2xl',
        'max-xs:pb-[env(safe-area-inset-bottom)]',
        leaving
          ? 'pointer-events-none animate-out fade-out fill-mode-forwards duration-200 ease-exit xs:slide-out-to-right-6 max-xs:slide-out-to-bottom'
          : 'animate-in fade-in duration-250 ease-enter xs:slide-in-from-right-6 max-xs:slide-in-from-bottom',
      )}
    >
      {/* Poignée : glisser vers le bas revient à la liste (mobile) */}
      <div
        aria-hidden="true"
        {...dragHandlers}
        className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center xs:hidden"
      >
        <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 p-8 max-md:p-6 max-xs:gap-5 max-xs:pt-1">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="-ml-2 mb-4 text-muted-foreground"
            >
              <ArrowLeftIcon data-icon="inline-start" />
              {point.ville}
            </Button>

            <h3
              ref={headingRef}
              id={headingId}
              tabIndex={-1}
              className="text-2xl font-semibold tracking-tight text-balance outline-none"
            >
              {confrerie.nom}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={confrerie.nature === 'metier' ? 'secondary' : 'outline'}>
                {confrerie.nature === 'metier' ? 'Confrérie de métier' : 'Confrérie de dévotion'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Première mention : {confrerie.fondation}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{confrerie.siege}</p>
          </div>

          <NoticeFictif />

          {/* La cote ensuite : c'est elle qu'on recopierait pour commander la pièce. */}
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
              Cote
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {cote.cote}
            </p>
            <p className="mt-1.5 text-sm">{cote.depotNom}</p>
            <p className="text-xs text-muted-foreground">{cote.serie}</p>
          </div>

          <dl className="flex flex-col gap-4">
            <Champ label="Intitulé">{cote.intitule}</Champ>
            <Champ label="Dates extrêmes">
              <span className="tabular-nums">{cote.dates}</span>
            </Champ>
            <Champ label="Importance matérielle">{cote.support}</Champ>
            <Champ label="Présentation du contenu">{cote.analyse}</Champ>
            <Champ label="Conditions d’accès">
              Communicable en salle de lecture ({cote.depot}) sur présentation d’une carte de
              lecteur. Reproduction soumise à autorisation.
            </Champ>
          </dl>
        </div>
      </ScrollArea>
    </div>
  );
}
