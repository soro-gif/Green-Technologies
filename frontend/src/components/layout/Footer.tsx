import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../ui/Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" isLight showText />
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-sm mt-3">
              Acteur de référence en Côte d'Ivoire et dans la sous-région, GREEN TECHNOLOGIES BTP
              conçoit et déploie des solutions durables en hydraulique, énergie solaire,
              agrotechnologies et génie civil.
            </p>
            <div className="pt-2">
              <Link
                to="/devis"
                className="inline-flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300 group"
              >
                <span>Demander une étude personnalisée</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Col 2: Nos 4 Domaines */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm sm:text-base font-['Outfit'] uppercase tracking-wider">
              Nos 4 domaines
            </h5>
            <ul className="space-y-2.5 text-sm sm:text-base text-slate-300">
              <li>
                <Link
                  to="/domaines/eau-hydraulique"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Eau et hydraulique
                </Link>
              </li>
              <li>
                <Link
                  to="/domaines/energie-solaire"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Énergie solaire
                </Link>
              </li>
              <li>
                <Link
                  to="/domaines/agrotechnologies"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Agrotechnologies
                </Link>
              </li>
              <li>
                <Link
                  to="/domaines/btp-genie-civil"
                  className="hover:text-emerald-400 transition-colors"
                >
                  BTP et génie civil
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm sm:text-base font-['Outfit'] uppercase tracking-wider">
              Liens rapides
            </h5>
            <ul className="space-y-2.5 text-sm sm:text-base text-slate-300">
              <li>
                <Link to="/a-propos" className="hover:text-emerald-400 transition-colors">
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition-colors">
                  Catalogue des prestations
                </Link>
              </li>
              <li>
                <Link to="/realisations" className="hover:text-emerald-400 transition-colors">
                  Projets et réalisations
                </Link>
              </li>
              <li>
                <Link to="/actualites" className="hover:text-emerald-400 transition-colors">
                  Actualités et publications
                </Link>
              </li>
              <li>
                <Link to="/devis" className="hover:text-emerald-400 transition-colors">
                  Demande de devis en ligne
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Agences */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm sm:text-base font-['Outfit'] uppercase tracking-wider">
              Siège et contact
            </h5>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Abidjan Cocody Angré les Oscars</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="space-y-0.5">
                  <a href="tel:+2252722584016" className="hover:text-emerald-400 transition-colors block">
                    Fixe : +225 27 22 58 40 16
                  </a>
                  <a href="tel:+2250704901034" className="hover:text-emerald-400 transition-colors block">
                    Tél : +225 07 04 90 10 34
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:contact@greentechnologies.ci" className="hover:text-emerald-400 transition-colors">
                  contact@greentechnologies.ci
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lun - Ven : 08h00 - 18h00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          <p>© {currentYear} Green Technologies BTP SARL. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Mentions légales
            </Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/login" className="text-slate-400 hover:text-emerald-400 transition-colors">
              Espace administration
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
