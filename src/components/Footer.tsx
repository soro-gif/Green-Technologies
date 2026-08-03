"use client";

import React, { useState } from "react";
import Logo from "@/components/Logo";
import { Phone, Mail, MapPin, Send, CheckCircle2, ArrowRight } from "lucide-react";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 pt-20 pb-12 border-t border-slate-800 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-800">
          
          {/* Col 1: Brand & Slogan (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="text-left">
              <Logo variant="full" showTagline={true} />
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Green Technologies est l'entreprise leader en Côte d'Ivoire spécialisée dans l'ingénierie de l'eau, l'énergie solaire photovoltaïque, les agrotechnologies et les équipements BTP.
            </p>

            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green block mb-2">
                Inscrivez-vous à notre Newsletter Technique :
              </span>
              {!subscribed ? (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Votre adresse email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-brand-green focus:outline-none flex-1"
                  />
                  <button
                    type="submit"
                    className="p-3 rounded-xl bg-brand-green hover:bg-emerald-600 text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-brand-green/20 text-brand-glow text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Merci ! Vous êtes inscrit aux actualités Green Technologies.</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 2: Navigation Rapide (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              {["Accueil", "Nos Domaines", "Positionnement", "Pourquoi Nous", "Réalisations", "Processus", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(" ", "")}`}
                    className="hover:text-brand-green transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3 h-3 text-brand-green" />
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Domaines d'Activité (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              Pôles Techniques
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>• Purification & Potabilisation Eau OMS</li>
              <li>• Forage Hydraulique & Châteaux d'Eau</li>
              <li>• Panneaux Solaires & Autonomie 24/7</li>
              <li>• Pompage Solaire Agricole Sans Batterie</li>
              <li>• Irrigation Intelligente Goutte-à-Goutte</li>
              <li>• Serres Agricoles Climat Contrôlé</li>
              <li>• Matériels BTP & Génie Civil</li>
            </ul>
          </div>

          {/* Col 4: Coordonnées Abidjan (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              Contact Siège Abidjan
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                <span>Cocody II Plateaux Latrille, Abidjan, Côte d'Ivoire</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-green flex-shrink-0" />
                <a href="tel:+2250704901064" className="hover:text-brand-green transition-colors font-semibold">
                  +225 07 04 90 10 64
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-green flex-shrink-0" />
                <a href="mailto:greentechnologiesbtp@gmail.com" className="hover:text-brand-green transition-colors">
                  greentechnologiesbtp@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-300">Green Technologies BTP</strong>. Tous droits réservés.
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-slate-300 transition-colors">Mentions Légales</a>
            <a href="#hero" className="hover:text-slate-300 transition-colors">Politique de Confidentialité</a>
            <a href="#hero" className="hover:text-slate-300 transition-colors">Normes & Certifications</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
