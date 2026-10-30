import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { servicesApi, categoriesApi } from '../api';
import type { Service, Category } from '../types/models';
import type { PaginationMeta } from '../types/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageHeader } from '../components/ui/PageHeader';
import { ServiceCard } from '../components/ui/ServiceCard';
import { Pagination } from '../components/ui/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

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
        <div className="bg-slate-50 min-h-[80vh]">
      <PageHeader
        title="Nos prestations"
        description="Retrouvez l'ensemble de nos services en hydraulique, solaire, agrotechnologies et BTP."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="sm:col-span-2">
            <Input
              aria-label="Rechercher une prestation"
              placeholder="Rechercher une prestation (ex : pompage solaire, forage, château d'eau)"
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
                <ServiceCard key={srv.id} service={srv} categoryName={srv.category?.name} />
              ))}
            </div>

            <Pagination meta={meta} onPageChange={handlePageChange} className="mt-8" />
          </div>
        )}
      </div>
    </div>
  );
}
