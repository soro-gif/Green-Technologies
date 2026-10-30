import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, User as UserIcon, Search } from 'lucide-react';
import { articlesApi, categoriesApi } from '../api';
import type { Article, Category } from '../types/models';
import type { PaginationMeta } from '../types/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { getImageUrl, handleImageError, imageFitClass } from '../utils/image';

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 9,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data || [])).catch(() => { });
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await articlesApi.getPaginated({
          search: search || undefined,
          category_id: categoryId ? parseInt(categoryId, 10) : undefined,
          page,
          per_page: 9,
        });
        setArticles(res.data || []);
        setMeta(res.meta);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, categoryId, page]);

  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('search', value);
      else next.delete('search');
      next.set('page', '1');
      return next;
    });
  };

  const handleCategoryChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('category_id', val);
      else next.delete('category_id');
      next.set('page', '1');
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', newPage.toString());
      return next;
    });
  };

  return (
        <div className="bg-slate-50 min-h-[80vh]">
      <PageHeader
        title="Publications et études"
        description="Retrouvez les dernières avancées en énergie renouvelable, hydraulique et BTP durable."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
{/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="sm:col-span-2">
            <Input
              aria-label="Rechercher un article"
              placeholder="Rechercher un article ou un thème technique"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>

          <Select
            aria-label="Filtrer par domaine"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Tous les domaines</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            title="Aucun article pour le moment"
            description="Revenez prochainement pour découvrir nos nouveaux articles et retours techniques."
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art) => {
                const fallbackKey = art.category?.slug || art.category?.name;
                const itemKey = art.slug || art.id || art.title;
                const imageUrl = getImageUrl(art.cover_image, fallbackKey, itemKey);

                return (
                  <Card key={art.id} hoverable className="flex flex-col justify-between overflow-hidden p-0 bg-white">
                    <div>
                      <img
                        src={imageUrl}
                        alt={art.title}
                        width={640}
                        height={400}
                        loading="lazy"
                        onError={(e) => handleImageError(e, fallbackKey, itemKey)}
                        className={`w-full aspect-[16/10] bg-slate-100 ${imageFitClass(imageUrl)}`}
                      />

                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mb-1.5">
                          <span>{art.category?.name || 'Actualité'}</span>
                          {art.published_at && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              {new Date(art.published_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 font-display mb-2 line-clamp-2">
                          {art.title}
                        </h2>

                        <p className="text-slate-600 leading-relaxed line-clamp-3">
                          {art.excerpt || art.content}
                        </p>

                        {art.author && (
                          <p className="flex items-center gap-2 text-sm text-slate-600 mt-3">
                            <UserIcon className="w-4 h-4 text-slate-500" />
                            <span>Rédigé par {art.author.name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <Link
                        to={`/actualites/${art.slug}`}
                        className="font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
                      >
                        Lire l'article
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Pagination meta={meta} onPageChange={handlePageChange} className="mt-8" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;
