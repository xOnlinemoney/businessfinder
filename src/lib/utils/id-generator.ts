// ID Generator Utilities
// Generates random alphanumeric IDs for listings and other entities

// Characters used for ID generation (alphanumeric, URL-safe)
const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// URL-safe characters (lowercase + numbers, no ambiguous chars)
const URL_SAFE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789'; // Removed i, l, o, 1, 0 to avoid confusion

/**
 * Generate a random alphanumeric ID
 * @param length - Length of the ID (default: 16, range: 10-20)
 * @returns Random alphanumeric string
 */
export function generateListingId(length: number = 16): string {
  // Ensure length is within valid range (10-20 as per requirements)
  const safeLength = Math.max(10, Math.min(20, length));

  let result = '';
  const chars = ALPHANUMERIC_CHARS;

  // Use crypto API for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(safeLength);
    crypto.getRandomValues(array);
    for (let i = 0; i < safeLength; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < safeLength; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

/**
 * Generate a URL-safe ID (lowercase, no ambiguous characters)
 * @param length - Length of the ID (default: 12)
 * @returns URL-safe random string
 */
export function generateUrlSafeId(length: number = 12): string {
  let result = '';
  const chars = URL_SAFE_CHARS;

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

/**
 * Generate a slug from a title
 * @param title - The title to convert to a slug
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
}

/**
 * Generate a unique slug with ID suffix
 * @param title - The title to convert to a slug
 * @param idLength - Length of the ID suffix (default: 8)
 * @returns URL-friendly slug with unique ID
 */
export function generateUniqueSlug(title: string, idLength: number = 8): string {
  const baseSlug = generateSlug(title);
  const uniqueId = generateUrlSafeId(idLength);
  return `${baseSlug}-${uniqueId}`;
}

/**
 * Validate a listing ID format
 * @param id - The ID to validate
 * @returns Whether the ID is valid
 */
export function isValidListingId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (id.length < 10 || id.length > 20) return false;
  return /^[A-Za-z0-9]+$/.test(id);
}

/**
 * Validate a slug format
 * @param slug - The slug to validate
 * @returns Whether the slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generate a short reference code (for offers, transactions, etc.)
 * @param prefix - Optional prefix (e.g., 'OFF', 'TXN')
 * @returns Reference code like "OFF-A1B2C3"
 */
export function generateReferenceCode(prefix?: string): string {
  const code = generateUrlSafeId(6).toUpperCase();
  return prefix ? `${prefix}-${code}` : code;
}
