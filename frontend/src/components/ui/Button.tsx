import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-dark' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center whitespace-nowrap font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none leading-none shadow-xs hover:shadow';

  const variantStyles = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus-visible:ring-emerald-500 border border-emerald-600',
    accent:
      'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white focus-visible:ring-amber-500 border border-amber-600',
    secondary:
      'bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white focus-visible:ring-slate-700 border border-slate-800',
    outline:
      'border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 bg-white focus-visible:ring-slate-400',
    'outline-dark':
      'border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-white bg-slate-900/90 focus-visible:ring-slate-500',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus-visible:ring-red-500 border border-red-600',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400 shadow-none hover:shadow-none',
  };

  const sizeStyles = {
    sm: 'text-xs h-9 px-3.5 gap-2',
    md: 'text-sm h-10 px-4.5 gap-2',
    lg: 'text-base h-12 px-6 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner
          size="sm"
          className={
            variant === 'outline' || variant === 'ghost'
              ? 'text-slate-700'
              : 'text-white'
          }
        />
      ) : (
        leftIcon && <span className="shrink-0 inline-flex items-center justify-center">{leftIcon}</span>
      )}
      <span className="inline-flex items-center justify-center gap-2 shrink-0">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0 inline-flex items-center justify-center">{rightIcon}</span>}
    </button>
  );
}
