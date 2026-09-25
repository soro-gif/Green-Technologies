import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'light' | 'dark';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, variant, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    // Auto-detect dark mode if variant is 'dark' or if className contains dark background classes
    const isDark = variant === 'dark' || className.includes('bg-slate') || className.includes('bg-gray') || className.includes('text-white');

    const labelStyles = isDark ? 'text-slate-200' : 'text-slate-700';
    const baseInputStyles = isDark
      ? 'bg-slate-800 text-white placeholder:text-slate-500 border-slate-700 focus:ring-emerald-500 focus:border-emerald-500'
      : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:ring-emerald-500 focus:border-emerald-500';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={`text-xs font-bold uppercase tracking-wider ${labelStyles}`}>
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10.5' : 'pl-3.5'
            } ${rightIcon ? 'pr-10.5' : 'pr-3.5'} py-2.5 shadow-sm ${baseInputStyles} ${
              error ? (isDark ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-red-500 focus:ring-red-500 focus:border-red-500') : ''
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
        {!error && helperText && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
