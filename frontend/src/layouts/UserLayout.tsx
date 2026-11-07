import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  User as UserIcon,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../auth/AuthContext';
import { ScrollToTop } from '../components/common/ScrollToTop';

export function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Vue d\'ensemble', path: '/mon-espace', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Mes Demandes de Devis', path: '/mon-espace/mes-demandes', icon: <FileText className="w-4 h-4" /> },
    { label: 'Nouveau Devis', path: '/mon-espace/nouveau-devis', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Mon Profil', path: '/mon-espace/profil', icon: <UserIcon className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/mon-espace') {
      return location.pathname === '/mon-espace';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans']">
      <ScrollToTop />
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Portal Label */}
            <div className="flex items-center gap-4 min-w-0">
              <Logo size="md" />
              <span className="hidden 2xl:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Espace Client
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                    isActive(item.path)
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right User Actions */}
            <div className="hidden xl:flex items-center gap-3 min-w-0">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-slate-500 hover:text-slate-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Site public</span>
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[120px]">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="flex items-center gap-2 xl:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="drawer-enter xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-3 max-h-[calc(100dvh-4rem)] overflow-y-auto">
            <div className="p-3 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sortir</span>
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-bold ${
                    isActive(item.path)
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 px-3 py-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour au site public</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          GREEN TECHNOLOGIES BTP • Espace client sécurisé • Abidjan et Bouaké, Côte d'Ivoire
        </div>
      </footer>
    </div>
  );
}
