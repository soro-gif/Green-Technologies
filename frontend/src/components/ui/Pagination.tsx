import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '../../types/api';

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ meta, onPageChange, className = '' }: PaginationProps) {
  const { current_page, last_page, total } = meta;

  if (last_page <= 1) return null;

  return (
    <nav aria-label="Pagination" className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}>
      <div className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-800">{current_page}</span> sur{' '}
        <span className="font-semibold text-slate-800">{last_page}</span> ({total} résultats)
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(current_page - 1)}
          aria-label="Page précédente"
          disabled={current_page <= 1}
          className="inline-flex items-center gap-1 h-10 px-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, last_page) }, (_, i) => {
            let pageNum = i + 1;
            if (last_page > 5 && current_page > 3) {
              pageNum = current_page - 3 + i;
              if (pageNum > last_page) pageNum = last_page - (4 - i);
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={current_page === pageNum ? 'page' : undefined}
                className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-md transition-colors ${
                  current_page === pageNum
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(current_page + 1)}
          aria-label="Page suivante"
          disabled={current_page >= last_page}
          className="inline-flex items-center gap-1 h-10 px-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
