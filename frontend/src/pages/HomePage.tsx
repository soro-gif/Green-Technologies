import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  MapPin,
  Calendar,
  Star,
  Phone,
} from 'lucide-react';
import { servicesApi, projectsApi, testimonialsApi, articlesApi, categoriesApi } from '../api';
import type { Service, Project, Testimonial, Article } from '../types/models';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getImageUrl, handleImageError } from '../utils/image';

/*
  Coupe de forage : le tuyau part de la pompe visible sur forage.jpg.
  PUMP_X est la position horizontale de la pompe dans la photo. L'image garde
  toute sa largeur et s'ancre en bas, donc ce repère reste valable à toute taille.
*/
const PUMP_X = '37%';

const strata = [
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
    link: 'text-white',
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
    link: 'text-slate-900',
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
    link: 'text-white',
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
    link: 'text-white',
  },
];

function StratumEdge({ color, raised = false }: { color: string; raised?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 24"
      preserveAspectRatio="none"
      className={`absolute left-0 w-full h-5 ${raised ? '-top-5' : 'top-0'}`}
    >
      <path
        fill={color}
        d={
          raised
            ? 'M0 24V14C180 4 320 18 520 12S860 2 1040 10 1320 18 1440 8V24Z'
            : 'M0 0V10C200 20 340 6 540 12S880 22 1060 12 1320 4 1440 14V0Z'
        }
      />
    </svg>
  );
}

