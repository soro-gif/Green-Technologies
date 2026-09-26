import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { servicesApi, categoriesApi } from '../../api';
import type { Service, Category } from '../../types/models';
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

export function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    summary: '',
    description: '',
    image: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await servicesApi.getAdminList({
        search: search || undefined,
        category_id: categoryId ? parseInt(categoryId, 10) : undefined,
        page,
        per_page: 15,
      });
      setServices(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search, categoryId, page]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormError('');
    setFormData({
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      title: '',
      summary: '',
      description: '',
      image: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setFormError('');
    setFormData({
      category_id: String(srv.category_id),
      title: srv.title,
      summary: srv.summary || '',
      description: srv.description || '',
      image: (srv as any).image_url || srv.image || '',
      is_active: srv.is_active,
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
      setFormError('Le titre de la prestation est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        category_id: parseInt(formData.category_id, 10),
        title: formData.title.trim(),
        summary: formData.summary || null,
        description: formData.description || null,
        image: formData.image || null,
        is_active: formData.is_active,
      };

      if (editingService) {
        await servicesApi.update(editingService.id, payload);
      } else {
        await servicesApi.create(payload);
      }

      setModalOpen(false);
      fetchServices();
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
          'Une erreur est survenue lors de l\'enregistrement de la prestation.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette prestation ?')) return;
    try {
      await servicesApi.delete(id);
      fetchServices();
    } catch (err) {
      alert('Impossible de supprimer ce service.');
    }
  };

  const currentCategory = categories.find((c) => String(c.id) === formData.category_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 font-['Outfit']">
            Catalogue des Prestations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les services, leurs photos et descriptions affichés sur le site.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold rounded-xl"
        >
          Nouvelle Prestation
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            placeholder="Rechercher une prestation..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div>
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
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

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Aucun service trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Visuel</th>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Domaine</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {services.map((s) => {
                  const srvImage = (s as any).image_url || s.image;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                          <img
                            src={getImageUrl(srvImage, s.slug || s.category?.slug)}
                            alt={s.title}
                            onError={(e) => handleImageError(e, s.slug || s.category?.slug)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-semibold">{s.title}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                          {s.category?.name || 'Général'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            s.is_active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {s.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
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
        title={editingService ? 'Modifier la prestation' : 'Créer une prestation'}
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
            label="Titre de la prestation"
            required
            placeholder="ex: Pompage solaire immergé"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          {/* Image Upload & Management Component */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <ImageUploadField
              label="Photo illustrative de la prestation"
              value={formData.image}
              onChange={(imgUrl) => setFormData({ ...formData, image: imgUrl })}
              folder="services"
              categorySlug={currentCategory?.slug || 'eau'}
              helpText="Téléversez une photo de réalisation ou renseignez un chemin d'accès d'image."
            />
          </div>

          <Input
            label="Résumé court (accroche)"
            placeholder="ex: Dimensionnement et installation de pompes solaires..."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          />

          <Textarea
            label="Description technique complète"
            rows={5}
            placeholder="Détaillez la prestation, le matériel utilisé, les garanties..."
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
              Valider et Enregistrer la prestation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
