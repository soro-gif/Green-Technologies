import { useRef } from 'react';
import { Paperclip, X } from 'lucide-react';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const DOCUMENT_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

/** Vérifie un CV ou une lettre : PDF ou Word, 5 Mo maximum. */
export function validateDocument(file: File | null, required: boolean, label: string): string | null {
  if (!file) return required ? `Joignez votre ${label}.` : null;
  if (!/\.(pdf|docx?)$/i.test(file.name)) return 'Format accepté : PDF ou Word (.doc, .docx).';
  if (file.size > MAX_FILE_SIZE) return `Fichier trop lourd (${formatSize(file.size)}) : 5 Mo maximum.`;
  return null;
}

export interface FileFieldProps {
  id: string;
  label: string;
  required?: boolean;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

/** Champ fichier accessible : le vrai <input type="file"> reste focusable au clavier. */
export function FileField({ id, label, required, file, error, onChange }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-slate-700" id={`${id}-label`}>
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div
        className={`flex items-center gap-3 min-h-11 rounded-md border bg-white pl-1.5 pr-2 py-1.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500 ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
      >
        <label
          htmlFor={id}
          className="shrink-0 inline-flex items-center gap-1.5 min-h-9 px-3 rounded bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-800 cursor-pointer transition-colors"
        >
          <Paperclip className="w-4 h-4" aria-hidden="true" />
          Choisir un fichier
        </label>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={DOCUMENT_ACCEPT}
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? `${errorId} ${hintId}` : hintId}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <span className={`min-w-0 flex-1 truncate text-sm ${file ? 'text-slate-900' : 'text-slate-500'}`}>
          {file ? `${file.name} (${formatSize(file.size)})` : 'Aucun fichier choisi'}
        </span>
        {file && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            aria-label={`Retirer le fichier ${file.name}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <p id={hintId} className="text-sm text-slate-500">
        PDF ou Word, 5 Mo max.
      </p>
    </div>
  );
}