export function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({
    projectsCount: 30,
    categoriesCount: 4,
    yearsWarranty: 10,
    responseHours: 48,
  });
  const pumpRef = useRef<HTMLDivElement>(null);
  const [pumpVisible, setPumpVisible] = useState(false);

  // Le tuyau ne descend que lorsque la pompe entre à l'écran
  useEffect(() => {
    const pump = pumpRef.current;
    if (!pump) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPumpVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(pump);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, projectsRes, testimonialsRes, articlesRes, categoriesRes, allProjectsRes] = await Promise.all([
          servicesApi.getFeatured().catch(() => ({ data: [] })),
          projectsApi.getFeatured().catch(() => ({ data: [] })),
          testimonialsApi.getFeatured().catch(() => ({ data: [] })),
          articlesApi.getPaginated({ per_page: 3 }).catch(() => ({ data: [] })),
          categoriesApi.getAll().catch(() => ({ data: [] })),
          projectsApi.getPaginated({ per_page: 1 }).catch(() => ({ meta: { total: 30 } })),
        ]);

        setFeaturedServices(servicesRes.data || []);
        setFeaturedProjects(projectsRes.data || []);
        setTestimonials(testimonialsRes.data || []);
        setRecentArticles(articlesRes.data || []);

        const totalProjects = (allProjectsRes as any)?.meta?.total;
        const totalCategories = (categoriesRes as any)?.data?.length;

        setStats({
          projectsCount: totalProjects && totalProjects > 30 ? totalProjects : 30,
          categoriesCount: totalCategories && totalCategories > 0 ? totalCategories : 4,
          yearsWarranty: 10,
          responseHours: 48,
        });
      } catch (err) {
        console.error('Error loading home data:', err);
      }
    }

    loadData();
  }, []);

  const keyFigures = [
    { value: `${stats.projectsCount}+`, label: 'projets livrés' },
    { value: `${stats.categoriesCount}`, label: 'pôles d\'expertise' },
    { value: `${stats.yearsWarranty} ans`, label: 'de garantie' },
    { value: `${stats.responseHours} h`, label: 'pour chiffrer votre projet' },
  ];

  return (
    <div className="relative w-full">
      {/* 1. HERO : le texte passe sur la photo à partir de 1280 px */}
      <section className="relative z-20 bg-slate-900 text-white xl:bg-transparent xl:absolute xl:inset-x-0 xl:top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 xl:pt-12 xl:pb-0">
          <div className="xl:max-w-[48vw] space-y-5">
            <h1 className="text-4xl sm:text-5xl xl:text-[clamp(3rem,4.2vw,4.5rem)] font-display font-extrabold tracking-tight leading-[1.04]">
              Du soleil à la nappe, des ouvrages qui durent.
            </h1>

            <p className="text-lg text-slate-100 leading-relaxed max-w-prose">
              GREEN TECHNOLOGIES BTP conçoit et réalise vos forages, centrales solaires, systèmes
              d'irrigation et bâtiments en Côte d'Ivoire, pour les collectivités, les entreprises
              et les particuliers.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link to="/devis">
                <Button
                  variant="accent"
                  size="lg"
                  leftIcon={<FileText className="w-5 h-5" />}
                  className="w-full sm:w-auto font-bold"
                >
                  Demander un devis
                </Button>
              </Link>
              <Link to="/realisations">
                <Button variant="outline-dark" size="lg" className="w-full sm:w-auto font-bold">
                  Voir nos réalisations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COUPE DE FORAGE : LES 4 PÔLES */}
      <section
        id="domaines"
        aria-labelledby="domaines-titre"
        className="relative [--photo-h:74.67vw] xl:[--photo-h:min(74.67vw,1000px)]"
      >
        <h2 id="domaines-titre" className="sr-only">
          Nos 4 pôles d'expertise
        </h2>

        <img
          src="/forage.jpg"
          alt="Pompe solaire, panneaux et château d'eau alimentant les robinets d'un village"
          width={1200}
          height={896}
          fetchPriority="high"
          className="w-full object-cover object-bottom h-[var(--photo-h)]"
        />

        {/* Voile limité à la zone du texte : le château d'eau reste lumineux */}
        <div aria-hidden="true" className="hero-veil hidden xl:block absolute inset-x-0 top-0 h-[var(--photo-h)]" />

        {/* Repère invisible posé sur la pompe : déclenche le tuyau */}
        <div
          ref={pumpRef}
          aria-hidden="true"
          className="absolute w-px h-px"
          style={{ left: PUMP_X, top: 'calc(var(--photo-h) - 6.3vw)' }}
        />

        {/* Tuyau : descend de la pompe de la photo jusqu'à la nappe */}
        <div
          aria-hidden="true"
          className={`bore-line hidden md:block absolute z-10 w-1.5 -ml-[3px] bg-white shadow-[0_0_0_1px_var(--color-slate-900)] ${
            pumpVisible ? 'is-drilling' : ''
          }`}
          style={{ left: PUMP_X, top: 'calc(var(--photo-h) - 6.3vw)', bottom: '3rem' }}
        />

        {strata.map((stratum, index) => (
          <div key={stratum.slug} className={`relative ${stratum.band}`}>
            {index === 0 ? (
              <StratumEdge color={stratum.edge} raised />
            ) : (
              <StratumEdge color={strata[index - 1].edge} />
            )}

            {/* Repère du pôle sur le tuyau */}
            <span
              aria-hidden="true"
              className="hidden md:block absolute z-20 top-14 w-4 h-4 -ml-2 rounded-full bg-orange-400 border-2 border-white"
              style={{ left: PUMP_X }}
            />

            <div className="md:grid md:grid-cols-[37%_1fr] py-12 lg:py-16 px-4 sm:px-6 md:px-0">
              <div className="md:pl-8 lg:pl-12 xl:pl-20 md:pr-8">
                <p className={`text-sm font-medium ${stratum.muted}`}>{stratum.layer}</p>
                <h3 className="text-3xl lg:text-4xl font-display font-extrabold tracking-tight mt-1">
                  {stratum.title}
                </h3>
              </div>

              <div className="mt-4 md:mt-0 md:pl-10 lg:pl-14 md:pr-8 lg:pr-12 xl:pr-20 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
                <div>
                  <p className="text-lg leading-relaxed max-w-prose">{stratum.desc}</p>
                  <ul className={`mt-3 text-sm leading-relaxed ${stratum.muted}`}>
                    {stratum.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link
                    to={`/domaines/${stratum.slug}`}
                    className={`inline-flex items-center gap-2 mt-4 font-bold underline underline-offset-4 ${stratum.link}`}
                  >
                    <span>Découvrir ce pôle</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <img
                  src={getImageUrl(stratum.image, stratum.slug)}
                  alt=""
                  loading="lazy"
                  onError={(e) => handleImageError(e, stratum.slug)}
                  className={`hidden lg:block w-full h-36 rounded-md ${
                    stratum.image.endsWith('.png') ? 'object-contain bg-white p-2' : 'object-cover'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CHIFFRES CLÉS */}
      <section aria-label="Chiffres clés" className="bg-slate-900 text-white py-10">
        <dl className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {keyFigures.map((figure) => (
            <div key={figure.label} className="flex flex-col-reverse">
              <dt className="text-sm text-slate-300 mt-0.5">{figure.label}</dt>
              <dd className="text-2xl sm:text-3xl font-display font-extrabold">{figure.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 3. SERVICES PHARES */}
      {featuredServices.length > 0 && (
        <section id="services" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl text-slate-900 font-display font-extrabold tracking-tight">
                  Nos prestations les plus demandées
                </h2>
                <p className="text-lg text-slate-600 max-w-prose">
                  Chaque solution est dimensionnée par nos ingénieurs pour votre site.
                </p>
              </div>
              <Link to="/services">
                <Button variant="outline" size="md">
                  Voir tous les services
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <Card key={service.id} hoverable className="flex flex-col justify-between overflow-hidden p-0 bg-white">
                  <div>
                    <img
                      src={getImageUrl((service as any).image_url || service.image, service.slug || service.category?.slug, service.slug || service.id || service.title)}
                      alt={service.title}
                      loading="lazy"
                      className="h-44 w-full object-cover bg-slate-100"
                      onError={(e) => handleImageError(e, service.slug || service.category?.slug, service.slug || service.id || service.title)}
                    />

                    <div className="p-6">
                      <p className="text-sm text-slate-500 mb-1">{service.category?.name || 'Prestation'}</p>
                      <h3 className="text-xl font-bold text-slate-900 font-display mb-2.5">
                        {service.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed line-clamp-3">
                        {service.summary || service.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 flex items-center justify-between gap-4">
                    <Link
                      to={`/services/${service.slug}`}
                      className="font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
                    >
                      Voir le détail
                    </Link>
                    <Link to="/devis" className="font-bold text-slate-700 hover:text-slate-900">
                      Demander un devis
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. RÉALISATIONS PHARES */}
      {featuredProjects.length > 0 && (
        <section id="realisations" className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl text-white font-display font-extrabold tracking-tight">
                  Nos réalisations sur le terrain
                </h2>
                <p className="text-lg text-slate-300 max-w-prose">
                  Des chantiers livrés à travers la Côte d'Ivoire.
                </p>
              </div>
              <Link to="/realisations">
                <Button variant="outline-dark" size="md">
                  Voir tous les projets
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {featuredProjects.map((project, index) => (
                <article key={project.id} className={index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}>
                  <img
                    src={getImageUrl((project as any).image_url || project.image, project.slug || project.category?.slug, project.slug || project.id || project.title)}
                    alt={project.title}
                    loading="lazy"
                    className={`w-full object-cover rounded-md bg-slate-800 ${index === 0 ? 'h-56 lg:h-[420px]' : 'h-48'}`}
                    onError={(e) => handleImageError(e, project.slug || project.category?.slug, project.slug || project.id || project.title)}
                  />

                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300 mb-1.5">
                      <span>{project.category?.name || 'Projet'}</span>
                      {project.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          {project.location}
                        </span>
                      )}
                      {project.completion_date && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(project.completion_date).getFullYear()}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-display font-bold text-white leading-snug mb-2 ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                      <Link to={`/realisations/${project.slug}`} className="hover:underline underline-offset-4">
                        {project.title}
                      </Link>
                    </h3>

                    <p className="text-slate-300 line-clamp-3 leading-relaxed max-w-prose">
                      {project.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TÉMOIGNAGES */}
      {testimonials.length > 0 && (
        <section id="temoignages" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl text-slate-900 font-display font-extrabold tracking-tight mb-10">
              Ce que disent nos clients
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {testimonials.map((t) => (
                <figure key={t.id} className="flex flex-col justify-between border-t-2 border-emerald-600 pt-5">
                  <div>
                    <div
                      className="flex items-center gap-1 text-orange-500 mb-3"
                      role="img"
                      aria-label={`Note : ${t.rating || 5} sur 5`}
                    >
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-slate-800 leading-relaxed mb-5">
                      {t.content}
                    </blockquote>
                  </div>

                  <figcaption>
                    <p className="font-bold text-slate-900">{t.author_name}</p>
                    <p className="text-sm text-slate-600">
                      {t.author_role}
                      {t.company ? `, ${t.company}` : ''}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. ACTUALITÉS & PUBLICATIONS */}
      {recentArticles.length > 0 && (
        <section id="actualites" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl text-slate-900 font-display font-extrabold tracking-tight">
                  Dernières publications
                </h2>
                <p className="text-lg text-slate-600 max-w-prose">
                  Les retours techniques de nos équipes.
                </p>
              </div>
              <Link to="/actualites">
                <Button variant="outline" size="md">
                  Voir tous les articles
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map((art) => (
                <article key={art.id}>
                  <img
                    src={getImageUrl(art.cover_image, art.category?.slug || art.category?.name, art.slug || art.id || art.title)}
                    alt={art.title}
                    loading="lazy"
                    className="h-48 w-full object-cover rounded-md bg-slate-100"
                    onError={(e) => handleImageError(e, art.category?.slug || art.category?.name, art.slug || art.id || art.title)}
                  />

                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-x-4 text-sm text-slate-500 mb-1.5">
                      {art.category?.name && <span>{art.category.name}</span>}
                      {art.published_at && (
                        <span>{new Date(art.published_at).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 font-display mb-2 line-clamp-2">
                      <Link to={`/actualites/${art.slug}`} className="hover:underline underline-offset-4">
                        {art.title}
                      </Link>
                    </h3>

                    <p className="text-slate-600 leading-relaxed line-clamp-2">
                      {art.excerpt || art.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. APPEL À L'ACTION */}
      <section className="bg-orange-400 text-slate-950 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
              Vous avez un projet en Côte d'Ivoire ?
            </h2>
            <p className="text-lg max-w-prose leading-relaxed">
              Envoyez-nous votre cahier des charges. Vous recevez une proposition technique et
              financière sous 48 h, sans frais.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link to="/devis">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold">
                Demander un devis
              </Button>
            </Link>
            <a
              href="tel:+2252722584016"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-slate-950 font-bold hover:bg-orange-300 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>Appeler le +225 27 22 58 40 16</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
