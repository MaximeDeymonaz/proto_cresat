import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export function TitleCard() {
  return (
    <Card
      data-map-inset
      className={
        'absolute top-6 left-6 z-20 w-max max-w-[calc(100vw-3rem)] bg-card/80 py-4 shadow-lg backdrop-blur-md ' +
        'max-md:inset-x-4 max-md:top-4 max-md:w-auto max-md:max-w-none ' +
        'max-xs:inset-x-0 max-xs:top-0 max-xs:rounded-none max-xs:pt-[calc(0.75rem+env(safe-area-inset-top))] max-xs:pb-3'
      }
    >
      {/* Pas de CardHeader : son `@container` (container-type: inline-size) annule
          la largeur intrinsèque et écrase la carte, positionnée en absolu. */}
      <div className="flex flex-col gap-1 px-5 max-xs:px-4">
        <CardTitle className="text-lg font-semibold tracking-tight max-md:text-base max-xs:text-sm">
          Confréries alsaciennes attestées au XVIIIe siècle
        </CardTitle>
        <CardDescription className="max-xs:text-xs">
          Carte 7 · O. Kammerer, 2011 · données L. Schlaefli
        </CardDescription>
      </div>
    </Card>
  );
}
