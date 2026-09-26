import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  Newspaper,
  Image as ImageIcon,
  UploadCloud,
  X,
  RefreshCw,
} from 'lucide-react';
import { articlesApi, categoriesApi, uploadApi } from '../../api';
import type { Article, Category, ArticleStatus } from '../../types/models';
import type { PaginationMeta } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { MediaPickerModal } from '../../components/ui/MediaPickerModal';
import { getImageUrl, handleImageError } from '../../utils/image';
import { compressAndOptimizeImage } from '../../utils/imageUpload';

export function AdminArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    cover_image: '',
    excerpt: '',
    content: '',
    status: 'published' as ArticleStatus,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Image Upload from Computer Explorer State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localFileDetails, setLocalFileDetails] = useState<{ name: string; size: string } | null>(null);
  // Local preview URL (base64) — used ONLY for display, never sent to the API
  const [previewUrl, setPreviewUrl] = useState<string>('');
  // Session token: incremented each time the modal is opened so stale async
  // upload callbacks from a previous article cannot overwrite the current form.
  const uploadSessionRef = useRef<number>(0);

  // Load categories
  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await articlesApi.getAdminList({
        page,
        per_page: 15,
        search: searchKeyword || undefined,
        category_id: selectedCategory ? parseInt(selectedCategory, 10) : undefined,
        status: (selectedStatus as ArticleStatus) || undefined,
      });
      setArticles(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      console.error('Erreur chargement articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, selectedCategory, selectedStatus]);

  // Handle URL param action=new or create=1 to trigger modal directly
  useEffect(() => {
    if (searchParams.get('action') === 'new' || searchParams.get('create') === '1') {
      handleOpenCreate();
      // Clean up param
      searchParams.delete('action');
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handleOpenCreate = () => {
    uploadSessionRef.current += 1; // Invalidate any in-flight upload
    setEditingArticle(null);
    setFormError('');
    setLocalFileDetails(null);
    setPreviewUrl('');
    setImageMode('upload');
    setFormData({
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      title: '',
      cover_image: '',
      excerpt: '',
      content: '',
      status: 'published',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (art: Article) => {
    uploadSessionRef.current += 1; // Invalidate any in-flight upload
    setEditingArticle(art);
    setFormError('');
    setLocalFileDetails(null);
    setPreviewUrl(art.cover_image || '');
    setImageMode(art.cover_image && art.cover_image.startsWith('http') && !art.cover_image.includes('uploads/articles') ? 'url' : 'upload');
    setFormData({
      category_id: art.category_id ? String(art.category_id) : '',
      title: art.title,
      cover_image: art.cover_image || '',
      excerpt: art.excerpt || '',
      content: art.content,
      status: art.status,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setFormError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, SVG).');
      return;
    }

    // Check size (< 10MB — matches backend max:10240)
    if (file.size > 10 * 1024 * 1024) {
      setFormError('Le fichier est trop volumineux (maximum 10 Mo).');
      return;
    }

    // Capture the current session at the START of this upload.
    // If the modal is closed/reset before the upload finishes, the session
    // token will have been incremented and we must discard the stale result.
    const mySession = uploadSessionRef.current;

    try {
      setUploadingImage(true);
      setFormError('');

      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
        : `${Math.round(file.size / 1024)} Ko`;

      setLocalFileDetails({ name: file.name, size: formattedSize });

      // 1. Generate a local base64 preview ONLY for display — never sent to the API
      const optimizedDataUrl = await compressAndOptimizeImage(file);

      // Guard: if the modal was reset while we were compressing, stop here
      if (uploadSessionRef.current !== mySession) return;

      setPreviewUrl(optimizedDataUrl);

      // 2. Upload to backend — the returned URL is what gets persisted
      try {
        const res = await uploadApi.uploadImage(file, 'articles');

        // Guard: discard result if the user already opened a different article form
        if (uploadSessionRef.current !== mySession) return;

        const uploadedUrl = res.data?.url || res.data?.relative_url || '';
        if (uploadedUrl) {
          setFormData((prev) => ({ ...prev, cover_image: uploadedUrl }));
        } else {
          setFormData((prev) => ({ ...prev, cover_image: optimizedDataUrl }));
        }
      } catch (uploadErr: any) {
        if (uploadSessionRef.current !== mySession) return;
        console.warn('Backend upload failed, utilizing direct optimized base64 payload:', uploadErr);
        // Fallback to local optimized base64 so the custom image is never lost
        setFormData((prev) => ({ ...prev, cover_image: optimizedDataUrl }));
      }
    } catch (err: any) {
      if (uploadSessionRef.current !== mySession) return;
      console.error(err);
      setFormError('Erreur lors du traitement de l\'image.');
    } finally {
      if (uploadSessionRef.current === mySession) {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Le titre de l\'article est obligatoire.');
      return;
    }

    if (!formData.content.trim() || formData.content.trim().length < 20) {
      setFormError('Le contenu de l\'article doit comporter au moins 20 caractères.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        title: formData.title,
        cover_image: formData.cover_image || null,
        excerpt: formData.excerpt || null,
        content: formData.content,
        status: formData.status,
      };

      if (editingArticle) {
        await articlesApi.update(editingArticle.id, payload);
      } else {
        await articlesApi.create(payload);
      }

      setModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setFormError('Votre session a expiré. Veuillez vous reconnecter à votre compte administrateur.');
      } else if (err.response?.status === 403) {
        setFormError('Accès refusé : rôle ou permissions insuffisants pour publier un article.');
      } else if (err.response?.data?.errors) {
        const errorList = Object.values(err.response.data.errors).flat().join(' ');
        setFormError(errorList || 'Erreur de validation du formulaire.');
      } else {
        setFormError(
          err.response?.data?.message ||
          'Une erreur est survenue lors de l\'enregistrement de l\'article.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet article ? Cette action est irréversible.')) return;
    try {
      await articlesApi.delete(id);
      fetchArticles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de supprimer cet article.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Newspaper className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-semibold text-white font-['Outfit']">
              Actualités et veille technique
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Rédigez, publiez et gérez les articles d'actualités sectorielles, guides techniques et études de cas.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-emerald-600 hover:bg-emerald-500 font-bold shrink-0 shadow-sm"
        >
          + Rédiger une Actualité
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par titre ou mot-clé..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Filtrer
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Domaine :</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Tous les domaines</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Statut :</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
              <option value="archived">Archivés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
              <Newspaper className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Aucun article trouvé</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchKeyword || selectedCategory || selectedStatus
                ? 'Aucun résultat ne correspond à vos filtres.'
                : 'Commencez dès maintenant en publiant votre premier article d\'actualité.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-2"
            >
              Rédiger un premier article
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Article et titre</th>
                  <th className="px-4 py-3">Domaine technique</th>
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(art.cover_image, art.category?.slug || art.category?.name)}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          onError={(e) => handleImageError(e, art.category?.slug || art.category?.name)}
                        />
                        <div className="min-w-0">
                          <p className="text-white font-bold truncate max-w-xs">{art.title}</p>
                          {art.excerpt && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {art.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">
                      {art.category?.name ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {art.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-500">Général</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{art.author?.name || 'Admin'}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {art.published_at
                        ? new Date(art.published_at).toLocaleDateString('fr-FR')
                        : new Date(art.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          art.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : art.status === 'draft'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {art.status_label || art.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {art.status === 'published' && art.slug && (
                          <Link
                            to={`/actualites/${art.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors"
                            title="Voir sur le site public"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="Modifier l'article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Supprimer l'article"
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

      {/* Creation / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingArticle ? 'Modifier l\'actualité' : 'Rédiger une nouvelle actualité'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-800">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pôle / Domaine associé"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Général / Aucun domaine particulier</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Statut de publication"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
            >
              <option value="published">Publier immédiatement en ligne</option>
              <option value="draft">Enregistrer comme brouillon interne</option>
              <option value="archived">Archiver l'article</option>
            </Select>
          </div>

          <Input
            label="Titre de l'article *"
            required
            placeholder="Ex: Nouveaux forages solaires à haut rendement dans la région du Poro"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          {/* Image de couverture avec chargement depuis l'ordinateur */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Image de couverture / Illustration
              </label>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      imageMode === 'upload'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📁 Mon Ordinateur
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔗 Lien URL
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300/80 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🖼️ Médiathèque</span>
                </button>
              </div>
            </div>

            <MediaPickerModal
              isOpen={isMediaPickerOpen}
              onClose={() => setIsMediaPickerOpen(false)}
              onSelect={(url) => {
                setFormData((prev) => ({ ...prev, cover_image: url }));
                setPreviewUrl(url);
                setLocalFileDetails({ name: url.split('/').pop() || 'Image de la médiathèque', size: 'Bibliothèque' });
              }}
              currentValue={formData.cover_image}
              targetFolder="articles"
            />

            {imageMode === 'upload' ? (
              <div className="space-y-3">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />

                {/* Dropzone / Upload Box */}
                {!previewUrl && !formData.cover_image ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-slate-50/40'
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-2 space-y-2">
                        <Spinner size="md" />
                        <p className="text-xs font-semibold text-emerald-700 animate-pulse">
                          Téléversement de l'image en cours...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Cliquez pour choisir une image sur votre ordinateur
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            ou glissez-déposez le fichier ici
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200/70 text-slate-600">
                          Formats acceptés : JPG, PNG, WebP, SVG (Max 10 Mo)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Preview Card with Controls */
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={previewUrl || formData.cover_image}
                        alt="Aperçu"
                        className="w-16 h-14 object-cover rounded-xl border border-slate-300 shadow-2xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {localFileDetails?.name || 'Image sélectionnée'}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                            ✓ Prête
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {localFileDetails?.size ? `Taille : ${localFileDetails.size}` : 'Prête pour la publication'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                        className="text-[11px]"
                      >
                        Remplacer
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, cover_image: '' }));
                          setPreviewUrl('');
                          setLocalFileDetails(null);
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Supprimer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* URL Input Mode */
              <div className="space-y-2">
                <Input
                  placeholder="https://images.unsplash.com/... ou URL d'image"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  helperText="Saisissez directement l'URL d'une image hébergée en ligne."
                />
                {formData.cover_image && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <img
                      src={formData.cover_image}
                      alt="Aperçu"
                      className="w-16 h-12 object-cover rounded-lg border border-slate-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[11px] text-slate-500">Aperçu du lien URL</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Input
            label="Extrait / Accroche introductive"
            placeholder="Bref résumé de l'article affiché sur les cartes du blog..."
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          />

          <Textarea
            label="Corps complet de l'article *"
            required
            rows={10}
            placeholder="Rédigez votre article, analyse technique, retour d'expérience ou conseils sectoriels..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 sticky bottom-0 bg-white py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="font-bold shadow-md bg-emerald-600 hover:bg-emerald-700"
            >
              {editingArticle ? 'Mettre à jour l\'article' : 'Publier l\'actualité'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminArticlesPage;
