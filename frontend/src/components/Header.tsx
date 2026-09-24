import { Globe, ShieldCheck, LogIn, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">GREEN TECHNOLOGIES</span>
        </Link>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>API v1 & RBAC</span>
          </div>

          {isAuthenticated && user ? (
            <Link
              to="/dashboard-test"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white font-medium transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user.name.split(' ')[0]} ({user.role})</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
