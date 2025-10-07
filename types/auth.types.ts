/**
 * Types TypeScript pour l'authentification OAuth 2.0
 * Support Spotify uniquement (OAuth 2.0 PKCE)
 */

/**
 * Enum des services musicaux supportés
 */
export enum MusicService {
  SPOTIFY = 'spotify',
}

/**
 * Interface pour les tokens OAuth
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp en millisecondes
  tokenType: string;
  scope?: string;
}

/**
 * État d'authentification pour un service
 */
export interface ServiceAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: AuthToken | null;
  user: AuthUser | null;
}

/**
 * Utilisateur authentifié (format unifié)
 */
export interface AuthUser {
  id: string;
  displayName: string;
  email?: string;
  imageUrl?: string;
  service: MusicService;
}

/**
 * État global d'authentification
 */
export interface AuthState {
  spotify: ServiceAuthState;
}

/**
 * Configuration OAuth pour un service
 */
export interface OAuthServiceConfig {
  clientId: string;
  clientSecret?: string; // Optionnel, uniquement pour SoundCloud
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint: string;
  tokenEndpoint: string;
}

/**
 * Configuration complète OAuth
 */
export interface OAuthConfig {
  spotify: OAuthServiceConfig;
  soundcloud: OAuthServiceConfig;
}

/**
 * Méthodes du contexte d'authentification
 */
export interface AuthContextType {
  // État
  authState: AuthState;
  isRestoring: boolean; // Indique si les tokens sont en cours de restauration

  // Méthodes Spotify
  loginSpotify: () => Promise<void>;
  logoutSpotify: () => Promise<void>;
  refreshSpotifyToken: () => Promise<void>;

  // Méthodes génériques
  logout: (service: MusicService) => Promise<void>;
  refreshToken: (service: MusicService) => Promise<void>;
  isAuthenticated: (service: MusicService) => boolean;
  getAccessToken: (service: MusicService) => Promise<string | null>;

  // Utilitaires
  clearAllTokens: () => Promise<void>;
}

/**
 * Erreur d'authentification personnalisée
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public service: MusicService,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Codes d'erreur d'authentification
 */
export enum AuthErrorCode {
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  AUTH_CANCELLED = 'AUTH_CANCELLED',
  TOKEN_EXCHANGE_FAILED = 'TOKEN_EXCHANGE_FAILED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Réponse du token endpoint (format Spotify)
 */
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

/**
 * Réponse du token endpoint (format SoundCloud)
 */
export interface SoundCloudTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/**
 * Paramètres PKCE
 */
export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256' | 'plain';
}

/**
 * Options de stockage des tokens
 */
export interface TokenStorageOptions {
  useSecureStore?: boolean; // Utiliser expo-secure-store (chiffrement hardware)
  keyPrefix?: string; // Préfixe pour les clés de stockage
}

/**
 * Métadonnées de token
 */
export interface TokenMetadata {
  createdAt: number;
  expiresAt: number;
  lastRefreshedAt?: number;
  refreshCount: number;
}

/**
 * Token avec métadonnées
 */
export interface StoredToken extends AuthToken {
  metadata: TokenMetadata;
}

/**
 * Résultat de validation de token
 */
export interface TokenValidationResult {
  isValid: boolean;
  needsRefresh: boolean;
  expiresIn?: number; // Millisecondes restantes
  error?: string;
}

/**
 * Callback pour le refresh automatique
 */
export type TokenRefreshCallback = (
  service: MusicService,
  newToken: AuthToken
) => void;

/**
 * Configuration du refresh automatique
 */
export interface AutoRefreshConfig {
  enabled: boolean;
  bufferTime: number; // Temps en millisecondes avant expiration pour refresh
  maxRetries: number;
  retryDelay: number; // Délai entre les tentatives en millisecondes
  onRefreshSuccess?: TokenRefreshCallback;
  onRefreshError?: (service: MusicService, error: Error) => void;
}
