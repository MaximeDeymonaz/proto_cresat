import type { Confrerie, ConfrerieNature, Cote, Point } from '../types';

/**
 * ⚠️ Données de démonstration. Les confréries et les cotes ci-dessous sont
 * plausibles mais inventées : elles montrent la forme que prendra la fiche une
 * fois le dépouillement fait, elles ne référencent aucune pièce réelle.
 *
 * Le tirage est déterministe (graine = identifiant de la localité) : une même
 * localité affiche toujours la même liste d'un chargement à l'autre.
 */

// Vocables les plus courants dans les paroisses alsaciennes d'Ancien Régime.
const DEVOTIONS = [
  'du Saint-Sacrement',
  'du Rosaire',
  'de Sainte-Anne',
  'de Saint-Sébastien',
  'de la Sainte-Croix',
  'du Scapulaire',
  'de Saint-Joseph',
  'de la Bonne-Mort',
  'de Saint-Wendelin',
  'de Sainte-Barbe',
  'de Saint-Roch',
  'des Trépassés',
  'de Saint-Michel',
  'de Saint-Nicolas',
];

// Corporations qui entretenaient leur propre confrérie et son autel.
const METIERS = [
  'des tonneliers',
  'des boulangers',
  'des vignerons',
  'des tisserands',
  'des cordonniers',
  'des bouchers',
  'des maréchaux-ferrants',
  'des charpentiers',
  'des meuniers',
  'des drapiers',
  'des orfèvres',
  'des taillandiers',
];

const SIEGES = [
  'Église paroissiale Saint-Georges',
  'Église paroissiale Saint-Martin',
  'Chapelle Notre-Dame',
  'Église Saint-Étienne',
  'Chapelle de l’hôpital',
  'Église des Dominicains',
  'Église Saint-Pierre',
  'Chapelle Sainte-Catherine',
];

const TYPES_DOC: { intitule: string; support: string; analyse: string }[] = [
  {
    intitule: 'Statuts et règlements',
    support: '1 liasse (12 pièces, parchemin et papier)',
    analyse:
      'Statuts fondateurs, confirmations successives par le Magistrat, tarif des droits d’entrée et obligations des confrères envers les défunts.',
  },
  {
    intitule: 'Registre des confrères',
    support: '1 registre relié, 184 feuillets',
    analyse:
      'Réceptions annuelles, mention des maîtres et des veuves admises, radiations pour défaut de cotisation.',
  },
  {
    intitule: 'Livre de comptes',
    support: '1 registre, 96 feuillets',
    analyse:
      'Recettes des quêtes et des rentes, dépenses de cire, d’ornements et de messes ; comptes arrêtés chaque année à la Saint-Martin.',
  },
  {
    intitule: 'Fondations de messes',
    support: '1 liasse (23 pièces)',
    analyse:
      'Actes de fondation d’anniversaires, constitutions de rentes et legs testamentaires au profit de la confrérie.',
  },
  {
    intitule: 'Inventaire du mobilier et des ornements',
    support: '3 cahiers',
    analyse:
      'Description de l’autel, des bannières, chandeliers et vêtements liturgiques ; états dressés lors des changements de prévôt.',
  },
  {
    intitule: 'Procès-verbaux de visite',
    support: '1 liasse (8 pièces)',
    analyse:
      'Visites canoniques, observations sur la tenue des comptes et rappels à l’ordre concernant les banquets de confrérie.',
  },
  {
    intitule: 'Requêtes et procédures',
    support: '1 liasse (17 pièces)',
    analyse:
      'Différends avec la paroisse sur le droit de bannière et la place aux processions ; requêtes adressées à l’Intendance.',
  },
];

const DEPOTS = {
  'Bas-Rhin': { depot: 'ADBR', depotNom: 'Archives départementales du Bas-Rhin' },
  'Haut-Rhin': { depot: 'ADHR', depotNom: 'Archives départementales du Haut-Rhin' },
} as const;

const SERIE = 'Série E — Corporations, métiers et confréries (avant 1790)';

/** FNV-1a : une graine stable à partir de l'identifiant de la localité. */
function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 : suffisant pour un tirage reproductible, sans dépendance. */
function makeRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(pool: readonly T[], rand: () => number): T {
  return pool[Math.floor(rand() * pool.length)];
}

/** Tire `n` éléments distincts (Fisher-Yates partiel). */
function sample<T>(pool: readonly T[], n: number, rand: () => number): T[] {
  const copy = [...pool];
  const out: T[] = [];
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const j = i + Math.floor(rand() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
    out.push(copy[i]);
  }
  return out;
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Au-delà, la liste cesse d'être un exemple lisible. */
export const MAX_EXEMPLES = 6;

function buildCote(point: Point, rand: () => number): Cote {
  const { depot, depotNom } = DEPOTS[point.departement as keyof typeof DEPOTS] ?? DEPOTS['Bas-Rhin'];
  const doc = pick(TYPES_DOC, rand);
  const debut = 1580 + Math.floor(rand() * 150);
  const fin = Math.min(1790, debut + 15 + Math.floor(rand() * 90));
  return {
    depot,
    depotNom,
    cote: `${1 + Math.floor(rand() * 3)} E ${12 + Math.floor(rand() * 500)}/${1 + Math.floor(rand() * 24)}`,
    serie: SERIE,
    intitule: doc.intitule,
    dates: `${debut}–${fin}`,
    support: doc.support,
    analyse: doc.analyse,
  };
}

/**
 * Échantillon de confréries pour une localité, plafonné à MAX_EXEMPLES.
 * Les confréries de dévotion dominent, comme dans les fonds conservés.
 */
export function confreriesFor(point: Point): Confrerie[] {
  const rand = makeRandom(seedFrom(point.id));
  const total = Math.min(point.confreries, MAX_EXEMPLES);
  const nbMetiers = Math.min(Math.floor(total / 3), METIERS.length);
  const noms: { nom: string; nature: ConfrerieNature }[] = [
    ...sample(DEVOTIONS, total - nbMetiers, rand).map(n => ({ nom: n, nature: 'devotion' as const })),
    ...sample(METIERS, nbMetiers, rand).map(n => ({ nom: n, nature: 'metier' as const })),
  ];

  return noms.map(({ nom, nature }) => ({
    id: `${point.id}-${slugify(nom)}`,
    nom: `Confrérie ${nom}`,
    nature,
    siege: pick(SIEGES, rand),
    fondation: 1580 + Math.floor(rand() * 170),
    cote: buildCote(point, rand),
  }));
}
