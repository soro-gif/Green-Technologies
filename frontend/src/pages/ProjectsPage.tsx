import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { projectsApi, categoriesApi } from '../api';
import type { Project, Category } from '../types/models';
import type { PaginationMeta } from '../types/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { getImageUrl, handleImageError } from '../utils/image';

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
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
    async function fetchProjects() {
      try {
        setLoading(true);
        const res = await projectsApi.getPaginated({
          search: search || undefined,
          category_id: categoryId ? parseInt(categoryId, 10) : undefined,
          page,
          per_page: 9,
        });
        setProjects(res.data || []);
        setMeta(res.meta);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
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
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 font-['Outfit'] tracking-tight">
            Portfolio de réalisations
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Découvrez nos chantiers d'adduction d'eau, fermes solaires, périmètres irrigués et ouvrages BTP en Côte d'Ivoire.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                placeholder="Rechercher par mot-clé, ville ou maître d'ouvrage (ex: Korhogo, Bouaké, Centrale...)"
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

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="Aucune réalisation trouvée"
            description="Aucun projet ne correspond à vos critères de recherche actuels."
            action={
              <button
                onClick={() => setSearchParams({})}
                className="text-sm font-bold text-emerald-700 underline hover:text-emerald-800"
              >
                Réinitialiser la recherche
              </button>
            }
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <Card
                  key={proj.id}
                  hoverable
                  className="flex flex-col justify-between overflow-hidden p-0 border-slate-200 group"
                >
                  {/* Image Header */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={getImageUrl(proj.image_url || proj.main_image || proj.image, proj.slug || proj.category?.slug)}
                      alt={proj.title}
                      onError={(e) => handleImageError(e, proj.slug || proj.category?.slug)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                        {proj.category?.name || 'Projet'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        {proj.location ? (
                          <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span>{proj.location}</span>
                          </span>
                        ) : <div />}
                        {proj.status_label && (
                          <Badge variant="green" className="text-xs py-0.5">
                            {proj.status_label}
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-2.5 group-hover:text-emerald-700 transition-colors">
                        {proj.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {proj.description}
                      </p>

                      {proj.client_name && (
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl mb-2 border border-slate-100">
                          <span className="font-semibold text-slate-800">Client :</span>{' '}
                          {proj.client_name}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
                      <Link
                        to={`/realisations/${proj.slug}`}
                        className="text-sm font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 group/link"
                      >
                        <span>Voir l'étude de cas</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>

                      {proj.completion_date && (
                        <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(proj.completion_date).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <Pagination meta={meta} onPageChange={handlePageChange} className="mt-8" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;
