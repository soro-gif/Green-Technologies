import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categoriesApi } from '../api';
import type { Category } from '../types/models';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { getImageUrl, handleImageError } from '../utils/image';

export function DomainsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await categoriesApi.getAll();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="text-3xl sm:text-5xl text-slate-900 font-['Outfit'] tracking-tight">
            Nos domaines d'expertise
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            De la ressource en eau à l'énergie solaire, des technologies agronomiques au génie civil,
            découvrez nos pôles de compétences adaptés aux défis environnementaux et industriels.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                hoverable
                className="overflow-hidden p-0 flex flex-col justify-between bg-white border border-slate-200 group"
              >
                {/* Visual Image Header */}
                <div className="relative h-52 sm:h-60 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={cat.slug === 'eau-hydraulique' ? '/Fontaine.png' : getImageUrl(cat.image_url, cat.slug)}
                    alt={cat.name}
                    onError={(e) => handleImageError(e, cat.slug)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                  {/* Badges on bottom of image */}
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-white bg-slate-900/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 shadow-sm">
                      {cat.services_count || 0} prestations
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-950/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-emerald-400/40 shadow-sm">
                      {cat.projects_count || 0} réalisations
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 font-['Outfit'] mb-3 group-hover:text-emerald-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-base text-slate-600 leading-relaxed mb-6">
                      {cat.description ||
                        'Expertise technique de pointe, dimensionnement rigoureux et accompagnement sur-mesure pour tous vos chantiers.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-5 sm:pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <Link
                      to={`/domaines/${cat.slug}`}
                      className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-emerald-700 hover:text-emerald-800 group/link"
                    >
                      <span>Découvrir les prestations du pôle</span>
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/devis"
                      className="text-sm font-bold text-orange-600 hover:text-orange-700 inline-flex items-center"
                    >
                      Devis gratuit →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
