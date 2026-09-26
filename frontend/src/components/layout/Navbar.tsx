import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Phone,
  Smartphone,
  Mail,
  MapPin,
  FileText,
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../auth/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [domainsOpen, setDomainsOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setDomainsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Accueil', to: '/' },
    { name: 'À propos', to: '/a-propos' },
    {
      name: 'Nos domaines',
      to: '/domaines',
      hasDropdown: true,
    },
    { name: 'Services', to: '/services' },
    { name: 'Réalisations', to: '/realisations' },
    { name: 'Actualités', to: '/actualites' },
    { name: 'Contact', to: '/contact' },
  ];

  const domainSubmenu = [
    {
      title: 'Eau et hydraulique',
      slug: 'eau-hydraulique',
      desc: 'Forages, pompage et châteaux d\'eau',
    },
    {
      title: 'Énergie solaire',
      slug: 'energie-solaire',
      desc: 'Centrales solaires et électrification rurale',
    },
    {
      title: 'Agrotechnologies',
      slug: 'agrotechnologies',
      desc: 'Systèmes d\'irrigation et serres intelligentes',
    },
    {
      title: 'BTP et génie civil',
      slug: 'btp-genie-civil',
      desc: 'Bâtiments durables, voiries et génie civil',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Banner (Contact info & Emergency Hotline) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-3 sm:px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="inline-flex items-center gap-2.5 sm:gap-4 flex-wrap">
              <a
                href="tel:+2252722584016"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors text-[11px] sm:text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Fixe : +225 27 22 58 40 16</span>
              </a>
              <a
                href="tel:+2250704901034"
                className="hidden xs:inline-flex items-center gap-1.5 hover:text-white transition-colors text-[11px] sm:text-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tél : +225 07 04 90 10 34</span>
              </a>
            </div>
            <a
              href="mailto:contact@greentechnologies.ci"
              className="hidden md:inline-flex items-center gap-1.5 hover:text-white transition-colors text-xs"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>contact@greentechnologies.ci</span>
            </a>
            <div className="hidden lg:inline-flex items-center gap-1.5 text-slate-400 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Abidjan Cocody Angré</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium shrink-0 ml-auto">
            <span className="hidden sm:inline-block text-emerald-400 font-semibold text-[11px] sm:text-xs">
              ● Devis sous 48h
            </span>
            {isAuthenticated ? (
              user?.role !== 'user' ? (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors font-semibold text-[11px] sm:text-xs"
                >
                  <LayoutDashboard className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Admin ({user?.name.split(' ')[0]})</span>
                </Link>
              ) : (
                <Link
                  to="/mon-espace"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors font-semibold text-[11px] sm:text-xs"
                >
                  <UserIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Mon espace ({user?.name.split(' ')[0]})</span>
                </Link>
              )
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white text-[11px] sm:text-xs"
              >
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Espace client / pro</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setDomainsOpen(true)}
                    onMouseLeave={() => setDomainsOpen(false)}
                  >
                    <Link
                      to={link.to}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive(link.to)
                          ? 'text-emerald-800 bg-emerald-50'
                          : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                        }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Link>

                    {/* Dropdown Menu */}
                    <div
                      className={`absolute top-full left-0 w-80 bg-white rounded-lg border border-slate-200 p-2 shadow-sm transition-all duration-150 ${domainsOpen
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible -translate-y-1'
                        }`}
                    >
                      <div className="p-2 border-b border-slate-100 mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          4 pôles stratégiques
                        </p>
                      </div>
                      {domainSubmenu.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={`/domaines/${sub.slug}`}
                          className="block p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-sm font-bold text-slate-900 hover:text-emerald-800">
                            {sub.title}
                          </p>
                          <p className="text-xs text-slate-500 leading-tight mt-0.5">{sub.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive(link.to)
                      ? 'text-emerald-800 bg-emerald-50'
                      : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/devis"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Demander un devis</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            aria-label="Menu principal"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                if (link.hasDropdown) {
                  return (
                    <div key={link.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Link
                          to={link.to}
                          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold ${isActive(link.to)
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          <span>{link.name}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDomainsOpen(!domainsOpen)}
                          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                          aria-label="Afficher les sous-domaines"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${domainsOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {domainsOpen && (
                        <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-emerald-500 ml-3">
                          {domainSubmenu.map((sub) => (
                            <Link
                              key={sub.slug}
                              to={`/domaines/${sub.slug}`}
                              className="block px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-slate-50 rounded-lg"
                            >
                              <span>{sub.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.to}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${isActive(link.to)
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4 flex flex-col gap-2">
                <Link
                  to="/devis"
                  className="w-full inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold py-2.5 rounded-lg"
                >
                  <FileText className="w-4 h-4" />
                  <span>Demander un devis</span>
                </Link>
                {isAuthenticated ? (
                  user?.role !== 'user' ? (
                    <Link
                      to="/admin/dashboard"
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2.5 rounded-lg"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Accéder à l'administration</span>
                    </Link>
                  ) : (
                    <Link
                      to="/mon-espace"
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold py-2.5 rounded-lg"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Accéder à mon espace client</span>
                    </Link>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold py-2.5 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Connexion espace client / pro</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
