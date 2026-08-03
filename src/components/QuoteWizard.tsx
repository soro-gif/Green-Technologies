"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Droplets,
  Sun,
  Sprout,
  HardHat,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  Calculator,
  Building,
  User,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function QuoteWizard() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    domain: "eau",
    serviceType: "installation",
    clientType: "particulier",
    city: "Abidjan",
    name: "",
    phone: "",
    email: "",
    details: "",
  });

  const domains = [
    { id: "eau", label: "Eau & Filtration", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "energie", label: "Énergie Solaire", icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "agro", label: "Agrotechnologie", icon: Sprout, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "btp", label: "Équipements BTP", icon: HardHat, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const serviceTypes = [
    { id: "installation", title: "Nouvelle Installation Clé en Main", desc: "Projet complet de l'étude technique à la pose." },
    { id: "extension", title: "Extension ou Modernisation", desc: "Ajout de panneaux solaires, augmentation du débit eau..." },
    { id: "audit", title: "Étude Technique & Diagnostic", desc: "Expertise de faisabilité terrain et analyse." },
    { id: "maintenance", title: "Contrat de Maintenance & SAV", desc: "Entretien préventif ou dépannage réactif." },
  ];

  const clientTypes = [
    { id: "particulier", label: "Particulier / Résidence", icon: User },
    { id: "entreprise", label: "Entreprise / Industrie", icon: Building },
    { id: "agriculteur", label: "Exploitation Agricole", icon: Sprout },
    { id: "collectivite", label: "Collectivité / ONG", icon: MapPin },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // fallback
    }
  };

  return (
    <section id="devis" className="py-24 relative bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="w-4 h-4 inline-block mr-1 -mt-0.5" />
            Simulateur & Devis Gratuit
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
            Demandez votre étude personnalisée
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-4 text-base sm:text-lg">
            Recevez une proposition technico-commerciale détaillée sous 24h par nos ingénieurs à Abidjan.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl">
          
          {!submitted ? (
            <>
              {/* Stepper Progress Bar */}
              <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-xs transition-all ${
                        step === i
                          ? "bg-brand-green text-white shadow-md scale-110"
                          : step > i
                          ? "bg-brand-green/20 text-brand-green font-bold"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {step > i ? "✓" : `0${i}`}
                    </div>
                    {i < 4 && (
                      <div
                        className={`h-1 w-10 sm:w-16 rounded-full transition-all ${
                          step > i ? "bg-brand-green" : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {/* STEP 1: Select Domain */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white text-center">
                        Étape 1 : Choisissez le domaine principal de votre projet
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {domains.map((dom) => {
                          const Icon = dom.icon;
                          const isSelected = formData.domain === dom.id;
                          return (
                            <button
                              type="button"
                              key={dom.id}
                              onClick={() => setFormData({ ...formData, domain: dom.id })}
                              className={`p-6 rounded-2xl border text-center flex flex-col items-center gap-4 transition-all ${
                                isSelected
                                  ? "bg-brand-green/15 border-brand-green text-slate-900 dark:text-white shadow-md scale-[1.02]"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                              }`}
                            >
                              <div className={`w-14 h-14 rounded-2xl ${dom.bg} ${dom.color} flex items-center justify-center`}>
                                <Icon className="w-7 h-7" />
                              </div>
                              <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">{dom.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-8 py-3.5 rounded-xl bg-brand-green text-white font-semibold flex items-center gap-2 hover:bg-emerald-600 shadow-md transition-all text-sm"
                        >
                          <span>Étape Suivante</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Service Type */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white text-center">
                        Étape 2 : Quel type de prestation recherchez-vous ?
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {serviceTypes.map((serv) => {
                          const isSelected = formData.serviceType === serv.id;
                          return (
                            <button
                              type="button"
                              key={serv.id}
                              onClick={() => setFormData({ ...formData, serviceType: serv.id })}
                              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                                isSelected
                                  ? "bg-brand-green/15 border-brand-green text-slate-900 dark:text-white shadow-md"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                              }`}
                            >
                              <div>
                                <h4 className="font-heading font-bold text-slate-900 dark:text-white text-base mb-1">{serv.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{serv.desc}</p>
                              </div>
                              <span className="mt-4 text-xs font-semibold text-brand-green dark:text-brand-glow">
                                {isSelected ? "✓ Sélectionné" : "Choisir ce service"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="px-8 py-3.5 rounded-xl bg-brand-green text-white font-semibold flex items-center gap-2 hover:bg-emerald-600 shadow-md transition-all text-sm"
                        >
                          <span>Étape Suivante</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Client Type & Location */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white text-center">
                        Étape 3 : Votre profil & Localisation du projet
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {clientTypes.map((c) => {
                          const Icon = c.icon;
                          const isSelected = formData.clientType === c.id;
                          return (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => setFormData({ ...formData, clientType: c.id })}
                              className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-all ${
                                isSelected
                                  ? "bg-brand-green/20 border-brand-green text-slate-900 dark:text-white font-bold"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <Icon className="w-6 h-6 text-brand-green" />
                              <span className="text-xs font-semibold">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Ville / Région du projet en Côte d'Ivoire :
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                        >
                          <option value="Abidjan">Abidjan (Cocody, Riviera, Yopougon, Marcory...)</option>
                          <option value="Yamoussoukro">Yamoussoukro</option>
                          <option value="San Pédro">San Pédro</option>
                          <option value="Bouaké">Bouaké</option>
                          <option value="Korhogo">Korhogo</option>
                          <option value="Man">Man</option>
                          <option value="Autre">Autre localité (Préciser dans le détail)</option>
                        </select>
                      </div>

                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="px-8 py-3.5 rounded-xl bg-brand-green text-white font-semibold flex items-center gap-2 hover:bg-emerald-600 shadow-md transition-all text-sm"
                        >
                          <span>Étape Finale</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: Contact details & Submit */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white text-center mb-6">
                        Étape 4 : Coordonnées pour l'envoi de votre devis
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom complet / Entreprise *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Jean Kouassi"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Téléphone / WhatsApp *</label>
                          <input
                            type="tel"
                            required
                            placeholder="+225 07 04 90 10 64"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Adresse Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="exemple@domaine.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Détails spécifiques du besoin (facultatif)</label>
                        <textarea
                          rows={3}
                          placeholder="Précisez vos besoins : débit d'eau recherché, nombre d'habitants, puissance électrique souhaitée, etc."
                          value={formData.details}
                          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3.5 rounded-xl bg-brand-green text-white font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all text-base shadow-md"
                        >
                          <Send className="w-5 h-5" />
                          <span>Transmettre ma demande</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </>
          ) : (
            /* Confirmation Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 text-brand-green" />
              </div>

              <h3 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
                Demande de Devis Transmise avec Succès !
              </h3>

              <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto text-sm leading-relaxed">
                Merci <strong className="text-slate-900 dark:text-white">{formData.name}</strong>. Nos ingénieurs examinent actuellement votre projet pour la région de <strong className="text-brand-green">{formData.city}</strong>. Nous vous recontacterons sous 24h au <strong className="text-slate-900 dark:text-white">{formData.phone}</strong>.
              </p>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-left text-xs space-y-2 shadow-sm">
                <div className="font-bold text-brand-green uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Récapitulatif de votre étude :
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span className="text-slate-500">Domaine :</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{formData.domain}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span className="text-slate-500">Prestation :</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{formData.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Localisation :</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.city}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                }}
                className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Effectuer une autre simulation
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
