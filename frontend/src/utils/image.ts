/**
 * Centralized Image Resolution & Category Fallbacks
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://127.0.0.1:8000';

export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  // EAU & HYDRAULIQUE
  'eau-hydraulique': '/forage.jpg',
  'eau': '/forage.jpg',
  'forage': '/forage.jpg',
  'forages': '/forage.jpg',
  'pompage': '/forage.jpg',
  'pompage-solaire': '/forage.jpg',
  'forages-hydrauliques-pompage-solaire': '/forage.jpg',
  'filtration': '/Prefiltre.png',
  'prefiltre': '/Prefiltre.png',
  'traitement-eau': '/Fontaine.png',
  'stations-filtration': '/Prefiltre.png',
  'stations-filtration-traitement-eau-oms': '/Fontaine.png',
  'fontaine': '/FTA.png',
  'dispenser': '/FP.png',

  // ENERGIE SOLAIRE
  'energie-solaire': '/solaire.jpg',
  'energie': '/solaire.jpg',
  'solaire': '/solaire.jpg',
  'centrales-solaires': '/solaire.jpg',
  'centrales-solaires-photovoltaiques-hybrides': '/solaire.jpg',
  'eclairage-public': '/eclairage.jpg',
  'eclairage-public-solaire-autonome': '/eclairage.jpg',
  'eclairage': '/eclairage.jpg',

  // AGROTECHNOLOGIES
  'agrotechnologies': '/agriculture.jpg',
  'agro': '/agriculture.jpg',
  'irrigation': '/agriculture.jpg',
  'irrigation-goutte-a-goutte-connectee': '/agriculture.jpg',
  'serres': '/agriculture.jpg',

  // BTP ET GENIE CIVIL
  'btp-genie-civil': '/btp.jpg',
  'btp': '/btp.jpg',
  'genie-civil': '/btp.jpg',
  'ouvrages-genie-civil-btp-ecologique': '/btp.jpg',
  'batiment': '/btp.jpg',

  // DEFAULT
  'default': '/forage.jpg',
};

// Known static assets located strictly in frontend/public folder
const FRONTEND_STATIC_ASSETS = [
  '/fontaine.png',
  '/prefiltre.png',
  '/fe.png',
  '/fp.png',
  '/fta.png',
  '/forage.jpg',
  '/eclairage.jpg',
  '/solaire.jpg',
  '/agriculture.jpg',
  '/btp.jpg',
  '/logo.png',
  '/favicon.svg',
  '/icons.svg',
];

/**
 * Upgrades an http:// URL to https:// to prevent mixed-content warnings.
 * Only applies to actual http URLs (not data: or relative paths).
 */
function enforceHttps(url: string): string {
  if (url.startsWith('http://')) {
    return 'https://' + url.slice('http://'.length);
  }
  return url;
}

/**
 * Normalizes an image URL:
 * - If external (http/https/data:), returns as-is (http:// is upgraded to https://)
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
      // Upgrade http:// → https:// to avoid mixed-content errors
      return trimmed.startsWith('data:') ? trimmed : enforceHttps(trimmed);
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

    // Frontend public assets
    if (FRONTEND_STATIC_ASSETS.includes(cleanPath.toLowerCase())) {
      return cleanPath;
    }

    // Backend uploads path (served by Laravel)
    if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/storage/')) {
      return enforceHttps(`${BACKEND_URL}${cleanPath}`);
    }

    return enforceHttps(`${BACKEND_URL}${cleanPath}`);
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
  
  // 1. Direct exact match
  if (CATEGORY_DEFAULT_IMAGES[key]) {
    return CATEGORY_DEFAULT_IMAGES[key];
  }

  // 2. Specific keyword priorities
  if (key.includes('forage') || key.includes('pompage')) {
    return '/forage.jpg';
  }
  if (key.includes('eclairage') || key.includes('lampadaire')) {
    return '/eclairage.jpg';
  }
  if (key.includes('filtr') || key.includes('prefiltr')) {
    return '/Prefiltre.png';
  }
  if (key.includes('traitement') || key.includes('oms') || key.includes('potab')) {
    return '/Fontaine.png';
  }
  if (key.includes('fontaine')) {
    return '/FTA.png';
  }
  if (key.includes('solaire') || key.includes('photovolt') || key.includes('panneau') || key.includes('energie')) {
    return '/solaire.jpg';
  }
  if (key.includes('irrig') || key.includes('agro') || key.includes('agri') || key.includes('goutte')) {
    return '/agriculture.jpg';
  }
  if (key.includes('btp') || key.includes('genie') || key.includes('batiment') || key.includes('civil') || key.includes('ouvrage')) {
    return '/btp.jpg';
  }
  if (key.includes('eau') || key.includes('hydraul')) {
    return '/forage.jpg';
  }

  // 3. Fallback scan
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
  const fallback = getFallbackImage(categoryIdentifier);
  
  if (!target.src.endsWith(fallback) && target.src !== fallback) {
    target.src = fallback;
  }
}
