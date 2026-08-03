"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, CheckCircle2, Award, ThumbsUp } from "lucide-react";

interface StatProps {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

function CounterCard({ value, suffix, prefix = "", label, sublabel, icon: Icon }: StatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000; // ms
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = value / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-3xl glass-card border border-white/20 dark:border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-brand-green/40 shadow-xl"
    >
      <div className="w-14 h-14 rounded-2xl bg-brand-green/10 text-brand-green dark:text-brand-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7" />
      </div>

      <div className="text-4xl sm:text-5xl font-heading font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center justify-center">
        <span>{prefix}</span>
        <span>{count}</span>
        <span className="text-brand-green dark:text-brand-glow">{suffix}</span>
      </div>

      <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-base sm:text-lg">
        {label}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {sublabel}
      </p>
    </motion.div>
  );
}

export default function StatsCounter() {
  return (
    <section className="py-16 relative bg-slate-100/40 dark:bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CounterCard
            icon={Users}
            value={500}
            prefix="+"
            suffix=""
            label="Clients Satisfaits"
            sublabel="Particuliers, Entreprises & Collectivités"
          />
          <CounterCard
            icon={CheckCircle2}
            value={250}
            prefix="+"
            suffix=""
            label="Installations Livrées"
            sublabel="Forages, Solaires & Projets BTP"
          />
          <CounterCard
            icon={Award}
            value={10}
            prefix="+"
            suffix=" ans"
            label="D'Expérience Terrain"
            sublabel="Maitrise technique certifiée"
          />
          <CounterCard
            icon={ThumbsUp}
            value={98}
            prefix=""
            suffix="%"
            label="Taux de Satisfaction"
            sublabel="Qualité d'intervention & SAV réactif"
          />
        </div>
      </div>
    </section>
  );
}
