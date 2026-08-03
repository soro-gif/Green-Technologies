"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Factory,
  Landmark,
  HeartHandshake,
  Tractor,
  Award,
  Lightbulb,
  Leaf,
  ShieldCheck,
  Zap,
  UserCheck,
} from "lucide-react";

export default function PositioningSection() {
  const targetAudiences = [
    {
      title: "Particuliers",
      desc: "Forages autonomes, purification d'eau potable domestique et kits solaires pour maisons et résidences.",
      icon: User,
      badge: "Résidentiel",
    },
    {
      title: "Entreprises & Bureaux",
      desc: "Optimisation énergétique, centrales solaires en toiture et fontaines à eau écologiques pour collaborateurs.",
      icon: Building2,
      badge: "Tertiaire",
    },
    {
      title: "Industries & Usines",
      desc: "Traitement des eaux de process, adoucisseurs industriels, pompage fort débit et secours électrique solaire.",
      icon: Factory,
      badge: "Industriel",
    },
    {
      title: "Collectivités & Villes",
      desc: "Systèmes d'hydraulique villageoise (HVA), éclairage public solaire et réseaux d'eau d'utilité publique.",
      icon: Landmark,
      badge: "Secteur Public",
    },
    {
      title: "ONG & Projets Humanitaires",
      desc: "Infrastructures d'eau potable et d'énergie pour écoles, dispensaires et centres communautaires ruraux.",
      icon: HeartHandshake,
      badge: "Humanitaire",
    },
    {
      title: "Exploitations Agricoles",
      desc: "Pompage solaire direct, systèmes d'irrigation intelligente et équipement de serres haute performance.",
      icon: Tractor,
      badge: "Agro-pastoral",
    },
  ];

  const corePillars = [
    { name: "Expertise Technique", icon: Award, desc: "Ingénieurs & techniciens diplômés spécialisés." },
    { name: "Innovation Permanente", icon: Lightbulb, desc: "Technologies IoT, capteurs & énergie propre." },
    { name: "Durabilité Environnementale", icon: Leaf, desc: "Réduction de l'empreinte carbone et zéro gaspillage." },
    { name: "Qualité & Fiabilité", icon: ShieldCheck, desc: "Composants certifiés Tier-1 et normes internationales." },
    { name: "Service Après-Vente (SAV)", icon: Zap, desc: "Contrats de maintenance et assistance rapide." },
    { name: "Accompagnement Sur-Mesure", icon: UserCheck, desc: "De l'étude de faisabilité à la mise en service." },
  ];

  return (
    <section id="positionnement" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 dark:bg-slate-800 border border-brand-green/30 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
            Un Pôle Technique Spécialisé
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
            Une expertise globale pour tous vos projets
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-4 text-base sm:text-lg leading-relaxed">
            Green Technologies s'impose comme le partenaire stratégique clé en Côte d'Ivoire et dans la sous-région, apportant des réponses sur-mesure à chaque secteur d'activité.
          </p>
        </div>

        {/* 6 Target Audiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {targetAudiences.map((aud, index) => {
            const Icon = aud.icon;
            return (
              <motion.div
                key={aud.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-green transition-all duration-300 group flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green dark:text-brand-glow flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {aud.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-2">
                    {aud.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {aud.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center text-xs font-semibold text-brand-green dark:text-brand-glow group-hover:translate-x-1 transition-transform">
                  <span>En savoir plus sur nos offres {aud.title.toLowerCase()}</span>
                  <span className="ml-1">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 6 Pillars Banner */}
        <div className="rounded-3xl p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white">
              Les Piliers de Notre Engagement
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pourquoi nous faisons la différence auprès de nos clients
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {corePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.name}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{pillar.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
