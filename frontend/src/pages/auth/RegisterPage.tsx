import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import type { RegisterCredentials } from '../../auth/auth.types';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
    email: z.string().email('Adresse email invalide'),
    password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
    password_confirmation: z.string().min(1, 'La confirmation est obligatoire'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setServerError(null);
    try {
      const credentials: RegisterCredentials = {
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      };
      await registerUser(credentials);
      navigate('/', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      const responseData = axiosErr.response?.data;

      // Map backend validation errors to form fields if available
      if (responseData?.errors && typeof responseData.errors === 'object') {
        const backendErrors = responseData.errors as Record<string, string[]>;
        if (backendErrors.name?.[0]) {
          setError('name', { message: backendErrors.name[0] });
        }
        if (backendErrors.email?.[0]) {
          setError('email', { message: backendErrors.email[0] });
        }
        if (backendErrors.password?.[0]) {
          setError('password', { message: backendErrors.password[0] });
        }
        if (backendErrors.password_confirmation?.[0]) {
          setError('password_confirmation', { message: backendErrors.password_confirmation[0] });
        }

        const firstErrorKey = Object.keys(backendErrors)[0];
        if (firstErrorKey && backendErrors[firstErrorKey]?.[0]) {
          setServerError(backendErrors[firstErrorKey][0]);
          return;
        }
      }

      setServerError(
        responseData?.message || 'Une erreur est survenue lors de la création du compte.'
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <Logo size="md" className="justify-center mb-3" />
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] tracking-tight">
            Création de Compte
          </h1>
          <p className="text-xs text-slate-500">
            Rejoindre l'espace professionnel GREEN TECHNOLOGIES BTP
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nom et prénoms
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ex: Soro Lamoussa"
                {...register('name')}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Adresse email professionnelle
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="nom@greentechnologies.ci"
                {...register('email')}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Minimum 8 caractères"
                {...register('password')}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Confirmer votre mot de passe"
                {...register('password_confirmation')}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
            {errors.password_confirmation && (
              <p className="text-red-600 text-xs mt-1">{errors.password_confirmation.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="w-full font-bold shadow-none mt-2"
          >
            Créer mon compte
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3 text-xs">
          <div className="text-slate-600">
            <span>Déjà un compte ? </span>
            <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-bold">
              Se connecter
            </Link>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retourner au site public</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
