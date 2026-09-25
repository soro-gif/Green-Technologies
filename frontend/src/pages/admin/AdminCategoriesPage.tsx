import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
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
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
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
    } catch (err) {
      alert('Erreur lors de l\'enregistrement du domaine.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">
            Pôles Majeurs et Domaines d'Expertise
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez les 4 pôles d'ingénierie, leurs visuels de couverture et descriptions.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nouveau Pôle
        </Button>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Rechercher un pôle..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun pôle d'expertise trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Bannière</th>
                  <th className="px-4 py-3">Pôle</th>
                  <th className="px-4 py-3">Prestations</th>
                  <th className="px-4 py-3">Réalisations</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categories.map((c) => {
                  const catImage = (c as any).image_url || c.image;
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                          <img
                            src={c.slug === 'eau-hydraulique' && !catImage ? '/Fontaine.png' : getImageUrl(catImage, c.slug)}
                            alt={c.name}
                            onError={(e) => handleImageError(e, c.slug)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-bold">{c.name}</td>
                      <td className="px-4 py-3 text-slate-300 font-semibold">{c.services_count || 0}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">{c.projects_count || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.is_active
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {c.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
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
        title={editingCategory ? 'Modifier le pôle d\'expertise' : 'Créer un pôle'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
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
