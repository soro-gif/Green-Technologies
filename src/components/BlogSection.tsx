"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, ArrowRight, X, User, Tag, Sparkles } from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: "Eau" | "Solaire" | "Irrigation" | "Environnement" | "Agtech";
  author: string;
  date: string;
  readTime: string;
  image: string;
  summary: string;
  content: string[];
}

export default function BlogSection() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const articles: Article[] = [
    {
      id: "1",
      title: "Comment potabiliser l'eau de forage en Côte d'Ivoire ?",
      category: "Eau",
      author: "Ing. Koffi Brou",
      date: "15 Janvier 2026",
      readTime: "5 min de lecture",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1000&auto=format&fit=crop",
      summary: "Découvrez les étapes indispensables pour éliminer le fer, le calcaire et les bactéries des forages domestiques et industriels.",
      content: [
        "L'eau de forage en Côte d'Ivoire offre une autonomie précieuse, mais elle contient fréquemment du fer dissous, un pH acide et des impuretés biologiques.",
        "Étape 1 : L'analyse physico-chimique et bactériologique obligatoire en laboratoire agréé pour connaître la composition exacte de la nappe.",
        "Étape 2 : La déferrisation et le dégazage pour éliminer la couleur rousse et la mauvaise odeur d'œuf pourri.",
        "Étape 3 : L'adoucissement par résine échangeuse d'ions afin d'éviter l'entartrage des conduites et chauffe-eaux.",
        "Étape 4 : La stérilisation par lampe Ultra-Violet (UV) ou chloration pour rendre l'eau 100% propre à la consommation humaine selon les normes OMS."
      ],
    },
    {
      id: "2",
      title: "Pompage solaire direct sans batterie : Rentabilité & fonctionnement",
      category: "Solaire",
      author: "Ing. Diallo Ousmane",
      date: "02 Février 2026",
      readTime: "6 min de lecture",
      image: "https://images.unsplash.com/photo-1508873696983-2df515122519?q=80&w=1000&auto=format&fit=crop",
      summary: "Pourquoi le pompage solaire au fil du soleil est la solution idéale pour l'irrigation agricole et l'hydraulique villageoise.",
      content: [
        "Le pompage solaire direct utilise l'énergie des panneaux photovoltaïques pour faire tourner une pompe sans aucune batterie de stockage intermédiaire.",
        "Avantage 1 : Suppression totale du coût des batteries et durée de vie des panneaux supérieure à 25 ans.",
        "Avantage 2 : Le château d'eau sert de réserve d'énergie naturelle : l'eau est pompée la journée et distribuée par gravité la nuit.",
        "Retour sur investissement : Une installation de pompage solaire est rentabilisée en moins de 18 mois par rapport aux groupes électrogènes diesel."
      ],
    },
    {
      id: "3",
      title: "Irrigation Goutte-à-Goutte : Économisez 60% d'eau sur vos plantations",
      category: "Irrigation",
      author: "Dr. Marie-Claire Yao",
      date: "28 Janvier 2026",
      readTime: "4 min de lecture",
      image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1000&auto=format&fit=crop",
      summary: "Optimisez vos apports en eau et en engrais grâce à la fertirrigation de précision pilotée par capteurs d'humidité.",
      content: [
        "Face au changement climatique, l'aspersion classique entraîne d'importantes pertes d'eau par évaporation et ruissellement.",
        "Le goutte-à-goutte moderne apporte l'eau directement aux racines des plantes au goutte-près.",
        "L'intégration de sondes capacitives permet de déclencher l'irrigation uniquement lorsque le sol en a besoin.",
        "Résultats constatés : Réduction de la facture d'eau, suppression des mauvaises herbes entre les rangs et gain de rendement significatif."
      ],
    },
  ];

  return (
    <section id="blog" className="py-24 bg-slate-100/70 dark:bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
              <BookOpen className="w-4 h-4" />
              Guides & Actualités Techniques
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              Blog & Conseils d'Experts
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-base max-w-xl">
              Découvrez nos articles et dossiers spécialisés pour optimiser vos installations hydrauliques, solaires et agricoles.
            </p>
          </div>

          <a
            href="#devis"
            className="self-start md:self-auto inline-flex items-center gap-2 text-sm font-bold text-brand-green dark:text-brand-glow hover:underline"
          >
            <span>Posez une question à nos ingénieurs</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <div
              key={art.id}
              className="group rounded-3xl overflow-hidden glass-card border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md">
                  {art.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-brand-green" /> {art.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {art.readTime}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-3 group-hover:text-brand-green transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {art.summary}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedArticle(art)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-brand-green hover:text-white text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Lire l'article complet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Article Reader */}
        <AnimatePresence>
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 text-xs font-semibold text-brand-green dark:text-brand-glow mb-2">
                  <Tag className="w-4 h-4" /> {selectedArticle.category} • {selectedArticle.readTime}
                </div>

                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-4">
                  {selectedArticle.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                  <span>Par {selectedArticle.author}</span>
                  <span>•</span>
                  <span>Publié le {selectedArticle.date}</span>
                </div>

                <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                  <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-8">
                  {selectedArticle.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <a
                    href="#devis"
                    onClick={() => setSelectedArticle(null)}
                    className="px-6 py-3 bg-brand-green text-white text-xs font-semibold rounded-xl shadow-glow hover:bg-emerald-600 transition-colors"
                  >
                    Demander une consultation technique
                  </a>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
