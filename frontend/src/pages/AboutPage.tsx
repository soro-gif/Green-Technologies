import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import {
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  Sliders,
  HeartHandshake,
  Leaf,
  ArrowRight,
  FileText,
  Mail,
  Cpu,
  TrendingUp,
  Truck,
  FolderGit2,
  Wrench,
  Settings,
} from 'lucide-react';
import { Card } from '../components/ui/Card';

export function AboutPage() {
  useEffect(() => {
    // SEO Title & Meta Description
    document.title = 'À propos de Green Technologies | Solutions techniques';
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      "Découvrez Green Technologies, son expertise, sa mission, sa vision et ses solutions dans les domaines de l'eau, de l'énergie, de l'agriculture et des infrastructures."
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const businessUnits = [
    {
      id: 'eau',
      name: 'GREEN EAU',
      domain: 'Eau & hydraulique',
      desc: "Solutions de traitement, purification, distribution et gestion de l'eau.",
      slug: 'eau-hydraulique',
      color: 'from-sky-500 to-blue-600',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      image: '/Fontaine.png',
    },
    {
      id: 'energy',
      name: 'GREEN ENERGY',
      domain: 'Énergie',
      desc: 'Solutions énergétiques et technologies basées notamment sur les énergies renouvelables.',
      slug: 'energie-solaire',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      image: '/solaire.jpg',
    },
    {
      id: 'agrotech',
      name: 'GREEN AGROTECH',
      domain: 'Agriculture',
      desc: 'Solutions technologiques destinées à moderniser et améliorer les activités agricoles.',
      slug: 'agrotechnologies',
      color: 'from-emerald-500 to-green-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      image: '/agriculture.jpg',
    },
    {
      id: 'btp',
      name: 'GREEN BTP & INFRASTRUCTURES',
      domain: 'BTP & génie civil',
      desc: "Solutions techniques pour les projets de construction, d'aménagement et d'infrastructures.",
      slug: 'btp-genie-civil',
      color: 'from-slate-600 to-slate-800',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      image: '/btp.jpg',
    },
  ];

  const missionSteps = [
    {
      step: '01',
      title: 'Analyse',
      desc: 'Comprendre les besoins, objectifs et contraintes du projet.',
    },
    {
      step: '02',
      title: 'Étude',
      desc: 'Évaluer les différentes possibilités techniques.',
    },
    {
      step: '03',
      title: 'Dimensionnement',
      desc: 'Déterminer une solution adaptée aux besoins du projet.',
    },
    {
      step: '04',
      title: 'Fourniture',
      desc: 'Sélectionner et fournir les équipements et solutions nécessaires.',
    },
    {
      step: '05',
      title: 'Installation',
      desc: 'Assurer la mise en œuvre des solutions sur le terrain.',
    },
    {
      step: '06',
      title: 'Mise en service',
      desc: 'Vérifier le fonctionnement et assurer la mise en service.',
    },
    {
      step: '07',
      title: 'Maintenance',
      desc: 'Accompagner le client dans la durée.',
    },
  ];

  const values = [
    {
      num: '01',
      title: 'EXPERTISE',
      desc: 'Une maîtrise technique au service de solutions adaptées.',
      icon: ShieldCheck,
    },
    {
      num: '02',
      title: 'FIABILITÉ',
      desc: 'Des solutions pensées pour répondre durablement aux exigences de nos clients.',
      icon: CheckCircle2,
    },
    {
      num: '03',
      title: 'INNOVATION UTILE',
      desc: 'Nous privilégions les technologies qui apportent une réelle valeur opérationnelle.',
      icon: Lightbulb,
    },
    {
      num: '04',
      title: 'ADAPTATION',
      desc: 'Chaque projet est étudié selon son contexte, ses contraintes et ses objectifs.',
      icon: Sliders,
    },
    {
      num: '05',
      title: 'ENGAGEMENT',
      desc: 'Nous nous impliquons à chaque étape pour assurer la réussite du projet.',
      icon: HeartHandshake,
    },
    {
      num: '06',
      title: 'DURABILITÉ',
      desc: 'Nous recherchons des solutions responsables et pensées pour le long terme.',
      icon: Leaf,
    },
  ];

  const transversalFunctions = [
    { name: 'INGÉNIERIE', icon: Cpu, desc: 'Études techniques & dimensionnement' },
    { name: 'DÉVELOPPEMENT COMMERCIAL', icon: TrendingUp, desc: 'Accompagnement & relation client' },
    { name: 'APPROVISIONNEMENT', icon: Truck, desc: 'Sourcing & logistique matérielle' },
    { name: 'GESTION DE PROJETS', icon: FolderGit2, desc: 'Pilotage opérationnel & jalons' },
    { name: 'INSTALLATION', icon: Wrench, desc: 'Déploiement sur site & intégration' },
    { name: 'MAINTENANCE', icon: Settings, desc: 'Suivi technique & pérennité' },
  ];

  const engagements = [
    {
      num: '01',
      title: 'COMPRENDRE VOTRE BESOIN',
      desc: 'Analyser précisément vos objectifs, contraintes et attentes.',
    },
    {
      num: '02',
      title: 'CONCEVOIR LA BONNE SOLUTION',
      desc: 'Étudier et dimensionner une solution adaptée à votre projet.',
    },
    {
      num: '03',
      title: 'ASSURER SA MISE EN ŒUVRE',
      desc: 'Fournir, installer et mettre en service les équipements et solutions.',
    },
    {
      num: '04',
      title: 'VOUS ACCOMPAGNER DANS LA DURÉE',
      desc: "Assurer le suivi, la maintenance et l'assistance nécessaires.",
    },
  ];

  return (
    <div className="w-full bg-white text-slate-800">
      {/* ========================================================================= */}
      {/* 1. EN-TÊTE INSTITUTIONNEL COMPACT (Pas de grand hero landing page)        */}
      {/* ========================================================================= */}
      <PageHeader
        title="À propos de Green Technologies"
        description="Découvrez notre expertise, notre vision et notre engagement pour des solutions techniques fiables et durables."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'À propos' }]}
      />

      {/* ========================================================================= */}
      {/* 2. SECTION PRÉSENTATION (2 Colonnes)                                      */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Colonne Gauche : Texte institutionnel */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight leading-snug">
                Un pôle de solutions techniques intégrées
              </h2>

              <p className="text-lg text-slate-700 leading-relaxed">
                GREEN TECHNOLOGIES est un pôle de solutions techniques spécialisées. Nous concevons, fournissons et intégrons des solutions pour l'eau, l'énergie, l'agriculture et les infrastructures, en accompagnant nos clients de l'étude à la maintenance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-emerald-700 font-semibold text-sm font-display mb-1">
                    Accompagnement 360°
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    De la phase d'étude préliminaire jusqu'au suivi et maintenance dans la durée.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-emerald-700 font-semibold text-sm font-display mb-1">
                    Multi-sectoriel
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Synergie éprouvée entre eau, énergie solaire, agrotechnologies et BTP.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-emerald-700 font-semibold text-sm font-display mb-1">
                    Rigueur technique
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Dimensionnement rigoureux et conformité aux standards internationaux.
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Visuel épuré et professionnel */}
            <div className="lg:col-span-5">
              <div className="relative rounded-lg overflow-hidden border border-slate-200 h-[320px] sm:h-[380px] bg-slate-100">
                <img
                  src="/solaire.jpg"
                  alt="Green Technologies ingénierie et solutions durables"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION NOTRE MISSION (Processus en 7 étapes)                          */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight">
              Transformer les besoins et contraintes techniques en solutions concrètes, fiables et adaptées.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-prose">
              Nous accompagnons chaque projet à travers une approche complète : analyse, étude, dimensionnement, fourniture, installation, mise en service et maintenance.
            </p>
          </div>

          {/* Processus interactif 7 étapes */}
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {missionSteps.map((s) => (
              <li key={s.step} className="reveal bg-white rounded-md p-5 border border-slate-200">
                <span className="block text-2xl font-bold font-display text-emerald-700">{s.step}</span>
                <h3 className="text-lg font-bold text-slate-900 font-display mt-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION NOTRE VISION                                                   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight leading-snug">
              Contribuer au développement de projets plus performants, autonomes et durables.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-prose">
              Notre ambition est de mettre les technologies et l'expertise technique au service d'une meilleure gestion de l'eau, de l'énergie, de la production agricole et des infrastructures.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION NOTRE EXPERTISE (4 Pôles / Business Units)                     */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight">
              Quatre pôles complémentaires pour répondre aux besoins techniques de nos clients
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Une offre structurée pour accompagner les décideurs publics, industriels, promoteurs et exploitants agricoles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessUnits.map((bu) => (
              <Card
                key={bu.id}
                hoverable
                className="bg-white border border-slate-200 rounded-md p-6 flex flex-col justify-between space-y-6 group hover:border-emerald-500 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${bu.badgeColor}`}>
                      {bu.domain}
                    </span>
                  </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 font-display group-hover:text-emerald-800 transition-colors">
                        {bu.name}
                      </h3>
                      <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                        {bu.domain}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {bu.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link
                      to={`/domaines/${bu.slug}`}
                      className="inline-flex items-center gap-1.5 py-2 -my-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
                    >
                      <span>Découvrir le pôle</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION NOS VALEURS (6 Cartes)                                         */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight">
              Les principes qui guident notre manière de travailler
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Des engagements éthiques et professionnels appliqués à chacun de nos chantiers et collaborations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.num}
                  className="bg-white rounded-md p-6 border border-slate-200 hover:border-emerald-500 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold font-display text-slate-400">
                        {v.num}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 font-display">
                      {v.num} — {v.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {v.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION NOTRE ORGANISATION (Diagramme d'intégration)                   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight">
              Une coordination intégrée au service de chaque projet
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Quatre Business Units spécialisées s'appuient sur des fonctions transversales en ingénierie, développement commercial, approvisionnement, gestion de projets, installation et maintenance. Cette organisation nous permet de coordonner les compétences nécessaires et d'accompagner chaque projet de manière intégrée.
            </p>
          </div>

          {/* Visual Architecture Diagram */}
          <div className="bg-slate-900 text-white rounded-lg p-6 sm:p-10 border border-slate-800 space-y-8">
            {/* 1. Level: 4 Business Units */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 font-display">
                  4 Business Units Spécialisées
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-md bg-slate-800/80 border border-slate-700/80">
                  <p className="text-sm text-sky-400 font-medium">Pôle Eau</p>
                  <p className="text-sm font-semibold text-white font-display mt-0.5">GREEN EAU</p>
                </div>
                <div className="p-4 rounded-md bg-slate-800/80 border border-slate-700/80">
                  <p className="text-sm text-amber-400 font-medium">Pôle Énergie</p>
                  <p className="text-sm font-semibold text-white font-display mt-0.5">GREEN ENERGY</p>
                </div>
                <div className="p-4 rounded-md bg-slate-800/80 border border-slate-700/80">
                  <p className="text-sm text-emerald-400 font-medium">Pôle Agriculture</p>
                  <p className="text-sm font-semibold text-white font-display mt-0.5">GREEN AGROTECH</p>
                </div>
                <div className="p-4 rounded-md bg-slate-800/80 border border-slate-700/80">
                  <p className="text-sm text-slate-400 font-medium">Pôle BTP</p>
                  <p className="text-sm font-semibold text-white font-display mt-0.5">GREEN BTP & INFRASTRUCTURES</p>
                </div>
              </div>
            </div>



            {/* 2. Level: Fonctions Transversales */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-xs font-bold text-sky-400 font-display">
                  Fonctions Transversales d'Excellence
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {transversalFunctions.map((fn) => {
                  const Icon = fn.icon;
                  return (
                    <div
                      key={fn.name}
                      className="p-3.5 rounded-md bg-slate-800/50 border border-slate-700/50 text-center flex flex-col items-center justify-center space-y-2 hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-700/60 text-emerald-400 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-semibold text-slate-200 font-display tracking-wide">
                        {fn.name}
                      </p>
                      <p className="text-sm text-slate-400 leading-tight">
                        {fn.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SECTION NOTRE ENGAGEMENT (4 Piliers)                                    */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight">
              « Comprendre votre besoin. Concevoir la bonne solution. Assurer sa mise en œuvre. Vous accompagner dans la durée. »
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagements.map((eng) => (
              <div
                key={eng.num}
                className="bg-white rounded-md p-6 border border-slate-200 hover:border-emerald-500 transition-colors flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <span className="text-2xl font-bold font-display text-emerald-700">
                    {eng.num}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 font-display group-hover:text-emerald-800 transition-colors">
                    {eng.title}
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {eng.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. SECTION CTA FINAL                                                      */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight">
            Votre projet mérite une solution adaptée.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-prose">
            Vous avez un projet dans le domaine de l'eau, de l'énergie, de l'agriculture ou des infrastructures ? Parlons de votre besoin et construisons ensemble une solution adaptée.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/devis"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Parler de mon projet</span>
            </Link>

            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg border border-slate-700 transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Nous contacter</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
