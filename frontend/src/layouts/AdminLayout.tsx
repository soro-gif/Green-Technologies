import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Mail,
  Layers,
  FolderKanban,
  Newspaper,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Shield,
  MessageSquareQuote,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../components/ui/Logo';
import { ScrollToTop } from '../components/common/ScrollToTop';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Tableau de bord',
      to: '/admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Demandes de devis',
      to: '/admin/devis',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: 'Messages de contact',
      to: '/admin/messages',
      icon: <Mail className="w-4 h-4" />,
    },
    {
      label: 'Actualités et blog',
      to: '/admin/articles',
      icon: <Newspaper className="w-4 h-4" />,
      quickAction: {
        to: '/admin/articles?action=new',
        title: 'Rédiger une actualité',
      },
    },
    {
      label: 'Médiathèque & images',
      to: '/admin/medias',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      label: 'Pôles et domaines',
      to: '/admin/domaines',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: 'Catalogue des services',
      to: '/admin/services',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: 'Réalisations et projets',
      to: '/admin/projets',
      icon: <FolderKanban className="w-4 h-4" />,
    },
    {
      label: 'Avis et témoignages',
      to: '/admin/temoignages',
      icon: <MessageSquareQuote className="w-4 h-4" />,
    },
    {
      label: 'Collaborateurs et accès',
      to: '/admin/utilisateurs',
      icon: <Users className="w-4 h-4" />,
      requiresSuperAdmin: true,
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <ScrollToTop />
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="min-w-0">
          {/* Logo Header */}
          <div className="px-3.5 py-3 border-b border-slate-800 flex items-center justify-between h-16 min-w-0">
            <Logo size="sm" isLight to="/admin/dashboard" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3 mx-3 my-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-emerald-100 font-bold flex items-center justify-center text-sm uppercase shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Utilisateur'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  {user?.role_label || user?.role || 'Collaborateur'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              if (item.requiresSuperAdmin && user?.role !== 'super_admin') {
                return null;
              }

              const active = isActive(item.to);
              return (
                <div
                  key={item.to}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  <Link
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                  >
                    <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    {active && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1.5">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-orange-400" />
              <span>Voir le Site Public</span>
            </div>
            <span className="text-[10px] text-slate-500">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-medium text-white font-['Outfit']">
              Panneau d'Administration
            </h2>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
