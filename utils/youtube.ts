// Utilitaires pour extraire l'ID de vidéo YouTube depuis une URL

export const extractVideoId = (url: string): string | null => {
  // Patterns pour différents formats d'URL YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
};

export const normalizeYouTubeUrl = (url: string): string => {
  const videoId = extractVideoId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
};

export const getVideoThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// Fonction dépréciée - utiliser fetchYouTubeMetadata du service youtubeMetadata
// Gardée pour compatibilité avec le code existant
export const getVideoTitle = (url: string): string | null => {
  const videoId = extractVideoId(url);
  return videoId ? `Vidéo YouTube ${videoId}` : null;
};