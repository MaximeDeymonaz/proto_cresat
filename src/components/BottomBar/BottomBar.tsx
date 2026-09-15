import { LayoutGridIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { LegendContent } from '@/components/Legend/LegendContent';

// Barre inférieure, visible uniquement sur mobile.
export function BottomBar() {
  return (
    <div
      className={
        'absolute inset-x-0 bottom-0 z-25 flex h-[calc(3.5rem+env(safe-area-inset-bottom))] items-center justify-center ' +
        'border-t bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md min-[481px]:hidden'
      }
    >
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="h-auto flex-col gap-1 px-5 py-1.5 text-xs">
            <LayoutGridIcon className="size-5" />
            Légende
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Légende</DrawerTitle>
            <DrawerDescription className="sr-only">
              Catégories de points et liaisons commerciales
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <LegendContent />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
