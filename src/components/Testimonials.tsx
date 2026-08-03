"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, Building2, UserCheck, ShieldCheck } from "lucide-react";

interface Testimonial {
  id: number;
  author: string;
  role: string;
  company: string;
  city: string;
  avatar: string;
  rating: number;
  content: string;
  service: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      author: "Kouassi Jean-Philippe",
      role: "Directeur d'Exploitation",
      company: "Société Agro-Industrielle du Bandama",
      city: "Yamoussoukro",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
      rating: 5,
      content:
        "Green Technologies a installé un système de pompage solaire et d'irrigation goutte-à-goutte sur nos 30 hectares. Notre rendement en fruits a augmenté de 40% et nos coûts de carburant sont tombés à zéro !",
      service: "Irrigation Solaire & Agtech",
    },
    {
      id: 2,
      author: "Aminata Traoré",
      role: "Gérante Résidence Hôtelière",
      company: "Résidences Palm Beach",
      city: "Cocody, Abidjan",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
      rating: 5,
      content:
        "L'eau de notre forage présentait des traces de fer et de calcaire. Après le passage des ingénieurs de Green Technologies et l'installation d'une station de potabilisation, l'eau est d'une pureté cristalline. Service rapide et SAV irréprochable.",
      service: "Traitement & Filtration d'Eau",
    },
    {
      id: 3,
      author: "Mamadou Diabaté",
      role: "Responsable Logistique & Moyens Généraux",
      company: "SICI BTP West Africa",
      city: "San Pédro",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      rating: 5,
      content:
        "Nous faisons appel à Green Technologies pour la fourniture de matériel BTP et la maintenance de nos motopompes industrielles sur nos chantiers d'aménagements. Équipements robustes et équipes d'astreinte très compétentes.",
      service: "Équipements BTP & Génie Civil",
    },
    {
      id: 4,
      author: "Dr. Patrick Koffi",
      role: "Chef de Projet Humanitaire",
      company: "ONG Eau & Santé Afrique",
      city: "Korhogo",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
      rating: 5,
      content:
        "Pour l'adduction d'eau potable de 3 villages du nord, Green Technologies a livré 3 châteaux d'eau solaires dans les délais impartis. Un travail d'ingénierie d'une grande rigueur professionnelle.",
      service: "Hydraulique Villageoise & Solaire",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 relative bg-slate-50 dark:bg-slate-900/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
            Avis & Témoignages
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ce que nos clients disent de nous
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
            La confiance de nos partenaires est notre plus belle réussite. Découvrez leurs retours d'expérience.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="p-8 sm:p-12 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-2xl relative"
            >
              <Quote className="w-16 h-16 text-brand-green/15 absolute top-6 right-8 pointer-events-none" />

              <div className="flex items-center gap-1 mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">5.0 / 5.0</span>
              </div>

              <blockquote className="text-lg sm:text-xl text-slate-800 dark:text-slate-100 font-medium leading-relaxed mb-8 italic">
                "{current.content}"
              </blockquote>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={current.avatar}
                    alt={current.author}
                    className="w-14 h-14 rounded-full object-cover border-2 border-brand-green shadow-md"
                  />
                  <div>
                    <h4 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                      {current.author}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {current.role} • <span className="font-semibold text-slate-700 dark:text-slate-300">{current.company}</span>
                    </p>
                    <span className="text-[11px] text-brand-green font-medium">📍 {current.city}</span>
                  </div>
                </div>

                <span className="inline-block px-3 py-1.5 rounded-lg bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-semibold self-start sm:self-center">
                  {current.service}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-brand-green hover:text-white transition-colors shadow-md"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentIndex === idx ? "w-8 bg-brand-green" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-brand-green hover:text-white transition-colors shadow-md"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
