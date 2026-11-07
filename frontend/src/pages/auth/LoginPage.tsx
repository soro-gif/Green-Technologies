import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../auth/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, LogIn, ArrowLeft } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import type { LoginCredentials } from '../../auth/auth.types';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

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
      const loggedUser = await login(credentials);
      if (loggedUser.role === 'user') {
        navigate('/', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setServerError(
        axiosErr.response
          ? axiosErr.response.data?.message || 'Identifiants invalides ou compte désactivé.'
          : 'Connexion au serveur impossible. Vérifiez votre réseau, puis réessayez.'
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-lg p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-2xl font-semibold text-slate-900 font-display tracking-tight">
            Espace Collaborateur
          </h1>
          <p className="text-xs text-slate-500">
            Connexion sécurisée au panneau d'administration GREEN TECHNOLOGIES
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Adresse email professionnelle
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                placeholder="vous@entreprise.ci"
                {...register('email')}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-base text-slate-900 placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
              />
            </div>
            {errors.email && <p id="login-email-error" className="text-red-600 text-sm mt-1 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-base text-slate-900 placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
              />
            </div>
            {errors.password && <p id="login-password-error" className="text-red-600 text-sm mt-1 font-medium">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<LogIn className="w-4 h-4" />}
            className="w-full font-bold mt-2"
          >
            Se connecter
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-emerald-700 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au site public</span>
          </Link>
          <Link to="/register" className="text-emerald-700 hover:underline font-bold">
            Inscription
          </Link>
        </div>
      </div>
    </div>
  );
}
