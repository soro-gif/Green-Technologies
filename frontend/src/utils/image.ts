/**
 * Centralized Image Resolution & Category Fallbacks
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://127.0.0.1:8000';

export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  // EAU & HYDRAULIQUE
  'eau-hydraulique': '/Fontaine.png',
  'eau': '/Fontaine.png',
  'forage': '/Fontaine.png',
  'forages': '/Fontaine.png',
  'pompage': '/Fontaine.png',
  'filtration': '/Prefiltre.png',
  'prefiltre': '/Prefiltre.png',
  'traitement-eau': '/Prefiltre.png',
  'stations-filtration': '/Prefiltre.png',

  // ENERGIE SOLAIRE
  'energie-solaire': '/solaire.jpg',
  'energie': '/solaire.jpg',
  'solaire': '/solaire.jpg',
  'centrales-solaires': '/solaire.jpg',
  'eclairage-public': '/solaire.jpg',

  // AGROTECHNOLOGIES
  'agrotechnologies': '/agriculture.jpg',
  'agro': '/agriculture.jpg',
  'irrigation': '/agriculture.jpg',
  'serres': '/agriculture.jpg',

  // BTP ET GENIE CIVIL
  'btp-genie-civil': '/btp.jpg',
  'btp': '/btp.jpg',
  'genie-civil': '/btp.jpg',
  'batiment': '/btp.jpg',

  // DEFAULT
  'default': '/Fontaine.png',
};

// Known static assets located strictly in frontend/public folder
const FRONTEND_STATIC_ASSETS = [
  '/fontaine.png',
  '/prefiltre.png',
  '/fe.png',
  '/fp.png',
  '/fta.png',
  '/solaire.jpg',
  '/agriculture.jpg',
  '/btp.jpg',
  '/logo.png',
  '/favicon.svg',
  '/icons.svg',
];

/**
 * Normalizes an image URL:
 * - If external (http/https/data:), returns as-is
 * - If backend upload (/uploads/... or /storage/...), prepends backend base URL
 * - If known frontend static asset (/Fontaine.png...), returns local relative path
 * - Otherwise prepends backend base URL or falls back to category theme image
 */
export function getImageUrl(
  imagePath?: string | null,
  categoryIdentifier?: string | null
): string {
  if (imagePath && typeof imagePath === 'string' && imagePath.trim().length > 0) {
    const trimmed = imagePath.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

    // Backend uploads path (served by Laravel)
    if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/storage/')) {
      return `${BACKEND_URL}${cleanPath}`;
    }

    // Frontend public assets
    if (FRONTEND_STATIC_ASSETS.includes(cleanPath.toLowerCase())) {
      return cleanPath;
    }

    return `${BACKEND_URL}${cleanPath}`;
  }

  return getFallbackImage(categoryIdentifier);
}

/**
 * Returns a high quality theme image based on category slug or name
 */
export function getFallbackImage(categoryIdentifier?: string | null): string {
  if (!categoryIdentifier) {
    return CATEGORY_DEFAULT_IMAGES['default'];
  }

  const key = categoryIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '-');
  for (const [catKey, url] of Object.entries(CATEGORY_DEFAULT_IMAGES)) {
    if (key.includes(catKey) || catKey.includes(key)) {
      return url;
    }
  }

  return CATEGORY_DEFAULT_IMAGES['default'];
}

/**
 * Safe Image error handler that replaces failed src with local guaranteed fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  categoryIdentifier?: string | null
) {
  const target = event.target as HTMLImageElement;
  if (
    target.src.includes('/Fontaine.png') ||
    target.src.includes('/Prefiltre.png') ||
    target.src.includes('/solaire.jpg') ||
    target.src.includes('/agriculture.jpg') ||
    target.src.includes('/btp.jpg')
  ) {
    return;
  }
  
  const fallback = getFallbackImage(categoryIdentifier);
  if (target.src !== fallback && !target.src.endsWith(fallback)) {
    target.src = fallback;
  } else {
    target.src = '/Fontaine.png';
  }
}
