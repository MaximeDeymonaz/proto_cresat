import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronRightIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ConfrerieIcon } from '@/components/Legend/LegendContent';
import { confreriesFor } from '@/data/confreries';
import type { MapTheme } from '@/data/scale';
import type { Point } from '@/types';
import { ConfrerieDetail } from './ConfrerieDetail';
import { NoticeFictif } from './NoticeFictif';
import { useDragToDismiss } from './useDragToDismiss';

interface FichePanelProps {
  point:     Point;
  theme:     MapTheme;
  leaving:   boolean;
  /** Sélection faite au clavier : le focus suit dans la fiche. */
  autoFocus: boolean;
  onClose:   () => void;
  onExited:  () => void;
}

export function FichePanel({ point, theme, leaving, autoFocus, onClose, onExited }: FichePanelProps) {
  const asideRef   = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId  = useId();

  // Confrérie ouverte dans le sous-volet. La localité est mémorisée avec elle :
  // changer de marqueur referme le sous-volet sans passer par un effet.
  const [opened, setOpened] = useState<{ pointId: string; id: string; leaving: boolean } | null>(null);
  const current = opened?.pointId === point.id ? opened : null;

  const confreries = useMemo(() => confreriesFor(point), [point]);
  const detail = current ? confreries.find(c => c.id === current.id) ?? null : null;
  const detailLeaving = current?.leaving ?? false;

  const status = point.certaine
    ? { label: 'Valeur attestée', detail: 'D’après le registre de Strasbourg.' }
    : { label: 'Estimation', detail: 'Estimée d’après la taille du cercle sur la carte originale.' };

  // À la fermeture, le focus revient au marqueur d'où il venait.
  const close = useCallback(() => {
    const hadFocus = !!asideRef.current?.contains(document.activeElement);
    onClose();
    if (hadFocus) {
      document
        .querySelector<HTMLElement>(`[data-localite="${point.id}"]`)
        ?.focus({ preventScroll: true });
    }
  }, [onClose, point.id]);

  const dragHandlers = useDragToDismiss(asideRef, close);

  const openDetail = useCallback(
    (id: string) => setOpened({ pointId: point.id, id, leaving: false }),
    [point.id],
  );

  const closeDetail = useCallback(() => {
    setOpened(o => (o ? { ...o, leaving: true } : o));
  }, []);

  // Retour à la liste : le focus repart de la confrérie qu'on venait de consulter.
  const detailExited = useCallback(() => {
    const id = current?.id;
    setOpened(null);
    if (id) {
      document.querySelector<HTMLElement>(`[data-confrerie="${id}"]`)?.focus({ preventScroll: true });
    }
  }, [current?.id]);

  useEffect(() => {
    if (autoFocus) headingRef.current?.focus({ preventScroll: true });
  }, [autoFocus, point.id]);

  useEffect(() => {
    if (leaving) return;
    const onKeyDown = (e: KeyboardEvent) => {
      // Échap ferme d'abord un menu ouvert (géré par Radix), pas la fiche.
      const inMenu = (document.activeElement as HTMLElement | null)
        ?.closest('[role="menu"], [role="dialog"], [role="listbox"]');
      if (e.key !== 'Escape' || inMenu) return;
      // Puis le sous-volet, avant la fiche qui le porte.
      if (detail && !detailLeaving) closeDetail();
      else close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [leaving, close, closeDetail, detail, detailLeaving]);

  return (
    <aside
      ref={asideRef}
      data-map-inset
      aria-labelledby={headingId}
      onAnimationEnd={e => {
        if (leaving && e.target === e.currentTarget) onExited();
      }}
      className={cn(
        'absolute inset-y-0 right-0 z-30 flex w-(--fiche-w) flex-col border-l bg-background/85 shadow-2xl backdrop-blur-xl',
        'max-xs:inset-x-0 max-xs:top-auto max-xs:h-auto max-xs:max-h-[72vh] max-xs:w-full',
        'max-xs:rounded-t-2xl max-xs:border-t max-xs:border-l-0 max-xs:pb-[env(safe-area-inset-bottom)]',
        leaving
          ? 'pointer-events-none animate-out fade-out fill-mode-forwards duration-200 ease-exit xs:slide-out-to-right-10 max-xs:slide-out-to-bottom'
          : 'animate-in fade-in duration-300 ease-enter xs:slide-in-from-right-10 max-xs:slide-in-from-bottom',
      )}
    >
      {/* Poignée : glisser vers le bas pour fermer (mobile) */}
      <div
        aria-hidden="true"
        {...dragHandlers}
        className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center xs:hidden"
      >
        <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div
          key={point.id}
          className={cn(
            'flex flex-col gap-6 p-8 max-md:p-6 max-xs:gap-5 max-xs:pt-1',
            'animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards delay-50 duration-200 ease-enter',
          )}
        >
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                ref={headingRef}
                id={headingId}
                tabIndex={-1}
                className="text-4xl font-semibold tracking-tight text-balance outline-none max-xs:text-3xl"
              >
                {point.ville}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{point.departement}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={close}
              aria-label="Fermer la fiche"
              className="-mt-1 -mr-2 shrink-0"
            >
              <XIcon />
            </Button>
          </header>

          {/* Chiffre clé, avec le symbole exact porté par la carte */}
          <div className="flex items-center gap-4">
            <ConfrerieIcon count={point.confreries} theme={theme} />
            <p className="flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight tabular-nums">{point.confreries}</span>
              <span className="text-base text-muted-foreground">confréries</span>
            </p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <Badge variant={point.certaine ? 'default' : 'outline'}>{status.label}</Badge>
            <p className="text-sm text-pretty text-muted-foreground">{status.detail}</p>
          </div>

          {point.remarque && (
            <blockquote className="border-l-2 pl-4 text-sm text-pretty italic">
              {point.remarque}
            </blockquote>
          )}

          <Separator />

          {/* Exemples d'informations : l'entrée vers les cotes d'archives */}
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-xl font-semibold tracking-tight">Exemples d’informations</h3>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {confreries.length} sur {point.confreries}
              </span>
            </div>
            <p className="text-sm text-pretty text-muted-foreground">
              Chaque confrérie renvoie à un exemple de cote des Archives départementales
              (série E).
            </p>

            <NoticeFictif className="my-1" />

            <ul className="-mx-3 flex flex-col">
              {confreries.map(c => (
                <li key={c.id}>
                  <button
                    type="button"
                    data-confrerie={c.id}
                    onClick={() => openDetail(c.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left',
                      'transition-colors hover:bg-muted focus-visible:bg-muted',
                      'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.nom}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {c.cote.depot}, {c.cote.cote} · {c.cote.dates}
                      </span>
                    </span>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <Separator />

          <p className="text-xs text-muted-foreground">
            Source : Carte 7 · O. Kammerer, 2011 · données L. Schlaefli
          </p>
        </div>
      </ScrollArea>

      {detail && (
        <ConfrerieDetail
          confrerie={detail}
          point={point}
          leaving={detailLeaving}
          onBack={closeDetail}
          onExited={detailExited}
        />
      )}
    </aside>
  );
}
