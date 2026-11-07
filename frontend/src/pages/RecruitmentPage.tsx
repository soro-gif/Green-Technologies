import { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Users,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { contactApi } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { JOB_PROFILES } from '../data/jobs';

const SPONTANEOUS = 'candidature-spontanee';

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  position: SPONTANEOUS,
  cv_link: '',
  message: '',
};

const ADVANTAGES = [
  {
    icon: Users,
    title: 'Des projets utiles',
    desc: 'Eau potable, énergie et agriculture pour les communautés de Côte d\'Ivoire.',
  },
  {
    icon: GraduationCap,
    title: 'Montée en compétences',
    desc: 'Formation sur le terrain auprès d\'ingénieurs expérimentés.',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité avant tout',
    desc: 'Équipements fournis et procédures de chantier encadrées.',
  },
];

export function RecruitmentPage() {
  const { user, isAuthenticated } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user, isAuthenticated]);

  const update = (field: keyof typeof EMPTY_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const applyTo = (slug: string) => {
    update('position', slug);
    setSubmitted(false);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = (): boolean => {
    const next: Record<string, string[]> = {};
    if (!formData.full_name.trim()) next.full_name = ['Veuillez renseigner votre nom et prénom.'];
    if (!formData.email.trim()) {
      next.email = ['Veuillez saisir votre adresse email.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = ['Veuillez saisir une adresse email valide.'];
    }
    if (formData.cv_link.trim() && !/^https?:\/\/\S+$/i.test(formData.cv_link.trim())) {
      next.cv_link = ['Le lien doit commencer par http:// ou https://.'];
    }
    if (formData.message.trim().length < 30) {
      next.message = ['Présentez-vous en quelques lignes (30 caractères minimum).'];
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validate()) return;

    const job = JOB_PROFILES.find((j) => j.slug === formData.position);
    const positionLabel = job ? job.title : 'Candidature spontanée';
    const body = [
      `Poste visé : ${positionLabel}`,
      formData.cv_link.trim() ? `CV / profil : ${formData.cv_link.trim()}` : null,
      '',
      formData.message.trim(),
    ]
      .filter((line) => line !== null)
      .join('\n');

    setLoading(true);
    try {
      await contactApi.submit({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: `Candidature – ${positionLabel}`,
        message: body,
      });
      setSubmitted(true);
      setFormData(EMPTY_FORM);
      setErrors({});
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(
          err.response?.data?.message ||
            'Une erreur est survenue lors de l\'envoi de votre candidature. Veuillez réessayer.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const positionOptions = [
    { value: SPONTANEOUS, label: 'Candidature spontanée' },
    ...JOB_PROFILES.map((j) => ({ value: j.slug, label: j.title })),
  ];

  return (
    <div className="bg-slate-50 min-h-[85vh]">
      <PageHeader
        title="Rejoignez Green Technologies"
        description="Ingénieurs, techniciens, conducteurs de travaux ou étudiants : participez à des projets d'eau, d'énergie et d'infrastructures durables."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Recrutement' }]}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => applyTo(SPONTANEOUS)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Envoyer ma candidature
        </Button>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 sm:pb-16 space-y-10 sm:space-y-14">
        {/* Pourquoi nous rejoindre */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start md:flex-col lg:flex-row gap-3.5 p-5 lg:p-6 bg-white border border-slate-200/80 rounded-lg"
            >
              <div className="p-2.5 rounded-md bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-100">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Profils recherchés */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Profils recherchés</h2>
            <p className="text-slate-600 mt-1">
              Votre profil n'apparaît pas ? Les candidatures spontanées sont les bienvenues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {JOB_PROFILES.map((job) => (
              <Card
                key={job.slug}
                className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-lg flex flex-col md:last:odd:col-span-2 lg:last:odd:col-span-1"
              >
                <p className="text-xs font-semibold text-emerald-700">{job.pole}</p>
                <h3 className="text-lg font-bold text-slate-900 font-display mt-1">{job.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {job.contract}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-3">{job.summary}</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-700 list-disc pl-5">
                  {job.missions.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <Button variant="outline" size="md" className="w-full" onClick={() => applyTo(job.slug)}>
                    Postuler
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Formulaire de candidature */}
        <section ref={formRef} className="scroll-mt-28 max-w-3xl mx-auto">
          <Card className="p-5 sm:p-8 lg:p-10 bg-white border border-slate-200/80 rounded-lg">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">Candidature transmise !</h3>
                <p className="text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                  Merci pour votre intérêt. Notre équipe étudie votre profil et vous recontactera si votre candidature
                  correspond à nos besoins.
                </p>
                <div className="pt-4">
                  <Button variant="outline" size="md" onClick={() => setSubmitted(false)}>
                    Envoyer une autre candidature
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-bold text-slate-900 font-display">Postuler</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Joignez un lien vers votre CV (Google Drive, Dropbox, LinkedIn…) ou envoyez-le à{' '}
                    <a href="mailto:contact@greentechnologies.ci" className="text-emerald-700 underline underline-offset-2">
                      contact@greentechnologies.ci
                    </a>
                    .
                  </p>
                </div>

                {generalError && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{generalError}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nom et prénom"
                    required
                    placeholder="ex: Yao Koffi"
                    value={formData.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    error={errors.full_name?.[0]}
                  />
                  <Input
                    label="Adresse email"
                    type="email"
                    required
                    placeholder="ex: y.koffi@example.ci"
                    value={formData.email}
                    onChange={(e) => update('email', e.target.value)}
                    error={errors.email?.[0]}
                  />
                  <Input
                    label="Numéro de téléphone"
                    type="tel"
                    placeholder="ex: +225 01 02 03 04 05"
                    value={formData.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    error={errors.phone?.[0]}
                  />
                  <Select
                    label="Poste visé"
                    value={formData.position}
                    onChange={(e) => update('position', e.target.value)}
                    options={positionOptions}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Lien vers votre CV ou profil"
                      type="url"
                      placeholder="https://..."
                      value={formData.cv_link}
                      onChange={(e) => update('cv_link', e.target.value)}
                      error={errors.cv_link?.[0]}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      label="Présentez-vous"
                      required
                      rows={5}
                      maxLength={4500}
                      placeholder="Formation, expériences, disponibilité, motivations..."
                      value={formData.message}
                      onChange={(e) => update('message', e.target.value)}
                      error={errors.message?.[0]}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="font-bold w-full sm:w-auto"
                  >
                    Envoyer ma candidature
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

export default RecruitmentPage;
