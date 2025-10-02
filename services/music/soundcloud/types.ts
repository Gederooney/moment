/**
 * Types TypeScript pour l'API SoundCloud
 */

export interface SoundCloudUser {
  id: number;
  username: string;
  avatar_url: string;
  permalink_url: string;
  full_name?: string;
}

export interface SoundCloudTrack {
  id: number;
  title: string;
  duration: number; // millisecondes
  permalink_url: string;
  artwork_url: string | null;
  stream_url: string;
  user: SoundCloudUser;
  genre?: string;
  tag_list?: string;
  playback_count?: number;
}

export interface SoundCloudSearchResponse {
  collection: SoundCloudTrack[];
  total_results: number;
  next_href?: string;
}

export interface SoundCloudStreamInfo {
  url: string; // URL HLS
  protocol: 'hls' | 'progressive';
}

export interface SoundCloudTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SoundCloudError {
  errors: Array<{
    error_message: string;
    status: number;
  }>;
}
