/**
 * Video URL utilities for multi-platform support
 * Supports: YouTube, Vimeo, Twitch
 */

export type VideoPlatform = 'youtube' | 'vimeo' | 'twitch' | 'unknown';

export interface VideoUrlInfo {
  platform: VideoPlatform;
  videoId: string;
  originalUrl: string;
  normalizedUrl: string;
}

/**
 * Detect video platform from URL
 */
export function detectPlatform(url: string): VideoPlatform {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  }
  if (urlLower.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (urlLower.includes('twitch.tv')) {
    return 'twitch';
  }

  return 'unknown';
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
    /youtube\.com\/v\/([^?&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Twitch video ID or channel name from URL
 */
export function extractTwitchId(url: string): string | null {
  const patterns = [
    /twitch\.tv\/videos\/(\d+)/, // VOD
    /twitch\.tv\/([^/\s]+)$/, // Channel/Live
    /twitch\.tv\/([^/\s]+)\/?$/, // Channel with optional trailing slash
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Normalize YouTube URL
 */
export function normalizeYouTubeUrl(url: string): string {
  const videoId = extractYouTubeId(url);
  if (!videoId) return url;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Normalize Vimeo URL
 */
export function normalizeVimeoUrl(url: string): string {
  const videoId = extractVimeoId(url);
  if (!videoId) return url;
  return `https://vimeo.com/${videoId}`;
}

/**
 * Normalize Twitch URL
 */
export function normalizeTwitchUrl(url: string): string {
  const id = extractTwitchId(url);
  if (!id) return url;

  // Check if it's a VOD (numeric ID) or channel (alphanumeric)
  if (/^\d+$/.test(id)) {
    return `https://www.twitch.tv/videos/${id}`;
  } else {
    return `https://www.twitch.tv/${id}`;
  }
}

/**
 * Parse video URL and extract platform-specific information
 */
export function parseVideoUrl(url: string): VideoUrlInfo | null {
  const platform = detectPlatform(url);

  if (platform === 'unknown') {
    return null;
  }

  let videoId: string | null = null;
  let normalizedUrl: string = url;

  switch (platform) {
    case 'youtube':
      videoId = extractYouTubeId(url);
      if (videoId) {
        normalizedUrl = normalizeYouTubeUrl(url);
      }
      break;

    case 'vimeo':
      videoId = extractVimeoId(url);
      if (videoId) {
        normalizedUrl = normalizeVimeoUrl(url);
      }
      break;

    case 'twitch':
      videoId = extractTwitchId(url);
      if (videoId) {
        normalizedUrl = normalizeTwitchUrl(url);
      }
      break;
  }

  if (!videoId) {
    return null;
  }

  return {
    platform,
    videoId,
    originalUrl: url,
    normalizedUrl,
  };
}

/**
 * Validate if URL is a supported video platform
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const info = parseVideoUrl(url);
  return info !== null && info.videoId !== '';
}

/**
 * Get platform display name
 */
export function getPlatformName(platform: VideoPlatform): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'vimeo':
      return 'Vimeo';
    case 'twitch':
      return 'Twitch';
    default:
      return 'Unknown';
  }
}
