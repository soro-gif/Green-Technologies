import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
  variant?: 'white' | 'dark' | 'glass' | 'none';
}

export function Card({
  children,
  hoverable = false,
  bordered = true,
  variant = 'white',
  className = '',
  ...props
}: CardProps) {
  const hasCustomBg = className.includes('bg-');
  
  let baseBackground = '';
  if (!hasCustomBg) {
    if (variant === 'white') baseBackground = 'bg-white';
    else if (variant === 'dark') baseBackground = 'bg-slate-900 text-white';
    else if (variant === 'glass') baseBackground = 'bg-white/80 backdrop-blur-md';
  }

  const borderClass = bordered
    ? variant === 'dark' || className.includes('bg-slate-900') || className.includes('bg-slate-950')
      ? 'border border-slate-800'
      : 'border border-slate-200'
    : '';

  const hoverClass = hoverable
    ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300'
    : '';

  return (
    <div
      className={`rounded-2xl p-6 ${baseBackground} ${borderClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
