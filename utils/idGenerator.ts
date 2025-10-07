/**
 * ID Generator for React Native
 * Simple, collision-resistant ID generation without crypto dependency
 */

/**
 * Generate a unique ID
 * Format: timestamp-random (e.g., "1704067200000-abc123")
 */
export function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Generate a shorter ID (without timestamp prefix)
 * Format: random string (e.g., "abc123xyz")
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 11);
}
