import { useState, useEffect } from 'react';
import { Search, Trash2, Edit3, Download, CheckCircle2, Eye } from 'lucide-react';
import { contactApi } from '../../api';
import type { ContactMessage, MessageStatus } from '../../types/models';
import type { PaginationMeta } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';

export function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Edit State
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [editStatus, setEditStatus] = useState<MessageStatus>('read');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contactApi.getAdminList({
        search: search || undefined,
        status: (statusFilter as MessageStatus) || undefined,
        page,
        per_page: 15,
      });
      setMessages(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la récupération des messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [search, statusFilter, page]);

  const handleExport = async () => {
    try {
      setExporting(true);
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
      alert("Erreur lors de l'export Excel.");
    } finally {
      setExporting(false);
    }
  };

  const handleOpenEdit = (msg: ContactMessage) => {
    setSelectedMsg(msg);
    setEditStatus(msg.status === 'unread' ? 'read' : msg.status);
    setEditNotes(msg.reply_notes || '');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg) return;
    try {
      setSaving(true);
      await contactApi.updateStatus(selectedMsg.id, {
        status: editStatus,
        reply_notes: editNotes,
      });
      setSelectedMsg(null);
      fetchMessages();
    } catch (err) {
      alert('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous supprimer ce message ?')) return;
    try {
      await contactApi.delete(id);
      fetchMessages();
    } catch (err) {
      alert('Impossible de supprimer ce message.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">
            Messages de Contact
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Messagerie entrante du site web et historique de traitement.
          </p>
        </div>

        <Button
          variant="outline-dark"
          size="sm"
          onClick={handleExport}
          isLoading={exporting}
          leftIcon={<Download className="w-4 h-4 text-sky-400" />}
        >
          Exporter en Excel
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            variant="dark"
            placeholder="Rechercher par nom, email, sujet..."
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
            <option value="unread" className="bg-slate-800 text-white">Non lu</option>
            <option value="read" className="bg-slate-800 text-white">Lu</option>
            <option value="replied" className="bg-slate-800 text-white">Répondu</option>
            <option value="archived" className="bg-slate-800 text-white">Archivé</option>
          </Select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-400 space-y-3">
            <p>{error}</p>
            <Button variant="outline-dark" size="sm" onClick={fetchMessages}>
              Réessayer
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun message reçu.
          </div>
        ) : (
        ) : (
          <div>
            {/* Mobile Cards (<md) */}
            <div className="md:hidden divide-y divide-slate-800">
              {messages.map((m) => (
                <div key={m.id} className="p-4 space-y-3 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{m.full_name}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.status === 'unread'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : m.status === 'replied'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.status_label || m.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-medium text-emerald-400">{m.subject}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{m.email}</span>
                      <span>{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Consulter"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (>=md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Expéditeur</th>
                    <th className="px-4 py-3">Sujet</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Reçu le</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {messages.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">
                        <div>{m.full_name}</div>
                        <div className="text-[10px] text-slate-400">{m.email} {m.phone ? `• ${m.phone}` : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-200 font-medium">{m.subject}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.status === 'unread'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : m.status === 'replied'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {m.status_label || m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {new Date(m.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                            title="Voir le message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Consulter / Répondre"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
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
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <Modal
        isOpen={!!selectedMsg}
        onClose={() => setSelectedMsg(null)}
        title={selectedMsg?.subject || 'Détail du message'}
        maxWidth="lg"
      >
        {selectedMsg && (
          <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 text-sm">{selectedMsg.full_name}</p>
                <span className="font-mono text-[10px] text-slate-500">
                  {new Date(selectedMsg.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-slate-600 font-medium">{selectedMsg.email} {selectedMsg.phone ? `• ${selectedMsg.phone}` : ''}</p>
              <div className="pt-2 border-t border-slate-200 mt-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-1">
                  Message reçu :
                </span>
                <div className="max-h-32 overflow-y-auto p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed text-[11px]">
                  {selectedMsg.message}
                </div>
              </div>
            </div>

            <Select
              label="Statut du message"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as MessageStatus)}
            >
              <option value="read">Lu (En cours de traitement)</option>
              <option value="replied">Répondu (Email / Téléphone effectué)</option>
              <option value="archived">Archivé (Dossier clos)</option>
              <option value="unread">Non lu (Nouveau message)</option>
            </Select>

            <Textarea
              label="Notes de réponse / Suivi interne"
              rows={3}
              placeholder="Précisez la réponse apportée ou l'action menée..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 sticky bottom-0 bg-white py-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedMsg(null)}>
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
                Valider le statut du message
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
