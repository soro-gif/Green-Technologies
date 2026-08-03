"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Sun,
  Sprout,
  HardHat,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Activity,
  Layers,
  Wrench,
  Sparkles,
} from "lucide-react";

interface ServiceItem {
  name: string;
  desc: string;
}

interface Domain {
  id: "eau" | "energie" | "agro" | "btp";
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  bgLight: string;
  image: string;
  overview: string;
  items: ServiceItem[];
}

export default function DomainsSection() {
  const [activeTab, setActiveTab] = useState<"eau" | "energie" | "agro" | "btp">("eau");

  const domains: Domain[] = [
    {
      id: "eau",
      title: "Eau & Hydraulique",
      subtitle: "Solutions de traitement, purification, pompage et distribution",
      badge: "Infrastructures Hydriques",
      icon: Droplets,
      gradient: "from-blue-600 to-cyan-500",
      accentColor: "text-blue-500",
      bgLight: "bg-blue-500/10",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1000&auto=format&fit=crop",
      overview:
        "Spécialiste agréé en ingénierie de l'eau, nous concevons des installations hydrauliques de haute précision pour assurer l'accès à une eau potable, pure et saine partout en Côte d'Ivoire.",
      items: [
        { name: "Forage & Réseaux Hydrauliques", desc: "Étude géophysique, réalisation de forages d'eau et dimensionnement des réseaux de distribution." },
        { name: "Pompage & Distribution", desc: "Installation de pompes immergées, surpresseurs et groupes électropompes de forte capacité." },
        { name: "Traitement, Purification & Filtration", desc: "Systèmes de potabilisation aux normes OMS, stations de déferrisation, osmose inverse et UV." },
        { name: "Adoucissement & Traitement des Eaux", desc: "Solutions contre le calcaire, traitement des eaux usées industrielles et recyclage eau verte." },
        { name: "Réservoirs & Châteaux d'Eau", desc: "Construction et réhabilitation de châteaux d'eau en béton, métal et cuves de grande capacité." },
      ],
    },
    {
      id: "energie",
      title: "Énergie Solaire",
      subtitle: "Autonomie énergétique, installations photovoltaïques & systèmes hybrides",
      badge: "Transition Énergétique",
      icon: Sun,
      gradient: "from-amber-500 to-emerald-500",
      accentColor: "text-amber-500",
      bgLight: "bg-amber-500/10",
      image: "https://images.unsplash.com/photo-1508873696983-2df515122519?q=80&w=1000&auto=format&fit=crop",
      overview:
        "Réduisez vos factures d'électricité et garantissez une continuité d'énergie 24/7 grâce à nos kits solaires clé en main et nos micro-réseaux solaires hybrides.",
      items: [
        { name: "Panneaux Photovoltaïques Tier-1", desc: "Panneaux solaires monocristallins haute performance certifiés avec garantie rendement 25 ans." },
        { name: "Onduleurs & Batteries Lithium", desc: "Stockage d'énergie de pointe avec batteries Lithium LiFePO4 et onduleurs hybrides intelligents." },
        { name: "Pompage Solaire Autonome", desc: "Systèmes de pompage solaire sans batterie ni carburant pour sites isolés et exploitations." },
        { name: "Autonomie Énergétique Clé en Main", desc: "Audits énergétiques, dimensionnement sur-mesure et raccordement sécurisé." },
        { name: "Maintenance & Télégestion", desc: "Supervision à distance de la production solaire et maintenance préventive régulière." },
      ],
    },
    {
      id: "agro",
      title: "Agrotechnologies",
      subtitle: "Irrigation intelligente, automatisation agricole & serres connectées",
      badge: "Agriculture 4.0",
      icon: Sprout,
      gradient: "from-emerald-600 to-lime-500",
      accentColor: "text-emerald-500",
      bgLight: "bg-emerald-500/10",
      image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1000&auto=format&fit=crop",
      overview:
        "Optimisez vos rendements agricoles tout en économisant jusqu'à 60% d'eau grâce à nos technologies d'irrigation de précision et de gestion intelligente de l'eau.",
      items: [
        { name: "Irrigation Intelligente Goutte-à-Goutte", desc: "Projets de fertirrigation automatisée pilotables par capteurs ou smartphone." },
        { name: "Agriculture Connectée & Capteurs", desc: "Sondes d'humidité du sol, stations météo autonomes et régulation automatisée." },
        { name: "Pompage Solaire Agricole", desc: "Alimentation solaire directe pour la distribution d'eau sur grands périmètres." },
        { name: "Serres Intelligentes & Automatisation", desc: "Serres à micro-climat contrôlé pour cultures maraîchères et pépinières." },
        { name: "Équipements & Gestion De l'Eau", desc: "Retenues d'eau, geomembranes, filtration d'eau d'irrigation et réutilisation." },
      ],
    },
    {
      id: "btp",
      title: "BTP & Génie Civil",
      subtitle: "Matériels de chantier, infrastructures & études techniques",
      badge: "Infrastructures & Bâtiment",
      icon: HardHat,
      gradient: "from-orange-500 to-amber-600",
      accentColor: "text-orange-500",
      bgLight: "bg-orange-500/10",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1000&auto=format&fit=crop",
      overview:
        "Partenaire de confiance des constructeurs et collectivités : fourniture d'équipements BTP de chantier, travaux d'infrastructures et ingénierie technique.",
      items: [
        { name: "Fourniture d'Équipements & Matériels", desc: "Engins de chantier, pompes de dénoyage, groupes électrogènes et outillage BTP." },
        { name: "Construction & Réhabilitation", desc: "Travaux publics, dallages industriels, bâtiments techniques et ouvrages d'art." },
        { name: "Réseaux VRD & Hydrauliques", desc: "Pose de canalisations, terrassement, assainissement et voiries." },
        { name: "Études Techniques & Assistance", desc: "Dimensionnement structurel, contrôle qualité, audits d'ouvrages et maîtrise d'œuvre." },
        { name: "Maintenance & Service Après-Vente", desc: "Reconditionnement et maintenance d'équipements lourds de chantier." },
      ],
    },
  ];

  const currentDomain = domains.find((d) => d.id === activeTab)!;

  return (
    <section id="domaines" className="py-24 relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
            Ingénierie & Solutions Techniques
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nos Domaines d'Activité Majeurs
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
            Quatre grands pôles d'expertise intégrés pour accompagner la croissance durable des entreprises, collectivités et exploitations en Afrique de l'Ouest.
          </p>
        </div>

        {/* Tab Buttons Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {domains.map((domain) => {
            const Icon = domain.icon;
            const isActive = activeTab === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setActiveTab(domain.id)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 border text-center ${
                  isActive
                    ? "bg-white dark:bg-slate-800 border-brand-green shadow-lg dark:shadow-glow scale-[1.02]"
                    : "bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? `${domain.bgLight} ${domain.accentColor}` : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-heading font-bold text-sm sm:text-base ${isActive ? "text-slate-900 dark:text-white" : ""}`}>
                    {domain.title}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                    {domain.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Domain Details Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Visual & Overview Banner (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800">
              <div>
                <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white bg-brand-green mb-4">
                  {currentDomain.badge}
                </span>

                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-3">
                  {currentDomain.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {currentDomain.overview}
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden h-52 sm:h-64 shadow-md group">
                <img
                  src={currentDomain.image}
                  alt={currentDomain.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/30" />
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/70 backdrop-blur-md rounded-xl text-white text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-brand-green" />
                    Études techniques et garantie d'exécution intégrées
                  </span>
                </div>
              </div>
            </div>

            {/* List of Services Items (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentDomain.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl glass-card glass-card-hover border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 ${currentDomain.accentColor}`} />
                      <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <a
                    href="#devis"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-green dark:text-brand-glow hover:underline"
                  >
                    <span>Demander une étude</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
