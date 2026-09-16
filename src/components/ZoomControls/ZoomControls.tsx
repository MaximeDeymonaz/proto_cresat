import { RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ZoomControlsProps {
  onReset: () => void;
  /** La fiche ouverte pousse les contrôles plutôt que de les recouvrir. */
  panelOpen: boolean;
}

export function ZoomControls({ onReset, panelOpen }: ZoomControlsProps) {
  return (
    <div
      data-map-inset
      className={cn(
        'absolute right-6 bottom-6 z-20 transition-transform max-md:right-4 max-md:bottom-4 max-xs:hidden',
        panelOpen
          ? 'duration-300 ease-enter xs:translate-x-[calc(var(--fiche-w)*-1)]'
          : 'duration-200 ease-exit',
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-lg"
            onClick={onReset}
            aria-label="Réinitialiser la vue"
            className="bg-background/80 shadow-lg backdrop-blur-md"
          >
            <RotateCcwIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Réinitialiser la vue</TooltipContent>
      </Tooltip>
    </div>
  );
}
