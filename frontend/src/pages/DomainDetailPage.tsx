import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import { categoriesApi } from '../api';
import type { Category } from '../types/models';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { getImageUrl, handleImageError } from '../utils/image';

export function DomainDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        setLoading(true);
        setError(false);
        const res = await categoriesApi.getBySlug(slug);
        setCategory(res.data);
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

  if (error || !category) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <ErrorState
          title="Domaine introuvable"
          message="Le pôle d'expertise demandé n'existe pas ou n'est plus disponible."
          action={
            <Link to="/domaines">
              <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                Retour aux domaines
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const heroImage =
    category.slug === 'eau-hydraulique'
      ? '/Fontaine.png'
      : getImageUrl(category.image_url, category.slug);

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link to="/" className="hover:text-emerald-700">
            Accueil
          </Link>
          <span>/</span>
          <Link to="/domaines" className="hover:text-emerald-700">
            Nos domaines
          </Link>
          <span>/</span>
          <span className="text-slate-900">{category.name}</span>
        </div>

        {/* Hero Card with Background Image */}
        <div className="relative rounded-3xl overflow-hidden mb-12 shadow-xl border border-slate-800 bg-slate-950">
          <img
            src={heroImage}
            alt={category.name}
            onError={(e) => handleImageError(e, category.slug)}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />

          <div className="relative p-8 sm:p-12 lg:p-16 max-w-3xl space-y-5 text-white">
            <h1 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] text-white tracking-tight">
              {category.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {category.description}
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link to="/devis">
                <Button variant="accent" size="md" leftIcon={<FileText className="w-4 h-4" />}>
                  Devis pour ce domaine
                </Button>
              </Link>
              <Link to={`/realisations?category_slug=${category.slug}`}>
                <Button variant="outline-dark" size="md">
                  Voir les réalisations de ce pôle
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Services List inside Domain */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
              Prestations et solutions incluses
            </h2>
            <span className="text-sm font-semibold text-slate-500">
              {category.services?.length || 0} prestations disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.services && category.services.length > 0 ? (
              category.services.map((srv) => (
                <Card key={srv.id} hoverable className="overflow-hidden p-0 flex flex-col justify-between border-slate-200 group">
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={getImageUrl(srv.image_url || srv.image, srv.slug || category.slug)}
                      alt={srv.title}
                      onError={(e) => handleImageError(e, srv.slug || category.slug)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-2.5 group-hover:text-emerald-700 transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        {srv.summary || srv.description}
                      </p>
                      {srv.features && srv.features.length > 0 && (
                        <ul className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl mb-4 border border-slate-100">
                          {srv.features.map((feat, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex flex-col xs:flex-row gap-2.5 xs:items-center xs:justify-between border-t border-slate-100 pt-4 mt-2">
                      <Link
                        to={`/services/${srv.slug}`}
                        className="text-sm font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                      >
                        <span>Détails techniques</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to="/devis"
                        className="text-sm font-bold text-orange-600 hover:text-orange-700 inline-flex items-center"
                      >
                        Demander un devis
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 text-base">
                Aucune prestation enregistrée pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
