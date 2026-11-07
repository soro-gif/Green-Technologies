import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';
import { projectsApi, categoriesApi } from '../api';
import type { Project, Category } from '../types/models';
import type { PaginationMeta } from '../types/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { getImageUrl, handleImageError, imageFitClass } from '../utils/image';

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
        <div className="bg-slate-50 min-h-[80vh]">
      <PageHeader
        title="Nos réalisations"
        description="Découvrez nos chantiers d'adduction d'eau, fermes solaires, périmètres irrigués et ouvrages BTP en Côte d'Ivoire."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
{/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="sm:col-span-2">
            <Input
              aria-label="Rechercher une réalisation"
              placeholder="Rechercher par mot-clé, ville ou maître d'ouvrage"
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
              {projects.map((proj) => {
                const fallbackKey = proj.category?.slug || proj.slug;
                const itemKey = proj.slug || proj.id || proj.title;
                const imageUrl = getImageUrl(proj.image_url || proj.main_image || proj.image, fallbackKey, itemKey);

                return (
                  <Card key={proj.id} hoverable className="reveal flex flex-col justify-between overflow-hidden p-0 bg-white">
                    <div>
                      <img
                        src={imageUrl}
                        alt={proj.title}
                        width={640}
                        height={400}
                        loading="lazy"
                        onError={(e) => handleImageError(e, fallbackKey, itemKey)}
                        className={`w-full aspect-[16/10] bg-slate-100 ${imageFitClass(imageUrl)}`}
                      />

                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mb-1.5">
                          <span>{proj.category?.name || 'Projet'}</span>
                          {proj.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                              {proj.location}
                            </span>
                          )}
                          {proj.completion_date && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              {new Date(proj.completion_date).getFullYear()}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 font-display mb-2 leading-snug">
                          {proj.title}
                        </h2>

                        <p className="text-slate-600 leading-relaxed line-clamp-3">{proj.description}</p>

                        {proj.status_label && (
                          <Badge variant="green" className="mt-3">
                            {proj.status_label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <Link
                        to={`/realisations/${proj.slug}`}
                        className="py-2 -my-2 font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
                      >
                        Voir l'étude de cas
                      </Link>
                    </div>
                  </Card>
                );
              })}
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
