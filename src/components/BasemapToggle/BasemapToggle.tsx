import { Rotate3dIcon, Settings2Icon, SquareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Basemap } from '../MapView/MapView';

export type ViewMode = 'top' | 'tilt';

interface BasemapToggleProps {
  value: Basemap;
  onChange: (b: Basemap) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  showDepartements: boolean;
  onShowDepartementsChange: (show: boolean) => void;
  /** La fiche ouverte pousse le bouton plutôt que de le recouvrir. */
  panelOpen: boolean;
}

const BASEMAPS: { value: Basemap; label: string; swatch: string }[] = [
  { value: 'relief',   label: 'Relief 3D', swatch: 'bg-[linear-gradient(135deg,#444444_0%,#8f8f8f_55%,#eeeeee_100%)]' },
  { value: 'positron', label: 'Clair',     swatch: 'bg-[#f0ece2]' },
  { value: 'dark',     label: 'Sombre',    swatch: 'bg-[#26282c]' },
];

export function BasemapToggle({
  value, onChange, view, onViewChange, showDepartements, onShowDepartementsChange, panelOpen,
}: BasemapToggleProps) {
  return (
    <div
      data-map-inset
      className={cn(
        'absolute top-6 right-6 z-20 transition-transform max-md:top-4 max-md:right-4',
        'max-xs:top-auto max-xs:right-3 max-xs:bottom-[calc(5rem+env(safe-area-inset-bottom))]',
        panelOpen
          ? 'duration-300 ease-enter xs:translate-x-[calc(var(--fiche-w)*-1)]'
          : 'duration-200 ease-exit',
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Paramètres"
            className="bg-background/80 shadow-lg backdrop-blur-md"
          >
            <Settings2Icon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Fond de carte</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={v => onChange(v as Basemap)}>
            {BASEMAPS.map(b => (
              <DropdownMenuRadioItem key={b.value} value={b.value}>
                <span className={`size-3.5 shrink-0 rounded-sm border ${b.swatch}`} />
                {b.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Angle de vue</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={view} onValueChange={v => onViewChange(v as ViewMode)}>
            <DropdownMenuRadioItem value="top">
              <SquareIcon />
              Vue de haut
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="tilt">
              <Rotate3dIcon />
              Vue inclinée 45°
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Affichage</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={showDepartements}
            onCheckedChange={checked => onShowDepartementsChange(checked === true)}
            onSelect={e => e.preventDefault()}
          >
            Limites des départements
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
