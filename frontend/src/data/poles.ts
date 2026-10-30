/**
 * Les 4 pôles, dans l'ordre de la coupe de forage : du terrain vers la nappe.
 * Chaque pôle porte la couleur de sa couche, reprise sur l'accueil et sur /domaines.
 */
export interface Pole {
  title: string;
  slug: string;
  layer: string;
  image: string;
  desc: string;
  features: string[];
  band: string;
  muted: string;
  edge: string;
}

export const POLES: Pole[] = [
  {
    title: 'Énergie solaire',
    slug: 'energie-solaire',
    layer: 'Sur le terrain',
    image: '/solaire.jpg',
    desc: 'Centrales photovoltaïques, pompage solaire autonome, éclairage public et kits pour sites isolés.',
    features: ['Pompage solaire immergé', 'Micro-centrales hybrides', 'Onduleurs industriels'],
    band: 'bg-emerald-600 text-white',
    muted: 'text-emerald-100',
    edge: 'var(--color-emerald-600)',
  },
  {
    title: 'Agrotechnologies',
    slug: 'agrotechnologies',
    layer: 'Dans la terre arable',
    image: '/agriculture.jpg',
    desc: 'Irrigation goutte-à-goutte, serres automatisées, mécanisation agricole et valorisation des sols.',
    features: ['Irrigation goutte-à-goutte', 'Serres climatisées', 'Automatisation hydrique'],
    band: 'bg-pousse text-slate-900',
    muted: 'text-slate-700',
    edge: 'var(--color-pousse)',
  },
  {
    title: 'BTP et génie civil',
    slug: 'btp-genie-civil',
    layer: 'Dans la latérite',
    image: '/btp.jpg',
    desc: 'Bâtiments professionnels et industriels, voiries, pistes rurales et ouvrages d\'art.',
    features: ['Ouvrages béton armé', 'Génie civil durable', 'Pistes de désenclavement'],
    band: 'bg-laterite text-white',
    muted: 'text-orange-100',
    edge: 'var(--color-laterite)',
  },
  {
    title: 'Eau et hydraulique',
    slug: 'eau-hydraulique',
    layer: 'Dans la nappe',
    image: '/Fontaine.png',
    desc: 'Forages industriels et villageois, châteaux d\'eau, réseaux d\'adduction d\'eau potable et assainissement.',
    features: ['Forages gros débit', 'Châteaux d\'eau jusqu\'à 200 m³', 'Réseaux certifiés OMS'],
    band: 'bg-sky-900 text-white',
    muted: 'text-sky-100',
    edge: 'var(--color-sky-900)',
  },
];

export function getPole(slug?: string | null): Pole | undefined {
  return POLES.find((pole) => pole.slug === slug);
}
