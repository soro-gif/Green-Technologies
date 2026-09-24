import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ShieldCheck, User, Key, LogOut, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';
import api from '../api/client';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';

export function DashboardTestPage() {
  const { user, logout } = useAuth();
  const [adminCheckResult, setAdminCheckResult] = useState<string | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  const testAdminAccess = async () => {
    setAdminCheckLoading(true);
    setAdminCheckResult(null);
    setAdminCheckError(null);
    try {
      const res = await api.get('/admin/dashboard-check');
      setAdminCheckResult(res.data.message || 'Accès admin validé avec succès !');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setAdminCheckError(axiosErr.response?.data?.message || 'Accès refusé par le middleware de sécurité.');
    } finally {
      setAdminCheckLoading(false);
    }
  };

  const testSuperAdminAccess = async () => {
    setAdminCheckLoading(true);
    setAdminCheckResult(null);
    setAdminCheckError(null);
    try {
      const res = await api.get('/admin/users-manage-check');
      setAdminCheckResult(res.data.message || 'Permission users.manage validée !');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setAdminCheckError(axiosErr.response?.data?.message || 'Permission refusée par le middleware RBAC.');
    } finally {
      setAdminCheckLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Espace Protégé & Profil Connecté</h1>
            <p className="text-xs text-slate-400">Vérification de l'identité et du système de rôles / permissions (RBAC)</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>

      {/* User Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Informations Utilisateur</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-400">
            <p><span className="text-slate-500">Nom :</span> <strong className="text-white">{user?.name}</strong></p>
            <p><span className="text-slate-500">Email :</span> <strong className="text-white">{user?.email}</strong></p>
            <p>
              <span className="text-slate-500">Rôle :</span>{' '}
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {user?.role_label} ({user?.role})
              </span>
            </p>
            <p>
              <span className="text-slate-500">Statut compte :</span>{' '}
              <span className="text-emerald-400 font-medium">Actif</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Permissions Accordées</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user?.permissions && user.permissions.length > 0 ? (
              user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-1 bg-slate-900 border border-slate-700/60 rounded text-[10px] font-mono text-emerald-300"
                >
                  {perm}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">Aucune permission spécifique</span>
            )}
          </div>
        </div>
      </div>

      {/* RBAC Security Test Buttons */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center space-x-2 text-sm font-semibold text-white">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Tests des Middlewares de Sécurité (Role & Permission)</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={testAdminAccess}
            disabled={adminCheckLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            Tester Route Admin (role:super_admin,admin)
          </button>

          <button
            onClick={testSuperAdminAccess}
            disabled={adminCheckLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            Tester Permission (permission:users.manage)
          </button>
        </div>

        {adminCheckResult && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{adminCheckResult}</span>
          </div>
        )}

        {adminCheckError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{adminCheckError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
