import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Pole } from '../../data/poles';
import { StratumEdge } from './StratumEdge';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string | null;
  crumbs?: Crumb[];
  /** Reprend la couleur de la couche d'un pôle ; par défaut, le ciel. */
  pole?: Pole;
  /** Actions affichées sous la description. */
  children?: ReactNode;
  /** Visuel affiché à droite sur grand écran. */
  media?: ReactNode;
}

export function PageHeader({ title, description, crumbs, pole, children, media }: PageHeaderProps) {
  const band = pole?.band ?? 'bg-sky-100 text-slate-900';
  const muted = pole?.muted ?? 'text-slate-700';
  const edge = pole?.edge ?? 'var(--color-sky-100)';

  return (
    <header className={`relative z-10 ${band}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {crumbs && (
          <nav aria-label="Fil d'Ariane" className={`mb-4 text-sm ${muted}`}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {crumb.to ? (
                    <Link to={crumb.to} className="underline underline-offset-4">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-semibold">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={media ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:items-center' : ''}>
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight leading-[1.08]">
              {title}
            </h1>
            {description && (
              <p className={`mt-4 text-lg leading-relaxed max-w-prose ${muted}`}>{description}</p>
            )}
            {children && <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">{children}</div>}
          </div>
          {media && <div className="hidden lg:block">{media}</div>}
        </div>
      </div>

      <StratumEdge color={edge} position="below" />
    </header>
  );
}
