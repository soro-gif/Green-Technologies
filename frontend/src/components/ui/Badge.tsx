import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?:
    | 'green'
    | 'blue'
    | 'orange'
    | 'lime'
    | 'slate'
    | 'red'
    | 'amber'
    | 'emeraldDark'
    | 'slateDark'
    | 'blueDark'
    | 'orangeDark';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({
  variant = 'green',
  size = 'md',
  children,
  className = '',
  dot = false,
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    blue: 'bg-sky-50 text-sky-800 border-sky-200/80',
    orange: 'bg-orange-50 text-orange-800 border-orange-200/80',
    lime: 'bg-lime-50 text-lime-800 border-lime-200/80',
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
    red: 'bg-red-50 text-red-800 border-red-200/80',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/80',
    emeraldDark: 'bg-emerald-950/85 text-emerald-200 border-emerald-400/40 backdrop-blur-md shadow-sm',
    slateDark: 'bg-slate-900/85 text-white border-white/20 backdrop-blur-md shadow-sm',
    blueDark: 'bg-sky-950/85 text-sky-200 border-sky-400/40 backdrop-blur-md shadow-sm',
    orangeDark: 'bg-orange-950/85 text-orange-200 border-orange-400/40 backdrop-blur-md shadow-sm',
  };

  const dotColors: Record<string, string> = {
    green: 'bg-emerald-500',
    blue: 'bg-sky-500',
    orange: 'bg-orange-500',
    lime: 'bg-lime-500',
    slate: 'bg-slate-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    emeraldDark: 'bg-emerald-400',
    slateDark: 'bg-white',
    blueDark: 'bg-sky-400',
    orangeDark: 'bg-orange-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] font-semibold px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variantStyles[variant] || variantStyles.green} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-emerald-500'}`} />}
      {children}
    </span>
  );
}
