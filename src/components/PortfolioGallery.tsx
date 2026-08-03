"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, MapPin, Calendar, CheckCircle, Tag, X } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: "Eau" | "Solaire" | "Agriculture" | "BTP";
  location: string;
  date: string;
  image: string;
  summary: string;
  description: string;
  highlights: string[];
}

export default function PortfolioGallery() {
  const [activeFilter, setActiveFilter] = useState<"Tous" | "Eau" | "Solaire" | "Agriculture" | "BTP">("Tous");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      id: "1",
      title: "Station d'épuration & filtration eau potable",
      category: "Eau",
      location: "Cocody Riviera, Abidjan",
      date: "2025",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1000&auto=format&fit=crop",
      summary: "Installation d'un système de filtration d'eau potable haute capacité avec adoucisseur et lampe UV.",
      description: "Conception et mise en service d'une centrale de traitement d'eau automatisée capable de potabiliser 50m³/heure. Suppression du fer, adoucissement et stérilisation UV permanente conforme aux normes OMS.",
      highlights: ["Capacité : 50 m³/h", "Double filtration charbon actif", "Système UV antibactérien 99.9%", "Supervision à distance"],
    },
    {
      id: "2",
      title: "Centrale solaire hybride 150 kWp & stockage lithium",
      category: "Solaire",
      location: "Zone Industrielle Yopougon, Abidjan",
      date: "2025",
      image: "https://images.unsplash.com/photo-1508873696983-2df515122519?q=80&w=1000&auto=format&fit=crop",
      summary: "Alimentation solaire photovoltaïque complète pour une usine agro-alimentaire.",
      description: "Installation de 320 panneaux solaires monocristallins avec banc de batteries LiFePO4 de 200 kWh. Réduction de 70% de la facture d'électricité et garantie de zéro coupure réseau.",
      highlights: ["Puissance : 150 kWp", "Batteries Lithium 200 kWh", "Onduleurs hybrides certifiés Tier-1", "Économie annuelle : > 25 millions FCFA"],
    },
    {
      id: "3",
      title: "Système d'Irrigation Goutte-à-Goutte & Pompage Solaire",
      category: "Agriculture",
      location: "Exploitation Agricole, Yamoussoukro",
      date: "2024",
      image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1000&auto=format&fit=crop",
      summary: "Irrigation solaire automatisée de 25 hectares de cultures maraîchères.",
      description: "Projet clé en main combinant forage d'eau profond (120m), pompe solaire immergée et réseau d'irrigation au goutte-à-goutte connecté à des capteurs d'humidité de sol.",
      highlights: ["Superficie : 25 Hectares", "Économie d'eau : 55%", "Pompe solaire Grundfos", "Rendement agricole : +40%"],
    },
    {
      id: "4",
      title: "Réhabilitation château d'eau & réseau hydraulique",
      category: "Eau",
      location: "Collectivité de San-Pédro",
      date: "2024",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1000&auto=format&fit=crop",
      summary: "Rénovation complète d'un château d'eau de 100m³ et extension du réseau de distribution.",
      description: "Remise en état de la structure métallique, étanchéité de cuve, pose de 4km de conduites PEHD et raccordement de 800 foyers ruraux à l'eau courante.",
      highlights: ["Capacité : 100 m³", "Canalisations PEHD PN16", "Sécurisation de la qualité", "Alimentation 100% gravitaire"],
    },
    {
      id: "5",
      title: "Travaux d'aménagement BTP & équipements de chantier",
      category: "BTP",
      location: "Bouaké, Côte d'Ivoire",
      date: "2024",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1000&auto=format&fit=crop",
      summary: "Fourniture de groupes électrogènes de chantier et réalisation de dallages industriels.",
      description: "Prise en charge du lot technique BTP pour une plateforme logistique : dallage béton armé haute résistance, réseau de drainage des eaux pluviales et pompes d'assainissement.",
      highlights: ["Dallage : 3 500 m²", "Groupes électrogènes 250 kVA", "Assainissement eaux pluviales", "Livraison sous 60 jours"],
    },
    {
      id: "6",
      title: "Serres intelligentes & fertirrigation automatisée",
      category: "Agriculture",
      location: "Korhogo, Côte d'Ivoire",
      date: "2025",
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000&auto=format&fit=crop",
      summary: "Déploiement de 6 serres métalliques à climat contrôlé pour production de tomates & piments.",
      description: "Installation de serres agricoles avec régulation automatique de la température, ombrage motorisé et injection dosée d'engrais dissous dans le réseau d'irrigation.",
      highlights: ["6 Serres métalliques", "Gestion du micro-climat", "Fertirrigation électronique", "Protection biologique"],
    },
  ];

  const filteredProjects = activeFilter === "Tous"
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="realisations" className="py-24 bg-slate-50 dark:bg-slate-900/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
            Nos réalisations terrain
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Des projets majeurs livrés avec succès
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
            Découvrez nos interventions d'envergure en Côte d'Ivoire dans le traitement d'eau, l'énergie solaire, l'irrigation et les travaux BTP.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
          {(["Tous", "Eau", "Solaire", "Agriculture", "BTP"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${activeFilter === filter
                ? "bg-brand-green text-white shadow-glow scale-105"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
            >
              {filter === "Tous" ? "Toutes les réalisations" : filter}
            </button>
          ))}
        </div>

        {/* Grid of Projects */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group rounded-3xl overflow-hidden glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-brand-green text-white shadow-md">
                    {project.category}
                  </span>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-glow" />
                      {project.location}
                    </span>
                    <span className="flex items-center gap-1 opacity-80">
                      <Calendar className="w-3.5 h-3.5" />
                      {project.date}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-brand-green transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {project.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedProject(project)}
                    className="w-full py-2.5 rounded-xl border border-brand-green/30 text-brand-green dark:text-brand-glow hover:bg-brand-green hover:text-white text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Voir les détails de l'intervention</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Modal Project Detail */}
        <AnimatePresence>
          {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-brand-green text-white">
                    {selectedProject.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-brand-green" /> {selectedProject.location}
                  </span>
                  <span>•</span>
                  <span>Livré en {selectedProject.date}</span>
                </div>

                <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-4">
                  {selectedProject.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                  {selectedProject.description}
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl mb-6">
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-3">
                    Faits Marquants & Caractéristiques Techniques :
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProject.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="#devis"
                    onClick={() => setSelectedProject(null)}
                    className="flex-1 py-3 bg-brand-green text-white text-center text-sm font-semibold rounded-xl shadow-glow hover:bg-emerald-600 transition-colors"
                  >
                    Demander un projet similaire
                  </a>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl"
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
