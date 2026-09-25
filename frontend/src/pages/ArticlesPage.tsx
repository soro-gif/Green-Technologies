import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, User as UserIcon, ArrowRight, Search } from 'lucide-react';
import { articlesApi, categoriesApi } from '../api';
import type { Article, Category } from '../types/models';
import type { PaginationMeta } from '../types/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { getImageUrl, handleImageError } from '../utils/image';

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
    <div className="py-12 sm:py-16 bg-slate-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
            Publications et études sectorielles
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Retrouvez les dernières avancées en énergie renouvelable, hydraulique et BTP durable.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                placeholder="Rechercher un article ou un thème technique..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>

            <div>
              <Select
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
          </div>
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
              {articles.map((art) => (
                <Card
                  key={art.id}
                  hoverable
                  className="flex flex-col justify-between overflow-hidden p-0 border-slate-200 group bg-white shadow-xs hover:shadow-md transition-all"
                >
                  <div>
                    <div className="h-52 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={getImageUrl(art.cover_image, art.category?.slug || art.category?.name)}
                        alt={art.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, art.category?.slug || art.category?.name)}
                      />
                      {art.category?.name && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold bg-slate-900/85 text-white backdrop-blur-xs">
                          {art.category.name}
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                          {art.category?.name || 'Actualité'}
                        </span>
                        {art.published_at && (
                          <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 ml-auto">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{new Date(art.published_at).toLocaleDateString('fr-FR')}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-2.5 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {art.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {art.excerpt || art.content}
                      </p>

                      {art.author && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 pt-3 border-t border-slate-100">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>Rédigé par {art.author.name}</span>
                        </div>
                      )}
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

            <Pagination meta={meta} onPageChange={handlePageChange} className="mt-8" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;
