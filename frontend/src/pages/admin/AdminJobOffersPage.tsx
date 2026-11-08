import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Pencil, Trash2, Eye, EyeOff, MapPin, CalendarClock, Users, ExternalLink } from 'lucide-react';
import { jobOffersApi, CONTRACT_TYPES, type JobOffer, type JobOfferDto, type ContractType } from '../../api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';

const STATUS_STYLES: Record<NonNullable<JobOffer['status']>, string> = {
  published: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  expired: 'bg-amber-50 text-amber-800 border-amber-200',
};

const SUMMARY_MAX = 300;

interface OfferForm {
  title: string;
  department: string;
  location: string;
  contract_type: ContractType;
  summary: string;
  description: string;
  requirements: string;
  deadline: string;
  is_published: boolean;
}

const EMPTY_FORM: OfferForm = {
  title: '',
  department: '',
  location: 'Abidjan',
  contract_type: 'cdi',
  summary: '',
  description: '',
  requirements: '',
  deadline: '',
  is_published: true,
};

const today = () => new Date().toISOString().split('T')[0];
const formatDay = (ymd: string) => new Date(`${ymd}T00:00:00`).toLocaleDateString('fr-FR');

export function AdminJobOffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulaire (création ou modification)
  const [editing, setEditing] = useState<JobOffer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobOffersApi.list();
      setOffers(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de charger les offres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (offer: JobOffer) => {
    setEditing(offer);
    setForm({
      title: offer.title,
      department: offer.department || '',
      location: offer.location,
      contract_type: offer.contract_type,
      summary: offer.summary,
      description: offer.description,
      requirements: offer.requirements || '',
      deadline: offer.deadline || '',
      is_published: !!offer.is_published,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const updateForm = <K extends keyof OfferForm>(key: K, value: OfferForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Indiquez l\'intitulé du poste.';
    if (!form.location.trim()) errors.location = 'Indiquez le lieu de travail.';
    if (!form.summary.trim()) errors.summary = 'Rédigez un résumé de l\'offre.';
    if (!form.description.trim()) errors.description = 'Décrivez les missions du poste.';
    // Une offre existante peut garder une date passée (elle reste alors expirée)
    if (form.deadline && form.deadline < today() && form.deadline !== editing?.deadline) {
      errors.deadline = 'La date limite ne peut pas être déjà passée.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const payload: JobOfferDto = {
      title: form.title.trim(),
      department: form.department.trim() || undefined,
      location: form.location.trim(),
      contract_type: form.contract_type,
      summary: form.summary.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim() || undefined,
      deadline: form.deadline || null,
      is_published: form.is_published,
    };

    try {
      setSaving(true);
      if (editing) {
        await jobOffersApi.update(editing.id, payload);
      } else {
        await jobOffersApi.create(payload);
      }
      setFormOpen(false);
      fetchOffers();
    } catch (err: any) {
      const apiErrors = err.response?.status === 422 ? err.response?.data?.errors : null;
      if (apiErrors) {
        setFormErrors(Object.fromEntries(Object.entries(apiErrors).map(([k, v]) => [k, (v as string[])[0]])));
      } else {
        setFormErrors({ general: err.response?.data?.message || 'L\'enregistrement a échoué. Réessayez.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (offer: JobOffer) => {
    try {
      setBusyId(offer.id);
      await jobOffersApi.update(offer.id, { is_published: !offer.is_published });
      fetchOffers();
    } catch {
      window.alert('La modification a échoué. Réessayez.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (offer: JobOffer) => {
    const count = offer.applications_count ?? 0;
    const warning = count > 0 ? `\n\nLes ${count} candidature(s) reçue(s) seront conservées.` : '';
    if (!window.confirm(`Supprimer définitivement l'offre « ${offer.title} » ?${warning}`)) return;
    try {
      setBusyId(offer.id);
      await jobOffersApi.remove(offer.id);
      fetchOffers();
    } catch {
      window.alert('Impossible de supprimer cette offre.');
    } finally {
      setBusyId(null);
    }
  };

  const openCount = offers.filter((o) => o.status === 'published').length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white border border-slate-200/90 rounded-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Offres d'emploi</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {openCount} offre(s) en ligne sur la page{' '}
              <a href="/recrutement" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold hover:underline">
                Recrutement
              </a>
              . Les brouillons ne sont visibles que dans l'administration.
            </p>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto font-bold">
          Nouvelle offre
        </Button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Spinner />
        </div>
      ) : error ? (
        <div role="alert" className="p-6 bg-white border border-red-200 rounded-lg text-center space-y-3">
          <p className="text-red-700 font-medium">{error}</p>
          <Button variant="outline" size="md" onClick={fetchOffers}>
            Réessayer
          </Button>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-10 bg-white border border-slate-200/90 rounded-lg text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" aria-hidden="true" />
          <p className="text-slate-700 font-semibold">Aucune offre pour l'instant.</p>
          <p className="text-sm text-slate-500">
            Sans offre en ligne, la page Recrutement accepte les candidatures spontanées.
          </p>
          <Button variant="primary" size="md" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Publier une première offre
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {offers.map((offer) => (
            <li key={offer.id} className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-lg">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 break-words">{offer.title}</h2>
                    {offer.status && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${STATUS_STYLES[offer.status]}`}>
                        {offer.status_label}
                      </span>
                    )}
                  </div>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">{offer.contract_label}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {offer.location}
                    </span>
                    {offer.department && <span>{offer.department}</span>}
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                      {offer.deadline ? `Jusqu'au ${formatDay(offer.deadline)}` : 'Sans date limite'}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-2">{offer.summary}</p>
                  <Link
                    to={`/admin/candidatures?offre=${offer.id}`}
                    className="inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-emerald-800 hover:underline"
                  >
                    <Users className="w-4 h-4" aria-hidden="true" />
                    {offer.applications_count ?? 0} candidature(s) reçue(s)
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 lg:justify-end shrink-0">
                  {offer.status === 'published' && (
                    <a
                      href={`/recrutement#offre-${offer.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 min-h-11 px-3 rounded-md border border-slate-300 hover:border-emerald-600 text-sm font-semibold text-slate-800"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      Voir
                    </a>
                  )}
                  <Button variant="outline" size="md" onClick={() => openEdit(offer)} leftIcon={<Pencil className="w-4 h-4" />}>
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => togglePublished(offer)}
                    isLoading={busyId === offer.id}
                    leftIcon={offer.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  >
                    {offer.is_published ? 'Retirer' : 'Publier'}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handleDelete(offer)}
                    disabled={busyId === offer.id}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    className="text-rose-700 border-rose-200 hover:bg-rose-50"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Formulaire */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Modifier l\'offre' : 'Nouvelle offre d\'emploi'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <p className="text-sm text-slate-600">
            Les champs marqués d'un<span className="text-red-600 font-semibold"> * </span>sont obligatoires.
          </p>

          {formErrors.general && (
            <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-700">
              {formErrors.general}
            </p>
          )}

          <Input
            id="offre-titre"
            label="Intitulé du poste"
            required
            placeholder="Ex : Technicien de forage"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            error={formErrors.title}
            maxLength={150}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              id="offre-contrat"
              label="Type de contrat"
              required
              value={form.contract_type}
              onChange={(e) => updateForm('contract_type', e.target.value as ContractType)}
              options={CONTRACT_TYPES.map((c) => ({ value: c.value, label: c.label }))}
              error={formErrors.contract_type}
            />
            <Input
              id="offre-lieu"
              label="Lieu"
              required
              placeholder="Ex : Abidjan"
              value={form.location}
              onChange={(e) => updateForm('location', e.target.value)}
              error={formErrors.location}
              maxLength={100}
            />
            <Input
              id="offre-domaine"
              label="Domaine"
              placeholder="Ex : Eau, Solaire, BTP"
              value={form.department}
              onChange={(e) => updateForm('department', e.target.value)}
              error={formErrors.department}
              maxLength={100}
            />
          </div>

          <Textarea
            id="offre-resume"
            label="Résumé"
            required
            rows={2}
            placeholder="Une ou deux phrases affichées sur la carte de l'offre."
            value={form.summary}
            onChange={(e) => updateForm('summary', e.target.value)}
            error={formErrors.summary}
            helperText={`${form.summary.length} / ${SUMMARY_MAX} caractères`}
            maxLength={SUMMARY_MAX}
          />

          <Textarea
            id="offre-description"
            label="Missions"
            required
            rows={6}
            placeholder="Ce que la personne fera au quotidien. Une mission par ligne."
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            error={formErrors.description}
            maxLength={10000}
          />

          <Textarea
            id="offre-profil"
            label="Profil recherché"
            rows={4}
            placeholder="Diplômes, expérience, permis, langues… Un critère par ligne."
            value={form.requirements}
            onChange={(e) => updateForm('requirements', e.target.value)}
            error={formErrors.requirements}
            maxLength={10000}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <Input
              id="offre-date-limite"
              type="date"
              label="Date limite de candidature"
              min={today()}
              value={form.deadline}
              onChange={(e) => updateForm('deadline', e.target.value)}
              error={formErrors.deadline}
              helperText="Vide : l'offre reste en ligne jusqu'à ce que vous la retiriez."
            />
            <label htmlFor="offre-publiee" className="flex items-start gap-3 min-h-11 p-3 rounded-md border border-slate-200 bg-slate-50 cursor-pointer sm:mt-6">
              <input
                id="offre-publiee"
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => updateForm('is_published', e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-emerald-700 shrink-0"
              />
              <span className="text-sm">
                <span className="font-semibold text-slate-900">Publier sur le site</span>
                <span className="block text-slate-500">Décochez pour garder l'offre en brouillon.</span>
              </span>
            </label>
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              {editing ? 'Enregistrer' : form.is_published ? 'Publier l\'offre' : 'Enregistrer le brouillon'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
