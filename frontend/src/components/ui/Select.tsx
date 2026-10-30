import type { SelectHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  children?: ReactNode;
  variant?: 'light' | 'dark';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, variant, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    // Auto-detect dark mode if variant is 'dark' or if className contains dark background classes
    const isDark = variant === 'dark' || className.includes('bg-slate') || className.includes('bg-gray') || className.includes('text-white');

    const errorId = error && selectId ? `${selectId}-error` : undefined;

    const labelStyles = isDark ? 'text-slate-200' : 'text-slate-700';
    const baseInputStyles = isDark
      ? 'bg-slate-800 text-white border-slate-700 focus:ring-emerald-500 focus:border-emerald-500 [&>option]:bg-slate-800 [&>option]:text-white'
      : 'bg-white text-slate-900 border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 [&>option]:bg-white [&>option]:text-slate-900';
    const arrowColor = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className={`text-sm font-semibold ${labelStyles}`}>
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full min-h-11 text-base rounded-md border pl-3.5 pr-10 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer ${baseInputStyles} ${
              error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${className}`}
            aria-invalid={error ? true : undefined}            aria-describedby={errorId}            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 ${arrowColor}`}>
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && <p id={errorId} className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
        {!error && helperText && <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
