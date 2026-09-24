import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../auth/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, LogIn } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import type { LoginCredentials } from '../../auth/auth.types';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard-test';

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setServerError(null);
    try {
      const credentials: LoginCredentials = {
        email: values.email,
        password: values.password,
      };
      await login(credentials);
      navigate(from, { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setServerError(axiosErr.response?.data?.message || 'Identifiants invalides ou erreur de connexion.');
    }
  };

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20 mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Connexion Espace Sécurisé</h1>
        <p className="text-xs text-slate-400">Accès backoffice Green Technologies</p>
      </div>

      {serverError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="email"
              placeholder="admin@greentechnologies.ci"
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
              placeholder="••••••••"
              {...register('password')}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          <span>{isSubmitting ? 'Connexion en cours...' : 'Se connecter'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        <span>Pas encore de compte ? </span>
        <Link to="/register" className="text-emerald-400 hover:underline font-semibold">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
