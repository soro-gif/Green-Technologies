"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Search, MessageCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Général" | "Eau" | "Solaire" | "BTP";
}

export default function FAQSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      category: "Eau",
      question: "Combien de temps faut-il pour réaliser un forage d'eau complet à Abidjan ou en région ?",
      answer: "La réalisation d'un forage comprend l'étude géophysique (1 jour), la pénétration du sol et l'isolation du tubage (1 à 2 jours), le développement et le pompage d'essai (1 jour). En général, l'ouvrage complet est livré entre 3 et 5 jours ouvrés.",
    },
    {
      category: "Solaire",
      question: "Quelle est la durée de vie et la garantie d'une installation solaire photovoltaïque ?",
      answer: "Nos panneaux photovoltaïques solaires bénéficient d'une garantie constructeur de rendement de 25 ans. Les onduleurs et batteries Lithium LiFePO4 modernes sont garantis entre 5 et 10 ans avec une durée de vie théorique supérieure à 15 ans.",
    },
    {
      category: "Eau",
      question: "Mon eau de forage a une mauvaise odeur ou une couleur rousse, que faire ?",
      answer: "La couleur rousse indique une forte concentration en fer oxydé, et la mauvaise odeur provient souvent d'hydrogène sulfuré. Nous installons des stations de déferrisation automatique et de filtration sur charbon actif qui rendent votre eau parfaitement claire, inodore et potable.",
    },
    {
      category: "Général",
      question: "Comment obtenir un devis et une étude de faisabilité ?",
      answer: "Vous pouvez remplir directement notre formulaire en ligne sur le site ou nous contacter sur WhatsApp au +225 07 04 90 10 64. Nos ingénieurs effectuent une descente sur site à Abidjan et partout en Côte d'Ivoire sous 24h à 48h.",
    },
    {
      category: "Solaire",
      question: "Peut-on utiliser le pompage solaire pour irriguer une grande plantation agricole ?",
      answer: "Absolument. Nos systèmes de pompage solaire sans batterie permettent d'extraire des centaines de mètres cubes d'eau par jour pour alimenter les réseaux de goutte-à-goutte ou d'aspersion sur des dizaines d'hectares sans dépenser un seul franc en carburant.",
    },
    {
      category: "BTP",
      question: "Fournissez-vous des matériels BTP en location ou uniquement à l'achat ?",
      answer: "Green Technologies propose la fourniture à l'achat et des contrats de mise à disposition d'équipements de chantier (groupes électrogènes, pompes d'assainissement, matériels de compactage) avec service d'assistance technique inclus.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-24 bg-slate-100/50 dark:bg-slate-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-4 h-4" />
            Questions Fréquentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Foire Aux Questions (FAQ)
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
            Retrouvez les réponses aux questions récurrentes posées par nos clients en Côte d'Ivoire.
          </p>

          {/* Search Input */}
          <div className="mt-8 relative max-w-md mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une question (forage, solaire, garantie...)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none shadow-md"
            />
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-slate-900 dark:text-white text-base sm:text-lg hover:text-brand-green transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase">
                      {faq.category}
                    </span>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-green" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Direct Help Card */}
        <div className="mt-12 text-center p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-heading font-bold text-base">Vous avez d'autres interrogations spécifiques ?</h4>
            <p className="text-xs text-slate-400">Nos ingénieurs sont disponibles immédiatement sur WhatsApp.</p>
          </div>
          <a
            href="https://wa.me/2250704901064"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-glow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Discuter sur WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
