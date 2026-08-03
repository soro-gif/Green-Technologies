"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, PhoneCall, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section id="hero" className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Clean & Spacious Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Minimal Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green dark:text-brand-glow text-xs sm:text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              Ingénierie & solutions durables • Côte d'Ivoire
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
              Des solutions intelligentes pour{" "}
              <span className="text-brand-green">l'eau, l'énergie</span> et les{" "}
              <span className="text-brand-blue dark:text-blue-400">infrastructures</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Green Technologies conçoit, installe et maintient vos systèmes de <strong>purification d'eau</strong>, <strong>centrales solaires</strong>, <strong>irrigation agricole</strong> et <strong>équipements BTP</strong> avec des normes d'ingénierie internationales.
            </p>

            {/* Subtle Key Highlights Line */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>Normes OMS & ISO</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>Installations clé en main</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>Garantie & SAV réactif</span>
              </div>
            </div>

            {/* Clean CTAs */}
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <a
                href="#devis"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-brand-green hover:bg-emerald-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm sm:text-base shadow-md"
              >
                <span>Obtenir une étude gratuite</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="https://wa.me/2250704901064?text=Bonjour%20Green%20Technologies,%20je%20souhaite%20des%20informations."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold px-6 py-3.5 rounded-xl transition-all text-sm sm:text-base"
              >
                <PhoneCall className="w-4 h-4 text-brand-green" />
                <span>WhatsApp direct</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Sleek Single Visual Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-xl">
              <div className="relative h-80 sm:h-96 w-full">
                <img
                  src="https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1200&auto=format&fit=crop"
                  alt="Green Technologies Installation Solaire et Eau Abidjan"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green dark:text-brand-glow flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-brand-green" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Expertise terrain certifiée</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Eau • Solaire • Agtech • BTP</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-brand-green text-white">
                    +500 Projets
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
