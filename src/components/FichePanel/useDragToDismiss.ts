import { useCallback, useRef } from 'react';
import type { PointerEvent, RefObject } from 'react';

// Distance (px) au-delà de laquelle un glissé vers le bas ferme le volet (mobile).
const DISMISS_DISTANCE = 80;

/**
 * Glisser vers le bas pour fermer (bottom sheet). L'animation de sortie part de
 * la position atteinte : le volet ne remonte pas avant de disparaître.
 *
 * La ref est fournie par l'appelant, qui s'en sert aussi pour le focus.
 */
export function useDragToDismiss<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onDismiss: () => void,
) {
  const dragRef = useRef<{ startY: number; dy: number } | null>(null);

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (ref.current) ref.current.style.transition = 'none';
  }, [ref]);

  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !ref.current) return;
    drag.dy = Math.max(0, e.clientY - drag.startY);
    ref.current.style.transform = `translateY(${drag.dy}px)`;
  }, [ref]);

  const onPointerUp = useCallback(() => {
    const drag = dragRef.current;
    const el = ref.current;
    dragRef.current = null;
    if (!drag || !el) return;
    if (drag.dy > DISMISS_DISTANCE) {
      onDismiss();
      return;
    }
    el.style.transition = 'transform 250ms var(--ease-enter)';
    el.style.transform = '';
  }, [ref, onDismiss]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
