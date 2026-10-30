import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Aucune donnée disponible',
  description = 'Il n\'y a aucun élément correspondant à vos critères pour le moment.',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-lg border border-dashed border-slate-300 ${className}`}>
      <div className="w-14 h-14 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h4 className="text-lg font-bold text-slate-800 font-display mb-1">{title}</h4>
      <p className="text-slate-600 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
