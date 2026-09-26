import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, Eye } from 'lucide-react';
import { userApi } from '../../api/user.api';
import type { QuoteRequest } from '../../types/models';
import type { PaginationMeta } from '../../types/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';

export function UserQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await userApi.getMyQuotes({ page, per_page: 10 });
      setQuotes(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 font-['Outfit']">
            Mes Demandes de Devis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consultez le statut et les réponses de nos ingénieurs pour tous vos projets enregistrés.
          </p>
        </div>

        <Link to="/mon-espace/nouveau-devis">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Demander un Devis
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Aucune demande de devis trouvée.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Vous n'avez pas encore soumis de dossier d'ingénierie ou d'étude technique.
            </p>
            <div className="pt-2">
              <Link to="/mon-espace/nouveau-devis">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Créer un devis
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Mobile Cards View (<md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {quotes.map((q) => (
                <div key={q.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-emerald-700">{q.reference}</span>
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

                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-semibold text-slate-800">Domaine :</span> {q.category?.name || 'Général'}</p>
                    {q.service && <p><span className="font-semibold text-slate-800">Prestation :</span> {q.service.title}</p>}
                    <div className="flex items-center justify-between pt-1">
                      <span><span className="font-semibold text-slate-800">Ville :</span> {q.city}</span>
                      <span className="text-slate-500">{new Date(q.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-900">
                      {q.estimated_budget
                        ? `${Number(q.estimated_budget).toLocaleString('fr-FR')} FCFA`
                        : 'Budget non précisé'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuote(q)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>=md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Réf. Dossier</th>
                    <th className="px-4 py-3">Pôle / Domaine</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Budget Estimé</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Date</th>
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
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {q.estimated_budget
                          ? `${Number(q.estimated_budget).toLocaleString('fr-FR')} FCFA`
                          : 'Non précisé'}
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
                      <td className="px-4 py-3.5 text-slate-500">
                        {new Date(q.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Voir le dossier"
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

        <div className="p-4 border-t border-slate-100">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      {/* Quote Details Modal */}
      <Modal
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        title={`Détail du devis : ${selectedQuote?.reference}`}
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
                  <span className="font-semibold text-slate-800">Prestation :</span> {selectedQuote.service?.title || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Ville :</span> {selectedQuote.city}
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
                <label className="font-bold text-slate-700">Votre description :</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 mt-1 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedQuote.details}
                </div>
              </div>
            )}

            {selectedQuote.admin_notes && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <p className="font-bold text-[11px] mb-1">Réponse technique de l'équipe :</p>
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
