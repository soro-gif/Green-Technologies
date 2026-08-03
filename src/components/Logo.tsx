"use client";

import React from "react";

interface LogoProps {
  variant?: "full" | "icon" | "horizontal";
  className?: string;
  showTagline?: boolean;
}

export default function Logo({
  variant = "full",
  className = "",
  showTagline = false,
}: LogoProps) {
  if (variant === "icon") {
    return (
      <div className={`relative inline-block ${className}`}>
        <img
          src="/logo.png"
          alt="Green Technologies BTP Logo Icon"
          className="w-12 h-12 object-contain filter drop-shadow-sm hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="flex items-center gap-3">
        {/* Crisp logo image from public/logo.png */}
        <div className="p-1 rounded-2xl bg-white/95 shadow-sm border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Green Technologies BTP Logo"
            className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {showTagline && (
        <div className="mt-2 text-[11px] font-semibold text-slate-400 tracking-widest uppercase border-t border-slate-800 pt-1.5 w-full text-center">
          — INNOVER AUJOURD'HUI, CONSTRUIRE DURABLEMENT DEMAIN —
        </div>
      )}
    </div>
  );
}
