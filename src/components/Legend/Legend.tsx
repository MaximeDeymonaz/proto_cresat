import { ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LegendContent } from './LegendContent';

// Légende desktop/tablette ; sur mobile, voir BottomBar.
export function Legend() {
  return (
    <div className="absolute bottom-6 left-6 z-20 max-md:bottom-4 max-md:left-4 max-[480px]:hidden">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="lg" className="bg-background/80 shadow-lg backdrop-blur-md">
            <ListIcon />
            Légende
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-72">
          <PopoverHeader>
            <PopoverTitle>Légende</PopoverTitle>
          </PopoverHeader>
          <LegendContent />
        </PopoverContent>
      </Popover>
    </div>
  );
}
