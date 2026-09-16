import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDownIcon, ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MapTheme } from '@/data/scale';
import { LegendContent } from './LegendContent';

interface LegendProps {
  theme: MapTheme;
  showDepartements: boolean;
}

// Légende desktop/tablette, visible d'emblée : c'est la clé de lecture de la
// carte, pas une option. Repliable en pastille ; sur mobile, voir BottomBar.
export function Legend({ theme, showDepartements }: LegendProps) {
  const [open, setOpen] = useState(true);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const keepFocus = useRef(false);
  const titleId = useId();

  // Le bouton change d'identité en se repliant : on y ramène le focus.
  useEffect(() => {
    if (!keepFocus.current) return;
    keepFocus.current = false;
    toggleRef.current?.focus();
  }, [open]);

  const toggle = () => {
    keepFocus.current = true;
    setOpen(o => !o);
  };

  return (
    <div data-map-inset className="absolute bottom-6 left-6 z-20 max-md:bottom-4 max-md:left-4 max-xs:hidden">
      {open ? (
        <section
          aria-labelledby={titleId}
          className="flex w-max origin-bottom-left animate-in flex-col gap-3 rounded-xl bg-background/80 p-4 pt-3 fade-in shadow-lg ring-1 ring-foreground/10 zoom-in-95 backdrop-blur-md duration-200 ease-enter"
        >
          <div className="flex items-center justify-between gap-6">
            <h2 id={titleId} className="text-sm font-medium">Confréries par localité</h2>
            <Button
              ref={toggleRef}
              variant="ghost"
              size="icon-xs"
              onClick={toggle}
              aria-expanded
              aria-label="Replier la légende"
              className="-mr-1.5"
            >
              <ChevronDownIcon />
            </Button>
          </div>
          <LegendContent theme={theme} showDepartements={showDepartements} />
        </section>
      ) : (
        <Button
          ref={toggleRef}
          variant="outline"
          size="lg"
          onClick={toggle}
          aria-expanded={false}
          className="origin-bottom-left animate-in bg-background/80 fade-in shadow-lg zoom-in-95 backdrop-blur-md duration-200 ease-enter"
        >
          <ListIcon />
          Légende
        </Button>
      )}
    </div>
  );
}
