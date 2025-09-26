import AsyncStorage from '@react-native-async-storage/async-storage';

interface YouTubeMetadata {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  width: number;
  height: number;
  version: string;
  provider_name: string;
  provider_url: string;
  type: string;
}

interface CachedMetadata extends YouTubeMetadata {
  cached_at: number;
  url: string;
}

const METADATA_CACHE_KEY = 'youtube_metadata_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Récupère les métadonnées YouTube via l'API oEmbed
 */
export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  try {
    // Vérifier le cache d'abord
    const cachedData = await getCachedMetadata(url);
    if (cachedData) {
      return cachedData;
    }

    const oembedUrl = `https://youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

    try {
      const response = await fetch(oembedUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'PodCut/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
      }

      const metadata: YouTubeMetadata = await response.json();

      // Valider les données reçues
      if (!metadata.title || !metadata.author_name) {
        throw new Error('Invalid metadata received from YouTube oEmbed API');
      }

      // Mettre en cache les métadonnées
      await cacheMetadata(url, metadata);

      return metadata;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Récupère les métadonnées depuis le cache si disponibles et valides
 */
async function getCachedMetadata(url: string): Promise<YouTubeMetadata | null> {
  try {
    const cacheData = await AsyncStorage.getItem(METADATA_CACHE_KEY);
    if (!cacheData) return null;

    const cache: Record<string, CachedMetadata> = JSON.parse(cacheData);
    const cached = cache[url];

    if (!cached) return null;

    // Vérifier si le cache est encore valide
    const now = Date.now();
    if (now - cached.cached_at > CACHE_DURATION) {
      // Cache expiré, le supprimer
      delete cache[url];
      await AsyncStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return cached;
  } catch (error) {
    return null;
  }
}

/**
 * Met en cache les métadonnées YouTube
 */
async function cacheMetadata(url: string, metadata: YouTubeMetadata): Promise<void> {
  try {
    const cacheData = await AsyncStorage.getItem(METADATA_CACHE_KEY);
    const cache: Record<string, CachedMetadata> = cacheData ? JSON.parse(cacheData) : {};

    cache[url] = {
      ...metadata,
      cached_at: Date.now(),
      url,
    };

    await AsyncStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Ne pas faire échouer la fonction si le cache ne fonctionne pas
  }
}

/**
 * Nettoie le cache des métadonnées expirées
 */
export async function cleanupMetadataCache(): Promise<void> {
  try {
    const cacheData = await AsyncStorage.getItem(METADATA_CACHE_KEY);
    if (!cacheData) return;

    const cache: Record<string, CachedMetadata> = JSON.parse(cacheData);
    const now = Date.now();
    let cleaned = false;

    for (const [url, cached] of Object.entries(cache)) {
      if (now - cached.cached_at > CACHE_DURATION) {
        delete cache[url];
        cleaned = true;
      }
    }

    if (cleaned) {
      await AsyncStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {}
}

/**
 * Génère un titre de fallback basé sur l'URL
 */
export function generateFallbackTitle(url: string, videoId?: string): string {
  if (videoId) {
    return `Vidéo YouTube ${videoId}`;
  }

  // Essayer d'extraire quelque chose d'utile de l'URL
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return 'Vidéo YouTube';
    }
  } catch {
    // URL invalide, utiliser un titre générique
  }

  return 'Vidéo sans titre';
}

/**
 * Récupère les métadonnées avec fallback en cas d'erreur
 */
export async function fetchYouTubeMetadataWithFallback(
  url: string,
  videoId?: string
): Promise<{
  title: string;
  author_name: string;
  thumbnail_url: string;
  isFromApi: boolean;
}> {
  try {
    const metadata = await fetchYouTubeMetadata(url);
    return {
      title: metadata.title,
      author_name: metadata.author_name,
      thumbnail_url: metadata.thumbnail_url,
      isFromApi: true,
    };
  } catch (error) {
    // Utiliser les données de fallback
    return {
      title: generateFallbackTitle(url, videoId),
      author_name: 'Auteur inconnu',
      thumbnail_url: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '',
      isFromApi: false,
    };
  }
}

export type { YouTubeMetadata };
