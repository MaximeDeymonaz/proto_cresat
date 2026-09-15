import type { CatMap } from '../types';

export const CAT: CatMap = {
  siege:      { label: 'Siège – Manufacture', color: '#262626' },
  bureau:     { label: 'Bureau permanent',    color: '#404040' },
  envoye:     { label: 'Envoyé spécial',      color: '#525252' },
  client:     { label: 'Client',              color: '#737373' },
  fournisseur:{ label: 'Fournisseur',         color: '#A1A1A1' },
};

export const RELIEF_SRC: [number, number, number, number][] = [
  [10.5,46.4,72,42], [0.6,42.7,58,28], [13.3,42.6,38,58],
  [24,48,58,30], [3,45.2,46,28], [-3.5,40.4,56,32],
  [19,46.5,40,26],
];
