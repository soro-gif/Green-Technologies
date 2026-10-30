import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categoriesApi } from '../api';
import type { Category } from '../types/models';
import { POLES, getPole } from '../data/poles';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { StratumEdge } from '../components/ui/StratumEdge';
import { getImageUrl, handleImageError, imageFitClass } from '../utils/image';

const countLabel = (count: number, singular: string, plural: string) =>
  `${count} ${count > 1 ? plural : singular}`;

export function DomainsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await categoriesApi.getAll();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Du terrain vers la nappe ; un pôle ajouté depuis l'admin se place à la fin
  const rank = (category: Category) => {
    const index = POLES.findIndex((pole) => pole.slug === category.slug);
    return index === -1 ? POLES.length : index;
  };
  const orderedCategories = [...categories].sort((a, b) => rank(a) - rank(b));

  return (
    <div className="bg-slate-50 min-h-[70vh]">
      <PageHeader
        title="Nos domaines d'expertise"
        description="De la ressource en eau à l'énergie solaire, en passant par l'agriculture et le génie civil : choisissez le pôle qui correspond à votre projet."
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="pt-5">
          {orderedCategories.map((category, index) => {
            const pole = getPole(category.slug);
            const band = pole?.band ?? 'bg-white text-slate-900';
            const muted = pole?.muted ?? 'text-slate-600';
            const image = pole?.image ?? getImageUrl(category.image_url, category.slug);
            const previous = orderedCategories[index - 1];
            const previousEdge = previous ? getPole(previous.slug)?.edge : undefined;

            return (
              <section key={category.id} className={`relative ${band}`}>
                {previousEdge && <StratumEdge color={previousEdge} />}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:items-center">
                  <div>
                    {pole && <p className={`text-sm font-medium ${muted}`}>{pole.layer}</p>}
                    <h2 className="text-3xl lg:text-4xl font-display font-extrabold tracking-tight mt-1">
                      {category.name}
                    </h2>
                    <p className="text-lg leading-relaxed max-w-prose mt-3">
                      {category.description || pole?.desc}
                    </p>
                    <p className={`text-sm mt-3 ${muted}`}>
                      {countLabel(category.services_count || 0, 'prestation', 'prestations')},{' '}
                      {countLabel(category.projects_count || 0, 'réalisation', 'réalisations')}
                    </p>
                    <Link
                      to={`/domaines/${category.slug}`}
                      className="inline-flex items-center gap-2 mt-4 font-bold underline underline-offset-4"
                    >
                      <span>Découvrir ce pôle</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <img
                    src={image}
                    alt={category.name}
                    loading="lazy"
                    width={760}
                    height={480}
                    onError={(e) => handleImageError(e, category.slug)}
                    className={`w-full aspect-[16/10] rounded-md ${imageFitClass(image)}`}
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
