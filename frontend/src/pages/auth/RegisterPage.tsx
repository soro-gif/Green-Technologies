import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import type { RegisterCredentials } from '../../auth/auth.types';

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
  password_confirmation: z.string().min(1, 'La confirmation est obligatoire'),
}).refine((data) => data.password === data.password_confirmation, {
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
      navigate('/dashboard-test', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setServerError(axiosErr.response?.data?.message || 'Erreur lors de la création du compte.');
    }
  };

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20 mb-3">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Création de Compte</h1>
        <p className="text-xs text-slate-400">Rejoindre l'équipe Green Technologies</p>
      </div>

      {serverError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Nom & Prénoms</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Kouassi Jean"
              {...register('name')}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="email"
              placeholder="k.jean@greentechnologies.ci"
              {...register('email')}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="password"
              placeholder="Minimum 8 caractères"
              {...register('password')}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmer le mot de passe</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="password"
              placeholder="Confirmer votre mot de passe"
              {...register('password_confirmation')}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {errors.password_confirmation && (
            <p className="text-rose-400 text-xs mt-1">{errors.password_confirmation.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isSubmitting ? 'Création en cours...' : 'Créer mon compte'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        <span>Déjà inscrit ? </span>
        <Link to="/login" className="text-emerald-400 hover:underline font-semibold">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
