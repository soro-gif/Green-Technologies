import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Send,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { quotesApi, categoriesApi, servicesApi } from '../api';
import { useAuth } from '../auth/AuthContext';
import type { Category, Service, QuoteRequest } from '../types/models';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export function QuoteRequestPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'request' | 'track'>('request');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    service_id: '',
    full_name: '',
    company: '',
    email: '',
    phone: '',
    city: 'Abidjan',
    service_type: '',
    estimated_budget: '',
    details: '',
  });

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

  const [loading, setLoading] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteRequest | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string[]> = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = ['Veuillez renseigner votre nom complet.'];
    }
    if (!formData.email.trim()) {
      newErrors.email = ['Veuillez renseigner votre adresse email.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = ['Veuillez saisir une adresse email valide.'];
    }
    if (!formData.phone.trim()) {
      newErrors.phone = ['Veuillez renseigner un numéro de téléphone joignable.'];
    }
    if (!formData.city.trim()) {
      newErrors.city = ['Veuillez indiquer la ville du projet.'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tracking State
  const [trackRef, setTrackRef] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackedQuote, setTrackedQuote] = useState<QuoteRequest | null>(null);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data || [])).catch(() => { });
    servicesApi.getPaginated({ per_page: 100 }).then((res) => setServices(res.data || [])).catch(() => { });
  }, []);

  const filteredServices = formData.category_id
    ? services.filter((s) => s.category_id === parseInt(formData.category_id, 10))
    : services;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        service_id: formData.service_id ? parseInt(formData.service_id, 10) : null,
        full_name: formData.full_name,
        company: formData.company || null,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        service_type: formData.service_type || null,
        estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : null,
        details: formData.details,
      };

      const res = await quotesApi.submit(payload);
      setSubmittedQuote(res.data);
      setErrors({});
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || 'Une erreur est survenue lors de la soumission de votre demande.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRef.trim()) return;

    setTrackLoading(true);
    setTrackError('');
    setTrackedQuote(null);

    try {
      const res = await quotesApi.track(trackRef.trim().toUpperCase());
      setTrackedQuote(res.data);
    } catch (err: any) {
      setTrackError('Référence de devis introuvable ou incorrecte.');
    } finally {
      setTrackLoading(false);
    }
  };

  const copyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-[85vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <Badge variant="orange">Étude et chiffrage gratuit sous 48h</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
            Demande de devis et suivi de dossier
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Remplissez notre formulaire pour vos travaux en Côte d'Ivoire ou suivez l'état d'avancement de votre devis.
          </p>

          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-xl mt-4">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'request'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Nouvelle demande de devis
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'track'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Suivre mon devis (Réf. DEV-...)
            </button>
          </div>
        </div>

        {activeTab === 'request' && (
          <div>
            {submittedQuote ? (
              <Card className="p-8 sm:p-12 text-center bg-white border-emerald-200 shadow-xl space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                    Demande de devis enregistrée !
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Merci <span className="font-bold text-slate-800">{submittedQuote.full_name}</span>. Notre bureau d'études analyse votre besoin et vous contactera rapidement.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Votre numéro de référence unique
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-black text-emerald-800 tracking-wider font-mono">
                      {submittedQuote.reference}
                    </span>
                    <button
                      onClick={() => copyReference(submittedQuote.reference)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                      title="Copier la référence"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Conservez cette référence pour suivre l'état de votre devis en ligne.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmittedQuote(null);
                      setFormData({
                        category_id: '',
                        service_id: '',
                        full_name: '',
                        company: '',
                        email: '',
                        phone: '',
                        city: 'Abidjan',
                        service_type: '',
                        estimated_budget: '',
                        details: '',
                      });
                    }}
                  >
                    Nouvelle demande
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setTrackRef(submittedQuote.reference);
                      setActiveTab('track');
                    }}
                  >
                    Suivre ce devis →
                  </Button>
                </div>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {generalError && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{generalError}</div>
                  </div>
                )}

                <Card className="p-6 sm:p-8 bg-white space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                      Vos coordonnées de contact
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nom et prénom"
                      required
                      placeholder="ex: Kouamé Jean"
                      value={formData.full_name}
                      onChange={(e) => {
                        setFormData({ ...formData, full_name: e.target.value });
                        clearFieldError('full_name');
                      }}
                      error={errors.full_name?.[0]}
                    />

                    <Input
                      label="Entreprise / Organisation (optionnel)"
                      placeholder="ex: Coopérative agricole du N'Zi"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />

                    <Input
                      label="Adresse email"
                      type="email"
                      required
                      placeholder="ex: j.kouame@example.ci"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        clearFieldError('email');
                      }}
                      error={errors.email?.[0]}
                    />

                    <Input
                      label="Numéro de téléphone (WhatsApp/Mobile)"
                      type="tel"
                      required
                      placeholder="ex: +225 07 04 90 10 34"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        clearFieldError('phone');
                      }}
                      error={errors.phone?.[0]}
                    />

                    <Input
                      label="Ville / localité du projet"
                      required
                      placeholder="ex: Bouaké, Korhogo, Abidjan, Yamoussoukro..."
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        clearFieldError('city');
                      }}
                      error={errors.city?.[0]}
                      className="sm:col-span-2"
                    />
                  </div>
                </Card>

                <Card className="p-6 sm:p-8 bg-white space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                      Détails du projet et pôle d'expertise
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Domaine d'intervention"
                      value={formData.category_id}
                      onChange={(e) => {
                        const newCatId = e.target.value;
                        setFormData((prev) => {
                          const isStillValid = prev.service_id && services.some(
                            (s) => String(s.id) === prev.service_id && (!newCatId || s.category_id === parseInt(newCatId, 10))
                          );
                          return {
                            ...prev,
                            category_id: newCatId,
                            service_id: isStillValid ? prev.service_id : '',
                          };
                        });
                      }}
                      error={errors.category_id?.[0]}
                    >
                      <option value="">Tous les domaines / sélectionnez un domaine</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Prestation ciblée"
                      value={formData.service_id}
                      onChange={(e) => {
                        const srvId = e.target.value;
                        const matchedSrv = services.find((s) => String(s.id) === srvId);
                        setFormData((prev) => ({
                          ...prev,
                          service_id: srvId,
                          category_id: matchedSrv ? String(matchedSrv.category_id) : prev.category_id,
                        }));
                      }}
                      error={errors.service_id?.[0]}
                      helperText={
                        formData.category_id
                          ? `Prestations filtrées pour : ${categories.find((c) => String(c.id) === formData.category_id)?.name || 'le domaine sélectionné'}`
                          : 'Optionnel — Choisissez une prestation directement ou filtrez par domaine'
                      }
                    >
                      <option value="">Sélectionnez une prestation (optionnel)</option>
                      {formData.category_id ? (
                        filteredServices.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.title}
                          </option>
                        ))
                      ) : (
                        categories.map((cat) => {
                          const catServices = services.filter((s) => s.category_id === cat.id);
                          if (catServices.length === 0) return null;
                          return (
                            <optgroup key={cat.id} label={cat.name}>
                              {catServices.map((srv) => (
                                <option key={srv.id} value={srv.id}>
                                  {srv.title}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })
                      )}
                    </Select>

                    <Input
                      label="Objet spécifique du besoin"
                      placeholder="ex: Forage hydraulique + Pompage solaire 10kW"
                      value={formData.service_type}
                      onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                      className="sm:col-span-2"
                    />

                    <Input
                      label="Budget estimatif indicatif (FCFA)"
                      type="number"
                      placeholder="ex: 15000000"
                      value={formData.estimated_budget}
                      onChange={(e) =>
                        setFormData({ ...formData, estimated_budget: e.target.value })
                      }
                      helperText="Indication facultative pour orienter le dimensionnement"
                      className="sm:col-span-2"
                    />

                    <div className="sm:col-span-2">
                      <Textarea
                        label="Description détaillée de votre besoin et contraintes"
                        required
                        rows={5}
                        placeholder="Précisez les dimensions du terrain, la profondeur estimée, la capacité en m³, les délais souhaités..."
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        error={errors.details?.[0]}
                      />
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
                    <p className="text-xs text-emerald-900 leading-snug">
                      Vos informations sont strictement confidentielles et traitées par notre bureau d'études sous 48h.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    isLoading={loading}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="w-full sm:w-auto font-bold shadow-md"
                  >
                    Envoyer ma demande de devis
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'track' && (
          <Card className="p-8 sm:p-10 bg-white space-y-6">
            <div className="max-w-xl mx-auto text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                Suivi d'un devis en cours
              </h3>
              <p className="text-xs text-slate-500">
                Saisissez votre numéro de référence pour connaître l'état d'avancement de votre dossier.
              </p>
            </div>

            <form onSubmit={handleTrack} className="max-w-md mx-auto flex gap-2">
              <Input
                placeholder="ex: DEV-2026-00001"
                value={trackRef}
                onChange={(e) => setTrackRef(e.target.value.toUpperCase())}
                className="font-mono uppercase font-bold"
              />
              <Button type="submit" variant="primary" isLoading={trackLoading} leftIcon={<Search className="w-4 h-4" />}>
                Vérifier
              </Button>
            </form>

            {trackError && (
              <p className="text-xs text-red-600 font-bold text-center">{trackError}</p>
            )}

            {trackedQuote && (
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400">RÉFÉRENCE</span>
                    <h4 className="text-xl font-black text-slate-900">{trackedQuote.reference}</h4>
                  </div>
                  <Badge
                    variant={
                      trackedQuote.status === 'accepted'
                        ? 'green'
                        : trackedQuote.status === 'quoted'
                          ? 'blue'
                          : trackedQuote.status === 'in_review'
                            ? 'amber'
                            : 'slate'
                    }
                    size="md"
                    dot
                  >
                    {trackedQuote.status_label || trackedQuote.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase">Demandeur</span>
                    <p className="font-bold text-slate-800">{trackedQuote.full_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase">Ville</span>
                    <p className="font-bold text-slate-800">{trackedQuote.city}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase">Domaine</span>
                    <p className="font-bold text-slate-800">{trackedQuote.category?.name || 'Général'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase">Date de demande</span>
                    <p className="font-bold text-slate-800">
                      {new Date(trackedQuote.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {trackedQuote.admin_notes && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                    <span className="font-bold">Note du bureau d'études :</span> {trackedQuote.admin_notes}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
