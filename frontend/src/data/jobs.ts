/**
 * Profils recherchés affichés sur /recrutement.
 * Contenu éditorial à ajuster par l'équipe RH (ajout, retrait ou modification d'un poste).
 */
export interface JobProfile {
  slug: string;
  title: string;
  pole: string;
  contract: string;
  location: string;
  summary: string;
  missions: string[];
}

export const JOB_PROFILES: JobProfile[] = [
  {
    slug: 'ingenieur-hydraulicien',
    title: 'Ingénieur hydraulicien',
    pole: 'Eau et hydraulique',
    contract: 'CDI',
    location: 'Abidjan, missions terrain',
    summary: 'Concevoir et suivre des forages, châteaux d\'eau et réseaux d\'adduction d\'eau potable.',
    missions: ['Études hydrogéologiques', 'Dimensionnement des réseaux', 'Suivi de chantier'],
  },
  {
    slug: 'technicien-solaire',
    title: 'Technicien en énergie solaire',
    pole: 'Énergie solaire',
    contract: 'CDI / CDD',
    location: 'Toute la Côte d\'Ivoire',
    summary: 'Installer et maintenir des systèmes de pompage solaire et des centrales photovoltaïques.',
    missions: ['Pose de panneaux et onduleurs', 'Mise en service', 'Maintenance préventive'],
  },
  {
    slug: 'conducteur-travaux-btp',
    title: 'Conducteur de travaux BTP',
    pole: 'BTP et génie civil',
    contract: 'CDI',
    location: 'Abidjan et intérieur du pays',
    summary: 'Piloter les chantiers de bâtiments, voiries et ouvrages de génie civil.',
    missions: ['Planification des travaux', 'Encadrement des équipes', 'Contrôle qualité et sécurité'],
  },
  {
    slug: 'technicien-agricole',
    title: 'Technicien agricole',
    pole: 'Agrotechnologies',
    contract: 'CDD',
    location: 'Sites agricoles partenaires',
    summary: 'Déployer des systèmes d\'irrigation et accompagner les exploitants.',
    missions: ['Installation goutte-à-goutte', 'Conseil aux exploitants', 'Suivi des cultures sous serre'],
  },
  {
    slug: 'stage',
    title: 'Stage ou alternance',
    pole: 'Tous les pôles',
    contract: 'Stage',
    location: 'Abidjan',
    summary: 'Étudiants en ingénierie, génie civil, agronomie ou énergie : rejoignez nos équipes projet.',
    missions: ['Appui aux études techniques', 'Participation aux chantiers', 'Rédaction de rapports'],
  },
];
