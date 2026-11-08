import { useState, useEffect, useRef } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Mail,
  Phone,
  FileText,
  Search,
  MessageCircle,
  Paperclip,
  X,
} from 'lucide-react';
import { recruitmentApi, EXPERIENCE_LEVELS } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DOCUMENT_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MESSAGE_MAX = 4000;

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  position: string;
  experience: string;
  linkedin: string;
  message: string;
  consent: boolean;
  cv: File | null;
  cover_letter: File | null;
}

type FieldName = 'full_name' | 'email' | 'phone' | 'position' | 'linkedin' | 'cv' | 'cover_letter' | 'message' | 'consent';

const EMPTY_FORM: FormState = {
  full_name: '',
  email: '',
  phone: '',
  city: '',
  position: '',
  experience: '',
  linkedin: '',
  message: '',
  consent: false,
  cv: null,
  cover_letter: null,
};

/** Identifiants stables : liés aux messages d'erreur et au récapitulatif. */
const FIELD_IDS: Record<FieldName, string> = {
  full_name: 'candidature-nom',
  email: 'candidature-email',
  phone: 'candidature-telephone',
  position: 'candidature-poste',
  linkedin: 'candidature-linkedin',
  cv: 'candidature-cv',
  cover_letter: 'candidature-lettre',
  message: 'candidature-message',
  consent: 'candidature-consentement',
};

const FIELD_LABELS: Record<FieldName, string> = {
  full_name: 'Nom & prénoms',
  email: 'E-mail',
  phone: 'Téléphone',
  position: 'Poste ou domaine visé',
  linkedin: 'Profil LinkedIn',
  cv: 'CV',
  cover_letter: 'Lettre de motivation',
  message: 'Message',
  consent: 'Consentement',
};

const VALIDATED_FIELDS: FieldName[] = ['full_name', 'email', 'phone', 'position', 'linkedin', 'cv', 'cover_letter', 'message', 'consent'];

const STEPS = [
  {
    icon: FileText,
    title: 'Vous postulez',
    desc: 'Remplissez le formulaire en quelques minutes et joignez votre CV.',
  },
  {
    icon: Search,
    title: 'Nous étudions votre profil',
    desc: 'Votre candidature est transmise à l\'équipe du pôle concerné.',
  },
  {
    icon: MessageCircle,
    title: 'Nous vous recontactons',
    desc: 'Si votre profil correspond à un besoin, nous vous appelons pour un premier échange.',
  },
];

function validateDocument(file: File | null, required: boolean, label: string): string | null {
  if (!file) return required ? `Joignez votre ${label}.` : null;
  if (!/\.(pdf|docx?)$/i.test(file.name)) return 'Format accepté : PDF ou Word (.doc, .docx).';
  if (file.size > MAX_FILE_SIZE) return `Fichier trop lourd (${formatSize(file.size)}) : 5 Mo maximum.`;
  return null;
}

