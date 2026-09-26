/**
 * Centralized Image Resolution & Intelligent Diverse Category Fallbacks
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://127.0.0.1:8000';

/**
 * Diverse pools of high-definition images per category.
 * Each item in the same category gets a distinct image based on its unique key (id, title, or slug).
 */
export const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  // EAU & HYDRAULIQUE
  'eau-hydraulique': [
    '/forage.jpg',
    '/Fontaine.png',
    '/Prefiltre.png',
    '/FTA.png',
    '/FP.png',
    '/FE.png',
  ],

  // ENERGIE SOLAIRE
  'energie-solaire': [
    '/solaire.jpg',
    '/eclairage.jpg',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800',
  ],

  // AGROTECHNOLOGIES
  'agrotechnologies': [
    '/agriculture.jpg',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800',
  ],

  // BTP ET GENIE CIVIL
  'btp-genie-civil': [
    '/btp.jpg',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800',
  ],

  // DEFAULT
  'default': [
    '/forage.jpg',
    '/solaire.jpg',
    '/agriculture.jpg',
    '/btp.jpg',
    '/Fontaine.png',
    '/eclairage.jpg',
  ],
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
 * Computes a deterministic integer hash from a key string or number.
 */
function getHashIndex(key: string | number | null | undefined, modulo: number): number {
  if (modulo <= 1) return 0;
  if (!key) return 0;
  const str = String(key);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000000007;
  }
  return Math.abs(hash) % modulo;
}

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
 * - Otherwise prepends backend base URL or falls back to a unique category theme image
 */
export function getImageUrl(
  imagePath?: string | null,
  categoryIdentifier?: string | null,
  itemKey?: string | number | null
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

  return getFallbackImage(categoryIdentifier, itemKey);
}

/**
 * Returns a distinct high quality theme image based on category and unique item key.
 * This prevents any two articles or projects in the same category from having the same fallback image.
 */
export function getFallbackImage(
  categoryIdentifier?: string | null,
  itemKey?: string | number | null
): string {
  const normalizedKey = categoryIdentifier ? categoryIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '-') : '';

  let pool: string[] = CATEGORY_IMAGE_POOLS['default'];

  if (normalizedKey.includes('forage') || normalizedKey.includes('eau') || normalizedKey.includes('hydraul') || normalizedKey.includes('filtr') || normalizedKey.includes('fontaine')) {
    pool = CATEGORY_IMAGE_POOLS['eau-hydraulique'];
  } else if (normalizedKey.includes('solaire') || normalizedKey.includes('energie') || normalizedKey.includes('eclairage')) {
    pool = CATEGORY_IMAGE_POOLS['energie-solaire'];
  } else if (normalizedKey.includes('agro') || normalizedKey.includes('agri') || normalizedKey.includes('irrig') || normalizedKey.includes('serre')) {
    pool = CATEGORY_IMAGE_POOLS['agrotechnologies'];
  } else if (normalizedKey.includes('btp') || normalizedKey.includes('genie') || normalizedKey.includes('batiment') || normalizedKey.includes('civil') || normalizedKey.includes('ouvrage')) {
    pool = CATEGORY_IMAGE_POOLS['btp-genie-civil'];
  }

  const index = getHashIndex(itemKey || categoryIdentifier, pool.length);
  return pool[index] || pool[0];
}

/**
 * Safe Image error handler that replaces failed src with a distinct local fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  categoryIdentifier?: string | null,
  itemKey?: string | number | null
) {
  const target = event.target as HTMLImageElement;
  const fallback = getFallbackImage(categoryIdentifier, itemKey);

  if (!target.src.endsWith(fallback) && target.src !== fallback) {
    target.src = fallback;
  }
}
