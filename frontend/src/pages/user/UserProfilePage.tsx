import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Shield } from 'lucide-react';
import { userApi } from '../../api/user.api';
import { useAuth } from '../../auth/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const profileSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
    email: z.string().email('Adresse email invalide'),
    current_password: z.string().optional().or(z.literal('')),
    new_password: z.string().optional().or(z.literal('')),
    new_password_confirmation: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.new_password && data.new_password.length > 0) {
        return data.new_password === data.new_password_confirmation;
      }
      return true;
    },
    {
      message: 'Les nouveaux mots de passe ne correspondent pas',
      path: ['new_password_confirmation'],
    }
  )
  .refine(
    (data) => {
      if (data.new_password && data.new_password.length > 0) {
        return !!data.current_password && data.current_password.length > 0;
      }
      return true;
    },
    {
      message: 'Veuillez renseigner votre mot de passe actuel',
      path: ['current_password'],
    }
  );

type ProfileFormValues = z.infer<typeof profileSchema>;

export function UserProfilePage() {
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await userApi.updateProfile({
        name: values.name,
        email: values.email,
        current_password: values.current_password || undefined,
        new_password: values.new_password || undefined,
        new_password_confirmation: values.new_password_confirmation || undefined,
      });

      setSuccessMessage('Vos informations de profil ont été mises à jour avec succès.');
      reset({
        name: values.name,
        email: values.email,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err: any) {
      console.error(err);
      setServerError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 font-['Outfit']">
          Mon Profil Client
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gérez vos coordonnées de contact et sécurisez votre accès.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Account Info Header */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-lg shadow-xs">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-slate-900">{user?.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {user?.role_label || 'Utilisateur'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {serverError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <Input
            label="Nom et prénom"
            required
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Adresse email"
            type="email"
            required
            {...register('email')}
            error={errors.email?.message}
          />

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Modifier le mot de passe (optionnel)</span>
            </div>

            <Input
              label="Mot de passe actuel"
              type="password"
              placeholder="Requis uniquement si vous changez de mot de passe"
              {...register('current_password')}
              error={errors.current_password?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="Minimum 8 caractères"
                {...register('new_password')}
                error={errors.new_password?.message}
              />

              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                placeholder="Répétez le mot de passe"
                {...register('new_password_confirmation')}
                error={errors.new_password_confirmation?.message}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
