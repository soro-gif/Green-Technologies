import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Trash2,
  UserPlus,
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  Linkedin,
  CheckCircle2,
  Globe,
  ChevronRight,
} from 'lucide-react';
import {
  recruitmentApi,
  APPLICATION_STATUSES,
  EXPERIENCE_LEVELS,
  type JobApplication,
  type ApplicationStatus,
  type JobApplicationStats,
} from '../../api';
import type { PaginationMeta } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { FileField, validateDocument } from '../../components/ui/FileField';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  new: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  reviewing: 'bg-sky-50 text-sky-800 border-sky-200',
  interview: 'bg-amber-50 text-amber-800 border-amber-200',
  hired: 'bg-emerald-700 text-white border-emerald-700',
  rejected: 'bg-slate-100 text-slate-600 border-slate-200',
};

function StatusBadge({ status, label }: { status: ApplicationStatus; label: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${STATUS_STYLES[status]}`}>
      {label}
    </span>
  );
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

interface NewApplicationForm {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  position: string;
  experience: string;
  linkedin: string;
  cv: File | null;
  cv_url: string;
  cover_letter: File | null;
  message: string;
  status: ApplicationStatus;
  notes: string;
}

const EMPTY_NEW: NewApplicationForm = {
  full_name: '',
  email: '',
  phone: '',
  city: '',
  position: '',
  experience: '',
  linkedin: '',
  cv: null,
  cv_url: '',
  cover_letter: null,
  message: '',
  status: 'new',
  notes: '',
};

export function AdminApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<JobApplicationStats | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fiche détaillée
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [editStatus, setEditStatus] = useState<ApplicationStatus>('new');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Ajout manuel
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<NewApplicationForm>(EMPTY_NEW);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, s] = await Promise.all([
        recruitmentApi.list({ search: search || undefined, status: statusFilter || undefined, page, per_page: 15 }),
        recruitmentApi.stats(),
      ]);
      setApplications(list.data || []);
      setMeta(list.meta);
      setStats(s.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de charger les candidatures.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = window.setTimeout(fetchList, search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [fetchList, search]);

  const openDetail = (application: JobApplication) => {
    setSelected(application);
    // Ouvrir une candidature nouvelle la passe en « En cours d'étude » par défaut
    setEditStatus(application.status === 'new' ? 'reviewing' : application.status);
    setEditNotes(application.notes || '');
    setDetailError(null);
  };

  // Lien direct depuis le tableau de bord : /admin/candidatures?id=12
  // (une seule ouverture : sinon un second chargement écraserait le statut en cours de saisie)
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    const id = Number(searchParams.get('id'));
    if (!id || deepLinkHandled.current) return;
    deepLinkHandled.current = true;
    recruitmentApi
      .get(id)
      .then((res) => res.data && openDetail(res.data))
      .catch(() => undefined)
      .finally(() => setSearchParams({}, { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      setSaving(true);
      setDetailError(null);
      await recruitmentApi.update(selected.id, { status: editStatus, notes: editNotes });
      setSelected(null);
      fetchList();
    } catch (err: any) {
      setDetailError(err.response?.data?.message || 'La mise à jour a échoué.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (application: JobApplication) => {
    if (!window.confirm(`Supprimer définitivement la candidature de ${application.full_name} ?`)) return;
    try {
      await recruitmentApi.remove(application.id);
      setSelected(null);
      fetchList();
    } catch {
      window.alert('Impossible de supprimer cette candidature.');
    }
  };

  const updateForm = <K extends keyof NewApplicationForm>(key: K, value: NewApplicationForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.full_name.trim()) errors.full_name = 'Indiquez les nom et prénoms.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Adresse e-mail invalide.';
    if (!form.phone.trim()) errors.phone = 'Indiquez le téléphone.';
    if (!form.position.trim()) errors.position = 'Indiquez le poste ou le domaine visé.';
    const cvError = validateDocument(form.cv, false, 'CV');
    if (cvError) errors.cv = cvError;
    const letterError = validateDocument(form.cover_letter, false, 'lettre');
    if (letterError) errors.cover_letter = letterError;
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      setSubmitting(true);
      await recruitmentApi.create({
        ...form,
        cv: form.cv,
        cover_letter: form.cover_letter,
        cv_url: form.cv ? undefined : form.cv_url.trim() || undefined,
      });
      setCreating(false);
      setForm(EMPTY_NEW);
      setStatusFilter('');
      setPage(1);
      fetchList();
    } catch (err: any) {
      const apiErrors = err.response?.status === 422 ? err.response?.data?.errors : null;
      if (apiErrors) {
        setFormErrors(Object.fromEntries(Object.entries(apiErrors).map(([k, v]) => [k, (v as string[])[0]])));
      } else {
        setFormErrors({ general: err.response?.data?.message || 'L\'ajout a échoué. Réessayez.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filterTabs: Array<{ value: ApplicationStatus | ''; label: string; count: number }> = [
    { value: '', label: 'Toutes', count: stats?.total ?? 0 },
    ...APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label, count: stats?.by_status?.[s.value] ?? 0 })),
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white border border-slate-200/90 rounded-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Candidatures</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Candidatures reçues depuis la page Recrutement ou ajoutées à la main.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setForm(EMPTY_NEW);
            setFormErrors({});
            setCreating(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto font-bold"
        >
          Ajouter une candidature
        </Button>
      </div>

      {/* Filtres */}
      <div className="p-4 rounded-lg bg-white border border-slate-200/90 space-y-4">
        <div className="-mx-4 px-4 overflow-x-auto">
          <div role="tablist" aria-label="Filtrer par statut" className="flex gap-2 w-max">
            {filterTabs.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-2 min-h-10 px-3.5 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`min-w-6 px-1.5 rounded-full text-xs tabular-nums ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <Input
          aria-label="Rechercher une candidature"
          placeholder="Rechercher par nom, e-mail, téléphone, poste ou ville…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Liste */}
      <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600 space-y-3">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchList}>
              Réessayer
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">Aucune candidature</p>
            <p className="text-sm text-slate-500">
              {search || statusFilter
                ? 'Aucun résultat pour ces filtres.'
                : 'Les candidatures envoyées depuis la page Recrutement apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile : cartes */}
            <ul className="md:hidden divide-y divide-slate-100">
              {applications.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => openDetail(a)}
                    className="w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">{a.full_name}</span>
                        <StatusBadge status={a.status} label={a.status_label} />
                      </div>
                      <p className="text-sm font-medium text-emerald-800 truncate">{a.position}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {[a.city, a.experience_label, formatDate(a.created_at)].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Ordinateur : tableau */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500 font-bold text-xs border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-4 py-3">Candidat</th>
                    <th scope="col" className="px-4 py-3">Poste visé</th>
                    <th scope="col" className="px-4 py-3 hidden lg:table-cell">Expérience</th>
                    <th scope="col" className="px-4 py-3">Statut</th>
                    <th scope="col" className="px-4 py-3">Reçue le</th>
                    <th scope="col" className="px-4 py-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openDetail(a)}
                          className="text-left font-semibold text-slate-900 hover:text-emerald-800 cursor-pointer"
                        >
                          {a.full_name}
                        </button>
                        <div className="text-xs text-slate-500">
                          {a.email} · {a.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium">{a.position}</div>
                        {a.city && <div className="text-xs text-slate-500">{a.city}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{a.experience_label || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} label={a.status_label} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(a.created_at)}
                        {a.source === 'admin' && <div className="text-slate-400">Ajout manuel</div>}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => openDetail(a)}>
                          Ouvrir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/40">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      {/* Fiche détaillée */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.full_name || 'Candidature'} maxWidth="2xl">
        {selected && (
          <form onSubmit={handleSave} className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selected.status} label={selected.status_label} />
              <span className="text-xs text-slate-500">
                Reçue le {formatDate(selected.created_at)} · {selected.source === 'admin' ? 'ajout manuel' : 'via le site'}
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-4 bg-slate-50 rounded-md border border-slate-100">
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-slate-500">Poste ou domaine visé</dt>
                <dd className="font-bold text-slate-900">{selected.position}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">E-mail</dt>
                <dd>
                  <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 min-h-11 text-emerald-800 hover:underline break-all">
                    <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {selected.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Téléphone</dt>
                <dd>
                  <a href={`tel:${selected.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 min-h-11 text-emerald-800 hover:underline">
                    <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {selected.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Ville</dt>
                <dd className="flex items-center gap-1.5 text-slate-800">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  {selected.city || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Expérience</dt>
                <dd className="text-slate-800">{selected.experience_label || '—'}</dd>
              </div>
            </dl>

            {/* Documents */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              {selected.cv_url ? (
                <a
                  href={selected.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  Ouvrir le CV
                </a>
              ) : (
                <span className="inline-flex items-center min-h-11 px-4 rounded-md bg-slate-100 text-slate-500">Pas de CV joint</span>
              )}
              {selected.cover_letter_url && (
                <a
                  href={selected.cover_letter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-md border border-slate-300 hover:border-emerald-600 text-slate-800 font-semibold"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  Lettre de motivation
                </a>
              )}
              {selected.linkedin && (
                <a
                  href={selected.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-md border border-slate-300 hover:border-sky-600 text-slate-800 font-semibold"
                >
                  <Linkedin className="w-4 h-4" aria-hidden="true" />
                  LinkedIn
                </a>
              )}
            </div>

            {selected.message && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Message du candidat</p>
                <div className="max-h-48 overflow-y-auto p-3 bg-white rounded-md border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed">
                  {selected.message}
                </div>
              </div>
            )}

            {selected.consent_at && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                Consentement à la conservation des données donné le {formatDate(selected.consent_at)}.
              </p>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <Select
                id="candidature-statut"
                label="Statut"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                options={APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              />
              <Textarea
                id="candidature-notes"
                label="Notes internes"
                rows={3}
                placeholder="Échanges, date d'entretien, avis de l'équipe…"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
              {detailError && <p role="alert" className="text-sm font-medium text-red-600">{detailError}</p>}
            </div>

            <div className="pt-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleDelete(selected)}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Supprimer
              </Button>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="outline" size="md" onClick={() => setSelected(null)}>
                  Fermer
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={saving} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Ajout manuel */}
      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Ajouter une candidature" maxWidth="2xl">
        <form onSubmit={handleCreate} className="space-y-5" noValidate>
          <p className="text-sm text-slate-600">
            Pour une candidature reçue par e-mail, sur papier ou lors d'un salon. Les champs marqués d'un
            <span className="text-red-600 font-semibold"> * </span>sont obligatoires.
          </p>

          {formErrors.general && (
            <p role="alert" className="p-3 rounded-md bg-red-50 border border-red-200 text-sm font-medium text-red-700">
              {formErrors.general}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <div className="sm:col-span-2">
              <Input
                id="new-nom"
                label="Nom & prénoms"
                required
                value={form.full_name}
                onChange={(e) => updateForm('full_name', e.target.value)}
                error={formErrors.full_name}
              />
            </div>
            <Input
              id="new-email"
              label="E-mail"
              type="email"
              inputMode="email"
              required
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              error={formErrors.email}
            />
            <Input
              id="new-telephone"
              label="Téléphone"
              type="tel"
              inputMode="tel"
              required
              placeholder="Ex : 07 15 25 89 89"
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              error={formErrors.phone}
            />
            <Input
              id="new-ville"
              label="Ville de résidence"
              placeholder="Ex : Abidjan"
              value={form.city}
              onChange={(e) => updateForm('city', e.target.value)}
            />
            <Input
              id="new-poste"
              label="Poste ou domaine visé"
              required
              value={form.position}
              onChange={(e) => updateForm('position', e.target.value)}
              error={formErrors.position}
            />
            <Select id="new-experience" label="Niveau d'expérience" value={form.experience} onChange={(e) => updateForm('experience', e.target.value)}>
              <option value="">Sélectionner…</option>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
            <Input
              id="new-linkedin"
              label="Profil LinkedIn"
              type="url"
              inputMode="url"
              placeholder="https://linkedin.com/in/…"
              value={form.linkedin}
              onChange={(e) => updateForm('linkedin', e.target.value)}
              error={formErrors.linkedin}
            />
            <FileField id="new-cv" label="CV" file={form.cv} error={formErrors.cv} onChange={(file) => updateForm('cv', file)} />
            <FileField
              id="new-lettre"
              label="Lettre de motivation"
              file={form.cover_letter}
              error={formErrors.cover_letter}
              onChange={(file) => updateForm('cover_letter', file)}
            />
            {!form.cv && (
              <div className="sm:col-span-2">
                <Input
                  id="new-cv-url"
                  label="Ou lien vers le CV"
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  value={form.cv_url}
                  onChange={(e) => updateForm('cv_url', e.target.value)}
                  error={formErrors.cv_url}
                  helperText="Si le CV est déjà en ligne (Drive, Dropbox…)."
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <Textarea id="new-message" label="Message ou présentation" rows={3} value={form.message} onChange={(e) => updateForm('message', e.target.value)} />
            </div>
            <Select
              id="new-statut"
              label="Statut"
              value={form.status}
              onChange={(e) => updateForm('status', e.target.value as ApplicationStatus)}
              options={APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            />
            <div className="sm:col-span-2">
              <Textarea
                id="new-notes"
                label="Notes internes"
                rows={2}
                placeholder="Ex : reçue au salon de l'emploi d'Abidjan"
                value={form.notes}
                onChange={(e) => updateForm('notes', e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={submitting} leftIcon={<Plus className="w-4 h-4" />}>
              Ajouter la candidature
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminApplicationsPage;
