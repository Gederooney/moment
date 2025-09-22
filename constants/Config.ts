export const Config = {
  // API Configuration
  API_BASE_URL: __DEV__
    ? 'http://localhost:3000/api'
    : 'https://your-production-api.com/api',

  // YouTube URL patterns
  YOUTUBE_URL_PATTERNS: [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
  ],

  // Audio formats
  AUDIO_FORMATS: ['mp3', 'wav', 'aac'] as const,

  // App settings
  DEFAULT_AUDIO_FORMAT: 'mp3' as const,
  MAX_VIDEO_DURATION: 3600, // 1 hour in seconds
};