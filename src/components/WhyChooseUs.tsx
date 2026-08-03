"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Users,
  Sliders,
  ShieldCheck,
  Headphones,
  Clock,
  Award,
  CheckSquare,
  Sparkles,
} from "lucide-react";

export default function WhyChooseUs() {
  const reasons = [
    {
      title: "Expertise Technique",
      desc: "Plus de 10 ans de maitrise en ingénierie hydraulique, solaire et génie civil en Afrique de l'Ouest.",
      icon: Wrench,
      bgColor: "bg-emerald-600",
    },
    {
      title: "Équipe Qualifiée",
      desc: "Ingénieurs et techniciens certifiés aux normes internationales, régulièrement formés aux dernières technologies.",
      icon: Users,
      bgColor: "bg-blue-600",
    },
    {
      title: "Solutions Sur-Mesure",
      desc: "Chaque projet fait l'objet d'un audit approfondi pour dimensionner exactement l'équipement adapté à vos besoins.",
      icon: Sliders,
      bgColor: "bg-purple-600",
    },
    {
      title: "Équipements de Qualité",
      desc: "Partenariats avec les plus grands équipementiers mondiaux (pompes Grundfos, panneaux Tier-1, convertisseurs de pointe).",
      icon: ShieldCheck,
      bgColor: "bg-amber-600",
    },
    {
      title: "Service Après-Vente (SAV)",
      desc: "Un accompagnement continu avec contrats de maintenance préventive et curative pour maximiser la durée de vie de vos installations.",
      icon: Headphones,
      bgColor: "bg-cyan-600",
    },
    {
      title: "Intervention Rapide",
      desc: "Équipes mobiles d'astreinte basées à Abidjan capables d'intervenir sous 24h à 48h partout en Côte d'Ivoire.",
      icon: Clock,
      bgColor: "bg-rose-600",
    },
    {
      title: "Garantie Constructeur",
      desc: "Toutes nos installations bénéficient de garanties solides (jusqu'à 25 ans sur les panneaux solaires et 5 ans sur les composants).",
      icon: Award,
      bgColor: "bg-brand-green",
    },
    {
      title: "Respect des Normes",
      desc: "Conformité stricte aux exigences environnementales, sanitaires (OMS pour l'eau potable) et sécuritaires.",
      icon: CheckSquare,
      bgColor: "bg-indigo-600",
    },
    {
      title: "Innovation Permanente",
      desc: "Intégration du pilotage à distance via IoT, capteurs intelligents et automatisation solaire de dernière génération.",
      icon: Sparkles,
      bgColor: "bg-fuchsia-600",
    },
  ];

  return (
    <section id="pourquoi" className="py-24 relative bg-slate-100/60 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
            Nos Atouts Concurrentiels
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pourquoi choisir Green Technologies ?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
            Nous combinons réactivité locale, rigueur d'ingénierie et équipements internationaux haut de gamme pour garantir la réussite absolue de vos projets.
          </p>
        </div>

        {/* 9 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 hover:border-brand-green transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${reason.bgColor} text-white flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-3">
                    {reason.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {reason.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-green dark:text-brand-glow">
                  <span>Standard de qualité certifié</span>
                  <span className="w-2 h-2 rounded-full bg-brand-green" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
