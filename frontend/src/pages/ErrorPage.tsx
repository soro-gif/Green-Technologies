import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ErrorPage() {
  const error = useRouteError();
  let errorMessage = "Une erreur inattendue s'est produite lors du chargement de la page.";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const isChunkError =
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('dynamically imported');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="inline-flex p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">
            {isChunkError ? 'Mise à jour disponible' : 'Une erreur est survenue'}
          </h1>
          <p className="text-sm text-slate-400">
            {isChunkError
              ? 'Une nouvelle version ou une ressource a été mise à jour. Veuillez recharger la page.'
              : errorMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Actualiser la page
          </Button>
          <Link to="/">
            <Button
              variant="outline"
              leftIcon={<Home className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
