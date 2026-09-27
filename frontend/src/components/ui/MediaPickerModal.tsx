import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Search,
  Check,
  X,
  UploadCloud,
  Folder,
} from 'lucide-react';
import { uploadApi, type MediaItem } from '../../api/upload.api';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { getImageUrl, handleImageError } from '../../utils/image';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string | null;
  targetFolder?: 'articles' | 'projects' | 'services' | 'categories' | 'general';
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue,
  targetFolder,
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>(targetFolder || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, selectedFolder]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await uploadApi.getMedia({
        folder: selectedFolder === 'all' ? undefined : selectedFolder,
        search: searchQuery.trim() || undefined,
      });
      if (res.success && res.data) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Erreur chargement médiathèque picker:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Médiathèque - Choisir une image
              </h3>
              <p className="text-xs text-slate-400">
                Sélectionnez une image existante dans la bibliothèque du site
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-950/40">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'articles', 'projects', 'services', 'categories', 'general'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  selectedFolder === f
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Tous' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2">
              <Spinner size="lg" />
              <p className="text-xs text-slate-400">Chargement des images...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
              <ImageIcon className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-semibold text-white">Aucune image disponible</p>
              <p className="text-xs max-w-xs">
                Téléversez des images depuis l'onglet Médiathèque ou utilisez le téléversement direct.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
              {items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const previewUrl = getImageUrl(item.relative_url || item.url);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative rounded-xl border overflow-hidden cursor-pointer bg-slate-950 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-square w-full relative flex items-center justify-center bg-slate-950 pattern-checkered">
                      <img
                        src={previewUrl}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => handleImageError(e, item.folder)}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-950/50 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-slate-900 border-t border-slate-800/80">
                      <p className="text-[11px] font-semibold text-slate-300 truncate">
                        {item.file_name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.formatted_size}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 truncate max-w-sm">
            {selectedItem ? (
              <span className="text-white font-medium">
                Sélectionné : <span className="text-emerald-400 font-mono">{selectedItem.file_name}</span>
              </span>
            ) : (
              'Cliquez sur une image pour la sélectionner'
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs text-slate-400 border-slate-700"
            >
              Annuler
            </Button>
            <Button
              variant="accent"
              size="sm"
              disabled={!selectedItem}
              onClick={() => {
                if (selectedItem) {
                  onSelect(selectedItem.relative_url || selectedItem.url);
                  onClose();
                }
              }}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>Insérer cette image</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
