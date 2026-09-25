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
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantStyles = {
    primary:
      'bg-emerald-700 hover:bg-emerald-800 text-white focus-visible:ring-emerald-600 border border-emerald-700 active:bg-emerald-900',
    accent:
      'bg-orange-600 hover:bg-orange-700 text-white focus-visible:ring-orange-500 border border-orange-600 active:bg-orange-800',
    secondary:
      'bg-slate-800 hover:bg-slate-900 text-white focus-visible:ring-slate-700 border border-slate-800 active:bg-slate-950',
    outline:
      'border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 bg-white focus-visible:ring-slate-400',
    'outline-dark':
      'border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-white bg-slate-900/90 focus-visible:ring-slate-500 shadow-sm',
    danger:
      'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 border border-red-600 active:bg-red-800',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400',
  };

  const sizeStyles = {
    sm: 'text-xs h-8 px-3 gap-1.5',
    md: 'text-sm h-10 px-4 gap-2',
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
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
