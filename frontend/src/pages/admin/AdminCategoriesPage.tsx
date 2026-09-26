import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { categoriesApi } from '../../api';
import type { Category } from '../../types/models';
import type { PaginationMeta } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { ImageUploadField } from '../../components/ui/ImageUploadField';
import { getImageUrl, handleImageError } from '../../utils/image';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesApi.getAdminList({
        search: search || undefined,
        page,
        per_page: 15,
      });
      setCategories(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, page]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormError('');
    setFormData({
      name: '',
      description: '',
      image: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormError('');
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: (cat as any).image_url || cat.image || '',
      is_active: cat.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Le nom du pôle d\'expertise est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description || null,
        image: formData.image || null,
        is_active: formData.is_active,
      };

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, payload);
      } else {
        await categoriesApi.create(payload);
      }

      setModalOpen(false);
      fetchCategories();
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
          'Une erreur est survenue lors de l\'enregistrement du pôle.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce pôle d\'expertise ?')) return;
    try {
      await categoriesApi.delete(id);
      fetchCategories();
    } catch (err) {
      alert('Impossible de supprimer ce domaine.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 font-['Outfit']">
            Pôles Majeurs et Domaines d'Expertise
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les 4 pôles d'ingénierie, leurs visuels de couverture et descriptions.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold rounded-xl"
        >
          Nouveau Pôle
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs max-w-md">
        <Input
          placeholder="Rechercher un pôle..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Aucun pôle d'expertise trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Bannière</th>
                  <th className="px-4 py-3">Pôle</th>
                  <th className="px-4 py-3">Prestations</th>
                  <th className="px-4 py-3">Réalisations</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categories.map((c) => {
                  const catImage = (c as any).image_url || c.image;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                          <img
                            src={c.slug === 'eau-hydraulique' && !catImage ? '/Fontaine.png' : getImageUrl(catImage, c.slug)}
                            alt={c.name}
                            onError={(e) => handleImageError(e, c.slug)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-bold">{c.name}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                          {c.services_count || 0} prestations
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/60">
                          {c.projects_count || 0} projets
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            c.is_active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {c.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
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

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Modifier le pôle d\'expertise' : 'Créer un pôle'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <div className="text-xs font-medium">{formError}</div>
            </div>
          )}

          <Input
            label="Nom du pôle"
            required
            placeholder="ex: Eau et hydraulique"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          {/* Image Upload & Management Component */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <ImageUploadField
              label="Photo de couverture du pôle"
              value={formData.image}
              onChange={(imgUrl) => setFormData({ ...formData, image: imgUrl })}
              folder="general"
              categorySlug={editingCategory?.slug}
              helpText="Image mise en avant sur la page d'accueil et le catalogue des domaines."
            />
          </div>

          <Textarea
            label="Description du pôle"
            rows={4}
            placeholder="Présentation des compétences techniques et solutions apportées..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Valider et Enregistrer le pôle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
