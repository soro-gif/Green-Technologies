import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, Eye } from 'lucide-react';
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
    try {
      setSaving(true);
      if (editingTestimonial) {
        await testimonialsApi.update(editingTestimonial.id, formData);
      } else {
        await testimonialsApi.create(formData);
      }
      setModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      alert('Erreur lors de l\'enregistrement.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">
            Avis et témoignages clients
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez les retours d'expérience et notes affichées sur la page d'accueil.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nouveau témoignage
        </Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun témoignage enregistré.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3">Entreprise / Rôle</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-white font-bold">{t.author_name}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {t.author_role} {t.company ? `• ${t.company}` : ''}
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-bold">
                      {t.rating} / 5 ★
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.is_published
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                          title="Voir le témoignage"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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

        <div className="p-4 border-t border-slate-800">
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
