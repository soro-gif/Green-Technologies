import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="text-center space-y-4 max-w-md">
      <div className="inline-flex p-3 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-medium text-white">404 - Page non trouvée</h1>
      <p className="text-sm text-slate-400">
        La page demandée n'existe pas ou l'endpoint technique est incorrect.
      </p>
      <div>
        <Link
          to="/"
          className="inline-block mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
