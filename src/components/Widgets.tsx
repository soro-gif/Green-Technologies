"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Widgets() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/2250704901064?text=Bonjour%20Green%20Technologies,%20je%20souhaite%20des%20informations%20sur%20vos%20solutions."
        target="_blank"
        rel="noopener noreferrer"
        className="relative group p-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl transition-all duration-300 flex items-center justify-center scale-100 hover:scale-110"
        aria-label="Contacter sur WhatsApp (+225 07 04 90 10 64)"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 pointer-events-none" />
        <MessageCircle className="w-7 h-7 relative z-10" />

        {/* Tooltip Hover Badge */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border border-slate-800">
          WhatsApp Direct • +225 07 04 90 10 64
        </span>
      </a>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="p-3.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white border border-slate-700 shadow-xl hover:bg-brand-green transition-colors"
            aria-label="Retour en haut"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
