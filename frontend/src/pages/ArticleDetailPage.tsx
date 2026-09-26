import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ChevronLeft } from 'lucide-react';
import { articlesApi } from '../api';
import type { Article } from '../types/models';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { getImageUrl, handleImageError } from '../utils/image';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        setLoading(true);
        setError(false);
        const res = await articlesApi.getBySlug(slug);
        setArticle(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <ErrorState
          title="Article introuvable"
          message="L'article demandé n'existe pas ou n'est plus publié."
          action={
            <Link to="/actualites">
              <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                Retour aux actualités
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-emerald-700">
            Accueil
          </Link>
          <span>/</span>
          <Link to="/actualites" className="hover:text-emerald-700">
            Actualités
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate">{article.title}</span>
        </div>

        <Card className="p-8 sm:p-12 bg-white space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="green">{article.category?.name || 'Publication'}</Badge>
            {article.published_at && (
              <span className="text-sm text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-['Outfit'] leading-tight">
            {article.title}
          </h1>

          <div className="w-full h-72 sm:h-[420px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs my-6 relative">
            <img
              src={getImageUrl(article.cover_image, article.category?.slug || article.category?.name)}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, article.category?.slug || article.category?.name)}
            />
          </div>

          {article.author && (
            <div className="flex items-center gap-3.5 py-4 border-y border-slate-100 text-sm text-slate-600">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                {article.author.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{article.author.name}</p>
                <p className="text-xs sm:text-sm text-slate-500">Bureau d'études GREEN TECHNOLOGIES</p>
              </div>
            </div>
          )}

          {article.excerpt && (
            <p className="text-lg sm:text-xl font-medium text-slate-800 italic border-l-4 border-emerald-600 pl-5 py-2 leading-relaxed bg-slate-50/50 rounded-r-xl">
              {article.excerpt}
            </p>
          )}

          <div className="prose prose-slate max-w-none text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-line pt-4">
            {article.content}
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Link to="/actualites" className="w-full sm:w-auto">
              <Button variant="outline" size="md" leftIcon={<ChevronLeft className="w-4 h-4" />} className="w-full sm:w-auto justify-center">
                Toutes les actualités
              </Button>
            </Link>
            <Link to="/devis" className="w-full sm:w-auto">
              <Button variant="accent" size="md" className="w-full sm:w-auto justify-center">
                Demander un devis
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ArticleDetailPage;
