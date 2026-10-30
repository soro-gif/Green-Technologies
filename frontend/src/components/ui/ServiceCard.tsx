import { Link } from 'react-router-dom';
import type { Service } from '../../types/models';
import { getImageUrl, handleImageError, imageFitClass } from '../../utils/image';
import { Card } from './Card';

interface ServiceCardProps {
  service: Service;
  /** Nom du pôle, utile quand la liste mélange plusieurs pôles. */
  categoryName?: string;
}

export function ServiceCard({ service, categoryName }: ServiceCardProps) {
  const fallbackKey = service.category?.slug || service.slug;
  const itemKey = service.slug || service.id || service.title;
  const imageUrl = getImageUrl((service as any).image_url || service.image, fallbackKey, itemKey);

  return (
    <Card hoverable className="flex flex-col justify-between overflow-hidden p-0 bg-white">
      <div>
        <img
          src={imageUrl}
          alt={service.title}
          loading="lazy"
          width={640}
          height={400}
          onError={(e) => handleImageError(e, fallbackKey, itemKey)}
          className={`w-full aspect-[16/10] bg-slate-100 ${imageFitClass(imageUrl)}`}
        />

        <div className="p-6">
          {categoryName && <p className="text-sm text-slate-600 mb-1">{categoryName}</p>}
          <h3 className="text-xl font-bold text-slate-900 font-display mb-2.5">{service.title}</h3>
          <p className="text-slate-600 leading-relaxed line-clamp-3">
            {service.summary || service.description}
          </p>

          {service.features && service.features.length > 0 && (
            <ul className="mt-3 text-sm text-slate-700 leading-relaxed">
              {service.features.slice(0, 3).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link
          to={`/services/${service.slug}`}
          className="font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
        >
          Voir le détail
        </Link>
        <Link to="/devis" className="font-bold text-slate-700 hover:text-slate-900">
          Demander un devis
        </Link>
      </div>
    </Card>
  );
}
