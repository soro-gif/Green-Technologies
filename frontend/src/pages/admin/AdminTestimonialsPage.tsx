import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, Eye, AlertCircle } from 'lucide-react';
import { testimonialsApi } from '../../api';
import type { Testimonial } from '../../types/models';
import type { PaginationMeta } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';

export function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    author_name: '',
    author_role: '',
    company: '',
    content: '',
    rating: 5,
    is_published: true,
    is_featured: true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await testimonialsApi.getAdminList({ page, per_page: 15 });
      setTestimonials(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [page]);

  const handleOpenCreate = () => {
    setEditingTestimonial(null);
    setFormError('');
    setFormData({
      author_name: '',
      author_role: '',
      company: '',
      content: '',
      rating: 5,
      is_published: true,
      is_featured: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingTestimonial(t);
    setFormError('');
    setFormData({
      author_name: t.author_name,
      author_role: t.author_role,
      company: t.company || '',
      content: t.content,
      rating: t.rating,
      is_published: t.is_published,
      is_featured: t.is_featured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.author_name.trim()) {
      setFormError('Le nom de l\'auteur est obligatoire.');
      return;
    }

    if (!formData.content.trim()) {
      setFormError('Le contenu du témoignage est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      if (editingTestimonial) {
        await testimonialsApi.update(editingTestimonial.id, formData);
      } else {
        await testimonialsApi.create(formData);
      }
      setModalOpen(false);
      fetchTestimonials();
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
          'Une erreur est survenue lors de l\'enregistrement du témoignage.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce témoignage ?')) return;
    try {
      await testimonialsApi.delete(id);
      fetchTestimonials();
    } catch (err) {
      alert('Impossible de supprimer.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 font-['Outfit']">
            Avis et témoignages clients
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les retours d'expérience et notes affichées sur la page d'accueil.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold rounded-xl"
        >
          Nouveau témoignage
        </Button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Aucun témoignage enregistré.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3">Entreprise / Rôle</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-900 font-bold">{t.author_name}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {t.author_role} {t.company ? `• ${t.company}` : ''}
                    </td>
                    <td className="px-4 py-3 text-amber-500 font-bold">
                      {t.rating} / 5 ★
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.is_published
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {t.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                          title="Voir le témoignage"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
        title={editingTestimonial ? 'Modifier le témoignage' : 'Nouveau témoignage'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <div className="text-xs font-medium">{formError}</div>
            </div>
          )}

          <Input
            label="Nom complet de l'auteur"
            required
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Rôle / Titre"
              required
              placeholder="ex: Directeur Technique"
              value={formData.author_role}
              onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
            />
            <Input
              label="Entreprise (optionnel)"
              placeholder="ex: Coopérative..."
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <Select
            label="Note attribuée"
            value={String(formData.rating)}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) })}
          >
            <option value="5">5 étoiles ★★★★★ (Excellent)</option>
            <option value="4">4 étoiles ★★★★☆ (Très bon)</option>
            <option value="3">3 étoiles ★★★☆☆ (Moyen)</option>
          </Select>
          <Textarea
            label="Contenu de l'avis"
            required
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
              Valider et Enregistrer le témoignage
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
