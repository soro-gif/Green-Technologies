import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckCircle2, Server, Globe } from 'lucide-react';
import api from './api/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiDetails, setApiDetails] = useState<string>('');

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        setApiStatus('online');
        setApiDetails(res.data.message || 'API opérationnelle');
      })
      .catch(() => {
        setApiStatus('offline');
        setApiDetails('Backend non démarré (php artisan serve)');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">GREEN TECHNOLOGIES</h1>
            <p className="text-sm text-slate-400">Architecture Fullstack : Laravel + React/Vite + TypeScript</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Frontend React + Vite</p>
              <p className="text-xs text-slate-400">TypeScript, Tailwind CSS, TanStack Query</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-start space-x-3">
            <Server className={`w-5 h-5 mt-0.5 ${apiStatus === 'online' ? 'text-emerald-400' : apiStatus === 'checking' ? 'text-amber-400' : 'text-rose-400'}`} />
            <div>
              <p className="text-sm font-semibold text-white">Backend Laravel API</p>
              <p className="text-xs text-slate-400">
                {apiStatus === 'online' && `Statut: ${apiDetails}`}
                {apiStatus === 'checking' && 'Vérification de la connexion...'}
                {apiStatus === 'offline' && apiDetails}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
          <p className="text-slate-300 font-semibold mb-1">Commandes de démarrage :</p>
          <p>• Backend : <code className="text-emerald-400">cd backend && php artisan serve</code></p>
          <p>• Frontend : <code className="text-emerald-400">cd frontend && npm run dev</code></p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
