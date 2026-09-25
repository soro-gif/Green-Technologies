import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Mail,
  Eye,
  Layers,
  Briefcase,
  Newspaper,
  Download,
  Clock,
} from 'lucide-react';
import { dashboardApi, quotesApi, contactApi } from '../../api';
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
  const [exportingQuotes, setExportingQuotes] = useState(false);
  const [exportingMessages, setExportingMessages] = useState(false);

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

  const handleExportQuotes = async () => {
    try {
      setExportingQuotes(true);
      const blob = await quotesApi.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devis_green_technologies_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingQuotes(false);
    }
  };

  const handleExportMessages = async () => {
    try {
      setExportingMessages(true);
      const blob = await contactApi.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `messages_contact_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingMessages(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Bonjour, {user?.name}
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {user?.role_label || 'Administrateur'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Vue d'ensemble des demandes clients, chantiers et publications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link to="/admin/devis">
            <Button
              variant="accent"
              size="sm"
              leftIcon={<FileText className="w-4 h-4" />}
              className="font-bold shadow-sm"
            >
              Devis en attente ({overview?.quotes_pending || 0})
            </Button>
          </Link>
          <Link to="/admin/articles?action=new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Newspaper className="w-4 h-4 text-white" />}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold shadow-sm"
            >
              + Nouvelle actualité
            </Button>
          </Link>
          <Button
            variant="outline-dark"
            size="sm"
            onClick={handleExportQuotes}
            isLoading={exportingQuotes}
            leftIcon={<Download className="w-4 h-4 text-slate-400" />}
            title="Exporter les devis au format Excel"
          >
            Export Devis (.xls)
          </Button>
          <Button
            variant="outline-dark"
            size="sm"
            onClick={handleExportMessages}
            isLoading={exportingMessages}
            leftIcon={<Download className="w-4 h-4 text-slate-400" />}
            title="Exporter les messages de contact au format Excel"
          >
            Export Messages (.xls)
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Grid (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Devis */}
        <Link
          to="/admin/devis"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-amber-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Demandes de devis</span>
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{overview?.quotes_total || 0}</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {overview?.quotes_pending || 0} en attente
            </span>
          </div>
        </Link>

        {/* Messages */}
        <Link
          to="/admin/messages"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-sky-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Messages de contact</span>
            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{overview?.messages_total || 0}</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {overview?.messages_unread || 0} non lu(s)
            </span>
          </div>
        </Link>

        {/* Chantiers / Projets */}
        <Link
          to="/admin/projets"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-orange-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Réalisations et chantiers</span>
            <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{overview?.projects_total || 0}</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {overview?.projects_published || 0} en ligne
            </span>
          </div>
        </Link>

        {/* Services & Prestations */}
        <Link
          to="/admin/services"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalogue des services</span>
            <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{overview?.services_total || 0}</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {overview?.services_active || 0} actifs
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Main Content: Quotes Table & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT (8 Cols): Dernières demandes de devis */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Dernières demandes de devis
            </h3>
            <Link to="/admin/devis" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
              Voir tout ({overview?.quotes_total || 0}) →
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {recentQuotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucune demande de devis enregistrée pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Réf.</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Domaine</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                          {q.reference}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-white">
                          <div>{q.full_name}</div>
                          {q.company && <div className="text-[10px] text-slate-400">{q.company}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {q.category?.name || 'Général'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              q.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : q.status === 'accepted'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : q.status === 'quoted'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedQuote(q as unknown as QuoteRequest)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
            )}
          </div>
        </div>

        {/* RIGHT (4 Cols): Derniers Messages */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              Derniers messages
            </h3>
            <Link to="/admin/messages" className="text-xs font-bold text-sky-400 hover:text-sky-300">
              Tous ({overview?.messages_total || 0}) →
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
            {recentMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucun message reçu.
              </div>
            ) : (
              recentMessages.slice(0, 4).map((m) => (
                <div key={m.id} className="p-4 hover:bg-slate-800/40 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[140px]">{m.full_name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        m.status === 'unread'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 truncate">{m.subject}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
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
