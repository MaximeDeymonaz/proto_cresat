export type PointCategory = 'siege' | 'bureau' | 'envoye' | 'client' | 'fournisseur';

export interface Point {
  id: string;
  ville: string;
  pays: string;
  cat: PointCategory;
  lat: number;
  lon: number;
  date: string;
  type: string;
  desig: string;
  qte: string;
  montant: string;
  corr: string;
  tome: string;
  folio: string;
  annee: string | number;
  note: string;
}

export interface CategoryInfo {
  label: string;
  color: string;
}

export type CatMap = Record<PointCategory, CategoryInfo>;

export interface MarkerPoint extends Point {
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  d: string;
}

export interface ReliefPoint {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export interface MapState {
  ready: boolean;
  error: boolean;
  w: number;
  h: number;
  landD: string;
  gratD: string;
  riversD: string;
  lakesD: string;
  markers: MarkerPoint[];
  conns: Connection[];
  relief: ReliefPoint[];
}
