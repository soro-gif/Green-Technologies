import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  ChevronLeft,
  ShieldCheck,
  Award,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { servicesApi } from '../api';
import type { Service } from '../types/models';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { getImageUrl, handleImageError } from '../utils/image';

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        setLoading(true);
        setError(false);
        const res = await servicesApi.getBySlug(slug);
        setService(res.data);
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

  if (error || !service) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <ErrorState
          title="Service introuvable"
          message="La prestation demandée n'existe pas ou a été désactivée."
          action={
            <Link to="/services">
              <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                Retour aux services
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
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-emerald-700">
            Accueil
          </Link>
          <span>/</span>
          <Link to="/services" className="hover:text-emerald-700">
            Services
          </Link>
          <span>/</span>
          {service.category && (
            <>
              <Link
                to={`/domaines/${service.category.slug}`}
                className="hover:text-emerald-700"
              >
                {service.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-900 font-semibold">{service.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm">
              {/* Cover Image */}
              <div className="relative h-64 sm:h-80 w-full bg-slate-950 overflow-hidden">
                <img
                  src={getImageUrl((service as any).image_url || service.image, service.slug || service.category?.slug)}
                  alt={service.title}
                  onError={(e) => handleImageError(e, service.slug || service.category?.slug)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
                  <Badge variant="green" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                    {service.category?.name || 'Prestation Technique'}
                  </Badge>
                </div>
              </div>

              <div className="p-6 sm:p-10 space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 font-['Outfit']">
                  {service.title}
                </h1>

                {service.summary && (
                  <p className="text-base sm:text-lg font-medium text-emerald-900 bg-emerald-50/70 p-5 rounded-2xl border border-emerald-100 leading-relaxed">
                    {service.summary}
                  </p>
                )}

              <div className="prose prose-slate max-w-none text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                {service.description}
              </div>

              {service.features && service.features.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                    Avantages techniques et spécifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {service.features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-800"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sm:p-8 bg-slate-900 text-white border border-slate-800 space-y-6">
              <Badge variant="orange">Chiffrage express</Badge>
              <h3 className="text-2xl font-bold font-['Outfit']">Besoin de cette prestation ?</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Remplissez notre formulaire pour recevoir un devis et une étude technique sous 48h.
              </p>

              <Link to="/devis">
                <Button
                  variant="accent"
                  size="md"
                  leftIcon={<FileText className="w-5 h-5" />}
                  className="w-full font-bold shadow-lg text-base py-3"
                >
                  Demander un devis
                </Button>
              </Link>

              <div className="pt-5 border-t border-slate-800 space-y-3.5 text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Garantie décennale sur tous les chantiers</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>Conformité stricte aux normes OMS et IES</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-sky-400 shrink-0" />
                  <span>Assistance : Fixe +225 27 22 58 40 16 / Tél +225 07 04 90 10 34</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white space-y-4">
              <h4 className="text-base font-bold text-slate-900 font-['Outfit'] uppercase tracking-wider">
                Autres prestations
              </h4>
              <p className="text-sm text-slate-600">
                Consultez notre catalogue complet pour vos besoins complémentaires.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>Voir le catalogue complet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
