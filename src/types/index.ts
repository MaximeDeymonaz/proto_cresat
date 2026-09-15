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
