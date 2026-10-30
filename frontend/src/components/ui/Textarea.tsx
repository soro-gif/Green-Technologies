import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const errorId = error && textareaId ? `${textareaId}-error` : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-semibold text-slate-700">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={props.rows || 4}
          className={`w-full bg-white text-slate-900 placeholder:text-slate-500 text-base rounded-md border border-slate-300 p-3.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
          aria-invalid={error ? true : undefined}          aria-describedby={errorId}          {...props}
        />
        {error && <p id={errorId} className="text-sm text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-sm text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
