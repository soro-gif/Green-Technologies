import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  MapPin,
  Calendar,
  Star,
} from 'lucide-react';
import { servicesApi, projectsApi, testimonialsApi, articlesApi, categoriesApi } from '../api';
import type { Service, Project, Testimonial, Article } from '../types/models';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { getImageUrl, handleImageError } from '../utils/image';

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

  const domains = [
    {
      title: 'Eau et hydraulique',
      slug: 'eau-hydraulique',
      image: '/Fontaine.png',
      tagline: 'Accès durable à l\'eau potable',
      desc: 'Forages industriels et villageois, châteaux d\'eau métalliques et béton, réseaux d\'adduction d\'eau potable (AEP) et assainissement.',
      features: ['Forages gros débit', 'Châteaux d\'eau jusqu\'à 200m³', 'Réseaux certifiés OMS'],
    },
    {
      title: 'Énergie solaire',
      slug: 'energie-solaire',
      image: '/solaire.jpg',
      tagline: 'Transition énergétique et pompage',
      desc: 'Centrales solaires photovoltaïques, systèmes de pompage solaire autonome, éclairage public solaire et kits solaires pour sites isolés.',
      features: ['Pompage solaire immergé', 'Micro-centrales hybrides', 'Onduleurs industriels'],
    },
    {
      title: 'Agrotechnologies',
      slug: 'agrotechnologies',
      image: '/agriculture.jpg',
      tagline: 'Agriculture moderne et productive',
      desc: 'Systèmes d\'irrigation goutte-à-goutte, serres automatisées, mécanisation agricole et valorisation agrotechnologique des sols.',
      features: ['Irrigation goutte-à-goutte', 'Serres climatisées', 'Automatisation hydrique'],
    },
    {
      title: 'BTP et génie civil',
      slug: 'btp-genie-civil',
      image: '/btp.jpg',
      tagline: 'Constructions durables et infrastructures',
      desc: 'Bâtiments professionnels et industriels, voiries, pistes rurales, ouvrages d\'art et génie civil écoresponsable.',
      features: ['Ouvrages béton armé', 'Génie civil durable', 'Pistes de désenclavement'],
    },
  ];

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="bg-slate-950 text-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* LEFT COLUMN: Texts & CTAs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-['Outfit'] tracking-tight leading-[1.12] text-white">
                Bâtir l'avenir par l'eau, l'énergie et le génie civil
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                GREEN TECHNOLOGIES BTP déploie des solutions techniques de pointe en adduction d'eau potable,
                centrales solaires, agrotechnologies et construction durable pour les collectivités,
                entreprises et particuliers.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link to="/devis">
                  <Button
                    variant="accent"
                    size="lg"
                    leftIcon={<FileText className="w-5 h-5" />}
                    className="w-full sm:w-auto font-bold shadow-lg shadow-emerald-700/20 text-base"
                  >
                    Demander un devis
                  </Button>
                </Link>
                <Link to="/realisations">
                  <Button
                    variant="outline-dark"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto font-bold border-slate-700 hover:bg-slate-800 text-slate-200 text-base"
                  >
                    Découvrir nos réalisations
                  </Button>
                </Link>
              </div>

              {/* Key Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-slate-800/80">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-300 group">
                  <div className="text-3xl font-bold text-emerald-400 font-['Outfit'] group-hover:scale-105 transition-transform origin-left">
                    <AnimatedCounter end={stats.projectsCount} suffix="+" duration={1600} />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Projets livrés</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900 transition-all duration-300 group">
                  <div className="text-3xl font-bold text-sky-400 font-['Outfit'] group-hover:scale-105 transition-transform origin-left">
                    <AnimatedCounter end={stats.categoriesCount} duration={1200} />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Pôles d'expertise</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 hover:bg-slate-900 transition-all duration-300 group">
                  <div className="text-3xl font-bold text-orange-400 font-['Outfit'] group-hover:scale-105 transition-transform origin-left">
                    <AnimatedCounter end={stats.yearsWarranty} suffix=" ans" duration={1400} />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Garantie</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-lime-500/40 hover:bg-slate-900 transition-all duration-300 group">
                  <div className="text-3xl font-bold text-lime-400 font-['Outfit'] group-hover:scale-105 transition-transform origin-left">
                    <AnimatedCounter end={stats.responseHours} suffix="h" duration={1500} />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Délai de chiffrage</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Single Hero Image from public folder (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl p-2">
                <img
                  src="/Fontaine.png"
                  alt="GREEN TECHNOLOGIES BTP"
                  className="w-full h-80 sm:h-96 lg:h-[440px] object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LES 4 PÔLES D'EXPERTISE */}
      <section id="domaines" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="green">Solutions clés en main</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
              Nos 4 pôles d'excellence
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Une synergie complète entre maîtrise hydraulique, énergie propre, productivité agricole et solidité des ouvrages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((dom) => (
              <Card
                key={dom.slug}
                hoverable
                className="flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden p-0 group"
              >
                <div>
                  <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={getImageUrl(dom.image, dom.slug)}
                      alt={dom.title}
                      onError={(e) => handleImageError(e, dom.slug)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-1">
                      {dom.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-700 mb-2">{dom.tagline}</p>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{dom.desc}</p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <Link
                    to={`/domaines/${dom.slug}`}
                    className="inline-flex items-center justify-between w-full text-sm font-bold text-emerald-800 hover:text-emerald-900 pt-3 border-t border-slate-100"
                  >
                    <span>Découvrir le pôle</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SERVICES PHARES */}
      {featuredServices.length > 0 && (
        <section id="services" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div className="space-y-2">
                <Badge variant="blue">Catalogue technique</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                  Nos prestations populaires
                </h2>
                <p className="text-base sm:text-lg text-slate-600">
                  Des solutions techniques dimensionnées par nos ingénieurs certifiés.
                </p>
              </div>
              <Link to="/services">
                <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Voir tous les services
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <Card key={service.id} hoverable className="flex flex-col justify-between overflow-hidden p-0 border-slate-200 group bg-white shadow-xs hover:shadow-md transition-all">
                  <div>
                    <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={getImageUrl((service as any).image_url || service.image, service.slug || service.category?.slug)}
                        alt={service.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, service.slug || service.category?.slug)}
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {service.category?.name || 'Prestation'}
                      </span>
                    </div>

                    <div className="p-6">
                      <h4 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-2.5">
                        {service.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {service.summary || service.description}
                      </p>
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                          {service.features.slice(0, 3).map((feat, i) => (
                            <div key={i} className="text-sm text-slate-700 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/services/${service.slug}`}
                      className="text-sm font-bold text-emerald-800 hover:text-emerald-900"
                    >
                      Détails techniques →
                    </Link>
                    <Link
                      to="/devis"
                      className="text-sm font-bold text-orange-600 hover:text-orange-700"
                    >
                      Devis express
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
        <section id="realisations" className="py-20 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div className="space-y-2">
                <Badge variant="orange">Chantiers récents</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight">
                  Nos réalisations sur le terrain
                </h2>
                <p className="text-base sm:text-lg text-slate-400">
                  Découvrez les chantiers livrés avec succès à travers la Côte d'Ivoire.
                </p>
              </div>
              <Link to="/realisations">
                <Button
                  variant="outline-dark"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Voir tous les projets
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="h-48 w-full overflow-hidden bg-slate-900 relative">
                      <img
                        src={getImageUrl((project as any).image_url || project.image, project.slug || project.category?.slug)}
                        alt={project.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, project.slug || project.category?.slug)}
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {project.category?.name || 'Projet'}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {project.location && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 font-medium">
                            <MapPin className="w-4 h-4 text-orange-400" />
                            <span>{project.location}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-xl font-bold text-white font-['Outfit'] mb-2.5">
                        {project.title}
                      </h4>

                      <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed mb-4">
                        {project.description}
                      </p>

                      {project.client_name && (
                        <div className="text-sm text-slate-400 bg-slate-900 p-3 rounded-xl mb-4 border border-slate-700/60">
                          <span className="font-semibold text-slate-200">Client / maître d'ouvrage :</span>{' '}
                          {project.client_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-900 border-t border-slate-700 flex items-center justify-between">
                    <Link
                      to={`/realisations/${project.slug}`}
                      className="text-sm font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5"
                    >
                      <span>Fiche projet</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {project.completion_date && (
                      <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(project.completion_date).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TÉMOIGNAGES */}
      {testimonials.length > 0 && (
        <section id="temoignages" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <Badge variant="green">Confiance et satisfaction</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                Ils nous font confiance
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Les retours d'expérience de nos clients publics, industriels et agricoles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.id} className="flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed mb-6">
                      "{t.content}"
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                      {t.author_name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{t.author_name}</h5>
                      <p className="text-xs sm:text-sm text-slate-500">
                        {t.author_role} {t.company ? `• ${t.company}` : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. ACTUALITÉS & PUBLICATIONS */}
      {recentArticles.length > 0 && (
        <section id="actualites" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <Badge variant="green">Actualités et blog</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                  Dernières publications et études
                </h2>
                <p className="text-base sm:text-lg text-slate-600">
                  Découvrez les dernières innovations et retours techniques de nos équipes.
                </p>
              </div>
              <Link to="/actualites">
                <Button
                  variant="outline"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Voir tous les articles
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map((art) => (
                <Card
                  key={art.id}
                  hoverable
                  className="flex flex-col justify-between overflow-hidden p-0 border-slate-200 group bg-white shadow-xs hover:shadow-md transition-all"
                >
                  <div>
                    <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={getImageUrl(art.cover_image, art.category?.slug || art.category?.name)}
                        alt={art.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, art.category?.slug || art.category?.name)}
                      />
                      {art.category?.name && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                          {art.category.name}
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        {art.published_at && (
                          <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{new Date(art.published_at).toLocaleDateString('fr-FR')}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {art.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-2">
                        {art.excerpt || art.content}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/actualites/${art.slug}`}
                      className="text-sm font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 group/link"
                    >
                      <span>Lire l'article</span>
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. BANNIÈRE DEVIS EXPRESS */}
      <section className="bg-emerald-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-emerald-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3">
            <Badge variant="orange" className="text-white border-orange-500 bg-orange-600/30">
              Chiffrage gratuit en ligne
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold font-['Outfit']">
              Vous avez un projet en Côte d'Ivoire ?
            </h3>
            <p className="text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
              Notre bureau d'études analyse votre cahier des charges et vous transmet une proposition technique et financière détaillée sous 48h.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
            <Link to="/devis">
              <Button variant="accent" size="lg" className="font-bold text-base">
                Lancer mon devis en ligne
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline-dark"
                size="lg"
                className="font-bold border-emerald-700 bg-emerald-800 hover:bg-emerald-700 text-white text-base"
              >
                Nous appeler
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
