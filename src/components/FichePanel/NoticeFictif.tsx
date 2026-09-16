import { TriangleAlertIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Avertissement sur le caractère inventé des exemples. Volontairement blanc :
 * dans une interface entièrement sombre, c'est le seul traitement qu'on ne peut
 * pas confondre avec le reste du contenu — et il ne doit pas pouvoir se lire
 * comme une donnée de la carte.
 */
export function NoticeFictif({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'flex gap-3 rounded-xl bg-white p-4 text-neutral-900 shadow-lg ring-1 ring-black/10',
        className,
      )}
    >
      <TriangleAlertIcon aria-hidden="true" className="mt-px size-4 shrink-0 text-amber-600" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold">Exemples fictifs</p>
        <p className="mt-1 text-pretty text-neutral-700">
          Les confréries listées ci-dessous, leurs descriptions et la cote de l’archive lié
          sont fictives, et uniquement données a des fins d’exemple.
        </p>
      </div>
    </div>
  );
}
