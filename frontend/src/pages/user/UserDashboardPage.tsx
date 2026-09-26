import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { userApi } from '../../api/user.api';
import type { QuoteRequest } from '../../types/models';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';

export function UserDashboardPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await userApi.getMyQuotes({ per_page: 5 });
        setQuotes(res.data || []);
      } catch (err) {
        console.error('Erreur chargement devis utilisateur:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const pendingCount = quotes.filter((q) => q.status === 'pending' || q.status === 'in_review').length;
  const acceptedCount = quotes.filter((q) => q.status === 'accepted').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Espace Personnel Client
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
            Bienvenue, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Suivez en temps réel l'avancement de vos demandes d'études techniques, forages, installations solaires et chantiers BTP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/mon-espace/nouveau-devis">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Nouvelle Demande de Devis
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Demandes</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{quotes.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">En étude / Attente</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 font-['Outfit']">{pendingCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Devis Validés</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-['Outfit']">{acceptedCount}</p>
        </div>
      </div>

      {/* Recent Quotes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
            Mes Dernières Demandes
          </h2>
          <Link
            to="/mon-espace/mes-demandes"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
          >
            <span>Voir l'historique complet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-slate-100 text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Vous n'avez pas encore de demande de devis.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Soumettez votre projet pour recevoir un dimensionnement et une proposition chiffrée de nos ingénieurs sous 48h.
              </p>
              <div className="pt-2">
                <Link to="/mon-espace/nouveau-devis">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Créer ma première demande
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Mobile Cards (<md) */}
              <div className="md:hidden divide-y divide-slate-100">
                {quotes.map((q) => (
                  <div key={q.id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-emerald-700">{q.reference}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          q.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : q.status === 'in_review'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : q.status === 'quoted'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : q.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {q.status_label || q.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p className="font-semibold text-slate-900">{q.category?.name || 'Général'}</p>
                      {q.service && <p className="text-slate-500 text-[11px]">{q.service.title}</p>}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        <span>Ville : {q.city}</span>
                        <span>{new Date(q.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuote(q)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="w-full justify-center"
                      >
                        Voir le dossier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (>=md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Réf.</th>
                      <th className="px-4 py-3">Pôle / Domaine</th>
                      <th className="px-4 py-3">Ville</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotes.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                          {q.reference}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800">
                          <div>{q.category?.name || 'Général'}</div>
                          {q.service && <div className="text-[10px] text-slate-400">{q.service.title}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{q.city}</td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {new Date(q.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              q.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : q.status === 'in_review'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : q.status === 'quoted'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : q.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {q.status_label || q.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedQuote(q)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
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

      {/* Quote Details Modal */}
      <Modal
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        title={`Dossier : ${selectedQuote?.reference}`}
        maxWidth="lg"
      >
        {selectedQuote && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-700">{selectedQuote.reference}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {selectedQuote.status_label || selectedQuote.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">Domaine :</span> {selectedQuote.category?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Ville :</span> {selectedQuote.city}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Date de dépôt :</span>{' '}
                  {new Date(selectedQuote.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Budget estimé :</span>{' '}
                  {selectedQuote.estimated_budget
                    ? `${Number(selectedQuote.estimated_budget).toLocaleString('fr-FR')} FCFA`
                    : 'Non précisé'}
                </div>
              </div>
            </div>

            {selectedQuote.details && (
              <div>
                <label className="font-bold text-slate-700">Détails de votre besoin :</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 mt-1 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedQuote.details}
                </div>
              </div>
            )}

            {selectedQuote.admin_notes && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <p className="font-bold text-[11px] mb-1">Message de nos ingénieurs :</p>
                <p className="text-xs">{selectedQuote.admin_notes}</p>
              </div>
            )}

            <div className="pt-3 flex justify-end border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
