/**
 * Types communs pour les services musicaux
 */

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp
  tokenType: string;
  scope?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // millisecondes
  albumArt?: string;
  uri?: string; // Spotify URI ou SoundCloud stream URL
  source: 'spotify' | 'soundcloud';
}

export interface MusicUser {
  id: string;
  displayName: string;
  email?: string;
  imageUrl?: string;
  source: 'spotify' | 'soundcloud';
}

export interface PlaybackState {
  isPlaying: boolean;
  position: number; // millisecondes
  track: MusicTrack | null;
}

export interface SearchResult {
  tracks: MusicTrack[];
  total: number;
}

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint: string;
  tokenEndpoint: string;
}

export class MusicServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public source: 'spotify' | 'soundcloud',
    public originalError?: any
  ) {
    super(message);
    this.name = 'MusicServiceError';
  }
}