function validateField(name: FieldName, form: FormState): string | null {
  switch (name) {
    case 'full_name':
      return form.full_name.trim() ? null : 'Indiquez vos nom et prénoms.';
    case 'email': {
      const v = form.email.trim();
      if (!v) return 'Indiquez votre adresse e-mail.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Adresse e-mail invalide, par exemple : y.koffi@example.ci';
    }
    case 'phone': {
      const v = form.phone.trim();
      if (!v) return 'Indiquez votre numéro de téléphone.';
      return /^[+\d][\d\s.-]{7,}$/.test(v) ? null : 'Numéro invalide, par exemple : 07 15 25 89 89';
    }
    case 'position':
      return form.position.trim() ? null : 'Indiquez le poste ou le domaine visé.';
    case 'linkedin': {
      const v = form.linkedin.trim();
      return !v || /^https:\/\/\S+\.\S+/i.test(v) ? null : 'Le lien doit commencer par https://';
    }
    case 'cv':
      return validateDocument(form.cv, true, 'CV');
    case 'cover_letter':
      return validateDocument(form.cover_letter, false, 'lettre de motivation');
    case 'message':
      return form.message.length > MESSAGE_MAX ? `${MESSAGE_MAX} caractères maximum.` : null;
    case 'consent':
      return form.consent ? null : 'Cochez cette case pour envoyer votre candidature.';
  }
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

interface FileFieldProps {
  id: string;
  label: string;
  required?: boolean;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

/** Champ fichier accessible : le vrai <input type="file"> reste focusable au clavier. */
function FileField({ id, label, required, file, error, onChange }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-slate-700" id={`${id}-label`}>
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div
        className={`flex items-center gap-3 min-h-11 rounded-md border bg-white pl-1.5 pr-2 py-1.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500 ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
      >
        <label
          htmlFor={id}
          className="shrink-0 inline-flex items-center gap-1.5 min-h-9 px-3 rounded bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-800 cursor-pointer transition-colors"
        >
          <Paperclip className="w-4 h-4" aria-hidden="true" />
          Choisir un fichier
        </label>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={DOCUMENT_ACCEPT}
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? `${errorId} ${hintId}` : hintId}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <span className={`min-w-0 flex-1 truncate text-sm ${file ? 'text-slate-900' : 'text-slate-500'}`}>
          {file ? `${file.name} (${formatSize(file.size)})` : 'Aucun fichier choisi'}
        </span>
        {file && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            aria-label={`Retirer le fichier ${file.name}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <p id={hintId} className="text-sm text-slate-500">
        PDF ou Word, 5 Mo max.
      </p>
    </div>
  );
}

export function RecruitmentPage() {
  const { user, isAuthenticated } = useAuth();
  const formSectionRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const errorFor = (name: FieldName): string | undefined =>
    serverErrors[name] ?? (touched[name] ? validateField(name, form) ?? undefined : undefined);

  const update = <K extends keyof FormState>(name: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name in serverErrors) {
      setServerErrors((prev) => {
        const next = { ...prev };
        delete next[name as FieldName];
        return next;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const touch = (name: FieldName) => setTouched((prev) => ({ ...prev, [name]: true }));

  const goToForm = () => {
    setSubmitted(false);
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById(FIELD_IDS.full_name)?.focus({ preventScroll: true }), 400);
  };

  const invalidFields = VALIDATED_FIELDS.filter((name) => validateField(name, form));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setTouched(Object.fromEntries(VALIDATED_FIELDS.map((n) => [n, true])));

    if (invalidFields.length > 0 || !form.cv) {
      setShowSummary(true);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setShowSummary(false);

    setLoading(true);
    try {
      await recruitmentApi.submit({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        position: form.position.trim(),
        experience: form.experience,
        linkedin: form.linkedin.trim(),
        cv: form.cv,
        cover_letter: form.cover_letter,
        message: form.message.trim(),
        consent: form.consent,
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setTouched({});
      setServerErrors({});
    } catch (err: any) {
      const apiErrors: Record<string, string[]> | undefined = err.response?.status === 422 ? err.response?.data?.errors : undefined;
      if (apiErrors) {
        const mapped: Partial<Record<FieldName, string>> = {};
        for (const name of VALIDATED_FIELDS) {
          if (apiErrors[name]?.[0]) mapped[name] = apiErrors[name][0];
        }
        setServerErrors(mapped);
        setGeneralError(Object.keys(mapped).length ? null : err.response?.data?.message ?? 'Vérifiez les champs du formulaire.');
      } else {
        setGeneralError(
          err.response?.data?.message ||
            'L\'envoi a échoué. Vérifiez votre connexion puis réessayez, ou envoyez votre CV à contact@greentechnologies.ci.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const summaryFields = Array.from(
    new Set<FieldName>([...invalidFields, ...(Object.keys(serverErrors) as FieldName[])])
  );

  return (
    <div className="bg-slate-50 min-h-[85vh]">
      <PageHeader
        title="Rejoignez Green Technologies"
        description="Ingénieurs, techniciens, ouvriers qualifiés, étudiants : construisez avec nous des forages, des centrales solaires, des systèmes d'irrigation et des ouvrages durables en Côte d'Ivoire."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Recrutement' }]}
      >
        <Button variant="primary" size="lg" onClick={() => goToForm()} leftIcon={<UserPlus className="w-4 h-4" />}>
          Envoyer ma candidature
        </Button>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 sm:pb-16 space-y-14 sm:space-y-20">
        {/* Déroulé */}
        <section aria-labelledby="steps-title" className="space-y-6">
          <h2 id="steps-title" className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Comment se passe le recrutement
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {STEPS.map(({ icon: Icon, title, desc }, index) => (
              <li key={title} className="flex items-start gap-4 p-5 sm:p-6 bg-white border border-slate-200/80 rounded-lg">
                <span aria-hidden="true" className="w-9 h-9 shrink-0 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    {title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Candidature */}
        <section
          ref={formSectionRef}
          aria-labelledby="form-title"
          className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
        >
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            <div>
              <h2 id="form-title" className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                Postuler
              </h2>
              <p className="text-slate-600 mt-2 leading-relaxed">
                Candidature spontanée, stage ou alternance : un seul formulaire. Les champs marqués d'un
                <span className="text-red-600 font-semibold"> * </span>
                sont obligatoires.
              </p>
            </div>
            <div className="p-5 bg-white border border-slate-200/80 rounded-lg space-y-3">
              <p className="text-sm font-semibold text-slate-900">Une question sur votre candidature ?</p>
              <a
                href="mailto:contact@greentechnologies.ci?subject=Candidature"
                className="flex items-center gap-2.5 min-h-11 text-sm text-slate-700 hover:text-emerald-800"
              >
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                contact@greentechnologies.ci
              </a>
              <a href="tel:+2250704901034" className="flex items-center gap-2.5 min-h-11 text-sm text-slate-700 hover:text-emerald-800">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                +225 07 04 90 10 34
              </a>
            </div>
          </aside>

          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-lg p-5 sm:p-8 lg:p-10">
            {submitted ? (
              <div role="status" className="text-center py-8 sm:py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
                </div>
                <h3 ref={successRef} tabIndex={-1} className="text-2xl font-bold text-slate-900 font-display focus:outline-none">
                  Candidature envoyée
                </h3>
                <p className="text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                  Merci pour votre intérêt. Nous étudions votre profil et vous recontacterons s'il correspond à un besoin.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="md" onClick={() => setSubmitted(false)}>
                    Envoyer une autre candidature
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {showSummary && summaryFields.length > 0 && (
                  <div
                    ref={summaryRef}
                    tabIndex={-1}
                    role="alert"
                    aria-labelledby="form-errors-title"
                    className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <p id="form-errors-title" className="font-bold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                      {summaryFields.length === 1 ? 'Un champ est à corriger' : `${summaryFields.length} champs sont à corriger`}
                    </p>
                    <ul className="mt-2 ml-7 list-disc space-y-1 text-sm">
                      {summaryFields.map((name) => (
                        <li key={name}>
                          <a
                            href={`#${FIELD_IDS[name]}`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(FIELD_IDS[name])?.focus();
                            }}
                            className="underline underline-offset-2"
                          >
                            {FIELD_LABELS[name]}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {generalError && (
                  <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="flex-1 font-medium">{generalError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                  <div className="sm:col-span-2">
                    <Input
                      id={FIELD_IDS.full_name}
                      label="Nom & prénoms"
                      required
                      autoComplete="name"
                      value={form.full_name}
                      onChange={(e) => update('full_name', e.target.value)}
                      onBlur={() => touch('full_name')}
                      error={errorFor('full_name')}
                    />
                  </div>

                  <Input
                    id={FIELD_IDS.email}
                    label="E-mail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    onBlur={() => touch('email')}
                    error={errorFor('email')}
                  />
                  <Input
                    id={FIELD_IDS.phone}
                    label="Téléphone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    placeholder="Ex : 07 15 25 89 89"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    onBlur={() => touch('phone')}
                    error={errorFor('phone')}
                  />

                  <Input
                    id="candidature-ville"
                    label="Ville de résidence"
                    autoComplete="address-level2"
                    placeholder="Ex : Abidjan"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    maxLength={100}
                  />
                  <Input
                    id={FIELD_IDS.position}
                    label="Poste ou domaine visé"
                    required
                    placeholder="Ex : Technicien de forage…"
                    value={form.position}
                    onChange={(e) => update('position', e.target.value)}
                    onBlur={() => touch('position')}
                    error={errorFor('position')}
                    maxLength={150}
                  />

                  <Select
                    id="candidature-experience"
                    label="Niveau d'expérience"
                    value={form.experience}
                    onChange={(e) => update('experience', e.target.value)}
                  >
                    <option value="">Sélectionner…</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    id={FIELD_IDS.linkedin}
                    label="Profil LinkedIn"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://linkedin.com/in/…"
                    value={form.linkedin}
                    onChange={(e) => update('linkedin', e.target.value)}
                    onBlur={() => touch('linkedin')}
                    error={errorFor('linkedin')}
                  />

                  <FileField
                    id={FIELD_IDS.cv}
                    label="CV"
                    required
                    file={form.cv}
                    error={errorFor('cv')}
                    onChange={(file) => {
                      update('cv', file);
                      touch('cv');
                    }}
                  />
                  <FileField
                    id={FIELD_IDS.cover_letter}
                    label="Lettre de motivation"
                    file={form.cover_letter}
                    error={errorFor('cover_letter')}
                    onChange={(file) => {
                      update('cover_letter', file);
                      touch('cover_letter');
                    }}
                  />

                  <div className="sm:col-span-2">
                    <Textarea
                      id={FIELD_IDS.message}
                      label="Message"
                      rows={5}
                      maxLength={MESSAGE_MAX}
                      placeholder="Présentez-vous en quelques lignes, vos motivations, votre disponibilité…"
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      onBlur={() => touch('message')}
                      error={errorFor('message')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor={FIELD_IDS.consent}
                      className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer ${
                        errorFor('consent') ? 'border-red-500 bg-red-50/50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <input
                        id={FIELD_IDS.consent}
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => {
                          update('consent', e.target.checked);
                          touch('consent');
                        }}
                        aria-invalid={errorFor('consent') ? true : undefined}
                        aria-describedby={errorFor('consent') ? `${FIELD_IDS.consent}-error` : undefined}
                        className="mt-0.5 w-5 h-5 shrink-0 rounded border-slate-400 accent-emerald-700 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700 leading-relaxed">
                        J'accepte que GREEN TECHNOLOGIES BTP conserve mes données et mon CV pour étudier ma candidature et
                        me recontacter dans le cadre d'un recrutement. <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errorFor('consent') && (
                      <p id={`${FIELD_IDS.consent}-error`} className="mt-1.5 text-sm font-medium text-red-600">
                        {errorFor('consent')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="font-bold w-full sm:w-auto"
                  >
                    {loading ? 'Envoi en cours…' : 'Envoyer ma candidature'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecruitmentPage;
