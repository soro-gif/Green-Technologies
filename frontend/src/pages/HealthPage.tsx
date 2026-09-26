import { CheckCircle2, Server, Activity, RefreshCw } from 'lucide-react';
import { useHealthCheck } from '../hooks/useHealthCheck';

export function HealthPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealthCheck();

  return (
    <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-white tracking-tight">Statut du socle technique</h1>
            <p className="text-xs sm:text-sm text-slate-400">Communication frontend React ↔ backend laravel API v1</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Frontend Status */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Frontend SPA</p>
            <p className="text-xs text-slate-400 mt-0.5">React 19, Vite, TypeScript, Tailwind CSS</p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
              Opérationnel
            </span>
          </div>
        </div>

        {/* Backend API Status */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start space-x-3">
          <Server className={`w-5 h-5 shrink-0 mt-0.5 ${data?.success ? 'text-emerald-400' : isLoading ? 'text-amber-400' : 'text-rose-400'}`} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Backend REST API</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLoading && 'Connexion à /api/v1/health...'}
              {data?.success && `Laravel API (${data.data.version})`}
              {isError && (error?.message || 'Serveur injoignable')}
            </p>
            <span
              className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-medium rounded border ${data?.success
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : isLoading
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
            >
              {data?.success ? 'Connecté (v1)' : isLoading ? 'En attente' : 'Hors ligne'}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Response Details */}
      {data?.success && (
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
          <p className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
            <span>Contrat de Réponse API v1 :</span>
            <span className="text-emerald-400 text-[11px]">HTTP 200 OK</span>
          </p>
          <pre className="text-emerald-300/90 text-[11px] overflow-x-auto p-2 bg-slate-900/50 rounded border border-slate-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Dev Commands Note */}
      <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800/50 text-xs text-slate-400 space-y-1 font-mono">
        <p className="text-slate-300 font-semibold mb-1">Démarrage local :</p>
        <p>• Backend : <code className="text-emerald-400">cd backend && php artisan serve</code></p>
        <p>• Frontend : <code className="text-emerald-400">cd frontend && npm run dev</code></p>
      </div>
    </div>
  );
}
