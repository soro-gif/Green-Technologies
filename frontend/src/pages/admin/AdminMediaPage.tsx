import React, { useEffect, useState, useRef } from 'react';
import {
  UploadCloud,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Folder,
  Layers,
  Image as ImageIcon,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Eye,
  Grid,
  List as ListIcon,
  Download,
  X,
  Plus,
  Info,
} from 'lucide-react';
import { uploadApi, type MediaItem, type MediaStats } from '../../api/upload.api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { getImageUrl, handleImageError } from '../../utils/image';
import { compressAndOptimizeImage } from '../../utils/imageUpload';

type FolderFilter = 'all' | 'articles' | 'projects' | 'services' | 'categories' | 'general';

export function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Inspection modal
  const [inspectItem, setInspectItem] = useState<MediaItem | null>(null);

  // Upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<'articles' | 'projects' | 'services' | 'categories' | 'general'>('general');
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [fileName: string]: 'pending' | 'uploading' | 'done' | 'error' }>({});
  const [isUploading, setIsUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Single delete modal
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Toast / Copy notification
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMediaData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const [mediaRes, statsRes] = await Promise.all([
        uploadApi.getMedia({
          folder: selectedFolder === 'all' ? undefined : selectedFolder,
          search: searchQuery.trim() || undefined,
        }),
        uploadApi.getMediaStats(),
      ]);

      if (mediaRes.success && mediaRes.data) {
        setMediaList(mediaRes.data.items || []);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err: any) {
      console.error('Erreur chargement médiathèque:', err);
      showNotification('error', 'Impossible de charger la médiathèque.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMediaData();
  }, [selectedFolder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMediaData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('success', 'URL copiée dans le presse-papier !');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Upload handler
  const handleFilesSelected = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp|svg|gif|avif)$/i)) {
        validFiles.push(f);
      }
    }
    if (validFiles.length === 0) {
      showNotification('error', 'Veuillez sélectionner des fichiers image valides.');
      return;
    }
    setUploadQueue((prev) => [...prev, ...validFiles]);
  };

  const executeUploadQueue = async () => {
    if (uploadQueue.length === 0 || isUploading) return;
    setIsUploading(true);

    let successCount = 0;
    for (const file of uploadQueue) {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 'uploading' }));
      try {
        await uploadApi.uploadImage(file, uploadFolder);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 'done' }));
        successCount++;
      } catch (err) {
        console.error(`Erreur upload ${file.name}:`, err);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 'error' }));
      }
    }

    setIsUploading(false);
    showNotification('success', `${successCount} image(s) téléversée(s) avec succès.`);
    setUploadQueue([]);
    setUploadProgress({});
    setIsUploadModalOpen(false);
    fetchMediaData(true);
  };

  // Delete single file
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await uploadApi.deleteMedia(itemToDelete.relative_url || itemToDelete.url);
      showNotification('success', `L'image ${itemToDelete.file_name} a été supprimée.`);
      setItemToDelete(null);
      if (inspectItem?.id === itemToDelete.id) {
        setInspectItem(null);
      }
      fetchMediaData(true);
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      showNotification('error', 'Erreur lors de la suppression du fichier.');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkDeleting(true);
      const itemsToDelete = mediaList.filter((m) => selectedIds.includes(m.id));
      const paths = itemsToDelete.map((m) => m.relative_url || m.url);
      const res = await uploadApi.bulkDeleteMedia(paths);

      showNotification('success', `${res.data?.deleted_count || selectedIds.length} images supprimées.`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      fetchMediaData(true);
    } catch (err: any) {
      console.error('Erreur suppression groupée:', err);
      showNotification('error', 'Erreur lors de la suppression groupée.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    const deletableItems = mediaList.filter((m) => m.is_deletable);
    if (selectedIds.length === deletableItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deletableItems.map((m) => m.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const folderBadges: { key: FolderFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'Toutes les images', count: stats?.total_count },
    { key: 'articles', label: 'Actualités & Blog', count: stats?.by_folder?.articles?.count },
    { key: 'projects', label: 'Projets & Réalisations', count: stats?.by_folder?.projects?.count },
    { key: 'services', label: 'Catalogue Services', count: stats?.by_folder?.services?.count },
    { key: 'categories', label: 'Pôles & Domaines', count: stats?.by_folder?.categories?.count },
    { key: 'general', label: 'Général & Public', count: stats?.by_folder?.general?.count },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all border animate-in fade-in slide-in-from-bottom-3 ${
            notification.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-100 border-emerald-500/40'
              : 'bg-rose-900/95 text-rose-100 border-rose-500/40'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gestionnaire de Médias Centralisé</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 font-['Outfit']">
            Médiathèque & Gestion des Images
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Téléversez, organisez, inspectez et supprimez toutes les ressources visuelles du site. Obtenez instantanément les liens publics et vérifiez où chaque image est utilisée.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMediaData(true)}
            disabled={refreshing}
            className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
            className="font-semibold text-sm shadow-sm rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Téléverser des images</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Images</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit']">
                  {mediaList.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-700">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Espace Stockage</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit']">
                  {stats.total_formatted_size}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Images Actives</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit']">
                  {mediaList.filter((m) => m.usage_count > 0).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Dossiers Cibles</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit']">
                  5 dossiers
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Control Bar: Search, Category Filters, Views & Bulk Actions */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, dossier ou utilisation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Toggles & Bulk Actions */}
          <div className="flex items-center justify-between lg:justify-end gap-3">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Supprimer sélection ({selectedIds.length})</span>
              </Button>
            )}

            <div className="flex items-center rounded-xl bg-white border border-slate-200 p-1 shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Affichage Galerie"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Affichage Liste / Tableau"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Folder Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-200 pb-4">
          <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtrer :</span>
          </span>
          {folderBadges.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedFolder(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                selectedFolder === f.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-2xs'
              }`}
            >
              <span>{f.label}</span>
              {typeof f.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedFolder === f.key
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Grid vs List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Chargement de la médiathèque...</p>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Aucune image trouvée</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `Aucun résultat pour la recherche « ${searchQuery} » dans ce dossier.`
                : 'Aucune image dans ce dossier. Vous pouvez en téléverser dès maintenant.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="font-semibold text-xs rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Ajouter une image</span>
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID GALLERY VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mediaList.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isCopied = copiedId === item.id;
            const previewUrl = getImageUrl(item.relative_url || item.url);

            return (
              <div
                key={item.id}
                className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Checkbox for bulk selection */}
                {item.is_deletable && (
                  <div className="absolute top-2.5 left-2.5 z-20">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white cursor-pointer shadow-xs"
                    />
                  </div>
                )}

                {/* Folder Badge */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-slate-700 border border-slate-200/80 shadow-2xs backdrop-blur-md">
                    {item.folder}
                  </span>
                </div>

                {/* Image Thumbnail with Aspect Ratio */}
                <div
                  onClick={() => setInspectItem(item)}
                  className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center pattern-checkered"
                >
                  <img
                    src={previewUrl}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => handleImageError(e, item.folder)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectItem(item);
                      }}
                      className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                      title="Inspecter"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.url || item.relative_url, item.id);
                      }}
                      className="p-2 rounded-xl bg-white text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                      title="Copier l'URL"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {item.is_deletable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item);
                        }}
                        className="p-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shadow-xs"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Meta Footer */}
                <div className="p-3 space-y-1.5 bg-white border-t border-slate-100">
                  <p
                    className="text-xs font-semibold text-slate-800 truncate cursor-pointer hover:text-emerald-700"
                    title={item.file_name}
                    onClick={() => setInspectItem(item)}
                  >
                    {item.file_name}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.formatted_size}</span>
                    {item.usage_count > 0 ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-0.5" title={`Utilisé dans ${item.usage_count} élément(s)`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.usage_count} util.</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Non lié</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === mediaList.filter((m) => m.is_deletable).length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Aperçu</th>
                  <th className="p-4">Nom du fichier</th>
                  <th className="p-4">Dossier</th>
                  <th className="p-4">Taille</th>
                  <th className="p-4">Utilisation</th>
                  <th className="p-4">Date d'ajout</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mediaList.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isCopied = copiedId === item.id;
                  const previewUrl = getImageUrl(item.relative_url || item.url);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-emerald-50/60' : ''
                      }`}
                    >
                      <td className="p-4">
                        {item.is_deletable && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="p-4">
                        <div
                          onClick={() => setInspectItem(item)}
                          className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer shrink-0 relative shadow-2xs"
                        >
                          <img
                            src={previewUrl}
                            alt={item.name}
                            onError={(e) => handleImageError(e, item.folder)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p
                            className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                            onClick={() => setInspectItem(item)}
                          >
                            {item.file_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                            {item.relative_url}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                          {item.folder_label || item.folder}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{item.formatted_size}</td>
                      <td className="p-4">
                        {item.usage_count > 0 ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{item.usage_count} élément(s)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Non référencé</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">{item.updated_at}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Inspecter"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.url || item.relative_url, item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Copier l'URL"
                          >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          {item.is_deletable && (
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. INSPECT IMAGE DETAILS MODAL */}
      {/* ========================================================================= */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Détails & Aperçu du Fichier
                </h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Full Image Preview */}
              <div className="w-full h-64 sm:h-72 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-2xs">
                <img
                  src={getImageUrl(inspectItem.relative_url || inspectItem.url)}
                  alt={inspectItem.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Nom du fichier</p>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5" title={inspectItem.file_name}>
                    {inspectItem.file_name}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Dossier</p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5 capitalize">
                    {inspectItem.folder}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Taille</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{inspectItem.formatted_size}</p>
                </div>
              </div>

              {/* Public URL Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL publique utilisable</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inspectItem.relative_url || inspectItem.url}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => copyToClipboard(inspectItem.relative_url || inspectItem.url, inspectItem.id)}
                    className="text-xs font-bold shrink-0"
                  >
                    {copiedId === inspectItem.id ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    <span>Copier</span>
                  </Button>
                </div>
              </div>

              {/* Used In List */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Utilisation sur le site ({inspectItem.usage_count})</span>
                </div>
                {inspectItem.used_in && inspectItem.used_in.length > 0 ? (
                  <div className="space-y-1.5">
                    {inspectItem.used_in.map((u, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="font-bold text-emerald-700">{u.entity} : </span>
                          <span className="text-slate-800 font-medium">{u.title}</span>
                        </div>
                        {u.link && (
                          <a
                            href={u.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                          >
                            <span>Voir</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                    Cette image n'est actuellement liée à aucun article, projet ou service.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {inspectItem.is_deletable ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setItemToDelete(inspectItem);
                  }}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Supprimer définitivement</span>
                </Button>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  Fichier système protégé
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectItem(null)}
                className="text-xs text-slate-700 border-slate-200"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. UPLOAD MODAL */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Téléverser de Nouvelles Images
                </h3>
              </div>
              <button
                onClick={() => {
                  if (!isUploading) {
                    setIsUploadModalOpen(false);
                    setUploadQueue([]);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Folder Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Dossier de destination
                </label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="general">Général (Logos, bannières, équipe)</option>
                  <option value="articles">Articles & Actualités</option>
                  <option value="projects">Projets & Réalisations</option>
                  <option value="services">Services & Catalogue</option>
                  <option value="categories">Pôles & Catégories</option>
                </select>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                multiple
                ref={uploadInputRef}
                onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/avif"
                className="hidden"
              />

              {/* Drag and drop zone */}
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !isUploading && uploadInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-colors space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200/60">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Cliquez ou glissez-déposez vos images ici
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    PNG, JPG, WebP, SVG, AVIF (plusieurs fichiers acceptés)
                  </p>
                </div>
              </div>

              {/* Upload Queue List */}
              {uploadQueue.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <p className="text-xs font-semibold text-slate-500">
                    Fichiers sélectionnés ({uploadQueue.length})
                  </p>
                  {uploadQueue.map((file, i) => {
                    const status = uploadProgress[file.name] || 'pending';
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <span className="text-slate-800 font-medium truncate max-w-xs">
                          {file.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {status === 'pending' && (
                            <span className="text-[10px] text-slate-500">Prêt</span>
                          )}
                          {status === 'uploading' && (
                            <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                              <Spinner size="sm" /> En cours...
                            </span>
                          )}
                          {status === 'done' && (
                            <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-bold">
                              <Check className="w-3.5 h-3.5" /> Fait
                            </span>
                          )}
                          {status === 'error' && (
                            <span className="text-[10px] text-rose-600 font-bold">Erreur</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadQueue([]);
                }}
                className="text-xs text-slate-600 border-slate-200"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={uploadQueue.length === 0 || isUploading}
                onClick={executeUploadQueue}
                className="text-xs font-semibold rounded-xl"
              >
                {isUploading ? <Spinner size="sm" className="mr-1.5" /> : <UploadCloud className="w-3.5 h-3.5 mr-1.5" />}
                <span>Démarrer le téléversement ({uploadQueue.length})</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Confirmer la suppression
              </h3>
              <p className="text-xs text-slate-600">
                Êtes-vous sûr de vouloir supprimer définitivement l'image{' '}
                <span className="font-bold text-slate-900">{itemToDelete.file_name}</span> ?
              </p>
              {itemToDelete.usage_count > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-left">
                  ⚠️ Attention : cette image est utilisée dans {itemToDelete.usage_count} élément(s) du site.
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={deleting}
                onClick={() => setItemToDelete(null)}
                className="text-xs border-slate-200 text-slate-700"
              >
                Annuler
              </Button>
              <Button
                variant="accent"
                size="sm"
                disabled={deleting}
                onClick={handleDeleteItem}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
              >
                {deleting ? <Spinner size="sm" className="mr-1.5" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                <span>Supprimer</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BULK DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Suppression groupée
              </h3>
              <p className="text-xs text-slate-600">
                Vous vous apprêtez à supprimer{' '}
                <span className="font-bold text-slate-900">{selectedIds.length} images</span> du serveur.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={bulkDeleting}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="text-xs border-slate-200 text-slate-700"
              >
                Annuler
              </Button>
              <Button
                variant="accent"
                size="sm"
                disabled={bulkDeleting}
                onClick={handleBulkDelete}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
              >
                {bulkDeleting ? <Spinner size="sm" className="mr-1.5" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                <span>Confirmer ({selectedIds.length})</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
