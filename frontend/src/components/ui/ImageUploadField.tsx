import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadApi } from '../../api';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { getImageUrl, handleImageError } from '../../utils/image';

interface ImageUploadFieldProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  folder?: 'services' | 'projects' | 'articles' | 'general' | 'categories';
  categorySlug?: string;
  helpText?: string;
}

export function ImageUploadField({
  label = 'Image illustrative',
  value,
  onChange,
  folder = 'general',
  categorySlug,
  helpText,
}: ImageUploadFieldProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
      setError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10 Mo.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await uploadApi.uploadImage(file, folder);
      if (res.data?.url || res.data?.relative_url) {
        onChange(res.data.relative_url || res.data.url);
      }
    } catch (err: any) {
      console.error('Erreur téléversement image:', err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status === 413 ? 'Le fichier est trop volumineux pour le serveur.' : null) ||
        (err?.response?.status === 401 ? 'Session expirée. Veuillez vous reconnecter.' : null) ||
        'Échec du téléversement de l\'image.';
      setError(serverMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const previewSrc = value ? getImageUrl(value, categorySlug) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-slate-800">
          {label}
        </label>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Fichier PC</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'url'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Lien URL / Fichier public</span>
          </button>
        </div>
      </div>

      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* Upload Zone or URL Input */}
      {mode === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-white'
          }`}
        >
          {uploading ? (
            <div className="py-4 flex flex-col items-center gap-2">
              <Spinner size="md" />
              <p className="text-sm font-semibold text-emerald-800">
                Téléversement de l'image en cours...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Cliquez pour choisir un fichier ou glissez-déposez ici
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  PNG, JPG, WebP, SVG (max. 5 Mo)
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Ex: /Fontaine.png ou https://images.unsplash.com/..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          />
          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 font-medium">Images locales disponibles :</span>
            {['/Fontaine.png', '/Prefiltre.png', '/FE.png', '/FP.png', '/FTA.png'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-colors ${
                  value === preset
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Card */}
      {value && previewSrc && (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative">
              <img
                src={previewSrc}
                alt="Aperçu"
                onError={(e) => handleImageError(e, categorySlug)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Image active</span>
              </div>
              <p className="text-xs text-slate-600 truncate max-w-xs mt-0.5 font-mono">
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange('')}
              className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs py-1.5 px-2.5"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Retirer</span>
            </Button>
          </div>
        </div>
      )}

      {helpText && (
        <p className="text-xs text-slate-500">
          {helpText}
        </p>
      )}
    </div>
  );
}
