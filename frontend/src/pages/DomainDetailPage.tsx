import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ChevronLeft } from 'lucide-react';
import { categoriesApi } from '../api';
import type { Category } from '../types/models';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { ServiceCard } from '../components/ui/ServiceCard';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { getPole } from '../data/poles';
import { getImageUrl, handleImageError, imageFitClass } from '../utils/image';

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

  const pole = getPole(category.slug);
  const heroImage = pole?.image ?? getImageUrl(category.image_url, category.slug);
  const serviceCount = category.services?.length || 0;

  return (
    <div className="bg-slate-50 min-h-[80vh]">
      <PageHeader
        title={category.name}
        description={category.description || pole?.desc}
        crumbs={[
          { label: 'Accueil', to: '/' },
          { label: 'Nos domaines', to: '/domaines' },
          { label: category.name },
        ]}
        pole={pole}
        media={
          <img
            src={heroImage}
            alt=""
            width={760}
            height={480}
            onError={(e) => handleImageError(e, category.slug)}
            className={`w-full aspect-[16/10] rounded-md ${imageFitClass(heroImage)}`}
          />
        }
      >
        <Link to="/devis">
          <Button variant="accent" size="lg" leftIcon={<FileText className="w-5 h-5" />} className="w-full sm:w-auto font-bold">
            Demander un devis
          </Button>
        </Link>
        <Link to={`/realisations?category_slug=${category.slug}`}>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold">
            Voir les réalisations
          </Button>
        </Link>
      </PageHeader>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-8">
          <h2 className="text-3xl font-display font-extrabold tracking-tight text-slate-900">
            Prestations de ce pôle
          </h2>
          <p className="text-slate-600">
            {serviceCount} {serviceCount > 1 ? 'prestations' : 'prestation'}
          </p>
        </div>

        {serviceCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.services?.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p className="text-slate-600">
            Aucune prestation n'est publiée pour ce pôle. Contactez-nous pour en parler.
          </p>
        )}
      </section>
    </div>
  );
}
