import { useState, useEffect } from 'react';
import { Search, Trash2, Edit3, Download, CheckCircle2, Eye } from 'lucide-react';
import { quotesApi } from '../../api';
import type { QuoteRequest, QuoteStatus } from '../../types/models';
import type { PaginationMeta } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';

export function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Edit / Details Modal State
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [editStatus, setEditStatus] = useState<QuoteStatus>('pending');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await quotesApi.getAdminList({
        search: search || undefined,
        status: (statusFilter as QuoteStatus) || undefined,
        page,
        per_page: 15,
      });
      setQuotes(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la récupération des devis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [search, statusFilter, page]);

  const handleExport = async () => {
    try {
      setExporting(true);
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
      alert("Erreur lors de l'export Excel.");
    } finally {
      setExporting(false);
    }
  };

  const handleOpenEdit = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setEditStatus(quote.status);
    setEditNotes(quote.admin_notes || '');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    try {
      setSaving(true);
      await quotesApi.updateStatus(selectedQuote.id, {
        status: editStatus,
        admin_notes: editNotes,
      });
      setSelectedQuote(null);
      fetchQuotes();
    } catch (err) {
      alert('Erreur lors de la mise à jour du devis.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette demande de devis ?')) return;
    try {
      await quotesApi.delete(id);
      fetchQuotes();
    } catch (err) {
      alert('Impossible de supprimer ce devis.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">
            Gestion des Demandes de Devis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Consultez, traitez et mettez à jour le statut des dossiers clients.
          </p>
        </div>

        <Button
          variant="outline-dark"
          size="sm"
          onClick={handleExport}
          isLoading={exporting}
          leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
        >
          Exporter en Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            variant="dark"
            placeholder="Rechercher par référence, nom, email, ville..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div>
          <Select
            variant="dark"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="" className="bg-slate-800 text-white">Tous les statuts</option>
            <option value="pending" className="bg-slate-800 text-white">En attente</option>
            <option value="in_review" className="bg-slate-800 text-white">En cours d'étude</option>
            <option value="quoted" className="bg-slate-800 text-white">Devis transmis</option>
            <option value="accepted" className="bg-slate-800 text-white">Accepté</option>
            <option value="rejected" className="bg-slate-800 text-white">Refusé</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-400 space-y-3">
            <p>{error}</p>
            <Button variant="outline-dark" size="sm" onClick={fetchQuotes}>
              Réessayer
            </Button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun devis ne correspond aux critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Réf.</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Ville</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      {q.reference}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      <div>{q.full_name}</div>
                      <div className="text-[10px] text-slate-400">{q.phone} • {q.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{q.city}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {q.estimated_budget
                        ? `${Number(q.estimated_budget).toLocaleString('fr-FR')} F`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          q.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : q.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : q.status === 'quoted'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {q.status_label || q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(q.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                          title="Voir le dossier de devis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="Traiter / Mettre à jour"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      {/* Edit & Process Modal */}
      <Modal
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        title={`Traitement du devis : ${selectedQuote?.reference}`}
        maxWidth="lg"
      >
        {selectedQuote && (
          <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 text-sm">{selectedQuote.full_name}</p>
                <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedQuote.city}
                </span>
              </div>
              <p className="text-slate-600 font-medium">{selectedQuote.phone} • {selectedQuote.email}</p>
              {selectedQuote.company && (
                <p className="text-slate-500 text-[11px] font-semibold">Entreprise : {selectedQuote.company}</p>
              )}
              {selectedQuote.details && (
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-1">
                    Cahier des charges et détails :
                  </span>
                  <div className="max-h-32 overflow-y-auto p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed text-[11px]">
                    {selectedQuote.details}
                  </div>
                </div>
              )}
            </div>

            <Select
              label="Statut du dossier"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as QuoteStatus)}
            >
              <option value="pending">En attente (Nouveau dossier)</option>
              <option value="in_review">En cours d'étude (Bureau d'études)</option>
              <option value="quoted">Devis chiffré et transmis au client</option>
              <option value="accepted">Accepté par le client (Chantier validé)</option>
              <option value="rejected">Refusé / Non recevable</option>
            </Select>

            <Textarea
              label="Notes internes du bureau d'études"
              rows={3}
              placeholder="Ajoutez des notes techniques, chiffrage ou compte-rendu d'appel..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 sticky bottom-0 bg-white py-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={saving}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="font-bold shadow-md"
              >
                Valider le statut du devis
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
