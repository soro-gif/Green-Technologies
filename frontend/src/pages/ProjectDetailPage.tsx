import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  ChevronLeft,
  FileText,
  Star,
} from 'lucide-react';
import { projectsApi } from '../api';
import type { Project } from '../types/models';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { getImageUrl, handleImageError } from '../utils/image';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        setLoading(true);
        setError(false);
        const res = await projectsApi.getBySlug(slug);
        setProject(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <ErrorState
          title="Projet introuvable"
          message="Le projet demandé n'existe pas ou n'est plus accessible."
          action={
            <Link to="/realisations">
              <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                Retour au portfolio
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-emerald-700">
            Accueil
          </Link>
          <span>/</span>
          <Link to="/realisations" className="hover:text-emerald-700">
            Réalisations
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{project.title}</span>
        </div>

        {/* Hero Card for Project */}
        <div className="bg-white rounded-3xl overflow-hidden mb-8 border border-slate-200/90 shadow-sm">
          {/* Visual Image Banner */}
          <div className="relative h-64 sm:h-96 w-full bg-slate-950 overflow-hidden">
            <img
              src={getImageUrl(project.image_url || project.main_image || project.image, project.slug || project.category?.slug)}
              alt={project.title}
              onError={(e) => handleImageError(e, project.slug || project.category?.slug)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="green" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  {project.category?.name || 'Projet Réalisé'}
                </Badge>
                {project.status_label && (
                  <span className="text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    {project.status_label}
                  </span>
                )}
              </div>

              {project.location && (
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>{project.location}, Côte d'Ivoire</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <h1 className="text-3xl sm:text-5xl font-semibold text-slate-900 font-['Outfit'] mb-6">
              {project.title}
            </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Maître d'Ouvrage</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                {project.client_name || 'Client Institutionnel'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prestation</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                {project.service?.title || 'Ingénierie globale'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Livraison</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                {project.completion_date
                  ? new Date(project.completion_date).toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric',
                  })
                  : 'Livré'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Garantie</p>
              <p className="text-sm sm:text-base font-bold text-emerald-700 mt-1">
                Garantie décennale
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content & Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 sm:p-10 space-y-6">
              <h2 className="text-2xl font-medium text-slate-900 font-['Outfit']">
                Présentation et objectifs du chantier
              </h2>
              <div className="text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </div>

              {project.results && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-3">
                    Impact et résultats obtenus
                  </h3>
                  <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-base text-emerald-950 leading-relaxed font-medium">
                    {project.results}
                  </div>
                </div>
              )}
            </Card>

            {/* Testimonials for this project */}
            {project.testimonials && project.testimonials.length > 0 && (
              <Card className="p-8 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                  Retour d'expérience client
                </h3>
                {project.testimonials.map((test) => (
                  <div key={test.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1 text-amber-400 mb-2.5">
                      {Array.from({ length: test.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 italic">"{test.content}"</p>
                    <p className="text-sm font-bold text-slate-900 mt-3">
                      {test.author_name} — {test.author_role} {test.company ? `(${test.company})` : ''}
                    </p>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 bg-slate-900 text-white border border-slate-800 space-y-5">
              <Badge variant="orange">Projet similaire</Badge>
              <h3 className="text-2xl font-bold font-['Outfit']">Un projet similaire en vue ?</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Nos ingénieurs réalisent des études de faisabilité et vous transmettent un devis chiffré sous 48h.
              </p>

              <Link to="/devis">
                <Button variant="accent" size="md" leftIcon={<FileText className="w-5 h-5" />} className="w-full font-bold shadow-lg text-base py-3">
                  Estimer mon projet
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
