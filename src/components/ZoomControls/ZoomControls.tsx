import { RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ZoomControlsProps {
  onReset: () => void;
}

export function ZoomControls({ onReset }: ZoomControlsProps) {
  return (
    <div className="absolute right-6 bottom-6 z-20 max-md:right-4 max-md:bottom-4 max-[480px]:hidden">
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
