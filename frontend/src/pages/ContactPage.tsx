import { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { contactApi } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function ContactPage() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
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
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

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
      newErrors.full_name = ['Veuillez renseigner votre nom et prénom.'];
    }
    if (!formData.email.trim()) {
      newErrors.email = ['Veuillez saisir votre adresse email.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = ['Veuillez saisir une adresse email valide.'];
    }
    if (!formData.subject.trim()) {
      newErrors.subject = ['Veuillez indiquer l\'objet de votre message.'];
    }
    if (!formData.message.trim()) {
      newErrors.message = ['Veuillez rédiger votre message.'];
    } else if (formData.message.trim().length < 10) {
      newErrors.message = ['Votre message doit contenir au moins 10 caractères.'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await contactApi.submit(formData);
      setSubmitted(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setErrors({});
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-[85vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
            Contactez notre équipe
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Une question technique ou un projet à dimensionner ? Nos ingénieurs vous répondent dans les plus brefs délais.
          </p>
        </div>

        {/* Main Grid: Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Coordonnées (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-8 bg-white border border-slate-200/80 shadow-sm rounded-3xl space-y-6">
              <div>
                <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 mb-1">
                  Coordonnées directes
                </h3>
                <p className="text-sm text-slate-500">
                  Nos bureaux sont à votre disposition du lundi au vendredi.
                </p>
              </div>

              <div className="space-y-5 pt-2">
                {/* Siège Abidjan */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Siège social</h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Abidjan Cocody, Angré les Oscars
                    </p>
                  </div>
                </div>

                {/* Téléphones Directs */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 shrink-0 border border-orange-100">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Téléphones</h4>
                    <div className="mt-1 text-sm font-semibold text-emerald-700 flex flex-col space-y-1">
                      <a href="tel:+2252722584016" className="hover:underline flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Fixe :</span>
                        <span>+225 27 22 58 40 16</span>
                      </a>
                      <a href="tel:+2250704901034" className="hover:underline flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Tél :</span>
                        <span>+225 07 04 90 10 34</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0 border border-sky-100">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Courrier électronique</h4>
                    <a
                      href="mailto:contact@greentechnologies.ci"
                      className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors block mt-0.5"
                    >
                      contact@greentechnologies.ci
                    </a>
                  </div>
                </div>

                {/* Horaires */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0 border border-slate-200">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Horaires</h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Lundi – Vendredi : 08h00 – 18h00
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <div className="pt-4 border-t border-slate-100">
                <a
                  href="tel:+2252722584016"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-700/15 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Appeler un conseiller
                </a>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <Card className="p-8 sm:p-10 bg-white border border-slate-200/80 shadow-sm rounded-3xl">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                      Message transmis avec succès !
                    </h3>
                    <p className="text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                      Merci pour votre prise de contact. Notre équipe vous répondra sous 24h ouvrées.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setSubmitted(false)}
                      leftIcon={<MessageSquare className="w-4 h-4" />}
                    >
                      Envoyer un autre message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                      Laissez-nous un message
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Remplissez ce formulaire pour être recontacté sous 24h ouvrées.
                    </p>
                  </div>

                  {generalError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{generalError}</div>
                    </div>
                  )}

                  {/* Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nom et prénom"
                      required
                      placeholder="ex: Yao Koffi"
                      value={formData.full_name}
                      onChange={(e) => {
                        setFormData({ ...formData, full_name: e.target.value });
                        clearFieldError('full_name');
                      }}
                      error={errors.full_name?.[0]}
                    />

                    <Input
                      label="Adresse email"
                      type="email"
                      required
                      placeholder="ex: y.koffi@example.ci"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        clearFieldError('email');
                      }}
                      error={errors.email?.[0]}
                    />

                    <Input
                      label="Numéro de téléphone"
                      type="tel"
                      placeholder="ex: +225 01 02 03 04 05"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        clearFieldError('phone');
                      }}
                      error={errors.phone?.[0]}
                    />

                    <Input
                      label="Objet du message"
                      required
                      placeholder="ex: Renseignements station d'épuration..."
                      value={formData.subject}
                      onChange={(e) => {
                        setFormData({ ...formData, subject: e.target.value });
                        clearFieldError('subject');
                      }}
                      error={errors.subject?.[0]}
                    />

                    <div className="sm:col-span-2">
                      <Textarea
                        label="Votre message ou description du besoin"
                        required
                        rows={4}
                        placeholder="Précisez votre demande, localisation ou toute information utile..."
                        value={formData.message}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value });
                          clearFieldError('message');
                        }}
                        error={errors.message?.[0]}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      leftIcon={<Send className="w-4 h-4" />}
                      className="font-bold shadow-lg shadow-emerald-700/20 w-full sm:w-auto"
                    >
                      Envoyer le message
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
