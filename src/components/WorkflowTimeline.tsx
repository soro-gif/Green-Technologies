"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Compass, FileCheck, Wrench, PlayCircle, ShieldCheck } from "lucide-react";

export default function WorkflowTimeline() {
  const steps = [
    {
      num: "01",
      title: "Analyse du Besoin",
      desc: "Prise de contact, qualification exacte de votre demande et relevé des contraintes sur le terrain à Abidjan ou en région.",
      icon: Search,
    },
    {
      num: "02",
      title: "Étude Technique",
      desc: "Ingénierie de dimensionnement (débit hydraulique, puissance solaire kWp, résistance BTP) et sélection du matériel.",
      icon: Compass,
    },
    {
      num: "03",
      title: "Proposition Commerciale",
      desc: "Remise d'un devis détaillé transparent, d'un calendrier d'exécution clair et validation des conditions.",
      icon: FileCheck,
    },
    {
      num: "04",
      title: "Installation & Travaux",
      desc: "Déploiement sur site par nos équipes certifiées, assemblage des composants et respect rigoureux des règles de sécurité.",
      icon: Wrench,
    },
    {
      num: "05",
      title: "Mise en Service",
      desc: "Tests de charge, analyses bactériologiques (pour l'eau), contrôle électrique et formation de vos équipes à la prise en main.",
      icon: PlayCircle,
    },
    {
      num: "06",
      title: "Maintenance & SAV",
      desc: "Suivi continu, visites préventives programmées et intervention rapide garantie pour pérenniser vos installations.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="processus" className="py-24 relative bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
            Méthodologie Rigoureuse
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
            Notre Processus de Travail en 6 Étapes
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-4 text-base sm:text-lg">
            Un accompagnement structuré étape par étape pour vous offrir une sérénité totale et des résultats d'ingénierie irréprochables.
          </p>
        </div>

        {/* Timeline Desktop & Mobile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-green transition-all duration-300 group flex flex-col justify-between shadow-md"
              >
                <div>
                  {/* Step Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-heading font-black text-brand-green group-hover:scale-110 transition-transform">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green dark:text-brand-glow flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Étape {step.num} sur 06</span>
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
