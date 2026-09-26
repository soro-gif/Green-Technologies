import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Mail,
  Eye,
  Layers,
  Briefcase,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { dashboardApi } from '../../api';
import type { DashboardStats } from '../../api/dashboard.api';
import type { QuoteRequest } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../auth/AuthContext';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  const overview = stats?.overview;
  const recentQuotes = stats?.recent_quotes || [];
  const recentMessages = stats?.recent_messages || [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* User info & Subtitle */}
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {user?.role_label || 'Super Administrateur'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • Espace Administration & Supervision
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight leading-snug font-['Outfit']">
              Bonjour, <span className="text-emerald-700 font-bold">{user?.name || 'Administrateur'}</span>
            </h1>

            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Vue d'ensemble en temps réel des demandes de devis, messages de contact, chantiers, actualités et gestion de la médiathèque.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/admin/medias">
              <Button
                variant="accent"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm"
              >
                <ImageIcon className="w-4 h-4 mr-1.5" />
                <span>Médiathèque & Images</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (5 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Devis */}
        <Link
          to="/admin/devis"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
        >
          <div className="flex items-center justify-between text-amber-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Demandes de devis</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{overview?.quotes_total || 0}</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {overview?.quotes_pending || 0} en attente
            </span>
          </div>
        </Link>

        {/* Messages */}
        <Link
          to="/admin/messages"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
        >
          <div className="flex items-center justify-between text-sky-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Messages contact</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{overview?.messages_total || 0}</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
              {overview?.messages_unread || 0} non lu(s)
            </span>
          </div>
        </Link>

        {/* Chantiers / Projets */}
        <Link
          to="/admin/projets"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-orange-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
        >
          <div className="flex items-center justify-between text-orange-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Réalisations</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{overview?.projects_total || 0}</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
              {overview?.projects_published || 0} en ligne
            </span>
          </div>
        </Link>

        {/* Services & Prestations */}
        <Link
          to="/admin/services"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalogue services</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{overview?.services_total || 0}</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {overview?.services_active || 0} actifs
            </span>
          </div>
        </Link>

        {/* Médiathèque & Images */}
        <Link
          to="/admin/medias"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
        >
          <div className="flex items-center justify-between text-purple-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Médiathèque</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-lg font-bold text-slate-900 font-['Outfit']">Toutes images</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              Gérer →
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Main Content: Quotes Table & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT (8 Cols): Dernières demandes de devis */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Dernières demandes de devis</span>
            </h3>
            <Link to="/admin/devis" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
              Voir tout ({overview?.quotes_total || 0}) →
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            {recentQuotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucune demande de devis enregistrée pour le moment.
              </div>
            ) : (
              <div>
                {/* Mobile Cards (<md) */}
                <div className="md:hidden divide-y divide-slate-100">
                  {recentQuotes.map((q) => (
                    <div key={q.id} className="p-4 space-y-2.5 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-emerald-700">{q.reference}</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            q.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : q.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : q.status === 'quoted'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-900 font-bold">
                        <p>{q.full_name}</p>
                        <p className="text-[11px] text-slate-500 font-normal">{q.category?.name || 'Général'}</p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setSelectedQuote(q as unknown as QuoteRequest)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Détails</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table (>=md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Réf.</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Domaine</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {recentQuotes.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                            {q.reference}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900">
                            <div>{q.full_name}</div>
                            {q.company && <div className="text-[11px] text-slate-500 font-normal">{q.company}</div>}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium">
                            {q.category?.name || 'Général'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                q.status === 'pending'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : q.status === 'accepted'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : q.status === 'quoted'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {q.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedQuote(q as unknown as QuoteRequest)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (4 Cols): Derniers Messages */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-600" />
              <span>Derniers messages</span>
            </h3>
            <Link to="/admin/messages" className="text-xs font-bold text-sky-700 hover:text-sky-800">
              Tous ({overview?.messages_total || 0}) →
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
            {recentMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucun message reçu.
              </div>
            ) : (
              recentMessages.slice(0, 4).map((m) => (
                <div key={m.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-[140px]">{m.full_name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        m.status === 'unread'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 truncate">{m.subject}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        title={`Dossier de Devis : ${selectedQuote?.reference}`}
        maxWidth="lg"
      >
        {selectedQuote && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Client</span>
                <p className="font-bold text-slate-900">{selectedQuote.full_name}</p>
                {selectedQuote.company && <p className="text-slate-500">{selectedQuote.company}</p>}
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Coordonnées</span>
                <p>{selectedQuote.phone}</p>
                <p>{selectedQuote.email}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Ville / Chantier</span>
                <p className="font-bold">{selectedQuote.city}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Budget Estimé</span>
                <p className="font-bold text-emerald-700">
                  {selectedQuote.estimated_budget
                    ? `${Number(selectedQuote.estimated_budget).toLocaleString('fr-FR')} FCFA`
                    : 'Non précisé'}
                </p>
              </div>
            </div>

            {selectedQuote.details && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Description du besoin</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 mt-1 whitespace-pre-line leading-relaxed">
                  {selectedQuote.details}
                </p>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>
                Fermer
              </Button>
              <Link to="/admin/devis">
                <Button variant="primary" size="sm">
                  Gérer ce devis →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
