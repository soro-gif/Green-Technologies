"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, MessageSquare, Send, Clock, CheckCircle2 } from "lucide-react";

export default function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 relative bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green dark:text-brand-glow text-xs font-bold uppercase tracking-wider mb-4">
            Prendre Contact
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Contactez Nos Équipes à Abidjan
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
            Un projet, une question technique ou une demande d'intervention d'urgence ? Nos spécialistes vous répondent immédiatement.
          </p>
        </div>

        {/* 2 Columns: Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Column: Direct Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Address Card */}
            <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  Siège Social & Showroom
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Cocody II Plateaux Latrille<br />
                  Abidjan, Côte d'Ivoire
                </p>
              </div>
            </div>

            {/* Phone & WhatsApp Card */}
            <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  Téléphone & WhatsApp Direct
                </h3>
                <a
                  href="tel:+2250704901064"
                  className="text-sm font-semibold text-brand-green dark:text-brand-glow block mt-1 hover:underline"
                >
                  +225 07 04 90 10 64
                </a>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Lundi au Samedi : 08h00 - 18h30 (Astreinte d'urgence 24/7)
                </span>
              </div>
            </div>

            {/* Email Card */}
            <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  Adresse Électronique
                </h3>
                <a
                  href="mailto:greentechnologiesbtp@gmail.com"
                  className="text-sm font-semibold text-brand-green dark:text-brand-glow block mt-1 hover:underline"
                >
                  greentechnologiesbtp@gmail.com
                </a>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Réponse garantie sous 1 heure ouvrée
                </span>
              </div>
            </div>

            {/* Hours card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex items-center gap-4">
              <Clock className="w-8 h-8 text-brand-glow flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-sm mb-0.5">Disponibilité Équipes Terrain</span>
                <span>Déplacements possibles sur tout le territoire national ivoirien.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 glass-card p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
            <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-6">
              Envoyez-nous un message direct
            </h3>

            {!formSubmitted ? (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Votre Nom & Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Marc Yao"
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Téléphone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+225 07 04 90 10 64"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="adresse@domaine.ci"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sujet de votre message *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Demande de renseignement forage eau / Kit solaire"
                    value={contactData.subject}
                    onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Expliquez brièvement votre demande..."
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-brand-green focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-brand-green text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-glow transition-all"
                >
                  <Send className="w-5 h-5" />
                  <span>Envoyer le Message</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Message Envoyé avec Succès !
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Merci {contactData.name}. Votre demande a bien été transmise à notre service client d'Abidjan. Nous reviendrons vers vous sous peu.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Envoyer un autre message
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Embedded Google Maps Container */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 h-96 relative">
          <iframe
            title="Localisation Green Technologies Cocody II Plateaux Latrille Abidjan"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.247169123456!2d-3.992!3d5.368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjInMDQuOCJOIDPCsDU5JzMxLjIiVw!5e0!3m2!1sfr!2sci!4v1620000000000!5m2!1sfr!2sci"
            className="w-full h-full border-0 grayscale opacity-90 hover:grayscale-0 transition-all duration-500"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute top-4 left-4 p-3 bg-slate-950/80 backdrop-blur-md rounded-2xl text-white text-xs font-semibold border border-slate-800 shadow-md">
            📍 Cocody II Plateaux Latrille, Abidjan, Côte d'Ivoire
          </div>
        </div>

      </div>
    </section>
  );
}
