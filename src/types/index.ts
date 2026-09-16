export interface Point {
  id: string;
  ville: string;
  departement: string;
  lat: number;
  lon: number;
  confreries: number;
  certaine?: boolean;
  remarque?: string;
}

/** Une confrérie est soit une dévotion, soit rattachée à une corporation. */
export type ConfrerieNature = 'devotion' | 'metier';

/** Référence d'archive : ce qu'il faut pour retrouver la pièce en salle de lecture. */
export interface Cote {
  /** Sigle du dépôt, ex. « ADBR ». */
  depot: string;
  depotNom: string;
  /** Cote complète telle qu'on la demande, ex. « 1 E 47/3 ». */
  cote: string;
  serie: string;
  intitule: string;
  /** Dates extrêmes de l'unité documentaire. */
  dates: string;
  support: string;
  analyse: string;
}

export interface Confrerie {
  id: string;
  nom: string;
  nature: ConfrerieNature;
  /** Église ou chapelle de rattachement. */
  siege: string;
  /** Année de première mention. */
  fondation: number;
  cote: Cote;
}
