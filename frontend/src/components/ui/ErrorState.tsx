import type { ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  message = 'Impossible de récupérer les données depuis le serveur. Veuillez vérifier votre connexion ou réessayer.',
  onRetry,
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-red-50/50 rounded-2xl border border-red-200 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800 font-['Outfit'] mb-1">{title}</h4>
      <p className="text-sm text-slate-600 max-w-md mb-6">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RotateCcw className="w-4 h-4" />}>
          Réessayer
        </Button>
      ) : (
        action
      )}
    </div>
  );
}
