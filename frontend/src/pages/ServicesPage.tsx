import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, CheckCircle2, FileText } from 'lucide-react';
import { servicesApi, categoriesApi } from '../api';
import type { Service, Category } from '../types/models';
import type { PaginationMeta } from '../types/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { getImageUrl, handleImageError } from '../utils/image';

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 12,
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
    async function fetchServices() {
      try {
        setLoading(true);
        const res = await servicesApi.getPaginated({
          search: search || undefined,
          category_id: categoryId ? parseInt(categoryId, 10) : undefined,
          page,
          per_page: 12,
        });
        setServices(res.data || []);
        setMeta(res.meta);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-slate-900 font-['Outfit'] tracking-tight">
            Catalogue de prestations et services
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Retrouvez l'ensemble de nos services en hydraulique, solaire, agrotechnologies et BTP.
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                placeholder="Rechercher une prestation (ex: pompage solaire, forage, château d'eau...)"
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
        ) : services.length === 0 ? (
          <EmptyState
            title="Aucune prestation trouvée"
            description="Essayez de modifier vos termes de recherche ou de réinitialiser les filtres."
            action={
              <button
                onClick={() => setSearchParams({})}
                className="text-sm font-bold text-emerald-700 underline hover:text-emerald-800"
              >
                Réinitialiser les filtres
              </button>
            }
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv) => (
                <Card key={srv.id} hoverable className="overflow-hidden p-0 flex flex-col justify-between border-slate-200 group">
                  {/* Image Header */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={getImageUrl((srv as any).image_url || srv.image, srv.slug || srv.category?.slug, srv.slug || srv.id || srv.title)}
                      alt={srv.title}
                      onError={(e) => handleImageError(e, srv.slug || srv.category?.slug, srv.slug || srv.id || srv.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                      {srv.category?.name || 'Prestation'}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-2.5 group-hover:text-emerald-700 transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                        {srv.summary || srv.description}
                      </p>

                      {srv.features && srv.features.length > 0 && (
                        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl mb-4 border border-slate-100">
                          {srv.features.slice(0, 3).map((feat, i) => (
                            <div key={i} className="text-sm text-slate-700 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                      <Link
                        to={`/services/${srv.slug}`}
                        className="text-sm font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        Détails techniques →
                      </Link>
                      <Link
                        to="/devis"
                        className="text-sm font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Devis</span>
                      </Link>
                    </div>
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
