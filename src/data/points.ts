import type { Point } from '../types';
import source from './confreries_alsace_XVIIIe.json';

function slugify(nom: string): string {
  return nom
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface RawLocalite {
  nom: string;
  nom_actuel: string;
  departement: string;
  lat: number;
  lon: number;
  confreries_estimees: number;
  remarque?: string;
}

const { localites } = source as { localites: RawLocalite[] };

export const POINTS: Point[] = localites.map(l => ({
  id:          slugify(l.nom),
  ville:       l.nom,
  departement: l.departement,
  lat:         l.lat,
  lon:         l.lon,
  confreries:  l.confreries_estimees,
  certaine:    l.nom === 'Strasbourg',
  remarque: [
    l.nom_actuel !== l.nom ? `Aujourd'hui : ${l.nom_actuel}.` : null,
    l.remarque ?? null,
  ].filter(Boolean).join(' ') || undefined,
}));

// Centre géographique du corpus (Bas-Rhin / Haut-Rhin) — [lon, lat] MapLibre.
export const ALSACE_CENTER: [number, number] = [7.387, 48.252];

// Localité la plus attestée, utilisée comme point de départ de l'intro.
export const FOCUS_POINT = POINTS.reduce((a, b) => (b.confreries > a.confreries ? b : a));
