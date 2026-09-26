import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { categoriesApi, servicesApi } from '../../api';
import { userApi } from '../../api/user.api';
import type { Category, Service } from '../../types/models';
import { useAuth } from '../../auth/AuthContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const userQuoteSchema = z.object({
  category_id: z.coerce.number().min(1, 'Veuillez sélectionner un domaine'),
  service_id: z.coerce.number().optional().nullable(),
  phone: z.string().min(8, 'Numéro de téléphone requis (ex: +225 0700000000)'),
  city: z.string().min(2, 'La ville ou localité du chantier est obligatoire'),
  company: z.string().optional().nullable(),
  estimated_budget: z.coerce.number().optional().nullable(),
  details: z.string().min(10, 'Veuillez décrire brièvement votre besoin technique (10 caractères min.)'),
});

type UserQuoteFormValues = z.infer<typeof userQuoteSchema>;

export function UserNewQuotePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserQuoteFormValues>({
    resolver: zodResolver(userQuoteSchema),
    defaultValues: {
      category_id: 0,
      service_id: null,
      phone: '',
      city: '',
      company: '',
      estimated_budget: null,
      details: '',
    },
  });

  const selectedCategoryId = watch('category_id');

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, srvRes] = await Promise.all([
          categoriesApi.getAll(),
          servicesApi.getPaginated({ per_page: 100 }),
        ]);
        setCategories(catRes.data || []);
        setServices(srvRes.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const onSubmit: SubmitHandler<UserQuoteFormValues> = async (values) => {
    setServerError(null);
    try {
      const res = await userApi.submitMyQuote({
        full_name: user?.name || '',
        email: user?.email || '',
        phone: values.phone,
        city: values.city,
        company: values.company || null,
        category_id: Number(values.category_id),
        service_id: values.service_id ? Number(values.service_id) : null,
        estimated_budget: values.estimated_budget ? Number(values.estimated_budget) : null,
        details: values.details,
      });

      setSuccessReference(res.data.reference);
    } catch (err: any) {
      console.error(err);
      setServerError(err.response?.data?.message || 'Erreur lors de la soumission de votre demande.');
    }
  };

  if (successReference) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-6 shadow-xs">
        <div className="inline-flex p-4 bg-emerald-100 text-emerald-700 rounded-2xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Demande de Devis Enregistrée !
          </h2>
          <p className="text-xs text-slate-600">
            Votre dossier a bien été rattaché à votre compte. Notre bureau d'études l'analyse dès à présent.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-xs text-slate-500 font-medium">Référence unique de dossier :</span>
          <p className="text-xl font-mono font-extrabold text-emerald-800 mt-1">{successReference}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/mon-espace/mes-demandes')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Voir mes demandes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSuccessReference(null)}
          >
            Déposer une autre demande
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
          Nouvelle Demande de Devis
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Remplissez les spécifications de votre projet technique pour obtenir un dimensionnement sur mesure.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
          {serverError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {serverError}
            </div>
          )}

          {/* User readonly summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Demandeur</span>
              <p className="font-bold text-slate-900">{user?.name}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Email du compte</span>
              <p className="font-bold text-slate-900">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pôle / Domaine d'intervention"
              required
              {...register('category_id')}
              error={errors.category_id?.message}
            >
              <option value="0">Tous les pôles / Sélectionnez un pôle</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Prestation souhaitée"
              {...register('service_id', {
                onChange: (e) => {
                  const srvId = Number(e.target.value);
                  const matched = services.find((s) => s.id === srvId);
                  if (matched) {
                    setValue('category_id', matched.category_id);
                  }
                },
              })}
              error={errors.service_id?.message}
            >
              <option value="">Sélectionnez une prestation (optionnel)</option>
              {Number(selectedCategoryId) > 0 ? (
                services
                  .filter((s) => s.category_id === Number(selectedCategoryId))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Téléphone de contact"
              required
              placeholder="+225 0700000000"
              {...register('phone')}
              error={errors.phone?.message}
            />

            <Input
              label="Ville / Localité du chantier"
              required
              placeholder="Ex: Abidjan, Yamoussoukro..."
              {...register('city')}
              error={errors.city?.message}
            />

            <Input
              label="Entreprise / Structure (optionnel)"
              placeholder="Ex: Coopérative, Mairie, Particulier"
              {...register('company')}
              error={errors.company?.message}
            />
          </div>

          <Input
            label="Budget estimé en FCFA (optionnel)"
            type="number"
            placeholder="Ex: 5000000"
            {...register('estimated_budget')}
            error={errors.estimated_budget?.message}
          />

          <Textarea
            label="Description détaillée des besoins techniques"
            required
            rows={4}
            placeholder="Précisez votre besoin : débit requis, superficie à irriguer, puissance solaire souhaitée, type de bâtiment BTP..."
            {...register('details')}
            error={errors.details?.message}
          />

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/mon-espace')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Transmettre ma demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
