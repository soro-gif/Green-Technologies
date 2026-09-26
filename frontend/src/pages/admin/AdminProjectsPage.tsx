import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { projectsApi, categoriesApi } from '../../api';
import type { Project, Category, ProjectStatus } from '../../types/models';
import type { PaginationMeta } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { ImageUploadField } from '../../components/ui/ImageUploadField';
import { getImageUrl, handleImageError } from '../../utils/image';

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    client_name: '',
    location: '',
    description: '',
    results: '',
    image: '',
    status: 'published' as ProjectStatus,
    is_featured: false,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsApi.getAdminList({
        search: search || undefined,
        category_id: categoryId ? parseInt(categoryId, 10) : undefined,
        page,
        per_page: 15,
      });
      setProjects(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, categoryId, page]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormError('');
    setFormData({
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      title: '',
      client_name: '',
      location: '',
      description: '',
      results: '',
      image: '',
      status: 'published',
      is_featured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setFormError('');
    setFormData({
      category_id: String(proj.category_id),
      title: proj.title,
      client_name: proj.client_name || '',
      location: proj.location || '',
      description: proj.description,
      results: proj.results || '',
      image: (proj as any).image_url || proj.image || '',
      status: proj.status,
      is_featured: proj.is_featured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.category_id) {
      setFormError('Veuillez sélectionner un domaine / pôle d\'expertise.');
      return;
    }

    if (!formData.title.trim()) {
      setFormError('Le titre du projet est obligatoire.');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('La description du projet est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        category_id: parseInt(formData.category_id, 10),
        title: formData.title.trim(),
        client_name: formData.client_name || null,
        location: formData.location || 'Côte d\'Ivoire',
        summary: formData.description ? formData.description.slice(0, 250) : formData.title.trim(),
        description: formData.description,
        results: formData.results || null,
        image: formData.image || null,
        status: formData.status,
        is_featured: formData.is_featured,
      };

      if (editingProject) {
        await projectsApi.update(editingProject.id, payload);
      } else {
        await projectsApi.create(payload);
      }

      setModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setFormError('Votre session a expiré. Veuillez vous reconnecter à votre compte administrateur.');
      } else if (err.response?.status === 403) {
        setFormError('Accès refusé : rôle ou permissions insuffisants.');
      } else if (err.response?.data?.errors) {
        const errorList = Object.values(err.response.data.errors).flat().join(' ');
        setFormError(errorList || 'Erreur de validation du formulaire.');
      } else {
        setFormError(
          err.response?.data?.message ||
          'Une erreur est survenue lors de l\'enregistrement du projet.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce projet ?')) return;
    try {
      await projectsApi.delete(id);
      fetchProjects();
    } catch (err) {
      alert('Impossible de supprimer ce projet.');
    }
  };

  const currentCategory = categories.find((c) => String(c.id) === formData.category_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">
            Portfolio et réalisations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez vos études de cas, chantiers livrés et photographies de terrain.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nouveau Projet
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            placeholder="Rechercher par titre, client, localité..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div>
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border-slate-700 text-white"
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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun projet trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Projet</th>
                  <th className="px-4 py-3">Domaine</th>
                  <th className="px-4 py-3">Localité</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {projects.map((p) => {
                  const projImage = (p as any).image_url || p.image;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                          <img
                            src={getImageUrl(projImage, p.slug || p.category?.slug)}
                            alt={p.title}
                            onError={(e) => handleImageError(e, p.slug || p.category?.slug)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        <div>{p.title}</div>
                        {p.client_name && <div className="text-[10px] text-slate-400">{p.client_name}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{p.category?.name}</td>
                      <td className="px-4 py-3 text-slate-300">{p.location || '-'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {p.status_label || p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Modifier le projet' : 'Créer un projet'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <div className="text-xs font-medium">{formError}</div>
            </div>
          )}

          <Select
            label="Domaine"
            required
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          >
            <option value="">Choisir un domaine</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Input
            label="Titre du projet"
            required
            placeholder="ex: Centrale Solaire 50kW Korhogo"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          {/* Image Upload & Management Component */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <ImageUploadField
              label="Photo principale du chantier / projet"
              value={formData.image}
              onChange={(imgUrl) => setFormData({ ...formData, image: imgUrl })}
              folder="projects"
              categorySlug={currentCategory?.slug || 'eau'}
              helpText="Téléversez la photo de l'ouvrage fini ou du chantier en cours."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Client / Maître d'ouvrage"
              placeholder="ex: Ministère ou Société X"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            />
            <Input
              label="Localisation"
              placeholder="ex: Korhogo, Bouaké..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <Textarea
            label="Description du chantier"
            required
            rows={4}
            placeholder="Détails techniques des travaux effectués..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Textarea
            label="Résultats et impact (optionnel)"
            rows={2}
            placeholder="ex: 120 000 kWh produits par an, 300 familles alimentées..."
            value={formData.results}
            onChange={(e) => setFormData({ ...formData, results: e.target.value })}
          />

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 sticky bottom-0 bg-white py-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="font-bold shadow-md"
            >
              Valider et Enregistrer le projet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
